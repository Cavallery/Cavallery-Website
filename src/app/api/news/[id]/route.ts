import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `news` WHERE `id`=? OR `slug`=? LIMIT 1", [id, id]);
      if (rows && rows.length > 0) {
        return NextResponse.json({ status: true, success: true, data: rows[0] });
      }
    }
    return NextResponse.json({ status: false, success: false, message: "News not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    await query(
      "UPDATE `news` SET `title`=?, `slug`=?, `summary`=?, `content`=?, `image_url`=?, `author`=?, `category`=?, `published_at`=?, `is_active`=? WHERE `id`=? OR `slug`=?",
      [
        body.title || "",
        body.slug || `news-${id}`,
        body.description || body.summary || "",
        body.content || body.description || "",
        body.image_url || "",
        body.author || "Cavallery",
        body.label || body.category || "Statement",
        body.published_at || new Date().toISOString(),
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        id,
        id
      ]
    );
    return NextResponse.json({ status: true, success: true, message: "News berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    await query("DELETE FROM `news` WHERE `id`=? OR `slug`=?", [id, id]);
    return NextResponse.json({ status: true, success: true, message: "News berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
