import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { appendAnggotaRow, appendKasRow, appendDonasiRow } from "@/lib/googleSheets";
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

// ── POST: Trigger Full Sync dari MySQL ke Google Sheets ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    // 1. Sync Anggota Aktif
    const anggotaList = (await query<any[]>(
      "SELECT * FROM anggota WHERE status = 'aktif' ORDER BY id ASC"
    )) || [];

    let countAnggota = 0;
    for (const a of anggotaList) {
      await appendAnggotaRow({
        noAnggota: a.no_anggota || "-",
        namaLengkap: a.nama_lengkap,
        idLine: a.id_line,
        displayLine: a.display_line,
        discord: a.discord,
        gender: a.gender,
        domisili: a.domisili,
        kontakPlatform: a.kontak_platform,
        kontakId: a.kontak_id,
        status: a.status,
        jabatan: a.jabatan,
        anggotaSejak: a.anggota_sejak,
        createdAt: a.created_at,
      });
      countAnggota++;
    }

    // 2. Sync Kas
    const kasList = (await query<any[]>(`
      SELECT k.*, a.no_anggota, a.nama_lengkap, a.id_line 
      FROM konfirmasi_kas k
      JOIN anggota a ON k.anggota_id = a.id
      ORDER BY k.id ASC
    `)) || [];

    let countKas = 0;
    for (const k of kasList) {
      await appendKasRow({
        id: k.id,
        noAnggota: k.no_anggota || "-",
        namaAnggota: k.nama_lengkap,
        idLine: k.id_line,
        periode: k.periode,
        nominal: Number(k.nominal),
        status: k.status,
        buktiBayarUrl: k.bukti_bayar_url,
        createdAt: k.created_at,
      });
      countKas++;
    }

    // 3. Sync Donasi
    const donasiList = (await query<any[]>(`
      SELECT d.*, 
        COALESCE(a.nama_lengkap, don.nama, 'Donatur') AS donor_name,
        COALESCE(a.no_anggota, don.kontak_id, '-') AS donor_identitas,
        COALESCE(a.kontak_id, don.kontak_id, '-') AS donor_kontak,
        CASE WHEN a.id IS NOT NULL THEN 'Anggota' ELSE 'Donatur' END AS donor_type
      FROM konfirmasi_donasi d
      LEFT JOIN anggota a ON d.anggota_id = a.id
      LEFT JOIN donatur don ON d.donatur_id = don.id
      ORDER BY d.id ASC
    `)) || [];

    let countDonasi = 0;
    for (const d of donasiList) {
      await appendDonasiRow({
        id: d.id,
        tipeDonatur: d.donor_type as any,
        identitas: d.donor_identitas,
        nama: d.donor_name,
        kontak: d.donor_kontak,
        tipeDonasi: d.tipe_donasi,
        nominal: Number(d.nominal),
        status: d.status,
        buktiBayarUrl: d.bukti_bayar_url,
        createdAt: d.created_at,
      });
      countDonasi++;
    }

    return NextResponse.json({
      status: true,
      message: `Full Backup Berhasil! Disinkronkan: ${countAnggota} Anggota, ${countKas} Data Kas, ${countDonasi} Data Donasi ke Google Spreadsheet.`,
      synced: {
        anggota: countAnggota,
        kas: countKas,
        donasi: countDonasi,
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
