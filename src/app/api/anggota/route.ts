import { NextRequest, NextResponse } from "next/server";
import {
  fetchAllAnggota,
  getFilteredAnggota,
  getPublicMemberList,
  addAnggota,
  updateAnggota,
  deleteAnggota,
} from "@/lib/anggotaCavaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const batch = searchParams.get("batch") || "";
    const status = (searchParams.get("status") || "all") as "Aktif" | "Keluar" | "all";
    const role = searchParams.get("role") || "all";
    const isPublic = searchParams.get("public") === "true";

    if (isPublic) {
      const data = await getPublicMemberList({ search, batch, status });
      return NextResponse.json({
        success: true,
        count: data.length,
        data,
      });
    }

    const result = await getFilteredAnggota({
      search,
      batch,
      status,
      role,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[API /api/anggota GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch anggota" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.noAnggota || !body.nama) {
      return NextResponse.json(
        { success: false, error: "Nomor Anggota dan Nama Anggota wajib diisi!" },
        { status: 400 }
      );
    }

    const created = await addAnggota({
      batch: body.batch || "Batch 1",
      batchNumber: Number(body.batchNumber || 1),
      noAnggota: body.noAnggota.trim(),
      nama: body.nama.trim(),
      idLine: body.idLine || "-",
      domisili: body.domisili || "-",
      displayName: body.displayName || body.noAnggota,
      tunggakanKas: body.tunggakanKas || "-",
      nominalKas: body.nominalKas || "-",
      nominalKasNumber: Number(String(body.nominalKas || "").replace(/[^\d]/g, "") || 0),
      terakhirBayar: body.terakhirBayar || "-",
      status: body.status === "Keluar" ? "Keluar" : "Aktif",
      role: body.role === "Admin" ? "Admin" : body.role === "Keluar" ? "Keluar" : "Anggota",
    });

    return NextResponse.json({
      success: true,
      message: "Anggota berhasil ditambahkan",
      data: created,
    });
  } catch (error: any) {
    console.error("[API /api/anggota POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambahkan anggota" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || body.noAnggota;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID atau Nomor Anggota diperlukan" },
        { status: 400 }
      );
    }

    const updated = await updateAnggota(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data anggota berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    console.error("[API /api/anggota PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui data anggota" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("noAnggota");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID atau noAnggota diperlukan" },
        { status: 400 }
      );
    }

    const ok = await deleteAnggota(id);
    return NextResponse.json({
      success: ok,
      message: ok ? "Anggota berhasil dihapus" : "Anggota tidak ditemukan",
    });
  } catch (error: any) {
    console.error("[API /api/anggota DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus anggota" },
      { status: 500 }
    );
  }
}
