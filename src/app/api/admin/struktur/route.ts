import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import {
  createStructureNode,
  deleteStructureNode,
  getAllNodes,
  getFullStructure,
  updateStructureNode,
} from "@/lib/structure";

export const dynamic = "force-dynamic";

const denied = () =>
  NextResponse.json(
    { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
    { status: 401 }
  );

// GET: ambil struktur lengkap
export async function GET(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const full = await getFullStructure(false);
    return NextResponse.json({
      status: true,
      data: full.nodes,
      tree: full.tree,
      settings: full.settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat struktur" },
      { status: 500 }
    );
  }
}

// POST: tambah node
export async function POST(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const body = await req.json();
    const data = await createStructureNode(body);
    return NextResponse.json({
      status: true,
      message: `${data.role_label} ditambahkan ke struktur.`,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menambah pengurus" },
      { status: 400 }
    );
  }
}

// PUT / PATCH: update node
export async function PUT(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const body = await req.json();
    const id = Number(body?.id);
    if (!id) return NextResponse.json({ status: false, message: "ID tidak valid" }, { status: 400 });
    const data = await updateStructureNode(id, body);
    return NextResponse.json({ status: true, message: "Data pengurus diperbarui.", data });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui pengurus" },
      { status: 400 }
    );
  }
}

// DELETE: hapus node
export async function DELETE(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return denied();
  try {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ status: false, message: "ID tidak valid" }, { status: 400 });
    const res = await deleteStructureNode(id);
    return NextResponse.json({
      status: true,
      message: `Node berhasil dihapus (${res.affectedCount} node terhapus).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menghapus pengurus" },
      { status: 400 }
    );
  }
}
