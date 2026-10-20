import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readBotConfig } from "../bot-config/route";
import { readBotMedia } from "../bot-media/route";
import { getAIOrSimiSimiReply } from "@/lib/botConversation";
import { upsertContact, saveIncomingMessage, getLineProfile } from "@/lib/lineChat";

declare global {
  // eslint-disable-next-line no-var
  var _lastLineEvents: any[] | undefined;
  // eslint-disable-next-line no-var
  var _lastLineReply: any;
}

// GET: Health-check endpoint untuk memastikan webhook aktif dan env terbaca
export async function GET() {
  const token = (process.env.LINE_CHANNEL_ACCESS_TOKEN || "").trim().replace(/^["']|["']$/g, "");
  const secret = (process.env.LINE_CHANNEL_SECRET || "").trim().replace(/^["']|["']$/g, "");

  return NextResponse.json({
    status: true,
    message: "Cavallery LINE Bot Webhook is running and ready!",
    has_token: Boolean(token),
    token_length: token.length,
    token_preview: token ? token.slice(0, 10) + "..." + token.slice(-5) : "KOSONG / BELUM ADA",
    has_secret: Boolean(secret),
    secret_preview: secret ? secret.slice(0, 6) + "..." : "KOSONG / BELUM ADA",
    last_events: global._lastLineEvents || [],
    last_reply: global._lastLineReply || null,
    timestamp: new Date().toISOString(),
  });
}

// POST: Menerima webhook events dari LINE Messaging API
export async function POST(req: NextRequest) {
  try {
    const rawSecret =
      process.env.LINE_CHANNEL_SECRET || "cb2b591629323fc7c6eb65a7868ff9af";
    const channelSecret = rawSecret.trim().replace(/^["']|["']$/g, "");
    const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
    const channelAccessToken = rawToken.trim().replace(/^["']|["']$/g, "");

    const rawBody = await req.text();
    const signature = req.headers.get("x-line-signature") || "";

    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = {};
    }

    const events = body.events || [];

    if (!global._lastLineEvents) {
      global._lastLineEvents = [];
    }
    global._lastLineEvents.unshift({
      time: new Date().toISOString(),
      events_count: events.length,
      events: events.map((e: any) => ({
        type: e.type,
        source: e.source?.type,
        text: e.message?.text,
        replyToken: e.replyToken ? e.replyToken.slice(0, 10) + "..." : null,
      })),
    });
    if (global._lastLineEvents.length > 5) global._lastLineEvents.pop();

    // Jika ini adalah tombol "Verify" dari LINE Developers Console (events kosong)
    // LINE mewajibkan respon HTTP 200 OK
    if (!events || events.length === 0) {
      return new NextResponse("OK", { status: 200 });
    }

    // Verifikasi tanda tangan LINE menggunakan HMAC-SHA256 jika ada signature
    if (channelSecret && signature) {
      const hash = crypto
        .createHmac("sha256", channelSecret)
        .update(rawBody)
        .digest("base64");

      if (hash !== signature) {
        console.warn("[LINE Webhook] Tanda tangan (signature) berbeda, tapi tetap diproses.");
      }
    }

    // Proses semua events yang masuk secara paralel
    await Promise.all(
      events.map((event: any) => handleLineEvent(event, channelAccessToken))
    );

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("[LINE Webhook Error]:", error);
    return new NextResponse("OK", { status: 200 });
  }
}

async function handleLineEvent(event: any, channelAccessToken: string) {
  if (!event) return;

  const sourceType = event.source?.type || "user";
  const lineUserId = event.source?.userId || "";
  const lineGroupId = event.source?.groupId || event.source?.roomId || null;

  // Catat kontak & pesan masuk ke MySQL untuk Chat Admin
  if (event.type === "message" && lineUserId) {
    (async () => {
      try {
        let displayName: string | null = null;
        let pictureUrl: string | null = null;

        const profile = await getLineProfile(lineUserId, lineGroupId);
        if (profile) {
          displayName = profile.displayName;
          pictureUrl = profile.pictureUrl || null;
        }

        const contactId = await upsertContact(
          lineUserId,
          lineGroupId,
          displayName,
          pictureUrl,
          sourceType as any
        );

        const msgText = event.message?.text || `[${event.message?.type || "media"}]`;
        await saveIncomingMessage(
          contactId,
          lineUserId,
          lineGroupId,
          displayName,
          msgText,
          event.message?.type || "text",
          event.message?.id || null
        );
      } catch (err) {
        console.error("[LINE Chat Log Error]:", err);
      }
    })();
  }

  if (event.type !== "message" || event.message?.type !== "text") {
    return;
  }

  // Token simulasi dari tombol "Verify" di LINE Console
  if (
    !event.replyToken ||
    event.replyToken === "00000000000000000000000000000000" ||
    event.replyToken === "ffffffffffffffffffffffffffffffff"
  ) {
    return;
  }

  const rawText = event.message.text || "";
  const text = rawText.trim().toLowerCase();
  let messagePayload: any = null;

  // Cek apakah pesan berasal dari grup atau multi-user room
  const isGroupOrRoom = sourceType === "group" || sourceType === "room";

  // Deteksi perintah resmi kas
  const isKasCommand =
    text === "kas" ||
    text === "!kas" ||
    text === "/kas" ||
    text === "#kas" ||
    text === "cek kas";

  const isBayarKasCommand =
    text === "bayar kas" ||
    text === "!bayarkas" ||
    text === "/bayarkas" ||
    text === "!bayar kas" ||
    text === "/bayar kas" ||
    text === "bayar iuran" ||
    text === "iuran kas";

  // Deteksi perintah pengumuman discord
  const isPengumumanCommand =
    text === "pengumuman" ||
    text === "!pengumuman" ||
    text === "/pengumuman" ||
    text === "#pengumuman" ||
    text === "discord" ||
    text === "!discord" ||
    text === "/discord" ||
    text === "#discord" ||
    text === "cek pengumuman" ||
    text === "pengumuman discord" ||
    text === "info discord" ||
    text === "discord pengumuman";

  // Deteksi perintah media (video & foto) dinamis dari bot_media / dashboard admin
  const botMediaList = readBotMedia().filter((m) => m.isActive !== false);
  const matchedMedia = botMediaList.find((item) => {
    return item.triggers.some((tr) => {
      const cleanTr = tr.toLowerCase().trim();
      if (!cleanTr) return false;
      return text.includes(cleanTr) || text === cleanTr;
    });
  });
  const isMediaCommand = Boolean(matchedMedia);

  const isHelpCommand =
    text === "help" ||
    text === "!help" ||
    text === "/help" ||
    text === "bantuan" ||
    text === "menu" ||
    text === "perintah";

  const isSpecialCommand =
    isKasCommand ||
    isBayarKasCommand ||
    isPengumumanCommand ||
    isMediaCommand ||
    isHelpCommand;

  // JIKA DI GRUP ATAU MULTI-USER ROOM:
  // Hanya balas jika ada kata kunci khusus (kas, video, gambar, help).
  // Jangan merespon obrolan bebas/santai (SimiSimi) di grup agar tidak spam!
  if (isGroupOrRoom && !isSpecialCommand) {
    return;
  }

  // 1. Perintah: kas
  if (isKasCommand) {

    messagePayload = {
      type: "flex",
      altText:
        "Halaman Kas Cavallery\n\nLihat halaman kas:\nhttps://cavallery.id/internal/iuran-kas-xv7r2q",
      contents: {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#0F172A",
          paddingAll: "lg",
          contents: [
            {
              type: "text",
              text: "Cavallery Kas",
              weight: "bold",
              color: "#38BDF8",
              size: "sm",
            },
            {
              type: "text",
              text: "Halaman Kas Internal",
              weight: "bold",
              color: "#FFFFFF",
              size: "lg",
              margin: "xs",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: "Rincian status kas & transparansi keuangan organisasi Cavallery dapat dilihat melalui tautan di bawah ini:",
              wrap: true,
              size: "sm",
              color: "#475569",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#0284C7",
              action: {
                type: "uri",
                label: "Lihat Halaman Kas",
                uri: "https://cavallery.id/internal/iuran-kas-xv7r2q",
              },
            },
          ],
        },
      },
    };
  }
  // 2. Perintah: bayar kas
  else if (isBayarKasCommand) {
    messagePayload = {
      type: "flex",
      altText:
        "Pembayaran Kas Cavallery\n\nBayar kas melalui halaman berikut:\nhttps://cavallery.id/cavallery-kas",
      contents: {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#0F172A",
          paddingAll: "lg",
          contents: [
            {
              type: "text",
              text: "Cavallery Kas",
              weight: "bold",
              color: "#22C55E",
              size: "sm",
            },
            {
              type: "text",
              text: "Pembayaran Kas",
              weight: "bold",
              color: "#FFFFFF",
              size: "lg",
              margin: "xs",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: "Untuk melakukan pembayaran iuran kas Cavallery, silakan klik tombol di bawah ini:",
              wrap: true,
              size: "sm",
              color: "#475569",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#16A34A",
              action: {
                type: "uri",
                label: "Bayar Kas Sekarang",
                uri: "https://cavallery.id/cavallery-kas",
              },
            },
          ],
        },
      },
    };
  }
  // 3. Perintah: pengumuman / discord
  else if (isPengumumanCommand) {
    messagePayload = {
      type: "flex",
      altText:
        "Pengumuman Resmi Discord Cavallery\n\nLihat pengumuman:\nhttps://cavallery.id/internal/pengumuman-discord-xv7r2q",
      contents: {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "vertical",
          backgroundColor: "#1E1F22",
          paddingAll: "lg",
          contents: [
            {
              type: "text",
              text: "Discord Cavallery Fanbase",
              weight: "bold",
              color: "#5865F2",
              size: "sm",
            },
            {
              type: "text",
              text: "Pengumuman Resmi",
              weight: "bold",
              color: "#FFFFFF",
              size: "lg",
              margin: "xs",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: "Arsip resmi pengumuman server Discord Cavallery (Project STS Erine, Rapat Koordinasi, Transparansi Dana, dll) kini dapat kamu pantau langsung melalui web:",
              wrap: true,
              size: "sm",
              color: "#94A3B8",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#5865F2",
              action: {
                type: "uri",
                label: "Lihat Pengumuman Discord",
                uri: "https://cavallery.id/internal/pengumuman-discord-xv7r2q",
              },
            },
          ],
        },
      },
    };
  }
  // 4. Perintah bantuan / menu
  else if (isHelpCommand) {
    messagePayload = {
      type: "text",
      text:
        "Halo! Aku bot resmi Cavallery Fanbase. 🕊️\n\n" +
        "Berikut perintah yang bisa kamu gunakan:\n" +
        "• kas : Menampilkan transparansi laporan kas internal\n" +
        "• bayar kas : Menampilkan link pembayaran kas\n" +
        "• pengumuman / discord : Menampilkan arsip pengumuman resmi Discord\n\n" +
        "Kamu juga bisa bebas ngobrol santai seputar Erine atau kirim kata kunci spesial seperti 'waduh', 'niterine', 'ngasal', atau 'happy diesvenerine'!",
    };
  }
  // 4. Perintah Media Khusus Dinamis (Video & Foto Bot LINE dari Admin)
  else if (matchedMedia) {
    const formatUrl = (url: string) => {
      if (!url) return "";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      return `https://cavallery.id${url.startsWith("/") ? "" : "/"}${url}`;
    };

    const mediaUrl = formatUrl(matchedMedia.mediaUrl);
    const previewUrl = formatUrl(matchedMedia.previewUrl || matchedMedia.mediaUrl);

    if (matchedMedia.type === "video") {
      messagePayload = {
        type: "video",
        originalContentUrl: mediaUrl,
        previewImageUrl:
          previewUrl ||
          "https://images.jkt48connect.com/cavallery/images/2026/09/4dc2029f5e314054.jpg",
      };
    } else {
      messagePayload = {
        type: "image",
        originalContentUrl: mediaUrl,
        previewImageUrl: previewUrl || mediaUrl,
      };
    }
  }
  // 6. Komunikasi 2 Arah Pintar ala SimiSimi & Gemini AI (Hanya di Chat Pribadi)
  else {
    try {
      const replyText = await getAIOrSimiSimiReply(rawText);
      if (replyText) {
        messagePayload = {
          type: "text",
          text: replyText,
        };
      }
    } catch (e: any) {
      console.error("[LINE Private AI/SimiSimi Reply Error]:", e);
      messagePayload = {
        type: "text",
        text: "Iyaa kak! Seneng deh bisa ngobrol sama kamu. Mau cerita apa lagi nih? ✨",
      };
    }
  }

  // Jika ada pesan balasan dan access token telah diisi, kirim ke LINE API
  if (messagePayload && channelAccessToken) {
    try {
      const response = await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({
          replyToken: event.replyToken,
          messages: Array.isArray(messagePayload) ? messagePayload : [messagePayload],
        }),
      });

      const resText = await response.text();
      global._lastLineReply = {
        time: new Date().toISOString(),
        status: response.status,
        ok: response.ok,
        response: resText,
        replyTo: event.message?.text,
      };

      if (!response.ok) {
        console.error("[LINE Reply Error]:", response.status, resText);
      }
    } catch (sendErr: any) {
      global._lastLineReply = {
        time: new Date().toISOString(),
        error: sendErr?.message || String(sendErr),
      };
      console.error("[LINE Fetch Error]:", sendErr);
    }
  }
}
