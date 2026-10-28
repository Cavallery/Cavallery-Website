import { query, isMySqlConfigured } from "./mysql";
import {
  getAllMembers,
  formatNoAnggota4Digit,
  getBatchFromNumber,
  AnggotaRecord,
  DOMISILI_MAP,
} from "./anggotaParser";
import {
  appendAnggotaRow,
  updateAnggotaStatusInSheet,
  updateAnggotaJabatanInSheet,
  deleteAnggotaRow,
} from "./googleSheets";

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

// ── Daftar admin resmi fanbase (nomor anggota) ──
const KNOWN_ADMIN_NUMBERS = new Set([0, 1, 7, 18, 21, 23, 31, 38]);

/**
 * Map baris dari tabel `anggota` (keanggotaan) ke format AnggotaRecord
 * yang dipakai halaman Data Anggota CAVA.
 *
 * Kolom tabel `anggota`:
 *   id, no_anggota, nama_lengkap, id_line, display_line, domisili,
 *   gender, status ('aktif'|'nonaktif'|'pending'), jabatan ('Anggota'|'Admin Fanbase'),
 *   batch_id, batch_name, batch_year, ...
 */
function mapMainDbRowToRecord(row: any): AnggotaRecord {
  const rawNo = String(row.no_anggota || "").trim();
  const noAnggota = rawNo ? formatNoAnggota4Digit(rawNo) : "-";

  // Ekstrak angka dari no_anggota untuk batch detection
  const numMatch = rawNo.match(/(\d+)$/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 0;
  const { batch: autoBatch, batchNumber: autoBatchNum } = getBatchFromNumber(num);

  // Status mapping: anggota table uses 'aktif'/'nonaktif'/'pending'
  const rawStatus = String(row.status || "aktif").toLowerCase();
  const status: "Aktif" | "Keluar" =
    rawStatus === "aktif" ? "Aktif" : "Keluar";

  // Role mapping: jabatan 'Admin Fanbase' → 'Admin'
  const jabatan = String(row.jabatan || "Anggota").trim();
  let role: "Admin" | "Anggota" | "Keluar" = "Anggota";
  if (jabatan.toLowerCase().includes("admin") || KNOWN_ADMIN_NUMBERS.has(num)) {
    role = "Admin";
  } else if (status === "Keluar") {
    role = "Keluar";
  }

  const displayName =
    row.display_line ||
    `CAVA ${String(num).padStart(3, "0")} ${row.nama_lengkap || ""}`.trim();

  const domisili = row.domisili && row.domisili !== "-"
    ? row.domisili
    : (DOMISILI_MAP[noAnggota] || "-");

  return {
    id: Number(row.id),
    batch: autoBatch,
    batchNumber: autoBatchNum,
    noAnggota,
    legacyNoAnggota: rawNo,
    nama: String(row.nama_lengkap || ""),
    idLine: String(row.id_line || "-"),
    domisili,
    displayName,
    tunggakanKas: "-",
    nominalKas: "-",
    nominalKasNumber: 0,
    terakhirBayar: "-",
    status,
    role,
  };
}

/**
 * Fetch semua anggota dari tabel utama `anggota` (source of truth, sama dengan keanggotaan).
 * Fallback ke local TSV/JSON hanya jika MySQL tidak tersedia.
 */
export async function fetchAllAnggota(): Promise<AnggotaRecord[]> {
  if (isMySqlConfigured()) {
    try {
      // Baca dari tabel `anggota` — SAMA dengan yang dipakai halaman keanggotaan
      const rows = await query<any[]>(
        `SELECT a.*, b.name as batch_name, b.year as batch_year
         FROM anggota a
         LEFT JOIN recruitment_batches b ON a.batch_id = b.id
         WHERE a.status != 'pending'
         ORDER BY a.no_anggota ASC, a.id ASC`
      );
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows.map(mapMainDbRowToRecord);
      }
    } catch (e: any) {
      console.warn("[AnggotaService] MySQL fetch from `anggota` failed, falling back to local:", e?.message);
    }
  }

  // Fallback to local JSON / parsed TSV (read-only, hanya untuk development)
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

  return filtered.map((a) => ({
    id: a.id,
    batch: a.batch,
    batchNumber: a.batchNumber,
    noAnggota: a.noAnggota,
    nama: a.nama,
    status: a.status,
  }));
}

