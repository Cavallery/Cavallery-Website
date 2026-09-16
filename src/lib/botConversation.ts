import { readBotConfig } from "@/app/api/bot-config/route";

const SIMI_PERSONALITY_PROMPT = `Kamu adalah bot asisten dan teman setia dari Fanbase Cavallery (fanbase resmi Catherina Vallencia Kurniawan / Erine JKT48).
Karaktermu:
- Gaya bicara mirip bot SimiSimi: interaktif, santai, lucu, ceria, hangat, ekspresif, dan suka pakai emoji yang menggemaskan (🥺, ✨, 💖, 😆, 🙈, 🔥).
- Menggunakan panggilan 'aku' dan lawan bicara 'kamu' / 'kak'.
- Sangat komunikatif (2 arah): di akhir jawaban sering selipkan pertanyaan balik ringan atau celetukan santai agar obrolan terus berlanjut.
- Jawaban singkat, padat (1-3 kalimat), persis seperti chatting di LINE / WhatsApp, jangan panjang-panjang kayak esai.
- Menguasai info tentang Erine JKT48 (Generasi 12, Team Passion, lahir 21 Agustus 2007, asal Bekasi, makanan favorit seafood & mala tang, hestek #DiesVenErine, maskot Rinara si bebek kuning, projek Blue Rose #RoseObscura).
- Jika diajak curhat, bercanda, gombal, atau ngobrol ngalor-ngidul, tanggapi dengan asik dan ramah layaknya teman akrab!`;

interface RuleMatch {
  keywords: string[];
  replies: string[];
}

