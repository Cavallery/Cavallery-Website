import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ORDER_FILE_PATH = path.join(process.cwd(), "src", "data", "media-order.json");
const VALLZY_BASE = "https://v5.jkt48connect.com/api/cavallery/media";
const API_KEY = "JKTCONNECT";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderedIds: string[] = body.orderedIds;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { status: false, message: "orderedIds harus berupa array ID media" },
        { status: 400 }
      );
    }

    // 1. Save local custom order
    try {
      const dir = path.dirname(ORDER_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ORDER_FILE_PATH, JSON.stringify({ orderedIds }, null, 2), "utf-8");
    } catch {}

    // 2. Forward to Vallzy server if supported
    try {
      await fetch(`${VALLZY_BASE}/reorder?apikey=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (e: any) {
      console.warn("Vallzy reorder forward warn:", e.message);
    }

    return NextResponse.json({
      status: true,
      success: true,
      message: `Urutan ${orderedIds.length} foto & video berhasil disimpan`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengubah urutan media" },
      { status: 500 }
    );
  }
}
