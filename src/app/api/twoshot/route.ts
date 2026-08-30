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

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "twoshot.json");

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
async function ensureTwoShotTable() {
  if (tableEnsured || !isMySqlConfigured()) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`twoshot\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_name\` VARCHAR(150) NOT NULL,
        \`user_social\` VARCHAR(255) NULL,
        \`event_name\` VARCHAR(255) NULL,
        \`event_date\` VARCHAR(100) NULL,
        \`message\` TEXT NOT NULL,
        \`image_url\` TEXT NOT NULL,
        \`likes\` INT DEFAULT 0,
        \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        \`is_featured\` TINYINT(1) DEFAULT 0,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_twoshot_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableEnsured = true;
  } catch (err) {
    console.warn("Ensure twoshot table warn:", err);
  }
}

// GET: List 2S items
export async function GET(request: NextRequest) {
  try {
    await ensureTwoShotTable();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "approved"; // default "approved" for public
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest"; // "newest", "popular", "oldest"
    const limit = Number(searchParams.get("limit") || 100);
    const offset = Number(searchParams.get("offset") || 0);

    if (isMySqlConfigured()) {
      let sql = "SELECT * FROM `twoshot` WHERE 1=1";
      const params: any[] = [];

      if (status !== "all") {
        sql += " AND `status` = ?";
        params.push(status);
      }

      if (search) {
        sql += " AND (`user_name` LIKE ? OR `event_name` LIKE ? OR `message` LIKE ? OR `user_social` LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
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
          i.user_name?.toLowerCase().includes(q) ||
          i.event_name?.toLowerCase().includes(q) ||
          i.message?.toLowerCase().includes(q) ||
          i.user_social?.toLowerCase().includes(q)
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
    console.error("TwoShot GET error:", error);
    return NextResponse.json(
      { success: false, status: false, message: error.message, data: [] },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

// POST: Submit new 2S photo and message
export async function POST(request: Request) {
  try {
    await ensureTwoShotTable();
    const body = await request.json();
    const {
      user_name,
      user_social,
      event_name,
      event_date,
      message,
      image_url,
      status = "pending", // User submissions are pending by default
    } = body;

    if (!user_name?.trim() || !message?.trim() || !image_url?.trim()) {
      return NextResponse.json(
        {
          success: false,
          status: false,
          message: "Nama penggemar, foto 2-Shot, dan pesan untuk Erine wajib diisi.",
        },
        { status: 400 }
      );
    }

    const cleanUser = user_name.trim();
    const cleanSocial = user_social ? user_social.trim() : null;
    const cleanEvent = event_name ? event_name.trim() : null;
    const cleanDate = event_date ? event_date.trim() : null;
    const cleanMsg = message.trim();
    const cleanImage = image_url.trim();
    const cleanStatus = ["pending", "approved", "rejected"].includes(status)
      ? status
      : "pending";

    const now = new Date().toISOString();

    if (isMySqlConfigured()) {
      const result: any = await query(
        `INSERT INTO \`twoshot\` (\`user_name\`, \`user_social\`, \`event_name\`, \`event_date\`, \`message\`, \`image_url\`, \`status\`, \`likes\`, \`is_featured\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [
          cleanUser,
          cleanSocial,
          cleanEvent,
          cleanDate,
          cleanMsg,
          cleanImage,
          cleanStatus,
        ]
      );

      const newItem = {
        id: result?.insertId,
        user_name: cleanUser,
        user_social: cleanSocial,
        event_name: cleanEvent,
        event_date: cleanDate,
        message: cleanMsg,
        image_url: cleanImage,
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
            ? "Momen 2-Shot dan pesan kamu untuk Erine berhasil dikirim! Tim Cavallery akan mereview sebelum diterbitkan ke galeri."
            : "Foto 2-Shot berhasil diterbitkan ke galeri.",
        data: newItem,
      });
    }

    // JSON Fallback
    const items = readJsonFallback();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
    const newItem = {
      id: nextId,
      user_name: cleanUser,
      user_social: cleanSocial,
      event_name: cleanEvent,
      event_date: cleanDate,
      message: cleanMsg,
      image_url: cleanImage,
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
          ? "Momen 2-Shot dan pesan kamu untuk Erine berhasil dikirim! Tim Cavallery akan mereview sebelum diterbitkan ke galeri."
          : "Foto 2-Shot berhasil diterbitkan ke galeri.",
      data: newItem,
    });
  } catch (error: any) {
    console.error("TwoShot POST error:", error);
    return NextResponse.json(
      { success: false, status: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update 2S status/details
export async function PATCH(request: NextRequest) {
  try {
    await ensureTwoShotTable();
    const body = await request.json();
    const { id, status, is_featured, user_name, user_social, event_name, event_date, message } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, status: false, message: "ID foto 2-Shot wajib disertakan" },
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
      if (user_name !== undefined) {
        updates.push("`user_name` = ?");
        params.push(user_name);
      }
      if (user_social !== undefined) {
        updates.push("`user_social` = ?");
        params.push(user_social);
      }
      if (event_name !== undefined) {
        updates.push("`event_name` = ?");
        params.push(event_name);
      }
      if (event_date !== undefined) {
        updates.push("`event_date` = ?");
        params.push(event_date);
      }
      if (message !== undefined) {
        updates.push("`message` = ?");
        params.push(message);
      }

      if (updates.length > 0) {
        params.push(id);
        await query(
          `UPDATE \`twoshot\` SET ${updates.join(", ")} WHERE \`id\` = ?`,
          params
        );
      }

      const updated = await query<any[]>("SELECT * FROM `twoshot` WHERE `id` = ?", [id]);
      return NextResponse.json({
        success: true,
        status: true,
        message: "Status 2-Shot berhasil diperbarui",
        data: updated?.[0],
      });
    }

    // JSON Fallback
    const items = readJsonFallback();
    const idx = items.findIndex((i) => String(i.id) === String(id));
    if (idx !== -1) {
      if (status !== undefined) items[idx].status = status;
      if (is_featured !== undefined) items[idx].is_featured = is_featured ? 1 : 0;
      if (user_name !== undefined) items[idx].user_name = user_name;
      if (user_social !== undefined) items[idx].user_social = user_social;
      if (event_name !== undefined) items[idx].event_name = event_name;
      if (event_date !== undefined) items[idx].event_date = event_date;
      if (message !== undefined) items[idx].message = message;
      items[idx].updated_at = new Date().toISOString();
      saveJsonFallback(items);
      return NextResponse.json({
        success: true,
        status: true,
        message: "Status 2-Shot berhasil diperbarui",
        data: items[idx],
      });
    }

    return NextResponse.json({ success: false, status: false, message: "Foto 2-Shot tidak ditemukan" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, status: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Remove 2S item
export async function DELETE(request: NextRequest) {
  try {
    await ensureTwoShotTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, status: false, message: "ID foto 2-Shot wajib disertakan" },
        { status: 400 }
      );
    }

    if (isMySqlConfigured()) {
      await query("DELETE FROM `twoshot` WHERE `id` = ?", [id]);
      return NextResponse.json({
        success: true,
        status: true,
        message: "Foto 2-Shot berhasil dihapus",
      });
    }

    // JSON Fallback
    let items = readJsonFallback();
    items = items.filter((i) => String(i.id) !== String(id));
    saveJsonFallback(items);

    return NextResponse.json({
      success: true,
      status: true,
      message: "Foto 2-Shot berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, status: false, message: error.message },
      { status: 500 }
    );
  }
}