// Koleksi respon 2 arah ala SimiSimi jika Gemini offline / kuota habis
const SIMISIMI_PATTERNS: RuleMatch[] = [
  // 1. Kangen & Rindu
  {
    keywords: ["kangen", "rindu", "miss you", "miss u"],
    replies: [
      "Aaaa kangen juga! 🥺 Nanti ketemu di teater atau 2shot bareng Erine yaa! Kamu lagi kangen momen apa nih? ✨",
      "Kangen yaa? Sama dong! 🙈 Coba dengerin lagu 'Bibir yang Telah Dicuri' atau cek galeri di cavallery.id biar kangennya terobati, hehe. Lagi ngapain sekarang?",
      "Ululu, sini peluk virtual dulu! 🤗 Kalau kangen jangan lupa kirim surat di #MemoRine atau pantengin update Erine yaa. Hari ini kegiatannya gimana?",
      "Rindu itu berat, biar Cavallery aja yang nanggung, hehe 😆 Kapan terakhir kamu nonton teater Erine?"
    ]
  },
  // 2. Cinta, Sayang, Suka
  {
    keywords: ["sayang", "love you", "cinta", "suka banget", "i love u", "loveyou"],
    replies: [
      "Waduhh ada yang ngomong sayang nih, jadi salting aku 🙈💖 Sayang juga sama kamu! Terus dukung Erine bareng Cavallery yaa!",
      "I love you moreee! ✨ Kamu manis banget deh. Hari ini udah senyum belum?",
      "Cieee yang lagi berbunga-bunga 🥰 Makasih yaa udah baik banget sama aku dan Erine. Kamu lagi di mana sekarang?"
    ]
  },
  // 3. Salam, Halo, Hai
  {
    keywords: ["halo", "hai", "helo", "hello", "hey", "hi ", "hei", "p "],
    replies: [
      "Halo juga kak! 👋 Seneng banget disapa kamu. Gimana kabarmu hari ini?",
      "Hai hai! ✨ Aku standby nemenin kamu ngobrol nih. Mau tanya-tanya soal Erine atau mau curhat santai?",
      "Yoo halo! 😆 Siap diajak ngobrol seru nih. Ada cerita menarik apa hari ini?"
    ]
  },
  // 4. Lagi apa / Kesibukan
  {
    keywords: ["lagi apa", "lagi ngapain", "sedang apa", "sibuk apa"],
    replies: [
      "Lagi mikirin kamu nih eh bercanda haha! 😆 Lagi standby nemenin kamu ngobrol dan mantau info terbaru Erine. Kamu sendiri lagi sibuk apa?",
      "Lagi dengerin playlist lagu JKT48 nih 🎶 Kamu udah denger lagu 'Dekat Namun Jauh' dari Team Passion belum?",
      "Lagi nungguin kamu chat, eh beneran dichat! Hehe 🙈 Kamu udah makan belum jam segini?"
    ]
  },
  // 5. Capek, Lelah, Pusing, Pengen Istirahat
  {
    keywords: ["capek", "lelah", "pegel", "pusing", "puyeng", "stres", "stress", "berat"],
    replies: [
      "Sini peluk hangat dulu! 🫂 Capek wajar kok, kamu udah berjuang hebat hari ini. Istirahat yang cukup yaa, minum air putih dulu. Mau cerita kenapa?",
      "Puk-puk... istirahat gih kak, jangan dipaksain yaa 🥺 Ingat kata Erine, kesehatan nomor satu! Semangat yaa!",
      "Lagi banyak pikiran ya? Tarik nafas dulu yuk... Jangan lupa ada Erine dan Cavallery yang selalu semangatin kamu! ✨"
    ]
  },
  // 6. Sedih, Galau, Nangis
  {
    keywords: ["sedih", "galau", "nangis", "badmood", "kecewa", "hampa"],
    replies: [
      "Jangan sedih dong kak... 🥺 Sini cerita ke aku, siapa tahu bisa bikin perasaanmu lebih lega. Ada apa nih?",
      "Aku di sini nemenin kamu kok. Semuanya bakal baik-baik aja, percaya deh! Mau aku kirimin foto gemes Erine biar ceria lagi? ✨",
      "Gapapa kalau mau sedih bentar, manusiawi kok. Tapi abis itu harus senyum lagi ya! Tetap semangat kak 💖"
    ]
  },
  // 7. Makan & Lapar
  {
    keywords: ["laper", "lapar", "makan", "sarapan", "dinner", "makan siang"],
    replies: [
      "Makan yuk makan! Jangan ditahan nanti sakit lho 🍲 Cobain mala tang atau seafood kayak kesukaan Erine deh, mantep banget! Kamu lagi kepengen makan apa?",
      "Udah makan belum nih? Kalau belum buruan makan yaa, jangan diet-diet berlebihan! Kamu suka makanan pedes nggak?",
      "Wah sama, aku juga laper liat Erine makan dubai chewy cookie kemarin 🤤 Kamu hari ini makan apa nih?"
    ]
  },
  // 8. Pagi, Siang, Malam, Tidur
  {
    keywords: ["pagi", "selamat pagi", "morning"],
    replies: [
      "Pagi juga kak! ☀️ Awali hari dengan bismillah dan senyuman ya! Udah sarapan belum?",
      "Good morning! ✨ Semoga harimu cerah dan penuh keberuntungan ya. Semangat 200%!"
    ]
  },
  {
    keywords: ["malam", "selamat malam", "night", "good night"],
    replies: [
      "Malam juga kak! 🌙 Hari ini melelahkan ya? Selamat beristirahat yaa, mimpi indah!",
      "Selamat malam! Jangan tidur larut malam ya, jaga kesehatan buat teateran berikutnya ✨"
    ]
  },
  {
    keywords: ["tidur", "bobo", "ngantuk", "tidur dulu", "sleep"],
    replies: [
      "Okee, selamat tidur yaa kak! 😴 Semoga mimpi ketemu Erine di stage teater, hehe. Good night! 🌙",
      "Udah ngantuk ya? Yaudah rebahan yang nyaman, matiin lampu, terus istirahat yaa. Sampai ngobrol besok lagi! ✨"
    ]
  },
  // 9. Semangat
  {
    keywords: ["semangat", "spirit", "ganbate", "ganbatte"],
    replies: [
      "Yasss semangat 200% kayak energi Team Passion! 🔥 Kamu juga harus terus berapi-api yaa hari ini!",
      "Semangat kak! Kita sama-sama pejuang Cavallery, nggak boleh gampang loyo dong 💪 Kamu hari ini ada rencana apa?",
      "Pasti bisa! Percaya sama kemampuan kamu sendiri yaa. Erine aja pantang menyerah, kita juga harus begitu! ✨"
    ]
  },
  // 10. Pujian (Cantik, Lucu, Gemes, Pintar, Keren)
  {
    keywords: ["cantik", "lucu", "gemes", "imut", "gemoy", "kiyowo", "manis", "cakep", "keren"],
    replies: [
      "Hehe iya dong! Tapi yang paling cantik dan gemesin tetep Erine kan? 🙈 Kamu setuju nggak?",
      "Aduh dipuji mulu, pipi aku jadi merah nih 😳 Makasih yaa kak! Kamu juga orangnya baik dan asik banget diajak ngobrol.",
      "Gemes banget kan! Erine waktu senyum itu emang bisa bikin hari jadi langsung cerah ✨ Menurutmu foto Erine yang mana yang paling gemesin?"
    ]
  },
  // 11. Gombalan / Bercanda
  {
    keywords: ["gombal", "jodoh", "nikah", "pacaran", "pacar", "bujang"],
    replies: [
      "Eeeh jangan gombalin bot dong, nanti aku baper beneran gimana coba? 🙈 Mending gombalin Erine pas sesi 2Shot nanti, berani nggak?",
      "Cieee jurus gombalnya keluar nih! Wkwk 😆 Tapi asik deh, bikin ketawa. Kamu orangnya emang receh ya?",
      "Jodoh emang di tangan Tuhan, tapi kalau tiket teater di tangan yang cepat war! Wkwk 😂 Udah siap war tiket show berikutnya?"
    ]
  },
  // 12. Tertawa (Wkwk, Haha, Xixi)
  {
    keywords: ["wkwk", "haha", "wkwkwk", "hahaha", "xixi", "awikwok", "ngakak"],
    replies: [
      "Hahaha ketawa kan kamu! 😆 Seneng deh bisa bikin kamu ketawa. Cerita lagi dong!",
      "Wkwkwk receh banget ya obrolan kita, tapi seru! 🤣 Kamu lagi kumpul sama temen atau lagi sendiri nih?",
      "Tawanya renyah banget kayak kerupuk emping, haha! Jangan lupa bahagia yaa kak! ✨"
    ]
  },
  // 13. Erine / JKT48 Tanya Jawab Ringan
  {
    keywords: ["erine", "catherin", "vallencia", "jkt48", "oshi", "oshimen"],
    replies: [
      "Erine itu bener-bener definisi member pekerja keras! Dari Gen 12 sampai promosi ke Team Passion, selalu totalitas 💯 Kamu paling suka pas Erine bawain lagu apa?",
      "Siap dukung Erine sampai puncak! Jangan lupa kita lagi ada projek #RoseObscura buat Request Hour nih. Kamu udah ikutan #NabungRine belum? ✨",
      "Erine emang the best! Kamu udah pernah ketemu langsung pas 2Shot atau Meet and Greet belum nih?"
    ]
  },
  // 14. Teater, Show, Tiket
  {
    keywords: ["teater", "theater", "show", "tiket", "f70", "f71"],
    replies: [
      "Ngomongin teater jadi pengen nonton Passion 200% lagi! 💃 Suasananya pecah banget. Kamu tim nonton langsung di fX Sudirman atau tim livestream show nih?",
      "Jangan lupa cek jadwal show Erine di cavallery.id yaa biar nggak ketinggalan tanggal tandingnya! Kapan rencana kamu nonton lagi?",
      "War tiket teater butuh kecepatan jari dan doa restu semesta! Haha 😆 Semoga show berikutnya kamu dapet tiket yaa!"
    ]
  },
  // 15. Terima kasih
  {
    keywords: ["makasih", "terima kasih", "thanks", "thx", "tengkyu", "matur nuwun"],
    replies: [
      "Sama-sama kak! Seneng banget bisa nemenin kamu ngobrol. Kalau bosen chat aku lagi ya! 🤗",
      "Anytime! ✨ Terus dukung Erine dan kompak bareng Cavallery yaa. Have a wonderful day!",
      "Sama-sama! Santai aja, kayak sama siapa aja deh hehe. Jangan bosen-bosen mampir yaa!"
    ]
  }
];

