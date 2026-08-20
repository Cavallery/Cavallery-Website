import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    await query(
      "UPDATE `gallery` SET `title`=?, `image_url`=?, `date_label`=?, `alt_text`=?, `tags`=?, `sort_order`=?, `is_active`=? WHERE `id`=?",
      [
        body.title || "",
        body.image_url || "",
        body.date_label || "",
        body.alt_text || "",
        body.tags || "",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        id
      ]
    );
    return NextResponse.json({ status: true, success: true, message: "Foto galeri berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    await query("DELETE FROM `gallery` WHERE `id`=?", [id]);
    return NextResponse.json({ status: true, success: true, message: "Foto galeri berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
