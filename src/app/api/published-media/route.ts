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
        return parsed.publishedIds.map(String);
      }
    }
  } catch {}
  return [];
}

function updateMediaJson(targetId: string, isPublished: boolean) {
  try {
    if (fs.existsSync(mediaJsonPath)) {
      const raw = fs.readFileSync(mediaJsonPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let changed = false;
        parsed.forEach((item) => {
          if (
            String(item.id) === targetId ||
            String(item.public_url) === targetId ||
            String(item.file_name) === targetId ||
            String(item.original_name) === targetId
          ) {
            item.is_published = isPublished ? 1 : 0;
            item.updated_at = new Date().toISOString();
            changed = true;
          }
        });
        if (changed) {
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
      const rows = await query<any[]>(
        "SELECT `id`, `public_url`, `file_name` FROM `media` WHERE `is_published` = 1 AND `deleted_at` IS NULL"
      );
      if (rows && Array.isArray(rows)) {
        const publishedIds: string[] = [];
        rows.forEach((r: any) => {
          if (r.id) publishedIds.push(String(r.id));
        });
        return NextResponse.json({ success: true, publishedIds }, { status: 200 });
      }
    }
  } catch (e: any) {
    console.warn("published-media GET MySQL error:", e.message);
  }

  // Fallback: read from JSON file
  const fallbackItems = readFallbackIds();
  return NextResponse.json({ success: true, publishedIds: fallbackItems }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, ids, isPublished } = body;
    const targetId = String(id || "").trim();

    // Get item info from JSON or DB to know all aliases (id, public_url, file_name)
    let relatedKeys: string[] = [targetId];
    if (fs.existsSync(mediaJsonPath)) {
      try {
        const raw = fs.readFileSync(mediaJsonPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const match = parsed.find(
            (i) =>
              String(i.id) === targetId ||
              String(i.public_url) === targetId ||
              String(i.file_name) === targetId
          );
          if (match) {
            if (match.id) relatedKeys.push(String(match.id));
            if (match.public_url) relatedKeys.push(String(match.public_url));
            if (match.file_name) relatedKeys.push(String(match.file_name));
          }
        }
      } catch {}
    }

    let newStatus = isPublished !== undefined ? Boolean(isPublished) : true;

    if (isMySqlConfigured() && targetId) {
      try {
        if (action === "toggle") {
          const check = await query<any[]>(
            "SELECT `id`, `is_published`, `public_url`, `file_name` FROM `media` WHERE `id` = ? OR `public_url` = ? OR `file_name` = ? LIMIT 1",
            [targetId, targetId, targetId]
          );
          if (check && check.length > 0) {
            newStatus = Number(check[0].is_published) !== 1;
            if (check[0].id) relatedKeys.push(String(check[0].id));
            if (check[0].public_url) relatedKeys.push(String(check[0].public_url));
            if (check[0].file_name) relatedKeys.push(String(check[0].file_name));
          } else {
            newStatus = !readFallbackIds().includes(targetId);
          }
          await query(
            "UPDATE `media` SET `is_published` = ? WHERE `id` = ? OR `public_url` = ? OR `file_name` = ?",
            [newStatus ? 1 : 0, targetId, targetId, targetId]
          );
        } else if (action === "set") {
          const val = isPublished ? 1 : 0;
          await query(
            "UPDATE `media` SET `is_published` = ? WHERE `id` = ? OR `public_url` = ? OR `file_name` = ?",
            [val, targetId, targetId, targetId]
          );
        } else if (action === "setAll" && Array.isArray(ids)) {
          await query("UPDATE `media` SET `is_published` = 0");
          if (ids.length > 0) {
            const placeholders = ids.map(() => "?").join(",");
            await query(
              `UPDATE \`media\` SET \`is_published\` = 1 WHERE \`id\` IN (${placeholders}) OR \`public_url\` IN (${placeholders})`,
              [...ids, ...ids]
            );
          }
        }
      } catch (dbErr: any) {
        console.warn("MySQL Published Media Post Warn:", dbErr.message);
      }
    }

    // Clean JSON fallback
    let current = readFallbackIds();

    if (action === "toggle" && targetId) {
      if (!newStatus) {
        // HIDE: Remove all related keys
        current = current.filter((item) => !relatedKeys.includes(item));
        updateMediaJson(targetId, false);
      } else {
        // SHOW: Add targetId
        if (!current.includes(targetId)) current.push(targetId);
        updateMediaJson(targetId, true);
      }
    } else if (action === "set" && targetId) {
      if (isPublished) {
        if (!current.includes(targetId)) current.push(targetId);
        updateMediaJson(targetId, true);
      } else {
        current = current.filter((item) => !relatedKeys.includes(item));
        updateMediaJson(targetId, false);
      }
    } else if (action === "setAll" && Array.isArray(ids)) {
      current = ids.map(String);
    }

    try {
      const dir = path.dirname(staticPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(staticPath, JSON.stringify({ publishedIds: current }, null, 2), "utf-8");
    } catch {}

    return NextResponse.json({
      success: true,
      newStatus,
      publishedIds: current,
      message: newStatus ? "Media berhasil ditampilkan" : "Media berhasil disembunyikan",
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Gagal menyimpan status publikasi" }, { status: 500 });
  }
}
