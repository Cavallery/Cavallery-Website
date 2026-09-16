import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { saveFileToDb, syncLocalUploadsToDb } from "@/lib/mysqlStorage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ status: false, message: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { status: false, message: "Format file harus gambar (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ status: false, message: "Ukuran file maksimal 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "bukti");
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {}

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `bukti-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // 1. Simpan ke disk lokal (sebagai cache jika filesystem writable)
    try {
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr: any) {
      console.warn("[Upload] Warning: Cannot write to disk, using DB only:", fsErr?.message);
    }

    // 2. SIMPAN KE DATABASE MYSQL (Permanen, tidak akan hilang saat push/redeploy)
    await saveFileToDb({
      buffer,
      filename,
      folder: "bukti",
      mimeType: file.type || "image/jpeg",
    });

    // Jalankan background sync file lama jika belum masuk database
    syncLocalUploadsToDb().catch(() => {});

    const publicUrl = `/uploads/bukti/${filename}`;
    return NextResponse.json({
      status: true,
      url: publicUrl,
      message: "Bukti bayar / nota berhasil disimpan ke database",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal mengunggah file" },
      { status: 500 }
    );
  }
}

