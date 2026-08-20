import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `timeline` ORDER BY `year` DESC, `sort_order` ASC, `id` DESC");
      return NextResponse.json({ status: true, success: true, data: { events: rows || [] } });
    }
    return NextResponse.json({ status: true, success: true, data: { events: [] } });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message, data: { events: [] } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isMySqlConfigured()) {
      return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    }
    const result: any = await query(
      "INSERT INTO `timeline` (`year`, `date_label`, `title`, `description`, `image_url`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        body.year || "2026",
        body.date_label || body.event_date || "",
        body.title || "",
        body.description || "",
        body.image_url || "",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Timeline berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
