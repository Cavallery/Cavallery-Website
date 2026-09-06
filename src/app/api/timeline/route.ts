import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import { API_CACHE_HEADERS, fetchWithCacheAndFallback } from "@/lib/apiCache";
import fs from "fs";
import path from "path";

const EXTERNAL_TIMELINE_URL = "https://v5.jkt48connect.com/api/cavallery/timeline?apikey=JKTCONNECT";

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
        const years = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
        return { years, events: list };
      }
    }
  } catch (e) {
    console.error("Failed to read local milestone.json:", e);
  }
  return null;
}

async function fetchExternalTimeline() {
  return fetchWithCacheAndFallback<any>({
    key: "external_timeline",
    ttlSeconds: 180,
    fetcher: async () => {
      const res = await fetch(EXTERNAL_TIMELINE_URL, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 CavalleryApp/1.0",
        },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data) {
          return json.data;
        }
      }
      return null;
    },
    fallbackData: null,
  });
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>(
        "SELECT * FROM `timeline` WHERE `is_active` = 1 ORDER BY `year` DESC, `sort_order` ASC, `id` DESC"
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
        const years = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
        return NextResponse.json(
          {
            status: true,
            success: true,
            data: { years, events },
          },
          { headers: API_CACHE_HEADERS }
        );
      }
    }

    // Check local milestone.json
    const local = getLocalMilestones();
    if (local) {
      return NextResponse.json({ status: true, success: true, data: local }, { headers: API_CACHE_HEADERS });
    }

    // Fallback to external timeline
    const external = await fetchExternalTimeline();
    if (external) {
      return NextResponse.json({ status: true, success: true, data: external }, { headers: API_CACHE_HEADERS });
    }

    return NextResponse.json({ status: true, success: true, data: { years: [], events: [] } }, { headers: API_CACHE_HEADERS });
  } catch (error: any) {
    const local = getLocalMilestones();
    if (local) {
      return NextResponse.json({ status: true, success: true, data: local }, { headers: API_CACHE_HEADERS });
    }
    const external = await fetchExternalTimeline();
    if (external) {
      return NextResponse.json({ status: true, success: true, data: external }, { headers: API_CACHE_HEADERS });
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
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Timeline berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
