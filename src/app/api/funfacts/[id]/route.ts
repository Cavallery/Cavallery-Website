import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    await query(
      "UPDATE `funfacts` SET `fact`=?, `category`=?, `icon`=?, `sort_order`=?, `is_active`=? WHERE `id`=?",
      [
        body.content || body.fact || body.fact_text || "",
        body.category || "General",
        body.icon || "bx-laugh",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        id
      ]
    );
    return NextResponse.json({ status: true, success: true, message: "Funfact berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    await query("DELETE FROM `funfacts` WHERE `id`=?", [id]);
    return NextResponse.json({ status: true, success: true, message: "Funfact berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
