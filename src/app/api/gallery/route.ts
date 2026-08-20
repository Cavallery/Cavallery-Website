import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `gallery` ORDER BY `sort_order` ASC, `id` DESC");
      return NextResponse.json({ status: true, success: true, data: { items: rows || [] } });
    }
    return NextResponse.json({ status: true, success: true, data: { items: [] } });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message, data: { items: [] } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    const result: any = await query(
      "INSERT INTO `gallery` (`title`, `image_url`, `date_label`, `alt_text`, `tags`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        body.title || "",
        body.image_url || "",
        body.date_label || "",
        body.alt_text || "",
        body.tags || "",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Foto galeri berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
