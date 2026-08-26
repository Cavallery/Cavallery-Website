import { NextResponse } from "next/server";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

const ERINE_KEYS = ["erine", "catherina", "catherine", "valencia", "vallencia"];

function isErine(name: string) {
  const n = (name ?? "").toLowerCase();
  return ERINE_KEYS.some((k) => n.includes(k));
}

export async function GET() {
  try {
    const res = await fetch(`${BASE}/live?priority_token=${API_KEY}`, {
      headers: {
        "x-priority-token": API_KEY,
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch live data: ${res.statusText}`);
    }

    const data = await res.json();
    const rawStreams: any[] = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

    // Sort so Erine is at the top if live
    const sorted = [...rawStreams].sort((a, b) => {
      const aName = a.member_name || a.name || a.username || "";
      const bName = b.member_name || b.name || b.username || "";
      const aIsErine = isErine(aName) ? 1 : 0;
      const bIsErine = isErine(bName) ? 1 : 0;
      return bIsErine - aIsErine;
    });

    return NextResponse.json({ success: true, data: sorted });
  } catch (error) {
    console.error("Live API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
