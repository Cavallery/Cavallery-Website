import { query, isMySqlConfigured } from "./mysql";
import {
  getAllMembers,
  saveAllMembers,
  formatNoAnggota4Digit,
  AnggotaRecord,
} from "./anggotaParser";

export interface AnggotaFilterOptions {
  search?: string;
  batch?: string | number;
  status?: "Aktif" | "Keluar" | "all";
  role?: string;
  limit?: number;
  offset?: number;
}

export interface PublicMemberItem {
  id: number;
  batch: string;
  batchNumber: number;
  noAnggota: string; // Format: CAVA-0001 (4 digit)
  nama: string;
  status: "Aktif" | "Keluar";
}

// Convert MySQL row (snake_case) to AnggotaRecord (camelCase)
function mapDbRowToRecord(row: any): AnggotaRecord {
  return {
    id: Number(row.id),
    batch: String(row.batch || `Batch ${row.batch_number || 1}`),
    batchNumber: Number(row.batch_number || 1),
    noAnggota: formatNoAnggota4Digit(row.no_anggota || ""),
    legacyNoAnggota: String(row.no_anggota || ""),
    nama: String(row.nama || ""),
    idLine: String(row.id_line || "-"),
    domisili: String(row.domisili || "-"),
    displayName: String(row.display_name || "-"),
    tunggakanKas: String(row.tunggakan_kas || "-"),
    nominalKas: String(row.nominal_kas || "-"),
    nominalKasNumber: Number(
      String(row.nominal_kas || "").replace(/[^\d]/g, "") || 0
    ),
    terakhirBayar: String(row.terakhir_bayar || "-"),
    status: row.status === "Keluar" ? "Keluar" : "Aktif",
    role: row.role === "Admin" ? "Admin" : row.role === "Keluar" ? "Keluar" : "Anggota",
  };
}

