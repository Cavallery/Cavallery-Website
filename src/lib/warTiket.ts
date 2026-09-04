import { query } from "@/lib/mysql";

let tablesEnsured = false;

export const DEFAULT_WAR_EVENT = {
  id: 1,
  judul: "War Tiket Project STS Erine 20th",
  kode_tiket: "STS20",
  subjudul: "Cavallery • Official Fanbase Erine JKT48",
  lokasi_event: "Theater JKT48, fX Sudirman Lt. 4",
  tanggal_event: "Sabtu, 26 September 2026 • 19.00 WIB",
  kategori_tiket: "OFFICIAL VIP PASS • TEAM PASSION",
  deskripsi: "Akses khusus project perayaan Seitansai Catherina Vallencia (Erine) ke-20 bersama Cavallery Team Passion.",
  kuota_total: 50,
  kuota_terisi: 0,
  waktu_buka: "2026-09-01T00:00:00+07:00",
  waktu_tutup: "2026-10-01T23:59:59+07:00",
  status: "buka",
  syarat_ketentuan: "1. Wajib memiliki akun anggota Cavallery aktif.\n2. 1 Akun anggota hanya dapat mengklaim maksimal 1 tiket.\n3. Tiket tidak dapat dipindahtangankan tanpa konfirmasi admin.",
};

let memoryWarEvent: any = { ...DEFAULT_WAR_EVENT };

export function updateMemoryWarEvent(event: any) {
  if (event) {
    memoryWarEvent = { ...memoryWarEvent, ...event };
  }
}

/**
 * Pastikan tabel-tabel database untuk War Tiket tersedia
 */
