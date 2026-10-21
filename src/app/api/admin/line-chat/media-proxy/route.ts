import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminSessionFromReq } from "@/lib/auth";
import { saveFileToDb } from "@/lib/mysqlStorage";
import { query } from "@/lib/mysql";

export const dynamic = "force-dynamic";

// GET: Proxy unduh dan tampilkan gambar/video dari LINE API jika belum tersimpan secara lokal
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return new NextResponse("messageId required", { status: 400 });
    }

    // 1. Cek apakah berkas sudah ada di disk lokal
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "line-chat");
    const possibleFiles = [
      `line-in-${messageId}.jpg`,
      `line-in-${messageId}.png`,
      `line-in-${messageId}.mp4`,
    ];

    for (const f of possibleFiles) {
      const p = path.join(uploadsDir, f);
      if (fs.existsSync(p)) {
        const fileBuf = fs.readFileSync(p);
        const mime = f.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
        return new NextResponse(fileBuf, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    }

    // 2. Ambil dari LINE API
    const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
    const channelAccessToken = rawToken.trim().replace(/^["']|["']$/g, "");

    if (!channelAccessToken) {
      return new NextResponse("LINE Token not configured", { status: 500 });
    }

    const lineRes = await fetch(
      `https://api-data.line.me/v2/bot/message/${messageId}/content`,
      {
        headers: { Authorization: `Bearer ${channelAccessToken}` },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!lineRes.ok) {
      return new NextResponse("Failed to fetch media from LINE", { status: lineRes.status });
    }

    const contentType = lineRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("video") ? "mp4" : "jpg";
    const filename = `line-in-${messageId}.${ext}`;
    const arrayBuffer = await lineRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Simpan ke disk
    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    } catch {}

    // Simpan ke DB MySQL
    try {
      await saveFileToDb({
        buffer,
        filename,
        folder: "line-chat",
        mimeType: contentType,
      });
      // Update media_url di tabel line_chat_messages
      await query(
        `UPDATE line_chat_messages SET media_url = ? WHERE line_message_id = ?`,
        [`/uploads/line-chat/${filename}`, messageId]
      );
    } catch {}

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/line-chat/media-proxy error:", error);
    return new NextResponse("Error fetching media", { status: 500 });
  }
}
