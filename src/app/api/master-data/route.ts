import { NextResponse } from "next/server";
import { getMasterData } from "@/lib/settings";

export async function GET() {
  try {
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
