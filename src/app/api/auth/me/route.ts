import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

export async function GET(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session) {
      return NextResponse.json(
        { status: false, message: "Sesi tidak ditemukan atau telah kedaluwarsa" },
        { status: 401 }
      );
    }

    if (session.type === "anggota") {
      const rows = await query<any[]>(
        "SELECT * FROM anggota WHERE id = ? LIMIT 1",
        [session.id]
      );

      const anggota = rows && rows.length > 0 ? rows[0] : null;

      if (!anggota) {
        return NextResponse.json({ status: false, message: "Data anggota tidak ditemukan" }, { status: 404 });
      }

      // Fetch kas history
      const kasList = (await query<any[]>(
        "SELECT * FROM konfirmasi_kas WHERE anggota_id = ? ORDER BY id DESC",
        [anggota.id]
      )) || [];

      // Fetch donasi history
      const donasiList = (await query<any[]>(
        "SELECT * FROM konfirmasi_donasi WHERE anggota_id = ? ORDER BY id DESC",
        [anggota.id]
      )) || [];

      // Calculate verified kas & donasi totals
      const totalKasVerified = kasList
        .filter((k: any) => k.status === "diverifikasi")
        .reduce((sum: number, k: any) => sum + Number(k.nominal || 0), 0);

      const totalDonasiVerified = donasiList
        .filter((d: any) => d.status === "diverifikasi")
        .reduce((sum: number, d: any) => sum + Number(d.nominal || 0), 0);

      return NextResponse.json({
        status: true,
        user: {
          type: "anggota",
          id: anggota.id,
          noAnggota: anggota.no_anggota,
          namaLengkap: anggota.nama_lengkap,
          idLine: anggota.id_line,
          displayLine: anggota.display_line,
          discord: anggota.discord,
          gender: anggota.gender,
          domisili: anggota.domisili,
          kontakPlatform: anggota.kontak_platform,
          kontakId: anggota.kontak_id,
          status: anggota.status,
          jabatan: anggota.jabatan,
          divisi: anggota.divisi || null,
          fotoProfil: anggota.foto_profil || null,
          foto_profil: anggota.foto_profil || null,
          anggotaSejak: anggota.anggota_sejak,
          createdAt: anggota.created_at,
          totalKasVerified,
          totalDonasiVerified,
          riwayatKas: kasList,
          riwayatDonasi: donasiList,
        },
      });
    } else {
      const rows = await query<any[]>(
        "SELECT * FROM donatur WHERE id = ? LIMIT 1",
        [session.id]
      );

      const donatur = rows && rows.length > 0 ? rows[0] : null;

      if (!donatur) {
        return NextResponse.json({ status: false, message: "Data donatur tidak ditemukan" }, { status: 404 });
      }

      const donasiList = (await query<any[]>(
        "SELECT * FROM konfirmasi_donasi WHERE donatur_id = ? ORDER BY id DESC",
        [donatur.id]
      )) || [];

      const totalDonasiVerified = donasiList
        .filter((d: any) => d.status === "diverifikasi")
        .reduce((sum: number, d: any) => sum + Number(d.nominal || 0), 0);

      return NextResponse.json({
        status: true,
        user: {
          type: "donatur",
          id: donatur.id,
          nama: donatur.nama,
          kontakPlatform: donatur.kontak_platform,
          kontakId: donatur.kontak_id,
          discord: donatur.discord,
          status: donatur.status,
          createdAt: donatur.created_at,
          totalDonasiVerified,
          riwayatDonasi: donasiList,
        },
      });
    }
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan saat memuat profil" },
      { status: 500 }
    );
  }
}
