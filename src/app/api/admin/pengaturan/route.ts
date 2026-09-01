import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getAllRegistrationSettings, setSetting } from "@/lib/settings";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const settings = await getAllRegistrationSettings();
    return NextResponse.json({
      status: true,
      data: settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat pengaturan" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ status: false, message: "Parameter key dan value wajib diisi" }, { status: 400 });
    }

    const strVal = value ? "1" : "0";
    await setSetting(key, strVal);

    const updated = await getAllRegistrationSettings();
    return NextResponse.json({
      status: true,
      message: "Pengaturan berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
