import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const ABOUT_ERINE_PATH = path.join(DATA_DIR, "about-erine.json");

function ensureDataDirectory() {
  const dir = path.dirname(ABOUT_ERINE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readAboutErine() {
  ensureDataDirectory();
  if (fs.existsSync(ABOUT_ERINE_PATH)) {
    try {
      const content = fs.readFileSync(ABOUT_ERINE_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading about-erine.json:", e);
    }
  }

  // Default
  const defaultSlides = [
    "/images/gallery/erine-gallery-1.jpg",
    "/images/gallery/erine-gallery-2.jpg",
    "/images/gallery/erine-gallery-3.jpg"
  ];
  fs.writeFileSync(ABOUT_ERINE_PATH, JSON.stringify(defaultSlides, null, 2), "utf-8");
  return defaultSlides;
}

function writeAboutErine(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(ABOUT_ERINE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = readAboutErine();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      writeAboutErine(body);
      return NextResponse.json({ success: true, data: body });
    }
    return NextResponse.json({ success: false, message: "Invalid payload, array of strings expected" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
