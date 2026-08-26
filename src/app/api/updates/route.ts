import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const UPDATES_PATH = path.join(DATA_DIR, "updates.json");

function ensureDataDirectory() {
  const dir = path.dirname(UPDATES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readUpdatesLocal() {
  ensureDataDirectory();
  if (fs.existsSync(UPDATES_PATH)) {
    try {
      const content = fs.readFileSync(UPDATES_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading updates.json:", e);
    }
  }

  const defaultUpdates = [
    { id: "1", platform: "twitter", url: "https://x.com/CErine_JKT48/status/2080953550021308492" },
    { id: "2", platform: "tiktok", url: "https://www.tiktok.com/@jkt48.erine_/video/7646420621764627719" },
    { id: "3", platform: "instagram", url: "https://www.tiktok.com/@jkt48.erine_/video/7663816612352396552" },
    { id: "4", platform: "threads", url: "https://www.threads.net/@jkt48.erine/post/DXt1wb4EjK2" },
  ];
  try {
    fs.writeFileSync(UPDATES_PATH, JSON.stringify(defaultUpdates, null, 2), "utf-8");
  } catch {}
  return defaultUpdates;
}

function writeUpdatesLocal(data: any[]) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(UPDATES_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

async function syncToMySql(updatesList: any[]) {
  if (!isMySqlConfigured()) return;
  try {
    await query("DELETE FROM `updates`");
    for (const item of updatesList) {
      await query(
        "INSERT INTO `updates` (`platform`, `url`, `is_active`) VALUES (?, ?, 1)",
        [item.platform || "twitter", item.url || ""]
      );
    }
  } catch (e) {
    console.error("Failed to sync updates to MySQL:", e);
  }
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `updates` WHERE `is_active`=1 ORDER BY `id` ASC");
      if (rows && Array.isArray(rows) && rows.length > 0) {
        const mapped = rows.map((r) => ({
          id: String(r.id),
          platform: r.platform,
          url: r.url,
          title: r.title,
        }));
        return NextResponse.json({ success: true, data: mapped });
      }
    }
    const data = readUpdatesLocal();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: true, data: readUpdatesLocal() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      writeUpdatesLocal(body);
      await syncToMySql(body);
      return NextResponse.json({ success: true, data: body });
    }

    if (body.data && Array.isArray(body.data)) {
      writeUpdatesLocal(body.data);
      await syncToMySql(body.data);
      return NextResponse.json({ success: true, data: body.data });
    }

    let localList = readUpdatesLocal();

    if (body.action === "add") {
      const newEntry = {
        id: body.id || Date.now().toString(),
        platform: body.platform || "twitter",
        url: body.url || "",
      };
      localList.push(newEntry);
      writeUpdatesLocal(localList);
      await syncToMySql(localList);
      return NextResponse.json({ success: true, data: localList });
    } else if (body.action === "delete") {
      localList = localList.filter((item: any) => String(item.id) !== String(body.id));
      writeUpdatesLocal(localList);
      await syncToMySql(localList);
      return NextResponse.json({ success: true, data: localList });
    } else if (body.action === "update") {
      const index = localList.findIndex((item: any) => String(item.id) === String(body.id));
      if (index !== -1) {
        localList[index] = {
          ...localList[index],
          ...(body.item || {}),
          platform: body.platform || body.item?.platform || localList[index].platform,
          url: body.url || body.item?.url || localList[index].url,
        };
      }
      writeUpdatesLocal(localList);
      await syncToMySql(localList);
      return NextResponse.json({ success: true, data: localList });
    }

    return NextResponse.json({ success: true, data: localList });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
