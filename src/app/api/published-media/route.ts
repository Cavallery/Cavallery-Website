import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { togglePublishMedia } from "@/lib/mediaDb";
import { query, isMySqlConfigured } from "@/lib/mysql";

const PUB_FILE_PATH = path.join(process.cwd(), "src", "data", "published-media.json");

export const dynamic = "force-dynamic";

function readPublishedIds(): string[] {
  try {
    if (fs.existsSync(PUB_FILE_PATH)) {
      const raw = fs.readFileSync(PUB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.publishedIds)) {
        return parsed.publishedIds.map(String);
      }
    }
  } catch {}
  return [];
}

export async function GET() {
  if (isMySqlConfigured()) {
    try {
      const rows = await query<any[]>("SELECT id, public_url FROM `media` WHERE is_published = 1");
      if (rows && Array.isArray(rows)) {
        const ids = rows.map((r) => String(r.id));
        return NextResponse.json({ success: true, publishedIds: ids }, { status: 200 });
      }
    } catch {}
  }

  const publishedIds = readPublishedIds();
  return NextResponse.json({ success: true, publishedIds }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, ids, isPublished } = body;
    const targetId = String(id || "").trim();

    if (action === "toggle" && targetId) {
      const { newStatus } = await togglePublishMedia(targetId);
      return NextResponse.json({
        success: true,
        newStatus,
        message: newStatus ? "Media berhasil ditampilkan di Web" : "Media berhasil disembunyikan dari Web",
      });
    }

    if (action === "set" && targetId) {
      const target = isPublished !== undefined ? Boolean(isPublished) : true;
      const { newStatus } = await togglePublishMedia(targetId, target);
      return NextResponse.json({
        success: true,
        newStatus,
        message: newStatus ? "Media berhasil ditampilkan di Web" : "Media berhasil disembunyikan dari Web",
      });
    }

    if (action === "setAll" && Array.isArray(ids)) {
      for (const singleId of ids) {
        await togglePublishMedia(singleId, true);
      }
      return NextResponse.json({ success: true, message: "Status publikasi massal berhasil diperbarui" });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenali" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Gagal mengubah status publikasi" },
      { status: 500 }
    );
  }
}
