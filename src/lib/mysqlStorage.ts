import fs from "fs";
import path from "path";
import { query } from "@/lib/mysql";

let isTableReady = false;
let isSyncing = false;

/**
 * Memastikan tabel penyimpanan file di MySQL sudah tersedia
 */
export async function ensureStorageTable(): Promise<boolean> {
  if (isTableReady) return true;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_key VARCHAR(255) NOT NULL UNIQUE,
        filename VARCHAR(255) NOT NULL,
        folder VARCHAR(100) NOT NULL DEFAULT 'bukti',
        mime_type VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
        file_size INT NOT NULL DEFAULT 0,
        data_base64 LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_file_key (file_key),
        INDEX idx_filename (filename),
        INDEX idx_folder (folder)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    isTableReady = true;
    return true;
  } catch (err: any) {
    console.error("[MySQL Storage] Error ensuring table:", err?.message);
    return false;
  }
}

/**
 * Menyimpan file gambar ke MySQL secara permanen
 */
export async function saveFileToDb(options: {
  buffer: Buffer;
  filename: string;
  folder?: string;
  mimeType?: string;
}): Promise<boolean> {
  try {
    await ensureStorageTable();
    const folder = options.folder || "bukti";
    const filename = options.filename;
    const fileKey = `${folder}/${filename}`;
    const mimeType = options.mimeType || "image/jpeg";
    const fileSize = options.buffer.length;
    const base64Data = options.buffer.toString("base64");

    await query(
      `INSERT INTO uploaded_files (file_key, filename, folder, mime_type, file_size, data_base64)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         data_base64 = VALUES(data_base64),
         file_size = VALUES(file_size),
         mime_type = VALUES(mime_type)`,
      [fileKey, filename, folder, mimeType, fileSize, base64Data]
    );

    return true;
  } catch (err: any) {
    console.error("[MySQL Storage] Error saving file to DB:", err?.message);
    return false;
  }
}

/**
 * Mengambil file gambar dari MySQL berdasarkan nama file atau path key
 */
export async function getFileFromDb(lookupPath: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  filename: string;
} | null> {
  try {
    await ensureStorageTable();

    // Normalisasi lookupPath
    let clean = lookupPath.replace(/\\/g, "/").trim();
    if (clean.startsWith("/")) clean = clean.substring(1);
    if (clean.startsWith("uploads/")) clean = clean.substring("uploads/".length);
    if (clean.startsWith("api/uploads/")) clean = clean.substring("api/uploads/".length);

    const parts = clean.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    const filename = parts[parts.length - 1];
    const fileKey = clean;

    // 1. Prioritaskan kecocokan tepat pada file_key (misal: cavallery/images/2026/09/foto.jpg)
    let rows = await query<any[]>(
      `SELECT filename, mime_type, data_base64 
       FROM uploaded_files 
       WHERE file_key = ? 
       LIMIT 1`,
      [fileKey]
    );

    // 2. Jika tidak ditemukan, cari berdasarkan suffix file_key
    if (!rows || rows.length === 0) {
      rows = await query<any[]>(
        `SELECT filename, mime_type, data_base64 
         FROM uploaded_files 
         WHERE file_key LIKE ? 
         ORDER BY id DESC LIMIT 1`,
        [`%/${filename}`]
      );
    }

    // 3. Terakhir coba exact filename
    if (!rows || rows.length === 0) {
      rows = await query<any[]>(
        `SELECT filename, mime_type, data_base64 
         FROM uploaded_files 
         WHERE filename = ? 
         ORDER BY id DESC LIMIT 1`,
        [filename]
      );
    }

    if (!rows || rows.length === 0 || !rows[0].data_base64) {
      return null;
    }

    const row = rows[0];
    const buffer = Buffer.from(row.data_base64, "base64");
    return {
      buffer,
      mimeType: row.mime_type || "image/jpeg",
      filename: row.filename || filename,
    };
  } catch (err: any) {
    console.error("[MySQL Storage] Error getting file from DB:", err?.message);
    return null;
  }
}

/**
 * Helper rekursif untuk membaca seluruh file dalam subdirektori
 */
function getFilesRecursive(dir: string, baseDir: string): { filePath: string; relKey: string; folder: string; filename: string }[] {
  let list: { filePath: string; relKey: string; folder: string; filename: string }[] = [];
  if (!fs.existsSync(dir)) return list;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        list = list.concat(getFilesRecursive(fullPath, baseDir));
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".svg"].includes(ext)) {
          const relKey = path.relative(baseDir, fullPath).replace(/\\/g, "/");
          const folder = path.dirname(relKey).replace(/\\/g, "/");
          list.push({ filePath: fullPath, relKey, folder, filename: ent.name });
        }
      }
    }
  } catch {}
  return list;
}

/**
 * Sinkronisasi otomatis file yang saat ini sudah ada di disk ke MySQL
 * agar semua gambar nota & media tidak hilang saat ganti kode/push GitHub
 */
export async function syncLocalUploadsToDb(): Promise<number> {
  if (isSyncing) return 0;
  isSyncing = true;

  let syncedCount = 0;
  try {
    await ensureStorageTable();
    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsRoot)) {
      isSyncing = false;
      return 0;
    }

    const allFiles = getFilesRecursive(uploadsRoot, uploadsRoot);

    for (const item of allFiles) {
      const { filePath, relKey, folder, filename } = item;
      const stat = fs.statSync(filePath);
      // Batasi ukuran per file maksimal 15MB agar tidak membebani query
      if (stat.size > 15 * 1024 * 1024) continue;

      // Cek apakah sudah tersimpan di MySQL
      const existing = await query<any[]>(
        "SELECT id FROM uploaded_files WHERE file_key = ? LIMIT 1",
        [relKey]
      );

      if (!existing || existing.length === 0) {
        const ext = path.extname(filename).toLowerCase();
        let mime = "image/jpeg";
        if (ext === ".png") mime = "image/png";
        else if (ext === ".webp") mime = "image/webp";
        else if (ext === ".gif") mime = "image/gif";
        else if (ext === ".svg") mime = "image/svg+xml";
        else if (ext === ".mp4") mime = "video/mp4";

        const buffer = fs.readFileSync(filePath);
        await saveFileToDb({
          buffer,
          filename,
          folder,
          mimeType: mime,
        });
        syncedCount++;
      }
    }
  } catch (err: any) {
    console.error("[MySQL Storage] Sync local uploads error:", err?.message);
  } finally {
    isSyncing = false;
  }

  return syncedCount;
}
