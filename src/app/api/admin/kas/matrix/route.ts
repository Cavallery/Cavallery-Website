import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getYearlyKasMatrix, toggleMonthPayment, syncKasToMatrix, SUPPORTED_YEARS } from "@/lib/kasMatrix";
import { query } from "@/lib/mysql";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tahunParam = parseInt(searchParams.get("tahun") || `${new Date().getFullYear()}`, 10);
    const tahun = SUPPORTED_YEARS.includes(tahunParam) ? tahunParam : 2026;

    const data = await getYearlyKasMatrix(tahun);

    return NextResponse.json({
      status: true,
      data,
      supportedYears: SUPPORTED_YEARS,
    });
  } catch (error: any) {
    console.error("Get kas matrix error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat matriks kas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { noAnggota, tahun, bulan, isPaid, nominal } = body;

    if (!noAnggota || !tahun || !bulan) {
      return NextResponse.json({ status: false, message: "Parameter tidak lengkap" }, { status: 400 });
    }

    await toggleMonthPayment({
      noAnggota,
      tahun: Number(tahun),
      bulan: Number(bulan),
      isPaid: Boolean(isPaid),
      nominal: Number(nominal) || 15000,
      adminName: admin.nama || "Admin",
    });

    return NextResponse.json({
      status: true,
      message: `Status kas ${noAnggota} bulan ke-${bulan} (${tahun}) berhasil diubah jadi ${isPaid ? "Lunas" : "Belum Bayar"}.`,
    });
  } catch (error: any) {
    console.error("Toggle kas matrix month error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal mengubah status kas bulanan" }, { status: 500 });
  }
}

/**
 * PUT: Re-sync semua data konfirmasi_kas yang sudah diverifikasi ke matriks
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const verifiedKas = (await query<any[]>(`
      SELECT k.*, a.no_anggota 
      FROM konfirmasi_kas k
      LEFT JOIN anggota a ON k.anggota_id = a.id
      WHERE k.status = 'diverifikasi'
    `)) || [];

    for (const vk of verifiedKas) {
      await syncKasToMatrix({
        konfirmasiKasId: vk.id,
        anggotaId: vk.anggota_id,
        noAnggota: vk.no_anggota || "-",
        periode: vk.periode,
        nominal: vk.nominal,
        status: "diverifikasi",
        verifiedBy: vk.verified_by || "Admin",
      });
    }

    return NextResponse.json({
      status: true,
      message: `Berhasil menyinkronkan ${verifiedKas.length} pembayaran kas terverifikasi ke dalam matriks bulanan!`,
    });
  } catch (error: any) {
    console.error("Resync kas matrix error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal sinkronisasi data kas" }, { status: 500 });
  }
}
