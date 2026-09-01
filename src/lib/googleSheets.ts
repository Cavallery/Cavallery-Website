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
async function sendToAppsScript(action: string, payload: any): Promise<boolean> {
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