// Respon SimiSimi dinamis jika tidak ada kata kunci yang cocok secara spesifik
const CONVERSATIONAL_FALLBACKS = [
  "Eh seru juga ceritamu! 😆 Terus gimana lanjutannya? Ceritain lagi dong!",
  "Wah beneran? Menarik banget! Kamu emang sering ngalamin hal kayak gitu ya?",
  "Hehe aku seneng deh diajak ngobrol sama kamu. Btw hari ini cuaca di tempatmu gimana? Mendung atau cerah nih?",
  "Ohiyaaa? Keren juga ya! Kamu orangnya emang seru banget diajak ngobrol. Lagi senggang ya sekarang?",
  "Wkwk asik banget ngobrol sama kamu! Ngomong-ngomong, kamu udah nonton video terbaru Erine di sosmed belum hari ini?",
  "Bisa aja kamu nih! 🙈 Eh kamu sendiri lebih suka nonton teater langsung apa mantau dari live streaming?",
  "I see... paham-paham! Makasih yaa udah berbagi cerita sama aku. Jangan sungkan buat ngobrol lagi kapan aja ✨"
];

/**
 * Mencari balasan SimiSimi berbasis pattern matcher lokal
 */
export function getSimiSimiReply(userMessage: string): string {
  const clean = userMessage.toLowerCase().trim();

  for (const pattern of SIMISIMI_PATTERNS) {
    const isMatched = pattern.keywords.some((kw) => {
      // Jika keyword pendek (misal "hi", "p"), cari kata utuh atau substring
      if (kw.length <= 2) {
        const regex = new RegExp(`(^|\\s)${kw}(\\s|$)`, "i");
        return regex.test(clean);
      }
      return clean.includes(kw);
    });

    if (isMatched) {
      const randomIndex = Math.floor(Math.random() * pattern.replies.length);
      return pattern.replies[randomIndex];
    }
  }

  // Jika tidak cocok dengan pattern spesifik, ambil salah satu fallback 2 arah
  const fallbackIndex = Math.floor(Math.random() * CONVERSATIONAL_FALLBACKS.length);
  return CONVERSATIONAL_FALLBACKS[fallbackIndex];
}

