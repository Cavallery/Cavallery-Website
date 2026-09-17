import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFileFromDb } from "@/lib/mysqlStorage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    if (pathSegments.length === 0) {
      return new NextResponse("File not specified", { status: 400 });
    }

    const relativePath = pathSegments.join("/");
    // 1. Cek apakah file ada di disk lokal
    const localDiskPath = path.join(process.cwd(), "public", "uploads", ...pathSegments);

    if (fs.existsSync(localDiskPath)) {
      try {
        const fileBuffer = fs.readFileSync(localDiskPath);
        const ext = path.extname(localDiskPath).toLowerCase();
        let mimeType = "image/jpeg";
        if (ext === ".png") mimeType = "image/png";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".gif") mimeType = "image/gif";
        else if (ext === ".svg") mimeType = "image/svg+xml";

        return new NextResponse(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {}
    }

    // 2. Jika file tidak ada di disk (misalnya terhapus saat git push / deploy),
    //    AMBIL DARI DATABASE MYSQL!
    const fileFromDb = await getFileFromDb(relativePath);

    if (fileFromDb && fileFromDb.buffer) {
      // Re-hydrate / pulihkan file ke disk lokal jika bisa
      try {
        const dirName = path.dirname(localDiskPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        fs.writeFileSync(localDiskPath, fileFromDb.buffer);
      } catch (cacheErr: any) {
        // Abaikan jika disk read-only (misal di serverless)
      }

      return new NextResponse(new Uint8Array(fileFromDb.buffer), {
        status: 200,
        headers: {
          "Content-Type": fileFromDb.mimeType || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("File tidak ditemukan di database maupun penyimpanan lokal", {
      status: 404,
    });
  } catch (error: any) {
    console.error("[Uploads Route] Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
