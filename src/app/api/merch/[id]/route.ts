import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    await query(
      "UPDATE `merch` SET `title`=?, `slug`=?, `price`=?, `description`=?, `image_url`=?, `shopee_url`=?, `tokopedia_url`=?, `category`=?, `sort_order`=?, `is_active`=? WHERE `id`=?",
      [
        body.name || body.title || "",
        body.slug || `merch-${id}`,
        String(body.price || "0"),
        body.description || "",
        body.image_url || "",
        body.buy_url || body.shopee_url || "",
        body.tokopedia_url || "",
        body.category || "Official",
        Number(body.sort_order) || 0,
        body.is_available !== undefined ? (body.is_available ? 1 : 0) : (body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1),
        id
      ]
    );
    return NextResponse.json({ status: true, success: true, message: "Merchandise berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    await query("DELETE FROM `merch` WHERE `id`=?", [id]);
    return NextResponse.json({ status: true, success: true, message: "Merchandise berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
