import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { query } from "@/lib/mysql";

const DATA_FILE = path.join(process.cwd(), "src", "data", "discord-announcements.json");

async function ensureTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS discord_announcements (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        mention VARCHAR(50) DEFAULT '@everyone',
        channel VARCHAR(100) DEFAULT 'pengumuman-fanbase',
        author_name VARCHAR(100) DEFAULT 'Cavallery Official',
        author_role VARCHAR(100) DEFAULT 'Admin Fanbase',
        author_avatar VARCHAR(500) DEFAULT '/images/cava-logo-round.png',
        image_url TEXT NULL,
        url VARCHAR(500) NULL,
        tags TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch {}
}

async function getAnnouncementsFromFile(): Promise<any[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveAnnouncementsToFile(data: any[]): Promise<boolean> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("[Discord API] Gagal menulis ke file JSON:", e);
    return false;
  }
}

// ─── GET: Ambil Semua Pengumuman Discord ───
export async function GET() {
  try {
    await ensureTable();

    // 1. Coba ambil dari MySQL terlebih dahulu
    const dbRows = await query<any[]>(
      "SELECT * FROM discord_announcements ORDER BY created_at DESC"
    ).catch(() => null);

    // 2. Ambil dari file JSON sebagai basis data awal
    const fileData = await getAnnouncementsFromFile();

    if (dbRows && dbRows.length > 0) {
      // Map MySQL rows to Announcement format
      const dbAnnouncements = dbRows.map((r) => {
        const d = new Date(r.created_at);
        const dateStr = !isNaN(d.getTime())
          ? d.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }) +
            ", " +
            d.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }).replace(".", ".")
          : "-";

        let parsedTags: string[] = [];
        try {
          parsedTags = r.tags ? JSON.parse(r.tags) : [];
        } catch {
          parsedTags = r.tags ? r.tags.split(",") : [];
        }

        return {
          id: r.id,
          title: r.title,
          date: dateStr,
          timestamp: r.created_at,
          mention: r.mention || "@everyone",
          channel: r.channel || "pengumuman-fanbase",
          author: {
            name: r.author_name || "Cavallery Official",
            role: r.author_role || "Admin Fanbase",
            avatar: r.author_avatar || "/images/cava-logo-round.png",
            bot: false,
          },
          image: r.image_url || undefined,
          additionalImages: [],
          content: r.content,
          tags: parsedTags.length > 0 ? parsedTags : ["Pengumuman", "Discord"],
        };
      });

      // Gabungkan data DB dengan fileData (jika ada file data yang belum masuk DB)
      const existingIds = new Set(dbAnnouncements.map((a: any) => a.id));
      const merged = [
        ...dbAnnouncements,
        ...fileData.filter((f: any) => !existingIds.has(f.id)),
      ];

      return NextResponse.json({ success: true, data: merged });
    }

    return NextResponse.json({ success: true, data: fileData });
  } catch (err: any) {
    console.error("[Discord API GET Error]:", err);
    const fallback = await getAnnouncementsFromFile();
    return NextResponse.json({ success: true, data: fallback });
  }
}

