import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // The new API endpoint doesn't strictly require month/year params in the same way,
    // but we can pass them or just fetch all
    let apiUrl = "https://api.crstlnz.my.id/api/theater";
    
    const res = await fetch(apiUrl, {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
      },
      next: { revalidate: 300 } // Cache for 5 mins
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch theater data: ${res.statusText}`);
    }
    
    const data = await res.json();
    const theaterData = data.theater || [];
    
    return NextResponse.json({ success: true, data: theaterData });
  } catch (error) {
    console.error("Theater API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

