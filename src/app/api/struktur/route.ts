import { NextResponse } from "next/server";
import { getFullStructure } from "@/lib/structure";

export const dynamic = "force-dynamic";

// Public: bagan pengurus aktif untuk halaman /about/cavallery
export async function GET() {
  try {
    const data = await getFullStructure(true);
    return NextResponse.json(
      {
        status: true,
        tree: data.tree,
        nodes: data.nodes,
        settings: data.settings,
        // Backward-compatible field
        data: data.nodes,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Get struktur error:", error);
    return NextResponse.json(
      { status: false, data: [], message: "Gagal memuat struktur" },
      { status: 500 }
    );
  }
}
