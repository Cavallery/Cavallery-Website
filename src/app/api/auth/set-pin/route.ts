import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import { ensurePinColumn } from "@/lib/membership";

export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Sesi tidak valid atau Anda bukan anggota." },
        { status: 401 }
      );
    }

    await ensurePinColumn();

    const body = await req.json();
    const { pin } = body;

    const cleanPin = pin ? String(pin).trim() : "";
    if (!cleanPin || !/^\d{4,6}$/.test(cleanPin)) {
      return NextResponse.json(
        { status: false, message: "PIN harus berupa 4 hingga 6 digit angka numerik." },
        { status: 400 }
      );
    }

    await query("UPDATE anggota SET pin = ? WHERE id = ?", [cleanPin, session.id]);

    return NextResponse.json({
      status: true,
      message: "PIN login berhasil disimpan! Anda kini dapat masuk menggunakan PIN ini atau ID LINE Anda.",
    });
  } catch (error: any) {
    console.error("set-pin error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menyimpan PIN" },
      { status: 500 }
    );
  }
}
