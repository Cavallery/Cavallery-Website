/**
 * CAVALLERY SPREADSHEET BACKUP INTEGRATION
 * Mendukung integrasi via:
 * 1. Google Apps Script Web App URL (GOOGLE_APPS_SCRIPT_URL) - Direkomendasikan (Mudah & Cepat)
 * 2. Google Sheets API v4 via Service Account
 */

const APPS_SCRIPT_URL =
  process.env.GOOGLE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbw8vF9qJQwjIZhvc5yPrl9hkI4cYrbWzBP1Mr9D8XutqqDddiH8dZa374_ZLy7Aftn7jA/exec";

/**
 * Helper kirim data ke Google Apps Script Web App via HTTP POST
 */
export async function sendToAppsScript(action: string, payload: any): Promise<boolean> {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL || APPS_SCRIPT_URL;
  if (!url) return false;

  try {
    const rawBody = JSON.stringify({ action, data: payload });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: rawBody,
      redirect: "follow",
    });

    const resText = await res.text();
    console.log(`[GoogleSheets/AppsScript] Response for ${action}:`, resText);
    return true;
  } catch (err: any) {
    console.error(`[GoogleSheets/AppsScript Error] Gagal kirim ${action}:`, err?.message || err);
  }
  return false;
}

/**
 * 1. Push data Anggota ke tab "Anggota" di Google Sheets
 */
export async function appendAnggotaRow(data: {
  noAnggota: string;
  namaLengkap: string;
  idLine: string;
  displayLine?: string | null;
  discord?: string | null;
  gender: string;
  domisili: string;
  kontakPlatform: string;
  kontakId: string;
  status: string;
  jabatan?: string;
  anggotaSejak?: string | Date | null;
  createdAt?: string | Date;
}) {
  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toISOString().replace("T", " ").substring(0, 19)
    : new Date().toISOString().replace("T", " ").substring(0, 19);
  const formattedSejak = data.anggotaSejak
    ? new Date(data.anggotaSejak).toLocaleDateString("id-ID")
    : "-";

  const row = [
    data.noAnggota,
    data.namaLengkap,
    data.idLine,
    data.displayLine || "-",
    data.discord || "-",
    data.gender,
    data.domisili,
    `${data.kontakPlatform}: ${data.kontakId}`,
    data.status,
    data.jabatan || "Anggota",
    formattedSejak,
    formattedDate,
  ];

  // Kirim ke Google Apps Script
  await sendToAppsScript("append_anggota", {
    tab: "Anggota",
    row,
    object: data,
  });
}

/**
 * 2. Push data Kas ke tab "Kas" di Google Sheets
 */
export async function appendKasRow(data: {
  id: number | string;
  noAnggota: string;
  namaAnggota: string;
  idLine: string;
  periode: string;
  nominal: number;
  status: string;
  buktiBayarUrl: string;
  createdAt?: string | Date;
}) {
  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toISOString().replace("T", " ").substring(0, 19)
    : new Date().toISOString().replace("T", " ").substring(0, 19);

  const row = [
    String(data.id),
    data.noAnggota,
    data.namaAnggota,
    data.idLine,
    data.periode,
    Number(data.nominal),
    data.status,
    data.buktiBayarUrl,
    formattedDate,
  ];

  await sendToAppsScript("append_kas", {
    tab: "Kas",
    row,
    object: data,
  });
}

/**
 * 3. Push data Donasi ke tab "Donasi" di Google Sheets
 */
export async function appendDonasiRow(data: {
  id: number | string;
  tipeDonatur: "Anggota" | "Donatur";
  identitas: string; // noAnggota atau kontak
  nama: string;
  kontak: string;
  tipeDonasi: string;
  nominal: number;
  status: string;
  buktiBayarUrl: string;
  createdAt?: string | Date;
}) {
  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toISOString().replace("T", " ").substring(0, 19)
    : new Date().toISOString().replace("T", " ").substring(0, 19);

  const row = [
    String(data.id),
    data.tipeDonatur,
    data.identitas,
    data.nama,
    data.kontak,
    data.tipeDonasi,
    Number(data.nominal),
    data.status,
    data.buktiBayarUrl,
    formattedDate,
  ];

  await sendToAppsScript("append_donasi", {
    tab: "Donasi",
    row,
    object: data,
  });
}

/**
 * 4. Push data Kontributor ke tab "Kontributor" di Google Sheets
 */
export async function appendKontributorRow(data: {
  id: number | string;
  nama: string;
  kontakPlatform: string;
  kontakId: string;
  discord?: string | null;
  status: string;
  totalKontribusi?: number;
  createdAt?: string | Date;
}) {
  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toISOString().replace("T", " ").substring(0, 19)
    : new Date().toISOString().replace("T", " ").substring(0, 19);

  const row = [
    String(data.id),
    data.nama,
    data.kontakPlatform,
    data.kontakId,
    data.discord || "-",
    data.status,
    Number(data.totalKontribusi || 0),
    formattedDate,
  ];

  await sendToAppsScript("append_kontributor", {
    tab: "Kontributor",
    row,
    object: data,
  });
}

