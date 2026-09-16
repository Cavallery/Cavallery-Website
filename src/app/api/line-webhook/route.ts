import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readBotConfig } from "../bot-config/route";

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
  if (!event || event.type !== "message" || event.message?.type !== "text") {
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

  // 1. Perintah: kas
  if (text === "kas") {
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
  else if (text === "bayar kas") {
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
  // 3. Perintah bantuan / menu
  else if (text === "help" || text === "bantuan" || text === "menu" || text === "perintah") {
    messagePayload = {
      type: "text",
      text:
        "Halo! Aku bot resmi Cavallery Kas. 🕊️\n\n" +
        "Berikut perintah yang bisa kamu gunakan:\n" +
        "• kas : Menampilkan tombol rincian halaman kas\n" +
        "• bayar kas : Menampilkan tombol link pembayaran kas\n\n" +
        "Kamu juga bisa bertanya seputar Erine atau kegiatan Cavallery lho!",
    };
  }
  // 4. Pertanyaan seputar Erine / Fanbase (mengambil knowledge base bot_config)
  else {
    try {
      const config = readBotConfig();
      const rules = config?.rules || [];

      for (const rule of rules) {
        if (!rule.triggers || !Array.isArray(rule.triggers) || rule.triggers.length === 0) {
          continue;
        }

        const groups: string[][] = rule.triggers.map((item: any) => {
          if (Array.isArray(item)) return item;
          return [item];
        });

        const isMatch = groups.every((group: string[]) =>
          group.some((t: string) => text.includes(t.toLowerCase().trim()))
        );

        if (isMatch && rule.response) {
          messagePayload = {
            type: "text",
            text: rule.response,
          };
          break;
        }
      }
    } catch {
      // Abaikan jika tidak cocok dengan rule
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
          messages: [messagePayload],
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
