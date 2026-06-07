// src/app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server";

const HONO_BASE = process.env.HONO_API_BASE_URL || "https://v5.jkt48connect.com";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("cava_session")?.value;

    // Revoke di backend (best effort)
    if (token) {
      await fetch(`${HONO_BASE}/api/admin-auth/logout`, {
        method: "POST",
        headers: {
          "Authorization":  `Bearer ${token}`,
          "x-internal-key": process.env.INTERNAL_API_KEY || "",
        },
        signal: AbortSignal.timeout(5000),
      }).catch(() => {}); // Jangan block response meski backend error
    }

    // Hapus cookie apapun yang terjadi di backend
    const response = NextResponse.json(
      { status: true, message: "Logout berhasil" },
      { status: 200 }
    );
    response.cookies.delete("cava_session");

    return response;
  } catch (e: any) {
    // Tetap hapus cookie
    const response = NextResponse.json(
      { status: true, message: "Logout berhasil" },
      { status: 200 }
    );
    response.cookies.delete("cava_session");
    return response;
  }
}
