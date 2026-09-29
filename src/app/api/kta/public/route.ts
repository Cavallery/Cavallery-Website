import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import crypto from "crypto";

export const runtime = "nodejs";

function generatePublicCode(): string {
  // Generate 10-character unique alphanumeric string (A-Z, 0-9)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable characters
  let code = "";
  const randomBytes = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

export async function GET(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Akses ditolak." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const rows = await query<any[]>(
      "SELECT public_code, public_card_enabled, privacy_mode_default FROM anggota WHERE id = ? LIMIT 1",
      [session.id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { status: false, message: "Data anggota tidak ditemukan." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const row = rows[0];
    return NextResponse.json(
      {
        status: true,
        data: {
          publicCode: row.public_code || null,
          publicCardEnabled: Boolean(row.public_card_enabled),
          privacyModeDefault: Boolean(row.privacy_mode_default),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("GET KTA public status error:", error?.message);
    return NextResponse.json(
      { status: false, message: "Gagal memuat status kartu publik." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan masuk terlebih dahulu." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const body = await req.json();
    const { publicCardEnabled, regenerateCode } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let newPublicCode: string | null = null;

    if (publicCardEnabled !== undefined) {
      if (typeof publicCardEnabled !== "boolean") {
        return NextResponse.json(
          { status: false, message: "Format publicCardEnabled tidak valid." },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }
      updates.push("public_card_enabled = ?");
      values.push(publicCardEnabled ? 1 : 0);
    }

    if (regenerateCode === true) {
      newPublicCode = generatePublicCode();
      updates.push("public_code = ?");
      values.push(newPublicCode);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { status: false, message: "Tidak ada data yang diubah." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    values.push(session.id);
    await query(
      `UPDATE anggota SET ${updates.join(", ")}, updated_at = UTC_TIMESTAMP() WHERE id = ?`,
      values
    );

    // Fetch updated row
    const rows = await query<any[]>(
      "SELECT public_code, public_card_enabled FROM anggota WHERE id = ? LIMIT 1",
      [session.id]
    );

    const updated = rows && rows.length > 0 ? rows[0] : null;

    return NextResponse.json(
      {
        status: true,
        message: regenerateCode
          ? "Tautan kartu publik baru berhasil dibuat. Tautan lama otomatis tidak aktif."
          : "Pengaturan kartu publik berhasil diperbarui.",
        publicCardEnabled: Boolean(updated?.public_card_enabled),
        publicCode: updated?.public_code || newPublicCode,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("PATCH KTA public error:", error?.message);
    return NextResponse.json(
      { status: false, message: "Terjadi kesalahan saat memperbarui kartu publik." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
