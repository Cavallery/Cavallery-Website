import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { appendDonasiRow } from "@/lib/googleSheets";
import { query } from "@/lib/mysql";

// ── GET: Leaderboard donasi & riwayat donasi user ──
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Leaderboard Publik: Donasi Terverifikasi
    if (type === "leaderboard") {
      const rows = (await query<any[]>(`
        SELECT 
          d.id,
          d.tipe_donasi,
          d.nominal,
          d.created_at,
          COALESCE(a.nama_lengkap, don.nama, 'Ksatria Cavallery') AS donor_name,
          CASE WHEN a.id IS NOT NULL THEN 'Anggota' ELSE 'Donatur' END AS donor_type
        FROM konfirmasi_donasi d
        LEFT JOIN anggota a ON d.anggota_id = a.id
        LEFT JOIN donatur don ON d.donatur_id = don.id
        WHERE d.status = 'diverifikasi'
        ORDER BY d.nominal DESC
        LIMIT 50
      `)) || [];

      return NextResponse.json({
        status: true,
        data: rows,
      });
    }

    // Riwayat Donasi User yang sedang login
    const session = getUserSessionFromReq(req);
    if (!session) {
      return NextResponse.json(
        { status: false, message: "Sesi tidak ditemukan" },
        { status: 401 }
      );
    }

    const filterSql =
      session.type === "anggota"
        ? "SELECT * FROM konfirmasi_donasi WHERE anggota_id = ? ORDER BY id DESC"
        : "SELECT * FROM konfirmasi_donasi WHERE donatur_id = ? ORDER BY id DESC";

    const rows = (await query<any[]>(filterSql, [session.id])) || [];

    return NextResponse.json({
      status: true,
      data: rows,
    });
  } catch (error: any) {
    console.error("Get donasi error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat data donasi" },
      { status: 500 }
    );
  }
}

// ── POST: Kirim konfirmasi donasi ──
export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session) {
      return NextResponse.json(
        { status: false, message: "Anda harus masuk sebagai Anggota atau Donatur untuk mengirim donasi" },
        { status: 401 }
      );
    }

    const { tipeDonasi, nominal, buktiBayarUrl } = await req.json();

    if (!nominal || !buktiBayarUrl) {
      return NextResponse.json(
        { status: false, message: "Nominal dan bukti transfer wajib diisi" },
        { status: 400 }
      );
    }

    const anggotaId = session.type === "anggota" ? session.id : null;
    const donaturId = session.type === "donatur" ? session.id : null;
    const selectedTipeDonasi = tipeDonasi || "General Support";

    // 1. Simpan ke Database
    const insertRes: any = await query(
      `INSERT INTO konfirmasi_donasi (anggota_id, donatur_id, tipe_donasi, nominal, bukti_bayar_url, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [anggotaId, donaturId, selectedTipeDonasi, Number(nominal), buktiBayarUrl.trim()]
    );

    const insertedId = insertRes?.insertId;

    // 2. Fire-and-forget: Push ke Google Sheets Tab "Donasi"
    appendDonasiRow({
      id: insertedId || 0,
      tipeDonatur: session.type === "anggota" ? "Anggota" : "Donatur",
      identitas: session.noAnggota || session.kontakId || session.nama,
      nama: session.nama,
      kontak: session.kontakId || session.idLine || "-",
      tipeDonasi: selectedTipeDonasi,
      nominal: Number(nominal),
      status: "pending",
      buktiBayarUrl,
      createdAt: new Date(),
    }).catch((err) => console.error("Background Google Sheet Donasi error:", err));

    return NextResponse.json({
      status: true,
      message: "Konfirmasi donasi berhasil dikirim! Terima kasih atas dukungan Anda untuk Erine.",
    });
  } catch (error: any) {
    console.error("Donasi submission error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan saat memproses donasi" },
      { status: 500 }
    );
  }
}
