import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

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
      if (Array.isArray(parsed?.publishedIds)) {
        return parsed.publishedIds.map(String);
      }
    }
  } catch {}
  return [];
}

function readCustomOrder(): string[] {
  try {
    if (fs.existsSync(ORDER_FILE_PATH)) {
      const raw = fs.readFileSync(ORDER_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.orderedIds)) {
        return parsed.orderedIds.map(String);
      }
    }
  } catch {}
  return [];
}

function readLocalFallback(): any[] {
  try {
    if (fs.existsSync(LOCAL_JSON_PATH)) {
      const raw = fs.readFileSync(LOCAL_JSON_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "";
    const type = searchParams.get("type") || "";
    const publishedOnly = searchParams.get("published_only") === "true";
    const limit = Number(searchParams.get("limit") || 500);
    const offset = Number(searchParams.get("offset") || 0);

    let items: any[] = [];

    // 1. Fetch all complete photos and videos from Vallzy's server
    try {
      const vallzyUrl = `${VALLZY_BASE}?apikey=${API_KEY}&limit=500`;
      const res = await fetch(vallzyUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 CavalleryApp/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status && Array.isArray(json.data?.items)) {
          items = json.data.items;
        } else if (Array.isArray(json?.data)) {
          items = json.data;
        } else if (Array.isArray(json?.items)) {
          items = json.items;
        }
      }
    } catch (e: any) {
      console.warn("Vallzy media fetch warn:", e.message);
    }

    // 2. If Vallzy API failed or returned empty, fallback to local backup
    if (items.length === 0) {
      items = readLocalFallback();
    }

    const publishedIds = readPublishedIds();
    const publishedSet = new Set(publishedIds);
    const customOrder = readCustomOrder();
    const orderMap = new Map<string, number>();
    customOrder.forEach((id, idx) => orderMap.set(String(id), idx));

    // Normalize and attach publication status + custom order
    items = items.map((item: any, idx: number) => {
      const isVideo =
        item.type === "video" ||
        item.mime_type?.startsWith("video/") ||
        /\.(mp4|webm|ogg|mov)$/i.test(item.public_url || item.file_name || "");

      // If publishedIds is not empty, check membership; otherwise default to item.is_published != 0
      const isPub =
        publishedSet.size > 0
          ? publishedSet.has(String(item.id)) || publishedSet.has(String(item.public_url)) || publishedSet.has(String(item.file_name))
          : item.is_published !== 0 && item.is_published !== false;

      const customSort = orderMap.get(String(item.id)) ?? orderMap.get(String(item.public_url)) ?? (idx + 1000);

      return {
        ...item,
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
      { headers: noCacheHeaders }
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
      { status: 500, headers: noCacheHeaders }
    );
  }
}
