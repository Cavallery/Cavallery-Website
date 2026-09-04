import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.SESSION_SECRET || "cavallery_secret_jwt_fallback_key_2026";
export const USER_COOKIE_NAME = "cavallery_session";
export const ADMIN_COOKIE_NAME = "cavallery_admin_session";
export const CAVA_SESSION_COOKIE = "cava_session";

export interface UserSessionPayload {
  type: "anggota" | "donatur";
  id: number;
  nama: string;
  noAnggota?: string | null;
  idLine?: string;
  kontakId?: string;
}

export interface AdminSessionPayload {
  type: "admin";
  id: number;
  username: string;
  nama: string;
}

// ── Password Helpers ──
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT Token Helpers ──
export function signToken(payload: UserSessionPayload | AdminSessionPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

export function signSessionToken(payload: UserSessionPayload): string {
  return signToken(payload, "7d");
}

export function signAdminToken(payload: Omit<AdminSessionPayload, "type">): string {
  return signToken({ ...payload, type: "admin" }, "7d");
}

export function verifyToken<T = UserSessionPayload | AdminSessionPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

// Helper verifikasi token format bawaan Cavallery (cava_session: base64.sig)
function verifyCavaSession(token: string): { username: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length === 2) {
      const str = Buffer.from(parts[0], "base64").toString("utf-8");
      const secret = process.env.SESSION_SECRET || "cava-secret-key-2026";
      const sig = crypto.createHmac("sha256", secret).update(str).digest("hex");
      if (sig === parts[1]) {
        const parsed = JSON.parse(str);
        if (parsed.exp && parsed.exp > Date.now()) {
          return { username: parsed.username || "Vallencia" };
        }
      }
    }
  } catch {}
  return null;
}

// ── Cookie Setters ──
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: USER_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function setAdminSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

// ── Session Readers ──
export async function getUserSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken<UserSessionPayload>(token);
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  
  // 1. Cek cava_session (bawaan login dashboard Cavallery)
  const cavaToken = cookieStore.get(CAVA_SESSION_COOKIE)?.value;
  if (cavaToken) {
    const local = verifyCavaSession(cavaToken);
    if (local) {
      return { type: "admin", id: 1, username: local.username, nama: local.username };
    }
  }

  // 2. Cek cavallery_admin_session
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (adminToken) {
    return verifyToken<AdminSessionPayload>(adminToken);
  }

  return null;
}

// ── Request-based Session Check (for Route Handlers / Middleware) ──
export function getUserSessionFromReq(req: NextRequest): UserSessionPayload | null {
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken<UserSessionPayload>(token);
}

export function getMemberSessionFromReq(req: NextRequest): UserSessionPayload | null {
  const session = getUserSessionFromReq(req);
  if (!session) return null;
  return session;
}

export function getAdminSessionFromReq(req: NextRequest): AdminSessionPayload | null {
  // 1. Cek cava_session (login standar dashboard /admin)
  const cavaToken = req.cookies.get(CAVA_SESSION_COOKIE)?.value;
  if (cavaToken) {
    const local = verifyCavaSession(cavaToken);
    if (local) {
      return { type: "admin", id: 1, username: local.username, nama: local.username };
    }
  }

  // 2. Cek cavallery_admin_session
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (token) {
    return verifyToken<AdminSessionPayload>(token);
  }

  return null;
}
