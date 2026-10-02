import { NextRequest, NextResponse } from "next/server";
import { updateMediaOrder } from "@/lib/mediaDb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderedIds: string[] = body.orderedIds;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { status: false, message: "orderedIds harus berupa array ID media" },
        { status: 400 }
      );
    }

    await updateMediaOrder(orderedIds);

    return NextResponse.json({
      status: true,
      success: true,
      message: `Urutan ${orderedIds.length} foto & video berhasil disimpan ke database`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Gagal mengubah urutan media" },
      { status: 500 }
    );
  }
}
