import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { insertMedia } from "@/lib/mediaDb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files[]") as File[];
    const folder = (formData.get("folder") as string) || "cavallery/images";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: false, message: "Tidak ada berkas yang dipilih" },
        { status: 400 }
      );
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const relFolder = path.join("uploads", folder, year, month).replace(/\\/g, "/");
    const absFolder = path.join(process.cwd(), "public", relFolder);
    if (!fs.existsSync(absFolder)) fs.mkdirSync(absFolder, { recursive: true });

    const uploaded: any[] = [];
    const errors: any[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const randomName = `${Date.now()}_${safeName}`;
        const absFilePath = path.join(absFolder, randomName);
        fs.writeFileSync(absFilePath, buffer);

        const publicUrl = `/${relFolder}/${randomName}`.replace(/\\/g, "/");
        const mimeType = file.type || (/\.(mp4|webm|mov)$/i.test(file.name) ? "video/mp4" : "image/jpeg");
        const fileType = mimeType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name) ? "video" : "image";

        const saved = await insertMedia({
          original_name: file.name,
          file_name: randomName,
          folder: folder,
          type: fileType,
          mime_type: mimeType,
          file_size: file.size || buffer.length,
          public_url: publicUrl,
          alt_text: file.name,
          is_published: 1,
        });

        uploaded.push(saved);
      } catch (err: any) {
        errors.push({ name: file.name, reason: err.message });
      }
    }

    return NextResponse.json({
      status: true,
      success: true,
      message: `${uploaded.length} berkas berhasil diunggah ke database MySQL`,
      data: { uploaded, errors },
    });
  } catch (error: any) {
    console.error("Upload multiple error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}
