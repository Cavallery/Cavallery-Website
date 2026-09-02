import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getKasDebtsTracker } from "@/lib/kasMatrix";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tahunParam = searchParams.get("tahun");
    const tahun = tahunParam ? parseInt(tahunParam, 10) : new Date().getFullYear();

    const debts = await getKasDebtsTracker(tahun);
    const totalTagihanAll = debts.reduce((acc, d) => acc + (d.tagihanKas || 0), 0);

    return NextResponse.json({
      status: true,
      tahun,
      totalAnggotaMenunggak: debts.length,
      totalTagihanAll,
      data: debts,
    });
  } catch (error: any) {
    console.error("GET tagihan kas error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat tagihan" }, { status: 500 });
  }
}
