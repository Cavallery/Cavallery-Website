import { NextResponse } from "next/server";
import { getYearlyKasMatrix } from "@/lib/kasMatrix";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tahun = parseInt(searchParams.get("tahun") || String(new Date().getFullYear()), 10);

    if (isNaN(tahun) || tahun < 2020 || tahun > 2035) {
      return NextResponse.json({ status: false, message: "Tahun tidak valid" }, { status: 400 });
    }

    const data = await getYearlyKasMatrix(tahun);

    const publicRows = data.matrixRows.map((row: any) => ({
      no: row.no,
      noAnggota: row.noAnggota,
      nama: row.nama,
      jabatan: row.jabatan,
      isAdminRole: row.isAdminRole,
      bulanMulai: row.bulanMulai,
      isAlreadyJoined: row.isAlreadyJoined,
      totalKas: row.isAdminRole ? null : row.totalKas,
      months: row.months,
    }));

    return NextResponse.json({
      status: true,
      tahun: data.tahun,
      totalAnggota: data.totalAnggota,
      monthlyTotals: data.monthlyTotals,
      monthlyPaidCounts: data.monthlyPaidCounts,
      grandTotalPemasukan: data.grandTotalPemasukan,
      matrixRows: publicRows,
    });
  } catch (err: any) {
    console.error("[Public Matrix API] Error:", err);
    return NextResponse.json({ status: false, message: "Gagal memuat data" }, { status: 500 });
  }
}
