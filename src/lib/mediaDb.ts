import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";
import { invalidateApiCache } from "@/lib/apiCache";
import { syncLocalUploadsToDb } from "@/lib/mysqlStorage";

const LOCAL_JSON_PATH = path.join(process.cwd(), "src", "data", "media.json");
const PUB_FILE_PATH = path.join(process.cwd(), "src", "data", "published-media.json");
const ORDER_FILE_PATH = path.join(process.cwd(), "src", "data", "media-order.json");

let isTableInitialized = false;

/**
 * Normalisasi URL media: jika masih menggunakan domain jkt48connect,
 * alihkan ke database / path lokal /uploads/...
 */
export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const clean = String(url).trim();
  if (clean.includes("jkt48connect.com")) {
    try {
      const u = new URL(clean);
      return `/uploads${u.pathname.startsWith("/") ? u.pathname : `/${u.pathname}`}`;
    } catch {
      return clean.replace(/^https?:\/\/[^/]+\//, "/uploads/");
    }
  }
  return clean;
}

/**
 * Pastikan tabel `media` ada di database MySQL dan terisi data awal
 */
export async function ensureMediaTable(): Promise<boolean> {
  if (!isMySqlConfigured()) return false;
  if (isTableInitialized) return true;

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`media\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`original_name\` VARCHAR(255) NOT NULL,
        \`file_name\` VARCHAR(255) NOT NULL,
        \`folder\` VARCHAR(100) DEFAULT 'cavallery/images',
        \`type\` ENUM('image', 'video') DEFAULT 'image',
        \`mime_type\` VARCHAR(100) DEFAULT 'image/jpeg',
        \`file_size\` BIGINT DEFAULT 0,
        \`public_url\` TEXT NOT NULL,
        \`thumbnail_url\` TEXT DEFAULT NULL,
        \`alt_text\` VARCHAR(255) DEFAULT '',
        \`is_published\` TINYINT(1) DEFAULT 1,
        \`sort_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_folder\` (\`folder\`),
        INDEX \`idx_type\` (\`type\`),
        INDEX \`idx_is_published\` (\`is_published\`),
        INDEX \`idx_sort_order\` (\`sort_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Pastikan tipe id adalah BIGINT untuk menghindari overflow 32-bit INT
    try {
      await query("ALTER TABLE `media` MODIFY `id` BIGINT AUTO_INCREMENT");
    } catch {}

    // Migrasikan ID berbahaya yang bernilai 2147483647 jika ada
    try {
      await query("UPDATE `media` SET `id` = 93231 WHERE `id` = 2147483647");
    } catch {}

    // Pastikan kolom-kolom pendukung tersedia jika tabel sudah ada sebelumnya
    try { await query("ALTER TABLE `media` ADD COLUMN `sort_order` INT DEFAULT 0"); } catch {}
    try { await query("ALTER TABLE `media` ADD COLUMN `is_published` TINYINT(1) DEFAULT 1"); } catch {}
    try { await query("ALTER TABLE `media` ADD COLUMN `thumbnail_url` TEXT DEFAULT NULL"); } catch {}
    try { await query("ALTER TABLE `media` ADD COLUMN `alt_text` VARCHAR(255) DEFAULT ''"); } catch {}
    try { await query("ALTER TABLE `media` ADD COLUMN `mime_type` VARCHAR(100) DEFAULT 'image/jpeg'"); } catch {}
    try { await query("ALTER TABLE `media` ADD COLUMN `file_size` BIGINT DEFAULT 0"); } catch {}

    // Migrasi URL CDN jkt48connect ke database sendiri (/uploads/...)
    try {
      await query(`
        UPDATE \`media\` 
        SET public_url = CONCAT('/uploads/', SUBSTRING_INDEX(public_url, 'jkt48connect.com/', -1))
        WHERE public_url LIKE '%jkt48connect.com/%'
      `);
      await query(`
        UPDATE \`media\` 
        SET thumbnail_url = CONCAT('/uploads/', SUBSTRING_INDEX(thumbnail_url, 'jkt48connect.com/', -1))
        WHERE thumbnail_url LIKE '%jkt48connect.com/%'
      `);
    } catch {}

    // Cek apakah tabel kosong. Jika kosong, lakukan seed dari media.json
    const countRows = await query<any[]>("SELECT COUNT(*) as cnt FROM `media`");
    const count = countRows && countRows[0] ? Number(countRows[0].cnt) : 0;

    if (count === 0 && fs.existsSync(LOCAL_JSON_PATH)) {
      try {
        const raw = fs.readFileSync(LOCAL_JSON_PATH, "utf-8");
        const items = JSON.parse(raw);
        if (Array.isArray(items) && items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            const m = items[i];
            await query(
              `INSERT INTO \`media\` 
              (original_name, file_name, folder, type, mime_type, file_size, public_url, thumbnail_url, alt_text, is_published, sort_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                m.original_name || m.file_name || "media",
                m.file_name || path.basename(m.public_url || ""),
                m.folder || "cavallery/images",
                m.type || "image",
                m.mime_type || (m.type === "video" ? "video/mp4" : "image/jpeg"),
                m.file_size || 0,
                m.public_url,
                m.thumbnail_url || null,
                m.alt_text || m.original_name || "",
                m.is_published !== undefined ? (m.is_published ? 1 : 0) : 1,
                m.sort_order !== undefined ? m.sort_order : i + 1,
              ]
            );
          }
        }
      } catch (seedErr) {
        console.warn("[MediaDB] Seeding error:", seedErr);
      }
    }

    isTableInitialized = true;
    return true;
  } catch (err: any) {
    console.warn("[MediaDB] Table init warn:", err.message);
    return false;
  }
}

/**
 * Ambil daftar media (dari MySQL jika tersedia, atau fallback JSON)
 */
export async function getMediaList(options: {
  search?: string;
  folder?: string;
  type?: string;
  publishedOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ items: any[]; total: number }> {
  const hasDb = await ensureMediaTable();

  if (hasDb) {
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (options.search) {
        conditions.push("(original_name LIKE ? OR alt_text LIKE ? OR file_name LIKE ?)");
        const q = `%${options.search}%`;
        params.push(q, q, q);
      }

      if (options.folder) {
        conditions.push("folder = ?");
        params.push(options.folder);
      }

      if (options.type) {
        conditions.push("type = ?");
        params.push(options.type);
      }

      if (options.publishedOnly) {
        conditions.push("is_published = 1");
      }

      const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

      const totalRows = await query<any[]>(
        `SELECT COUNT(*) as cnt FROM \`media\` ${whereClause}`,
        params
      );
      const total = totalRows && totalRows[0] ? Number(totalRows[0].cnt) : 0;

      const limit = options.limit || 500;
      const offset = options.offset || 0;

      // Note: LIMIT dan OFFSET di mysql2 prepare statement harus integer
      const items = await query<any[]>(
        `SELECT id, original_name, file_name, folder, type, mime_type, file_size, public_url, thumbnail_url, alt_text, is_published, sort_order, created_at, updated_at 
         FROM \`media\` 
         ${whereClause} 
         ORDER BY sort_order ASC, id DESC 
         LIMIT ${Math.max(1, Number(limit))} OFFSET ${Math.max(0, Number(offset))}`,
        params
      );

      // Sinkronisasi file disk ke DB di latar belakang jika ada yang belum tercatat
      syncLocalUploadsToDb().catch(() => {});

      const normalized = (items || []).map((it) => ({
        ...it,
        public_url: normalizeMediaUrl(it.public_url),
        thumbnail_url: it.thumbnail_url ? normalizeMediaUrl(it.thumbnail_url) : null,
      }));

      return { items: normalized, total };
    } catch (err: any) {
      console.warn("[MediaDB] Query failed, falling back to JSON:", err.message);
    }
  }

  // Fallback: baca dari media.json jika MySQL tidak aktif
  let items: any[] = [];
  if (fs.existsSync(LOCAL_JSON_PATH)) {
    try {
      items = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
    } catch {}
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.original_name?.toLowerCase().includes(q) ||
        i.alt_text?.toLowerCase().includes(q) ||
        i.file_name?.toLowerCase().includes(q)
    );
  }
  if (options.folder) {
    items = items.filter((i) => i.folder === options.folder);
  }
  if (options.type) {
    items = items.filter((i) => i.type === options.type);
  }
  if (options.publishedOnly) {
    items = items.filter((i) => Number(i.is_published) === 1);
  }

  items.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  const total = items.length;
  const paginated = items.slice(options.offset || 0, (options.offset || 0) + (options.limit || 500)).map((it) => ({
    ...it,
    public_url: normalizeMediaUrl(it.public_url),
    thumbnail_url: it.thumbnail_url ? normalizeMediaUrl(it.thumbnail_url) : null,
  }));

  return { items: paginated, total };
}

