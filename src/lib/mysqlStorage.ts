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

    const parts = clean.split("/");
    const filename = parts[parts.length - 1];
    const fileKey = clean;

    const rows = await query<any[]>(
      `SELECT filename, mime_type, data_base64 
       FROM uploaded_files 
       WHERE file_key = ? OR filename = ? OR file_key LIKE ? 
       ORDER BY id DESC LIMIT 1`,
      [fileKey, filename, `%${filename}`]
    );

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
 * Sinkronisasi otomatis file yang saat ini sudah ada di disk ke MySQL
 * agar semua gambar nota lama tidak hilang saat ganti kode/push GitHub
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

    const folders = ["bukti", "cavallery", "fanart", "twoshot"];

    for (const folder of folders) {
      const folderPath = path.join(uploadsRoot, folder);
      if (!fs.existsSync(folderPath)) continue;

      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        // Abaikan file non-gambar atau direktori
        const ext = path.extname(file).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) continue;

        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        // Cek apakah sudah tersimpan di MySQL
        const fileKey = `${folder}/${file}`;
        const existing = await query<any[]>(
          "SELECT id FROM uploaded_files WHERE file_key = ? OR filename = ? LIMIT 1",
          [fileKey, file]
        );

        if (!existing || existing.length === 0) {
          const buffer = fs.readFileSync(filePath);
          let mime = "image/jpeg";
          if (ext === ".png") mime = "image/png";
          else if (ext === ".webp") mime = "image/webp";
          else if (ext === ".gif") mime = "image/gif";

          await saveFileToDb({
            buffer,
            filename: file,
            folder,
            mimeType: mime,
          });
          syncedCount++;
        }
      }
    }
  } catch (err: any) {
    console.error("[MySQL Storage] Sync local uploads error:", err?.message);
  } finally {
    isSyncing = false;
  }

  return syncedCount;
}
