// src/middleware.ts
// Proteksi semua halaman /admin di level edge — sebelum React render
// File ini diletakkan di ROOT project (sama level dengan src/)

import { NextRequest, NextResponse } from "next/server";

const HONO_BASE    = process.env.HONO_API_BASE_URL || "https://v5.jkt48connect.com";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY  || "";
const LOGIN_PAGE   = "/admin/login"; // Redirect ke sini kalau tidak auth

export const config = {
  matcher: [
    // Proteksi semua /admin kecuali halaman login itu sendiri dan API auth
    "/admin/((?!login$).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("cava_session")?.value;

  // Tidak ada cookie → redirect langsung, tanpa hit backend
  if (!token) {
    return redirectToLogin(req);
  }

  try {
    // Verifikasi ke Hono backend
    const verifyRes = await fetch(`${HONO_BASE}/api/admin-auth/verify`, {
      method: "POST",
      headers: {
        "Authorization":  `Bearer ${token}`,
        "x-internal-key": INTERNAL_KEY,
        "user-agent":     req.headers.get("user-agent") || "",
        "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
      },
      signal: AbortSignal.timeout(5000), // Timeout 5 detik di edge
    });

    if (!verifyRes.ok) {
      const res = redirectToLogin(req);
      res.cookies.delete("cava_session");
      return res;
    }

    const data = await verifyRes.json();

    if (!data.status || !data.valid) {
      const res = redirectToLogin(req);
      res.cookies.delete("cava_session");
      return res;
    }

    // Valid — lanjutkan, injeksi info user ke header (opsional)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-admin-user", data.username || "");

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (e) {
    // Backend timeout/error — jangan block user, allow sementara
    // atau redirect ke login, tergantung preferensi
    // Di sini kita redirect untuk keamanan
    console.error("[middleware] verify error:", e);
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL(LOGIN_PAGE, req.url);
  // Simpan URL tujuan untuk redirect balik setelah login
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
