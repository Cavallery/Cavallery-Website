import { NextResponse } from "next/server";

const API_KEY = "sJbpVqLinYlp";
const BASE = "https://v5.jkt48connect.com/api/jkt48";

const ERINE_KEYS = ["erine", "catherina", "catherine", "vallencia", "valencia"];

function isErine(name: string) {
  const n = (name ?? "").toLowerCase();
  return ERINE_KEYS.some((k) => n.includes(k));
}

interface LiveStream {
  name?: string;
  member_name?: string;
  username?: string;
  room_name?: string;
  img?: string;
  img_alt?: string;
  image?: string;
  avatar?: string;
  url_key?: string;
  slug?: string;
  type?: string;
  platform?: string;
  started_at?: string;
  live_at?: string;
  streaming_url_list?: { label: string; quality: number; url: string }[];
  streaming_url?: string;
  showId?: string | null;
  room_id?: number;
}

export async function GET() {
  try {
    const res = await fetch(`${BASE}/live?priority_token=${API_KEY}`, {
      headers: {
        "x-priority-token": API_KEY,
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);

    const raw: LiveStream[] = await res.json();
    const streams = Array.isArray(raw) ? raw : [];

    // Find Erine specifically
    const erineLives = streams.filter((s) => isErine(s.name ?? s.member_name ?? s.username ?? ""));

    // Build normalized live list – Erine first, then others
    const buildStream = (s: LiveStream, highlight: boolean) => {
      const name = s.name ?? s.member_name ?? s.username ?? "Unknown";
      const img = s.img ?? s.img_alt ?? s.image ?? s.avatar ?? "";
      const type = (s.type ?? s.platform ?? "idn").toLowerCase();
      const key = s.url_key ?? "";
      const slug = s.slug ?? "";

      // Determine watch URL
      let url = "#";
      if (highlight || isErine(name)) {
        // For Erine: always use her profile page so clicking always opens her live
        url = type.includes("showroom")
          ? "https://www.showroom-live.com/r/JKT48_Erine"
          : "https://www.idn.app/jkt48_erine";
      } else if (type.includes("showroom")) {
        url = key ? `https://www.showroom-live.com/r/${key}` : "#";
      } else {
        // IDN – use url_key (jkt48_name) pattern
        url = key ? `https://www.idn.app/${key}` : (slug ? `https://www.idn.app/jkt48-official/live/${slug}` : "#");
      }

      return {
        id: s.slug ?? s.url_key ?? name,
        name,
        img,
        type,
        platform: type,
        url_key: key,
        slug,
        started_at: s.started_at ?? s.live_at ?? null,
        streaming_url: s.streaming_url_list?.[0]?.url ?? s.streaming_url ?? null,
        url,
        is_erine: highlight || isErine(name),
      };
    };

    const erineStreams = erineLives.map((s) => buildStream(s, true));
    const othersStreams = streams
      .filter((s) => !isErine(s.name ?? s.member_name ?? s.username ?? ""))
      .map((s) => buildStream(s, false));

    return NextResponse.json({
      success: true,
      erine_live: erineStreams.length > 0,
      data: [...erineStreams, ...othersStreams],
    });
  } catch (error) {
    console.error("Live API Error:", error);
    return NextResponse.json({ success: false, erine_live: false, data: [] }, { status: 500 });
  }
}
