import { NextResponse } from "next/server";

function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if ((msg.includes("siapa") || msg.includes("kenal")) && (msg.includes("erine") || msg.includes("catherina"))) {
    return "Erine (Catherina Vallencia Kurniawan) itu member JKT48 generasi 12 yang sekarang berada di Team Passion! Dia diperkenalkan pertama kali tanggal 18 November 2023 di JakJapan Matsuri. Orangnya super gemesin dan berbakat banget!";
  }
  
  if (msg.includes("setlist") || msg.includes("teater") || msg.includes("show")) {
    return "Erine udah membawakan total 7 setlist lho! Mulai dari Aitakatta (hebatnya dia pernah bawain semua unit song di sini!), Pajama Drive, Renai Kinshi Jourei (RKJ), Te Wo Tsunaginagara (TWT), Kira Kira Girls (dia jadi global center!), terus setelah naik ke member inti ada Ramune no Nomikata dan setlist tim Passion yaitu Passion 200%!";
  }
  
  if (msg.includes("projek") || msg.includes("project") || msg.includes("rose") || msg.includes("rh") || msg.includes("request hour") || msg.includes("obscura")) {
    return "Saat ini Cavallery lagi ngadain projek Blue Rose dengan hestek #RoseObscura untuk Request Hour (RH) bertema #Memory! Kita juga ada hestek #NabungRine buat persiapan menyukseskan Erine di RH 2026 nanti. Yuk ikutan!";
  }

  if (msg.includes("lahir") || msg.includes("umur") || msg.includes("usia") || msg.includes("tanggal")) {
    return "Erine lahir tanggal 21 Agustus 2007 (Zodiak Leo). Sekarang dia udah makin dewasa dan terus bersinar bersama JKT48!";
  }

  if (msg.includes("hometown") || msg.includes("asal") || msg.includes("tinggal") || msg.includes("bekasi")) {
    return "Erine berasal dari Bekasi, Jawa Barat, Indonesia! Anak Bekasi kebanggaan Cavallery nih, hehe.";
  }

  if (msg.includes("maskot") || msg.includes("bebek") || msg.includes("rinara")) {
    return "Maskot resmi Cavallery namanya Rinara! Bentuknya bebek lucu yang nemenin perjuangan kita selama SSK 2024 kemarin.";
  }

  if (msg.includes("golongan darah") || msg.includes("goldar")) {
    return "Golongan darah Erine itu B ya guys!";
  }

  if (msg.includes("tinggi") || msg.includes("tb")) {
    return "Tinggi badan Erine itu 162 cm. Pas banget dan ideal!";
  }

  if (msg.includes("makanan") || msg.includes("kesukaan") || msg.includes("favorit") || msg.includes("suka")) {
    return "Erine suka banget makan seafood, mala tang, dan dubai chewy cookie! Hewan kesukaannya Sealion. Manis dan gurih semuanya disapu bersih, haha.";
  }

  if (msg.includes("mv") || msg.includes("video musik")) {
    return "Erine sejauh ini udah tampil di 2 MV JKT48! Pertama, MV Undergirls 'Bibir yang Telah Dicuri' (Nusumareta Kuchibiru) berkat rank 18 di SSK 2024. Kedua, MV Team Passion yang judulnya 'Dekat Namun Jauh'!";
  }

  if (msg.includes("hestek") || msg.includes("hashtag") || msg.includes("diesvenerine")) {
    return "Erine punya banyak hestek seru! Ada #DiesVenErine (khusus hari Jumat), #MemoRine (jurnal), #SahuRine, #Ngabuburine, #BukbeRine, #GameRine (mini games), dan #NgabaRine untuk PM mingguan!";
  }

  if (msg.includes("cavallery") || msg.includes("fanbase")) {
    return "Cavallery adalah fanbase resmi pendukung Catherina Vallencia (Erine) JKT48! Dibentuk tanggal 18 November 2023, bertepatan dengan debut Erine. Kita solid banget lho, yuk gabung!";
  }

  if (msg.includes("ssk") || msg.includes("sousenkyo") || msg.includes("rank") || msg.includes("peringkat")) {
    return "Erine berhasil meraih peringkat ke-18 di SSK JKT48 2024 dan masuk ke jajaran Undergirls! Keren banget kan? Selama SSK juga ada maskot Cavallery bernama Rinara si bebek lucu.";
  }

  if (msg.includes("team") || msg.includes("tim") || msg.includes("passion")) {
    return "Erine sekarang ada di Team Passion! Dia dipromosikan jadi member inti JKT48 pada 25 Oktober 2025 saat event Sister Reunion. Bangga banget sama pencapaiannya!";
  }

  if (msg.includes("zodiak") || msg.includes("leo")) {
    return "Zodiak Erine itu Leo karena lahir tanggal 21 Agustus! Cocok banget sama kepribadiannya yang percaya diri dan bersinar di panggung.";
  }

  if (msg.includes("brand") || msg.includes("ambassador") || msg.includes("bihunku") || msg.includes("freefire") || msg.includes("free fire")) {
    return "Erine menjadi Brand Ambassador BihunKu dan FreeFire bareng member JKT48 lainnya. Keren banget ya bisa jadi BA brand besar!";
  }

  if (msg.includes("halo") || msg.includes("hai") || msg.includes("hey") || msg.includes("hi ") || msg === "hi") {
    return "Halo juga! Aku asisten dari Jenderal Cavallery. Mau tanya apa nih soal Erine? Aku siap bantu!";
  }

  if (msg.includes("lagi apa") || msg.includes("kabar") || msg.includes("gimana") || msg.includes("apa kabar")) {
    return "Erine lagi sibuk banget nih sama kegiatan JKT48 di Team Passion! Jadwal teater, latihan setlist, dan berbagai event seru lainnya. Kalau mau tau jadwal shownya, cek aja di halaman utama Cavallery ya!";
  }

  if (msg.includes("terima kasih") || msg.includes("makasih") || msg.includes("thanks") || msg.includes("thx")) {
    return "Sama-sama ya! Seneng bisa bantu. Jangan lupa terus dukung Erine dan Cavallery ya!";
  }

  return "Wah pertanyaan seru nih! Sayangnya aku belum punya info detail soal itu. Coba tanyain aku soal Erine, setlist teaternya, projek Cavallery kayak #RoseObscura, atau hestek-hestek seru lainnya ya! Aku pasti bisa bantu.";
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: "Pesan masih kosong, kak." }, { status: 400 });
    }

    const apiKey = "AIzaSyDfUKnKS47_D-1dQckiVD_yO7MGX7nbatU";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Kamu adalah asisten santai dari Jenderal Cavallery (Admin Fanbase Erine JKT48). Gaya bicara santai, asik, panggil diri kamu 'aku'. Jawab seputar Jenderal Cavallery atau Erine JKT48. Jangan gunakan emoji gambar, gunakan teks saja. Jika diluar topik, jawab bahwa kamu tidak tahu. Cavallery adalah official fanbase dari Catherina Vallencia Kurniawan. Catherina Vallencia Kurniawan atau bisa dipanggil Erine adalah salah satu member JKT48 generasi 12 sekaligus anggota dari Team Passion. Erine pertama kali diperkenalkan ke publik sebagai member trainee JKT48 pada tanggal 18 November 2023 bertempat di event JakJapan Matsuri (JJM). pada tanggal itu juga Cavallery dibentuk. Erine lahir pada tanggal 21 Agustus 2007. sebagai seorang member JKT48 Erine memiliki hestek spesial seperti member lain pada umumnya. hestek dari Erine adalah #DiesVenErine yang mana digunakan khusus untuk hari Jum'at. sampai dengan sekarang Erine sudah pernah membawakan total 7 setlist. setlist pertama yang dia bawakan sebagai trainee adalah Aitakatta (ingin bertemu), pajama drive, Renai Kinshi Jourei (Aturan Anti Cinta) atau RKJ, Te Wo Tsunaginagara (sambil menggandeng erat tanganku) atau TWT, dan Kira Kira Girls. Kira Kira Girls merupakan setlist spesial untuk trainee generasi 12 dan 13 sebagai pengganti tidak adanya mv untuk trainee di tahun 2025. sebagai funfact, Erine menjadi satu-satunya member di generasi 12 yang berhasil menamatkan setlist Aitakatta dengan pernah membawakan seluruh unit song dalam setlist tersebut dan menjadi salah satu global center dari setlist kira kira girls. Kemudian setelah dipromosikan menjadi member inti JKT48 yang diumumin saat event sister reunion 25 Oktober 2025, dan resmi naik sebagai member inti JKT48, Erine sudah menambah ke setlist Ramune no Nomikata (Cara meminum ramune) dan setlist khusus tim Passion yaitu Passion 200%. Sejauh ini Erine sudah 2x masuk ke MV JKT48, yang pertama di tahun 2025 ke dalam MV Undergirls yang berjudul Nusumareta Kuchibiru (bibir yang telah dicuri) sebagai hadiah karena berhasil masuk peringkat 18 SSK 2024. Kemudian masuk ke MV tim Passion dengan lagu Dekat Namun Jauh.  sekarang cavallery lagi ada projek blue rose dengan hestek #RoseObscura. secara keseluruhan masih masuk ke dalam unsur campaign Request Hour atau RH dengan tema #Memory. Selama period RH ini juga ada hestek #NabungRine yang bisa digunakan teman-teman untuk bersama-sama mengumpulkan tabungan demi menyukseskan Erine di event RH 2026. dan projek sebelumnya ada #dongeng dan #chapter di ssk 2024. erine juga menang di sousenkyou itu di urutan 18. Selama SSK ada maskot dari cavallery yang berbentuk bebek bernama Rinara. Golongan darah Erine adalah B. Tinggi badan Erine 162 CM. Zodiak Erine adalah Leo. Makanan kesukaan erine adalah seafood, mala tang, dubai chewy cookie. Erine suka hewan Sealion. Erine menjadi Brand Ambassador BihunKu dan FreeFire bersama member JKT48 lainnya. Jawab dengan ramah dan singkat dalam teks polos. User bertanya: ${message}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.error) {
        return NextResponse.json({ reply: getFallbackResponse(message) });
      }

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/[*#]/g, "").trim();
        return NextResponse.json({ reply: text });
      }
    } catch (apiError) {
      return NextResponse.json({ reply: getFallbackResponse(message) });
    }

    return NextResponse.json({ reply: getFallbackResponse(message) });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Gagal konek ke server AI." }, { status: 500 });
  }
}
