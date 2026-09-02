import { query } from "@/lib/mysql";

const APPS_SCRIPT_URL =
  process.env.GOOGLE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbw8vF9qJQwjIZhvc5yPrl9hkI4cYrbWzBP1Mr9D8XutqqDddiH8dZa374_ZLy7Aftn7jA/exec";

async function sendMatrixToAppsScript(action: string, payload: any): Promise<boolean> {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL || APPS_SCRIPT_URL;
  if (!url) return false;
  try {
    const rawBody = JSON.stringify({ action, data: payload });
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: rawBody,
      redirect: "follow",
    });
    return true;
  } catch (err: any) {
    console.error("[KasMatrix/AppsScript Error]:", err?.message || err);
  }
  return false;
}

export const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const SUPPORTED_YEARS = [2024, 2025, 2026, 2027, 2028, 2029];

export async function ensureKasMatrixTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS iuran_kas_bulanan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        anggota_id INT NOT NULL,
        no_anggota VARCHAR(50) NOT NULL,
        tahun INT NOT NULL,
        bulan INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'diverifikasi',
        nominal DECIMAL(12,2) NOT NULL DEFAULT 15000,
        konfirmasi_kas_id INT NULL,
        verified_at DATETIME NULL,
        verified_by VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_anggota_tahun_bulan (no_anggota, tahun, bulan),
        INDEX idx_tahun_bulan (tahun, bulan),
        INDEX idx_no_anggota (no_anggota)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err: any) {
    console.error("[KasMatrix] Error ensuring table:", err?.message);
  }
}

/**
 * Parsing Periode String (contoh: "Januari 2026", "09/2026", "2026-09") ke { bulan, tahun, totalBulan }
 */
export function parsePeriodeToMonths(periodeStr: string, nominal: number = 15000): { tahun: number; startBulan: number; count: number } {
  const clean = (periodeStr || "").trim();
  const currentYear = new Date().getFullYear();
  let tahun = currentYear;
  let startBulan = new Date().getMonth() + 1; // 1-12

  // Extract 4 digit year
  const yearMatch = clean.match(/202[3-9]|203[0-9]/);
  if (yearMatch) {
    tahun = parseInt(yearMatch[0], 10);
  }

  // Find month name
  for (let i = 0; i < MONTH_NAMES_ID.length; i++) {
    const mName = MONTH_NAMES_ID[i];
    if (new RegExp(mName, "i").test(clean)) {
      startBulan = i + 1;
      break;
    }
  }

  // Calculate number of months covered based on standard nominal (default 15.000 / month)
  // e.g. 15.000 = 1 bulan, 30.000 = 2 bulan, 45.000 = 3 bulan, 90.000 = 6 bulan, 180.000 = 12 bulan
  let count = 1;
  if (nominal >= 15000) {
    count = Math.max(1, Math.round(nominal / 15000));
  }

  return { tahun, startBulan, count };
}

/**
 * Sync Konfirmasi Kas yang DIVERIFIKASI ke tabel matriks bulanan
 */
export async function syncKasToMatrix(params: {
  konfirmasiKasId: number;
  anggotaId: number;
  noAnggota: string;
  periode: string;
  nominal: number;
  status: string; // 'diverifikasi' | 'pending' | 'ditolak'
  verifiedBy?: string;
}) {
  await ensureKasMatrixTable();
  const { konfirmasiKasId, anggotaId, noAnggota, periode, nominal, status, verifiedBy } = params;

  if (!noAnggota || noAnggota === "-") return;

  const { tahun, startBulan, count } = parsePeriodeToMonths(periode, nominal);
  const nominalPerMonth = count > 0 ? Math.round(nominal / count) : 15000;

  if (status === "diverifikasi") {
    for (let c = 0; c < count; c++) {
      let b = startBulan + c;
      let y = tahun;
      while (b > 12) {
        b -= 12;
        y += 1;
      }

      await query(
        `INSERT INTO iuran_kas_bulanan 
          (anggota_id, no_anggota, tahun, bulan, status, nominal, konfirmasi_kas_id, verified_at, verified_by)
         VALUES (?, ?, ?, ?, 'diverifikasi', ?, ?, NOW(), ?)
         ON DUPLICATE KEY UPDATE
          status = 'diverifikasi',
          nominal = VALUES(nominal),
          konfirmasi_kas_id = VALUES(konfirmasi_kas_id),
          verified_at = NOW(),
          verified_by = VALUES(verified_by)`,
        [anggotaId, noAnggota, y, b, nominalPerMonth, konfirmasiKasId, verifiedBy || "Admin"]
      );

      // Realtime push status checkmark ke Spreadsheet Tab (cth: "Kas 2026")
      updateSpreadsheetMatrixCell({
        tahun: y,
        noAnggota,
        bulan: b,
        isPaid: true,
      }).catch((e) => console.error("[Spreadsheet Matrix] Error updating cell:", e));
    }
  } else if (status === "ditolak") {
    // Jika ditolak, hapus catatan iuran bulanan terkait
    await query(
      `DELETE FROM iuran_kas_bulanan WHERE konfirmasi_kas_id = ?`,
      [konfirmasiKasId]
    );
  }
}

