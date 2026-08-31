import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VALLZY_UPLOAD_URL = "https://v5.jkt48connect.com/api/cavallery/media/upload?apikey=JKTCONNECT";
const LOCAL_JSON_PATH = path.join(process.cwd(), "src", "data", "media.json");

function saveToLocalFallback(mediaItem: any) {
  try {
    let items = [];
    if (fs.existsSync(LOCAL_JSON_PATH)) {
      items = JSON.parse(fs.readFileSync(LOCAL_JSON_PATH, "utf-8"));
    }
    items.unshift(mediaItem);
    fs.writeFileSync(LOCAL_JSON_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch {}
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

    // 1. Try forwarding to Vallzy's server
    try {
      const outFd = new FormData();
      outFd.append("file", file);
      outFd.append("folder", folder);
      outFd.append("alt_text", altText || file.name);

      const res = await fetch(VALLZY_UPLOAD_URL, {
        method: "POST",
        body: outFd,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data) {
          saveToLocalFallback(json.data);
          return NextResponse.json({
            status: true,
            success: true,
            message: "File berhasil diunggah ke server Vallzy",
            data: json.data,
          });
        }
      }
    } catch (e: any) {
      console.warn("Vallzy upload forward warn:", e.message);
    }

    // 2. Local fallback if external upload fails
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const relFolder = path.join("uploads", folder, year, month).replace(/\\/g, "/");
    const absFolder = path.join(process.cwd(), "public", relFolder);
    if (!fs.existsSync(absFolder)) fs.mkdirSync(absFolder, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const randomName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const absFilePath = path.join(absFolder, randomName);
    fs.writeFileSync(absFilePath, buffer);

    const publicUrl = `/${relFolder}/${randomName}`.replace(/\\/g, "/");
    const mimeType = file.type || "image/jpeg";
    const fileType = mimeType.startsWith("video/") ? "video" : "image";

    const mediaItem = {
      id: String(Date.now()),
      original_name: file.name,
      file_name: randomName,
      folder: folder,
      type: fileType,
      mime_type: mimeType,
      file_size: file.size,
      public_url: publicUrl,
      alt_text: altText || file.name,
      is_published: 1,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    saveToLocalFallback(mediaItem);

    return NextResponse.json({
      status: true,
      success: true,
      message: "File berhasil diunggah",
      data: mediaItem,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}
