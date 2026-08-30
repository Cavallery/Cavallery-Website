import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

// Fallback JSON path (legacy, used only when MySQL is not configured)
const staticPath = path.join(process.cwd(), "src", "data", "published-media.json");

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

export async function GET() {
  try {
    // Primary: read from MySQL
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT `id` FROM `media` WHERE `is_published` = 1");
      if (rows && Array.isArray(rows)) {
        const publishedIds = rows.map((r: any) => String(r.id));
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
      // Use MySQL as source of truth
      if (action === "toggle" && id) {
        // Toggle is_published for a single media item
        await query(
          "UPDATE `media` SET `is_published` = IF(`is_published` = 1, 0, 1) WHERE `id` = ?",
          [id]
        );
      } else if (action === "set" && id) {
        // Set is_published to a specific value
        const newVal = isPublished ? 1 : 0;
        await query(
          "UPDATE `media` SET `is_published` = ? WHERE `id` = ?",
          [newVal, id]
        );
      } else if (action === "setAll" && Array.isArray(ids)) {
        // Unpublish all first, then publish only the specified IDs
        await query("UPDATE `media` SET `is_published` = 0");
        if (ids.length > 0) {
          const placeholders = ids.map(() => "?").join(",");
          await query(
            `UPDATE \`media\` SET \`is_published\` = 1 WHERE \`id\` IN (${placeholders})`,
            ids
          );
        }
      }

      // Return updated list of published IDs
      const rows = await query<any[]>("SELECT `id` FROM `media` WHERE `is_published` = 1");
      const publishedIds = (rows && Array.isArray(rows)) ? rows.map((r: any) => String(r.id)) : [];
      return NextResponse.json({ success: true, publishedIds }, { status: 200 });
    }

    // Fallback: JSON file (legacy)
    let current = readFallbackIds();

    if (action === "toggle" && id) {
      if (current.includes(id)) {
        current = current.filter((item) => item !== id);
      } else {
        current.push(id);
      }
    } else if (action === "set" && id) {
      if (isPublished) {
        if (!current.includes(id)) current.push(id);
      } else {
        current = current.filter((item) => item !== id);
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