/**
 * 5. Sync All (Full Backup) - Mengirim semua rows sekaligus agar di-replace tanpa duplikasi
 */
export async function syncAllToSheets(payload: {
  anggotaRows: any[][];
  kontributorRows?: any[][];
  kasRows: any[][];
  donasiRows: any[][];
  yearlyMatrixTabs?: any[];
  anggotaAktifRows?: any[][];
  statusAnggotaRows?: any[][];
  leaderboardRows?: any[][];
  pengeluaranRows?: any[][];
}): Promise<boolean> {
  return await sendToAppsScript("sync_all", payload);
}

/**
 * Push data Pengeluaran Kas ke Google Sheets
 */
export async function appendPengeluaranRow(data: {
  id: number | string;
  tanggal: string;
  tahun: number;
  kategori: string;
  keperluan: string;
  nominal: number;
  pjNama: string;
  buktiNotaUrl?: string;
  catatan?: string;
}) {
  const row = [
    String(data.id),
    data.tanggal,
    data.tahun,
    data.kategori,
    data.keperluan,
    Number(data.nominal),
    `Rp ${Number(data.nominal).toLocaleString("id-ID")}`,
    data.pjNama,
    data.buktiNotaUrl || "-",
    data.catatan || "-",
  ];

  await sendToAppsScript("append_pengeluaran", {
    tab: "Laporan Pengeluaran",
    row,
  });
}

/**
 * 6. Hapus baris dari Google Sheets berdasarkan nilai kolom tertentu
 */
export async function deleteFromSheets(tab: string, matchColumn: number, matchValue: string | number): Promise<boolean> {
  return await sendToAppsScript("delete_row", {
    tab,
    matchColumn,
    matchValue: String(matchValue).trim(),
  });
}

export async function deleteAnggotaRow(noAnggota: string): Promise<boolean> {
  return await sendToAppsScript("delete_anggota", {
    tab: "Anggota",
    noAnggota: String(noAnggota).trim(),
  });
}

export async function deleteKontributorRow(id: number | string): Promise<boolean> {
  return await sendToAppsScript("delete_kontributor", {
    tab: "Kontributor",
    id: String(id).trim(),
  });
}

export async function deleteKasRow(id: number | string): Promise<boolean> {
  return await sendToAppsScript("delete_kas", {
    tab: "Kas",
    id: String(id).trim(),
  });
}

export async function deleteDonasiRow(id: number | string): Promise<boolean> {
  return await sendToAppsScript("delete_donasi", {
    tab: "Donasi",
    id: String(id).trim(),
  });
}

/**
 * 7. Update status baris secara langsung di Google Sheets tanpa duplikasi
 */
export async function updateKasStatusInSheet(id: number | string, newStatus: string, fullData?: any): Promise<boolean> {
  let row: any[] | undefined;
  if (fullData) {
    const formattedDate = fullData.createdAt
      ? new Date(fullData.createdAt).toISOString().replace("T", " ").substring(0, 19)
      : new Date().toISOString().replace("T", " ").substring(0, 19);
    row = [
      String(id),
      fullData.noAnggota || "-",
      fullData.namaAnggota || fullData.namaLengkap,
      fullData.idLine,
      fullData.periode,
      Number(fullData.nominal),
      newStatus,
      fullData.buktiBayarUrl || "",
      formattedDate,
    ];
  }

  return await sendToAppsScript("update_status", {
    tab: "Kas",
    id: String(id).trim(),
    status: newStatus,
    row,
  });
}

export async function updateDonasiStatusInSheet(id: number | string, newStatus: string, fullData?: any): Promise<boolean> {
  let row: any[] | undefined;
  if (fullData) {
    const formattedDate = fullData.createdAt
      ? new Date(fullData.createdAt).toISOString().replace("T", " ").substring(0, 19)
      : new Date().toISOString().replace("T", " ").substring(0, 19);
    row = [
      String(id),
      fullData.tipeDonatur || "Donatur",
      fullData.identitas || "-",
      fullData.nama,
      fullData.kontak,
      fullData.tipeDonasi,
      Number(fullData.nominal),
      newStatus,
      fullData.buktiBayarUrl || "",
      formattedDate,
    ];
  }

  return await sendToAppsScript("update_status", {
    tab: "Donasi",
    id: String(id).trim(),
    status: newStatus,
    row,
  });
}

export async function updateAnggotaJabatanInSheet(noAnggota: string, newJabatan: string): Promise<boolean> {
  return await sendToAppsScript("update_anggota_jabatan", {
    tab: "Anggota",
    noAnggota: String(noAnggota).trim(),
    jabatan: newJabatan,
  });
}

export async function updateAnggotaStatusInSheet(noAnggota: string, newStatus: string): Promise<boolean> {
  return await sendToAppsScript("update_anggota_status", {
    tab: "Anggota",
    noAnggota: String(noAnggota).trim(),
    status: newStatus,
  });
}
