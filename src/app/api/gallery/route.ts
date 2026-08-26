import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

const EXTERNAL_GALLERY_URL = "https://v5.jkt48connect.com/api/cavallery/gallery?apikey=JKTCONNECT";

async function fetchExternalGallery(): Promise<any[]> {
  try {
    const res = await fetch(EXTERNAL_GALLERY_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 CavalleryApp/1.0",
      },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status && Array.isArray(json.data?.items)) {
        return json.data.items;
      }
    }
  } catch (e) {
    console.error("External gallery fetch failed:", e);
  }
  return [];
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `gallery` WHERE `is_active`=1 ORDER BY `sort_order` ASC, `id` DESC");
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return NextResponse.json({ status: true, success: true, data: { items: rows } });
      }
    }

    const extItems = await fetchExternalGallery();
    return NextResponse.json({ status: true, success: true, data: { items: extItems } });
  } catch (error: any) {
    const extItems = await fetchExternalGallery();
    return NextResponse.json({ status: true, success: true, data: { items: extItems } });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isMySqlConfigured()) return NextResponse.json({ status: false, message: "MySQL not configured" }, { status: 500 });

    const result: any = await query(
      "INSERT INTO `gallery` (`title`, `image_url`, `date_label`, `alt_text`, `tags`, `sort_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        body.title || "",
        body.image_url || "",
        body.date_label || "",
        body.alt_text || "",
        body.tags || "",
        Number(body.sort_order) || 0,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
      ]
    );
    return NextResponse.json({ status: true, success: true, id: result.insertId, message: "Foto galeri berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ status: false, success: false, message: error.message }, { status: 500 });
  }
}
