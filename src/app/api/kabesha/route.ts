import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `kabesha` ORDER BY `sort_order` ASC, `id` ASC");
      const mapped = (rows || []).map(r => ({
        ...r,
        year_label: r.era || "2026",
        era_name: r.title
      }));
      return NextResponse.json({ status: true, success: true, data: mapped });
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
      "INSERT INTO `kabesha` (`title`, `era`, `image_url`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?)",
      [
        body.title || body.era_name || "",
        body.year_label || body.era || "2026",
        body.image_url || "",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Kabesha berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
