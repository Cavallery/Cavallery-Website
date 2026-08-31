// src/app/api/admin/login/route.ts
// Login endpoint with STRICT MySQL database authentication

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query, isMySqlConfigured } from "@/lib/mysql";

function createSessionToken(username: string): string {
  const payload = {
    username,
    role: "superadmin",
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  };
  const str = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", process.env.SESSION_SECRET || "cava-secret-key-2026").update(str).digest("hex");
  return Buffer.from(str).toString("base64") + "." + sig;
}

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

    const u = username.trim();
    const p = password.trim();

    // 1. Prioritas Utama: Autentikasi ketat via Database MySQL (tabel: admin_users)
    if (isMySqlConfigured()) {
      try {
        const rows = await query<any[]>(
          "SELECT * FROM `admin_users` WHERE LOWER(`username`) = LOWER(?) LIMIT 1",
          [u]
        );

        if (rows && rows.length > 0) {
          const userRow = rows[0];
          const dbPassword = userRow.password_hash || userRow.password;

          // Cek kecocokan password dengan database MySQL Anda
          if (dbPassword === p) {
            const displayName = userRow.name || userRow.username;
            const token = createSessionToken(displayName);
            const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

            const response = NextResponse.json(
              {
                status: true,
                message: "Login berhasil",
                username: displayName,
                expiresAt,
              },
              { status: 200 }
            );

            response.cookies.set("cava_session", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 8 * 60 * 60,
              path: "/",
            });

            return response;
          } else {
            // Password salah di database MySQL -> Tolak langsung (jangan tembus ke password lama)
            return NextResponse.json(
              { status: false, message: "Username atau password salah" },
              { status: 401 }
            );
          }
        }
      } catch (dbErr: any) {
        console.error("MySQL Admin Auth Error:", dbErr.message);
      }
    }

    // 2. Fallback offline jika MySQL terputus (Hanya password baru kurn!@wan)
    if (
      (u.toLowerCase() === "vallencia" || u.toLowerCase() === "admin") &&
      p === "kurn!@wan"
    ) {
      const token = createSessionToken(u);
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

      const response = NextResponse.json(
        {
          status: true,
          message: "Login berhasil",
          username: u,
          expiresAt,
        },
        { status: 200 }
      );

      response.cookies.set("cava_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 8 * 60 * 60,
        path: "/",
      });

      return response;
    }

    // Tolak semua password lama yang tidak terdaftar
    return NextResponse.json(
      { status: false, message: "Username atau password salah" },
      { status: 401 }
    );
  } catch (e: any) {
    console.error("[/api/admin/login] error:", e.message);
    return NextResponse.json(
      { status: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
