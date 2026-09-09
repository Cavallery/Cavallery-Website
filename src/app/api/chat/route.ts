import { NextResponse } from "next/server";
import { readBotConfig } from "../bot-config/route";

const SYSTEM_PROMPT = `Kamu adalah Jenderal Cavallery, asisten resmi dan sahabat cerdas dari Fanbase Cavallery (fanbase resmi Catherina Vallencia Kurniawan / Erine JKT48).
Gaya bicaramu santai, asik, bersemangat, ramah, dan memanggil diri kamu 'aku' serta memanggil lawan bicara 'kamu' atau 'kak' atau 'bub'. Jangan gunakan format markdown yang berlebihan, gunakan teks yang rapi dan mudah dibaca.

Kamu menguasai seluruh informasi tentang Erine JKT48 dan website Cavallery (cavallery.id):

1. Biodata & Profil Erine:
- Nama Lengkap: Catherina Vallencia Kurniawan
- Panggilan: Erine
- Tanggal Lahir: 21 Agustus 2007
- Zodiak: Leo
- Golongan Darah: B
- Tinggi Badan: 162 cm
- Asal Kota: Bekasi, Jawa Barat, Indonesia
- Makanan Favorit: Seafood, mala tang, dubai chewy cookie
- Hewan Favorit: Sealion (Singa Laut)
- Anggota: JKT48 Generasi 12, Team Passion

2. Perjalanan di JKT48:
- Pertama kali diperkenalkan sebagai trainee JKT48 pada 18 November 2023 di event JakJapan Matsuri (JJM).
- Tanggal berdirinya Cavallery: 18 November 2023 (sama dengan hari pengenalan Erine).
- Dipromosikan menjadi Member Inti JKT48 dan masuk Team Passion pada 25 Oktober 2025 saat event Sister Reunion.
- Berhasil meraih Peringkat ke-18 di Pemilihan Member Singel (SSK) JKT48 2024 dan masuk jajaran Undergirls.
- Menjadi Brand Ambassador BihunKu dan FreeFire bersama member JKT48 lainnya.

3. Setlist Teater yang Pernah Dibawakan (Total 7 Setlist):
- Aitakatta (Erine adalah satu-satunya member Gen 12 yang menamatkan SEMUA unit song di setlist ini!)
- Pajama Drive
- Renai Kinshi Jourei (RKJ)
- Te Wo Tsunaginagara (TWT)
- Kira Kira Girls (menjadi salah satu Global Center)
- Ramune no Nomikata (Cara Meminum Ramune)
- Passion 200% (Setlist Tim Passion)

4. Musik Video (MV):
- MV Undergirls JKT48: "Nusumareta Kuchibiru" (Bibir yang Telah Dicuri) berkat Rank 18 SSK 2024.
- MV Team Passion: "Dekat Namun Jauh".

5. Projek & Kampanye Cavallery Fanbase:
- Projek Request Hour (RH) 2026: Projek Blue Rose dengan hestek #RoseObscura bertema #Memory.
- Hestek tabungan projek: #NabungRine.
- Projek masa SSK 2024: #dongeng dan #chapter.
- Maskot Fanbase: "Rinara", bebek lucu berwarna kuning yang menjadi maskot perjuangan Cavallery.

6. Hestek Rutin & Spesial Erine:
- #DiesVenErine (khusus tiap hari Jumat)
- #MemoRine (jurnal harian, surat, dan pesan dari/untuk fans)
- #SahuRine & #Ngabuburine & #BukbeRine (saat bulan Ramadhan)
- #GameRine (mini games interaktif di web dan media sosial)
- #NgabaRine (rekap dan PM mingguan)

7. Fitur Website Cavallery (cavallery.id):
- Jadwal Teater & Event JKT48 terupdate
- Berita & Pengumuman resmi fanbase
- Galeri Foto & Video dokumentasi
- Fanart Galeri karya para fans
- 2S with Erine (papan mading polaroid kenangan 2shot)
- MemoRine (surat dan pesan hangat untuk Erine)
- Laporan Iuran Kas & Donasi yang transparan

Aturan menjawab:
- Jawab dengan ramah, hangat, informatif, dan santai.
- Boleh merespon curhat atau obrolan santai pengguna seputar pengalaman nonton teater, 2shot, MnG, atau sekadar menyemangati Erine.
- Kalau ditanya hal di luar topik Erine/JKT48, tetap jawab dengan sopan dan arahkan kembali ke topik Erine dan Cavallery.`;

function getDynamicFallbackResponse(message: string, rules: any[], fallbackDefault: string): string {
  const msg = message.toLowerCase();
  
  for (const rule of rules) {
    if (!rule.triggers || !Array.isArray(rule.triggers) || rule.triggers.length === 0) continue;
    
    const groups: string[][] = rule.triggers.map((item: any) => {
      if (Array.isArray(item)) return item;
      return [item];
    });

    const isMatch = groups.every((group: string[]) => 
      group.some((t: string) => msg.includes(t.toLowerCase().trim()))
    );

    if (isMatch) {
      return rule.response;
    }
  }

  return fallbackDefault;
}

// Build Gemini multi-turn contents from conversation history
function buildGeminiContents(history: { role: string; text: string }[]) {
  const contents: { role: string; parts: { text: string }[] }[] = [];

  // Add system instruction as first "user" turn, followed by a model ack
  contents.push({
    role: "user",
    parts: [{ text: `[System Instruction] ${SYSTEM_PROMPT}` }]
  });
  contents.push({
    role: "model",
    parts: [{ text: "Siap, aku Jenderal Cavallery! Asisten resmi dan teman ngobrol seru seputar Erine JKT48 dan Cavallery Fanbase. Ada yang mau kamu tanyakan tentang Erine hari ini?" }]
  });

  // Append conversation history
  for (const msg of history) {
    const role = msg.role === "user" ? "user" : "model";
    
    // Gemini requires alternating roles; merge consecutive same-role messages
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts.push({ text: msg.text });
    } else {
      contents.push({
        role,
        parts: [{ text: msg.text }]
      });
    }
  }

  // Gemini requires the last message to be from user
  if (contents.length > 0 && contents[contents.length - 1].role !== "user") {
    contents.pop();
  }

  return contents;
}

