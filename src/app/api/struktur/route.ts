import { NextResponse } from "next/server";
import { listPengurus } from "@/lib/struktur";

export const dynamic = "force-dynamic";

// Public: bagan pengurus aktif untuk halaman /about/cavallery
export async function GET() {
  try {
    const data = await listPengurus();
    return NextResponse.json(
      { status: true, data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error: unknown) {
    console.error("Get struktur error:", error);
    return NextResponse.json({ status: false, data: [], message: "Gagal memuat struktur" }, { status: 500 });
  }
}
