// src/app/api/admin/verify/route.ts
// Dipanggil oleh middleware dan client untuk cek session

import { NextRequest, NextResponse } from "next/server";

const HONO_BASE = process.env.HONO_API_BASE_URL || "https://v5.jkt48connect.com";

export async function GET(req: NextRequest) {
  return verifySession(req);
}

export async function POST(req: NextRequest) {
  return verifySession(req);
}

async function verifySession(req: NextRequest) {
  try {
    // Ambil token dari httpOnly cookie (bukan dari client JS)
    const token = req.cookies.get("cava_session")?.value;

    if (!token) {
      return NextResponse.json(
        { status: false, valid: false, message: "Tidak ada session" },
        { status: 401 }
      );
    }

    const honoRes = await fetch(`${HONO_BASE}/api/admin-auth/verify`, {
      method: "POST",
      headers: {
        "Authorization":  `Bearer ${token}`,
        "x-internal-key": process.env.INTERNAL_API_KEY || "",
        "user-agent":     req.headers.get("user-agent") || "",
      },
      signal: AbortSignal.timeout(8000),
    });

    const data = await honoRes.json();

    if (!data.status || !data.valid) {
      // Hapus cookie yang tidak valid
      const response = NextResponse.json(
        { status: false, valid: false, message: data.message || "Session tidak valid" },
        { status: 401 }
      );
      response.cookies.delete("cava_session");
      return response;
    }

    return NextResponse.json(
      {
        status:    true,
        valid:     true,
        username:  data.username,
        expiresAt: data.expiresAt,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[/api/admin/verify] error:", e.message);
    return NextResponse.json(
      { status: false, valid: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
