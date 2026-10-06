import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { insertMedia } from "@/lib/mediaDb";
import { saveFileToDb } from "@/lib/mysqlStorage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "cavallery/images";
    const altText = (formData.get("alt_text") as string) || "";

    if (!file) {
      return NextResponse.json({ status: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    // 1. Simpan berkas fisik ke disk lokal
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const subFolder = `${folder}/${year}/${month}`.replace(/\\/g, "/");
    const relFolder = path.join("uploads", subFolder).replace(/\\/g, "/");
    const absFolder = path.join(process.cwd(), "public", relFolder);
    if (!fs.existsSync(absFolder)) fs.mkdirSync(absFolder, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const randomName = `${Date.now()}_${safeName}`;
    const absFilePath = path.join(absFolder, randomName);
    fs.writeFileSync(absFilePath, buffer);

    const publicUrl = `/${relFolder}/${randomName}`.replace(/\\/g, "/");
    const mimeType = file.type || (/\.(mp4|webm|mov)$/i.test(file.name) ? "video/mp4" : "image/jpeg");
    const fileType = mimeType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name) ? "video" : "image";

    // Simpan permanen ke MySQL uploaded_files (agar tidak hilang saat Hostinger rebuild)
    try {
      await saveFileToDb({
        buffer,
        filename: randomName,
        folder: subFolder,
        mimeType,
      });
    } catch (saveErr) {
      console.warn("[Media Upload] Error saving to MySQL storage:", saveErr);
    }

    // 2. Simpan langsung ke database MySQL (dan sync ke media.json)
    const mediaItem = await insertMedia({
      original_name: file.name,
      file_name: randomName,
      folder: folder,
      type: fileType,
      mime_type: mimeType,
      file_size: file.size || buffer.length,
      public_url: publicUrl,
      alt_text: altText || file.name,
      is_published: 1,
    });

    return NextResponse.json({
      status: true,
      success: true,
      message: "File berhasil diunggah ke database MySQL",
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