/**
 * Toggle Status Pembayaran Bulan Secara Manual oleh Admin dari Web
 */
export async function toggleMonthPayment(params: {
  noAnggota: string;
  tahun: number;
  bulan: number;
  isPaid: boolean;
  nominal?: number;
  adminName: string;
}) {
  await ensureKasMatrixTable();
  const { noAnggota, tahun, bulan, isPaid, nominal = 15000, adminName } = params;

  const angRows = await query<any[]>(
    "SELECT id, nama_lengkap FROM anggota WHERE no_anggota = ? LIMIT 1",
    [noAnggota]
  );
  const anggotaId = angRows && angRows.length > 0 ? angRows[0].id : 0;

  if (isPaid) {
    await query(
      `INSERT INTO iuran_kas_bulanan 
        (anggota_id, no_anggota, tahun, bulan, status, nominal, verified_at, verified_by)
       VALUES (?, ?, ?, ?, 'diverifikasi', ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE
        status = 'diverifikasi',
        nominal = VALUES(nominal),
        verified_at = NOW(),
        verified_by = VALUES(verified_by)`,
      [anggotaId, noAnggota, tahun, bulan, nominal, adminName]
    );
  } else {
    await query(
      `DELETE FROM iuran_kas_bulanan WHERE no_anggota = ? AND tahun = ? AND bulan = ?`,
      [noAnggota, tahun, bulan]
    );
  }

  // Push ke Spreadsheet
  updateSpreadsheetMatrixCell({
    tahun,
    noAnggota,
    bulan,
    isPaid,
  }).catch((e) => console.error("[Spreadsheet Matrix] Error updating cell:", e));

  return true;
}

/**
 * Mengambil Data Matriks Lengkap per Tahun (12 Bulan) untuk Semua Anggota
 */
