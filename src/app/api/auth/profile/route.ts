import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fotoProfil } = body;

    if (!fotoProfil) {
      return NextResponse.json(
        { status: false, message: "URL foto profil wajib dikirim" },
        { status: 400 }
      );
    }

    await query("UPDATE anggota SET foto_profil = ? WHERE id = ?", [fotoProfil, session.id]);

    return NextResponse.json({
      status: true,
      message: "Foto profil berhasil diperbarui!",
      fotoProfil,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui foto profil" },
      { status: 500 }
    );
  }
}
