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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDB();
    try {
      const [rows]: any = await db.query("SELECT * FROM media WHERE id = ?", [id]);
      if (rows.length > 0) {
        const item = rows[0];
        if (item.public_url && item.public_url.startsWith("/uploads/")) {
          const localPath = path.join(process.cwd(), "public", item.public_url.replace(/^\//, ""));
          if (fs.existsSync(localPath)) {
            try {
              fs.unlinkSync(localPath);
            } catch {}
          }
        }
        await db.query("DELETE FROM media WHERE id = ?", [id]);
      }
    } finally {
      await db.end();
    }

    return NextResponse.json({ status: true, message: "Media berhasil dihapus" });
  } catch (error: any) {
    console.error("Media Delete Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus media" },
      { status: 500 }
    );
  }
}
