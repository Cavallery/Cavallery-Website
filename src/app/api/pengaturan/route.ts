import { NextResponse } from "next/server";
import { getAllRegistrationSettings } from "@/lib/settings";

export async function GET() {
  try {
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
