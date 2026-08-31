import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PUB_FILE_PATH = path.join(process.cwd(), "src", "data", "published-media.json");

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
  const publishedIds = readPublishedIds();
  return NextResponse.json({ success: true, publishedIds }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, ids, isPublished } = body;
    const targetId = String(id || "").trim();

    let current = readPublishedIds();
    let newStatus = isPublished !== undefined ? Boolean(isPublished) : true;

    if (action === "toggle" && targetId) {
      if (current.includes(targetId)) {
        current = current.filter((item) => String(item) !== targetId);
        newStatus = false;
      } else {
        current.push(targetId);
        newStatus = true;
      }
    } else if (action === "set" && targetId) {
      if (isPublished) {
        if (!current.includes(targetId)) current.push(targetId);
        newStatus = true;
      } else {
        current = current.filter((item) => String(item) !== targetId);
        newStatus = false;
      }
    } else if (action === "setAll" && Array.isArray(ids)) {
      current = ids.map(String);
    }

    try {
      const dir = path.dirname(PUB_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(PUB_FILE_PATH, JSON.stringify({ publishedIds: current }, null, 2), "utf-8");
    } catch {}

    return NextResponse.json({
      success: true,
      newStatus,
      publishedIds: current,
      message: newStatus ? "Media berhasil ditampilkan di Web" : "Media berhasil disembunyikan dari Web",
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Gagal menyimpan status publikasi" }, { status: 500 });
  }
}