/**
 * Hapus media (Single atau Bulk) dari MySQL, file lokal, dan JSON
 */
export async function deleteMediaItems(ids: (string | number)[]): Promise<{ count: number }> {
  if (!Array.isArray(ids) || ids.length === 0) return { count: 0 };

  const hasDb = await ensureMediaTable();
  const idStrings = ids.map(String);

  // 1. Ambil data media untuk hapus file fisik di public/uploads jika lokal
  let fileUrls: string[] = [];
  if (hasDb) {
    try {
      const placeholders = idStrings.map(() => "?").join(",");
      const rows = await query<any[]>(
        `SELECT public_url FROM \`media\` WHERE id IN (${placeholders})`,
        idStrings
      );
      if (rows && Array.isArray(rows)) {
        fileUrls = rows.map((r) => r.public_url).filter(Boolean);
      }

      // Hapus dari MySQL
      await query(`DELETE FROM \`media\` WHERE id IN (${placeholders})`, idStrings);
    } catch (err: any) {
      console.warn("[MediaDB] Delete MySQL warn:", err.message);
    }
  }

  // 2. Hapus dari media.json
  if (fs.existsSync(LOCAL_JSON_PATH)) {
    try {
      let items: any[] = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
      fileUrls.push(
        ...items
          .filter((i) => idStrings.includes(String(i.id)) || idStrings.includes(String(i.public_url)))
          .map((i) => i.public_url)
      );

      items = items.filter(
        (i) => !idStrings.includes(String(i.id)) && !idStrings.includes(String(i.public_url))
      );
      fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(items, null, 2), "utf-8");
    } catch {}
  }

  // 3. Hapus dari published-media.json
  if (fs.existsSync(PUB_FILE_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(PUB_FILE_PATH, "utf-8"));
      if (Array.isArray(raw?.publishedIds)) {
        raw.publishedIds = raw.publishedIds.filter((pId: string) => !idStrings.includes(String(pId)));
        fs.writeFileSync(PUB_FILE_PATH, JSON.stringify(raw, null, 2), "utf-8");
      }
    } catch {}
  }

  // 4. Hapus file fisik jika berupa file lokal di /uploads
  fileUrls.forEach((url) => {
    if (url && url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    }
  });

  // 5. Invalidate cache in-memory segera
  invalidateApiCache("vallzy_media_items");

  return { count: idStrings.length };
}

