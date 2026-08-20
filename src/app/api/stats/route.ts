import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `stats` ORDER BY `sort_order` ASC, `id` ASC");
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
      "INSERT INTO `stats` (`stat_key`, `label`, `value`, `icon`, `sort_order`) VALUES (?, ?, ?, ?, ?)",
      [
        body.stat_key || "stat_" + Date.now(),
        body.label || "",
        String(body.value || "0"),
        body.icon || "bx-bar-chart",
        Number(body.sort_order) || 0
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Statistik berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
