import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import {
  getAllBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from "@/lib/recruitmentBatch";

// GET: Ambil daftar seluruh batch rekrutmen
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const batches = await getAllBatches();
    return NextResponse.json({ status: true, batches });
  } catch (error: any) {
    console.error("GET /api/admin/recruitment-batches error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal mengambil data batch" },
      { status: 500 }
    );
  }
}

// POST: Buat batch rekrutmen baru
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, year, start_date, end_date, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { status: false, message: "Nama batch wajib diisi (contoh: Batch 9)" },
        { status: 400 }
      );
    }

    const newId = await createBatch({
      name,
      description,
      year: Number(year) || new Date().getFullYear(),
      start_date,
      end_date,
      status: status === "open" ? "open" : "closed",
    });

    return NextResponse.json({
      status: true,
      message: `Batch "${name}" berhasil dibuat!`,
      batchId: newId,
    });
  } catch (error: any) {
    console.error("POST /api/admin/recruitment-batches error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal membuat batch baru" },
      { status: 500 }
    );
  }
}

// PATCH: Update batch (buka/tutup status, ganti nama, dll)
export async function PATCH(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ status: false, message: "ID batch wajib dikirim" }, { status: 400 });
    }

    const ok = await updateBatch(Number(id), data);
    if (!ok) {
      return NextResponse.json({ status: false, message: "Gagal memperbarui batch" }, { status: 400 });
    }

    return NextResponse.json({
      status: true,
      message: "Data batch berhasil diperbarui!",
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/recruitment-batches error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui batch" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus batch
export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: false, message: "ID batch wajib dikirim" }, { status: 400 });
    }

    await deleteBatch(Number(id));
    return NextResponse.json({
      status: true,
      message: "Batch berhasil dihapus. Anggota di dalam batch ini tetap tersimpan dengan status umum.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/recruitment-batches error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menghapus batch" },
      { status: 500 }
    );
  }
}
