import { NextRequest, NextResponse } from "next/server";

const MEDIA_API_BASE = "https://v5.jkt48connect.com/api/cavallery";
const MEDIA_API_KEY = "JKTCONNECT";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUrl = `${MEDIA_API_BASE}/media/bulk?apikey=${MEDIA_API_KEY}`;

    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 CavalleryApp/1.0",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Media Bulk Delete API Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Bulk delete failed" },
      { status: 500 }
    );
  }
}
