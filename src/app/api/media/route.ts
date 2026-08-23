import { NextRequest, NextResponse } from "next/server";

const MEDIA_API_BASE = "https://v5.jkt48connect.com/api/cavallery";
const MEDIA_API_KEY = "JKTCONNECT";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = `${MEDIA_API_BASE}/media?apikey=${MEDIA_API_KEY}&${searchParams.toString()}`;

    const res = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Media fetch failed: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Media API GET Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to load media", data: { items: [], total: 0 } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const isMultiple = formData.has("files");
      const targetPath = isMultiple ? "/media/upload-multiple" : "/media/upload";
      const targetUrl = `${MEDIA_API_BASE}${targetPath}?apikey=${MEDIA_API_KEY}`;

      const res = await fetch(targetUrl, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ status: false, message: "Invalid content type" }, { status: 400 });
  } catch (error: any) {
    console.error("Media API POST Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
