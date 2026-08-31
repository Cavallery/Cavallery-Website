import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files[]") as File[];
    const folder = (formData.get("folder") as string) || "cavallery/images";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: false, message: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
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

    for (const file of files) {
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

        const mediaItem = {
          id: mediaId,
          original_name: file.name,
          file_name: randomName,
          folder: folder,
          type: fileType,
          mime_type: mimeType,
          file_size: file.size,
          public_url: publicUrl,
          alt_text: file.name,
          is_published: 1,
          deleted_at: null,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        };

        if (isMySqlConfigured()) {
          try {
            await query(
              `INSERT INTO \`media\` (\`id\`, \`original_name\`, \`file_name\`, \`folder\`, \`type\`, \`mime_type\`, \`file_size\`, \`public_url\`, \`alt_text\`, \`is_published\`)
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
          } catch (dbErr: any) {
            console.warn("MySQL Media Multiple Insert Warn:", dbErr.message);
          }
        }

        uploaded.push(mediaItem);
      } catch (err: any) {
        errors.push({ name: file.name, reason: err.message });
      }
    }

    if (uploaded.length > 0) {
      const items = readJsonFallback();
      uploaded.forEach((item) => items.unshift(item));
      saveJsonFallback(items);
    }

    return NextResponse.json({
      status: true,
      success: true,
      message: `${uploaded.length} file berhasil diunggah`,
      data: {
        uploaded,
        errors,
      },
    });
  } catch (error: any) {
    console.error("Upload multiple error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}