/**
 * Toggle atau set status publikasi media (is_published 1/0)
 */
export async function togglePublishMedia(
  id: string | number,
  targetStatus?: boolean
): Promise<{ success: boolean; newStatus: boolean }> {
  const hasDb = await ensureMediaTable();
  const idStr = String(id).trim();

  let finalStatus = true;

  if (hasDb) {
    try {
      const rows = await query<any[]>("SELECT is_published FROM `media` WHERE id = ?", [idStr]);
      if (rows && rows.length > 0) {
        const current = Number(rows[0].is_published) === 1;
        finalStatus = targetStatus !== undefined ? targetStatus : !current;
        await query("UPDATE `media` SET is_published = ? WHERE id = ?", [finalStatus ? 1 : 0, idStr]);
      }
    } catch (err: any) {
      console.warn("[MediaDB] Toggle publish MySQL warn:", err.message);
    }
  }

  // Sync ke media.json
  if (fs.existsSync(LOCAL_JSON_PATH)) {
    try {
      const items: any[] = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
      const found = items.find((i) => String(i.id) === idStr || String(i.public_url) === idStr);
      if (found) {
        if (targetStatus === undefined) {
          finalStatus = !found.is_published;
        } else {
          finalStatus = targetStatus;
        }
        found.is_published = finalStatus ? 1 : 0;
        fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(items, null, 2), "utf-8");
      }
    } catch {}
  }

  // Sync ke published-media.json
  try {
    let pubIds: string[] = [];
    if (fs.existsSync(PUB_FILE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(PUB_FILE_PATH, "utf-8"));
      if (Array.isArray(raw?.publishedIds)) pubIds = raw.publishedIds.map(String);
    }
    if (finalStatus) {
      if (!pubIds.includes(idStr)) pubIds.push(idStr);
    } else {
      pubIds = pubIds.filter((x) => x !== idStr);
    }
    fs.writeFileSync(PUB_FILE_PATH, JSON.stringify({ publishedIds: pubIds }, null, 2), "utf-8");
  } catch {}

  invalidateApiCache("vallzy_media_items");
  return { success: true, newStatus: finalStatus };
}

