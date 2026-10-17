import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { reorderStructureNodes } from "@/lib/structure";

export const dynamic = "force-dynamic";

const denied = () =>
  NextResponse.json(
    { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
    { status: 401 }
  );

// POST /api/admin/structure/reorder: Simpan urutan node
export async function POST(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();

  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { status: false, message: "Daftar urutan kosong atau format tidak valid" },
        { status: 400 }
      );
    }

    const validItems: { id: number; sort_order: number }[] = [];
    for (const it of items) {
      const id = Number(it.id);
      const sort_order = Number(it.sort_order);
      if (!id || isNaN(id) || isNaN(sort_order)) continue;
      validItems.push({ id, sort_order });
    }

    await reorderStructureNodes(validItems);

    return NextResponse.json({
      status: true,
      message: "Urutan struktur berhasil disimpan.",
    });
  } catch (error: any) {
    console.error("[Admin Structure Reorder Error]:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menyimpan urutan" },
      { status: 500 }
    );
  }
}
