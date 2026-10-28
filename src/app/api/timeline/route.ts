import { NextResponse } from "next/server";
import { getTimelineData } from "@/lib/timelineService";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTimelineData();
    return NextResponse.json(
      {
        status: true,
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: false, success: false, message: error.message, data: { years: [], events: [] } },
      { status: 200 }
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

    // Sinkronisasi realtime ke src/data/milestone.json jika memungkinkan (dev environment)
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
      // Ignored in read-only production environments
    }

    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Timeline berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