/**
 * Simpan urutan media (sort_order)
 */
export async function updateMediaOrder(orderedIds: (string | number)[]): Promise<boolean> {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return false;

  const hasDb = await ensureMediaTable();

  if (hasDb) {
    try {
      for (let idx = 0; idx < orderedIds.length; idx++) {
        await query("UPDATE `media` SET sort_order = ? WHERE id = ?", [idx + 1, String(orderedIds[idx])]);
      }
    } catch (err: any) {
      console.warn("[MediaDB] Reorder MySQL warn:", err.message);
    }
  }

  // Sync ke media-order.json
  try {
    fs.writeFileSync(ORDER_FILE_PATH, JSON.stringify({ orderedIds: orderedIds.map(String) }, null, 2), "utf-8");
  } catch {}

  // Sync ke media.json
  if (fs.existsSync(LOCAL_JSON_PATH)) {
    try {
      const items: any[] = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
      const orderMap = new Map<string, number>();
      orderedIds.forEach((id, idx) => orderMap.set(String(id), idx + 1));
      items.forEach((it) => {
        if (orderMap.has(String(it.id))) it.sort_order = orderMap.get(String(it.id));
      });
      items.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
      fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(items, null, 2), "utf-8");
    } catch {}
  }

  invalidateApiCache("vallzy_media_items");
  return true;
}

/**
 * Tambah media baru ke MySQL dan media.json
 */
export async function insertMedia(item: {
  original_name: string;
  file_name: string;
  folder?: string;
  type?: "image" | "video";
  mime_type?: string;
  file_size?: number;
  public_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  is_published?: number | boolean;
  sort_order?: number;
}): Promise<any> {
  const hasDb = await ensureMediaTable();

  let insertedId = String(Date.now());

  const isPub = item.is_published !== undefined ? (item.is_published ? 1 : 0) : 1;
  const sort = item.sort_order || 0;

  if (hasDb) {
    try {
      const res = await query<any>(
        `INSERT INTO \`media\` 
        (original_name, file_name, folder, type, mime_type, file_size, public_url, thumbnail_url, alt_text, is_published, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.original_name,
          item.file_name,
          item.folder || "cavallery/images",
          item.type || "image",
          item.mime_type || "image/jpeg",
          item.file_size || 0,
          item.public_url,
          item.thumbnail_url || null,
          item.alt_text || item.original_name,
          isPub,
          sort,
        ]
      );
      if (res && res.insertId) {
        insertedId = String(res.insertId);
      }
    } catch (err: any) {
      console.warn("[MediaDB] Standard insert failed, attempting auto-fix:", err.message);
      try {
        // Coba perbaiki id auto-increment jika terjadi overflow
        await query("ALTER TABLE `media` MODIFY `id` BIGINT AUTO_INCREMENT");
        const maxRows = await query<any[]>("SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM `media`");
        const nextId = maxRows && maxRows[0] ? Number(maxRows[0].next_id) : Date.now();
        await query(
          `INSERT INTO \`media\` 
          (id, original_name, file_name, folder, type, mime_type, file_size, public_url, thumbnail_url, alt_text, is_published, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nextId,
            item.original_name,
            item.file_name,
            item.folder || "cavallery/images",
            item.type || "image",
            item.mime_type || "image/jpeg",
            item.file_size || 0,
            item.public_url,
            item.thumbnail_url || null,
            item.alt_text || item.original_name,
            isPub,
            sort,
          ]
        );
        insertedId = String(nextId);
      } catch (retryErr: any) {
        console.error("[MediaDB] Retry insert with explicit id failed:", retryErr.message);
      }
    }
  }

  const completeItem = {
    id: insertedId,
    original_name: item.original_name,
    file_name: item.file_name,
    folder: item.folder || "cavallery/images",
    type: item.type || "image",
    mime_type: item.mime_type || "image/jpeg",
    file_size: item.file_size || 0,
    public_url: item.public_url,
    thumbnail_url: item.thumbnail_url || null,
    alt_text: item.alt_text || item.original_name,
    is_published: isPub,
    sort_order: sort,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Sync ke media.json
  try {
    let items: any[] = [];
    if (fs.existsSync(LOCAL_JSON_PATH)) {
      items = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
    }
    items.unshift(completeItem);
    fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch {}

  invalidateApiCache("vallzy_media_items");
  return completeItem;
}
