import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getStructureSettings, updateStructureSettings } from "@/lib/structure";

export const dynamic = "force-dynamic";

const denied = () =>
  NextResponse.json(
    { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
    { status: 401 }
  );

// GET /api/admin/structure/settings: Ambil settings struktur
export async function GET(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();

  try {
    const settings = await getStructureSettings();
    return NextResponse.json({ status: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat pengaturan" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/structure/settings: Update logo_url dan chart_title
export async function PATCH(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();

  try {
    const body = await req.json();

    const updated = await updateStructureSettings({
      chart_title: body.chart_title,
      logo_url: body.logo_url,
    });

    return NextResponse.json({
      status: true,
      message: "Pengaturan bagan struktur berhasil diperbarui.",
      settings: updated,
    });
  } catch (error: any) {
    console.error("[Admin Structure Settings PATCH Error]:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui pengaturan" },
      { status: 500 }
    );
  }
}
