// src/app/api/admin/verify/route.ts
// Verify admin session cookie

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const HONO_BASE = process.env.HONO_API_BASE_URL || "https://v5.jkt48connect.com";

function verifyLocalToken(token: string): { valid: boolean; username?: string; expiresAt?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };
    const str = Buffer.from(parts[0], "base64").toString("utf-8");
    const sig = crypto.createHmac("sha256", process.env.SESSION_SECRET || "cava-secret-key-2026").update(str).digest("hex");
    if (sig !== parts[1]) return { valid: false };
    const parsed = JSON.parse(str);
    if (parsed.exp < Date.now()) return { valid: false };
    return { valid: true, username: parsed.username, expiresAt: new Date(parsed.exp).toISOString() };
  } catch {
    return { valid: false };
  }
}

export async function GET(req: NextRequest) {
  return verifySession(req);
}

export async function POST(req: NextRequest) {
  return verifySession(req);
}

async function verifySession(req: NextRequest) {
  try {
    const token = req.cookies.get("cava_session")?.value;

    if (!token) {
      return NextResponse.json(
        { status: false, valid: false, message: "Tidak ada session" },
        { status: 401 }
      );
    }

    // 1. Check local token
    const local = verifyLocalToken(token);
    if (local.valid) {
      return NextResponse.json(
        {
          status: true,
          valid: true,
          username: local.username || "Vallencia",
          expiresAt: local.expiresAt,
        },
        { status: 200 }
      );
    }

    // 2. Try Hono verify
    try {
      const honoRes = await fetch(`${HONO_BASE}/api/admin-auth/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-internal-key": process.env.INTERNAL_API_KEY || "",
          "user-agent": req.headers.get("user-agent") || "",
        },
        signal: AbortSignal.timeout(6000),
      });

      const data = await honoRes.json();

      if (data.status && data.valid) {
        return NextResponse.json(
          {
            status: true,
            valid: true,
            username: data.username,
            expiresAt: data.expiresAt,
          },
          { status: 200 }
        );
      }
    } catch {}

    const response = NextResponse.json(
      { status: false, valid: false, message: "Session tidak valid atau kadaluarsa" },
      { status: 401 }
    );
    response.cookies.delete("cava_session");
    return response;
  } catch (e: any) {
    console.error("[/api/admin/verify] error:", e.message);
    return NextResponse.json(
      { status: false, valid: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
