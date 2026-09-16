import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { API_CACHE_HEADERS, fetchWithCacheAndFallback } from "@/lib/apiCache";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

const ERINE_KEYS = ["erine", "catherina", "vallencia"];
function isErine(name: string) {
  const n = (name ?? "").toLowerCase();
  return ERINE_KEYS.some((k) => n.includes(k));
}

function normalizeShow(s: any) {
  const members = s.members || s.member || s.lineup || [];
  const id = String(s.id || s.schedule_id || s.link || "");
  return {
    ...s,
    id: id || s.title + (s.date || ""),
    schedule_id: s.schedule_id || id,
    title: s.title || s.name || "JKT48 Show",
    date: s.date || s.showDate || "",
    showDate: s.date || s.showDate || "",
    startTime: (s.startTime || s.start_time || "19:00").slice(0, 5),
    start_time: s.startTime || s.start_time || "19:00:00",
    members: members.map((m: any) => ({ id: String(m.id || ""), name: m.name, url_key: m.url_key || "" })),
    member: members.map((m: any) => ({ id: String(m.id || ""), name: m.name, url_key: m.url_key || "" })),
    lineup: members.map((m: any) => ({ id: String(m.id || ""), name: m.name, url_key: m.url_key || "" })),
    poster: s.poster || s.banner || s.poster_url || "https://img.jkt48connect.com/jkt48/theater/uploads/cu0wq736nhcstg0epmiieumc.jpg",
    banner: s.banner || s.poster || "https://img.jkt48connect.com/jkt48/theater/uploads/y2g3dgukgk8ohxghfxv8lyju.jpg",
    url: s.url || (s.link ? `https://jkt48.com/theater/schedule/id/${s.schedule_id || s.link}?lang=id` : "https://jkt48.com/theater/schedule?lang=id"),
  };
}

export function getMasterShows(): any[] {
  try {
    const masterPath = path.join(process.cwd(), "src", "data", "theater_shows_master.json");
    if (fs.existsSync(masterPath)) {
      const content = fs.readFileSync(masterPath, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) return list.map(normalizeShow);
    }
  } catch (e) {
    console.warn("Could not read theater_shows_master.json:", e);
  }

  // Secondary fallback to theater_res.json
  try {
    const fallbackPath = path.join(process.cwd(), "theater_res.json");
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, "utf-8");
      const parsed = JSON.parse(content);
      const list = Array.isArray(parsed.data) ? parsed.data : (Array.isArray(parsed) ? parsed : []);
      return list.map(normalizeShow);
    }
  } catch {}

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
        signal: AbortSignal.timeout(5000),
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
    const erineOnly = searchParams.get("erine") === "true";

    const masterShows = getMasterShows();

    // 1. Jika requested spesifik month & year
    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      // Coba fetch live dari remote
      let remoteShows: any[] = [];
      try {
        remoteShows = await fetchMonthTheater(month.padStart(2, "0"), year);
      } catch {}

      // Filter dari master database
      const filteredMaster = masterShows.filter((s) => {
        const d = new Date(s.date || s.showDate || "");
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === yearNum && d.getMonth() + 1 === monthNum;
      });

      // Gabungkan dengan dedup
      const seen = new Set<string>();
      const combined: any[] = [];
      for (const s of [...remoteShows, ...filteredMaster]) {
        const key = `${(s.title || "").trim().toLowerCase()}-${(s.date || "").slice(0, 10)}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(s);
        }
      }

      let result = combined;
      if (erineOnly) {
        result = result.filter((s) => (s.members || []).some((m: any) => isErine(m.name)));
      }

      // Urutkan tanggal menaik
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return NextResponse.json({ success: true, data: result }, { headers: API_CACHE_HEADERS });
    }

    // 2. Jika requested hanya year (misal ?year=2026 atau ?year=2024)
    if (year) {
      const yearNum = parseInt(year, 10);
      let result = masterShows.filter((s) => {
        const d = new Date(s.date || s.showDate || "");
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === yearNum;
      });

      if (erineOnly) {
        result = result.filter((s) => (s.members || []).some((m: any) => isErine(m.name)));
      }

      // Urutkan tanggal menaik
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return NextResponse.json({ success: true, data: result }, { headers: API_CACHE_HEADERS });
    }

    // 3. Tanpa parameter: ambil live update 3 bulan aktif + gabung seluruh master database
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const monthsToFetch = [
      { m: currentMonth, y: currentYear },
      { m: currentMonth === 12 ? 1 : currentMonth + 1, y: currentMonth === 12 ? currentYear + 1 : currentYear },
    ];

    let liveResults: any[] = [];
    try {
      const fetched = await Promise.all(
        monthsToFetch.map(({ m, y }) => fetchMonthTheater(String(m).padStart(2, "0"), String(y)))
      );
      liveResults = fetched.flat();
    } catch {}

    const seenKeys = new Set<string>();
    const allMerged: any[] = [];

    // Prioritaskan data live jika ada, lalu fallback ke master
    for (const s of [...liveResults, ...masterShows]) {
      const key = `${(s.title || "").trim().toLowerCase()}-${(s.date || "").slice(0, 10)}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        allMerged.push(s);
      }
    }

    let result = allMerged;
    if (erineOnly) {
      result = result.filter((s) => (s.members || []).some((m: any) => isErine(m.name)));
    }

    // Urutkan tanggal menaik (kronologis)
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ success: true, data: result }, { headers: API_CACHE_HEADERS });
  } catch (error) {
    console.error("Theater API Error:", error);
    const masterShows = getMasterShows();
    return NextResponse.json({ success: true, data: masterShows }, { headers: API_CACHE_HEADERS });
  }
}
