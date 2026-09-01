import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mysql";
import { getSetting } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipe } = body;

    if (!tipe || (tipe !== "anggota" && tipe !== "donatur")) {
      return NextResponse.json(
        { status: false, message: "Tipe pendaftaran tidak valid (harus anggota atau donatur)" },
        { status: 400 }
      );
    }

    // 1. Pendaftaran Anggota
    if (tipe === "anggota") {
      const isAnggotaOpen = (await getSetting("register_anggota_open", "1")) === "1";
      if (!isAnggotaOpen) {
        return NextResponse.json(
          { status: false, message: "Mohon maaf, pendaftaran anggota baru Cavallery saat ini sedang DITUTUP oleh Admin." },
          { status: 403 }
        );
      }
      const {
        noAnggota,
        namaLengkap,
        idLine,
        displayLine,
        discord,
        gender,
        domisili,
        kontakPlatform,
        kontakId,
      } = body;

      if (!noAnggota || !namaLengkap || !idLine || !gender || !domisili || !kontakPlatform || !kontakId) {
        return NextResponse.json(
          { status: false, message: "Semua kolom bertanda WAJIB termasuk Nomor Anggota harus diisi" },
          { status: 400 }
        );
      }

      const cleanNoAnggota = noAnggota.trim().toUpperCase();

      // Check existing Nomor Anggota
      const existingNo = await query<any[]>(
        "SELECT id FROM anggota WHERE UPPER(no_anggota) = UPPER(?) LIMIT 1",
        [cleanNoAnggota]
      );

      if (existingNo && existingNo.length > 0) {
        return NextResponse.json(
          { status: false, message: `Nomor Anggota ${cleanNoAnggota} sudah terdaftar. Silakan gunakan Nomor Anggota Anda yang lain atau hubungi admin.` },
          { status: 400 }
        );
      }

      // Check existing ID LINE
      const existingLine = await query<any[]>(
        "SELECT id FROM anggota WHERE LOWER(id_line) = LOWER(?) LIMIT 1",
        [idLine.trim().toLowerCase()]
      );

      if (existingLine && existingLine.length > 0) {
        return NextResponse.json(
          { status: false, message: "ID LINE ini sudah terdaftar sebagai anggota atau dalam antrean verifikasi" },
          { status: 400 }
        );
      }

      // Insert new anggota with specified noAnggota as 'pending'
      await query(
        `INSERT INTO anggota 
         (no_anggota, nama_lengkap, id_line, display_line, discord, gender, domisili, kontak_platform, kontak_id, status, jabatan) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'Anggota')`,
        [
          cleanNoAnggota,
          namaLengkap.trim(),
          idLine.trim(),
          displayLine?.trim() || null,
          discord?.trim() || null,
          gender,
          domisili.trim(),
          kontakPlatform,
          kontakId.trim(),
        ]
      );

      return NextResponse.json({
        status: true,
        message: `Pendaftaran berhasil untuk Nomor Anggota ${cleanNoAnggota}! Akun Anda sedang menunggu verifikasi oleh Admin Cavallery.`,
      });
    }

    // 2. Pendaftaran Donatur
    if (tipe === "donatur") {
      const isDonaturOpen = (await getSetting("register_donatur_open", "1")) === "1";
      if (!isDonaturOpen) {
        return NextResponse.json(
          { status: false, message: "Mohon maaf, pendaftaran donatur saat ini sedang DITUTUP oleh Admin." },
          { status: 403 }
        );
      }
      const { nama, kontakPlatform, kontakId, discord } = body;

      if (!nama || !kontakPlatform || !kontakId) {
        return NextResponse.json(
          { status: false, message: "Nama dan Kontak wajib diisi untuk pendaftaran donatur" },
          { status: 400 }
        );
      }

      await query(
        `INSERT INTO donatur (nama, kontak_platform, kontak_id, discord, status) 
         VALUES (?, ?, ?, ?, 'aktif')`,
        [nama.trim(), kontakPlatform, kontakId.trim(), discord?.trim() || null]
      );

      return NextResponse.json({
        status: true,
        message: "Pendaftaran donatur berhasil! Anda sekarang dapat masuk menggunakan Nama dan ID Kontak.",
      });
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan server saat pendaftaran" },
      { status: 500 }
    );
  }
}
