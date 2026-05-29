import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const CALENDAR_PATH = path.join(DATA_DIR, "calendar.json");

function ensureDataDirectory() {
  const dir = path.dirname(CALENDAR_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readCalendar() {
  ensureDataDirectory();
  if (fs.existsSync(CALENDAR_PATH)) {
    try {
      const content = fs.readFileSync(CALENDAR_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading calendar.json:", e);
    }
  }

  const defaultCalendar: any[] = [];
  fs.writeFileSync(CALENDAR_PATH, JSON.stringify(defaultCalendar, null, 2), "utf-8");
  return defaultCalendar;
}

function writeCalendar(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(CALENDAR_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = readCalendar();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      writeCalendar(body);
      return NextResponse.json({ success: true, data: body });
    }
    
    // Support adding a single item or updating the whole list
    if (body.action === 'add') {
      const data = readCalendar();
      data.push({
        id: body.id || Date.now().toString(),
        title: body.title,
        date: body.date, // Format: YYYY-MM-DD
        startTime: body.startTime || "00:00",
        members: body.members || [{ name: "Cavallery" }],
        url: body.url || "",
        imageUrl: body.imageUrl || ""
      });
      writeCalendar(data);
      return NextResponse.json({ success: true, data });
    } else if (body.action === 'delete') {
      let data = readCalendar();
      data = data.filter((item: any) => item.id !== body.id);
      writeCalendar(data);
      return NextResponse.json({ success: true, data });
    } else if (body.action === 'update') {
      let data = readCalendar();
      const index = data.findIndex((item: any) => item.id === body.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...body.item };
        writeCalendar(data);
      }
      return NextResponse.json({ success: true, data });
    } else if (body.action === 'saveAll') {
      writeCalendar(body.data);
      return NextResponse.json({ success: true, data: body.data });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
