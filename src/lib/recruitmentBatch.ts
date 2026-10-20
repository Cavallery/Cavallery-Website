// ============================================================
// CAVALLERY RECRUITMENT BATCH HELPER
// Mengelola data batch rekrutmen di MySQL
// ============================================================
import { query } from "@/lib/mysql";

let _tableEnsured = false;

/** Pastikan tabel recruitment_batches & kolom batch_id di tabel anggota ada */
export async function ensureBatchTables() {
  if (_tableEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS recruitment_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT DEFAULT NULL,
        year INT NOT NULL,
        start_date DATE DEFAULT NULL,
        end_date DATE DEFAULT NULL,
        status ENUM('open','closed') NOT NULL DEFAULT 'closed',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Tambahkan kolom batch_id ke anggota jika belum ada
    try {
      await query(`ALTER TABLE anggota ADD COLUMN batch_id INT DEFAULT NULL`);
    } catch {}

    // Cek apakah tabel recruitment_batches masih kosong, jika ya buatkan seed batch 1-8
    const countRows = await query<any[]>(`SELECT COUNT(*) as cnt FROM recruitment_batches`);
    if (countRows && countRows[0]?.cnt === 0) {
      await query(`
        INSERT INTO recruitment_batches (name, description, year, status) VALUES
        ('Batch 1', 'Rekrutmen awal Cavallery', 2024, 'closed'),
        ('Batch 2', 'Rekrutmen Batch 2', 2024, 'closed'),
        ('Batch 3', 'Rekrutmen Batch 3', 2024, 'closed'),
        ('Batch 4', 'Rekrutmen Batch 4', 2025, 'closed'),
        ('Batch 5', 'Rekrutmen Batch 5', 2025, 'closed'),
        ('Batch 6', 'Rekrutmen Batch 6', 2025, 'closed'),
        ('Batch 7', 'Rekrutmen Batch 7', 2026, 'closed'),
        ('Batch 8', 'Rekrutmen Batch 8', 2026, 'closed')
      `);
    }

    _tableEnsured = true;
  } catch (e: any) {
    console.error("[Recruitment Batch Ensure Error]:", e?.message);
    _tableEnsured = true;
  }
}

export interface RecruitmentBatch {
  id: number;
  name: string;
  description: string | null;
  year: number;
  start_date: string | null;
  end_date: string | null;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  total_members?: number;
  total_pending?: number;
}

/** Ambil semua daftar batch dengan statistik jumlah anggota */
export async function getAllBatches(): Promise<RecruitmentBatch[]> {
  await ensureBatchTables();
  const sql = `
    SELECT b.*,
      (SELECT COUNT(*) FROM anggota a WHERE a.batch_id = b.id AND a.status != 'pending') AS total_members,
      (SELECT COUNT(*) FROM anggota a WHERE a.batch_id = b.id AND a.status = 'pending') AS total_pending
    FROM recruitment_batches b
    ORDER BY b.id DESC
  `;
  const rows = await query<RecruitmentBatch[]>(sql);
  return rows || [];
}

/** Ambil batch yang saat ini aktif/open */
export async function getActiveOpenBatch(): Promise<RecruitmentBatch | null> {
  await ensureBatchTables();
  const rows = await query<RecruitmentBatch[]>(
    `SELECT * FROM recruitment_batches WHERE status = 'open' ORDER BY id DESC LIMIT 1`
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

/** Buat batch baru */
export async function createBatch(data: {
  name: string;
  description?: string;
  year: number;
  start_date?: string;
  end_date?: string;
  status?: "open" | "closed";
}): Promise<number> {
  await ensureBatchTables();
  // Jika batch baru diset 'open', tutup batch yang sedang open sebelumnya
  if (data.status === "open") {
    await query(`UPDATE recruitment_batches SET status = 'closed' WHERE status = 'open'`);
  }

  const res = await query<any>(
    `INSERT INTO recruitment_batches (name, description, year, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.name.trim(),
      data.description?.trim() || null,
      data.year || new Date().getFullYear(),
      data.start_date || null,
      data.end_date || null,
      data.status || "closed",
    ]
  );
  return res?.insertId || 0;
}

/** Update batch */
export async function updateBatch(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    year: number;
    start_date: string | null;
    end_date: string | null;
    status: "open" | "closed";
  }>
): Promise<boolean> {
  await ensureBatchTables();

  // Jika diubah jadi 'open', tutup batch lain terlebih dahulu
  if (data.status === "open") {
    await query(`UPDATE recruitment_batches SET status = 'closed' WHERE id != ?`, [id]);
  }

  const fields: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    params.push(data.name.trim());
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    params.push(data.description ? data.description.trim() : null);
  }
  if (data.year !== undefined) {
    fields.push("year = ?");
    params.push(data.year);
  }
  if (data.start_date !== undefined) {
    fields.push("start_date = ?");
    params.push(data.start_date || null);
  }
  if (data.end_date !== undefined) {
    fields.push("end_date = ?");
    params.push(data.end_date || null);
  }
  if (data.status !== undefined) {
    fields.push("status = ?");
    params.push(data.status);
  }

  if (fields.length === 0) return true;

  params.push(id);
  const res = await query(`UPDATE recruitment_batches SET ${fields.join(", ")} WHERE id = ?`, params);
  return Boolean(res);
}

/** Hapus batch */
export async function deleteBatch(id: number): Promise<boolean> {
  await ensureBatchTables();
  // Set batch_id di anggota menjadi NULL agar data anggota tidak ikut terhapus
  await query(`UPDATE anggota SET batch_id = NULL WHERE batch_id = ?`, [id]);
  const res = await query(`DELETE FROM recruitment_batches WHERE id = ?`, [id]);
  return Boolean(res);
}
