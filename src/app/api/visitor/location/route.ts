import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

/**
 * POST /api/visitor/location
 *
 * Menerima data lokasi (latitude, longitude, accuracy) dari client-side
 * Geolocation API dan menyimpannya ke database visitor_locations.
 *
 * Data ini hanya dicatat jika user secara sukarela mengizinkan akses lokasi.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, accuracy, page, timestamp } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, message: "Koordinat tidak lengkap" },
        { status: 400 }
      );
    }

    // Ambil IP dan User-Agent dari header
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    if (isMySqlConfigured()) {
      try {
        // Auto-create table jika belum ada
        await query(`
          CREATE TABLE IF NOT EXISTS visitor_locations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip_address VARCHAR(64) DEFAULT 'unknown',
            latitude DECIMAL(10, 7),
            longitude DECIMAL(10, 7),
            accuracy DECIMAL(10, 2) DEFAULT NULL,
            page_path VARCHAR(255) DEFAULT '/',
            user_agent TEXT,
            visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await query(
          `INSERT INTO visitor_locations (ip_address, latitude, longitude, accuracy, page_path, user_agent, visit_time)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            ip,
            latitude,
            longitude,
            accuracy || null,
            page || "/",
            userAgent,
            timestamp || new Date().toISOString(),
          ]
        );

        return NextResponse.json({ success: true });
      } catch (dbErr: any) {
        console.warn("visitor/location DB error:", dbErr.message);
      }
    }

    // Fallback: log ke console jika MySQL tidak tersedia
    console.log(
      `[Visitor Location] IP: ${ip} | Lat: ${latitude} | Lng: ${longitude} | Acc: ${accuracy}m | Page: ${page}`
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/visitor/location
 * Mengambil daftar data koordinat GPS pengunjung yang mengizinkan lokasi (maksimal 200 data terbaru)
 */
export async function GET() {
  if (!isMySqlConfigured()) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const rows = await query<any[]>(
      `SELECT id, ip_address, latitude, longitude, accuracy, page_path, user_agent, visit_time, created_at 
       FROM visitor_locations 
       ORDER BY id DESC 
       LIMIT 200`
    );
    return NextResponse.json({ success: true, data: rows || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
