import { NextResponse } from "next/server";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

export async function GET() {
  try {
    const res = await fetch(`${BASE}/live?priority_token=${API_KEY}`, {
      headers: { 
        "x-priority-token": API_KEY,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
      },
      next: { revalidate: 60 } // Cache for 1 min
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch live data: ${res.statusText}`);
    }
    
    const data = await res.json();
    const rawStreams = data.data || data || [];

    // Filter streams to focus only on Erine JKT48 (Catherina Vallencia)
    const erineStreams = Array.isArray(rawStreams)
      ? rawStreams.filter((stream: any) => {
          const name = (
            stream.member_name ||
            stream.name ||
            stream.username ||
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
        })
      : [];

    return NextResponse.json({ success: true, data: erineStreams });
  } catch (error) {
    console.error("Live API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
