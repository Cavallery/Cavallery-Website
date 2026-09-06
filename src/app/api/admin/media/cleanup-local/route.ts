import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminSessionFromReq } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Wajib autentikasi admin
  const admin = getAdminSessionFromReq(req);
  if (!admin) {
    return NextResponse.json(
      { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
      { status: 401 }
    );
  }
  const root = process.cwd();
  const files = [
    "public/assets/homepage-vt.mp4",
    "public/assets/keying-logo-center.mp4",
    "public/assets/logo-center-portrait.mp4",
    "public/assets/prolog-scene.mp4",
    "public/assets/Video Tron Ratplaz Erine.mp4",
    "public/assets/video-1.mp4",
    "public/assets/video-2.mp4",
    "public/assets/video-4.mp4",
    "public/assets/video-lapak.mp4",
    "public/assets/video-sts.mp4",
    "public/audio/jikorine1.mp4",
    "public/audio/jikorine2.mp4",
  ];

  const results: any[] = [];
  let totalFreedBytes = 0;

  for (const rel of files) {
    const fullPath = path.join(root, rel);
    if (fs.existsSync(fullPath)) {
      try {
        const stat = fs.statSync(fullPath);
        totalFreedBytes += stat.size;
        fs.unlinkSync(fullPath);
        results.push({
          file: rel,
          status: "deleted",
          sizeMB: (stat.size / 1024 / 1024).toFixed(2),
        });
      } catch (err: any) {
        results.push({
          file: rel,
          status: "error",
          error: err.message,
        });
      }
    } else {
      results.push({
        file: rel,
        status: "already_absent",
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Pembersihan file MP4 lokal selesai.",
    totalFreedMB: (totalFreedBytes / 1024 / 1024).toFixed(2),
    results,
  });
}
