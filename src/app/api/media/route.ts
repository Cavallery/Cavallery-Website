import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const MEDIA_API_BASE = "https://v5.jkt48connect.com/api/cavallery";
const MEDIA_API_KEY = "JKTCONNECT";

function getDB() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "";
    const type = searchParams.get("type") || "";
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    // 1. Ambil data lokal dari MySQL
    const db = await getDB();
    let localItems: any[] = [];
    let localTotal = 0;

    try {
      const conditions: string[] = ["1=1"];
      const params: any[] = [];

      if (search) {
        conditions.push("(original_name LIKE ? OR alt_text LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }
      if (folder) {
        conditions.push("folder = ?");
        params.push(folder);
      }
      if (type) {
        conditions.push("type = ?");
        params.push(type);
      }

      const whereClause = conditions.join(" AND ");
      const [countRows]: any = await db.query(
        `SELECT COUNT(*) AS total FROM media WHERE ${whereClause}`,
        params
      );
      localTotal = countRows[0]?.total || 0;

      const [rows]: any = await db.query(
        `SELECT * FROM media WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      localItems = rows;
    } catch (e: any) {
      console.warn("Local MySQL media query error:", e.message);
    } finally {
      await db.end();
    }

    // 2. Jika ada data remote dari JKTConnect, ambil juga untuk melengkapi
    let remoteItems: any[] = [];
    try {
      const targetUrl = `${MEDIA_API_BASE}/media?apikey=${MEDIA_API_KEY}&${searchParams.toString()}`;
      const res = await fetch(targetUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 CavalleryApp/1.0",
        },
        next: { revalidate: 30 },
      });
      if (res.ok) {
        const remoteData = await res.json();
        if (Array.isArray(remoteData?.data?.items)) {
          remoteItems = remoteData.data.items;
        }
      }
    } catch (e) {
      // Remote unavailable, ignore
    }

    // Gabungkan list: local items diutamakan di paling atas
    const seenIds = new Set(localItems.map((i) => i.id));
    const combined = [...localItems];
    for (const r of remoteItems) {
      if (!seenIds.has(r.id)) {
        combined.push(r);
        seenIds.add(r.id);
      }
    }

    return NextResponse.json({
      status: true,
      message: "Data media berhasil diambil",
      data: {
        total: Math.max(localTotal, combined.length),
        limit,
        offset,
        items: combined,
      },
    });
  } catch (error: any) {
    console.error("Media API GET Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal memuat media", data: { items: [], total: 0 } },
      { status: 500 }
    );
  }
}
