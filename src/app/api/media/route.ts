import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { API_CACHE_HEADERS, fetchWithCacheAndFallback } from "@/lib/apiCache";

export const dynamic = "force-dynamic";

const VALLZY_BASE = "https://v5.jkt48connect.com/api/cavallery/media";
const API_KEY = "JKTCONNECT";

const PUB_FILE_PATH = path.join(process.cwd(), "src", "data", "published-media.json");
const ORDER_FILE_PATH = path.join(process.cwd(), "src", "data", "media-order.json");
const LOCAL_JSON_PATH = path.join(process.cwd(), "src", "data", "media.json");

function readPublishedIds(): string[] {
  try {
    if (fs.existsSync(PUB_FILE_PATH)) {
      const raw = fs.readFileSync(PUB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
      if (Array.isArray(parsed?.publishedIds)) return parsed.publishedIds.map(String);
    }
  } catch (e) {
    console.error("Failed to read published media IDs:", e);
  }
  return [];
}

function readCustomOrder(): string[] {
  try {
    if (fs.existsSync(ORDER_FILE_PATH)) {
      const raw = fs.readFileSync(ORDER_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch (e) {
    console.error("Failed to read custom media order:", e);
  }
  return [];
}

function readLocalFallback(): any[] {
  let items: any[] = [];
  try {
    if (fs.existsSync(LOCAL_JSON_PATH)) {
      const raw = fs.readFileSync(LOCAL_JSON_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
      else if (parsed.items && Array.isArray(parsed.items)) items = parsed.items;
    }
  } catch (e) {
    console.error("Failed to read local media fallback:", e);
  }

  // Auto-scan public/uploads agar semua file foto/video lokal terdeteksi dan tidak rusak
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (fs.existsSync(uploadsDir)) {
      const seenFiles = new Set(
        items.map((i) => i.file_name || path.basename(i.public_url || ""))
      );

      function scanDir(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(full);
          } else if (/\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i.test(entry.name)) {
            if (!seenFiles.has(entry.name)) {
              const rel = path
                .relative(path.join(process.cwd(), "public"), full)
                .replace(/\\/g, "/");
              const isVideo = /\.(mp4|webm|mov)$/i.test(entry.name);
              const stat = fs.statSync(full);
              items.push({
                id: String(Date.now() + Math.floor(Math.random() * 10000)),
                original_name: entry.name,
                file_name: entry.name,
                folder: path.dirname(rel).replace(/^uploads\/?/, "") || "cavallery/images",
                type: isVideo ? "video" : "image",
                mime_type: isVideo ? "video/mp4" : "image/jpeg",
                file_size: stat.size,
                public_url: "/" + rel,
                alt_text: entry.name,
                is_published: 1,
                sort_order: items.length + 1,
                created_at: stat.birthtime.toISOString(),
                updated_at: stat.mtime.toISOString(),
              });
              seenFiles.add(entry.name);
            }
          }
        }
      }

      scanDir(uploadsDir);
    }
  } catch (scanErr) {
    console.warn("Scan local uploads error:", scanErr);
  }

  // Normalisasi semua public_url agar menggunakan forward slash dan aman dari domain luar yang mati
  return items.map((it) => {
    let url = (it.public_url || "").replace(/\\/g, "/");
    if (url.includes("jkt48connect.com")) {
      const match = url.match(/\/uploads\/.+$/);
      if (match) url = match[0];
      else if (it.file_name) url = `/uploads/cavallery/images/2026/08/${it.file_name}`;
    }
    return {
      ...it,
      public_url: url,
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "";
    const type = searchParams.get("type") || "";
    const publishedOnly = searchParams.get("published_only") === "true";
    const limit = Number(searchParams.get("limit") || 500);
    const offset = Number(searchParams.get("offset") || 0);

    // 1. Fetch all complete photos and videos with in-memory cache & fallback
    let items: any[] = await fetchWithCacheAndFallback<any[]>({
      key: "vallzy_media_items",
      ttlSeconds: 90,
      fetcher: async () => {
        const vallzyUrl = `${VALLZY_BASE}?apikey=${API_KEY}&limit=500`;
        const res = await fetch(vallzyUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 CavalleryApp/1.0",
          },
          signal: AbortSignal.timeout(2000),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.status && Array.isArray(json.data?.items)) {
            return json.data.items;
          } else if (Array.isArray(json?.data)) {
            return json.data;
          } else if (Array.isArray(json?.items)) {
            return json.items;
          }
        }
        return readLocalFallback();
      },
      fallbackData: readLocalFallback(),
    });

    // 2. If empty, fallback to local backup
    if (!items || items.length === 0) {
      items = readLocalFallback();
    }

    const publishedIds = readPublishedIds();
    const publishedSet = new Set(publishedIds);
    const customOrder = readCustomOrder();
    const orderMap = new Map<string, number>();
    customOrder.forEach((id, idx) => orderMap.set(String(id), idx));

    // Normalize and attach publication status + custom order
    items = items.map((item: any, idx: number) => {
      let publicUrl = (item.public_url || "").replace(/\\/g, "/");
      if (publicUrl.includes("jkt48connect.com")) {
        const match = publicUrl.match(/\/uploads\/.+$/);
        if (match) publicUrl = match[0];
        else if (item.file_name) publicUrl = `/uploads/cavallery/images/2026/08/${item.file_name}`;
      }

      const isVideo =
        item.type === "video" ||
        item.mime_type?.startsWith("video/") ||
        /\.(mp4|webm|ogg|mov)$/i.test(publicUrl || item.file_name || "");

      // If publishedIds is not empty, check membership; otherwise default to item.is_published != 0
      const isPub =
        publishedSet.size > 0
          ? publishedSet.has(String(item.id)) || publishedSet.has(String(publicUrl)) || publishedSet.has(String(item.file_name))
          : item.is_published !== 0 && item.is_published !== false;

      const customSort = orderMap.get(String(item.id)) ?? orderMap.get(String(publicUrl)) ?? (idx + 1000);

      return {
        ...item,
        public_url: publicUrl,
        type: isVideo ? "video" : "image",
        is_published: isPub ? 1 : 0,
        sort_order: customSort,
      };
    });

    // Filtering
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.original_name?.toLowerCase().includes(q) ||
          i.alt_text?.toLowerCase().includes(q) ||
          i.file_name?.toLowerCase().includes(q)
      );
    }
    if (folder) {
      items = items.filter((i) => i.folder === folder);
    }
    if (type) {
      items = items.filter((i) => i.type === type);
    }
    if (publishedOnly) {
      items = items.filter((i) => Number(i.is_published) === 1);
    }

    // Sort according to custom order
    items.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);

    return NextResponse.json(
      {
        status: true,
        success: true,
        message: "Data media lengkap berhasil dimuat dari server Vallzy",
        data: {
          total,
          limit,
          offset,
          items: paginated,
        },
      },
      { headers: API_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("Media GET error:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: error.message || "Gagal memuat media",
        data: { items: [], total: 0 },
      },
      { status: 200, headers: API_CACHE_HEADERS }
    );
  }
}
