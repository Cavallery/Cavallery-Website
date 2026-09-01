import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { appendKasRow } from "@/lib/googleSheets";
import { query } from "@/lib/mysql";

// ── GET: Ambil riwayat kas user yang sedang login ──
export async function GET(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Hanya anggota yang dapat mengakses riwayat kas" },
        { status: 401 }
      );
    }

    const rows = await query<any[]>(
      "SELECT * FROM konfirmasi_kas WHERE anggota_id = ? ORDER BY id DESC",
      [session.id]
    );

    return NextResponse.json({
      status: true,
      data: rows || [],
    });
  } catch (error: any) {
    console.error("Get kas history error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat riwayat kas" },
      { status: 500 }
    );
  }
}

// ── POST: Kirim konfirmasi pembayaran kas ──
export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Hanya anggota resmi yang dapat melakukan pembayaran kas" },
        { status: 401 }
      );
    }

    const { periode, nominal, buktiBayarUrl } = await req.json();

    if (!periode || !nominal || !buktiBayarUrl) {
      return NextResponse.json(
        { status: false, message: "Periode, nominal, dan bukti bayar wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Simpan ke Database
    const insertRes: any = await query(
      `INSERT INTO konfirmasi_kas (anggota_id, periode, nominal, bukti_bayar_url, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [session.id, periode.trim(), Number(nominal), buktiBayarUrl.trim()]
    );

    const insertedId = insertRes?.insertId;

    // 2. Fetch data anggota untuk Google Sheets
    const anggotaRows = await query<any[]>(
      "SELECT * FROM anggota WHERE id = ? LIMIT 1",
      [session.id]
    );
    const anggota = anggotaRows && anggotaRows.length > 0 ? anggotaRows[0] : null;

    if (anggota) {
      // 3. Fire-and-forget: Push ke Google Sheets Tab "Kas"
      appendKasRow({
        id: insertedId || 0,
        noAnggota: anggota.no_anggota || "-",
        namaAnggota: anggota.nama_lengkap,
        idLine: anggota.id_line,
        periode,
        nominal: Number(nominal),
        status: "pending",
        buktiBayarUrl,
        createdAt: new Date(),
      }).catch((err) => console.error("Background Google Sheet Kas error:", err));
    }

    return NextResponse.json({
      status: true,
      message: "Konfirmasi pembayaran kas berhasil dikirim! Menunggu verifikasi admin.",
    });
  } catch (error: any) {
    console.error("Kas submission error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan saat memproses kas" },
      { status: 500 }
    );
  }
}
