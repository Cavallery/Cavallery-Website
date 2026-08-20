import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    const songsVal = typeof body.songs === "string" ? body.songs : JSON.stringify(body.songs || []);
    await query(
      "UPDATE `setlists` SET `title`=?, `subtitle`=?, `cover_image`=?, `release_date`=?, `description`=?, `song_count`=?, `songs_json`=?, `sort_order`=?, `is_active`=? WHERE `id`=?",
      [
        body.title || body.name || "",
        body.japanese_name || body.subtitle || "",
        body.image_url || body.cover_image || body.poster_url || "",
        body.date_range || body.release_date || "",
        body.badge || body.unit_song || body.description || "",
        Number(body.show_count || body.total_shows || body.song_count) || 0,
        songsVal,
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        id
      ]
    );
    return NextResponse.json({ status: true, success: true, message: "Setlist berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    await query("DELETE FROM `setlists` WHERE `id`=?", [id]);
    return NextResponse.json({ status: true, success: true, message: "Setlist berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
