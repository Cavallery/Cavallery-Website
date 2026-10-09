import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import { API_CACHE_HEADERS } from "@/lib/apiCache";
import fs from "fs";
import path from "path";

function getLocalMilestones() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "milestone.json");
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      const list = JSON.parse(fileData);
      if (Array.isArray(list) && list.length > 0) {
        const yearsSet = new Set<string>();
        list.forEach((item: any) => {
          yearsSet.add(String(item.year || "2026"));
        });
        const years = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
        return { years, events: list };
      }
    }
  } catch (e) {
    console.error("Failed to read local milestone.json:", e);
  }
  return null;
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      try {
        const rows = await query<any[]>(
          "SELECT * FROM `timeline` WHERE `is_active` = 1 ORDER BY `year` ASC, `sort_order` ASC, `id` ASC"
        );
        if (rows && rows.length > 0) {
          const yearsSet = new Set<string>();
          const events = rows.map((r) => {
            const yr = String(r.year || "2026");
            yearsSet.add(yr);
            return {
              id: String(r.id),
              year: yr,
              date_label: r.date_label || "",
              event_date: r.event_date || r.date_label || "",
              title: r.title || "",
              description: r.description || "",
              image_url: r.image_url || null,
              handwriting_caption: r.handwriting_caption || r.date_label || "",
              sort_order: r.sort_order || 0,
              is_active: Boolean(r.is_active),
            };
          });
          const years = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
          return NextResponse.json(
            {
              status: true,
              success: true,
              data: { years, events },
            },
            { headers: API_CACHE_HEADERS }
          );
        }
      } catch (dbErr) {
        console.warn("[Timeline] MySQL query error, falling back to local json:", dbErr);
      }
    }

    // Ambil langsung dari milestone.json lokal (respon instan <5ms tanpa request gantung)
    const local = getLocalMilestones();
    if (local) {
      return NextResponse.json({ status: true, success: true, data: local }, { headers: API_CACHE_HEADERS });
    }

    return NextResponse.json({ status: true, success: true, data: { years: [], events: [] } }, { headers: API_CACHE_HEADERS });
  } catch (error: any) {
    const local = getLocalMilestones();
    if (local) {
      return NextResponse.json({ status: true, success: true, data: local }, { headers: API_CACHE_HEADERS });
    }
    return NextResponse.json(
      { status: false, success: false, message: error.message, data: { years: [], events: [] } },
      { status: 200, headers: API_CACHE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isMySqlConfigured()) {
      return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });
    }
    const result: any = await query(
      "INSERT INTO `timeline` (`year`, `date_label`, `title`, `description`, `image_url`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        body.year || "2026",
        body.date_label || body.event_date || "",
        body.title || "",
        body.description || "",
        body.image_url || "",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      ]
    );
    // Sinkronisasi realtime ke src/data/milestone.json agar frontend langsung terupdate
    try {
      const filePath = path.join(process.cwd(), "src", "data", "milestone.json");
      let list: any[] = [];
      if (fs.existsSync(filePath)) {
        list = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
      list.push({
        id: String(result.insertId || Date.now()),
        year: String(body.year || "2026"),
        date_label: body.date_label || body.event_date || "",
        event_date: body.event_date || body.date_label || "",
        title: body.title || "",
        description: body.description || "",
        image_url: body.image_url || "/images/about/timeline-2024-1.jpeg",
        handwriting_caption: body.handwriting_caption || body.title || "",
        sort_order: Number(body.sort_order) || list.length + 1,
        is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      });
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    } catch (e) {
      console.warn("Gagal sinkronisasi file milestone.json:", e);
    }

    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Timeline berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
