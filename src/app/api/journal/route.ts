import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const JOURNAL_FILE_PATH = path.join(DATA_DIR, "journal.json");

function ensureDataDirectory() {
  try {
    const dir = path.dirname(JOURNAL_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not ensure data directory for journal:", e);
  }
}

function readJournalLocal(): any[] {
  ensureDataDirectory();
  try {
    if (fs.existsSync(JOURNAL_FILE_PATH)) {
      const fileContent = fs.readFileSync(JOURNAL_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading journal.json:", e);
  }
  return [];
}

function writeJournalLocal(data: any[]) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(JOURNAL_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write journal.json:", e);
  }
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `journal_messages` WHERE `is_approved`=1 ORDER BY `id` DESC");
      if (rows && Array.isArray(rows) && rows.length > 0) {
        const formatted = rows.map((r) => ({
          id: r.id,
          name: r.name || "Anonim",
          handle: r.handle || "",
          msg: r.msg || r.pesan || r.message || r.content || "",
          spotify_url: r.spotify_url || null,
          spotify_title: r.spotify_title || null,
          spotify_artist: r.spotify_artist || null,
          spotify_thumbnail: r.spotify_thumbnail || null,
          date: r.created_at ? new Date(r.created_at).toISOString() : (r.date_label || r.date || ""),
          created_at: r.created_at || r.date || "",
          date_label: r.date_label || "",
        }));
        return NextResponse.json(formatted);
      }
    }
    return NextResponse.json(readJournalLocal());
  } catch (error: any) {
    return NextResponse.json(readJournalLocal());
  }
}

async function resolveSpotifyMetadata(url: string) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();
  if (!clean.includes("spotify.com")) return null;

  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(clean)}`, {
      headers: { "User-Agent": "Cavallery/1.0" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      let title = data.title || "";
      let artist = "JKT48";
      // Often format is "Title - song by Artist | Spotify" or similar
      if (title.includes(" - ")) {
        const parts = title.split(" - ");
        title = parts[0].trim();
        if (parts[1]) {
          artist = parts[1].replace(/by\s+/i, "").replace(/\|\s*Spotify/i, "").trim();
        }
      }
      return {
        title: title || data.title || "Lagu Pilihan untuk Erine",
        artist: artist || "Spotify",
        thumbnail: data.thumbnail_url || "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg",
      };
    }
  } catch (e) {
    console.warn("Spotify oEmbed error:", e);
  }

  // Fallback if oEmbed call fails
  return {
    title: "Lagu untuk Erine",
    artist: "Spotify",
    thumbnail: "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg",
  };
}

export async function POST(request: Request) {
  try {
    let name = "";
    let handle = "";
    let msg = "";
    let spotify_url = "";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("form-data")) {
      const formData = await request.formData();
      name = (formData.get("Nama") as string) || (formData.get("name") as string) || (formData.get("nama") as string) || "Anonim";
      handle = (formData.get("handle") as string) || (formData.get("username") as string) || "";
      msg = (formData.get("pesan") as string) || (formData.get("msg") as string) || (formData.get("message") as string) || (formData.get("content") as string) || "";
      spotify_url = (formData.get("spotify_url") as string) || (formData.get("spotify") as string) || "";
    } else {
      const json = await request.json();
      name = json.name || json.Nama || json.nama || "Anonim";
      handle = json.handle || json.username || "";
      msg = json.msg || json.pesan || json.message || json.content || "";
      spotify_url = json.spotify_url || json.spotify || "";
    }

    if (!msg.trim()) {
      return NextResponse.json({ status: false, message: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    let cleanHandle = handle.trim();
    if (cleanHandle && !cleanHandle.startsWith("@")) {
      cleanHandle = `@${cleanHandle}`;
    }

    let spotifyMeta: any = null;
    if (spotify_url && spotify_url.trim()) {
      spotifyMeta = await resolveSpotifyMetadata(spotify_url.trim());
    }

    const isoDate = new Date().toISOString();
    let insertedId = Date.now();

    if (isMySqlConfigured()) {
      try {
        const res = await query<any>(
          "INSERT INTO `journal_messages` (`name`, `handle`, `msg`, `spotify_url`, `spotify_title`, `spotify_artist`, `spotify_thumbnail`, `date_label`, `is_approved`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
          [
            name.trim(),
            cleanHandle || null,
            msg.trim(),
            spotify_url.trim() || null,
            spotifyMeta?.title || null,
            spotifyMeta?.artist || null,
            spotifyMeta?.thumbnail || null,
            isoDate,
          ]
        );
        if (res && res.insertId) insertedId = res.insertId;
      } catch (dbErr: any) {
        // Fallback without new columns if any error
        const res = await query<any>(
          "INSERT INTO `journal_messages` (`name`, `msg`, `date_label`, `is_approved`) VALUES (?, ?, ?, 1)",
          [name.trim(), msg.trim(), isoDate]
        );
        if (res && res.insertId) insertedId = res.insertId;
      }
    }

    const data = readJournalLocal();
    const newEntry = {
      id: insertedId,
      name: name.trim(),
      handle: cleanHandle || "",
      msg: msg.trim(),
      spotify_url: spotify_url.trim() || null,
      spotify_title: spotifyMeta?.title || null,
      spotify_artist: spotifyMeta?.artist || null,
      spotify_thumbnail: spotifyMeta?.thumbnail || null,
      date: isoDate,
    };

    data.unshift(newEntry);
    writeJournalLocal(data);

    return NextResponse.json({ status: true, data: newEntry });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, msg } = await request.json();
    if (!id) {
      return NextResponse.json({ status: false, message: "ID wajib disertakan" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query(
        "UPDATE `journal_messages` SET `name`=COALESCE(?, `name`), `msg`=COALESCE(?, `msg`) WHERE `id`=?",
        [name ? name.trim() : null, msg ? msg.trim() : null, id]
      );
    }

    const data = readJournalLocal();
    const index = data.findIndex((item: any) => item.id === Number(id));

    if (index !== -1) {
      if (name !== undefined) data[index].name = name.trim();
      if (msg !== undefined) data[index].msg = msg.trim();
      writeJournalLocal(data);
      return NextResponse.json({ status: true, data: data[index] });
    }

    return NextResponse.json({ status: true, message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: false, message: "ID wajib disertakan" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query("DELETE FROM `journal_messages` WHERE `id`=?", [id]);
    }

    const data = readJournalLocal();
    const filtered = data.filter((item: any) => item.id !== Number(id));
    writeJournalLocal(filtered);

    return NextResponse.json({ status: true, message: "Pesan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
