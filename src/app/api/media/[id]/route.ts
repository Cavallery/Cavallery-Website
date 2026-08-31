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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isMySqlConfigured()) {
      try {
        const rows = await query<any[]>("SELECT * FROM `media` WHERE `id` = ?", [id]);
        if (rows && rows.length > 0) {
          const item = rows[0];
          if (item.public_url && item.public_url.startsWith("/uploads/")) {
            const localPath = path.join(process.cwd(), "public", item.public_url.replace(/^\//, ""));
            if (fs.existsSync(localPath)) {
              try {
                fs.unlinkSync(localPath);
              } catch {}
            }
          }
          await query("DELETE FROM `media` WHERE `id` = ?", [id]);
        }
      } catch (dbErr: any) {
        console.warn("MySQL Media Delete Warn:", dbErr.message);
      }
    }

    // JSON fallback
    let items = readJsonFallback();
    const target = items.find((i) => String(i.id) === String(id));
    if (target && target.public_url && target.public_url.startsWith("/uploads/")) {
      const localPath = path.join(process.cwd(), "public", target.public_url.replace(/^\//, ""));
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch {}
      }
    }
    items = items.filter((i) => String(i.id) !== String(id));
    saveJsonFallback(items);

    return NextResponse.json({ status: true, success: true, message: "Media berhasil dihapus" });
  } catch (error: any) {
    console.error("Media Delete Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus media" },
      { status: 500 }
    );
  }
}
