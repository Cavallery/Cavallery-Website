import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VALLZY_BASE = "https://v5.jkt48connect.com/api/cavallery/media";
const API_KEY = "JKTCONNECT";

const PUB_FILE_PATH = path.join(process.cwd(), "src", "data", "published-media.json");
const LOCAL_JSON_PATH = path.join(process.cwd(), "src", "data", "media.json");

function removeFromPublished(targetId: string) {
  try {
    if (fs.existsSync(PUB_FILE_PATH)) {
      const raw = fs.readFileSync(PUB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.publishedIds)) {
        parsed.publishedIds = parsed.publishedIds.filter((x: string) => String(x) !== String(targetId));
        fs.writeFileSync(PUB_FILE_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      }
    }
  } catch {}
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    // 1. Forward delete to Vallzy server
    try {
      await fetch(`${VALLZY_BASE}/${cleanId}?apikey=${API_KEY}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(4000),
      });
    } catch (e: any) {
      console.warn("Vallzy delete warn:", e.message);
    }

    // 2. Remove from local fallback & published list
    removeFromPublished(cleanId);

    try {
      if (fs.existsSync(LOCAL_JSON_PATH)) {
        let items = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
        items = items.filter((i: any) => String(i.id) !== cleanId && String(i.public_url) !== cleanId);
        fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(items, null, 2), "utf-8");
      }
    } catch {}

    return NextResponse.json({
      status: true,
      success: true,
      message: "Media berhasil dihapus dari server Vallzy",
    });
  } catch (error: any) {
    console.error("Media Delete Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus media" },
      { status: 500 }
    );
  }
}
