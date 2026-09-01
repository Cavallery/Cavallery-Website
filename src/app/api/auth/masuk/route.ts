import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, setSessionCookie } from "@/lib/auth";
import { query } from "@/lib/mysql";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipe } = body;

    if (!tipe || (tipe !== "anggota" && tipe !== "donatur")) {
      return NextResponse.json(
        { status: false, message: "Tipe login tidak valid" },
        { status: 400 }
      );
    }

    // 1. Login Anggota: No. Anggota + ID LINE
    if (tipe === "anggota") {
      const { noAnggota, idLine } = body;

      if (!noAnggota || !idLine) {
        return NextResponse.json(
          { status: false, message: "Nomor Anggota dan ID LINE wajib diisi" },
          { status: 400 }
        );
      }

      const rows = await query<any[]>(
        "SELECT * FROM anggota WHERE LOWER(no_anggota) = LOWER(?) LIMIT 1",
        [noAnggota.trim()]
      );

      const anggota = rows && rows.length > 0 ? rows[0] : null;

      if (!anggota) {
        return NextResponse.json(
          { status: false, message: "Nomor Anggota tidak ditemukan. Pastikan format penulisan benar (cth: CAVA-0001)." },
          { status: 404 }
        );
      }

      // Check ID LINE match (case insensitive)
      if (anggota.id_line.trim().toLowerCase() !== idLine.trim().toLowerCase()) {
        return NextResponse.json(
          { status: false, message: "ID LINE tidak cocok dengan Nomor Anggota yang dimasukkan." },
          { status: 401 }
        );
      }

      // Check Status
      if (anggota.status === "pending") {
        return NextResponse.json(
          { status: false, message: "Akun Anda masih dalam antrean verifikasi Admin Cavallery. Mohon menunggu konfirmasi." },
          { status: 403 }
        );
      }

      if (anggota.status === "nonaktif" || anggota.status === "ditolak") {
        return NextResponse.json(
          { status: false, message: "Status keanggotaan Anda saat ini tidak aktif. Silakan hubungi admin Cavallery." },
          { status: 403 }
        );
      }

      // Generate Session Token
      const token = signSessionToken({
        id: anggota.id,
        noAnggota: anggota.no_anggota,
        nama: anggota.nama_lengkap,
        type: "anggota",
      });

      const res = NextResponse.json({
        status: true,
        message: `Selamat datang kembali, ${anggota.nama_lengkap}!`,
        user: {
          id: anggota.id,
          noAnggota: anggota.no_anggota,
          nama: anggota.nama_lengkap,
          type: "anggota",
        },
      });

      setSessionCookie(res, token);
      return res;
    }

    // 2. Login Donatur: Nama + ID Kontak
    if (tipe === "donatur") {
      const { nama, kontakId } = body;

      if (!nama || !kontakId) {
        return NextResponse.json(
          { status: false, message: "Nama dan ID / Nomor Kontak wajib diisi" },
          { status: 400 }
        );
      }

      const rows = await query<any[]>(
        "SELECT * FROM donatur WHERE LOWER(nama) = LOWER(?) AND LOWER(kontak_id) = LOWER(?) LIMIT 1",
        [nama.trim(), kontakId.trim()]
      );

      const donatur = rows && rows.length > 0 ? rows[0] : null;

      if (!donatur) {
        return NextResponse.json(
          { status: false, message: "Data donatur tidak ditemukan. Pastikan Nama dan Kontak sesuai dengan saat pendaftaran." },
          { status: 404 }
        );
      }

      const token = signSessionToken({
        id: donatur.id,
        nama: donatur.nama,
        type: "donatur",
      });

      const res = NextResponse.json({
        status: true,
        message: `Selamat datang kembali, ${donatur.nama}!`,
        user: {
          id: donatur.id,
          nama: donatur.nama,
          type: "donatur",
        },
      });

      setSessionCookie(res, token);
      return res;
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan pada server saat login" },
      { status: 500 }
    );
  }
}
