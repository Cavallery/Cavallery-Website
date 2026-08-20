import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    let videoId = body.video_id || "";
    if (!videoId && body.url) {
      const match = body.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) videoId = match[1];
    }
    const thumbnail = body.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");

    await query(
      "UPDATE `youtube` SET `title`=?, `video_id`=?, `url`=?, `thumbnail`=?, `published_at`=?, `sort_order`=?, `is_active`=? WHERE `video_id`=? OR `id`=?",
      [
        body.title || "",
        videoId,
        body.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""),
        thumbnail,
        body.published_at || new Date().toISOString(),
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        id,
        isNaN(Number(id)) ? -1 : Number(id)
      ]
    );
    return NextResponse.json({ status: true, success: true, message: "Video YouTube berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    await query("DELETE FROM `youtube` WHERE `video_id`=? OR `id`=?", [id, isNaN(Number(id)) ? -1 : Number(id)]);
    return NextResponse.json({ status: true, success: true, message: "Video YouTube berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
