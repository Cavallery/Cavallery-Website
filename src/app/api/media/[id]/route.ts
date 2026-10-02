import { NextRequest, NextResponse } from "next/server";
import { deleteMediaItems } from "@/lib/mediaDb";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    if (!cleanId) {
      return NextResponse.json(
        { status: false, message: "ID media tidak valid" },
        { status: 400 }
      );
    }

    await deleteMediaItems([cleanId]);

    return NextResponse.json({
      status: true,
      success: true,
      message: "Media berhasil dihapus dari database & server",
    });
  } catch (error: any) {
    console.error("Media Delete Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Gagal menghapus media" },
      { status: 500 }
    );
  }
}
