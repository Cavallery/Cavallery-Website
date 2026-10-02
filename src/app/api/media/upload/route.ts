import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { insertMedia } from "@/lib/mediaDb";

export const dynamic = "force-dynamic";

const VALLZY_UPLOAD_URL = "https://v5.jkt48connect.com/api/cavallery/media/upload?apikey=JKTCONNECT";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "cavallery/images";
    const altText = (formData.get("alt_text") as string) || "";

    if (!file) {
      return NextResponse.json({ status: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    // 1. Try forwarding to Vallzy's server if available
    try {
      const outFd = new FormData();
      outFd.append("file", file);
      outFd.append("folder", folder);
      outFd.append("alt_text", altText || file.name);

      const res = await fetch(VALLZY_UPLOAD_URL, {
        method: "POST",
        body: outFd,
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data) {
          const savedItem = await insertMedia(json.data);
          return NextResponse.json({
            status: true,
            success: true,
            message: "File berhasil diunggah ke server Vallzy & database",
            data: savedItem,
          });
        }
      }
    } catch (e: any) {
      console.warn("Vallzy upload forward warn:", e.message);
    }

    // 2. Local fallback: simpan fisik di folder public/uploads
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

    const mediaItem = await insertMedia({
      original_name: file.name,
      file_name: randomName,
      folder: folder,
      type: fileType,
      mime_type: mimeType,
      file_size: file.size,
      public_url: publicUrl,
      alt_text: altText || file.name,
      is_published: 1,
    });

    return NextResponse.json({
      status: true,
      success: true,
      message: "File berhasil diunggah ke database & server",
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
