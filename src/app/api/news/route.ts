import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `news` ORDER BY `published_at` DESC, `id` DESC");
      const mapped = (rows || []).map(r => ({
        ...r,
        label: r.category || "Statement",
        description: r.summary || r.content?.slice(0, 120),
        link_url: `/news/cavallery-statement/${r.slug || r.id}`
      }));
      return NextResponse.json({ status: true, success: true, data: { news: mapped } });
    }

    const defaultNews = [
      {
        id: 1,
        title: "Perilisan Website Resmi Cavallery",
        slug: "perilisan-website-resmi-cavallery",
        label: "Statement",
        description: "Official Fanbase Catherina Vallencia Kurniawan meluncurkan website resmi.",
        content: "Official Fanbase Catherina Vallencia Kurniawan meluncurkan website resmi.",
        image_url: "https://pbs.twimg.com/media/Gf43U5EaMAAwQ9G?format=jpg&name=medium",
        published_at: "2026-08-20",
        is_active: 1
      }
    ];
    return NextResponse.json({ status: true, success: true, data: { news: defaultNews } });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message, data: { news: [] } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    const result: any = await query(
      "INSERT INTO `news` (`title`, `slug`, `summary`, `content`, `image_url`, `author`, `category`, `published_at`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        body.title || "",
        body.slug || `news-${Date.now()}`,
        body.description || body.summary || "",
        body.content || body.description || "",
        body.image_url || "",
        body.author || "Cavallery",
        body.label || body.category || "Statement",
        body.published_at || new Date().toISOString(),
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "News berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
