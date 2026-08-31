import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "media.json");

function readJsonFallback(): any[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveJsonFallback(data: any[]) {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

/**
 * POST /api/media/reorder
 * Body: { orderedIds: string[] }
 * Updates sort_order for each media item based on its index in the array.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderedIds: string[] = body.orderedIds;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { status: false, message: "orderedIds harus berupa array ID media" },
        { status: 400 }
      );
    }

    // Update MySQL
    if (isMySqlConfigured()) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await query(
            "UPDATE `media` SET `sort_order` = ? WHERE `id` = ?",
            [i, orderedIds[i]]
          );
        }
      } catch (dbErr: any) {
        console.warn("MySQL Media Reorder Warn:", dbErr.message);
      }
    }

    // Update JSON fallback
    const items = readJsonFallback();
    for (let i = 0; i < orderedIds.length; i++) {
      const item = items.find((it) => String(it.id) === String(orderedIds[i]));
      if (item) {
        item.sort_order = i;
        item.updated_at = new Date().toISOString();
      }
    }
    // Sort the JSON items by sort_order
    items.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    saveJsonFallback(items);

    return NextResponse.json({
      status: true,
      success: true,
      message: `Urutan ${orderedIds.length} media berhasil diperbarui`,
    });
  } catch (error: any) {
    console.error("Media Reorder Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengubah urutan media" },
      { status: 500 }
    );
  }
}
