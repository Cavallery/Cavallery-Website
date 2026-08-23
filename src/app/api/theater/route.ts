import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

function getFallbackShows(): any[] {
  try {
    const fallbackPath = path.join(process.cwd(), "theater_res.json");
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, "utf-8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.data) ? parsed.data : (Array.isArray(parsed) ? parsed : []);
    }
  } catch (e) {
    console.error("Fallback theater read error:", e);
  }
  return [];
}

async function fetchMonthTheater(monthStr: string, yearStr: string) {
  try {
    const apiUrl = `${BASE}/theater?month=${monthStr}&year=${yearStr}&priority_token=${API_KEY}`;
    const res = await fetch(apiUrl, {
      headers: {
        "x-priority-token": API_KEY,
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (month && year) {
      const singleMonthShows = await fetchMonthTheater(month.padStart(2, "0"), year);
      if (singleMonthShows.length > 0) {
        return NextResponse.json({ success: true, data: singleMonthShows });
      }
    }

    // Default: fetch current month, next month, and previous month
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
      const key = show.schedule_id || show.link || show.title + (show.date || "");
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    });

    if (uniqueShows.length > 0) {
      return NextResponse.json({ success: true, data: uniqueShows });
    }

    // Fallback to local theater cache if remote returns empty
    const fallbackShows = getFallbackShows();
    return NextResponse.json({ success: true, data: fallbackShows });
  } catch (error) {
    console.error("Theater API Error:", error);
    const fallbackShows = getFallbackShows();
    return NextResponse.json({ success: true, data: fallbackShows });
  }
}
