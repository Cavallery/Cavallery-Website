import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const UPDATES_PATH = path.join(DATA_DIR, "updates.json");

function ensureDataDirectory() {
  const dir = path.dirname(UPDATES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readUpdates() {
  ensureDataDirectory();
  if (fs.existsSync(UPDATES_PATH)) {
    try {
      const content = fs.readFileSync(UPDATES_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading updates.json:", e);
    }
  }

  // Default updates based on previous hardcoded values
  const defaultUpdates = [
    {
      id: "1",
      platform: "twitter",
      url: "https://twitter.com/CErine_JKT48/status/2056685755616104632"
    },
    {
      id: "2",
      platform: "tiktok",
      url: "https://www.tiktok.com/@jkt48.erine_/video/7640445924992470280"
    },
    {
      id: "3",
      platform: "instagram",
      url: "https://www.instagram.com/p/DXt1vRJEpuf"
    },
    {
      id: "4",
      platform: "threads",
      url: "https://www.threads.net/@jkt48.erine/post/DXt1wb4EjK2"
    }
  ];
  fs.writeFileSync(UPDATES_PATH, JSON.stringify(defaultUpdates, null, 2), "utf-8");
  return defaultUpdates;
}

function writeUpdates(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(UPDATES_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = readUpdates();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      writeUpdates(body);
      return NextResponse.json({ success: true, data: body });
    }
    
    if (body.action === 'add') {
      const data = readUpdates();
      data.push({
        id: body.id || Date.now().toString(),
        platform: body.platform,
        url: body.url
      });
      writeUpdates(data);
      return NextResponse.json({ success: true, data });
    } else if (body.action === 'delete') {
      let data = readUpdates();
      data = data.filter((item: any) => item.id !== body.id);
      writeUpdates(data);
      return NextResponse.json({ success: true, data });
    } else if (body.action === 'update') {
      let data = readUpdates();
      const index = data.findIndex((item: any) => item.id === body.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...body.item };
        writeUpdates(data);
      }
      return NextResponse.json({ success: true, data });
    } else if (body.action === 'saveAll') {
      writeUpdates(body.data);
      return NextResponse.json({ success: true, data: body.data });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
