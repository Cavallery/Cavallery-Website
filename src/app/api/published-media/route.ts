import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const dataDir = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const filePath = path.join(dataDir, "published-media.json");
const staticPath = path.join(process.cwd(), "src", "data", "published-media.json");

function readPublished(): string[] {
  try {
    const target = fs.existsSync(filePath) ? filePath : (fs.existsSync(staticPath) ? staticPath : null);
    if (target) {
      const raw = fs.readFileSync(target, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.publishedIds)) {
        return parsed.publishedIds;
      }
    }
  } catch {}
  return [];
}

function savePublished(ids: string[]) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify({ publishedIds: ids }, null, 2), "utf-8");
    if (!isVercel && filePath !== staticPath) {
      fs.writeFileSync(staticPath, JSON.stringify({ publishedIds: ids }, null, 2), "utf-8");
    }
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const publishedIds = readPublished();
  return NextResponse.json({ success: true, publishedIds }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, ids, isPublished } = body;
    let current = readPublished();

    if (action === "toggle") {
      if (current.includes(id)) {
        current = current.filter((item) => item !== id);
      } else {
        current.push(id);
      }
    } else if (action === "set") {
      if (isPublished) {
        if (!current.includes(id)) current.push(id);
      } else {
        current = current.filter((item) => item !== id);
      }
    } else if (action === "setAll" && Array.isArray(ids)) {
      current = ids;
    }

    savePublished(current);
    return NextResponse.json({ success: true, publishedIds: current }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menyimpan status publikasi" }, { status: 500 });
  }
}
