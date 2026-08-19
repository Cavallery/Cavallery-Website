import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    // Lindungi sub-halaman /admin/:path* jika ada
    "/admin/:path*",
  ],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Izinkan halaman /admin utama dan seluruh endpoint API admin
  if (pathname === "/admin" || pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Untuk sub-path lain di bawah /admin (jika ada), cek cookie
  const token = req.cookies.get("cava_session")?.value;
  if (!token) {
    const adminUrl = new URL("/admin", req.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}
