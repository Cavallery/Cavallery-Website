import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `funfacts` ORDER BY `sort_order` ASC, `id` ASC");
      const mapped = (rows || []).map(r => ({
        ...r,
        content: r.fact,
        fact_text: r.fact
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
      "INSERT INTO `funfacts` (`fact`, `category`, `icon`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?)",
      [
        body.content || body.fact || body.fact_text || "",
        body.category || "General",
        body.icon || "bx-laugh",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Funfact berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
