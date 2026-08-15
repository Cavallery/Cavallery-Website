import { NextResponse } from "next/server";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

export async function GET() {
  try {
    const res = await fetch(
      `${BASE}/recent?page=all&name=Erine%20JKT48&priority_token=${API_KEY}`,
      {
        headers: {
          "x-priority-token": API_KEY,
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
        },
        next: { revalidate: 300 }
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch recent data: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data: Array.isArray(data) ? data : data.data || [] });
  } catch (error) {
    console.error("Recent API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
