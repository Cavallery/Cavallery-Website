import { NextRequest, NextResponse } from "next/server";

const MEDIA_API_BASE = "https://v5.jkt48connect.com/api/cavallery";
const MEDIA_API_KEY = "JKTCONNECT";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const targetUrl = `${MEDIA_API_BASE}/media/${id}?apikey=${MEDIA_API_KEY}`;

    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 CavalleryApp/1.0",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Media Delete API Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
