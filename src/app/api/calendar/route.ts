import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const CALENDAR_PATH = path.join(DATA_DIR, "calendar.json");

function ensureDataDirectory() {
  const dir = path.dirname(CALENDAR_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ---------- LOCAL JSON FALLBACK ----------
function readCalendarLocal(): any[] {
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

function writeCalendarLocal(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(CALENDAR_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- MySQL → JSON row mapper ----------
function rowToEvent(row: any) {
  let members: any[] = [];
  try {
    members = typeof row.members_json === "string" ? JSON.parse(row.members_json) : row.members_json || [];
  } catch { members = []; }

  return {
    id: row.id,
    title: row.title,
    date: row.date instanceof Date
      ? row.date.toISOString().slice(0, 10)
      : String(row.date).slice(0, 10),
    startTime: row.start_time || "00:00",
    members,
    url: row.url || "",
    imageUrl: row.image_url || "",
  };
}

const API_KEY = "sJbpVqLinYlp";
const JKT48_BASE = "https://v5.jkt48connect.com/api/jkt48";

async function fetchJkt48OfficialEvents(): Promise<any[]> {
  try {
    const res = await fetch(`${JKT48_BASE}/schedule?priority_token=${API_KEY}`, {
      headers: {
        "x-priority-token": API_KEY,
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.schedule) ? json.schedule : (Array.isArray(json) ? json : []));
    return list.map((item: any, idx: number) => ({
      id: `jkt48-${item.id || item.schedule_id || idx}`,
      title: item.title || item.event_name || item.name || "Event JKT48",
      date: item.date || item.showDate || new Date().toISOString().slice(0, 10),
      startTime: item.startTime || item.start_time || "19:00",
      members: item.members || item.member || [{ name: "JKT48" }],
      url: item.url || item.link || (item.id ? `https://jkt48.com/calendar/list/id/${item.id}?lang=id` : "#"),
      imageUrl: item.image_url || item.poster || item.banner || "",
      isOfficial: true,
    }));
  } catch {
    return [];
  }
}

// ---------- READ ----------
export async function readCalendar(): Promise<any[]> {
  if (isMySqlConfigured()) {
    const rows = await query<any[]>("SELECT * FROM `calendar_events` WHERE `is_active`=1 ORDER BY `date` ASC");
    if (rows && rows.length >= 0) {
      return rows.map(rowToEvent);
    }
  }
  return readCalendarLocal();
}

// ---------- GET ----------
export async function GET() {
  const localData = await readCalendar();
  const officialEvents = await fetchJkt48OfficialEvents();

  const merged = [...localData, ...officialEvents];
  const seen = new Set<string>();
  const unique = merged.filter((item: any) => {
    const key = `${item.title}-${item.date}-${item.startTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ success: true, data: unique });
}

// ---------- POST ----------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Bulk save (array body)
    if (Array.isArray(body)) {
      if (isMySqlConfigured()) {
        await query("DELETE FROM `calendar_events`");
        for (const item of body) {
          await query(
            "INSERT INTO `calendar_events` (`id`,`title`,`date`,`start_time`,`members_json`,`url`,`image_url`) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`),`date`=VALUES(`date`),`start_time`=VALUES(`start_time`),`members_json`=VALUES(`members_json`),`url`=VALUES(`url`),`image_url`=VALUES(`image_url`)",
            [item.id || Date.now().toString(), item.title, item.date, item.startTime || "00:00", JSON.stringify(item.members || []), item.url || "", item.imageUrl || ""]
          );
        }
      }
      writeCalendarLocal(body);
      return NextResponse.json({ success: true, data: body });
    }

    // ---------- ADD ----------
    if (body.action === "add") {
      const newItem = {
        id: body.id || Date.now().toString(),
        title: body.title,
        date: body.date,
        startTime: body.startTime || "00:00",
        members: body.members || [{ name: "Cavallery" }],
        url: body.url || "",
        imageUrl: body.imageUrl || "",
      };

      if (isMySqlConfigured()) {
        await query(
          "INSERT INTO `calendar_events` (`id`,`title`,`date`,`start_time`,`members_json`,`url`,`image_url`) VALUES (?,?,?,?,?,?,?)",
          [newItem.id, newItem.title, newItem.date, newItem.startTime, JSON.stringify(newItem.members), newItem.url, newItem.imageUrl]
        );
      }

      const data = readCalendarLocal();
      data.push(newItem);
      writeCalendarLocal(data);
      return NextResponse.json({ success: true, data });

    // ---------- DELETE ----------
    } else if (body.action === "delete") {
      if (isMySqlConfigured()) {
        await query("DELETE FROM `calendar_events` WHERE `id`=?", [body.id]);
      }

      let data = readCalendarLocal();
      data = data.filter((item: any) => item.id !== body.id);
      writeCalendarLocal(data);
      return NextResponse.json({ success: true, data });

    // ---------- UPDATE ----------
    } else if (body.action === "update") {
      if (isMySqlConfigured() && body.item) {
        const i = body.item;
        await query(
          "UPDATE `calendar_events` SET `title`=?,`date`=?,`start_time`=?,`members_json`=?,`url`=?,`image_url`=? WHERE `id`=?",
          [i.title, i.date, i.startTime || "00:00", JSON.stringify(i.members || []), i.url || "", i.imageUrl || "", body.id]
        );
      }

      let data = readCalendarLocal();
      const index = data.findIndex((item: any) => item.id === body.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...body.item };
        writeCalendarLocal(data);
      }
      return NextResponse.json({ success: true, data });

    // ---------- SAVE ALL ----------
    } else if (body.action === "saveAll") {
      if (isMySqlConfigured()) {
        await query("DELETE FROM `calendar_events`");
        for (const item of (body.data || [])) {
          await query(
            "INSERT INTO `calendar_events` (`id`,`title`,`date`,`start_time`,`members_json`,`url`,`image_url`) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE `title`=VALUES(`title`),`date`=VALUES(`date`),`start_time`=VALUES(`start_time`),`members_json`=VALUES(`members_json`),`url`=VALUES(`url`),`image_url`=VALUES(`image_url`)",
            [item.id || Date.now().toString(), item.title, item.date, item.startTime || "00:00", JSON.stringify(item.members || []), item.url || "", item.imageUrl || ""]
          );
        }
      }
      writeCalendarLocal(body.data);
      return NextResponse.json({ success: true, data: body.data });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
