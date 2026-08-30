import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];

    if (pathSegments.length === 0) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    // Prevent path traversal
    const safeSegments = pathSegments.filter((seg) => !seg.includes("..") && !seg.includes(":"));
    const filePath = path.join(process.cwd(), "public", "uploads", ...safeSegments);

    if (!fs.existsSync(filePath)) {
      // Fallback: proxy from live production website if running on local dev
      try {
        const remoteUrl = `https://cavallery.id/uploads/${safeSegments.join("/")}`;
        const remoteRes = await fetch(remoteUrl);
        if (remoteRes.ok) {
          const arrayBuffer = await remoteRes.arrayBuffer();
          const ext = path.extname(filePath).toLowerCase();
          const contentType = remoteRes.headers.get("content-type") || MIME_MAP[ext] || "application/octet-stream";
          
          // Optionally cache locally
          try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
          } catch {}

          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      } catch {}

      return new NextResponse("File Not Found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse("Not a file", { status: 400 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Uploads static serve error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