let tableEnsured = false;
async function ensureAnggotaTableExists(): Promise<void> {
  if (tableEnsured || !isMySqlConfigured()) return;
  try {
    await query(`CREATE TABLE IF NOT EXISTS \`anggota_cava\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`batch\` VARCHAR(50) NOT NULL,
      \`batch_number\` INT NOT NULL DEFAULT 1,
      \`no_anggota\` VARCHAR(50) NOT NULL UNIQUE,
      \`nama\` VARCHAR(191) NOT NULL,
      \`id_line\` VARCHAR(191) DEFAULT '-',
      \`domisili\` VARCHAR(191) DEFAULT '-',
      \`display_name\` VARCHAR(191) DEFAULT '-',
      \`status\` ENUM('Aktif', 'Keluar') NOT NULL DEFAULT 'Aktif',
      \`role\` VARCHAR(50) NOT NULL DEFAULT 'Anggota',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_batch\` (\`batch_number\`),
      INDEX \`idx_no_anggota\` (\`no_anggota\`),
      INDEX \`idx_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    tableEnsured = true;
  } catch (e: any) {
    console.warn("[AnggotaService] Error ensuring anggota_cava table:", e?.message);
  }
}

export async function fetchAllAnggota(): Promise<AnggotaRecord[]> {
  if (isMySqlConfigured()) {
    try {
      await ensureAnggotaTableExists();
      const rows = await query<any[]>(
        "SELECT * FROM anggota_cava ORDER BY batch_number ASC, id ASC"
      );
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows.map(mapDbRowToRecord);
      }
    } catch (e: any) {
      console.warn("[AnggotaService] MySQL fetch failed, falling back to local:", e?.message);
    }
  }

  // Fallback to local JSON / parsed file
  return getAllMembers();
}

function matchesSearchQuery(m: AnggotaRecord, queryStr: string): boolean {
  const q = queryStr.trim().toLowerCase();
  if (!q) return true;

  const noAnggotaNorm = m.noAnggota.toLowerCase();
  const legacyNorm = (m.legacyNoAnggota || "").toLowerCase();
  const digitsOnly = noAnggotaNorm.replace(/[^\d]/g, "");

  if (noAnggotaNorm.includes(q)) return true;
  if (legacyNorm.includes(q)) return true;

  const qDigits = q.replace(/[^\d]/g, "");
  if (qDigits.length > 0) {
    if (digitsOnly.endsWith(qDigits) || parseInt(digitsOnly, 10) === parseInt(qDigits, 10)) {
      return true;
    }
  }

  if (m.nama.toLowerCase().includes(q)) return true;
  if (m.idLine.toLowerCase().includes(q)) return true;
  if (m.domisili.toLowerCase().includes(q)) return true;
  if (m.displayName.toLowerCase().includes(q)) return true;
  if (m.batch.toLowerCase().includes(q)) return true;

  return false;
}

export async function getFilteredAnggota(options: AnggotaFilterOptions = {}): Promise<{
  data: AnggotaRecord[];
  total: number;
  stats: {
    total: number;
    aktif: number;
    keluar: number;
    admin: number;
  };
}> {
  const all = await fetchAllAnggota();

  const stats = {
    total: all.length,
    aktif: all.filter((a) => a.status === "Aktif").length,
    keluar: all.filter((a) => a.status === "Keluar").length,
    admin: all.filter((a) => a.role === "Admin").length,
  };

  let filtered = all;

  if (options.status && options.status !== "all") {
    filtered = filtered.filter((a) => a.status === options.status);
  }

  if (options.batch !== undefined && options.batch !== "all" && options.batch !== "") {
    const bNum = typeof options.batch === "number" ? options.batch : parseInt(String(options.batch).replace(/[^\d]/g, ""), 10);
    if (!isNaN(bNum)) {
      filtered = filtered.filter((a) => a.batchNumber === bNum);
    }
  }

  if (options.role && options.role !== "all") {
    filtered = filtered.filter((a) => a.role.toLowerCase() === options.role!.toLowerCase());
  }

  if (options.search && options.search.trim().length > 0) {
    filtered = filtered.filter((a) => matchesSearchQuery(a, options.search!));
  }

  return {
    data: filtered,
    total: filtered.length,
    stats,
  };
}

export async function getPublicMemberList(options: {
  search?: string;
  batch?: string | number;
  status?: string;
} = {}): Promise<PublicMemberItem[]> {
  const all = await fetchAllAnggota();
  let filtered = all;

  if (options.status && options.status !== "all") {
    filtered = filtered.filter((a) => a.status === options.status);
  }

  if (options.batch !== undefined && options.batch !== "all" && options.batch !== "") {
    const bNum = typeof options.batch === "number" ? options.batch : parseInt(String(options.batch).replace(/[^\d]/g, ""), 10);
    if (!isNaN(bNum)) {
      filtered = filtered.filter((a) => a.batchNumber === bNum);
    }
  }

  if (options.search && options.search.trim().length > 0) {
    filtered = filtered.filter((a) => matchesSearchQuery(a, options.search!));
  }

  // Strictly 3 main columns: batch, noAnggota, nama (plus status)
  return filtered.map((a) => ({
    id: a.id,
    batch: a.batch,
    batchNumber: a.batchNumber,
    noAnggota: a.noAnggota, // Format 4 digit: CAVA-0001
    nama: a.nama,
    status: a.status,
  }));
}

export async function addAnggota(data: Omit<AnggotaRecord, "id">): Promise<AnggotaRecord> {
  const all = await fetchAllAnggota();
  const nextId = all.length > 0 ? Math.max(...all.map((a) => a.id)) + 1 : 1;

  const formattedNo = formatNoAnggota4Digit(data.noAnggota);

  const newRecord: AnggotaRecord = {
    ...data,
    id: nextId,
    noAnggota: formattedNo,
    batchNumber: data.batchNumber || parseInt(String(data.batch).replace(/[^\d]/g, ""), 10) || 1,
    idLine: data.idLine || "-",
    domisili: data.domisili || "-",
    displayName: data.displayName || formattedNo,
    tunggakanKas: data.tunggakanKas || "-",
    nominalKas: data.nominalKas || "-",
    nominalKasNumber: data.nominalKasNumber || 0,
    terakhirBayar: data.terakhirBayar || "-",
    status: data.status === "Keluar" ? "Keluar" : "Aktif",
    role: data.role === "Admin" ? "Admin" : data.role === "Keluar" ? "Keluar" : "Anggota",
  };

  // 1. Simpan ke local cache & JSON
  const updatedList = [...all.filter((a) => a.noAnggota !== formattedNo), newRecord];
  saveAllMembers(updatedList);

  // 2. Sync ke MySQL jika tersedia
  if (isMySqlConfigured()) {
    try {
      await ensureAnggotaTableExists();
      await query(
        `INSERT INTO anggota_cava 
        (batch, batch_number, no_anggota, nama, id_line, domisili, display_name, status, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        batch = VALUES(batch),
        batch_number = VALUES(batch_number),
        nama = VALUES(nama),
        id_line = VALUES(id_line),
        domisili = VALUES(domisili),
        display_name = VALUES(display_name),
        status = VALUES(status),
        role = VALUES(role)`,
        [
          newRecord.batch,
          newRecord.batchNumber,
          newRecord.noAnggota,
          newRecord.nama,
          newRecord.idLine,
          newRecord.domisili,
          newRecord.displayName,
          newRecord.status,
          newRecord.role,
        ]
      );
    } catch (e: any) {
      console.error("[AnggotaService] MySQL insert error:", e?.message);
    }
  }

  return newRecord;
}

export async function updateAnggota(idOrNo: number | string, patch: Partial<AnggotaRecord>): Promise<AnggotaRecord | null> {
  const all = await fetchAllAnggota();
  const numId = Number(idOrNo);
  const index = all.findIndex(
    (a) => (!isNaN(numId) && a.id === numId) || a.noAnggota === idOrNo || a.legacyNoAnggota === idOrNo
  );
  if (index === -1) return null;

  const current = all[index];
  const formattedNo = patch.noAnggota ? formatNoAnggota4Digit(patch.noAnggota) : current.noAnggota;

  const updated: AnggotaRecord = {
    ...current,
    ...patch,
    noAnggota: formattedNo,
  };
  if (patch.batch && !patch.batchNumber) {
    updated.batchNumber = parseInt(String(patch.batch).replace(/[^\d]/g, ""), 10) || current.batchNumber;
  }

  all[index] = updated;
  saveAllMembers(all);

  // MySQL Sync
  if (isMySqlConfigured()) {
    try {
      await ensureAnggotaTableExists();
      await query(
        `UPDATE anggota_cava SET
          batch = ?,
          batch_number = ?,
          no_anggota = ?,
          nama = ?,
          id_line = ?,
          domisili = ?,
          display_name = ?,
          status = ?,
          role = ?
        WHERE id = ? OR no_anggota = ?`,
        [
          updated.batch,
          updated.batchNumber,
          updated.noAnggota,
          updated.nama,
          updated.idLine,
          updated.domisili,
          updated.displayName,
          updated.status,
          updated.role,
          updated.id,
          current.noAnggota,
        ]
      );
    } catch (e: any) {
      console.error("[AnggotaService] MySQL update error:", e?.message);
    }
  }

  return updated;
}

export async function deleteAnggota(idOrNo: number | string): Promise<boolean> {
  const all = await fetchAllAnggota();
  const numId = Number(idOrNo);
  const target = all.find(
    (a) => (!isNaN(numId) && a.id === numId) || a.noAnggota === idOrNo || a.legacyNoAnggota === idOrNo
  );
  if (!target) return false;

  const updated = all.filter((a) => a.id !== target.id && a.noAnggota !== target.noAnggota);
  saveAllMembers(updated);

  if (isMySqlConfigured()) {
    try {
      await ensureAnggotaTableExists();
      await query("DELETE FROM anggota_cava WHERE id = ? OR no_anggota = ?", [target.id, target.noAnggota]);
    } catch (e: any) {
      console.error("[AnggotaService] MySQL delete error:", e?.message);
    }
  }

  return true;
}

export function generateCsvData(members: AnggotaRecord[]): string {
  const headers = [
    "No",
    "Batch",
    "Nomor Anggota",
    "Nama Anggota",
    "ID Line",
    "Domisili",
    "Display Name",
    "Status",
    "Status Anggota",
  ];

  const escapeCsv = (val: any) => {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = members.map((m, idx) => [
    idx + 1,
    escapeCsv(m.batch),
    escapeCsv(m.noAnggota),
    escapeCsv(m.nama),
    escapeCsv(m.idLine),
    escapeCsv(m.domisili),
    escapeCsv(m.displayName),
    escapeCsv(m.status),
    escapeCsv(m.role),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

export function generateSqlScript(members: AnggotaRecord[]): string {
  const escapeSql = (str: string) => String(str ?? "").replace(/'/g, "''").replace(/\\/g, "\\\\");

  const lines = [
    `-- ============================================================`,
    `-- CAVALLERY FANBASE: DATA RESMI ANGGOTA (BATCH 1 - 9)`,
    `-- Database: Hostinger MySQL / u410588002_Cavallery`,
    `-- Total Data: ${members.length} Anggota (CAVA-0000 s/d CAVA-0650)`,
    `-- Exported At: ${new Date().toISOString()}`,
    `-- ============================================================`,
    ``,
    `CREATE TABLE IF NOT EXISTS \`anggota_cava\` (`,
    `  \`id\` INT AUTO_INCREMENT PRIMARY KEY,`,
    `  \`batch\` VARCHAR(50) NOT NULL,`,
    `  \`batch_number\` INT NOT NULL DEFAULT 1,`,
    `  \`no_anggota\` VARCHAR(50) NOT NULL UNIQUE,`,
    `  \`nama\` VARCHAR(191) NOT NULL,`,
    `  \`id_line\` VARCHAR(191) DEFAULT '-',`,
    `  \`domisili\` VARCHAR(191) DEFAULT '-',`,
    `  \`display_name\` VARCHAR(191) DEFAULT '-',`,
    `  \`status\` ENUM('Aktif', 'Keluar') NOT NULL DEFAULT 'Aktif',`,
    `  \`role\` VARCHAR(50) NOT NULL DEFAULT 'Anggota',`,
    `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`,
    `  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,`,
    `  INDEX \`idx_batch\` (\`batch_number\`),`,
    `  INDEX \`idx_no_anggota\` (\`no_anggota\`),`,
    `  INDEX \`idx_status\` (\`status\`)`,
    `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    ``,
    `-- ============================================================`,
    `-- INSERT / UPDATE ANGGOTA REALTIME`,
    `-- ============================================================`,
    `INSERT INTO \`anggota_cava\` `,
    `(\`batch\`, \`batch_number\`, \`no_anggota\`, \`nama\`, \`id_line\`, \`domisili\`, \`display_name\`, \`status\`, \`role\`)`,
    `VALUES`,
  ];

  const valuesArr = members.map((m) => {
    return `('${escapeSql(m.batch)}', ${m.batchNumber}, '${escapeSql(m.noAnggota)}', '${escapeSql(m.nama)}', '${escapeSql(m.idLine)}', '${escapeSql(m.domisili)}', '${escapeSql(m.displayName)}', '${escapeSql(m.status)}', '${escapeSql(m.role)}')`;
  });

  lines.push(valuesArr.join(",\n") + ";");
  return lines.join("\n");
}
