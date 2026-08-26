import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

function getDB() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

async function handleBulkDelete(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  const db = await getDB();
  try {
    const placeholders = ids.map(() => "?").join(",");
    const [rows]: any = await db.query(`SELECT * FROM media WHERE id IN (${placeholders})`, ids);
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
    await db.query(`DELETE FROM media WHERE id IN (${placeholders})`, ids);
  } finally {
    await db.end();
  }
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