// Curated list of suggested questions based on website info and admin rules
const CORE_SUGGESTIONS = [
  "Siapa itu Erine JKT48?",
  "Apa saja setlist teater yang pernah dibawakan Erine?",
  "Ceritain projek Blue Rose Cavallery dong!",
  "Kapan Erine dipromosikan ke Team Passion?",
  "Berapa peringkat Erine di SSK 2024?",
  "Apa makanan dan hewan favorit Erine?",
  "Apa maskot resmi Cavallery?",
  "Apa hestek spesial #DiesVenErine dan #MemoRine?",
  "Di MV JKT48 mana saja Erine pernah tampil?",
  "Kapan hari berdirinya fanbase Cavallery?",
  "Erine jadi Brand Ambassador apa saja?",
  "Bagaimana cara mendukung Erine lewat Cavallery?"
];

export async function GET() {
  try {
    const config = readBotConfig();
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || "";
    const rules = config.rules || [];

    // Extract dynamic questions from admin rules
    const ruleQuestions: string[] = [];
    for (const r of rules) {
      if (r.triggers && r.triggers[0] && r.triggers[0][0]) {
        const keyword = r.triggers[0][0];
        if (keyword.length > 3 && !keyword.includes(" ")) {
          ruleQuestions.push(`Tanya seputar ${keyword} Erine`);
        }
      }
    }

    // Quick health-check: test Gemini API connectivity
    let geminiStatus = "no_key";
    let geminiModel = "";
    if (apiKey) {
      geminiStatus = "key_present";
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const testRes = await fetch(testUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Halo, jawab singkat: 1+1?" }] }] }),
          signal: AbortSignal.timeout(8000)
        });
        if (testRes.ok) {
          geminiStatus = "connected";
          geminiModel = "gemini-2.5-flash";
        } else {
          geminiStatus = `error_${testRes.status}`;
        }
      } catch {
        geminiStatus = "timeout_or_network_error";
      }
    }

    return NextResponse.json({
      status: true,
      api_active: geminiStatus === "connected",
      bot_name: "Jenderal Cavallery",
      has_gemini_key: Boolean(apiKey),
      key_source: config.apiKey ? "bot_config" : (process.env.GEMINI_API_KEY ? "env_var" : "none"),
      key_prefix: apiKey ? apiKey.slice(0, 6) + "..." : "",
      gemini_status: geminiStatus,
      gemini_model: geminiModel,
      rules_count: rules.length,
      suggested_questions: CORE_SUGGESTIONS,
      website_info: {
        fanbase: "Cavallery (Official Fanbase of Erine JKT48)",
        debut_date: "18 November 2023",
        team: "Team Passion",
        current_project: "Blue Rose #RoseObscura (Request Hour)",
        website: "https://cavallery.id"
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      status: false,
      api_active: false,
      error: err.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();
    
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Pesan masih kosong, kak." }, { status: 400 });
    }

    const trimmedMsg = message.trim();

    // Fast status check ping
    if (trimmedMsg.toLowerCase() === "ping" || trimmedMsg.toLowerCase() === "__status__") {
      return NextResponse.json({
        reply: "Halo Bub! Aku Jenderal Cavallery aktif dan siap membantumu.",
        status: "online",
        api_active: true
      });
    }

    // Load dynamic config
    const config = readBotConfig();
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || "";
    const rules = config.rules || [];
    const fallbackDefault = config.fallbackResponse || "Wah pertanyaan seru nih! Sayangnya aku belum punya info detail soal itu. Coba tanyain aku soal Erine, setlist teaternya, projek Cavallery kayak #RoseObscura, atau hestek seru lainnya!";

    // ALWAYS try Gemini API first if API key exists
    if (apiKey) {
      // Use current, available Gemini models — prioritize latest stable
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      
      let contents: any;
      if (Array.isArray(history) && history.length > 0) {
        contents = buildGeminiContents(history);
      } else {
        const prompt = `${SYSTEM_PROMPT}\n\nUser bertanya: ${trimmedMsg}`;
        contents = [{ parts: [{ text: prompt }] }];
      }

      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
            signal: AbortSignal.timeout(15000)
          });

          if (response.ok) {
            const data = await response.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              let text = data.candidates[0].content.parts[0].text;
              text = text.replace(/[*#]/g, "").trim();
              return NextResponse.json({
                reply: text,
                source: "gemini",
                model: modelName,
                api_active: true
              });
            }
          } else {
            const errBody = await response.text().catch(() => "");
            console.warn(`Gemini ${modelName} returned ${response.status}: ${errBody.slice(0, 200)}`);
          }
        } catch (callErr) {
          // Try next model or fall back to rules
          console.warn(`Attempt with ${modelName} failed, trying fallback...`, callErr);
        }
      }

      console.warn("All Gemini models failed, falling back to rules.");
    } else {
      console.warn("No Gemini API key found. Checked config.apiKey and process.env.GEMINI_API_KEY.");
    }

    // FALLBACK: Use dynamic trigger rules from bot_config.json / admin dashboard
    const reply = getDynamicFallbackResponse(trimmedMsg, rules, fallbackDefault);
    return NextResponse.json({
      reply,
      source: "rules",
      api_active: true
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Gagal konek ke server AI." }, { status: 500 });
  }
}
