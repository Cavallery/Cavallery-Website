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
    { id: "1", platform: "twitter", url: "https://twitter.com/CErine_JKT48/status/2056685755616104632" },
    { id: "2", platform: "tiktok", url: "https://www.tiktok.com/@jkt48.erine_/video/7640445924992470280" },
    { id: "3", platform: "instagram", url: "https://www.instagram.com/p/DXt1vRJEpuf" },
    { id: "4", platform: "threads", url: "https://www.threads.net/@jkt48.erine/post/DXt1wb4EjK2" },
  ];
  fs.writeFileSync(UPDATES_PATH, JSON.stringify(defaultUpdates, null, 2), "utf-8");
  return defaultUpdates;
}

function writeUpdatesLocal(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(UPDATES_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function resolveTiktokUrl(inputUrl: string): Promise<string> {
  const standardMatch = inputUrl.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  if (standardMatch) return inputUrl;

  try {
    const redirectRes = await fetch(inputUrl, { redirect: "follow" });
    const resolvedUrl = redirectRes.url;
    const resolvedMatch = resolvedUrl.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
    if (resolvedMatch) return resolvedUrl.split("?")[0];
  } catch (e) {
    console.error("Redirect follow failed:", e);
  }

  try {
    const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(inputUrl)}`);
    const oembed = await oembedRes.json();
    const htmlStr = oembed.html || "";
    const idMatch = htmlStr.match(/data-video-id="(\d+)"/);
    const authorUrl = oembed.author_url || "";
    const userMatch = authorUrl.match(/\/@([\w.]+)/);
    const username = userMatch ? userMatch[1] : "jkt48.erine_";

    if (idMatch && idMatch[1]) {
      return `https://www.tiktok.com/@${username}/video/${idMatch[1]}`;
    }
  } catch (e) {
    console.error("oEmbed fallback failed:", e);
  }

  return inputUrl;
}

function isTiktokShortUrl(url: string): boolean {
  return (
    url.includes("vt.tiktok.com") ||
    url.includes("vm.tiktok.com") ||
    url.includes("tiktok.com/t/") ||
    (url.includes("tiktok.com") && !/\/video\/\d+/.test(url))
  );
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `updates` WHERE `is_active`=1 ORDER BY `id` ASC");
      if (rows && Array.isArray(rows)) {
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
      if (isMySqlConfigured()) {
        await query("DELETE FROM `updates`");
        for (const item of body) {
          await query(
            "INSERT INTO `updates` (`platform`, `url`, `is_active`) VALUES (?, ?, 1)",
            [item.platform, item.url]
          );
        }
      }
      writeUpdatesLocal(body);
      return NextResponse.json({ success: true, data: body });
    }

    if (body.action === "add") {
      let finalUrl = body.url;
      const platform = body.platform;

      if (platform === "tiktok" && isTiktokShortUrl(finalUrl)) {
        finalUrl = await resolveTiktokUrl(finalUrl);
      }

      if (isMySqlConfigured()) {
        await query(
          "INSERT INTO `updates` (`platform`, `url`, `is_active`) VALUES (?, ?, 1)",
          [platform, finalUrl]
        );
      }

      const data = readUpdatesLocal();
      data.push({
        id: body.id || Date.now().toString(),
        platform,
        url: finalUrl,
      });
      writeUpdatesLocal(data);
      return NextResponse.json({ success: true, data });
    } else if (body.action === "delete") {
      if (isMySqlConfigured()) {
        await query("DELETE FROM `updates` WHERE `id`=? OR `url`=?", [body.id, body.url || ""]);
      }

      let data = readUpdatesLocal();
      data = data.filter((item: any) => item.id !== body.id);
      writeUpdatesLocal(data);
      return NextResponse.json({ success: true, data });
    } else if (body.action === "update") {
      let data = readUpdatesLocal();
      const index = data.findIndex((item: any) => item.id === body.id);
      if (index !== -1) {
        let finalUrl = body.item.url || data[index].url;
        const platform = body.item.platform || data[index].platform;

        if (platform === "tiktok" && isTiktokShortUrl(finalUrl)) {
          finalUrl = await resolveTiktokUrl(finalUrl);
        }

        if (isMySqlConfigured()) {
          await query("UPDATE `updates` SET `platform`=?, `url`=? WHERE `id`=?", [platform, finalUrl, body.id]);
        }

        data[index] = { ...data[index], ...body.item, url: finalUrl, platform };
        writeUpdatesLocal(data);
      }
      return NextResponse.json({ success: true, data });
    } else if (body.action === "saveAll") {
      if (isMySqlConfigured()) {
        await query("DELETE FROM `updates`");
        for (const item of (body.data || [])) {
          await query(
            "INSERT INTO `updates` (`platform`, `url`, `is_active`) VALUES (?, ?, 1)",
            [item.platform, item.url]
          );
        }
      }
      writeUpdatesLocal(body.data);
      return NextResponse.json({ success: true, data: body.data });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
