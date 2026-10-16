import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { createPengurus, deletePengurus, listPengurus, parsePengurusInput, updatePengurus } from "@/lib/struktur";

export const dynamic = "force-dynamic";

const denied = () => NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });

function parseId(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ── GET: seluruh pengurus (termasuk nonaktif) ──
export async function GET(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const data = await listPengurus({ includeInactive: true });
    return NextResponse.json({ status: true, data });
  } catch (error: unknown) {
    console.error("Admin get struktur error:", error);
    return NextResponse.json({ status: false, message: "Gagal memuat struktur" }, { status: 500 });
  }
}

// ── POST: tambah pengurus ──
export async function POST(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const parsed = parsePengurusInput(await req.json());
    if ("error" in parsed) return NextResponse.json({ status: false, message: parsed.error }, { status: 400 });
    const data = await createPengurus(parsed.value);
    return NextResponse.json({ status: true, message: `${data.nama} ditambahkan ke struktur.`, data });
  } catch (error: unknown) {
    console.error("Admin create struktur error:", error);
    return NextResponse.json({ status: false, message: (error instanceof Error && error.message) || "Gagal menambah pengurus" }, { status: 500 });
  }
}

// ── PUT: ubah pengurus (body berisi id) ──
export async function PUT(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const body = await req.json();
    const id = parseId(body?.id);
    if (!id) return NextResponse.json({ status: false, message: "ID tidak valid" }, { status: 400 });
    const parsed = parsePengurusInput(body);
    if ("error" in parsed) return NextResponse.json({ status: false, message: parsed.error }, { status: 400 });
    const ok = await updatePengurus(id, parsed.value);
    if (!ok) return NextResponse.json({ status: false, message: "Data tidak ditemukan atau gagal disimpan" }, { status: 404 });
    return NextResponse.json({ status: true, message: "Data pengurus diperbarui." });
  } catch (error: unknown) {
    console.error("Admin update struktur error:", error);
    return NextResponse.json({ status: false, message: "Gagal memperbarui pengurus" }, { status: 500 });
  }
}

// ── DELETE: hapus pengurus (?id=) ──
export async function DELETE(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const id = parseId(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ status: false, message: "ID tidak valid" }, { status: 400 });
    const ok = await deletePengurus(id);
    if (!ok) return NextResponse.json({ status: false, message: "Data tidak ditemukan atau gagal dihapus" }, { status: 404 });
    return NextResponse.json({ status: true, message: "Pengurus dihapus dari struktur." });
  } catch (error: unknown) {
    console.error("Admin delete struktur error:", error);
    return NextResponse.json({ status: false, message: "Gagal menghapus pengurus" }, { status: 500 });
  }
}
