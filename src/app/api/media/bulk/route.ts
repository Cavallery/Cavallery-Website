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

async function handleBulkDelete(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return;

  if (isMySqlConfigured()) {
    try {
      const placeholders = ids.map(() => "?").join(",");
      const rows = await query<any[]>(`SELECT * FROM \`media\` WHERE \`id\` IN (${placeholders})`, ids);
      if (rows && Array.isArray(rows)) {
        for (const item of rows) {
          if (item.public_url && item.public_url.startsWith("/uploads/")) {
            const localPath = path.join(process.cwd(), "public", item.public_url.replace(/^\//, ""));
            if (fs.existsSync(localPath)) {
              try {
                fs.unlinkSync(localPath);
              } catch {}
            }
          }
        }
      }
      await query(`DELETE FROM \`media\` WHERE \`id\` IN (${placeholders})`, ids);
    } catch (dbErr: any) {
      console.warn("MySQL Bulk Delete Warn:", dbErr.message);
    }
  }

  // JSON fallback
  let items = readJsonFallback();
  for (const id of ids) {
    const target = items.find((i) => String(i.id) === String(id));
    if (target && target.public_url && target.public_url.startsWith("/uploads/")) {
      const localPath = path.join(process.cwd(), "public", target.public_url.replace(/^\//, ""));
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch {}
      }
    }
  }
  items = items.filter((i) => !ids.map(String).includes(String(i.id)));
  saveJsonFallback(items);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || (body.action === "delete" ? body.ids : []);
    if (Array.isArray(ids) && ids.length > 0) {
      await handleBulkDelete(ids);
    }
    return NextResponse.json({ status: true, message: `${ids.length} media berhasil dihapus` });
  } catch (error: any) {
    console.error("Media Bulk Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal memproses bulk action" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || [];
    if (Array.isArray(ids) && ids.length > 0) {
      await handleBulkDelete(ids);
    }
    return NextResponse.json({ status: true, message: `${ids.length} media berhasil dihapus` });
  } catch (error: any) {
    console.error("Media Bulk Delete Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus bulk media" },
      { status: 500 }
    );
  }
}
