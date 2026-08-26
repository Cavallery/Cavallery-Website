import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function getDB() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "cavallery/images";
    const altText = (formData.get("alt_text") as string) || "";

    if (!file) {
      return NextResponse.json({ status: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Folder structure: public/uploads/{folder}/YYYY/MM/
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const relFolder = path.join("uploads", folder, year, month).replace(/\\/g, "/");
    const absFolder = path.join(process.cwd(), "public", relFolder);

    if (!fs.existsSync(absFolder)) {
      fs.mkdirSync(absFolder, { recursive: true });
    }

    const ext = path.extname(file.name) || ".jpg";
    const randomName = `${crypto.randomBytes(8).toString("hex")}${ext}`;
    const absFilePath = path.join(absFolder, randomName);

    fs.writeFileSync(absFilePath, buffer);

    const publicUrl = `/${relFolder}/${randomName}`.replace(/\\/g, "/");
    const mimeType = file.type || "image/jpeg";
    const fileType = mimeType.startsWith("video/")
      ? "video"
      : mimeType.startsWith("image/")
      ? "image"
      : "document";

    const mediaId = crypto.randomUUID();

    const db = await getDB();
    try {
      await db.query(
        `INSERT INTO media (id, original_name, file_name, folder, type, mime_type, file_size, public_url, alt_text, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          mediaId,
          file.name,
          randomName,
          folder,
          fileType,
          mimeType,
          file.size,
          publicUrl,
          altText || file.name,
        ]
      );
    } finally {
      await db.end();
    }

    const mediaItem = {
      id: mediaId,
      original_name: file.name,
      file_name: randomName,
      public_url: publicUrl,
      mime_type: mimeType,
      type: fileType,
      file_size: file.size,
      folder: folder,
      alt_text: altText || file.name,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    return NextResponse.json({
      status: true,
      message: "File berhasil diunggah",
      data: mediaItem,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengunggah file" },
      { status: 500 }
    );
  }
}
