import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

const JSON_FILE_PATH = path.join(process.cwd(), "src", "data", "twoshot.json");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID diperlukan" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query("UPDATE `twoshot` SET `likes` = `likes` + 1 WHERE `id` = ?", [id]);
      const rows = await query<any[]>("SELECT `likes` FROM `twoshot` WHERE `id` = ?", [id]);
      return NextResponse.json({
        success: true,
        likes: rows?.[0]?.likes || 0,
      });
    }

    // JSON Fallback
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      const items = JSON.parse(raw);
      const item = items.find((i: any) => String(i.id) === String(id));
      if (item) {
        item.likes = (item.likes || 0) + 1;
        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
        return NextResponse.json({ success: true, likes: item.likes });
      }
    }

    return NextResponse.json({ success: true, likes: 1 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