export async function getYearlyKasMatrix(tahun: number) {
  await ensureKasMatrixTable();

  // 1. Ambil Semua Anggota Aktif & Natural Sort
  const rawAnggota = (await query<any[]>(`
    SELECT id, no_anggota, nama_lengkap, jabatan, divisi, anggota_sejak, created_at 
    FROM anggota 
    WHERE status = 'aktif'
    ORDER BY 
      CASE WHEN no_anggota IS NULL OR no_anggota = '' OR no_anggota = '-' THEN 1 ELSE 0 END,
      id ASC
  `)) || [];

  const extractNumber = (str: string | null | undefined): number => {
    if (!str || str === "-") return 99999999;
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 9999999;
  };

  const anggotaList = [...rawAnggota].sort((a, b) => {
    const isAEmpty = !a.no_anggota || a.no_anggota === "-" || a.no_anggota === "";
    const isBEmpty = !b.no_anggota || b.no_anggota === "-" || b.no_anggota === "";
    if (isAEmpty && !isBEmpty) return 1;
    if (!isAEmpty && isBEmpty) return -1;

    const numA = extractNumber(a.no_anggota);
    const numB = extractNumber(b.no_anggota);
    if (numA !== numB) return numA - numB;
    return String(a.no_anggota || "").localeCompare(String(b.no_anggota || ""));
  });

  // 2. Ambil seluruh data pembayaran kas pada tahun yang dipilih
  const payments = (await query<any[]>(`
    SELECT no_anggota, bulan, nominal, status, verified_at, verified_by 
    FROM iuran_kas_bulanan 
    WHERE tahun = ? AND status = 'diverifikasi'
  `, [tahun])) || [];

  // Indexing payments by `no_anggota:bulan`
  const paymentMap: Record<string, { nominal: number; verifiedAt: any; verifiedBy: any }> = {};
  payments.forEach((p) => {
    const key = `${p.no_anggota}:${p.bulan}`;
    paymentMap[key] = {
      nominal: Number(p.nominal) || 15000,
      verifiedAt: p.verified_at,
      verifiedBy: p.verified_by,
    };
  });

  // 3. Bangun Matriks Baris Tiap Anggota
  const matrixRows = anggotaList.map((a, idx) => {
    const noAnggota = a.no_anggota || "-";
    const nama = a.nama_lengkap || "-";
    const bulanMulai = 1; // default bulan mulai aktif

    const months: Record<number, boolean> = {};
    let totalKasAnggota = 0;

    for (let m = 1; m <= 12; m++) {
      const key = `${noAnggota}:${m}`;
      const isPaid = Boolean(paymentMap[key]);
      months[m] = isPaid;
      if (isPaid) {
        totalKasAnggota += paymentMap[key].nominal;
      }
    }

    return {
      no: idx + 1,
      anggotaId: a.id,
      noAnggota,
      nama,
      jabatan: a.jabatan || "Anggota",
      divisi: a.divisi,
      isAdminRole: (a.jabatan || "") !== "Anggota",
      bulanMulai,
      totalKas: totalKasAnggota,
      months, // { 1: true, 2: true, 3: false, ... 12: false }
    };
  });

  // 4. Hitung Akumulasi Total Bulanan (Kolom 1 s/d 12)
  const monthlyTotals: Record<number, number> = {};
  const monthlyPaidCounts: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) {
    monthlyTotals[m] = 0;
    monthlyPaidCounts[m] = 0;
  }

  let grandTotalPemasukan = 0;

  matrixRows.forEach((row) => {
    grandTotalPemasukan += row.totalKas;
    for (let m = 1; m <= 12; m++) {
      if (row.months[m]) {
        monthlyTotals[m] += 15000;
        monthlyPaidCounts[m] += 1;
      }
    }
  });

  return {
    tahun,
    grandTotalPemasukan,
    totalAnggota: matrixRows.length,
    monthlyTotals,
    monthlyPaidCounts,
    matrixRows,
  };
}

/**
 * Format spreadsheet rows for a given year to send to Google Sheets
 */
export async function buildSpreadsheetYearlyData(tahun: number) {
  const matrix = await getYearlyKasMatrix(tahun);

  // Row 1: Title & Total Pemasukan
  // Row 2: Total Pengeluaran
  // Row 3: Blank
  // Row 4: Header
  // Row 5: Monthly Sum Header
  // Row 6+: Data

  const headerRow4 = [
    "No.",
    "Nomor Anggota",
    "Nama",
    "Kas",
    "Bulan Mulai",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const headerRow5 = [
    "Bulan",
    "",
    "",
    "",
    "",
    ...Array.from({ length: 12 }, (_, i) => `Rp ${matrix.monthlyTotals[i + 1].toLocaleString("id-ID")}`),
  ];

  const dataRows = matrix.matrixRows.map((r) => [
    r.no,
    r.noAnggota,
    r.nama,
    r.totalKas > 0 ? `Rp ${r.totalKas.toLocaleString("id-ID")}` : "Rp -",
    r.bulanMulai,
    r.months[1] ? true : false,
    r.months[2] ? true : false,
    r.months[3] ? true : false,
    r.months[4] ? true : false,
    r.months[5] ? true : false,
    r.months[6] ? true : false,
    r.months[7] ? true : false,
    r.months[8] ? true : false,
    r.months[9] ? true : false,
    r.months[10] ? true : false,
    r.months[11] ? true : false,
    r.months[12] ? true : false,
  ]);

  return {
    tahun,
    tabName: `Kas ${tahun}`,
    grandTotalPemasukan: matrix.grandTotalPemasukan,
    headerRow4,
    headerRow5,
    dataRows,
  };
}

/**
 * Realtime Push Matriks Cell Update to Apps Script
 */
export async function updateSpreadsheetMatrixCell(params: {
  tahun: number;
  noAnggota: string;
  bulan: number;
  isPaid: boolean;
}) {
  return await sendMatrixToAppsScript("update_kas_matrix_cell", {
    tabName: `Kas ${params.tahun}`,
    noAnggota: params.noAnggota,
    bulan: params.bulan, // 1 - 12 (Column 6 to 17)
    isPaid: params.isPaid,
  });
}
