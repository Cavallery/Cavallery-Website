import { NextResponse } from "next/server";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let apiUrl = `${BASE}/theater?priority_token=${API_KEY}`;
    if (month && year) {
      apiUrl += `&month=${month}&year=${year}`;
    }

    const res = await fetch(apiUrl, {
      headers: { 
        "x-priority-token": API_KEY,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
      },
      next: { revalidate: 300 } // Cache for 5 mins
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch theater data: ${res.statusText}`);
    }
    
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Theater API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
