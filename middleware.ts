import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Legacy redirects
  const legacyRedirects = ["/profil", "/kas", "/donasi", "/masuk", "/daftar"];
  for (const legacy of legacyRedirects) {
    if (pathname === legacy || pathname.startsWith(legacy + "/")) {
      return NextResponse.redirect(new URL("/cavallery-kas", req.url));
    }
  }

  // 2. Proteksi Sub-halaman Admin (/admin/keanggotaan, /admin/kas, dll.)
  const isAdminSubRoute = pathname.startsWith("/admin/") && pathname !== "/admin/login";
  
  const adminSession =
    req.cookies.get("cava_session")?.value ||
    req.cookies.get("cavallery_admin_session")?.value;

  if (isAdminSubRoute) {
    if (!adminSession) {
      // Belum login admin -> redirect paksa ke halaman login /admin
      const redirectRes = NextResponse.redirect(new URL("/admin", req.url));
      redirectRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      redirectRes.headers.set("Pragma", "no-cache");
      redirectRes.headers.set("Expires", "0");
      return redirectRes;
    }
  }

  const response = NextResponse.next();

  // Pastikan halaman admin tidak di-cache oleh browser (mencegah bug tombol back bfcache)
  if (pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
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
