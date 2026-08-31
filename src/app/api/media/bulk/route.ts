import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VALLZY_BASE = "https://v5.jkt48connect.com/api/cavallery/media";
const API_KEY = "JKTCONNECT";

const PUB_FILE_PATH = path.join(process.cwd(), "src", "data", "published-media.json");
const LOCAL_JSON_PATH = path.join(process.cwd(), "src", "data", "media.json");

async function handleBulkDelete(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return;

  // 1. Forward bulk delete to Vallzy server
  try {
    await fetch(`${VALLZY_BASE}/bulk?apikey=${API_KEY}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  } catch (e: any) {
    console.warn("Vallzy bulk delete warn:", e.message);
  }

  // 2. Remove from local published
  try {
    if (fs.existsSync(PUB_FILE_PATH)) {
      const raw = fs.readFileSync(PUB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.publishedIds)) {
        parsed.publishedIds = parsed.publishedIds.filter((x: string) => !ids.map(String).includes(String(x)));
        fs.writeFileSync(PUB_FILE_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      }
    }
  } catch {}

  // 3. Remove from local fallback
  try {
    if (fs.existsSync(LOCAL_JSON_PATH)) {
      let items = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
      items = items.filter((i: any) => !ids.map(String).includes(String(i.id)));
      fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(items, null, 2), "utf-8");
    }
  } catch {}
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || (body.action === "delete" ? body.ids : []);
    if (Array.isArray(ids) && ids.length > 0) {
      await handleBulkDelete(ids);
    }
    return NextResponse.json({ status: true, message: `${ids.length} media berhasil dihapus` });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Gagal memproses bulk action" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || [];
    if (Array.isArray(ids) && ids.length > 0) {
      await handleBulkDelete(ids);
    }
    return NextResponse.json({ status: true, message: `${ids.length} media berhasil dihapus` });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus bulk media" },
      { status: 500 }
    );
  }
}
