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

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "fanart.json");

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
async function ensureFanartTable() {
  if (tableEnsured || !isMySqlConfigured()) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`fanart\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`artist_name\` VARCHAR(150) NOT NULL,
        \`artist_social\` VARCHAR(255) NULL,
        \`description\` TEXT NULL,
        \`image_url\` TEXT NOT NULL,
        \`highres_url\` TEXT NULL,
        \`likes\` INT DEFAULT 0,
        \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        \`is_featured\` TINYINT(1) DEFAULT 0,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableEnsured = true;
  } catch (err) {
    console.warn("Ensure fanart table warn:", err);
  }
}

// GET: List fanart items
export async function GET(request: NextRequest) {
  try {
    await ensureFanartTable();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "approved"; // default "approved" for public
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest"; // "newest", "popular", "oldest"
    const limit = Number(searchParams.get("limit") || 100);
    const offset = Number(searchParams.get("offset") || 0);

    if (isMySqlConfigured()) {
      let sql = "SELECT * FROM `fanart` WHERE 1=1";
      const params: any[] = [];

      if (status !== "all") {
        sql += " AND `status` = ?";
        params.push(status);
      }

      if (search) {
        sql += " AND (`title` LIKE ? OR `artist_name` LIKE ? OR `description` LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (sort === "popular") {
        sql += " ORDER BY `likes` DESC, `created_at` DESC";
      } else if (sort === "oldest") {
        sql += " ORDER BY `created_at` ASC";
      } else {
        sql += " ORDER BY `created_at` DESC, `id` DESC";
      }

      sql += " LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const rows = await query<any[]>(sql, params);
      return NextResponse.json(
        {
          success: true,
          status: true,
          data: rows || [],
        },
        { headers: noCacheHeaders }
      );
    }

    // JSON Fallback
    let items = readJsonFallback();
    if (status !== "all") {
      items = items.filter((i) => i.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.artist_name?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }
    if (sort === "popular") {
      items.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      items.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: true,
        data: items.slice(offset, offset + limit),
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error("Fanart GET error:", error);
    return NextResponse.json(
      { success: false, status: false, message: error.message, data: [] },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

// POST: Submit new fanart artwork
export async function POST(request: Request) {
  try {
    await ensureFanartTable();
    const body = await request.json();
    const {
      title,
      artist_name,
      artist_social,
      description,
      image_url,
      highres_url,
      status = "pending", // User submissions are pending by default
    } = body;

    if (!title?.trim() || !artist_name?.trim() || !image_url?.trim()) {
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: "Judul karya, nama seniman, dan file gambar wajib diisi.",
        },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    const cleanArtist = artist_name.trim();
    const cleanSocial = artist_social ? artist_social.trim() : null;
    const cleanDesc = description ? description.trim() : null;
    const cleanImage = image_url.trim();
    const cleanHighres = highres_url ? highres_url.trim() : null;
    const cleanStatus = ["pending", "approved", "rejected"].includes(status)
      ? status
      : "pending";

    const now = new Date().toISOString();

    if (isMySqlConfigured()) {
      const result: any = await query(
        `INSERT INTO \`fanart\` (\`title\`, \`artist_name\`, \`artist_social\`, \`description\`, \`image_url\`, \`highres_url\`, \`status\`, \`likes\`, \`is_featured\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [
          cleanTitle,
          cleanArtist,
          cleanSocial,
          cleanDesc,
          cleanImage,
          cleanHighres,
          cleanStatus,
        ]
      );

      const newItem = {
        id: result?.insertId,
        title: cleanTitle,
        artist_name: cleanArtist,
        artist_social: cleanSocial,
        description: cleanDesc,
        image_url: cleanImage,
        highres_url: cleanHighres,
        likes: 0,
        status: cleanStatus,
        is_featured: 0,
        created_at: now,
        updated_at: now,
      };

      return NextResponse.json({
        success: true,
        status: true,
        message:
          cleanStatus === "pending"
            ? "Karya fanart berhasil dikirim! Tim kurasi Cavallery akan mereview karyamu sebelum diterbitkan ke galeri."
            : "Karya fanart berhasil diterbitkan ke galeri.",
        data: newItem,
      });
    }

    // JSON Fallback
    const items = readJsonFallback();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
    const newItem = {
      id: nextId,
      title: cleanTitle,
      artist_name: cleanArtist,
      artist_social: cleanSocial,
      description: cleanDesc,
      image_url: cleanImage,
      highres_url: cleanHighres,
      likes: 0,
      status: cleanStatus,
      is_featured: 0,
      created_at: now,
      updated_at: now,
    };
    items.unshift(newItem);
    saveJsonFallback(items);

    return NextResponse.json({
      success: true,
      status: true,
      message:
        cleanStatus === "pending"
          ? "Karya fanart berhasil dikirim! Tim kurasi Cavallery akan mereview karyamu sebelum diterbitkan ke galeri."
          : "Karya fanart berhasil diterbitkan ke galeri.",
      data: newItem,
    });
  } catch (error: any) {
    console.error("Fanart POST error:", error);
    return NextResponse.json(
      { success: false, status: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update fanart (status, edit details)
export async function PATCH(request: NextRequest) {
  try {
    await ensureFanartTable();
    const body = await request.json();
    const { id, status, is_featured, title, artist_name, artist_social, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, status: false, message: "ID karya wajib disertakan" },
        { status: 400 }
      );
    }

    if (isMySqlConfigured()) {
      const updates: string[] = [];
      const params: any[] = [];

      if (status !== undefined) {
        updates.push("`status` = ?");
        params.push(status);
      }
      if (is_featured !== undefined) {
        updates.push("`is_featured` = ?");
        params.push(is_featured ? 1 : 0);
      }
      if (title !== undefined) {
        updates.push("`title` = ?");
        params.push(title);
      }
      if (artist_name !== undefined) {
        updates.push("`artist_name` = ?");
        params.push(artist_name);
      }
      if (artist_social !== undefined) {
        updates.push("`artist_social` = ?");
        params.push(artist_social);
      }
      if (description !== undefined) {
        updates.push("`description` = ?");
        params.push(description);
      }

      if (updates.length > 0) {
        params.push(id);
        await query(
          `UPDATE \`fanart\` SET ${updates.join(", ")} WHERE \`id\` = ?`,
          params
        );
      }

      const updated = await query<any[]>("SELECT * FROM `fanart` WHERE `id` = ?", [id]);
      return NextResponse.json({
        success: true,
        status: true,
        message: "Status karya berhasil diperbarui",
        data: updated?.[0],
      });
    }

    // JSON Fallback
    const items = readJsonFallback();
    const idx = items.findIndex((i) => String(i.id) === String(id));
    if (idx !== -1) {
      if (status !== undefined) items[idx].status = status;
      if (is_featured !== undefined) items[idx].is_featured = is_featured ? 1 : 0;
      if (title !== undefined) items[idx].title = title;
      if (artist_name !== undefined) items[idx].artist_name = artist_name;
      if (artist_social !== undefined) items[idx].artist_social = artist_social;
      if (description !== undefined) items[idx].description = description;
      items[idx].updated_at = new Date().toISOString();
      saveJsonFallback(items);
      return NextResponse.json({
        success: true,
        status: true,
        message: "Status karya berhasil diperbarui",
        data: items[idx],
      });
    }

    return NextResponse.json({ success: false, status: false, message: "Karya tidak ditemukan" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, status: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Remove fanart
export async function DELETE(request: NextRequest) {
  try {
    await ensureFanartTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, status: false, message: "ID karya wajib disertakan" },
        { status: 400 }
      );
    }

    if (isMySqlConfigured()) {
      await query("DELETE FROM `fanart` WHERE `id` = ?", [id]);
      return NextResponse.json({
        success: true,
        status: true,
        message: "Karya fanart berhasil dihapus",
      });
    }

    // JSON Fallback
    let items = readJsonFallback();
    items = items.filter((i) => String(i.id) !== String(id));
    saveJsonFallback(items);

    return NextResponse.json({
      success: true,
      status: true,
      message: "Karya fanart berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, status: false, message: error.message },
      { status: 500 }
    );
  }
}
