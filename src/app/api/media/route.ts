import { NextRequest, NextResponse } from "next/server";
import { getMediaList } from "@/lib/mediaDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "";
    const type = searchParams.get("type") || "";
    const publishedOnly = searchParams.get("published_only") === "true";
    const limit = Number(searchParams.get("limit") || 500);
    const offset = Number(searchParams.get("offset") || 0);

    const { items, total } = await getMediaList({
      search,
      folder,
      type,
      publishedOnly,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        status: true,
        success: true,
        message: "Data media berhasil dimuat dari database",
        data: {
          total,
          limit,
          offset,
          items,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error: any) {
    console.error("Media GET error:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: error.message || "Gagal memuat media",
        data: { items: [], total: 0 },
      },
      { status: 500 }
    );
  }
}