export async function ensureWarTiketTables(): Promise<void> {
  if (tablesEnsured) return;
  try {
    // 1. Tabel Master Event War Tiket
    await query(`
      CREATE TABLE IF NOT EXISTS war_tiket_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        kode_tiket VARCHAR(50) NOT NULL DEFAULT 'STS20',
        subjudul VARCHAR(255) NULL,
        lokasi_event VARCHAR(255) NULL,
        tanggal_event VARCHAR(100) NULL,
        kategori_tiket VARCHAR(100) NULL DEFAULT 'OFFICIAL VIP PASS • TEAM PASSION',
        deskripsi TEXT NULL,
        kuota_total INT NOT NULL DEFAULT 50,
        kuota_terisi INT NOT NULL DEFAULT 0,
        waktu_buka DATETIME NOT NULL,
        waktu_tutup DATETIME NOT NULL,
        status ENUM('draft', 'buka', 'tutup') NOT NULL DEFAULT 'buka',
        syarat_ketentuan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Safe migration untuk kolom baru jika tabel sudah ada sebelumnya
    try { await query("ALTER TABLE war_tiket_events ADD COLUMN kode_tiket VARCHAR(50) NOT NULL DEFAULT 'STS20'"); } catch {}
    try { await query("ALTER TABLE war_tiket_events ADD COLUMN subjudul VARCHAR(255) NULL"); } catch {}
    try { await query("ALTER TABLE war_tiket_events ADD COLUMN lokasi_event VARCHAR(255) NULL"); } catch {}
    try { await query("ALTER TABLE war_tiket_events ADD COLUMN tanggal_event VARCHAR(100) NULL"); } catch {}
    try { await query("ALTER TABLE war_tiket_events ADD COLUMN kategori_tiket VARCHAR(100) NULL DEFAULT 'OFFICIAL VIP PASS • TEAM PASSION'"); } catch {}

    // 2. Tabel Peserta / Pemenang War Tiket
    await query(`
      CREATE TABLE IF NOT EXISTS war_tiket_peserta (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        anggota_id INT NOT NULL,
        no_anggota VARCHAR(50) NOT NULL,
        nama_lengkap VARCHAR(255) NOT NULL,
        nomor_tiket VARCHAR(50) NOT NULL UNIQUE,
        waktu_klaim TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
        status ENUM('terkonfirmasi', 'dibatalkan') DEFAULT 'terkonfirmasi',
        catatan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_event_anggota (event_id, anggota_id),
        INDEX idx_event (event_id),
        INDEX idx_anggota (anggota_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Masukkan event perdana STS Erine jika tabel masih kosong
    const existing = await query<any[]>("SELECT id FROM war_tiket_events LIMIT 1");
    if (!existing || existing.length === 0) {
      const now = new Date();
      const openTime = new Date(now.getTime() - 10 * 60 * 1000); // Buka sejak 10 menit lalu
      const closeTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 hari

      const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

      await query(
        `INSERT INTO war_tiket_events 
         (judul, kode_tiket, subjudul, lokasi_event, tanggal_event, kategori_tiket, deskripsi, kuota_total, kuota_terisi, waktu_buka, waktu_tutup, status, syarat_ketentuan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'buka', ?)`,
        [
          "War Tiket Project STS Erine 20th",
          "STS20",
          "Cavallery • Official Fanbase Erine JKT48",
          "Theater JKT48, fX Sudirman Lt. 4",
          "Sabtu, 26 September 2026 • 19.00 WIB",
          "OFFICIAL VIP PASS • TEAM PASSION",
          "Akses khusus project perayaan Seitansai Catherina Vallencia (Erine) ke-20 bersama Cavallery Team Passion.",
          50,
          fmt(openTime),
          fmt(closeTime),
          "1. Wajib memiliki akun anggota Cavallery aktif.\n2. 1 Akun anggota hanya dapat mengklaim maksimal 1 tiket.\n3. Tiket tidak dapat dipindahtangankan tanpa konfirmasi admin.",
        ]
      );
    }
    tablesEnsured = true;
  } catch (err: any) {
    console.error("[WarTiket] ensureWarTiketTables error:", err?.message);
  }
}

/**
 * Mengambil event war tiket yang sedang aktif saat ini
 */
export async function getActiveWarEvent(): Promise<any> {
  if (!tablesEnsured) {
    await ensureWarTiketTables();
  }
  try {
    const rows = await query<any[]>(
      `SELECT *, NOW() AS server_time 
       FROM war_tiket_events 
       ORDER BY id DESC LIMIT 1`
    );
    if (rows && rows.length > 0) {
      memoryWarEvent = { ...rows[0] };
      return rows[0];
    }
  } catch (err) {
    console.error("[WarTiket] getActiveWarEvent query error:", err);
  }

  return memoryWarEvent || DEFAULT_WAR_EVENT;
}

/**
 * Cek apakah seorang anggota sudah mendapatkan tiket pada event ini
 */
export async function getMemberTicket(eventId: number, anggotaId: number): Promise<any | null> {
  try {
    const rows = await query<any[]>(
      `SELECT * FROM war_tiket_peserta 
       WHERE event_id = ? AND anggota_id = ? AND status = 'terkonfirmasi' 
       LIMIT 1`,
      [eventId, anggotaId]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0];
  } catch (err) {
    console.error("[WarTiket] getMemberTicket error:", err);
    return null;
  }
}

/**
 * Konversi waktu ke timestamp millisecond dengan dukungan zona waktu WIB (UTC+7)
 */
export function toTimestampMs(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const isoStr = formatToWibIso(val);
  const t = new Date(isoStr).getTime();
  return isNaN(t) ? 0 : t;
}

/**
 * Format string waktu agar ramah ISO-8601 dengan offset WIB (+07:00)
 */
export function formatToWibIso(val: any): string {
  if (!val) return "";
  if (val instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = val.getFullYear();
    const m = pad(val.getMonth() + 1);
    const d = pad(val.getDate());
    const h = pad(val.getHours());
    const mi = pad(val.getMinutes());
    const s = pad(val.getSeconds());
    return `${y}-${m}-${d}T${h}:${mi}:${s}+07:00`;
  }
  const str = String(val).trim();
  if (str.includes("+") || str.includes("Z")) return str;
  const iso = str.replace(" ", "T");
  if (iso.length === 16) return `${iso}:00+07:00`;
  if (iso.length === 19) return `${iso}+07:00`;
  return iso;
}

/**
 * Format string waktu agar aman disimpan ke kolom DATETIME MySQL (YYYY-MM-DD HH:MM:SS)
 */
export function formatForMySql(val: any): string {
  if (!val) return "";
  let str = String(val).trim().replace("T", " ");
  if (str.includes("+")) str = str.split("+")[0];
  if (str.includes("Z")) str = str.replace("Z", "");
  str = str.trim();
  if (str.length === 16) str += ":00";
  return str;
}

/**
 * Klaim tiket dengan transaksi atomik MySQL (Anti-Race Condition & Anti-Overselling)
 */
export async function claimWarTicket(
  eventId: number,
  anggotaId: number,
  noAnggota: string,
  namaLengkap: string
): Promise<{ success: boolean; message: string; ticket?: any }> {
  try {
    await ensureWarTiketTables();

    // 1. Cek apakah user sudah punya tiket di event ini
    const existingTicket = await getMemberTicket(eventId, anggotaId);
    if (existingTicket) {
      return {
        success: false,
        message: "Kamu sudah berhasil mendapatkan tiket untuk event ini!",
        ticket: existingTicket,
      };
    }

    // 2. Ambil info event
    const eventRows = await query<any[]>(
      "SELECT *, NOW() AS server_time FROM war_tiket_events WHERE id = ? LIMIT 1",
      [eventId]
    );
    if (!eventRows || eventRows.length === 0) {
      return { success: false, message: "Event war tiket tidak ditemukan" };
    }

    const ev = eventRows[0];
    const nowMs = Date.now();
    const openMs = toTimestampMs(ev.waktu_buka);
    const closeMs = toTimestampMs(ev.waktu_tutup);

    if (ev.status !== "buka") {
      return { success: false, message: "War tiket saat ini sedang ditutup oleh admin" };
    }

    if (openMs > 0 && nowMs < openMs) {
      return { success: false, message: "War tiket belum dibuka! Tunggu hingga hitung mundur selesai." };
    }

    if (closeMs > 0 && nowMs > closeMs) {
      return { success: false, message: "Periode war tiket untuk event ini telah berakhir." };
    }

    // 3. ATOMIC DECREMENT / INCREMENT: Pengurangan slot kuota secara atomik
    // Query ini hanya akan berhasil (affectedRows = 1) jika kuota_terisi masih < kuota_total
    const updateResult: any = await query(
      `UPDATE war_tiket_events 
       SET kuota_terisi = kuota_terisi + 1 
       WHERE id = ? 
         AND kuota_terisi < kuota_total 
         AND status = 'buka'`,
      [eventId]
    );

    if (!updateResult || updateResult.affectedRows === 0) {
      return {
        success: false,
        message: "Mohon maaf, kuota tiket sudah habis terisi!",
      };
    }

    // 4. Ambil kuota terisi saat ini untuk nomor tiket urut & prefix yang fleksibel
    const curEvent = await query<any[]>("SELECT kuota_terisi, kode_tiket FROM war_tiket_events WHERE id = ?", [eventId]);
    const currentQueue = curEvent?.[0]?.kuota_terisi || 1;
    const prefix = (curEvent?.[0]?.kode_tiket || ev.kode_tiket || "STS20").trim().toUpperCase();
    const nomorTiket = `${prefix}-${String(currentQueue).padStart(3, "0")}`;

    // 5. Simpan data peserta pemenang war tiket
    await query(
      `INSERT INTO war_tiket_peserta 
       (event_id, anggota_id, no_anggota, nama_lengkap, nomor_tiket, status)
       VALUES (?, ?, ?, ?, ?, 'terkonfirmasi')`,
      [eventId, anggotaId, noAnggota, namaLengkap, nomorTiket]
    );

    // Ambil data tiket yang baru saja dibuat
    const newTicket = await getMemberTicket(eventId, anggotaId);

    return {
      success: true,
      message: `Selamat! Kamu berhasil mendapatkan tiket nomor #${nomorTiket}!`,
      ticket: newTicket,
    };
  } catch (err: any) {
    console.error("[claimWarTicket Error]:", err?.message);
    if (err?.code === "ER_DUP_ENTRY") {
      return { success: false, message: "Kamu sudah terdaftar mendapatkan tiket ini." };
    }
    return { success: false, message: err?.message || "Terjadi kesalahan saat memproses klaim tiket." };
  }
}
