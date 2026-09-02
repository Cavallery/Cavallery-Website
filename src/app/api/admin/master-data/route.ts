import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getMasterData, saveMasterData } from "@/lib/settings";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    const data = await getMasterData();
    return NextResponse.json({
      status: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat master data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updated = await saveMasterData(body);

    return NextResponse.json({
      status: true,
      message: "Master data berhasil disimpan dan diperbarui!",
      data: updated,
    });
  } catch (error: any) {
    console.error("Save master data error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menyimpan master data" },
      { status: 500 }
    );
  }
}
