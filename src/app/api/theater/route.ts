import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { API_CACHE_HEADERS, fetchWithCacheAndFallback } from "@/lib/apiCache";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

function normalizeShow(s: any) {
  const members = s.members || s.member || s.lineup || [];
  return {
    ...s,
    id: s.id || s.schedule_id || s.link,
    title: s.title || s.name || "JKT48 Show",
    date: s.date || s.showDate || "",
    showDate: s.date || s.showDate || "",
    startTime: s.startTime || s.start_time || "19:00",
    start_time: s.startTime || s.start_time || "19:00",
    members: members,
    member: members,
    lineup: members,
    poster: s.poster || s.banner || s.poster_url || "",
    banner: s.banner || s.poster || "",
    url: s.url || (s.link ? `https://jkt48.com/theater/schedule/id/${s.schedule_id || s.link}?lang=id` : "#"),
  };
}

function getFallbackShows(): any[] {
  try {
    const fallbackPath = path.join(process.cwd(), "theater_res.json");
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, "utf-8");
      const parsed = JSON.parse(content);
      const list = Array.isArray(parsed.data) ? parsed.data : (Array.isArray(parsed) ? parsed : []);
      return list.map(normalizeShow);
    }
  } catch (e) {
    console.error("Fallback theater read error:", e);
  }
  return [];
}

async function fetchMonthTheater(monthStr: string, yearStr: string): Promise<any[]> {
  const cacheKey = `theater_${monthStr}_${yearStr}`;
  return fetchWithCacheAndFallback<any[]>({
    key: cacheKey,
    ttlSeconds: 600,
    fetcher: async () => {
      const apiUrl = `${BASE}/theater?month=${monthStr}&year=${yearStr}&priority_token=${API_KEY}`;
      const res = await fetch(apiUrl, {
        headers: {
          "x-priority-token": API_KEY,
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
        },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) return [];
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      return list.map(normalizeShow);
    },
    fallbackData: [],
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (month && year) {
      const singleMonthShows = await fetchMonthTheater(month.padStart(2, "0"), year);
      if (singleMonthShows.length > 0) {
        return NextResponse.json({ success: true, data: singleMonthShows }, { headers: API_CACHE_HEADERS });
      }
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    const monthsToFetch = [
      { m: currentMonth, y: currentYear },
      { m: currentMonth === 12 ? 1 : currentMonth + 1, y: currentMonth === 12 ? currentYear + 1 : currentYear },
      { m: currentMonth === 1 ? 12 : currentMonth - 1, y: currentMonth === 1 ? currentYear - 1 : currentYear },
    ];

    const results = await Promise.all(
      monthsToFetch.map(({ m, y }) => fetchMonthTheater(String(m).padStart(2, "0"), String(y)))
    );

    const merged = results.flat();
    const seenIds = new Set<string>();
    const uniqueShows = merged.filter((show: any) => {
      const key = String(show.schedule_id || show.link || show.title + (show.date || ""));
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    });

    if (uniqueShows.length > 0) {
      return NextResponse.json({ success: true, data: uniqueShows }, { headers: API_CACHE_HEADERS });
    }

    // Fallback to local theater cache if remote returns empty
    const fallbackShows = getFallbackShows();
    return NextResponse.json({ success: true, data: fallbackShows }, { headers: API_CACHE_HEADERS });
  } catch (error) {
    console.error("Theater API Error:", error);
    const fallbackShows = getFallbackShows();
    return NextResponse.json({ success: true, data: fallbackShows }, { headers: API_CACHE_HEADERS });
  }
}
