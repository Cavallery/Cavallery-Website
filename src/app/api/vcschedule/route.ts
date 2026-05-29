import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const VC_PATH = path.join(DATA_DIR, "vcschedule.json");

function ensureDataDirectory() {
  const dir = path.dirname(VC_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readVcSchedule() {
  ensureDataDirectory();
  if (fs.existsSync(VC_PATH)) {
    try {
      const content = fs.readFileSync(VC_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading vcschedule.json:", e);
    }
  }

  const defaultVc = {
    date: "Rabu, 11 Maret 2026",
    session1: "Sesi 1: 16.30 – 17.30",
    session2: "Sesi 2: 17.00 – 18.00",
    session3: "Sesi 3: 19.30 – 20.30",
    imageUrl: "https://cavallery.id/wp-content/uploads/2026/04/VC_Maret.jpg"
  };
  fs.writeFileSync(VC_PATH, JSON.stringify(defaultVc, null, 2), "utf-8");
  return defaultVc;
}

function writeVcSchedule(data: any) {
  ensureDataDirectory();
  fs.writeFileSync(VC_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = readVcSchedule();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    writeVcSchedule(body);
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
