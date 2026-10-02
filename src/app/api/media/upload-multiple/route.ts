import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { insertMedia } from "@/lib/mediaDb";

export const dynamic = "force-dynamic";

const VALLZY_MULTI_UPLOAD_URL = "https://v5.jkt48connect.com/api/cavallery/media/upload-multiple?apikey=JKTCONNECT";

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

    // 1. Try forwarding to Vallzy's server if available
    try {
      const outFd = new FormData();
      files.forEach((f) => outFd.append("files[]", f));
      outFd.append("folder", folder);

      const res = await fetch(VALLZY_MULTI_UPLOAD_URL, {
        method: "POST",
        body: outFd,
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data?.uploaded) {
          const insertedList: any[] = [];
          for (const m of json.data.uploaded) {
            insertedList.push(await insertMedia(m));
          }
          return NextResponse.json({
            status: true,
            success: true,
            message: `${insertedList.length} berkas berhasil diunggah ke server Vallzy & database`,
            data: { uploaded: insertedList, errors: json.data?.errors || [] },
          });
        }
      }
    } catch (e: any) {
      console.warn("Vallzy multi-upload forward warn:", e.message);
    }

    // 2. Local fallback
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
        const randomName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const absFilePath = path.join(absFolder, randomName);
        fs.writeFileSync(absFilePath, buffer);

        const publicUrl = `/${relFolder}/${randomName}`.replace(/\\/g, "/");
        const mimeType = file.type || "image/jpeg";
        const fileType = mimeType.startsWith("video/") ? "video" : "image";

        const saved = await insertMedia({
          original_name: file.name,
          file_name: randomName,
          folder: folder,
          type: fileType,
          mime_type: mimeType,
          file_size: file.size,
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
      message: `${uploaded.length} berkas berhasil diunggah ke database & server`,
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
