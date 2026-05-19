import { NextResponse } from "next/server";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v2.jkt48connect.com/api/jkt48";

export async function GET() {
  try {
    const res = await fetch(`${BASE}/live?priority_token=${API_KEY}`, {
      headers: { 
        "x-priority-token": API_KEY,
        "Accept": "application/json"
      },
      next: { revalidate: 60 } // Cache for 1 min
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch live data: ${res.statusText}`);
    }
    
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.data || data });
  } catch (error) {
    console.error("Live API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
