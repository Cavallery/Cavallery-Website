import { NextRequest, NextResponse } from "next/server";
import { deleteMediaItems } from "@/lib/mediaDb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || (body.action === "delete" ? body.ids : []);
    if (Array.isArray(ids) && ids.length > 0) {
      const { count } = await deleteMediaItems(ids);
      return NextResponse.json({ status: true, message: `${count} media berhasil dihapus dari database & server` });
    }
    return NextResponse.json({ status: false, message: "Daftar ID media kosong" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Gagal memproses bulk action" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || [];
    if (Array.isArray(ids) && ids.length > 0) {
      const { count } = await deleteMediaItems(ids);
      return NextResponse.json({ status: true, message: `${count} media berhasil dihapus dari database & server` });
    }
    return NextResponse.json({ status: false, message: "Daftar ID media kosong" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus bulk media" },
      { status: 500 }
    );
  }
}
