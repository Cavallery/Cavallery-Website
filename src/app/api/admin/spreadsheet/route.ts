import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { syncAllToSheets, appendAnggotaRow, appendKasRow, appendDonasiRow } from "@/lib/googleSheets";
import { query } from "@/lib/mysql";

// ── GET: Info Spreadsheet & Link Viewer ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbw8vF9qJQwjIZhvc5yPrl9hkI4cYrbWzBP1Mr9D8XutqqDddiH8dZa374_ZLy7Aftn7jA/exec";
    const sheetId = process.env.GOOGLE_SHEET_ID || "";
    const isConfigured = Boolean(appsScriptUrl);

    const sheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : null;
    const embedUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/preview?rm=minimal` : null;

    return NextResponse.json({
      status: true,
      data: {
        isConfigured,
        appsScriptUrl,
        sheetId,
        sheetUrl,
        embedUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error?.message }, { status: 500 });
  }
}

// ── POST: Trigger Full Sync dari MySQL ke Google Sheets (Anti-Duplikasi) ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    // 1. Ambil Semua Anggota Aktif (Diurutkan dari 0001)
    const anggotaList = (await query<any[]>(`
      SELECT * FROM anggota 
      WHERE status = 'aktif' 
      ORDER BY 
        CASE WHEN no_anggota IS NULL OR no_anggota = '' OR no_anggota = '-' THEN 1 ELSE 0 END,
        no_anggota ASC,
        id ASC
    `)) || [];

    const anggotaRows = anggotaList.map((a) => {
      const formattedDate = a.created_at
        ? new Date(a.created_at).toISOString().replace("T", " ").substring(0, 19)
        : "-";
      const formattedSejak = a.anggota_sejak
        ? new Date(a.anggota_sejak).toLocaleDateString("id-ID")
        : "-";
      return [
        a.no_anggota || "-",
        a.nama_lengkap,
        a.id_line,
        a.display_line || "-",
        a.discord || "-",
        a.gender || "-",
        a.domisili || "-",
        `${a.kontak_platform || "Kontak"}: ${a.kontak_id || a.id_line}`,
        a.status || "aktif",
        a.jabatan || "Anggota",
        formattedSejak,
        formattedDate,
      ];
    });

    // 2. Ambil Semua Kontributor Terdaftar
    const kontributorList = (await query<any[]>(`
      SELECT 
        d.id,
        d.nama,
        d.kontak_platform,
        d.kontak_id,
        d.discord,
        d.status,
        d.created_at,
        COALESCE(SUM(CASE WHEN kd.status = 'diverifikasi' THEN kd.nominal ELSE 0 END), 0) AS total_kontribusi
      FROM donatur d
      LEFT JOIN konfirmasi_donasi kd ON kd.donatur_id = d.id
      GROUP BY d.id
      ORDER BY d.id ASC
    `)) || [];

    const kontributorRows = kontributorList.map((c) => {
      const formattedDate = c.created_at
        ? new Date(c.created_at).toISOString().replace("T", " ").substring(0, 19)
        : "-";
      return [
        String(c.id),
        c.nama,
        c.kontak_platform || "X (Twitter)",
        c.kontak_id,
        c.discord || "-",
        c.status || "aktif",
        Number(c.total_kontribusi || 0),
        formattedDate,
      ];
    });

    // 3. Ambil Semua Kas Diverifikasi / Riwayat Kas
    const kasList = (await query<any[]>(`
      SELECT k.*, a.no_anggota, a.nama_lengkap, a.id_line 
      FROM konfirmasi_kas k
      JOIN anggota a ON k.anggota_id = a.id
      ORDER BY k.id ASC
    `)) || [];

    const kasRows = kasList.map((k) => {
      const formattedDate = k.created_at
        ? new Date(k.created_at).toISOString().replace("T", " ").substring(0, 19)
        : "-";
      return [
        String(k.id),
        k.no_anggota || "-",
        k.nama_lengkap,
        k.id_line,
        k.periode,
        Number(k.nominal),
        k.status,
        k.bukti_bayar_url,
        formattedDate,
      ];
    });

    // 4. Ambil Semua Donasi / Kontribusi
    const donasiList = (await query<any[]>(`
      SELECT d.*, 
        COALESCE(a.nama_lengkap, don.nama, 'Kontributor') AS donor_name,
        COALESCE(a.no_anggota, don.kontak_id, '-') AS donor_identitas,
        COALESCE(a.kontak_id, don.kontak_id, '-') AS donor_kontak,
        CASE WHEN a.id IS NOT NULL THEN 'Anggota' ELSE 'Kontributor' END AS donor_type
      FROM konfirmasi_donasi d
      LEFT JOIN anggota a ON d.anggota_id = a.id
      LEFT JOIN donatur don ON d.donatur_id = don.id
      ORDER BY d.id ASC
    `)) || [];

    const donasiRows = donasiList.map((d) => {
      const formattedDate = d.created_at
        ? new Date(d.created_at).toISOString().replace("T", " ").substring(0, 19)
        : "-";
      return [
        String(d.id),
        d.donor_type,
        d.donor_identitas,
        d.donor_name,
        d.donor_kontak,
        d.tipe_donasi,
        Number(d.nominal),
        d.status,
        d.bukti_bayar_url,
        formattedDate,
      ];
    });

    // Kirim sinkronisasi batch ke Google Apps Script (Replace data lama agar tidak duplikat)
    await syncAllToSheets({
      anggotaRows,
      kontributorRows,
      kasRows,
      donasiRows,
    });

    return NextResponse.json({
      status: true,
      message: `Full Backup Berhasil (Anti-Duplikat)! Data telah diperbarui: ${anggotaRows.length} Anggota, ${kontributorRows.length} Kontributor, ${kasRows.length} Data Kas, ${donasiRows.length} Data Kontribusi ke Google Spreadsheet.`,
      synced: {
        anggota: anggotaRows.length,
        kontributor: kontributorRows.length,
        kas: kasRows.length,
        donasi: donasiRows.length,
      },
    });
  } catch (error: any) {
    console.error("Full sync spreadsheet error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal melakukan sinkronisasi ke spreadsheet" },
      { status: 500 }
    );
  }
}
