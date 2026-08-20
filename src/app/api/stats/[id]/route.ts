import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    await query(
      "UPDATE `stats` SET `label`=?, `value`=?, `icon`=?, `sort_order`=? WHERE `stat_key`=? OR `id`=?",
      [
        body.label || "",
        String(body.value || "0"),
        body.icon || "bx-bar-chart",
        Number(body.sort_order) || 0,
        id,
        isNaN(Number(id)) ? -1 : Number(id)
      ]
    );
    return NextResponse.json({ status: true, success: true, message: "Statistik berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    await query("DELETE FROM `stats` WHERE `stat_key`=? OR `id`=?", [id, isNaN(Number(id)) ? -1 : Number(id)]);
    return NextResponse.json({ status: true, success: true, message: "Statistik berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