/**
 * Tambah anggota baru — insert ke tabel `anggota` (tabel utama keanggotaan).
 * Ini memastikan data selaras antara halaman keanggotaan dan halaman anggota CAVA.
 */
export async function addAnggota(data: Omit<AnggotaRecord, "id">): Promise<AnggotaRecord> {
  const formattedNo = formatNoAnggota4Digit(data.noAnggota);

  // Map status: 'Aktif' → 'aktif', 'Keluar' → 'nonaktif'
  const dbStatus = data.status === "Keluar" ? "nonaktif" : "aktif";

  // Map role → jabatan: 'Admin' → 'Admin Fanbase', else 'Anggota'
  const dbJabatan = data.role === "Admin" ? "Admin Fanbase" : "Anggota";

  const displayName = data.displayName || formattedNo;
  const domisili = data.domisili || "-";
  const idLine = data.idLine || "-";
  const now = new Date();

  const numMatch = formattedNo.match(/(\d+)$/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 0;
  const { batch: autoBatch, batchNumber: autoBatchNum } = getBatchFromNumber(num);
  const targetBatchNum = data.batchNumber || autoBatchNum || 1;
  const targetBatchName = data.batch || autoBatch || `Batch ${targetBatchNum}`;

  if (isMySqlConfigured()) {
    try {
      // 1. Dapatkan batch_id jika tabel recruitment_batches tersedia
      let batchId: number | null = null;
      try {
        const bRows = await query<any[]>(
          "SELECT id FROM recruitment_batches WHERE name = ? OR name LIKE ? ORDER BY id ASC LIMIT 1",
          [`Batch ${targetBatchNum}`, `%Batch ${targetBatchNum}%`]
        );
        if (bRows && bRows.length > 0) {
          batchId = bRows[0].id;
        }
      } catch {}

      // 2. Periksa apakah sudah ada anggota dengan no_anggota yang sama
      const existing = await query<any[]>(
        "SELECT id FROM anggota WHERE no_anggota = ? OR no_anggota = ? LIMIT 1",
        [formattedNo, data.noAnggota]
      );

      if (existing && existing.length > 0) {
        const existId = existing[0].id;
        await query(
          `UPDATE anggota SET
             nama_lengkap = ?,
             id_line = ?,
             display_line = ?,
             domisili = ?,
             status = ?,
             jabatan = ?
             ${batchId ? ", batch_id = ?" : ""}
           WHERE id = ?`,
          batchId
            ? [data.nama.trim(), idLine, displayName, domisili, dbStatus, dbJabatan, batchId, existId]
            : [data.nama.trim(), idLine, displayName, domisili, dbStatus, dbJabatan, existId]
        );
      } else {
        // Coba insert dengan semua field tabel anggota (termasuk gender, kontak_platform, badge, batch_id)
        let insertedOk = false;
        try {
          const res = await query(
            `INSERT INTO anggota 
             (no_anggota, nama_lengkap, id_line, pin, display_line, discord, gender, domisili, kontak_platform, kontak_id, status, jabatan, divisi, badge, batch_id, foto_profil, anggota_sejak) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              formattedNo,
              data.nama.trim(),
              idLine,
              null,
              displayName,
              null,
              "Laki-laki",
              domisili,
              "LINE",
              idLine,
              dbStatus,
              dbJabatan,
              null,
              "squire",
              batchId,
              null,
              now,
            ]
          );
          if (res) insertedOk = true;
        } catch {}

        if (!insertedOk) {
          // Fallback tanpa badge/divisi/discord jika kolom belum ada
          try {
            const res2 = await query(
              `INSERT INTO anggota 
               (no_anggota, nama_lengkap, id_line, display_line, gender, domisili, kontak_platform, kontak_id, status, jabatan, batch_id, anggota_sejak) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                formattedNo,
                data.nama.trim(),
                idLine,
                displayName,
                "Laki-laki",
                domisili,
                "LINE",
                idLine,
                dbStatus,
                dbJabatan,
                batchId,
                now,
              ]
            );
            if (res2) insertedOk = true;
          } catch {}
        }

        if (!insertedOk) {
          // Fallback minimal
          await query(
            `INSERT INTO anggota 
             (no_anggota, nama_lengkap, id_line, display_line, domisili, status, jabatan, anggota_sejak) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              formattedNo,
              data.nama.trim(),
              idLine,
              displayName,
              domisili,
              dbStatus,
              dbJabatan,
              now,
            ]
          );
        }
      }

      // Sync non-blocking ke Google Sheets
      try {
        appendAnggotaRow({
          noAnggota: formattedNo,
          namaLengkap: data.nama.trim(),
          idLine: idLine,
          displayLine: displayName,
          discord: "-",
          gender: "Laki-laki",
          domisili: domisili,
          kontakPlatform: "LINE",
          kontakId: idLine,
          status: dbStatus,
          jabatan: dbJabatan,
          batch: targetBatchName,
          anggotaSejak: now,
          createdAt: now,
        }).catch(() => {});
      } catch {}

      // Ambil record yang baru diinsert / update
      const inserted = await query<any[]>(
        `SELECT a.*, b.name as batch_name, b.year as batch_year
         FROM anggota a
         LEFT JOIN recruitment_batches b ON a.batch_id = b.id
         WHERE a.no_anggota = ? OR a.no_anggota = ?
         ORDER BY a.id DESC LIMIT 1`,
        [formattedNo, data.noAnggota]
      );

      if (inserted && inserted.length > 0) {
        return mapMainDbRowToRecord(inserted[0]);
      }
    } catch (e: any) {
      console.error("[AnggotaService] MySQL insert to `anggota` error:", e?.message);
      throw new Error("Gagal menyimpan data anggota ke database: " + (e?.message || "Unknown error"));
    }
  }

  // Fallback jika MySQL tidak configured (local dev only)
  return {
    ...data,
    id: Date.now(),
    batch: targetBatchName,
    batchNumber: targetBatchNum,
    noAnggota: formattedNo,
    idLine,
    domisili,
    displayName,
    tunggakanKas: "-",
    nominalKas: "-",
    nominalKasNumber: 0,
    terakhirBayar: "-",
    status: data.status === "Keluar" ? "Keluar" : "Aktif",
    role: data.role === "Admin" ? "Admin" : data.role === "Keluar" ? "Keluar" : "Anggota",
  };
}

/**
 * Update data anggota — update di tabel `anggota`.
 */
export async function updateAnggota(idOrNo: number | string, patch: Partial<AnggotaRecord>): Promise<AnggotaRecord | null> {
  if (!isMySqlConfigured()) {
    console.warn("[AnggotaService] MySQL not configured, cannot update.");
    return null;
  }

  // Cari record existing
  const numId = Number(idOrNo);
  let existing: any[] | null = null;

  if (!isNaN(numId) && numId > 0) {
    existing = await query<any[]>("SELECT * FROM anggota WHERE id = ? LIMIT 1", [numId]);
  }
  if ((!existing || existing.length === 0) && typeof idOrNo === "string") {
    const formatted = formatNoAnggota4Digit(idOrNo);
    existing = await query<any[]>("SELECT * FROM anggota WHERE no_anggota = ? OR no_anggota = ? LIMIT 1", [idOrNo, formatted]);
  }

  if (!existing || existing.length === 0) return null;

  const current = existing[0];
  const currentId = current.id;
  const targetNo = current.no_anggota || (patch.noAnggota ? formatNoAnggota4Digit(patch.noAnggota) : "");

  // Build update fields
  const updates: string[] = [];
  const params: any[] = [];

  if (patch.nama !== undefined) {
    updates.push("nama_lengkap = ?");
    params.push(patch.nama.trim());
  }
  if (patch.noAnggota !== undefined) {
    updates.push("no_anggota = ?");
    params.push(formatNoAnggota4Digit(patch.noAnggota));
  }
  if (patch.idLine !== undefined) {
    updates.push("id_line = ?");
    params.push(patch.idLine || "-");
  }
  if (patch.domisili !== undefined) {
    updates.push("domisili = ?");
    params.push(patch.domisili || "-");
  }
  if (patch.displayName !== undefined) {
    updates.push("display_line = ?");
    params.push(patch.displayName || "-");
  }
  if (patch.status !== undefined) {
    const newStatus = patch.status === "Keluar" ? "nonaktif" : "aktif";
    updates.push("status = ?");
    params.push(newStatus);
    if (targetNo) {
      updateAnggotaStatusInSheet(targetNo, newStatus).catch(() => {});
    }
  }
  if (patch.role !== undefined) {
    const newJabatan = patch.role === "Admin" ? "Admin Fanbase" : "Anggota";
    updates.push("jabatan = ?");
    params.push(newJabatan);
    if (targetNo) {
      updateAnggotaJabatanInSheet(targetNo, newJabatan).catch(() => {});
    }
  }
  if (patch.batchNumber !== undefined) {
    try {
      const bRows = await query<any[]>(
        "SELECT id FROM recruitment_batches WHERE name = ? OR name LIKE ? ORDER BY id ASC LIMIT 1",
        [`Batch ${patch.batchNumber}`, `%Batch ${patch.batchNumber}%`]
      );
      if (bRows && bRows.length > 0) {
        updates.push("batch_id = ?");
        params.push(bRows[0].id);
      }
    } catch {}
  }

  if (updates.length === 0) {
    return mapMainDbRowToRecord(current);
  }

  params.push(currentId);

  try {
    await query(
      `UPDATE anggota SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    const updated = await query<any[]>(
      `SELECT a.*, b.name as batch_name, b.year as batch_year
       FROM anggota a
       LEFT JOIN recruitment_batches b ON a.batch_id = b.id
       WHERE a.id = ? LIMIT 1`,
      [currentId]
    );
    if (updated && updated.length > 0) {
      return mapMainDbRowToRecord(updated[0]);
    }
  } catch (e: any) {
    console.error("[AnggotaService] MySQL update error:", e?.message);
    throw new Error("Gagal memperbarui data: " + (e?.message || "Unknown"));
  }

  return null;
}

/**
 * Hapus anggota — hapus dari tabel `anggota`.
 */
export async function deleteAnggota(idOrNo: number | string): Promise<boolean> {
  if (!isMySqlConfigured()) {
    console.warn("[AnggotaService] MySQL not configured, cannot delete.");
    return false;
  }

  const numId = Number(idOrNo);

  try {
    let targetId = 0;
    let targetNo = "";

    if (!isNaN(numId) && numId > 0) {
      const found = await query<any[]>("SELECT id, no_anggota FROM anggota WHERE id = ? LIMIT 1", [numId]);
      if (found && found.length > 0) {
        targetId = found[0].id;
        targetNo = found[0].no_anggota;
      }
    } else if (typeof idOrNo === "string") {
      const formatted = formatNoAnggota4Digit(idOrNo);
      const found = await query<any[]>(
        "SELECT id, no_anggota FROM anggota WHERE no_anggota = ? OR no_anggota = ? LIMIT 1",
        [idOrNo, formatted]
      );
      if (found && found.length > 0) {
        targetId = found[0].id;
        targetNo = found[0].no_anggota;
      }
    }

    if (!targetId) return false;

    // Bersihkan relasi foreign key terlebih dahulu
    await query("DELETE FROM konfirmasi_kas WHERE anggota_id = ?", [targetId]);
    await query("DELETE FROM kupon_anggota WHERE anggota_id = ?", [targetId]);
    await query("DELETE FROM war_tiket_peserta WHERE anggota_id = ?", [targetId]);
    if (targetNo) {
      await query("DELETE FROM iuran_kas_bulanan WHERE anggota_id = ? OR no_anggota = ?", [targetId, targetNo]);
      deleteAnggotaRow(targetNo).catch(() => {});
    }

    const result = await query("DELETE FROM anggota WHERE id = ?", [targetId]);
    return result !== null;
  } catch (e: any) {
    console.error("[AnggotaService] MySQL delete error:", e?.message);
    return false;
  }
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
    `-- CAVALLERY FANBASE: DATA ANGGOTA RESMI (REALTIME EXPORT)`,
    `-- Total Data: ${members.length} Anggota`,
    `-- Exported At: ${new Date().toISOString()}`,
    `-- ============================================================`,
  ];

  const valuesArr = members.map((m) => {
    return `-- ${m.noAnggota}: ${m.nama} (${m.status}, ${m.role}, ${m.domisili})`;
  });

  lines.push("", "-- Daftar Anggota:", ...valuesArr);
  return lines.join("\n");
}
