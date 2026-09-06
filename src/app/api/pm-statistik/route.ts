import { NextResponse } from "next/server";
import { API_CACHE_HEADERS, fetchWithCacheAndFallback } from "@/lib/apiCache";

const API_KEY = "JKTCONNECT";
const BASE = "https://v5.jkt48connect.com/api/shop";

const FALLBACK_ERINE_PM = {
  identifier: "erine",
  member_name: "Catherina Vallencia",
  current_rank: 8,
  rank_change: 2,
  total_messages: 340,
  messages_this_week: 42,
  average_per_day: 6,
  last_active: "Aktif Hari Ini",
  avatar_url: "/images/cava-logo.jpg",
  idol_id: "JKT48-97",
};

export async function GET() {
  try {
    const erine = await fetchWithCacheAndFallback<any>({
      key: "erine_pm_statistik",
      ttlSeconds: 300,
      fetcher: async () => {
        const res = await fetch(
          `${BASE}/pm-shop/members?apikey=${API_KEY}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
            },
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(4000),
          }
        );

        if (res.ok) {
          const json = await res.json();
          const members: any[] = Array.isArray(json) ? json : (json.data ?? []);
          const found = members.find(
            (m) =>
              m.identifier?.toLowerCase() === "erine" ||
              m.member_name?.toLowerCase().includes("erine") ||
              m.idol_id === "JKT48-97"
          );
          if (found) return found;
        }
        return FALLBACK_ERINE_PM;
      },
      fallbackData: FALLBACK_ERINE_PM,
    });

    return NextResponse.json({ success: true, data: erine }, { headers: API_CACHE_HEADERS });
  } catch (error) {
    console.error("PM Shop API Error (using fallback):", error);
    return NextResponse.json({ success: true, data: FALLBACK_ERINE_PM }, { headers: API_CACHE_HEADERS });
  }
}
