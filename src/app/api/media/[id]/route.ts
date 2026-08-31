import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "media.json");
const PUB_FILE_PATH = path.join(process.cwd(), "src", "data", "published-media.json");

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

function removeFromPublishedJson(targetId: string, publicUrl?: string, fileName?: string) {
  try {
    if (fs.existsSync(PUB_FILE_PATH)) {
      const raw = fs.readFileSync(PUB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.publishedIds)) {
        parsed.publishedIds = parsed.publishedIds.filter(
          (x: string) => x !== targetId && x !== publicUrl && x !== fileName
        );
        fs.writeFileSync(PUB_FILE_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      }
    }
  } catch {}
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    if (isMySqlConfigured()) {
      try {
        const rows = await query<any[]>(
          "SELECT * FROM `media` WHERE `id` = ? OR `file_name` = ? OR `public_url` = ? OR `original_name` = ?",
          [cleanId, cleanId, cleanId, cleanId]
        );
        if (rows && rows.length > 0) {
          for (const item of rows) {
            if (item.public_url && item.public_url.startsWith("/uploads/")) {
              const localPath = path.join(process.cwd(), "public", item.public_url.replace(/^\//, ""));
              if (fs.existsSync(localPath)) {
                try {
                  fs.unlinkSync(localPath);
                } catch {}
              }
            }
            removeFromPublishedJson(String(item.id), item.public_url, item.file_name);
          }
          await query(
            "DELETE FROM `media` WHERE `id` = ? OR `file_name` = ? OR `public_url` = ? OR `original_name` = ?",
            [cleanId, cleanId, cleanId, cleanId]
          );
        }
      } catch (dbErr: any) {
        console.warn("MySQL Media Delete Warn:", dbErr.message);
      }
    }

    // JSON fallback
    let items = readJsonFallback();
    const targets = items.filter(
      (i) =>
        String(i.id) === cleanId ||
        String(i.file_name) === cleanId ||
        String(i.public_url) === cleanId ||
        String(i.original_name) === cleanId
    );

    for (const target of targets) {
      if (target.public_url && target.public_url.startsWith("/uploads/")) {
        const localPath = path.join(process.cwd(), "public", target.public_url.replace(/^\//, ""));
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch {}
        }
      }
      removeFromPublishedJson(String(target.id), target.public_url, target.file_name);
    }

    items = items.filter(
      (i) =>
        String(i.id) !== cleanId &&
        String(i.file_name) !== cleanId &&
        String(i.public_url) !== cleanId &&
        String(i.original_name) !== cleanId
    );
    saveJsonFallback(items);

    return NextResponse.json({ status: true, success: true, message: "Media berhasil dihapus permanen" });
  } catch (error: any) {
    console.error("Media Delete Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus media" },
      { status: 500 }
    );
  }
}
