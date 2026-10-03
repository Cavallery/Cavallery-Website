import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFileFromDb } from "@/lib/mysqlStorage";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

/**
 * Serve runtime-uploaded files from public/uploads.
 * next.config.ts rewrites /uploads/:path* → /api/uploads/:path*
 * so this handler catches all uploaded media requests.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const relPath = pathSegments.join("/");
    // Sanitize: prevent directory traversal
    const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, "");
    const absPath = path.join(process.cwd(), "public", "uploads", safePath);

    // 1. Cek apakah file ada di disk lokal
    if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
      const fileBuffer = fs.readFileSync(absPath);
      const ext = path.extname(absPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 2. Jika tidak ada di disk (misal saat fresh build/deploy di host), coba cari di MySQL
    try {
      const fileFromDb = await getFileFromDb(safePath);
      if (fileFromDb && fileFromDb.buffer) {
        // Re-hydrate / pulihkan ke disk lokal jika memungkinkan
        try {
          const dir = path.dirname(absPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(absPath, fileFromDb.buffer);
        } catch {
          // Abaikan jika disk read-only
        }

        return new NextResponse(new Uint8Array(fileFromDb.buffer), {
          status: 200,
          headers: {
            "Content-Type": fileFromDb.mimeType || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Uploads Route] MySQL fallback error:", dbErr);
    }

    return new NextResponse("File Not Found", { status: 404 });
  } catch (error: any) {
    console.error("[Uploads Route] Error:", error);
    return new NextResponse("Error reading file", { status: 500 });
  }
}
