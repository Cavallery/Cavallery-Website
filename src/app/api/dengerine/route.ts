import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const DENGERINE_PATH = path.join(DATA_DIR, "dengerine.json");

const DEFAULT_SONGS = [
  {
    id: "dengerine-001",
    title: "Cavallery Love for Erine",
    creator: "Komunitas Cavallery",
    creatorHandle: "@cavallery_id",
    creatorUrl: "https://twitter.com/cavallery_id",
    type: "Cover",
    description:
      "Lagu spesial karya komunitas Cavallery yang dipersembahkan sepenuh hati untuk Catherina Vallencia (Erine). Dengerin sekarang di Spotify!",
    spotifyTrackId: "2hDAoL55QcEk1DuGkvuWDU",
    duration: "3:30",
    year: 2026,
    tags: ["Ballad", "Tribute", "Cavallery"],
  },
];

function ensureDataDirectory() {
  const dir = path.dirname(DENGERINE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readSongsLocal(): any[] {
  ensureDataDirectory();
  if (fs.existsSync(DENGERINE_PATH)) {
    try {
      const content = fs.readFileSync(DENGERINE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Error reading dengerine.json:", e);
    }
  }

  try {
    fs.writeFileSync(DENGERINE_PATH, JSON.stringify(DEFAULT_SONGS, null, 2), "utf-8");
  } catch {}
  return DEFAULT_SONGS;
}

function writeSongsLocal(songs: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(DENGERINE_PATH, JSON.stringify(songs, null, 2), "utf-8");
}

function parseSpotifyId(raw?: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.includes("spotify.com/")) {
    const match = trimmed.match(/track\/([a-zA-Z0-9]+)/);
    if (match && match[1]) return match[1];
  }
  return trimmed;
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>(
        "SELECT * FROM `dengerine` WHERE `is_active`=1 ORDER BY `sort_order` ASC, `created_at` DESC"
      );
      if (rows && rows.length > 0) {
        const formatted = rows.map((r) => ({
          id: String(r.id),
          title: r.title || "",
          creator: r.creator || "",
          creatorHandle: r.creator_handle || "",
          creatorUrl: r.creator_url || "",
          type: r.type || "Cover",
          coverArt: r.cover_art || "",
          description: r.description || "",
          spotifyTrackId: r.spotify_track_id || "",
          youtubeId: r.youtube_id || "",
          audioUrl: r.audio_url || "",
          duration: r.duration || "",
          year: Number(r.year) || 2026,
          tags: r.tags ? (typeof r.tags === "string" ? r.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : r.tags) : [],
        }));
        return NextResponse.json({ success: true, status: true, data: formatted });
      }
    }

    const songs = readSongsLocal();
    return NextResponse.json({ success: true, status: true, data: songs });
  } catch (error: any) {
    return NextResponse.json({ success: true, status: true, data: readSongsLocal() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.creator) {
      return NextResponse.json({ success: false, message: "Judul dan nama kreator wajib diisi" }, { status: 400 });
    }

    const spotifyTrackId = parseSpotifyId(body.spotifyTrackId);
    const tagsArr = Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : []);
    const tagsStr = tagsArr.join(", ");
    const id = body.id || `dengerine-${Date.now()}`;
    const year = Number(body.year) || new Date().getFullYear();

    if (isMySqlConfigured()) {
      await query(
        `INSERT INTO ` + "`dengerine`" + `
        (id, title, creator, creator_handle, creator_url, type, cover_art, description, spotify_track_id, youtube_id, audio_url, duration, year, tags, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.title.trim(),
          body.creator.trim(),
          body.creatorHandle?.trim() || "",
          body.creatorUrl?.trim() || "",
          body.type || "Cover",
          body.coverArt || "",
          body.description || "",
          spotifyTrackId,
          body.youtubeId || "",
          body.audioUrl || "",
          body.duration || "",
          year,
          tagsStr,
          Number(body.sort_order) || 0,
          body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        ]
      );
    }

    // Always also sync to local JSON
    const songs = readSongsLocal();
    const newSong = {
      id,
      title: body.title.trim(),
      creator: body.creator.trim(),
      creatorHandle: body.creatorHandle?.trim() || "",
      creatorUrl: body.creatorUrl?.trim() || "",
      type: body.type || "Cover",
      coverArt: body.coverArt || "",
      description: body.description || "",
      spotifyTrackId,
      youtubeId: body.youtubeId || "",
      audioUrl: body.audioUrl || "",
      duration: body.duration || "",
      year,
      tags: tagsArr,
    };
    songs.unshift(newSong);
    writeSongsLocal(songs);

    return NextResponse.json({ success: true, message: "Lagu berhasil ditambahkan", data: newSong });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: "ID lagu diperlukan" }, { status: 400 });
    }

    const spotifyTrackId = parseSpotifyId(body.spotifyTrackId);
    const tagsArr = Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : []);
    const tagsStr = tagsArr.join(", ");
    const year = Number(body.year) || new Date().getFullYear();

    if (isMySqlConfigured()) {
      await query(
        `UPDATE ` + "`dengerine`" + ` SET
        title=?, creator=?, creator_handle=?, creator_url=?, type=?, cover_art=?, description=?,
        spotify_track_id=?, youtube_id=?, audio_url=?, duration=?, year=?, tags=?
        WHERE id=?`,
        [
          body.title?.trim() || "",
          body.creator?.trim() || "",
          body.creatorHandle?.trim() || "",
          body.creatorUrl?.trim() || "",
          body.type || "Cover",
          body.coverArt || "",
          body.description || "",
          spotifyTrackId,
          body.youtubeId || "",
          body.audioUrl || "",
          body.duration || "",
          year,
          tagsStr,
          body.id,
        ]
      );
    }

    const songs = readSongsLocal();
    const idx = songs.findIndex((s: any) => s.id === body.id);
    if (idx !== -1) {
      songs[idx] = {
        ...songs[idx],
        ...body,
        spotifyTrackId,
        year,
        tags: tagsArr,
      };
      writeSongsLocal(songs);
    }

    return NextResponse.json({ success: true, message: "Lagu berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID lagu diperlukan" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query("DELETE FROM `dengerine` WHERE `id`=?", [id]);
    }

    const songs = readSongsLocal();
    const filtered = songs.filter((s: any) => s.id !== id);
    writeSongsLocal(filtered);

    return NextResponse.json({ success: true, message: "Lagu berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
