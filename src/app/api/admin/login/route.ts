// src/app/api/admin/login/route.ts
// Next.js App Router API route — proxy ke Hono backend
// Tidak expose Hono URL ke frontend sama sekali

import { NextRequest, NextResponse } from "next/server";

const HONO_BASE = process.env.HONO_API_BASE_URL || "https://v5.jkt48connect.com";

export async function POST(req: NextRequest) {
  try {
    let body: { username?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { status: false, message: "Request body tidak valid" },
        { status: 400 }
      );
    }

    const { username, password } = body;

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json(
        { status: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Forward ke Hono backend
    const honoRes = await fetch(`${HONO_BASE}/api/admin-auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Teruskan IP asli ke backend
        "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
        "x-real-ip":       req.headers.get("x-real-ip") || "",
        "user-agent":      req.headers.get("user-agent") || "",
        // Internal key agar Hono tahu request ini dari Next.js (bukan public)
        "x-internal-key":  process.env.INTERNAL_API_KEY || "",
      },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await honoRes.json();

    if (!data.status) {
      return NextResponse.json(data, { status: honoRes.status });
    }

    // Simpan token di httpOnly cookie (lebih aman dari localStorage)
    const response = NextResponse.json(
      {
        status: true,
        message: "Login berhasil",
        expiresAt: data.expiresAt,
        // Jangan kirim token ke client dalam body response
        // Client tidak perlu pegang raw JWT
      },
      { status: 200 }
    );

    // Set httpOnly cookie — tidak bisa diakses JS di browser
    response.cookies.set("cava_session", data.token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   8 * 60 * 60, // 8 jam, sama dengan JWT expiry
      path:     "/",
    });

    return response;
  } catch (e: any) {
    console.error("[/api/admin/login] error:", e.message);
    return NextResponse.json(
      { status: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
