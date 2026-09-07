import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const startTime = Date.now();
  const { pathname } = req.nextUrl;

  // 1. Legacy redirects
  const legacyRedirects = ["/profil", "/kas", "/donasi", "/masuk", "/daftar"];
  for (const legacy of legacyRedirects) {
    if (pathname === legacy || pathname.startsWith(legacy + "/")) {
      return NextResponse.redirect(new URL("/cavallery-kas", req.url));
    }
  }

  // 2. Blokir total rute lama /admin (jadikan 404 Not Found)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  // 3. Proteksi Sub-halaman Admin Baru & API Admin
  const adminSession =
    req.cookies.get("cava_session")?.value ||
    req.cookies.get("cavallery_admin_session")?.value;

  const isAdminSubRoute =
    pathname.startsWith("/internal/dashboard-admin-xv7r2q/") &&
    pathname !== "/internal/dashboard-admin-xv7r2q/login";

  if (isAdminSubRoute) {
    if (!adminSession) {
      // Belum login admin -> redirect paksa ke halaman login admin baru
      const redirectRes = NextResponse.redirect(
        new URL("/internal/dashboard-admin-xv7r2q", req.url)
      );
      redirectRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      redirectRes.headers.set("Pragma", "no-cache");
      redirectRes.headers.set("Expires", "0");
      return redirectRes;
    }
  }

  // Proteksi endpoint /api/admin/* kecuali route autentikasi (login, logout, verify)
  const isProtectedAdminApi =
    pathname.startsWith("/api/admin/") &&
    !pathname.startsWith("/api/admin/login") &&
    !pathname.startsWith("/api/admin/logout") &&
    !pathname.startsWith("/api/admin/verify");

  if (isProtectedAdminApi && !adminSession) {
    return NextResponse.json(
      { status: false, message: "Akses ditolak. Sesi admin tidak ditemukan." },
      { status: 401 }
    );
  }

  const response = NextResponse.next();

  // Pastikan halaman admin tidak di-cache oleh browser dan tidak diindeks search engine
  if (
    pathname.startsWith("/internal/dashboard-admin-xv7r2q") ||
    pathname.startsWith("/internal/iuran-kas-xv7r2q")
  ) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  // 4. Logging durasi request jika lambat (> 5 detik / 5000ms) untuk melacak pemicu 504 Gateway Timeout
  const duration = Date.now() - startTime;
  if (duration > 5000) {
    const timestamp = new Date().toISOString();
    console.warn(`[SLOW_REQUEST_ALERT] [${timestamp}] ${req.method} ${pathname} took ${duration}ms (>5s warning)`);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/internal/dashboard-admin-xv7r2q/:path*",
    "/internal/dashboard-admin-xv7r2q",
    "/api/admin/:path*",
    "/profil/:path*",
    "/profil",
    "/kas/:path*",
    "/kas",
    "/donasi/:path*",
    "/donasi",
    "/masuk",
    "/daftar",
  ],
};

