import { NextResponse } from "next/server";
import { getFullStructure } from "@/lib/structure";

export const dynamic = "force-dynamic";

// GET /api/structure: Mengembalikan pohon lengkap, flat nodes aktif, dan settings
export async function GET() {
  try {
    const data = await getFullStructure(true);
    return NextResponse.json(
      {
        status: true,
        tree: data.tree,
        nodes: data.nodes,
        settings: data.settings,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("[API Structure GET Error]:", error);
    return NextResponse.json(
      {
        status: false,
        message: error?.message || "Gagal memuat struktur organisasi",
        tree: null,
        nodes: [],
        settings: {
          chart_title: "Cavallery's Castle Structure",
          logo_url: "/uploads/cavallery/images/2026/10/1792248958349_logo_struktur.png",
        },
      },
      { status: 500 }
    );
  }
}
