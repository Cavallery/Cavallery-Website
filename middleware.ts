import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /cavallery-kas: TIDAK di-protect, login/daftar ditampilkan inline di halaman itu sendiri.
  // Halaman lama /profil, /kas, /donasi, /masuk, /daftar → redirect ke /cavallery-kas
  const legacyRedirects = ["/profil", "/kas", "/donasi", "/masuk", "/daftar"];
  for (const legacy of legacyRedirects) {
    if (pathname === legacy || pathname.startsWith(legacy + "/")) {
      return NextResponse.redirect(new URL("/cavallery-kas", req.url));
    }
  }

  // Admin protected routes: /admin/* (kecuali /admin/login)
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  const adminSession =
    req.cookies.get("cava_session")?.value ||
    req.cookies.get("cavallery_admin_session")?.value;

  if (isAdminRoute && !isAdminLogin) {
    if (!adminSession) {
      // In Cavallery, main admin page handles its own login prompt if not authenticated,
      // but sub-pages (/admin/kas, /admin/keanggotaan, etc.) can stay inside admin layout
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
