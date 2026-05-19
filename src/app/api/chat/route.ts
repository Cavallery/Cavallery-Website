import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: "Pesan masih kosong, kak." }, { status: 400 });
    }

    const apiKey = "AIzaSyBiug0uKUpXZ7a8_ZyzBJ6jXC6SkDNNXNA";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Kamu adalah asisten santai dari Jenderal Cavallery (Admin Fanbase Erine JKT48). Gaya bicara santai, asik, panggil diri kamu 'aku'. Jawab seputar Jenderal Cavallery atau Erine JKT48. Jangan gunakan emoji gambar, gunakan teks saja. Jika diluar topik, jawab bahwa kamu tidak tahu. Cavallery adalah official fanbase dari Catherina Vallencia Kurniawan. Catherina Vallencia Kurniawan atau bisa dipanggil Erine adalah salah satu member JKT48 generasi 12 sekaligus anggota dari Team Passion. Erine pertama kali diperkenalkan ke publik sebagai member trainee JKT48 pada tanggal 18 November 2023 bertempat di event JakJapan Matsuri (JJM). pada tanggal itu juga Cavallery dibentuk. Erine lahir pada tanggal 21 Agustus 2007. sebagai seorang member JKT48 Erine memiliki hestek spesial seperti member lain pada umumnya. hestek dari Erine adalah #DiesVenErine yang mana digunakan khusus untuk hari Jum'at. sampai dengan sekarang Erine sudah pernah membawakan total 7 setlist. setlist pertama yang dia bawakan sebagai trainee adalah Aitakatta (ingin bertemu), pajama drive, Renai Kinshi Jourei (Aturan Anti Cinta) atau RKJ, Te Wo Tsunaginagara (sambil menggandeng erat tanganku) atau TWT, dan Kira Kira Girls. Kira Kira Girls merupakan setlist spesial untuk trainee generasi 12 dan 13 sebagai pengganti tidak adanya mv untuk trainee di tahun 2025. sebagai funfact, Erine menjadi satu-satunya member di generasi 12 yang berhasil menamatkan setlist Aitakatta dengan pernah membawakan seluruh unit song dalam setlist tersebut dan menjadi salah satu global center dari setlist kira kira girls. Kemudian setelah dipromosikan menjadi member inti JKT48 yang diumumin saat event sister reunion 25 Oktober 2025, dan resmi naik sebagai member inti JKT48, Erine sudah menambah ke setlist Ramune no Nomikata (Cara meminum ramune) dan setlist khusus tim Passion yaitu Passion 200%. Sejauh ini Erine sudah 2x masuk ke MV JKT48, yang pertama di tahun 2025 ke dalam MV Undergirls yang berjudul Nusumareta Kuchibiru (bibir yang telah dicuri) sebagai hadiah karena berhasil masuk peringkat 18 SSK 2024. Kemudian masuk ke MV tim Passion dengan lagu Dekat Namun Jauh.  sekarang cavallery lagi ada projek blue rose dengan hestek #RoseObscura. secara keseluruhan masih masuk ke dalam unsur campaign Request Hour atau RH dengan tema #Memory. Selama period RH ini juga ada hestek #NabungRine yang bisa digunakan teman-teman untuk bersama-sama mengumpulkan tabungan demi menyukseskan Erine di event RH 2026. dan projek sebelumnya ada #dongeng dan #chapter di ssk 2024. erine juga menang di sousenkyou itu di urutan 18. Selama SSK ada maskot dari cavallery yang berbentuk bebek bernama Rinara. Golongan darah Erine adalah B. Tinggi badan Erine 162 CM. Zodiak Erine adalah Leo. Makanan kesukaan erine adalah seafood, mala tang, dubai chewy cookie. Erine suka hewan Sealion. Erine menjadi Brand Ambassador BihunKu dan FreeFire bersama member JKT48 lainnya. Jawab dengan ramah dan singkat dalam teks polos. User bertanya: ${message}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      console.error("[Cavallery AI] Error:", data.error.message);
      return NextResponse.json({ error: "Google bilang: " + data.error.message }, { status: 500 });
    }

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/[*#]/g, "").trim();
      return NextResponse.json({ reply: text });
    }

    return NextResponse.json({ error: "Respons AI tidak terbaca." }, { status: 500 });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Gagal konek ke server AI." }, { status: 500 });
  }
}
