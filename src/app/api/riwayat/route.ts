import { NextResponse } from "next/server";
import { API_CACHE_HEADERS, fetchWithCacheAndFallback } from "@/lib/apiCache";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

export async function GET() {
  try {
    const data = await fetchWithCacheAndFallback<any[]>({
      key: "erine_riwayat_live",
      ttlSeconds: 120,
      fetcher: async () => {
        const res = await fetch(
          `${BASE}/recent?page=all&name=Erine%20JKT48&priority_token=${API_KEY}`,
          {
            headers: {
              "x-priority-token": API_KEY,
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
            },
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(4000),
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch recent data: ${res.statusText}`);
        }

        const json = await res.json();
        return Array.isArray(json) ? json : json.data || [];
      },
      fallbackData: [],
    });

    return NextResponse.json({ success: true, data }, { headers: API_CACHE_HEADERS });
  } catch (error) {
    console.error("Recent API Error:", error);
    return NextResponse.json({ success: true, data: [] }, { headers: API_CACHE_HEADERS });
  }
}
