import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface BotMediaItem {
  id: string;
  title: string;
  type: "video" | "image";
  triggers: string[];
  mediaUrl: string;
  previewUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const BOT_MEDIA_PATH = path.join(DATA_DIR, "bot_media.json");

const defaultMediaList: BotMediaItem[] = [
  {
    id: "media_hbd",
    title: "Video Ulang Tahun Erine (HBD)",
    type: "video",
    triggers: ["hbd", "!hbd", "/hbd", "#hbd", "selamat ulang tahun", "happy birthday", "ultah", "met ultah"],
    mediaUrl: "https://cavallery.id/uploads/cavallery/images/2026/10/1792059374525_1792059217614.mp4",
    previewUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/4dc2029f5e314054.jpg",
    isActive: true,
    createdAt: "2026-10-17T06:00:00.000Z"
  },
  {
    id: "media_waduh",
    title: "Video Reaksi Waduh",
    type: "video",
    triggers: ["waduh"],
    mediaUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/e081981a87a74168.mp4",
    previewUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/9153cfedf5554c61.jpg",
    isActive: true,
    createdAt: "2026-10-17T06:00:00.000Z"
  },
  {
    id: "media_niterine",
    title: "Video Selamat Tidur (NiteRine)",
    type: "video",
    triggers: ["niterine", "nite rine", "night erine", "selamat tidur"],
    mediaUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/dc59a25de53f490b.mp4",
    previewUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/3f23f73dd88f4364.jpg",
    isActive: true,
    createdAt: "2026-10-17T06:00:00.000Z"
  },
  {
    id: "media_ngasal",
    title: "Video Ngasal Erine",
    type: "video",
    triggers: ["ngasal"],
    mediaUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/978ce9ed7e85445f.mp4",
    previewUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/3a037f2ce2e14a38.jpg",
    isActive: true,
    createdAt: "2026-10-17T06:00:00.000Z"
  },
  {
    id: "media_diesvenerine",
    title: "Video Happy DiesVenErine",
    type: "video",
    triggers: ["happy diesvenerine", "diesvenerine", "dies ven erine"],
    mediaUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/a5dfa966ca6c4636.mp4",
    previewUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/4dc2029f5e314054.jpg",
    isActive: true,
    createdAt: "2026-10-17T06:00:00.000Z"
  },
  {
    id: "media_gas",
    title: "Foto Gas Jiko Oline",
    type: "image",
    triggers: ["gas", "jiko oline", "jikoline"],
    mediaUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/23372e78c36f45ca.jpg",
    previewUrl: "https://images.jkt48connect.com/cavallery/images/2026/09/23372e78c36f45ca.jpg",
    isActive: true,
    createdAt: "2026-10-17T06:00:00.000Z"
  }
];

let inMemoryBotMedia: BotMediaItem[] | null = null;

function ensureDataDirectory() {
  try {
    const dir = path.dirname(BOT_MEDIA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not ensure data directory for bot_media:", e);
  }
}

export function readBotMedia(): BotMediaItem[] {
  if (inMemoryBotMedia) {
    return inMemoryBotMedia;
  }

  ensureDataDirectory();
  try {
    if (fs.existsSync(BOT_MEDIA_PATH)) {
      const content = fs.readFileSync(BOT_MEDIA_PATH, "utf-8");
      inMemoryBotMedia = JSON.parse(content);
      if (Array.isArray(inMemoryBotMedia)) {
        return inMemoryBotMedia;
      }
    }
  } catch (e) {
    console.error("Error reading bot_media.json:", e);
  }

  // Fallback ke default
  try {
    fs.writeFileSync(BOT_MEDIA_PATH, JSON.stringify(defaultMediaList, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write initial bot_media.json:", e);
  }

  inMemoryBotMedia = defaultMediaList;
  return inMemoryBotMedia;
}

export function writeBotMedia(list: BotMediaItem[]) {
  inMemoryBotMedia = list;
  ensureDataDirectory();
  try {
    fs.writeFileSync(BOT_MEDIA_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not persist bot_media.json to disk:", e);
  }
}

export async function GET() {
  try {
    const list = readBotMedia();
    return NextResponse.json({ status: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message, data: defaultMediaList });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const list = readBotMedia();

    const title = (body.title || "").trim();
    const type = body.type === "video" ? "video" : "image";
    let triggers: string[] = [];

    if (Array.isArray(body.triggers)) {
      triggers = body.triggers.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean);
    } else if (typeof body.triggers === "string") {
      triggers = body.triggers.split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean);
    }

    const mediaUrl = (body.mediaUrl || body.url || "").trim();
    let previewUrl = (body.previewUrl || "").trim();

    if (!title) {
      return NextResponse.json({ status: false, message: "Judul media wajib diisi" }, { status: 400 });
    }
    if (triggers.length === 0) {
      return NextResponse.json({ status: false, message: "Minimal harus ada 1 kata kunci trigger" }, { status: 400 });
    }
    if (!mediaUrl) {
      return NextResponse.json({ status: false, message: "URL media atau unggahan file wajib ada" }, { status: 400 });
    }

    if (type === "image" && !previewUrl) {
      previewUrl = mediaUrl;
    }

    const newItem: BotMediaItem = {
      id: "media_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      title,
      type,
      triggers,
      mediaUrl,
      previewUrl: previewUrl || (type === "video" ? "https://images.jkt48connect.com/cavallery/images/2026/09/4dc2029f5e314054.jpg" : mediaUrl),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...list];
    writeBotMedia(updated);

    return NextResponse.json({ status: true, message: "Media bot LINE berhasil ditambahkan", data: newItem });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ status: false, message: "ID media diperlukan" }, { status: 400 });
    }

    const list = readBotMedia();
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) {
      return NextResponse.json({ status: false, message: "Media tidak ditemukan" }, { status: 404 });
    }

    let triggers = list[idx].triggers;
    if (body.triggers !== undefined) {
      if (Array.isArray(body.triggers)) {
        triggers = body.triggers.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean);
      } else if (typeof body.triggers === "string") {
        triggers = body.triggers.split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    const updatedItem: BotMediaItem = {
      ...list[idx],
      title: body.title !== undefined ? body.title.trim() : list[idx].title,
      type: body.type !== undefined ? (body.type === "video" ? "video" : "image") : list[idx].type,
      triggers,
      mediaUrl: body.mediaUrl !== undefined ? body.mediaUrl.trim() : list[idx].mediaUrl,
      previewUrl: body.previewUrl !== undefined ? body.previewUrl.trim() : list[idx].previewUrl,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : list[idx].isActive,
      updatedAt: new Date().toISOString()
    };

    if (updatedItem.type === "image" && !updatedItem.previewUrl) {
      updatedItem.previewUrl = updatedItem.mediaUrl;
    }

    const updatedList = [...list];
    updatedList[idx] = updatedItem;
    writeBotMedia(updatedList);

    return NextResponse.json({ status: true, message: "Media bot LINE berhasil diperbarui", data: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: false, message: "ID media diperlukan" }, { status: 400 });
    }

    const list = readBotMedia();
    const filtered = list.filter(item => item.id !== id);
    writeBotMedia(filtered);

    return NextResponse.json({ status: true, message: "Media bot LINE berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
