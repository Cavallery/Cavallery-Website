import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import { syncCouponsForMember, getAnggotaBulanLunas } from "@/lib/kuponHelper";

export async function GET(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json({ status: false, message: "Hanya anggota resmi yang dapat melihat kupon kas" }, { status: 401 });
    }

    // 1. AUTO-CLAIM & SINKRONISASI REALTIME:
    // Jika anggota sudah bayar kas (terverifikasi), pastikan semua kupon aktif otomatis diberikan
    await syncCouponsForMember(session.id);

    // Ambil seluruh kupon yang dibagikan ke anggota ini
    const kupons = (await query<any[]>(`
      SELECT 
        ka.id AS kupon_anggota_id,
        ka.status AS status_kupon,
        ka.bulan_terbayar,
        ka.digunakan_pada,
        k.id AS kupon_id,
        COALESCE(ka.kode_kupon_unik, k.kode_kupon) AS kode_kupon,
        k.kode_kupon AS base_kode_kupon,
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

    // Ambil info pembayaran kas akurat tahun ini untuk user
    const currentYear = new Date().getFullYear();
    const { bulanLunas } = await getAnggotaBulanLunas(session.id, currentYear);

    return NextResponse.json({
      status: true,
      data: kupons,
      totalLunasTahunIni: bulanLunas,
      currentYear,
    });
  } catch (error: any) {
    console.error("GET user kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat kupon" }, { status: 500 });
  }
}