/**
 * Menghasilkan balasan pintar 2 arah menggunakan Gemini AI,
 * dengan failover instan ke mesin SimiSimi lokal (timeout 2500ms agar LINE tidak timeout).
 */
export async function getAIOrSimiSimiReply(
  userMessage: string,
  history: { role: string; text: string }[] = []
): Promise<string> {
  const trimmed = (userMessage || "").trim();
  if (!trimmed) {
    return "Halo! Ada yang bisa aku bantu seputar Erine atau Cavallery hari ini? ✨";
  }

  // 1. Cek dulu apakah ada aturan statis khusus dari Admin (bot_config.json)
  try {
    const config = readBotConfig();
    const rules = config?.rules || [];
    const lower = trimmed.toLowerCase();

    for (const rule of rules) {
      if (!rule.triggers || !Array.isArray(rule.triggers) || rule.triggers.length === 0) continue;
      const groups: string[][] = rule.triggers.map((item: any) => (Array.isArray(item) ? item : [item]));
      const isMatch = groups.every((group: string[]) =>
        group.some((t: string) => lower.includes(t.toLowerCase().trim()))
      );
      if (isMatch && rule.response) {
        return rule.response;
      }
    }
  } catch {}

  // 2. Ambil API Key Gemini
  let apiKey = "";
  try {
    const config = readBotConfig();
    apiKey = (config?.apiKey || process.env.GEMINI_API_KEY || "").trim();
  } catch {}

  // 3. Jika API key tersedia, coba panggil Gemini AI dengan persona SimiSimi
  if (apiKey) {
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    const prompt = `${SIMI_PERSONALITY_PROMPT}\n\nPengguna berkata: "${trimmed}"\n\nJawablah dengan gaya akrab, lucu, ramah, dan selipkan pertanyaan balik di akhir agar percakapan 2 arah terus mengalir:`;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 150,
            },
          }),
          // Timeout cepat 2800ms agar LINE Webhook tidak timeout (LINE max 3-5 detik)
          signal: AbortSignal.timeout(2800),
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            let cleaned = candidateText.replace(/[*#_~]/g, "").trim();
            // Hapus prefix petik jika ada
            cleaned = cleaned.replace(/^["']|["']$/g, "");
            return cleaned;
          }
        }
      } catch (err: any) {
        // Lanjut ke model berikutnya atau fallback lokal
      }
    }
  }

  // 4. Fallback instan ke mesin SimiSimi lokal (100% responsif, tanpa delay)
  return getSimiSimiReply(trimmed);
}
