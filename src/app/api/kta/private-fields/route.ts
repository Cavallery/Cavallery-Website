import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan masuk terlebih dahulu." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const rows = await query<any[]>(
      "SELECT tempat_lahir, tanggal_lahir, domisili FROM anggota WHERE id = ? LIMIT 1",
      [session.id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { status: false, message: "Data anggota tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = rows[0];

    return NextResponse.json(
      {
        status: true,
        data: {
          tempatLahir: data.tempat_lahir || "",
          tanggalLahir: data.tanggal_lahir || "",
          domisili: data.domisili || "",
        },
        fields: {
          tempatLahir: data.tempat_lahir || "",
          tanggalLahir: data.tanggal_lahir || "",
          domisili: data.domisili || "",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Fetch private fields error:", error?.message);
    return NextResponse.json(
      { status: false, message: "Terjadi kesalahan saat memuat data sensitif." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
