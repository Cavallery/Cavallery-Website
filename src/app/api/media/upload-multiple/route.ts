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
    const folder = (formData.get("folder") as string) || "cavallery/images";

    // Handle both files[] and files
    const fileEntries = formData.getAll("files[]").concat(formData.getAll("files")) as File[];

    if (!fileEntries || fileEntries.length === 0) {
      return NextResponse.json({ status: false, message: "Tidak ada file yang dipilih" }, { status: 400 });
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const relFolder = path.join("uploads", folder, year, month).replace(/\\/g, "/");
    const absFolder = path.join(process.cwd(), "public", relFolder);

    if (!fs.existsSync(absFolder)) {
      fs.mkdirSync(absFolder, { recursive: true });
    }

    const uploaded: any[] = [];
    const errors: any[] = [];

    const db = await getDB();
    try {
      for (const file of fileEntries) {
        if (!(file instanceof File)) continue;
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

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
              file.name,
            ]
          );

          uploaded.push({
            id: mediaId,
            original_name: file.name,
            file_name: randomName,
            public_url: publicUrl,
            mime_type: mimeType,
            type: fileType,
            file_size: file.size,
            folder: folder,
          });
        } catch (err: any) {
          errors.push({ name: file.name, reason: err.message });
        }
      }
    } finally {
      await db.end();
    }

    return NextResponse.json({
      status: true,
      message: `${uploaded.length} file berhasil diunggah`,
      data: {
        uploaded,
        errors,
      },
    });
  } catch (error: any) {
    console.error("Upload multiple error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengunggah file-file" },
      { status: 500 }
    );
  }
}
