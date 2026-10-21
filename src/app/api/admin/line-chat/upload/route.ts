import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminSessionFromReq } from "@/lib/auth";
import { saveFileToDb } from "@/lib/mysqlStorage";

export const dynamic = "force-dynamic";

// POST: Upload media (Gambar/Video) untuk dikirim di chat LINE
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ status: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    const mime = file.type || "";
    const isImage = mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
    const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { status: false, message: "Hanya file gambar (JPG, PNG, WebP) atau video (MP4) yang didukung" },
        { status: 400 }
      );
    }

    // Limit ukuran: 10MB untuk gambar, 50MB untuk video
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { status: false, message: `Ukuran file melebihi batas maksimal (${isVideo ? "50MB" : "10MB"})` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || (isImage ? "jpg" : "mp4");
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `line-chat-${Date.now()}-${safeName}`;

    // Simpan ke disk lokal jika memungkinkan
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "line-chat");
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    } catch (fsErr: any) {
      console.warn("[Line Chat Upload] Disk write failed, relying on DB:", fsErr?.message);
    }

    // Simpan ke MySQL storage agar permanen saat deploy/restart
    try {
      await saveFileToDb({
        buffer,
        filename,
        folder: "line-chat",
        mimeType: mime || (isImage ? "image/jpeg" : "video/mp4"),
      });
    } catch (dbErr: any) {
      console.warn("[Line Chat Upload] DB save warning:", dbErr?.message);
    }

    // Bangun URL publik yang absolut (LINE API mewajibkan URL HTTPS absolut)
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "cavallery.id";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const publicUrl = `${proto}://${host}/uploads/line-chat/${filename}`;

    return NextResponse.json({
      status: true,
      url: publicUrl,
      relUrl: `/uploads/line-chat/${filename}`,
      mediaType: isVideo ? "video" : "image",
      filename,
    });
  } catch (error: any) {
    console.error("POST /api/admin/line-chat/upload error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal mengunggah file media" },
      { status: 500 }
    );
  }
}
