import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const ABOUT_ERINE_PATH = path.join(DATA_DIR, "about-erine.json");

function ensureDataDirectory() {
  const dir = path.dirname(ABOUT_ERINE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readAboutErineLocal() {
  ensureDataDirectory();
  if (fs.existsSync(ABOUT_ERINE_PATH)) {
    try {
      const content = fs.readFileSync(ABOUT_ERINE_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading about-erine.json:", e);
    }
  }

  const defaultSlides = [
    "/images/gallery/erine-gallery-1.jpg",
    "/images/gallery/erine-gallery-2.jpg",
    "/images/gallery/erine-gallery-3.jpg",
  ];
  fs.writeFileSync(ABOUT_ERINE_PATH, JSON.stringify(defaultSlides, null, 2), "utf-8");
  return defaultSlides;
}

function writeAboutErineLocal(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(ABOUT_ERINE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT `content_json` FROM `about_erine` WHERE `section_key`='hero_gallery' LIMIT 1");
      if (rows && rows.length > 0) {
        try {
          const parsed = JSON.parse(rows[0].content_json);
          if (Array.isArray(parsed)) {
            return NextResponse.json({ success: true, data: parsed });
          }
        } catch {}
      }
    }
    const data = readAboutErineLocal();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: true, data: readAboutErineLocal() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      if (isMySqlConfigured()) {
        await query(
          "INSERT INTO `about_erine` (`section_key`, `title`, `content_json`) VALUES ('hero_gallery', 'Hero Gallery Photos', ?) ON DUPLICATE KEY UPDATE `content_json`=VALUES(`content_json`)",
          [JSON.stringify(body)]
        );
      }
      writeAboutErineLocal(body);
      return NextResponse.json({ success: true, data: body });
    }
    return NextResponse.json({ success: false, message: "Invalid payload, array of strings expected" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
