import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `merch` ORDER BY `sort_order` ASC, `id` DESC");
      return NextResponse.json({ status: true, success: true, data: rows || [] });
    }
    return NextResponse.json({ status: true, success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    const result: any = await query(
      "INSERT INTO `merch` (`title`, `slug`, `price`, `description`, `image_url`, `shopee_url`, `tokopedia_url`, `category`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        body.name || body.title || "",
        body.slug || `merch-${Date.now()}`,
        String(body.price || "0"),
        body.description || "",
        body.image_url || "",
        body.buy_url || body.shopee_url || "",
        body.tokopedia_url || "",
        body.category || "Official",
        Number(body.sort_order) || 0,
        body.is_available !== undefined ? (body.is_available ? 1 : 0) : (body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1)
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Merchandise berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
