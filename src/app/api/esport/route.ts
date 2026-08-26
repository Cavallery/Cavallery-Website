import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const DIVISIONS_FILE = path.join(DATA_DIR, "esport-divisions.json");

const DEFAULT_DIVISIONS = [
  {
    id: "ml",
    name: "Mobile Legends",
    cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co7lqm.jpg",
    is_active: 1,
    sort_order: 1,
    roster_count: 0,
  },
  {
    id: "efootball",
    name: "eFootball",
    cover_url: "https://m.media-amazon.com/images/M/MV5BZjAzYjBiM2YtNTM4Zi00MmIzLWFhNDktZWNiNmY4N2YzYjFiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    is_active: 0,
    sort_order: 2,
    roster_count: 0,
  },
  {
    id: "coc",
    name: "Clash of Clans",
    cover_url: "https://m.media-amazon.com/images/M/MV5BZTEyNjE0OGEtYmIwNS00NjQ4LTgzNTEtYWVmMzBkMmYxMGI0XkEyXkFqcGc@._V1_.jpg",
    is_active: 0,
    sort_order: 3,
    roster_count: 0,
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    cover_url: "https://screenscore.digitalmama.id/wp-content/uploads/2024/05/IMG_0880.jpeg",
    is_active: 0,
    sort_order: 4,
    roster_count: 0,
  },
  {
    id: "ff",
    name: "Free Fire",
    cover_url: "https://cdn.wildflamestudio.com/common/web_event/official2.ff.garena.all/20266/f3ff01eefc0b3d7186b553edcd16debf.jpg",
    is_active: 0,
    sort_order: 5,
    roster_count: 0,
  },
  {
    id: "valorant",
    name: "Valorant",
    cover_url: "https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/valo2.png",
    is_active: 0,
    sort_order: 6,
    roster_count: 0,
  },
];

function ensureDataDirectory() {
  const dir = path.dirname(DIVISIONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readDivisionsLocal(): any[] {
  ensureDataDirectory();
  if (fs.existsSync(DIVISIONS_FILE)) {
    try {
      const content = fs.readFileSync(DIVISIONS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Error reading esport-divisions.json:", e);
    }
  }
  fs.writeFileSync(DIVISIONS_FILE, JSON.stringify(DEFAULT_DIVISIONS, null, 2), "utf-8");
  return DEFAULT_DIVISIONS;
}

function writeDivisionsLocal(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(DIVISIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/esport — list semua 6 divisi + roster count
export async function GET() {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>(`
        SELECT 
          d.*,
          (SELECT COUNT(*) FROM esport_rosters r WHERE r.division_id = d.id) AS roster_count
        FROM esport_divisions d
        ORDER BY d.sort_order ASC
      `);
      if (Array.isArray(rows) && rows.length > 0) {
        // Sync local cache
        try { writeDivisionsLocal(rows); } catch {}
        return NextResponse.json({ success: true, data: rows }, { headers });
      }
    }
  } catch (e: any) {
    console.warn("Esport GET error, fallback to local:", e.message);
  }

  const localData = readDivisionsLocal();
  return NextResponse.json({ success: true, data: localData }, { headers });
}

// PATCH /api/esport — toggle is_active
export async function PATCH(req: NextRequest) {
  try {
    const { id, is_active } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: "id wajib diisi" }, { status: 400 });
    
    if (isMySqlConfigured()) {
      try {
        await query("UPDATE `esport_divisions` SET `is_active` = ? WHERE `id` = ?", [is_active ? 1 : 0, id]);
      } catch (err: any) {
        console.warn("MySQL update division error:", err.message);
      }
    }

    // Always update local JSON
    const divisions = readDivisionsLocal();
    const updated = divisions.map((d) =>
      d.id === id ? { ...d, is_active: is_active ? 1 : 0 } : d
    );
    writeDivisionsLocal(updated);

    return NextResponse.json({ success: true, data: updated }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

// PUT /api/esport — update cover_url atau name
export async function PUT(req: NextRequest) {
  try {
    const { id, cover_url, name } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: "id wajib diisi" }, { status: 400 });
    
    if (isMySqlConfigured()) {
      try {
        await query(
          "UPDATE `esport_divisions` SET `cover_url` = COALESCE(?, `cover_url`), `name` = COALESCE(?, `name`) WHERE `id` = ?",
          [cover_url || null, name || null, id]
        );
      } catch (err: any) {
        console.warn("MySQL update division error:", err.message);
      }
    }

    // Always update local JSON
    const divisions = readDivisionsLocal();
    const updated = divisions.map((d) =>
      d.id === id
        ? {
            ...d,
            cover_url: cover_url !== undefined ? cover_url : d.cover_url,
            name: name !== undefined ? name : d.name,
          }
        : d
    );
    writeDivisionsLocal(updated);

    return NextResponse.json({ success: true, data: updated }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}


