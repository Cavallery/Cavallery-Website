import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.crstlnz.my.id/api/now_live", {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
      },
      next: { revalidate: 60 } // Cache for 1 min
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch live data: ${res.statusText}`);
    }
    
    const data = await res.json();
    const rawStreams = Array.isArray(data) ? data : [];

    // Filter streams to focus only on Erine JKT48 (Catherina Vallencia)
    const erineStreams = rawStreams.filter((stream: any) => {
      const name = (
        stream.name ||
        stream.url_key ||
        stream.member_name ||
        stream.room_name ||
        ""
      ).toLowerCase();
      return (
        name.includes("erine") ||
        name.includes("catherina") ||
        name.includes("catherine") ||
        name.includes("valencia") ||
        name.includes("vallencia")
      );
    });

    return NextResponse.json({ success: true, data: erineStreams });
  } catch (error) {
    console.error("Live API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
