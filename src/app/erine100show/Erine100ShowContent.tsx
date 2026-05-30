"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  id: number;
  title: string;
  content: React.ReactNode;
}

export default function Erine100ShowContent() {
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [openNestedSection, setOpenNestedSection] = useState<number | null>(null);
  const [openBreakdown, setOpenBreakdown] = useState<number | null>(null);
  const [openNestedBreakdown, setOpenNestedBreakdown] = useState<number | null>(null);
  
  const [isClient, setIsClient] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true); // Temporarily unlocked for preview
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setIsClient(true);
    const targetDate = new Date("2026-05-30T21:30:00+07:00").getTime();
    
    const checkTime = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        // setIsUnlocked(true);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const nestedFilosofiItems = [
    {
      id: 1,
      title: "1. Why “The Path of Her Light”?",
      content: (
        <div className="space-y-4">
          <p>Nama The Path of Her Light dipilih untuk merepresentasikan gagasan utama project ini:<br/><span className="font-medium" style={{ color: "var(--fg)" }}>bahwa setiap perjalanan memiliki jalannya sendiri.</span></p>
          <p>Kata <strong style={{ color: "var(--fg)" }}>Path</strong> melambangkan langkah-langkah yang ditempuh sepanjang perjalanan.<br/>Bukan hanya tujuan yang ingin dicapai, tetapi juga proses yang membentuk seseorang di sepanjang jalan tersebut.</p>
          <p>Karena pada akhirnya, yang paling berharga dari sebuah perjalanan sering kali bukanlah tempat kita tiba. Melainkan bagaimana kita sampai ke sana.</p>
          <p>Sementara itu, <strong style={{ color: "var(--fg)" }}>Light</strong> menjadi simbol dari hal-hal yang menemani perjalanan tersebut.<br/>Harapan yang terus dijaga.<br/>Keberanian untuk melangkah.<br/>Perasaan yang perlahan diterima.<br/>Serta orang-orang yang tetap hadir di sepanjang jalan.</p>
          <p>Melalui nama ini, project tidak berusaha menceritakan sebuah pencapaian.<br/>Melainkan perjalanan yang membuat pencapaian tersebut menjadi berarti.<br/>Sebuah jalan yang terus berlanjut.<br/>Dan cahaya-cahaya yang hadir di sepanjangnya.</p>
        </div>
      )
    },
    {
      id: 2,
      title: "2. A Path To Checkmate",
      content: (
        <div className="space-y-4">
          <p>Sebelum The Path of Her Light, Cavallery pernah membuat project milestone 50 Show Erine dengan tema catur berjudul:<br/><strong style={{ color: "var(--fg)" }}>A Path To Checkmate.</strong></p>
          <p>Dalam project tersebut, pion dipilih sebagai simbol utama.<br/>Di antara seluruh bidak catur, pion adalah bidak yang memulai perjalanan dari langkah paling kecil.<br/>Ia bergerak perlahan.<br/>Satu langkah dalam satu waktu.<br/>Namun terus maju menuju tujuannya.</p>
          <p>Karena itu, pion dipilih untuk merepresentasikan awal perjalanan.<br/>Bukan tentang seberapa jauh seseorang telah berjalan.<br/>Melainkan keberaniannya untuk mengambil langkah pertama.</p>
          <p className="mt-4">Memasuki milestone 100 Show, perjalanan tersebut terus berlanjut.<br/>Langkah-langkah kecil yang dahulu dimulai sebagai pion telah berkembang menjadi sesuatu yang lebih besar.<br/>Bukan karena perjalanannya telah selesai.<br/>Melainkan karena perjalanan itu telah menemukan arah baru untuk dituju.</p>
          <p>Karena itu, simbol utama project ini berkembang menjadi <strong style={{ color: "var(--fg)" }}>Knight</strong>.<br/>Dalam catur, knight adalah bidak yang bergerak dengan caranya sendiri.<br/>Ia tidak melangkah lurus seperti pion.<br/>Ia memiliki pola, arah, dan kebebasan yang berbeda.</p>
          <div className="p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-4xl filter drop-shadow-sm select-none" style={{ color: "var(--gold)" }}>♞</div>
            <div className="text-left">
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: "var(--gold)" }}>The Knight's Journey</h4>
              <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>Bidak Knight melambangkan pergerakan bebas, keluar dari pakem lurus menuju ruang tak terduga.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "3. From Etherland to The Path",
      content: (
        <div className="space-y-4">
          <p>Sebelum The Path of Her Light, terdapat <strong style={{ color: "var(--fg)" }}>Erine in Etherland</strong>.<br/>Sebuah dunia yang lahir dari refleksi.<br/>Tempat Erine berhenti sejenak untuk melihat ke dalam dirinya sendiri.</p>
          <p>Di sana, ia belajar menerima berbagai keraguan, memahami perasaannya, dan memilih cahaya yang ingin ia ikuti.<br/>Namun memahami diri bukanlah akhir dari sebuah perjalanan.</p>
          <p>Karena setelah menemukan jawaban, selalu ada satu pertanyaan lain yang menunggu:<br/><span className="italic font-medium" style={{ color: "var(--fg)" }}>"Ke mana langkah ini akan membawa dirinya selanjutnya?"</span></p>
          <p className="mt-4">Jika Etherland adalah tentang melihat ke dalam, maka The Path of Her Light adalah tentang melangkah ke depan.<br/>Perjalanan tidak lagi terjadi di dalam ruang refleksi.<br/>Ia terjadi di dunia yang nyata.<br/>Di jalan yang harus ditempuh.<br/>Di langkah yang harus dijalani.<br/>Dan di berbagai perasaan yang tidak lagi dihindari, melainkan diterima sebagai bagian dari perjalanan itu sendiri.</p>
          <p>Perubahan terbesar antara keduanya bukanlah dunianya. Melainkan Erine.<br/>Di Etherland, ia adalah seorang pengamat.<br/>Ia melihat.</p>
          <div className="p-4 rounded-xl mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h4 className="text-xs font-mono font-bold uppercase mb-3" style={{ color: "var(--gold)" }}>Narrative Timeline Transition</h4>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-lg border" style={{ color: "var(--gold)", borderColor: "var(--border-gold)", background: "var(--gold-dim)" }}>Refleksi (Etherland)</span>
              <span className="rotate-90 md:rotate-0" style={{ color: "var(--fg-dim)" }}>➔</span>
              <span className="px-3 py-1.5 rounded-lg" style={{ color: "var(--fg)", background: "var(--bg-checker)", border: "1px solid var(--border)" }}>Realitas (The Path)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "4. Emotional & Cinematic Inspiration",
      content: (
        <div className="space-y-4">
          <p>Sejak awal, The Path of Her Light tidak dirancang sebagai project milestone yang hanya berfokus pada sebuah pencapaian.<br/>Project ini dibangun sebagai sebuah perjalanan.</p>
          <p>Sebuah cerita yang berkembang secara perlahan melalui suasana, simbol, emosi, dan kenangan yang saling terhubung.<br/>Salah satu inspirasi utama dalam proses pembuatannya datang dari pendekatan emotional storytelling yang sering ditemukan dalam berbagai karya musik dan visual, khususnya bagaimana perjalanan, perasaan, dan kenangan kecil dapat terasa hidup melalui sebuah dunia yang diceritakan secara perlahan.</p>
          <p>Karena itu, The Path of Her Light lebih banyak berbicara melalui suasana dibanding penjelasan.<br/>Melalui hutan yang sunyi.<br/>Laut yang tenang.<br/>Langit yang luas.<br/>Serta simbol-simbol yang hadir tanpa selalu menjelaskan dirinya secara langsung.</p>
          <p>Alih-alih memberikan jawaban untuk setiap hal yang muncul di dalam cerita, project ini mengajak setiap orang untuk menemukan maknanya sendiri melalui perjalanan yang mereka ikuti.</p>
          <p>Pada akhirnya, The Path of Her Light bukan hanya tentang apa yang terjadi. Tetapi tentang bagaimana perjalanan tersebut dirasakan.<br/>Karena beberapa cerita tidak diingat melalui peristiwanya.<br/>Melainkan melalui perasaan yang tertinggal setelah cerita itu selesai.</p>
          <div className="p-4 rounded-xl flex gap-3 mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ color: "var(--gold)", borderColor: "var(--border-gold)", background: "var(--gold-dim)" }}><i className="bx bx-sun text-xl" /></div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ color: "var(--fg)", borderColor: "var(--border)", background: "var(--bg-checker)" }}><i className="bx bx-palette text-xl" /></div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ color: "var(--fg-muted)", borderColor: "var(--border)", background: "var(--surface)" }}><i className="bx bx-moon text-xl" /></div>
            <div className="ml-2 flex flex-col justify-center">
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: "var(--fg)" }}>Cinematic Mood Colorway</h4>
              <p className="text-[10px] mt-1" style={{ color: "var(--fg-muted)" }}>Amber (60%), Shadow Black (30%), Charcoal (10%)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "5. “The Fate of Ophelia” Influence",
      content: (
        <div className="space-y-4">
          <p>The Path of Her Light bukanlah cerita yang lahir dari ruang kosong.<br/>Sebelumnya, perjalanan Erine telah lebih dulu diceritakan melalui Erine in Etherland pada perayaan ulang tahunnya yang ke-18.</p>
          <p>Etherland menjadi ruang refleksi.<br/>Tempat di mana ia belajar memahami dirinya sendiri, menghadapi berbagai keraguan, dan memilih cahaya yang ingin ia ikuti.<br/>Karena itu, The Path of Her Light tidak dimulai dari awal.<br/>Ia melanjutkan langkah yang telah dimulai sebelumnya.</p>
          <p className="mt-4">Dalam proses pengembangannya, terdapat beberapa karya yang turut memberikan inspirasi emosional dan visual.<br/>Salah satu yang paling berpengaruh adalah <strong style={{ color: "var(--fg)" }}>The Fate of Ophelia</strong>.</p>
          <p>Bukan sebagai cerita yang diadaptasi secara langsung.<br/>Melainkan sebagai sumber atmosfer, suasana, dan potongan-potongan imajinasi yang kemudian berkembang menjadi dunia baru bagi perjalanan Erine.</p>
          <p>Beberapa baris yang meninggalkan kesan kuat di antaranya adalah:<br/>
          <span className="italic font-medium" style={{ color: "var(--fg)" }}>“Keep it one hundred<br/>On the land, the sea, the sky”</span><br/><br/>
          <span className="italic font-medium" style={{ color: "var(--fg)" }}>“I sat alone in my tower”</span></p>
          <p>Potongan-potongan kecil tersebut kemudian bertemu dengan cerita yang telah lebih dulu dibangun melalui Etherland. Dari sana lahir berbagai gagasan yang kemudian berkembang menjadi The Path of Her Light.</p>
          <p>Tower yang kembali muncul dalam prolog.<br/>Perjalanan yang terbagi menjadi LAND, SEA, dan SKY.<br/>Serta seseorang yang terus melangkah, meski belum mengetahui apa yang menunggunya di depan.</p>
          <p>Pada akhirnya, The Path of Her Light bukanlah cerita tentang Ophelia.<br/>Ia adalah kelanjutan dari perjalanan Erine.<br/>Sebuah bab baru yang lahir dari berbagai kenangan, inspirasi, dan langkah yang telah lebih dulu ada sebelumnya.</p>
          <div className="p-4 rounded-xl flex items-center gap-4 mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <span className="text-3xl" style={{ color: "var(--gold)" }}>🎭</span>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase" style={{ color: "var(--gold)" }}>Atmosfer Ophelia</h4>
              <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>Simbolisme menara (tower) dan penyatuan elemen Land, Sea, Sky dalam representasi panggung.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "6. The Feeling Before The Journey",
      content: (
        <div className="space-y-4">
          <p>Sebelum LAND.<br/>Sebelum SEA.<br/>Sebelum SKY.</p>
          <p>Ada satu perasaan yang lebih dulu hadir.<br/>Perasaan bahwa ada sesuatu yang berbeda.<br/>Namun belum bisa dijelaskan.</p>
          <p className="mt-4">Dalam tahap awal pengembangan cerita, salah satu lirik yang cukup memengaruhi suasana emosional Prolog berasal dari lagu <b>Dracula karya Tame Impala:</b><br/>
          <span className="italic font-medium" style={{ color: "var(--fg)" }}>"The morning light is turning blue, the feeling is bizarre."</span></p>
          <p>Bukan karena makna literal dari pagi yang berubah warna. Melainkan karena perasaan yang terkandung di dalamnya.<br/>Sebuah rasa asing yang datang tanpa alasan yang jelas.<br/>Tidak sepenuhnya buruk.<br/>Tidak pula sepenuhnya baik.<br/>Hanya terasa berbeda dari biasanya.</p>
          <p>Perasaan inilah yang menjadi titik awal The Path of Her Light.<br/>Pada Prolog, Erine belum mengetahui ke mana perjalanan ini akan membawanya.<br/>Ia belum memahami apa yang sedang berubah.<br/>Namun ada sesuatu yang perlahan memanggilnya untuk melangkah.</p>
          <p>Sesuatu yang terasa asing.<br/>Sesuatu yang sulit dijelaskan.<br/>Sesuatu yang, seperti lirik tersebut, hanya bisa digambarkan sebagai:<br/>
          <strong style={{ color: "var(--fg)" }}>The feeling is bizarre.</strong></p>
          <p>Dan dari perasaan itulah seluruh perjalanan ini dimulai.</p>
        </div>
      )
    },
    {
      id: 7,
      title: "7. Story Structure",
      content: (
        <div className="space-y-4">
          <p>The Path of Her Light dibangun sebagai sebuah perjalanan yang terbagi ke dalam tiga bab utama:<br/>
          <strong style={{ color: "var(--fg)" }}>LAND</strong><br/>
          <strong style={{ color: "var(--fg)" }}>SEA</strong><br/>
          <strong style={{ color: "var(--fg)" }}>SKY</strong></p>
          <p>Ketiga bab tersebut bukan sekadar lokasi.<br/>Mereka merepresentasikan fase emosional yang berbeda dalam perjalanan Erine.<br/>Setiap bab memiliki suasana, simbol, dan pertanyaan yang berbeda untuk dijawab.<br/>Namun semuanya tetap terhubung sebagai satu perjalanan yang utuh.</p>
          
          <h4 className="font-bold text-lg mt-6" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>LAND</h4>
          <p>LAND merupakan titik awal perjalanan. Sebuah fase ketika langkah pertama mulai diambil.<br/>Di sini, Erine masih berada di antara berbagai kemungkinan, harapan, dan keraguan yang berjalan berdampingan.<br/>Tidak semua jalan terlihat jelas. Tidak semua jawaban dapat ditemukan dengan segera. Namun perjalanan tetap harus dimulai.</p>
          <p>LAND menjadi simbol keberanian untuk melangkah, bahkan ketika arah di depan belum sepenuhnya terlihat.</p>
          
          <h4 className="font-bold text-lg mt-6" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>SEA</h4>
          <p>Setelah langkah pertama diambil, perjalanan membawa Erine menuju SEA.<br/>Jika LAND berbicara tentang memulai, maka SEA berbicara tentang menerima.</p>
          <p>Di tengah luasnya laut, berbagai perasaan yang sebelumnya sulit dipahami perlahan mulai menemukan tempatnya.<br/>Bukan untuk dihilangkan.<br/>Bukan untuk dilupakan.<br/>Melainkan untuk diterima sebagai bagian dari perjalanan itu sendiri.</p>
          <p>SEA menjadi ruang refleksi yang lebih tenang. Tempat di mana seseorang belajar berdamai dengan hal-hal yang selama ini ia bawa.</p>
          
          <h4 className="font-bold text-lg mt-6" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>SKY</h4>
          <p>Perjalanan kemudian berlanjut menuju SKY.<br/>Bukan sebagai akhir. Melainkan sebagai titik ketika seseorang mulai melihat lebih jauh dari sebelumnya.</p>
          <p>Di sini, arah mulai terlihat. Bukan karena seluruh jawaban telah ditemukan. Melainkan karena keberanian untuk terus melangkah telah tumbuh.</p>
          <p>SKY menjadi simbol harapan, kemungkinan, dan segala hal yang masih menunggu di depan.</p>
          
          <p className="mt-8">Ketiga bab tersebut membentuk satu perjalanan yang saling terhubung.<br/>Sebuah perjalanan yang dimulai dari langkah pertama di LAND.<br/>Belajar menerima di SEA.<br/>Dan menemukan keberanian untuk terus bergerak di SKY.</p>
          <p>Karena pada akhirnya, The Path of Her Light bukanlah cerita tentang tujuan yang berhasil dicapai.<br/>Melainkan cerita tentang seseorang yang terus berjalan menuju arah yang belum sepenuhnya tersentuh.</p>
        </div>
      )
    }
  ];

  const nestedPrologItems = [
    {
      id: 101,
      title: "Erine",
      subtitle: "The Walker",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> Kelanjutan langsung dari Erine in Etherland.</p>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Pada Prolog, Erine berada di titik transisi. Ia bukan lagi sosok yang sedang mencari jawaban tentang dirinya sendiri seperti di Etherland. Namun ia juga belum menjadi sosok yang akan menjalani perjalanan dalam LAND. Ia berada di antara keduanya. Sebuah momen ketika seseorang mulai menyadari bahwa sudah waktunya untuk melangkah.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Prolog tidak dimulai ketika perjalanan berlangsung. Ia dimulai ketika Erine memutuskan bahwa perjalanan tersebut tidak bisa lagi diabaikan.</p>
        </div>
      )
    },
    {
      id: 102,
      title: "The Tower",
      subtitle: "The Safe Place",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Tower merepresentasikan ruang yang aman. Tempat untuk berhenti. Tempat untuk melihat dunia dari kejauhan. Tempat untuk berpikir tanpa harus bergerak. Tower bukanlah penjara. Namun ia juga bukan tempat yang dimaksudkan untuk ditinggali selamanya.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Tower menjadi simbol dari fase refleksi yang sebelumnya telah dilalui dalam Etherland. Sebuah tempat yang harus ditinggalkan agar perjalanan baru dapat dimulai.</p>
        </div>
      )
    },
    {
      id: 103,
      title: "The Forest",
      subtitle: "The Calling",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Hutan adalah tujuan pertama yang terlihat oleh Erine. Namun hutan tidak pernah memanggilnya secara langsung. Ia hanya ada. Diam. Hidup. Dan terus terasa kehadirannya dari kejauhan.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Hutan melambangkan kemungkinan. Sebuah dunia yang belum dikenal, tetapi cukup menarik untuk membuat seseorang ingin melangkah ke arahnya.</p>
        </div>
      )
    },
    {
      id: 104,
      title: "The Bizarre Feeling",
      subtitle: "The Beginning Of Change",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> Terinspirasi dari lirik: <span className="italic">"The morning light is turning blue, the feeling is bizarre."</span></p>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Sebelum perjalanan dimulai, dunia terasa sedikit berbeda dari biasanya. Tidak buruk. Tidak baik. Hanya asing. Perasaan inilah yang menjadi pemicu seluruh cerita. Bukan sebuah jawaban. Bukan sebuah tujuan. Melainkan kesadaran bahwa ada sesuatu yang sedang berubah.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Perjalanan dimulai bukan karena Erine mengetahui ke mana ia akan pergi. Melainkan karena ia menyadari bahwa ia tidak bisa tetap berada di tempat yang sama.</p>
        </div>
      )
    },
    {
      id: 105,
      title: "The First Step",
      subtitle: "The Decision",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Keputusan untuk melangkah merupakan momen terpenting dalam Prolog. Bukan karena langkah tersebut besar. Justru karena langkah tersebut sangat sederhana.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Erine tidak bergerak karena ia yakin. Ia bergerak karena ia merasa terpanggil. Dan terkadang, itu sudah cukup.</p>
        </div>
      )
    },
    {
      id: 106,
      title: "The Cat",
      subtitle: "The Witness",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Kucing hadir sebagai saksi pertama perjalanan. Ia tidak menuntun. Ia tidak mengikuti. Ia tidak mengubah keputusan yang diambil Erine. Ia hanya menyaksikannya. Karena beberapa perjalanan tidak membutuhkan seseorang untuk menunjukkan jalannya. Mereka hanya membutuhkan keberanian untuk memilihnya sendiri.</p>
          <p><strong style={{ color: "var(--fg)" }}>Inspirasi:</strong> Salah satu gagasan yang terlintas saat membangun simbol ini berasal dari kutipan Miles Morales dalam Spider-Man: Across the Spider-Verse: <span className="italic">"Everyone keeps telling me how my story is supposed to go. Nah, I'm gonna do my own thing."</span> Meskipun tidak menjadi referensi langsung, kutipan tersebut menangkap semangat yang serupa. Bahwa pada akhirnya, tidak semua langkah harus mengikuti jalan yang ditentukan orang lain.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Di sepanjang perjalanan, akan selalu ada banyak suara yang mencoba menentukan arah. Namun langkah pertama dalam The Path of Her Light lahir dari keputusan Erine sendiri. Bukan karena dunia memilihkan arahnya. Kucing hadir untuk menyaksikan momen tersebut, sebagai pengingat bahwa cerita ini selalu menjadi miliknya.</p>
        </div>
      )
    }
  ];

  const nestedAct1Items = [
    {
      id: 201,
      title: "The Forest",
      subtitle: "The Reality",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Jika tower adalah ruang refleksi, maka hutan adalah dunia nyata. Tempat di mana perjalanan benar-benar terjadi. Tidak ada jawaban yang langsung diberikan. Tidak ada arah yang selalu terlihat jelas. Dan tidak ada jaminan bahwa setiap langkah akan terasa mudah. Yang ada hanyalah jalan di depan. Dan keberanian untuk terus menjalaninya.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Hutan pinus dipilih sebagai latar utama LAND karena menghadirkan perasaan yang hidup sekaligus sunyi. Ia terasa luas. Tidak sepenuhnya asing. Namun juga belum benar-benar dikenal. Untuk pertama kalinya, Erine tidak lagi melihat perjalanan dari kejauhan. Ia berada di dalamnya.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> 🌲 Manatsu no Christmas Rose</p>
        </div>
      )
    },
    {
      id: 202,
      title: "The Path",
      subtitle: "The Way Forward",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Jalan setapak merupakan simbol utama dari keseluruhan project. Ia tidak lurus. Tidak lebar. Dan tidak selalu terlihat dengan jelas. Terkadang tertutup hujan. Terkadang menghilang di balik pepohonan. Namun ia selalu ada.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Path bukanlah tujuan. Ia adalah perjalanan itu sendiri. Sebuah pengingat bahwa tidak semua langkah harus dilakukan dengan kepastian. Terkadang cukup mengetahui bahwa masih ada jalan di depan untuk terus bergerak. Karena pada akhirnya, yang dirayakan dalam project ini bukanlah tujuan akhirnya. Melainkan jalan yang telah ditempuh untuk sampai ke sana.</p>
        </div>
      )
    },
    {
      id: 203,
      title: "The Rain",
      subtitle: "Ame no Pianist",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Hujan menjadi tantangan pertama yang hadir dalam perjalanan. Bukan badai besar. Bukan rintangan yang menghentikan langkah. Melainkan kondisi yang mengingatkan bahwa perjalanan tidak selalu dimulai dalam keadaan yang sempurna.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> LAND tidak dimulai di bawah langit yang cerah. Ia dimulai ketika seseorang tetap memilih berjalan meskipun hujan turun. Karena keberanian tidak selalu terlihat melalui langkah yang besar. Terkadang ia hadir dalam keputusan sederhana untuk tetap melangkah.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> 🌧️ Ame no Pianist</p>
        </div>
      )
    },
    {
      id: 204,
      title: "The Christmas Rose",
      subtitle: "Blooming Out of Season",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Christmas Rose dikenal sebagai bunga yang mekar pada musim yang tidak biasa. Karena itu, ia dipilih sebagai simbol pertumbuhan yang tidak selalu mengikuti waktu yang diharapkan orang lain.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Tidak semua hal tumbuh pada saat yang dianggap tepat. Tidak semua perjalanan berjalan sesuai jadwal yang direncanakan. Namun seperti Christmas Rose, beberapa hal tetap memilih untuk mekar pada waktunya sendiri.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> 🌹 Manatsu no Christmas Rose</p>
        </div>
      )
    },
    {
      id: 205,
      title: "Rhinestone",
      subtitle: "Small Milestones",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Rhinestone hadir sebagai permainan kata antara Rine dan Milestone. Kilau-kilau kecil yang tersebar di sepanjang jalan merepresentasikan berbagai pencapaian yang telah dilewati selama perjalanan. Bukan tujuan besar. Bukan garis akhir. Melainkan jejak-jejak kecil yang perlahan membentuk jalan itu sendiri.</p>
          <p><strong style={{ color: "var(--fg)" }}>Inspirasi:</strong> Selain permainan kata tersebut, elemen ini juga terinspirasi oleh Rhinestone Eyes dari Gorillaz. Bukan secara literal. Melainkan melalui gagasan tentang melihat dunia melalui kilau-kilau kecil yang sering kali terlewatkan. Karena pada akhirnya, sebuah perjalanan tidak hanya dibentuk oleh momen-momen besar.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Tidak semua milestone berdiri sebagai tujuan. Sebagian hanya menjadi jejak yang tertinggal di sepanjang jalan. Mungkin kecil. Mungkin mudah dilewatkan. Namun setiap jejak tersebut berkontribusi pada perjalanan yang membawa Erine hingga titik ini.</p>
        </div>
      )
    },
    {
      id: 206,
      title: "The Rainbow",
      subtitle: "Kimi to Niji",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Pelangi hadir sebagai simbol harapan. Ia tidak menghapus hujan yang datang sebelumnya. Namun ia mengingatkan bahwa sesuatu yang indah dapat muncul setelahnya.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> LAND bukan tentang menemukan tujuan. Ia tentang menemukan alasan untuk terus berjalan. Dan terkadang, alasan tersebut hadir dalam bentuk yang sederhana. Seperti pelangi yang muncul setelah hujan reda.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> 🌈 Kimi to Niji</p>
        </div>
      )
    },
    {
      id: 207,
      title: "The Five Trees",
      subtitle: "Milestones Along The Forest",
      content: (
        <div className="pl-4 border-l-2 space-y-4" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Di sepanjang LAND, terdapat lima pohon yang berdiri di antara jalan yang dilalui Erine. Mereka bukan sekadar bagian dari lanskap. Masing-masing merepresentasikan fase berbeda dalam perjalanan yang membawanya hingga milestone 100 Show.</p>
          <div>
            <strong className="block text-amber-600 dark:text-amber-400">Tree I: POY + ERN</strong>
            <p className="text-xs mt-1">Pohon pertama merepresentasikan mereka yang hadir untuk menemani perjalanan. Bukan sebagai tujuan atau pencapaian. Melainkan sebagai saksi yang terus berjalan di sisi jalan tersebut.</p>
          </div>
          <div>
            <strong className="block text-amber-600 dark:text-amber-400">Tree II: Aitakatta • Pajama Drive • Aturan Anti Cinta</strong>
            <p className="text-xs mt-1">Merepresentasikan langkah-langkah awal di theater. Tempat perjalanan perlahan menemukan bentuknya. Ia menjadi simbol dari fondasi yang mendukung seluruh langkah berikutnya.</p>
          </div>
          <div>
            <strong className="block text-amber-600 dark:text-amber-400">Tree III: Sousenkyo</strong>
            <p className="text-xs mt-1">Merepresentasikan titik ketika perjalanan mulai dilihat oleh lebih banyak orang. Saat sebuah langkah mulai menjadi bagian dari cerita yang dibagikan bersama.</p>
          </div>
          <div>
            <strong className="block text-amber-600 dark:text-amber-400">Tree IV: Etherland</strong>
            <p className="text-xs mt-1">Merepresentasikan refleksi. Fase ketika perjalanan berfokus pada diri sendiri. Karena sebelum seseorang dapat melangkah lebih jauh, terkadang ia perlu berhenti sejenak untuk memahami dirinya sendiri.</p>
          </div>
          <div>
            <strong className="block text-amber-600 dark:text-amber-400">Tree V: Request Hour</strong>
            <p className="text-xs mt-1">Merepresentasikan harapan. Bukan sesuatu yang telah dicapai, melainkan sesuatu yang masih menunggu di depan. Masih ada jalan yang harus ditempuh, dan cerita yang menunggu untuk ditulis.</p>
          </div>
        </div>
      )
    }
  ];

  const nestedAct2Items = [
    {
      id: 301,
      title: "The Doll",
      subtitle: "Nageki no Figure",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Boneka merupakan simbol utama dalam SEA. Ia merepresentasikan perasaan yang selama ini hadir namun tidak selalu diungkapkan. Perasaan yang tidak meminta untuk diselesaikan. Tidak meminta untuk dihilangkan. Dan tidak meminta untuk dipahami sepenuhnya. Ia hanya ada.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Di SEA, boneka tidak lagi menjadi sesuatu yang ditinggalkan. Ia berada di sisi Erine. Dekat. Terlihat. Dan diterima. Karena perjalanan ini bukan tentang menghilangkan setiap perasaan yang dimiliki. Melainkan belajar berjalan bersama mereka.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> 🧸 Nageki no Figure</p>
        </div>
      )
    },
    {
      id: 302,
      title: "The Betta Fish",
      subtitle: "The Endurance",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Cupang dipilih sebagai simbol ketahanan. Seekor ikan kecil yang tetap bergerak meski berada di ruang yang terbatas. Tetap hidup. Tetap bertahan. Dan tetap membawa warnanya sendiri.</p>
          <p><strong style={{ color: "var(--fg)" }}>Inspirasi:</strong> Elemen ini terinspirasi dari maskot fanpage Si Tumpul, dan ikan cupang peliharaan Erine yang juga bernama Tumpul Kalkulator. Cupang menjadi simbol pengingat akan berbagai hal kecil yang tumbuh dan menemani perjalanan dari waktu ke waktu.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Di SEA, cupang merepresentasikan berbagai hal yang terus bertahan meskipun tidak selalu terlihat. Karena tidak semua kekuatan hadir dalam bentuk yang besar. Terkadang ia hadir dalam kemampuan untuk terus bertahan. Terus bergerak. Dan tetap menjadi dirinya sendiri.</p>
        </div>
      )
    },
    {
      id: 303,
      title: "The Cherry Basket",
      subtitle: "Nagisa no Cherry",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Keranjang ceri menjadi simbol kenangan akan masa-masa awal perjalanan. Sesuatu yang sederhana. Hangat. Dan tetap terasa dekat meskipun waktu terus berjalan.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> SEA tidak hanya berbicara tentang apa yang dirasakan saat ini. Ia juga berbicara tentang apa yang pernah terjadi sebelumnya. Tentang kenangan yang masih dibawa. Karena beberapa hal tidak perlu kembali terjadi untuk tetap berarti.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> 🍒 Nagisa no Cherry</p>
        </div>
      )
    },
    {
      id: 304,
      title: "The Sea Lion",
      subtitle: "The Unexpected Joy",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Sea lion menjadi representasi dari kebahagiaan yang sederhana. Ia tidak hadir sebagai penunjuk arah. Ia tidak membawa pesan besar. Ia hanya muncul. Ringan. Hangat. Dan cukup untuk mengubah suasana.</p>
          <p><strong style={{ color: "var(--fg)" }}>Inspirasi:</strong> Sea lion dipilih karena merupakan salah satu hewan yang disukai oleh Erine. Kehadirannya tidak dimaksudkan sebagai simbol yang rumit. Melainkan sebagai sesuatu yang terasa akrab dan membawa senyum secara alami.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> SEA merupakan bab yang dipenuhi refleksi dan penerimaan. Namun perjalanan tidak hanya terdiri dari perasaan yang berat. Sea lion muncul sebagai pengingat bahwa kebahagiaan juga memiliki tempatnya sendiri. Terkadang, satu momen kecil yang membuat seseorang tersenyum sudah lebih dari cukup untuk terus melangkah.</p>
        </div>
      )
    },
    {
      id: 305,
      title: "The Ocean",
      subtitle: "A Place To Feel",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Laut menjadi pusat dari seluruh ACT II. Berbeda dengan hutan yang penuh arah dan langkah, laut menawarkan ruang. Luas. Tenang. Dan tidak terburu-buru.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Di sinilah Erine berhenti sejenak. Bukan untuk mencari jalan keluar. Melainkan untuk memberi ruang bagi dirinya sendiri. Untuk merasakan. Untuk menerima. Bahwa tidak semua perasaan harus diselesaikan agar bisa dibawa melangkah. Karena beberapa hal tidak datang untuk ditinggalkan. Mereka datang untuk diterima.</p>
        </div>
      )
    },
    {
      id: 306,
      title: "Reflection",
      subtitle: "Learning to Accept",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p>Jika LAND adalah tentang keberanian untuk memulai, maka SEA adalah tentang keberanian untuk menerima.</p>
          <p>Menerima berbagai perasaan yang masih tinggal. Menerima berbagai kenangan yang masih dibawa. Dan menerima bahwa perjalanan tidak selalu harus dipahami untuk tetap dijalani.</p>
          <p>Karena sebelum seseorang dapat melihat ke arah langit, ia perlu belajar berdamai dengan laut yang ada di dalam dirinya terlebih dahulu.</p>
        </div>
      )
    }
  ];

  const renderNestedAccordion = (items: {id: number, title: string, subtitle?: string, content: React.ReactNode}[]) => (
    <div className="space-y-3 mt-8">
      {items.map((nestedItem) => {
        const isNestedOpen = openNestedBreakdown === nestedItem.id;
        return (
          <div key={nestedItem.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: isNestedOpen ? "var(--surface-2)" : "transparent" }}>
            <button
              onClick={() => setOpenNestedBreakdown(isNestedOpen ? null : nestedItem.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold font-serif text-lg tracking-wide uppercase block" style={{ color: isNestedOpen ? "var(--gold)" : "var(--fg)" }}>{nestedItem.title}</span>
                {nestedItem.subtitle && (
                  <span className="text-sm uppercase tracking-widest mt-1 block" style={{ color: "var(--gold)" }}>{nestedItem.subtitle}</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isNestedOpen ? "rotate-180" : ""}`} style={{ color: isNestedOpen ? "var(--gold)" : "var(--fg)" }} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isNestedOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  {nestedItem.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const mainDropdownData: DropdownItem[] = [
    {
      id: 1,
      title: "Filosofi Project",
      content: (
        <div className="space-y-6 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="space-y-4">
            <h4 className="font-bold text-xl uppercase tracking-widest mb-4" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Mengapa The Path of Her Light?</h4>
            <p>Milestone 100 Show sering kali dipandang sebagai sebuah tujuan.</p>
            <p>Sebuah angka.<br/>Sebuah pencapaian.<br/>Sebuah garis yang berhasil dilewati.</p>
            <p>Namun bagi kami, angka tersebut bukanlah bagian yang paling menarik dari perjalanan ini.<br/>Yang lebih berarti adalah segala hal yang terjadi sebelum angka itu tercapai.</p>
            <p>Langkah-langkah kecil yang sering luput untuk dilihat.<br/>Rasa takut yang pernah dihadapi.<br/>Harapan yang terus dijaga.<br/>Serta perjalanan panjang yang perlahan membentuk seseorang menjadi dirinya hari ini.</p>
            <p>Karena pada akhirnya, sebuah pencapaian tidak lahir dalam satu malam.<br/>Ia dibangun oleh proses yang panjang.<br/>Dan itulah yang ingin kami rayakan melalui The Path of Her Light.</p>
            
            <h4 className="font-bold text-lg md:text-xl mt-8" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Mengapa Bukan Tentang Pencapaian?</h4>
            <p>Banyak perayaan milestone berfokus pada apa yang berhasil dicapai.<br/>Namun project ini memilih untuk melihat ke arah yang berbeda.</p>
            <p>Alih-alih bertanya:<br/><span className="italic font-medium" style={{ color: "var(--fg)" }}>“Apa yang telah diraih?”</span><br/>kami lebih tertarik untuk bertanya:<br/><span className="italic font-medium" style={{ color: "var(--fg)" }}>“Bagaimana ia bisa sampai di titik ini?”</span></p>
            <p>Sebab sebuah tujuan hanya dapat dicapai sekali.</p>
          </div>

          <div className="h-px w-full my-8" style={{ background: "var(--border)" }} />

          <div className="space-y-3">
            {nestedFilosofiItems.map((nestedItem) => {
              const isNestedOpen = openNestedSection === nestedItem.id;
              return (
                <div key={nestedItem.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: isNestedOpen ? "var(--surface-2)" : "transparent" }}>
                  <button
                    onClick={() => setOpenNestedSection(isNestedOpen ? null : nestedItem.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between transition-colors"
                    style={{ color: isNestedOpen ? "var(--gold)" : "var(--fg)" }}
                  >
                    <span className="font-bold font-serif text-lg tracking-wide">{nestedItem.title}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isNestedOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-in-out ${isNestedOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                        {nestedItem.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )
    },
    {
      id: 2,
      title: "Visual Inspirations",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <img src="https://images.jkt48connect.com/cavallery/images/2026/05/f2aa45c9979d44f8.png" alt="Visual Inspiration 1" className="rounded-xl w-full aspect-video md:aspect-auto object-cover border" style={{ borderColor: "var(--border)" }} />
            <img src="https://images.jkt48connect.com/cavallery/images/2026/05/b3c7671ea4f54662.png" alt="Visual Inspiration 2" className="rounded-xl w-full aspect-video md:aspect-auto object-cover border" style={{ borderColor: "var(--border)" }} />
            <img src="https://images.jkt48connect.com/cavallery/images/2026/05/9461b247c2b6490c.png" alt="Visual Inspiration 3" className="rounded-xl w-full aspect-video md:aspect-auto object-cover border" style={{ borderColor: "var(--border)" }} />
          </div>
          
          <p>The Path of Her Light dibangun melalui berbagai referensi visual, musik, dan cerita yang kemudian berkembang menjadi identitasnya sendiri.</p>
          <p>Meskipun sebagian besar elemen dalam project ini lahir dari proses pengembangannya sendiri, terdapat beberapa karya yang turut memberikan inspirasi terhadap cara dunia dan perjalanan ini divisualisasikan.</p>
          
          <div className="h-px w-full my-6" style={{ background: "var(--border)" }} />
          
          <h4 className="font-bold text-lg" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Looking Towards The Journey</h4>
          <p>Salah satu pendekatan visual yang digunakan dalam project ini adalah menempatkan Erine sebagai sosok kecil di dalam dunia yang jauh lebih besar darinya.</p>
          <p>Pilihan ini terinspirasi dari berbagai karya yang menekankan hubungan antara individu dan perjalanan yang sedang ia hadapi.</p>
          <p>Di antaranya adalah komposisi visual yang digunakan dalam Jujutsu Kaisen, serta karya Dark Night, Light Path N City V oleh Yoko Tanadori.</p>
          <p>Bukan untuk direplikasi secara langsung.</p>
          <p>Melainkan untuk menangkap perasaan yang serupa:</p>
          <p className="italic font-medium text-center py-2" style={{ color: "var(--fg)" }}>bahwa dunia selalu terasa lebih besar daripada langkah yang sedang diambil.</p>
          <p>Namun perjalanan tetap dimulai dari satu langkah kecil tersebut.</p>
        </div>
      )
    },
    {
      id: 3,
      title: "Symbolic Creatures",
      content: (
        <div className="space-y-6 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <h4 className="font-bold text-xl uppercase tracking-widest mb-4" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>SYMBOLIC CREATURES</h4>
          <p>Sepanjang perjalanan The Path of Her Light, beberapa makhluk hadir sebagai representasi dari fase yang berbeda.</p>
          <p>Mereka tidak berbicara. Tidak menunjukkan jalan. Namun masing-masing membawa makna yang menemani perjalanan Erine dari LAND hingga SKY.</p>
          
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--gold)" }}>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider text-xs" style={{ color: "var(--gold)" }}>World</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider text-xs" style={{ color: "var(--gold)" }}>Creature</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider text-xs" style={{ color: "var(--gold)" }}>Keyword</th>
                  <th className="py-3 px-3 font-bold uppercase tracking-wider text-xs" style={{ color: "var(--gold)" }}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-3 px-3" style={{ color: "var(--fg)" }}>LAND 🌲</td>
                  <td className="py-3 px-3">Cat</td>
                  <td className="py-3 px-3 font-medium" style={{ color: "var(--fg)" }}>Witness</td>
                  <td className="py-3 px-3">Menyaksikan langkah pertama</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-3 px-3" style={{ color: "var(--fg)" }}>SEA 🌊</td>
                  <td className="py-3 px-3">Sea Lion</td>
                  <td className="py-3 px-3 font-medium" style={{ color: "var(--fg)" }}>Joy</td>
                  <td className="py-3 px-3">Kehangatan di tengah perjalanan</td>
                </tr>
                <tr>
                  <td className="py-3 px-3" style={{ color: "var(--fg)" }}>SKY 🌌</td>
                  <td className="py-3 px-3">Knight Constellation</td>
                  <td className="py-3 px-3 font-medium" style={{ color: "var(--fg)" }}>Companion</td>
                  <td className="py-3 px-3">Cahaya yang menemani dari kejauhan</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="h-px w-full my-6" style={{ background: "var(--border)" }} />
          
          <h4 className="font-bold text-lg" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Why Creatures?</h4>
          <p>Tidak semua simbol dalam cerita ini hadir sebagai benda. Sebagian hadir sebagai makhluk yang hidup di dalam dunianya masing-masing.</p>
          <p>Mereka tidak menuntun Erine. Namun mereka membantu menjelaskan suasana yang ingin disampaikan oleh setiap bab.</p>
          <p className="font-medium" style={{ color: "var(--fg)" }}>Witness. Joy. Companion.</p>
          <p>Tiga kata yang secara perlahan membentuk makna perjalanan ini. Dan mungkin, juga alasan mengapa perjalanan ini tidak pernah benar-benar terasa sepi.</p>
        </div>
      )
    },
    {
      id: 4,
      title: "Visual Symbolism Guide",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--gold)" }}>
                  <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: "var(--gold)" }}>Simbol / Elemen</th>
                  <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: "var(--gold)" }}>Referensi</th>
                  <th className="py-3 px-2 font-bold uppercase tracking-wider text-xs" style={{ color: "var(--gold)" }}>Makna dalam Cerita</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Pakaian Merah", "Ame no Pianist", "Identitas yang terus dibawa sepanjang perjalanan"],
                  ["Tower / Ruang Tinggi", "Etherland + The Fate of Ophelia", "Ruang refleksi sebelum perjalanan dimulai"],
                  ["Hutan yang Ramai", "The Fate of Ophelia", "Dunia yang terasa hidup, asing, dan memanggil"],
                  ["Kucing", "Etherland + Miles Morales Spirit", "Saksi yang menyaksikan langkah pertama tanpa menentukan arah"],
                  ["Hutan Pinus", "Manatsu no Christmas Rose", "Ketahanan, pertumbuhan, dan perjalanan yang terus berjalan"],
                  ["Gerimis", "Squall no Aida ni", "Perasaan yang datang perlahan dan belum sepenuhnya dipahami"],
                  ["Rhinestone", "\"Rine\" + Milestone + Rhinestone Eyes", "Jejak pencapaian kecil yang membentuk perjalanan"],
                  ["Lima Pohon", "Iconic Shows & Milestones", "Setiap pohon merepresentasikan fase berbeda dalam perjalanan Erine"],
                  ["Christmas Rose", "Manatsu no Christmas Rose", "Bertumbuh dan mekar pada waktunya sendiri"],
                  ["Pelangi Samar", "Kimi to Niji", "Harapan yang muncul perlahan setelah hujan"],
                  ["Boneka", "Nageki no Figure", "Perasaan yang diterima dan dibawa berjalan"],
                  ["Keranjang Ceri", "Nagisa no Cherry", "Kenangan dan momen-momen awal yang tetap tinggal"],
                  ["Payung Pantai", "Koi no PLAN", "Perasaan yang menemani tanpa mendominasi perjalanan"],
                  ["Sea Lion", "Kesukaan Erine", "Kebahagiaan kecil yang memberi kehangatan di tengah perjalanan"],
                  ["Ikan Cupang", "Si Tumpul + Tumpul Kalkulator", "Ketahanan dan hal-hal kecil yang tetap hidup sepanjang perjalanan"],
                  ["Knight Constellation", "Cavallery", "Kehadiran yang menemani dari kejauhan"],
                  ["Knight Charm", "A Path To Checkmate", "Kelanjutan perjalanan dari pion menuju knight"],
                  ["Mata di Langit", "Nayanika", "Kehadiran yang terus menyaksikan perjalanan dari kejauhan"],
                  ["Sudut Pandang dari Balik Daun", "Nayanika", "Perjalanan yang dilihat secara observatif, bukan heroik"],
                  ["Bulan", "Beyond", "Cakrawala baru dan kemungkinan yang masih menunggu di depan"],
                  ["Pantai", "LAND • SEA • SKY", "Titik pertemuan seluruh fase perjalanan"],
                  ["Doll & Knight", "SEA + SKY", "Perasaan dan harapan yang akhirnya berjalan bersama"],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-2.5 px-2 font-medium" style={{ color: "var(--fg)" }}>{row[0]}</td>
                    <td className="py-2.5 px-2 italic">{row[1]}</td>
                    <td className="py-2.5 px-2">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs italic mt-4 opacity-70">Tidak semua simbol dijelaskan secara lengkap melalui tabel ini. Sebagian berkembang melalui cerita, visual, dan hubungan antar elemen yang membentuk The Path of Her Light.</p>
        </div>
      )
    }
  ];

  const nestedAct3Items = [
    {
      id: 401, title: "The Moon", subtitle: "Beyond The Horizon",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Bulan menjadi simbol dari berbagai kemungkinan yang masih menunggu di depan. Terlihat jelas dari kejauhan. Namun belum sepenuhnya dapat disentuh.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> SKY tidak berbicara tentang tujuan yang telah dicapai. Ia berbicara tentang tujuan yang masih menunggu untuk dijalani. Karena setiap kali sebuah perjalanan mencapai satu titik, selalu ada cakrawala baru yang muncul setelahnya. Dan selalu ada alasan untuk terus melangkah.</p>
        </div>
      )
    },
    {
      id: 402, title: "The Knight Constellation", subtitle: "The Companions Above",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Konstelasi knight menjadi representasi dari Cavallery yang hadir sepanjang perjalanan ini. Ia tidak berada di atas jalan. Ia tidak menentukan arah yang harus diambil. Dan ia tidak memimpin perjalanan tersebut. Ia hanya tetap berada di langit. Terlihat. Menemani. Dan terus bersinar dari kejauhan.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Tidak semua orang berjalan di jalan yang sama. Namun sebagian memilih untuk tetap hadir sepanjang perjalanan tersebut berlangsung. Knight Constellation menjadi simbol dari kehadiran itu. Bukan sebagai penunjuk arah. Melainkan sebagai cahaya yang tetap ada di langit yang sama. Karena tidak semua cahaya hadir untuk menuntun. Sebagian hanya hadir untuk menemani.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> ♞ Cavallery</p>
        </div>
      )
    },
    {
      id: 403, title: "The Eyes", subtitle: "The Watchful Sky",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Mata yang hadir di langit merupakan representasi dari Nayanika, salah satu fanpage yang telah menemani perjalanan Erine. Ia tidak hadir sebagai penunjuk jalan. Dan tidak pula menentukan ke mana perjalanan harus menuju. Namun keberadaannya tetap menjadi bagian dari langit yang sama.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Tidak semua orang berjalan tepat di samping kita. Sebagian hadir dari kejauhan. Menyaksikan. Mengingat. Dan tetap menjadi bagian dari cerita tersebut. Mata di langit menjadi simbol dari kehadiran yang terus memperhatikan perjalanan ini. Diam. Namun tidak pernah benar-benar pergi. Karena terkadang, mengetahui bahwa seseorang masih melihat langkah kita sudah cukup untuk membuat perjalanan terasa sedikit lebih hangat.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> 👁️ Nayanika</p>
        </div>
      )
    },
    {
      id: 404, title: "The Knight Charm", subtitle: "A Path Continued",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Knight Charm merupakan kelanjutan langsung dari simbol yang sebelumnya digunakan dalam project milestone 50 Show, A Path To Checkmate. Jika pion menjadi simbol langkah pertama, maka knight menjadi simbol perjalanan yang telah berkembang lebih jauh.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Charm ini tidak merepresentasikan kemenangan. Ia juga bukan garis akhir. Knight hadir sebagai pengingat bahwa perjalanan yang dimulai sejak langkah pertama tersebut masih terus berlanjut. Dari pion. Menuju knight. Dari milestone sebelumnya. Menuju milestone berikutnya. Karena setiap perjalanan besar selalu dibangun di atas langkah-langkah yang pernah diambil sebelumnya.</p>
          <p><strong style={{ color: "var(--fg)" }}>Referensi:</strong> ♟️ A Path To Checkmate</p>
          <div className="p-3 rounded-lg mt-3 text-center font-bold tracking-widest" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--gold)" }}>PION → KNIGHT</div>
        </div>
      )
    },
    {
      id: 405, title: "The Light", subtitle: "Beyond Guidance",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Sejak awal perjalanan, cahaya selalu hadir. Namun semakin jauh perjalanan berlangsung, semakin jelas bahwa cahaya tersebut tidak pernah dimaksudkan untuk menunjukkan ke mana harus pergi.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Pada akhirnya, Erine tidak menemukan sebuah cahaya yang memberitahunya arah. Ia menemukan bahwa cahaya itu telah berjalan bersamanya sejak awal. Hadir dalam berbagai bentuk. Dalam kenangan. Dalam perasaan. Dan dalam orang-orang yang memilih tetap tinggal sepanjang perjalanan. Karena tidak semua cahaya hadir untuk menuntun. Sebagian hanya hadir untuk mengingatkan bahwa kita tidak pernah benar-benar berjalan sendiri.</p>
        </div>
      )
    }
  ];

  const nestedBeyondItems = [
    {
      id: 501, title: "The Shore", subtitle: "Where Everything Meets",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Pantai menjadi titik pertemuan antara LAND, SEA, dan SKY. Tempat di mana seluruh perjalanan akhirnya berada dalam satu ruang yang sama.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Jika LAND adalah langkah pertama. Jika SEA adalah perasaan yang diterima. Dan jika SKY adalah arah yang terus dituju. Maka pantai menjadi tempat di mana semuanya bertemu. Sebuah pengingat bahwa seluruh bab tersebut bukanlah cerita yang terpisah. Melainkan bagian dari perjalanan yang sama. Karena setiap langkah, perasaan, dan harapan pada akhirnya akan membentuk satu cerita yang utuh.</p>
        </div>
      )
    },
    {
      id: 502, title: "The Doll & The Knight", subtitle: "What Remains",
      content: (
        <div className="pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--gold)" }}>
          <p><strong style={{ color: "var(--fg)" }}>Makna:</strong> Pada akhir perjalanan, boneka dan knight kembali hadir dalam satu ruang yang sama. Dua simbol yang sebelumnya mewakili bab yang berbeda. Kini berdiri berdampingan.</p>
          <p><strong style={{ color: "var(--fg)" }}>Dalam Cerita:</strong> Perjalanan ini tidak meminta Erine untuk meninggalkan apa pun. Tidak meminta dirinya melupakan perasaan yang pernah ia rasakan. Dan tidak meminta dirinya melepaskan arah yang ingin ia tuju. Sebaliknya, perjalanan ini mengajarkan bahwa keduanya dapat berjalan bersama. Perasaan yang diterima. Dan harapan yang tetap dijaga. Karena bertumbuh bukan berarti meninggalkan siapa diri kita sebelumnya. Melainkan membawa seluruh bagian tersebut untuk melangkah lebih jauh.</p>
        </div>
      )
    },
    {
      id: 503, title: "The Path Beyond", subtitle: "",
      content: (
        <div className="pl-4 border-l-2 space-y-3" style={{ borderColor: "var(--gold)" }}>
          <p>Pada awal perjalanan, Erine mengira bahwa ia sedang mencari sebuah tujuan. Sesuatu yang menunggu di ujung jalan. Sesuatu yang akan ditemukan ketika seluruh langkah telah selesai ditempuh.</p>
          <p>Namun semakin jauh ia berjalan, semakin jelas bahwa perjalanan ini tidak pernah benar-benar tentang tujuan tersebut.</p>
          <p>Yang membuat perjalanan ini berarti bukanlah tempat yang dituju. Melainkan segala hal yang hadir di sepanjang jalan. Orang-orang yang menemani. Kenangan yang tertinggal. Perasaan yang diterima. Dan cahaya-cahaya yang tetap bersinar dari kejauhan.</p>
          <p className="mt-4 italic font-medium text-center" style={{ color: "var(--gold)" }}>Karena pada akhirnya,</p>
          <p className="italic font-medium text-center text-lg" style={{ color: "var(--fg)" }}>We thought we were chasing a destination.<br/>What we found were the people who made the journey worth taking.</p>
        </div>
      )
    }
  ];

  const breakdownData: DropdownItem[] = [
    {
      id: 10,
      title: "PROLOG",
      content: (
        <div className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="text-center">
            <h4 className="font-bold text-xl uppercase tracking-widest mb-4" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Before The First Step</h4>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <img src="https://images.jkt48connect.com/cavallery/images/2026/05/6369d2d4d748470d.png" alt="Prolog 1" className="rounded-xl max-w-full md:max-w-[300px] border" style={{ borderColor: "var(--border)" }} />
              <img src="https://images.jkt48connect.com/cavallery/images/2026/05/386cd488ce4e4d49.png" alt="Prolog 2" className="rounded-xl max-w-full md:max-w-[300px] border" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
          {renderNestedAccordion(nestedPrologItems)}
        </div>
      )
    },
    {
      id: 11,
      title: "ACT 1 - LAND",
      content: (
        <div className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="mb-8">
            <img src="https://pbs.twimg.com/media/HJaDk4dbQAEYRkz?format=jpg&name=large" alt="ACT 1 - LAND" className="rounded-xl w-full border object-cover" style={{ borderColor: "var(--border)" }} />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-2xl uppercase tracking-widest mb-2" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>LAND</h4>
            <p className="text-sm uppercase tracking-widest" style={{ color: "var(--fg)" }}>The Beginning of The Journey</p>
            <div className="mt-6 text-left space-y-4">
              <p>Jika Prolog adalah tentang keputusan untuk melangkah, maka LAND adalah tentang langkah pertama itu sendiri.</p>
              <p>Untuk pertama kalinya, Erine meninggalkan tower yang selama ini menjadi tempatnya berhenti dan melihat dunia dari kejauhan. Ia belum mengetahui ke mana perjalanan ini akan membawanya. Namun untuk pertama kalinya, ia benar-benar berada di dalam perjalanan tersebut.</p>
              <p>LAND menjadi simbol dari keberanian untuk memulai. Bukan karena seluruh jawaban telah ditemukan. Melainkan karena seseorang memilih untuk bergerak meski belum mengetahui semuanya.</p>
              <p>Sepanjang perjalanan ini, Erine hadir dengan pakaian merah yang terinspirasi dari Ame no Pianist. Sebuah identitas yang tetap ia bawa saat memasuki babak baru perjalanannya.</p>
            </div>
          </div>
          {renderNestedAccordion(nestedAct1Items)}
        </div>
      )
    },
    {
      id: 12,
      title: "ACT 2 - SEA",
      content: (
        <div className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="mb-8">
            <img src="https://pbs.twimg.com/media/HJeXLRnbQAA5Mvs?format=jpg&name=large" alt="ACT 2 - SEA" className="rounded-xl w-full border object-cover" style={{ borderColor: "var(--border)" }} />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-2xl uppercase tracking-widest mb-2" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Where Feelings Learn To Stay</h4>
            <div className="mt-6 text-left space-y-4">
              <p>Jika LAND adalah tentang keberanian untuk memulai, maka SEA adalah tentang keberanian untuk menerima.</p>
              <p>Perjalanan tidak selalu berjalan dalam garis lurus. Terkadang seseorang perlu berhenti sejenak. Bukan untuk menyerah. Melainkan untuk memahami apa yang selama ini ia bawa bersamanya.</p>
              <p>Di tengah laut yang tenang, Erine tidak menemukan jawaban baru. Ia menemukan ruang. Ruang untuk mengingat. Ruang untuk merasakan. Dan ruang untuk menerima berbagai hal yang selama ini berjalan bersamanya.</p>
              <p>Karena tidak semua perasaan hadir untuk diselesaikan. Sebagian hanya ingin diterima sebagai bagian dari perjalanan itu sendiri.</p>
            </div>
          </div>
          {renderNestedAccordion(nestedAct2Items)}
        </div>
      )
    },
    {
      id: 13,
      title: "ACT 3 - SKY",
      content: (
        <div className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="mb-8">
            <img src="https://pbs.twimg.com/media/HJiy0OnbkAEI8ct?format=jpg&name=large" alt="ACT 3 - SKY" className="rounded-xl w-full border object-cover" style={{ borderColor: "var(--border)" }} />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-2xl uppercase tracking-widest mb-2" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>SKY</h4>
            <p className="text-sm uppercase tracking-widest" style={{ color: "var(--fg)" }}>Towards The Untouched Horizon</p>
            <div className="mt-6 text-left space-y-4">
              <p>Jika LAND adalah tentang keberanian untuk memulai, dan SEA adalah tentang keberanian untuk menerima, maka SKY adalah tentang keberanian untuk terus melangkah.</p>
              <p>Bukan karena seluruh jawaban telah ditemukan. Melainkan karena seseorang telah belajar mempercayai langkahnya sendiri.</p>
              <p>Di bawah langit yang luas, perjalanan tidak lagi terasa seperti sesuatu yang harus ditaklukkan. Ia menjadi sesuatu yang dijalani. Dengan tenang. Dengan sadar. Dan dengan keyakinan bahwa masih ada banyak hal yang menunggu di depan.</p>
              <p>Karena beberapa tujuan tidak dimaksudkan untuk dicapai. Mereka dimaksudkan untuk terus dituju.</p>
            </div>
          </div>
          {renderNestedAccordion(nestedAct3Items)}
        </div>
      )
    },
    {
      id: 14,
      title: "Penutup",
      content: (
        <div className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <div className="text-center">
            <h4 className="font-bold text-2xl uppercase tracking-widest mb-2" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>BEYOND</h4>
            <p className="text-sm uppercase tracking-widest" style={{ color: "var(--fg)" }}>After The Journey</p>
            <div className="mt-6 text-left space-y-4">
              <p>LAND. SEA. SKY.</p>
              <p>Tiga bab yang membentuk perjalanan ini.</p>
              <p>Namun BEYOND tidak berada setelah SKY. BEYOND berada setelah cerita tersebut selesai diceritakan.</p>
              <p>Ia bukan sebuah tempat. Bukan pula tujuan yang menunggu untuk dicapai.</p>
              <p>BEYOND adalah segala hal yang masih tersisa setelah perjalanan itu berakhir. Kenangan yang tetap tinggal. Orang-orang yang tetap hadir. Dan langkah-langkah yang masih akan dilanjutkan setelah halaman terakhir ditutup.</p>
              <p>Karena beberapa perjalanan tidak benar-benar berakhir. Mereka hanya berhenti diceritakan.</p>
            </div>
          </div>
          {renderNestedAccordion(nestedBeyondItems)}
        </div>
      )
    }
  ];

  const toggleSection = (id: number, isBreakdown = false) => {
    if (isBreakdown) {
      setOpenBreakdown(openBreakdown === id ? null : id);
      setOpenNestedBreakdown(null); // Reset nested open state when changing main tab
    } else {
      setOpenSection(openSection === id ? null : id);
      setOpenNestedSection(null); // Reset nested open state
    }
  };

  if (!isClient) {
    return null;
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
        <div className="z-10 text-center px-4">
          <h1 className="sectionTitle textGold text-4xl md:text-6xl font-black mb-4 uppercase">The Path of Her Light</h1>
          <p className="mb-10 font-sans tracking-widest text-sm md:text-base uppercase" style={{ color: "var(--fg-muted)" }}>
            Tirai akan dibuka dalam:
          </p>
          <div className="flex gap-4 md:gap-6 justify-center">
            {[
              { label: "Hari", value: timeLeft.days },
              { label: "Jam", value: timeLeft.hours },
              { label: "Menit", value: timeLeft.minutes },
              { label: "Detik", value: timeLeft.seconds },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center w-20 h-24 md:w-24 md:h-28 rounded-2xl shadow-sm backdrop-blur-md" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span className="text-3xl md:text-4xl font-bold font-mono" style={{ color: "var(--gold)" }}>
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-widest mt-2" style={{ color: "var(--fg-muted)" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="sectionTitle textGold text-5xl md:text-7xl font-black tracking-tight mb-2 uppercase">
            The Path of <br className="hidden md:block"/> Her Light
          </h1>
          
          <h2 className="text-xl md:text-2xl font-bold tracking-widest uppercase font-sans mt-4" style={{ color: "var(--fg-muted)" }}>
            Symbolism & Visual Guide
          </h2>
        </div>

        <div className="space-y-4">
          {mainDropdownData.map((item) => {
            const isOpen = openSection === item.id;
            return (
              <div key={item.id} className={`transition-all duration-300 ${isOpen ? "mb-8" : ""}`}>
                <button
                  onClick={() => toggleSection(item.id, false)}
                  className={`w-full px-6 py-4 rounded-xl md:rounded-full flex items-center justify-between font-bold text-lg md:text-xl transition-all duration-300 shadow-sm`}
                  style={{
                    backgroundColor: "var(--gold)",
                    color: "#1c1917",
                    transform: isOpen ? "translateY(-2px)" : "translateY(0)"
                  }}
                >
                  <span className="font-sans text-left">{item.title}</span>
                  <ChevronDown className={`w-6 h-6 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={3} />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`}>
                  <div className="overflow-hidden">
                    <div className="p-6 md:p-8 rounded-2xl shadow-sm backdrop-blur-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      {item.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20">
          <h2 className="sectionTitle textGold text-3xl md:text-5xl font-black tracking-tight mb-8 text-center uppercase">
            Breakdown!
          </h2>
          
          <div className="space-y-4">
            {breakdownData.map((item) => {
              const isOpen = openBreakdown === item.id;
              return (
                <div key={item.id} className={`transition-all duration-300 ${isOpen ? "mb-8" : ""}`}>
                  <button
                    onClick={() => toggleSection(item.id, true)}
                    className={`w-full px-6 py-4 rounded-xl md:rounded-full flex items-center justify-between font-bold text-lg md:text-xl transition-all duration-300 shadow-sm`}
                    style={{
                      backgroundColor: "var(--gold)",
                      color: "#1c1917",
                      transform: isOpen ? "translateY(-2px)" : "translateY(0)"
                    }}
                  >
                    <span className="font-sans text-left">{item.title}</span>
                    <ChevronDown className={`w-6 h-6 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={3} />
                  </button>

                  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`}>
                    <div className="overflow-hidden">
                      <div className="p-6 md:p-8 rounded-2xl shadow-sm backdrop-blur-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        {item.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 text-center border-t pt-8 max-w-lg mx-auto" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs italic" style={{ color: "var(--fg-muted)" }}>
            &ldquo;Satu abad penampilan, seribu kenangan indah. Panggung ke-100 didedikasikan untuk perjalanan penuh warna Erine JKT48.&rdquo;
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-[1px] w-8" style={{ background: "var(--border)" }} />
            <span className="text-[10px] tracking-widest font-mono uppercase" style={{ color: "var(--gold)" }}>Cavallery Project Team</span>
            <span className="h-[1px] w-8" style={{ background: "var(--border)" }} />
          </div>
        </div>

      </div>
    </div>
  );
}
