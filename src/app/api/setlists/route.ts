import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `setlists` ORDER BY `sort_order` ASC, `id` ASC");
      const mapped = (rows || []).map(r => ({
        ...r,
        name: r.title,
        japanese_name: r.subtitle || "",
        total_shows: r.song_count,
        show_count: r.song_count,
        unit_song: r.description || "",
        description: r.description || "",
        poster_url: r.cover_image,
        image_url: r.cover_image,
        badge: r.description ? r.description : `${r.song_count || 0} Shows`,
        date_range: r.release_date || "",
        songs: r.songs_json
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

    const songsVal = typeof body.songs === "string" ? body.songs : JSON.stringify(body.songs || []);
    const result: any = await query(
      "INSERT INTO `setlists` (`title`, `subtitle`, `cover_image`, `release_date`, `description`, `song_count`, `songs_json`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        body.title || body.name || "",
        body.japanese_name || body.subtitle || "",
        body.image_url || body.cover_image || body.poster_url || "",
        body.date_range || body.release_date || "",
        body.badge || body.unit_song || body.description || "",
        Number(body.show_count || body.total_shows || body.song_count) || 0,
        songsVal,
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Setlist berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
