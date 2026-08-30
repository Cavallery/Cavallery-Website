import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { status: false, message: "File foto 2-Shot tidak ditemukan" },
        { status: 400 }
      );
    }

    // Validasi mime type
    const mimeType = file.type || "";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { status: false, message: "Format berkas harus berupa gambar (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Validasi ukuran max 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { status: false, message: "Ukuran berkas maksimal 20MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const relFolder = path.join("uploads", "twoshot", year, month).replace(/\\/g, "/");
    const absFolder = path.join(process.cwd(), "public", relFolder);

    if (!fs.existsSync(absFolder)) {
      fs.mkdirSync(absFolder, { recursive: true });
    }

    const ext = path.extname(file.name) || ".jpg";
    const randomName = `${crypto.randomBytes(8).toString("hex")}${ext}`;
    const absFilePath = path.join(absFolder, randomName);

    fs.writeFileSync(absFilePath, buffer);

    const publicUrl = `/${relFolder}/${randomName}`.replace(/\\/g, "/");

    return NextResponse.json({
      status: true,
      success: true,
      message: "Foto 2-Shot berhasil diunggah",
      data: {
        file_name: randomName,
        original_name: file.name,
        image_url: publicUrl,
        file_size: file.size,
        mime_type: mimeType,
      },
    });
  } catch (error: any) {
    console.error("TwoShot upload error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}
