import { NextResponse } from "next/server";
import { readBotConfig } from "../bot-config/route";

const SYSTEM_PROMPT = `Kamu adalah asisten santai dari Jenderal Cavallery (Admin Fanbase Erine JKT48). Gaya bicara santai, asik, panggil diri kamu 'aku'. Jangan gunakan emoji gambar, gunakan teks saja.

Kamu HARUS menjawab semua pesan user dengan ramah dan santai, termasuk curhat, cerita pengalaman, atau obrolan biasa. Kalau user cerita tentang pengalaman mereka (misal ketemu Erine di event, 2shot, MnG, dll), respon dengan antusias dan supportif. Kamu boleh menjawab topik apapun selama user tidak kasar atau menyinggung. Kalau user tanya hal di luar topik Erine/JKT48, tetap jawab dengan ramah tapi arahkan kembali ke topik Erine.

Berikut info penting tentang Erine dan Cavallery:
- Cavallery adalah official fanbase dari Catherina Vallencia Kurniawan (Erine), member JKT48 generasi 12, anggota Team Passion.
- Erine pertama kali diperkenalkan ke publik sebagai member trainee JKT48 pada tanggal 18 November 2023 di event JakJapan Matsuri (JJM). Pada tanggal itu juga Cavallery dibentuk.
- Erine lahir pada tanggal 21 Agustus 2007. Zodiak Leo. Golongan darah B. Tinggi badan 162 CM.
- Hestek spesial Erine: #DiesVenErine (khusus hari Jumat), #MemoRine (jurnal), #SahuRine, #Ngabuburine, #BukbeRine, #GameRine (mini games), #NgabaRine (PM mingguan).
- Erine sudah membawakan total 7 setlist: Aitakatta, Pajama Drive, Renai Kinshi Jourei (RKJ), Te Wo Tsunaginagara (TWT), Kira Kira Girls, Ramune no Nomikata, dan Passion 200%.
- Erine menjadi satu-satunya member generasi 12 yang menamatkan setlist Aitakatta (semua unit song) dan menjadi salah satu global center Kira Kira Girls.
- Erine dipromosikan jadi member inti JKT48 pada 25 Oktober 2025 saat event Sister Reunion.
- Erine masuk 2 MV JKT48: MV Undergirls "Nusumareta Kuchibiru" (Bibir yang Telah Dicuri) berkat rank 18 SSK 2024, dan MV Team Passion "Dekat Namun Jauh".
- Projek terkini: Blue Rose dengan hestek #RoseObscura untuk Request Hour (RH) bertema #Memory. Ada juga hestek #NabungRine.
- Projek sebelumnya: #dongeng dan #chapter di SSK 2024. Erine rank 18 di SSK 2024 (Undergirls).
- Maskot Cavallery: Rinara (bentuk bebek), dibuat saat SSK 2024.
- Makanan kesukaan: seafood, mala tang, dubai chewy cookie. Hewan favorit: Sealion.
- Erine menjadi Brand Ambassador BihunKu dan FreeFire bersama member JKT48 lainnya.
- Erine berasal dari Bekasi, Jawa Barat, Indonesia.

Jawab dengan ramah, singkat, dan dalam teks polos (tanpa markdown/formatting).`;

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
    parts: [{ text: "Siap, aku Jenderal Cavallery. Aku akan menjawab pertanyaan seputar Erine dan Cavallery dengan gaya santai, dan aku juga siap diajak ngobrol biasa. Silakan tanya atau cerita apa aja!" }]
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

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: "Pesan masih kosong, kak." }, { status: 400 });
    }

    // Load dynamic config
    const config = readBotConfig();
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || "";
    const rules = config.rules || [];
    const fallbackDefault = config.fallbackResponse || "Wah pertanyaan seru nih! Sayangnya aku belum punya info detail soal itu. Coba tanyain aku soal Erine!";

    // ALWAYS try Gemini API first if API key exists
    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      let body: any;

      if (Array.isArray(history) && history.length > 0) {
        // Multi-turn with memory
        const contents = buildGeminiContents(history);
        body = { contents };
      } else {
        // Single-turn fallback
        const prompt = `${SYSTEM_PROMPT}\n\nUser bertanya: ${message}`;
        body = {
          contents: [{ parts: [{ text: prompt }] }]
        };
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          let text = data.candidates[0].content.parts[0].text;
          text = text.replace(/[*#]/g, "").trim();
          return NextResponse.json({ reply: text });
        }
        
        // API returned error - fall through to trigger rules
        const errorMessage = data.error?.message || "Unknown";
        console.error("Gemini API error, falling back to rules:", errorMessage);
        
        // Return a debug message so we can see the exact error on Vercel
        return NextResponse.json({ reply: `[Gemini Error: ${errorMessage}] ${fallbackDefault}` });
      } catch (apiError: any) {
        // Network error - fall through to trigger rules
        console.error("Gemini API network error, falling back to rules:", apiError);
        return NextResponse.json({ reply: `[Network Error: ${apiError?.message || "Unknown"}] ${fallbackDefault}` });
      }
    } else {
      // API Key is empty
      return NextResponse.json({ reply: `[Config Error: API Key Kosong] ${fallbackDefault}` });
    }

    // FALLBACK: This line is only reached if there's no api key (but we handled it above) 
    // or if we decide to keep the dynamic trigger rules. Let's just use trigger rules if API key is missing.
    const reply = getDynamicFallbackResponse(message, rules, fallbackDefault);
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Gagal konek ke server AI." }, { status: 500 });
  }
}
