import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

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

let tableEnsured = false;
export async function ensureMediaTable() {
  if (tableEnsured || !isMySqlConfigured()) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`media\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`original_name\` VARCHAR(255) NOT NULL,
        \`file_name\` VARCHAR(255) NOT NULL,
        \`folder\` VARCHAR(100) DEFAULT 'cavallery/images',
        \`type\` ENUM('image', 'video', 'document') DEFAULT 'image',
        \`mime_type\` VARCHAR(100) NOT NULL,
        \`file_size\` INT DEFAULT 0,
        \`public_url\` TEXT NOT NULL,
        \`alt_text\` VARCHAR(255) NULL,
        \`is_published\` TINYINT(1) DEFAULT 1,
        \`sort_order\` INT DEFAULT 0,
        \`deleted_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_media_folder\` (\`folder\`),
        INDEX \`idx_media_type\` (\`type\`),
        INDEX \`idx_media_published\` (\`is_published\`),
        INDEX \`idx_media_created\` (\`created_at\`),
        INDEX \`idx_media_sort\` (\`sort_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    // Add sort_order column if table existed before without it
    try {
      await query("ALTER TABLE `media` ADD COLUMN `sort_order` INT DEFAULT 0 AFTER `is_published`");
    } catch {}
    try {
      await query("CREATE INDEX `idx_media_sort` ON `media` (`sort_order`)");
    } catch {}
    tableEnsured = true;
  } catch (err: any) {
    console.warn("Ensure media table warn:", err.message);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "";
    const type = searchParams.get("type") || "";
    const publishedOnly = searchParams.get("published_only") === "true";
    const limit = Number(searchParams.get("limit") || 500);
    const offset = Number(searchParams.get("offset") || 0);

    // 1. MySQL Storage
    if (isMySqlConfigured()) {
      await ensureMediaTable();
      try {
        const conditions: string[] = ["1=1"];
        const params: any[] = [];

        if (search) {
          conditions.push("(`original_name` LIKE ? OR `alt_text` LIKE ? OR `file_name` LIKE ?)");
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (folder) {
          conditions.push("`folder` = ?");
          params.push(folder);
        }
        if (type) {
          conditions.push("`type` = ?");
          params.push(type);
        }
        if (publishedOnly) {
          conditions.push("`is_published` = 1");
        }

        const whereClause = conditions.join(" AND ");
        const countRows = await query<any[]>(
          `SELECT COUNT(*) AS total FROM \`media\` WHERE ${whereClause}`,
          params
        );
        const total = countRows?.[0]?.total || 0;

        const rows = await query<any[]>(
          `SELECT * FROM \`media\` WHERE ${whereClause} ORDER BY \`sort_order\` ASC, \`created_at\` DESC LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        );

        if (rows && Array.isArray(rows)) {
          return NextResponse.json(
            {
              status: true,
              success: true,
              message: "Data media berhasil diambil dari MySQL",
              data: {
                total,
                limit,
                offset,
                items: rows,
              },
            },
            { headers: noCacheHeaders }
          );
        }
      } catch (dbErr: any) {
        console.warn("MySQL Media Query Error:", dbErr.message);
      }
    }

    // 2. JSON Fallback
    let items = readJsonFallback().filter((i) => !i.deleted_at);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.original_name?.toLowerCase().includes(q) ||
          i.alt_text?.toLowerCase().includes(q) ||
          i.file_name?.toLowerCase().includes(q)
      );
    }
    if (folder) {
      items = items.filter((i) => i.folder === folder);
    }
    if (type) {
      items = items.filter((i) => i.type === type);
    }
    if (publishedOnly) {
      items = items.filter((i) => Number(i.is_published) === 1);
    }

    items.sort((a, b) => {
      const orderA = a.sort_order ?? 99999;
      const orderB = b.sort_order ?? 99999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    const paginated = items.slice(offset, offset + limit);

    return NextResponse.json(
      {
        status: true,
        success: true,
        message: "Data media berhasil diambil",
        data: {
          total: items.length,
          limit,
          offset,
          items: paginated,
        },
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error("Media API GET Error:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: error.message || "Gagal memuat media",
        data: { items: [], total: 0 },
      },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
