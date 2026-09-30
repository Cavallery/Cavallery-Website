import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const GATHERING_JSON_PATH = path.join(DATA_DIR, "gathering-presensi.json");
const ORIGINAL_DATA_PATH = path.join(process.cwd(), "src", "data", "gathering-presensi.json");

export const dynamic = "force-dynamic";

export interface GatheringAttendanceItem {
  id: number | string;
  anggota_id?: number | null;
  no_anggota: string;
  nama_lengkap: string;
  domisili?: string | null;
  id_line?: string | null;
  kontak_platform?: string | null;
  kontak_id?: string | null;
  badge?: string;
  status_keanggotaan?: string;
  nama_event: string;
  waktu_hadir: string;
  metode_checkin?: "qr_scan" | "manual";
  catatan?: string | null;
  foto_profil?: string | null;
}

function ensureDataDirectory() {
  const dir = path.dirname(GATHERING_JSON_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonAttendance(): GatheringAttendanceItem[] {
  ensureDataDirectory();
  if (fs.existsSync(GATHERING_JSON_PATH)) {
    try {
      const content = fs.readFileSync(GATHERING_JSON_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error reading gathering-presensi.json:", e);
    }
  }
  if (isVercel && fs.existsSync(ORIGINAL_DATA_PATH)) {
    try {
      const content = fs.readFileSync(ORIGINAL_DATA_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        fs.writeFileSync(GATHERING_JSON_PATH, content, "utf-8");
        return parsed;
      }
    } catch {}
  }
  return [];
}

function writeJsonAttendance(data: GatheringAttendanceItem[]) {
  ensureDataDirectory();
  const formatted = JSON.stringify(data, null, 2);
  fs.writeFileSync(GATHERING_JSON_PATH, formatted, "utf-8");
  if (!isVercel && ORIGINAL_DATA_PATH !== GATHERING_JSON_PATH) {
    try {
      fs.writeFileSync(ORIGINAL_DATA_PATH, formatted, "utf-8");
    } catch {}
  }
}

let tableEnsured = false;
async function ensureGatheringTable() {
  if (tableEnsured || !isMySqlConfigured()) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`gathering_presensi\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`anggota_id\` INT DEFAULT NULL,
        \`no_anggota\` VARCHAR(50) NOT NULL,
        \`nama_lengkap\` VARCHAR(150) NOT NULL,
        \`domisili\` VARCHAR(100) DEFAULT NULL,
        \`id_line\` VARCHAR(100) DEFAULT NULL,
        \`kontak_platform\` VARCHAR(50) DEFAULT NULL,
        \`kontak_id\` VARCHAR(100) DEFAULT NULL,
        \`badge\` VARCHAR(50) DEFAULT 'squire',
        \`status_keanggotaan\` VARCHAR(50) DEFAULT 'aktif',
        \`nama_event\` VARCHAR(150) NOT NULL DEFAULT 'Gathering Offline Cavallery 2026',
        \`waktu_hadir\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`metode_checkin\` ENUM('qr_scan', 'manual') DEFAULT 'qr_scan',
        \`catatan\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_no_anggota\` (\`no_anggota\`),
        INDEX \`idx_nama_event\` (\`nama_event\`),
        INDEX \`idx_waktu_hadir\` (\`waktu_hadir\`),
        INDEX \`idx_anggota_id\` (\`anggota_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableEnsured = true;
  } catch (err: any) {
    console.error("ensureGatheringTable error:", err.message);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get("event") || "Gathering Offline Cavallery 2026";

    let attendees: GatheringAttendanceItem[] = [];
    let membersDirectory: any[] = [];
    let totalAnggota = 0;

    if (isMySqlConfigured()) {
      await ensureGatheringTable();

      // 1. Fetch attendee records with member photo if available
      const rows = await query<any[]>(
        `SELECT gp.*, a.foto_profil 
         FROM gathering_presensi gp
         LEFT JOIN anggota a ON gp.anggota_id = a.id OR gp.no_anggota = a.no_anggota
         WHERE gp.nama_event = ?
         ORDER BY gp.waktu_hadir DESC`,
        [eventName]
      );

      if (rows) {
        attendees = rows.map((r) => ({
          id: r.id,
          anggota_id: r.anggota_id,
          no_anggota: r.no_anggota,
          nama_lengkap: r.nama_lengkap,
          domisili: r.domisili,
          id_line: r.id_line,
          kontak_platform: r.kontak_platform,
          kontak_id: r.kontak_id,
          badge: r.badge || "squire",
          status_keanggotaan: r.status_keanggotaan || "aktif",
          nama_event: r.nama_event,
          waktu_hadir: r.waktu_hadir ? new Date(r.waktu_hadir).toISOString() : new Date().toISOString(),
          metode_checkin: r.metode_checkin || "qr_scan",
          catatan: r.catatan,
          foto_profil: r.foto_profil || null,
        }));
      }

      // 2. Fetch all registered members for fast manual check-in search
      const memberRows = await query<any[]>(
        `SELECT id, no_anggota, nama_lengkap, domisili, id_line, badge, status, foto_profil, public_code 
         FROM anggota 
         ORDER BY nama_lengkap ASC`
      );
      if (memberRows) {
        membersDirectory = memberRows;
        totalAnggota = memberRows.length;
      }
    } else {
      // Fallback JSON
      const allJson = readJsonAttendance();
      attendees = allJson.filter((item) => item.nama_event === eventName);
      totalAnggota = attendees.length;
    }

    // Hitung statistik kehadiran
    const totalHadir = attendees.length;
    const perBadge: Record<string, number> = {};
    for (const a of attendees) {
      const b = (a.badge || "squire").toLowerCase();
      perBadge[b] = (perBadge[b] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      eventName,
      data: attendees,
      stats: {
        totalHadir,
        totalAnggota,
        perBadge,
      },
      members: membersDirectory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data presensi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || "checkin";
    const eventName = body.eventName || "Gathering Offline Cavallery 2026";

    await ensureGatheringTable();

    // ── 1. CHECK-IN SCAN QR ──
    if (action === "checkin" || action === "scan") {
      const rawInput = String(body.qrData || body.code || "").trim();
      if (!rawInput) {
        return NextResponse.json(
          { success: false, status: "error", message: "Data scan QR kosong atau tidak terbaca." },
          { status: 400 }
        );
      }

      // Parsing QR Data
      // Kemungkinan format:
      // A. URL: https://cavallery.site/v/KODE_PUBLIK atau /v/KODE_PUBLIK
      // B. Nomor Anggota langsung: CAVA-0042
      // C. Public code mentah: 8-12 karakter acak
      let parsedPublicCode = "";
      let parsedNoAnggota = "";

      const matchUrl = rawInput.match(/\/v\/([^/?#]+)/i);
      if (matchUrl && matchUrl[1]) {
        parsedPublicCode = matchUrl[1].trim();
      } else if (/^CAVA-\d+/i.test(rawInput)) {
        parsedNoAnggota = rawInput.toUpperCase().trim();
      } else {
        parsedPublicCode = rawInput;
      }

      // Cari anggota di database
      let member: any = null;
      if (isMySqlConfigured()) {
        const rows = await query<any[]>(
          `SELECT id, no_anggota, nama_lengkap, domisili, id_line, kontak_platform, kontak_id, badge, status, foto_profil, public_code
           FROM anggota
           WHERE (public_code IS NOT NULL AND public_code != '' AND public_code = ?)
              OR no_anggota = ?
              OR no_anggota = ?
           LIMIT 1`,
          [parsedPublicCode, parsedNoAnggota || parsedPublicCode, rawInput]
        );
        if (rows && rows.length > 0) {
          member = rows[0];
        }
      }

      // Jika anggota tidak ditemukan di MySQL, cari di JSON fallback jika ada
      if (!member) {
        return NextResponse.json(
          {
            success: false,
            status: "notfound",
            message: `KTA tidak terdaftar di sistem fanbase (${rawInput})`,
          },
          { status: 404 }
        );
      }

      const noAnggota = member.no_anggota || "CAVA-MEMBER";
      const anggotaId = member.id || null;
      const namaLengkap = member.nama_lengkap || "Anggota Cavallery";

      // Cek apakah sudah check-in di event ini
      let alreadyCheckedIn = false;
      let existingRecord: any = null;

      if (isMySqlConfigured()) {
        const existingRows = await query<any[]>(
          `SELECT * FROM gathering_presensi 
           WHERE (no_anggota = ? OR (anggota_id IS NOT NULL AND anggota_id = ?)) 
             AND nama_event = ? 
           LIMIT 1`,
          [noAnggota, anggotaId, eventName]
        );
        if (existingRows && existingRows.length > 0) {
          alreadyCheckedIn = true;
          existingRecord = existingRows[0];
        }
      } else {
        const allJson = readJsonAttendance();
        existingRecord = allJson.find(
          (j) => (j.no_anggota === noAnggota || j.anggota_id === anggotaId) && j.nama_event === eventName
        );
        if (existingRecord) alreadyCheckedIn = true;
      }

      if (alreadyCheckedIn) {
        const checkinTime = existingRecord?.waktu_hadir
          ? new Date(existingRecord.waktu_hadir).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : "";
        return NextResponse.json({
          success: false,
          status: "already",
          message: `${namaLengkap} sudah pernah check-in sebelumnya${checkinTime ? ` pukul ${checkinTime} WIB` : ""}!`,
          item: {
            ...existingRecord,
            foto_profil: member.foto_profil,
          },
        });
      }

      // Lakukan insert kehadiran
      const nowIso = new Date().toISOString();
      const nowSql = new Date().toISOString().slice(0, 19).replace("T", " ");
      let newId: number | string = Date.now();

      if (isMySqlConfigured()) {
        const insertRes: any = await query(
          `INSERT INTO gathering_presensi 
           (anggota_id, no_anggota, nama_lengkap, domisili, id_line, kontak_platform, kontak_id, badge, status_keanggotaan, nama_event, waktu_hadir, metode_checkin, catatan)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'qr_scan', ?)`,
          [
            anggotaId,
            noAnggota,
            namaLengkap,
            member.domisili || null,
            member.id_line || null,
            member.kontak_platform || null,
            member.kontak_id || null,
            member.badge || "squire",
            member.status || "aktif",
            eventName,
            nowSql,
            body.catatan || null,
          ]
        );
        if (insertRes && insertRes.insertId) {
          newId = insertRes.insertId;
        }
      }

      const newAttendee: GatheringAttendanceItem = {
        id: newId,
        anggota_id: anggotaId,
        no_anggota: noAnggota,
        nama_lengkap: namaLengkap,
        domisili: member.domisili || null,
        id_line: member.id_line || null,
        kontak_platform: member.kontak_platform || null,
        kontak_id: member.kontak_id || null,
        badge: member.badge || "squire",
        status_keanggotaan: member.status || "aktif",
        nama_event: eventName,
        waktu_hadir: nowIso,
        metode_checkin: "qr_scan",
        catatan: body.catatan || null,
        foto_profil: member.foto_profil || null,
      };

      // Simpan juga ke JSON
      const jsonList = readJsonAttendance();
      jsonList.unshift(newAttendee);
      writeJsonAttendance(jsonList);

      return NextResponse.json({
        success: true,
        status: "success",
        message: `${namaLengkap} (${noAnggota}) berhasil presensi!`,
        item: newAttendee,
      });
    }

    // ── 2. MANUAL CHECK-IN ──
    if (action === "manual_checkin") {
      const { memberId, noAnggotaInput, namaLengkapInput, catatan } = body;

      let member: any = null;
      if (isMySqlConfigured()) {
        if (memberId) {
          const rows = await query<any[]>("SELECT * FROM anggota WHERE id = ? LIMIT 1", [memberId]);
          if (rows && rows.length > 0) member = rows[0];
        } else if (noAnggotaInput) {
          const rows = await query<any[]>("SELECT * FROM anggota WHERE no_anggota = ? LIMIT 1", [noAnggotaInput]);
          if (rows && rows.length > 0) member = rows[0];
        }
      }

      const noAnggota = member ? member.no_anggota : (noAnggotaInput || "CAVA-GUEST");
      const namaLengkap = member ? member.nama_lengkap : (namaLengkapInput || "Tamu Gathering");
      const anggotaId = member ? member.id : null;

      // Cek apakah sudah pernah check-in
      if (isMySqlConfigured()) {
        const check = await query<any[]>(
          `SELECT * FROM gathering_presensi WHERE no_anggota = ? AND nama_event = ? LIMIT 1`,
          [noAnggota, eventName]
        );
        if (check && check.length > 0) {
          return NextResponse.json({
            success: false,
            status: "already",
            message: `${namaLengkap} sudah terdaftar hadir di event ini!`,
            item: check[0],
          });
        }
      }

      const nowIso = new Date().toISOString();
      const nowSql = new Date().toISOString().slice(0, 19).replace("T", " ");
      let newId: number | string = Date.now();

      if (isMySqlConfigured()) {
        const insertRes: any = await query(
          `INSERT INTO gathering_presensi 
           (anggota_id, no_anggota, nama_lengkap, domisili, id_line, kontak_platform, kontak_id, badge, status_keanggotaan, nama_event, waktu_hadir, metode_checkin, catatan)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?)`,
          [
            anggotaId,
            noAnggota,
            namaLengkap,
            member?.domisili || null,
            member?.id_line || null,
            member?.kontak_platform || null,
            member?.kontak_id || null,
            member?.badge || "squire",
            member?.status || "aktif",
            eventName,
            nowSql,
            catatan || null,
          ]
        );
        if (insertRes && insertRes.insertId) newId = insertRes.insertId;
      }

      const item: GatheringAttendanceItem = {
        id: newId,
        anggota_id: anggotaId,
        no_anggota: noAnggota,
        nama_lengkap: namaLengkap,
        domisili: member?.domisili || null,
        id_line: member?.id_line || null,
        kontak_platform: member?.kontak_platform || null,
        kontak_id: member?.kontak_id || null,
        badge: member?.badge || "squire",
        status_keanggotaan: member?.status || "aktif",
        nama_event: eventName,
        waktu_hadir: nowIso,
        metode_checkin: "manual",
        catatan: catatan || null,
        foto_profil: member?.foto_profil || null,
      };

      const jsonList = readJsonAttendance();
      jsonList.unshift(item);
      writeJsonAttendance(jsonList);

      return NextResponse.json({
        success: true,
        status: "success",
        message: `${namaLengkap} berhasil dicatat hadir secara manual.`,
        item,
      });
    }

    // ── 3. HAPUS / BATALKAN CHECK-IN ──
    if (action === "delete") {
      const targetId = body.id;
      if (!targetId) {
        return NextResponse.json({ success: false, message: "ID presensi diperlukan." }, { status: 400 });
      }

      if (isMySqlConfigured()) {
        await query("DELETE FROM gathering_presensi WHERE id = ?", [targetId]);
      }

      let jsonList = readJsonAttendance();
      jsonList = jsonList.filter((j) => String(j.id) !== String(targetId));
      writeJsonAttendance(jsonList);

      return NextResponse.json({ success: true, message: "Presensi berhasil dihapus." });
    }

    // ── 4. RESET SEMUA PRESENSI EVENT ──
    if (action === "reset") {
      if (isMySqlConfigured()) {
        await query("DELETE FROM gathering_presensi WHERE nama_event = ?", [eventName]);
      }
      let jsonList = readJsonAttendance();
      jsonList = jsonList.filter((j) => j.nama_event !== eventName);
      writeJsonAttendance(jsonList);

      return NextResponse.json({ success: true, message: "Seluruh data presensi event berhasil di-reset." });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error: any) {
    console.error("Presensi API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
