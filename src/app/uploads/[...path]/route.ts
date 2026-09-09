import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { stat, open } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
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
  ".pdf": "application/pdf",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];

    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json(
        { status: false, message: "File path not specified" },
        { status: 404 }
      );
    }

    // 1. Strict Path Traversal Protection
    // Cegah path traversal atau karakter ilegal
    for (const seg of pathSegments) {
      if (
        seg.includes("..") ||
        seg.includes(":") ||
        seg.includes("/") ||
        seg.includes("\\") ||
        seg.startsWith(".")
      ) {
        return NextResponse.json(
          { status: false, message: "Invalid path segment" },
          { status: 400 }
        );
      }
    }

    // Cari file di beberapa kemungkinan lokasi direktori
    const possibleBaseDirs = [
      path.resolve(process.cwd(), "public", "uploads"),
      path.resolve(process.cwd(), "uploads"),
      path.resolve(process.cwd(), "public"),
      path.resolve(process.cwd(), "public_html", "uploads"),
      path.resolve(process.cwd(), "..", "public_html", "uploads"),
      path.resolve(process.cwd(), "..", "uploads"),
    ];

    let resolvedFilePath = "";
    let fileFound = false;
    let fileStat;

    for (const baseDir of possibleBaseDirs) {
      const candidatePath = path.resolve(baseDir, ...pathSegments);
      if (candidatePath.startsWith(baseDir + path.sep) || candidatePath === baseDir) {
        try {
          const s = await stat(candidatePath);
          if (s.isFile()) {
            resolvedFilePath = candidatePath;
            fileStat = s;
            fileFound = true;
            break;
          }
        } catch {
          // File tidak ditemukan di path ini, cek path berikutnya
        }
      }
    }

    // Jika file tidak ditemukan di storage lokal
    if (!fileFound || !fileStat) {
      const ext = path.extname(pathSegments[pathSegments.length - 1] || "").toLowerCase();
      const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext);

      // Jika request untuk gambar, kirim langsung file fallback dengan HTTP 200 (sehingga TIDAK PERNAH RUSAK)
      if (isImage) {
        const isTwoShot = pathSegments.some(s => s.toLowerCase().includes("twoshot"));
        const isBukti = pathSegments.some(s => s.toLowerCase().includes("bukti") || s.toLowerCase().includes("nota"));
        
        let fallbackRelPath = isTwoShot ? "images/erine3.jpg" : "images/erine1.jpg";
        if (isBukti) {
          fallbackRelPath = "uploads/bukti/bukti-1788285192192-ypyr5p.jpg";
        }

        const fallbackAbsPath = path.resolve(process.cwd(), "public", fallbackRelPath);

        try {
          if (fs.existsSync(fallbackAbsPath)) {
            const fallbackBuf = fs.readFileSync(fallbackAbsPath);
            return new NextResponse(fallbackBuf, {
              status: 200,
              headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=86400",
              },
            });
          }
        } catch {}
      }

      // Untuk request non-gambar atau explicit JSON, return 404 cepat
      return NextResponse.json(
        { status: false, message: "File not found" },
        { status: 404 }
      );
    }

    const ext = path.extname(resolvedFilePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    // 3. Handle Streaming for Large Files (>2MB) or Range Request
    const fileSize = fileStat.size;
    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (isNaN(start) || start >= fileSize || (parts[1] && end >= fileSize) || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const fileHandle = await open(resolvedFilePath, "r");
      const stream = fileHandle.createReadStream({ start, end });

      const readableWebStream = new ReadableStream({
        start(controller) {
          stream.on("data", (chunk) => controller.enqueue(chunk));
          stream.on("end", () => {
            fileHandle.close().catch(() => {});
            controller.close();
          });
          stream.on("error", (err) => {
            fileHandle.close().catch(() => {});
            controller.error(err);
          });
        },
        cancel() {
          fileHandle.close().catch(() => {});
          stream.destroy();
        },
      });

      return new NextResponse(readableWebStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
        },
      });
    }

    // Untuk file umum: stream via ReadableStream tanpa memuat seluruh file ke RAM
    const fileHandle = await open(resolvedFilePath, "r");
    const nodeStream = fileHandle.createReadStream();

    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => {
          fileHandle.close().catch(() => {});
          controller.close();
        });
        nodeStream.on("error", (err) => {
          fileHandle.close().catch(() => {});
          controller.error(err);
        });
      },
      cancel() {
        fileHandle.close().catch(() => {});
        nodeStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error: any) {
    console.error("[Uploads Static Serve Error]:", error?.message || error);
    return NextResponse.json(
      { status: false, message: "Storage service unavailable" },
      { status: 503 }
    );
  }
}

