import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan masuk terlebih dahulu." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const body = await req.json();
    const { privacyModeDefault } = body;

    if (typeof privacyModeDefault !== "boolean") {
      return NextResponse.json(
        { status: false, message: "Format data preferensi tidak valid." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    await query(
      "UPDATE anggota SET privacy_mode_default = ? WHERE id = ?",
      [privacyModeDefault ? 1 : 0, session.id]
    );

    return NextResponse.json(
      {
        status: true,
        message: "Preferensi mode privat berhasil disimpan.",
        privacyModeDefault,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: any) {
    console.error("Save KTA preferences error:", error?.message);
    return NextResponse.json(
      { status: false, message: "Terjadi kesalahan saat menyimpan preferensi." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
