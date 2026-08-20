import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const VC_PATH = path.join(DATA_DIR, "vcschedule.json");

function ensureDataDirectory() {
  const dir = path.dirname(VC_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readVcScheduleLocal() {
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
    imageUrl: "https://cavallery.id/wp-content/uploads/2026/04/VC_Maret.jpg",
  };
  fs.writeFileSync(VC_PATH, JSON.stringify(defaultVc, null, 2), "utf-8");
  return defaultVc;
}

function writeVcScheduleLocal(data: any) {
  ensureDataDirectory();
  fs.writeFileSync(VC_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `vcschedule` WHERE `is_active`=1 ORDER BY `sort_order` ASC, `id` ASC");
      if (rows && rows.length > 0) {
        // Construct the object expected by frontend
        const date = rows[0]?.date_label || "Rabu, 11 Maret 2026";
        const imageUrl = rows[0]?.link_url || "https://cavallery.id/wp-content/uploads/2026/04/VC_Maret.jpg";
        const result: any = { date, imageUrl };
        rows.forEach((r, idx) => {
          result[`session${idx + 1}`] = `${r.session_name}: ${r.time_label}`;
        });
        return NextResponse.json({ success: true, data: result });
      }
    }
    const data = readVcScheduleLocal();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: true, data: readVcScheduleLocal() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (isMySqlConfigured() && typeof body === "object") {
      const date = body.date || "Rabu, 11 Maret 2026";
      const imageUrl = body.imageUrl || "";

      // Upsert sessions
      const sessions = [
        { id: 1, name: "Sesi 1", time: (body.session1 || "").replace("Sesi 1:", "").trim() },
        { id: 2, name: "Sesi 2", time: (body.session2 || "").replace("Sesi 2:", "").trim() },
        { id: 3, name: "Sesi 3", time: (body.session3 || "").replace("Sesi 3:", "").trim() },
      ];

      for (const s of sessions) {
        await query(
          "INSERT INTO `vcschedule` (`id`, `session_name`, `date_label`, `time_label`, `link_url`, `is_active`, `sort_order`) VALUES (?, ?, ?, ?, ?, 1, ?) ON DUPLICATE KEY UPDATE `session_name`=VALUES(`session_name`), `date_label`=VALUES(`date_label`), `time_label`=VALUES(`time_label`), `link_url`=VALUES(`link_url`)",
          [s.id, s.name, date, s.time, imageUrl, s.id]
        );
      }
    }

    writeVcScheduleLocal(body);
    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
