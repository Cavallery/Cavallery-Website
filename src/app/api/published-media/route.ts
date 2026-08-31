import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

const staticPath = path.join(process.cwd(), "src", "data", "published-media.json");
const mediaJsonPath = path.join(process.cwd(), "src", "data", "media.json");

function readFallbackIds(): string[] {
  try {
    if (fs.existsSync(staticPath)) {
      const raw = fs.readFileSync(staticPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.publishedIds)) {
        return parsed.publishedIds;
      }
    }
  } catch {}
  return [];
}

function updateMediaJson(id: string, isPublished: boolean) {
  try {
    if (fs.existsSync(mediaJsonPath)) {
      const raw = fs.readFileSync(mediaJsonPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const item = parsed.find((i) => String(i.id) === String(id));
        if (item) {
          item.is_published = isPublished ? 1 : 0;
          item.updated_at = new Date().toISOString();
          fs.writeFileSync(mediaJsonPath, JSON.stringify(parsed, null, 2), "utf-8");
        }
      }
    }
  } catch {}
}

export async function GET() {
  try {
    // Primary: read from MySQL
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT `id`, `public_url`, `file_name` FROM `media` WHERE `is_published` = 1 AND `deleted_at` IS NULL");
      if (rows && Array.isArray(rows)) {
        const publishedIds: string[] = [];
        rows.forEach((r: any) => {
          if (r.id) publishedIds.push(String(r.id));
          if (r.public_url) publishedIds.push(String(r.public_url));
          if (r.file_name) publishedIds.push(String(r.file_name));
        });
        return NextResponse.json({ success: true, publishedIds }, { status: 200 });
      }
    }
  } catch (e: any) {
    console.warn("published-media GET MySQL error:", e.message);
  }

  // Fallback: read from JSON file
  const publishedIds = readFallbackIds();
  return NextResponse.json({ success: true, publishedIds }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, ids, isPublished } = body;

    if (isMySqlConfigured()) {
      try {
        if (action === "toggle" && id) {
          // Toggle is_published for a single media item
          await query(
            "UPDATE `media` SET `is_published` = IF(`is_published` = 1, 0, 1) WHERE `id` = ?",
            [id]
          );
        } else if (action === "set" && id) {
          const newVal = isPublished ? 1 : 0;
          await query(
            "UPDATE `media` SET `is_published` = ? WHERE `id` = ?",
            [newVal, id]
          );
        } else if (action === "setAll" && Array.isArray(ids)) {
          await query("UPDATE `media` SET `is_published` = 0");
          if (ids.length > 0) {
            const placeholders = ids.map(() => "?").join(",");
            await query(
              `UPDATE \`media\` SET \`is_published\` = 1 WHERE \`id\` IN (${placeholders})`,
              ids
            );
          }
        }

        const rows = await query<any[]>("SELECT `id`, `public_url`, `file_name` FROM `media` WHERE `is_published` = 1 AND `deleted_at` IS NULL");
        const publishedIds: string[] = [];
        if (rows && Array.isArray(rows)) {
          rows.forEach((r: any) => {
            if (r.id) publishedIds.push(String(r.id));
            if (r.public_url) publishedIds.push(String(r.public_url));
            if (r.file_name) publishedIds.push(String(r.file_name));
          });
        }
        return NextResponse.json({ success: true, publishedIds }, { status: 200 });
      } catch (dbErr: any) {
        console.warn("MySQL Published Media Post Warn:", dbErr.message);
      }
    }

    // Fallback: JSON file (legacy)
    let current = readFallbackIds();

    if (action === "toggle" && id) {
      if (current.includes(id)) {
        current = current.filter((item) => item !== id);
        updateMediaJson(id, false);
      } else {
        current.push(id);
        updateMediaJson(id, true);
      }
    } else if (action === "set" && id) {
      if (isPublished) {
        if (!current.includes(id)) current.push(id);
        updateMediaJson(id, true);
      } else {
        current = current.filter((item) => item !== id);
        updateMediaJson(id, false);
      }
    } else if (action === "setAll" && Array.isArray(ids)) {
      current = ids;
    }

    try {
      const dir = path.dirname(staticPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(staticPath, JSON.stringify({ publishedIds: current }, null, 2), "utf-8");
    } catch {}

    return NextResponse.json({ success: true, publishedIds: current }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menyimpan status publikasi" }, { status: 500 });
  }
}