// ─── POST: Buat Pengumuman Baru & Kirim ke Bot Discord ───
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Bersihkan & Validasi Title
    const title = String(body.title || "").trim().slice(0, 256);
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Judul pengumuman wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Bersihkan & Validasi Deskripsi
    let rawDesc = String(body.description || body.content || "").trim();
    if (!rawDesc) {
      return NextResponse.json(
        { success: false, message: "Deskripsi pengumuman wajib diisi." },
        { status: 400 }
      );
    }

    if (rawDesc.length > 1800) {
      rawDesc = rawDesc.slice(0, 1797) + "...";
    }

    // 3. Validasi URL
    const rawUrl = String(body.url || body.link || "").trim();
    let validUrl = "https://cavallery.id";
    if (rawUrl) {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        validUrl = rawUrl;
      } else {
        validUrl = `https://${rawUrl}`;
      }
    }

    // 4. Validasi Gambar
    const rawImage = String(
      body.image || body.image_url || body.imageUrl || ""
    ).trim();
    let validImage: string | null = null;
    if (rawImage) {
      if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
        validImage = rawImage;
      } else if (rawImage.startsWith("/")) {
        validImage = `https://cavallery.id${rawImage}`;
      }
    }

    // 5. Validasi Mention
    const rawMention = String(body.mention || "@everyone").trim();
    const mentionTag =
      rawMention === "Tanpa Mention" || rawMention === "—"
        ? "@everyone"
        : rawMention;

    // 6. Buat Record Pengumuman Baru
    const now = new Date();
    const dateStr =
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      now
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(".", ".");

    const newId = `disc-${Date.now()}`;
    const authorName = String(body.author_name || body.authorName || "Cavallery Official").trim();
    const authorRole = String(body.author_role || body.authorRole || "Admin Fanbase").trim();

    const newAnnouncement = {
      id: newId,
      title,
      date: dateStr,
      timestamp: now.toISOString(),
      mention: mentionTag,
      channel: "pengumuman-fanbase",
      author: {
        name: authorName,
        role: authorRole,
        avatar: "/images/cava-logo-round.png",
        bot: false,
      },
      image: validImage || undefined,
      additionalImages: [],
      content: rawDesc,
      tags: ["Pengumuman", "Discord", "Official"],
    };

    // 7. Simpan ke File JSON (agar langsung tersedia di internal web)
    const fileAnnouncements = await getAnnouncementsFromFile();
    const updatedAnnouncements = [newAnnouncement, ...fileAnnouncements];
    await saveAnnouncementsToFile(updatedAnnouncements);

    // 8. Simpan ke MySQL jika database aktif
    try {
      await ensureTable();
      await query(
        `INSERT INTO discord_announcements 
          (id, title, content, mention, channel, author_name, author_role, author_avatar, image_url, url, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          title,
          rawDesc,
          mentionTag,
          "pengumuman-fanbase",
          authorName,
          authorRole,
          "/images/cava-logo-round.png",
          validImage || null,
          validUrl,
          JSON.stringify(["Pengumuman", "Discord", "Official"]),
        ]
      );
    } catch (e: any) {
      console.warn("[Discord API] Gagal insert MySQL (menggunakan JSON):", e?.message);
    }

    // 9. Forward ke Discord Bot Webhook / Server eksternal
    const payload: Record<string, any> = {
      title,
      description: rawDesc,
      url: validUrl,
      link: validUrl,
      mention: mentionTag,
      content: mentionTag,
    };

    if (validImage) {
      payload.image = validImage;
      payload.image_url = validImage;
      payload.imageUrl = validImage;
    }

    let botSuccess = false;
    let botMessage = "";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch("http://apps1.vynzzhost.com:25613/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 21082007",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await res.text();
      let responseData: any = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (res.ok && responseData.success !== false) {
        botSuccess = true;
      } else {
        botMessage = responseData.message || responseData.error || "";
      }
    } catch (botErr: any) {
      botMessage = botErr?.message || "Timeout bot server";
    }

    return NextResponse.json({
      success: true,
      message: botSuccess
        ? "Berhasil dikirim ke Discord & tersimpan di web!"
        : `Pengumuman tersimpan di web internal (Bot Discord: ${botMessage || "tersimpan"})`,
      data: newAnnouncement,
      botSuccess,
    });
  } catch (err: any) {
    console.error("[Discord API Route Error]:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses pengumuman.",
        error: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ─── DELETE: Hapus Pengumuman ───
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID wajib diisi" }, { status: 400 });
    }

    // Hapus dari file JSON
    const fileAnnouncements = await getAnnouncementsFromFile();
    const filtered = fileAnnouncements.filter((a) => a.id !== id);
    await saveAnnouncementsToFile(filtered);

    // Hapus dari MySQL jika ada
    try {
      await query("DELETE FROM discord_announcements WHERE id = ?", [id]);
    } catch {}

    return NextResponse.json({ success: true, message: "Pengumuman berhasil dihapus." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Gagal menghapus pengumuman" }, { status: 500 });
  }
}
