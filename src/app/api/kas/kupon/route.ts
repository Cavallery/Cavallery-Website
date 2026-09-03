import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

export async function GET(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json({ status: false, message: "Hanya anggota resmi yang dapat melihat kupon kas" }, { status: 401 });
    }

    // Ambil seluruh kupon yang dibagikan ke anggota ini
    const kupons = (await query<any[]>(`
      SELECT 
        ka.id AS kupon_anggota_id,
        ka.status AS status_kupon,
        ka.bulan_terbayar,
        ka.digunakan_pada,
        k.id AS kupon_id,
        k.kode_kupon,
        k.judul,
        k.deskripsi,
        k.tipe_reward,
        k.nilai_reward,
        k.min_bulan_kas,
        k.tahun_kas,
        k.kadaluarsa_pada,
        k.created_at
      FROM kupon_anggota ka
      JOIN kupon k ON ka.kupon_id = k.id
      WHERE ka.anggota_id = ?
      ORDER BY ka.created_at DESC
    `, [session.id])) || [];

    // Ambil info pembayaran kas tahun ini untuk user
    const currentYear = new Date().getFullYear();
    const kasRows = (await query<any[]>(`
      SELECT COUNT(DISTINCT bulan) AS total_lunas
      FROM iuran_kas_bulanan
      WHERE anggota_id = ? AND tahun = ? AND status = 'diverifikasi'
    `, [session.id, currentYear])) || [];

    const totalLunasTahunIni = Number(kasRows[0]?.total_lunas || 0);

    return NextResponse.json({
      status: true,
      data: kupons,
      totalLunasTahunIni,
      currentYear,
    });
  } catch (error: any) {
    console.error("GET user kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat kupon" }, { status: 500 });
  }
}
