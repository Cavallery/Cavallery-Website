"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  id: number;
  title: string;
  content: React.ReactNode;
  visualTemplate?: "chess" | "timeline" | "cinematic" | "theater";
}

export default function Erine100ShowContent() {
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [isClient, setIsClient] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setIsClient(true);
    // Jam 21:30 pada tanggal 30 Mei 2026 waktu lokal (+07:00)
    const targetDate = new Date("2026-05-30T21:30:00+07:00").getTime();
    
    const checkTime = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setIsUnlocked(true);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    checkTime(); // Initial check
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const dropdownData: DropdownItem[] = [
    {
      id: 1,
      title: "Filosofi Project",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <h4 className="font-bold text-lg md:text-xl" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Mengapa The Path of Her Light?</h4>
          <p>Milestone 100 Show sering kali dipandang sebagai sebuah tujuan.</p>
          <p>Sebuah angka.<br/>Sebuah pencapaian.<br/>Sebuah garis yang berhasil dilewati.</p>
          <p>Namun bagi kami, angka tersebut bukanlah bagian yang paling menarik dari perjalanan ini.<br/>Yang lebih berarti adalah segala hal yang terjadi sebelum angka itu tercapai.</p>
          <p>Langkah-langkah kecil yang sering luput untuk dilihat.<br/>Rasa takut yang pernah dihadapi.<br/>Harapan yang terus dijaga.<br/>Serta perjalanan panjang yang perlahan membentuk seseorang menjadi dirinya hari ini.</p>
          <p>Karena pada akhirnya, sebuah pencapaian tidak lahir dalam satu malam.<br/>Ia dibangun oleh proses yang panjang.<br/>Dan itulah yang ingin kami rayakan melalui The Path of Her Light.</p>
          
          <div className="h-px w-full my-6" style={{ background: "var(--border)" }} />
          
          <h4 className="font-bold text-lg md:text-xl" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>Mengapa Bukan Tentang Pencapaian?</h4>
          <p>Banyak perayaan milestone berfokus pada apa yang berhasil dicapai.<br/>Namun project ini memilih untuk melihat ke arah yang berbeda.</p>
          <p>Alih-alih bertanya:<br/><span className="italic font-medium" style={{ color: "var(--fg)" }}>“Apa yang telah diraih?”</span><br/>kami lebih tertarik untuk bertanya:<br/><span className="italic font-medium" style={{ color: "var(--fg)" }}>“Bagaimana ia bisa sampai di titik ini?”</span></p>
          <p>Sebab sebuah tujuan hanya dapat dicapai sekali.</p>
        </div>
      )
    },
    {
      id: 2,
      title: "Why “The Path of Her Light”?",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <p>Nama The Path of Her Light dipilih untuk merepresentasikan gagasan utama project ini:<br/><span className="font-medium" style={{ color: "var(--fg)" }}>bahwa setiap perjalanan memiliki jalannya sendiri.</span></p>
          <p>Kata <strong style={{ color: "var(--fg)" }}>Path</strong> melambangkan langkah-langkah yang ditempuh sepanjang perjalanan.<br/>Bukan hanya tujuan yang ingin dicapai, tetapi juga proses yang membentuk seseorang di sepanjang jalan tersebut.</p>
          <p>Karena pada akhirnya, yang paling berharga dari sebuah perjalanan sering kali bukanlah tempat kita tiba. Melainkan bagaimana kita sampai ke sana.</p>
          <p>Sementara itu, <strong style={{ color: "var(--fg)" }}>Light</strong> menjadi simbol dari hal-hal yang menemani perjalanan tersebut.<br/>Harapan yang terus dijaga.<br/>Keberanian untuk melangkah.<br/>Perasaan yang perlahan diterima.<br/>Serta orang-orang yang tetap hadir di sepanjang jalan.</p>
          <p>Melalui nama ini, project tidak berusaha menceritakan sebuah pencapaian.<br/>Melainkan perjalanan yang membuat pencapaian tersebut menjadi berarti.<br/>Sebuah jalan yang terus berlanjut.<br/>Dan cahaya-cahaya yang hadir di sepanjangnya.</p>
        </div>
      )
    },
    {
      id: 3,
      title: "A Path To Checkmate",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <p>Sebelum The Path of Her Light, Cavallery pernah membuat project milestone 50 Show Erine dengan tema catur berjudul:<br/><strong style={{ color: "var(--fg)" }}>A Path To Checkmate.</strong></p>
          <p>Dalam project tersebut, pion dipilih sebagai simbol utama.<br/>Di antara seluruh bidak catur, pion adalah bidak yang memulai perjalanan dari langkah paling kecil.<br/>Ia bergerak perlahan.<br/>Satu langkah dalam satu waktu.<br/>Namun terus maju menuju tujuannya.</p>
          <p>Karena itu, pion dipilih untuk merepresentasikan awal perjalanan.<br/>Bukan tentang seberapa jauh seseorang telah berjalan.<br/>Melainkan keberaniannya untuk mengambil langkah pertama.</p>
          
          <div className="h-px w-full my-5" style={{ background: "var(--border)" }} />
          
          <p>Memasuki milestone 100 Show, perjalanan tersebut terus berlanjut.<br/>Langkah-langkah kecil yang dahulu dimulai sebagai pion telah berkembang menjadi sesuatu yang lebih besar.<br/>Bukan karena perjalanannya telah selesai.<br/>Melainkan karena perjalanan itu telah menemukan arah baru untuk dituju.</p>
          <p>Karena itu, simbol utama project ini berkembang menjadi <strong style={{ color: "var(--fg)" }}>Knight</strong>.<br/>Dalam catur, knight adalah bidak yang bergerak dengan caranya sendiri.<br/>Ia tidak melangkah lurus seperti pion.<br/>Ia memiliki pola, arah, dan kebebasan yang berbeda.</p>
        </div>
      ),
      visualTemplate: "chess"
    },
    {
      id: 4,
      title: "From Etherland to The Path",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <p>Sebelum The Path of Her Light, terdapat <strong style={{ color: "var(--fg)" }}>Erine in Etherland</strong>.<br/>Sebuah dunia yang lahir dari refleksi.<br/>Tempat Erine berhenti sejenak untuk melihat ke dalam dirinya sendiri.</p>
          <p>Di sana, ia belajar menerima berbagai keraguan, memahami perasaannya, dan memilih cahaya yang ingin ia ikuti.<br/>Namun memahami diri bukanlah akhir dari sebuah perjalanan.</p>
          <p>Karena setelah menemukan jawaban, selalu ada satu pertanyaan lain yang menunggu:<br/><span className="italic font-medium" style={{ color: "var(--fg)" }}>"Ke mana langkah ini akan membawa dirinya selanjutnya?"</span></p>
          
          <div className="h-px w-full my-5" style={{ background: "var(--border)" }} />
          
          <p>Jika Etherland adalah tentang melihat ke dalam, maka The Path of Her Light adalah tentang melangkah ke depan.<br/>Perjalanan tidak lagi terjadi di dalam ruang refleksi.<br/>Ia terjadi di dunia yang nyata.<br/>Di jalan yang harus ditempuh.<br/>Di langkah yang harus dijalani.<br/>Dan di berbagai perasaan yang tidak lagi dihindari, melainkan diterima sebagai bagian dari perjalanan itu sendiri.</p>
          
          <div className="h-px w-full my-5" style={{ background: "var(--border)" }} />
          
          <p>Perubahan terbesar antara keduanya bukanlah dunianya. Melainkan Erine.<br/>Di Etherland, ia adalah seorang pengamat.<br/>Ia melihat.</p>
        </div>
      ),
      visualTemplate: "timeline"
    },
    {
      id: 5,
      title: "Emotional & Cinematic Inspiration",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <p>Sejak awal, The Path of Her Light tidak dirancang sebagai project milestone yang hanya berfokus pada sebuah pencapaian.<br/>Project ini dibangun sebagai sebuah perjalanan.</p>
          <p>Sebuah cerita yang berkembang secara perlahan melalui suasana, simbol, emosi, dan kenangan yang saling terhubung.<br/>Salah satu inspirasi utama dalam proses pembuatannya datang dari pendekatan emotional storytelling yang sering ditemukan dalam berbagai karya musik dan visual, khususnya bagaimana perjalanan, perasaan, dan kenangan kecil dapat terasa hidup melalui sebuah dunia yang diceritakan secara perlahan.</p>
          <p>Karena itu, The Path of Her Light lebih banyak berbicara melalui suasana dibanding penjelasan.<br/>Melalui hutan yang sunyi.<br/>Laut yang tenang.<br/>Langit yang luas.<br/>Serta simbol-simbol yang hadir tanpa selalu menjelaskan dirinya secara langsung.</p>
          <p>Alih-alih memberikan jawaban untuk setiap hal yang muncul di dalam cerita, project ini mengajak setiap orang untuk menemukan maknanya sendiri melalui perjalanan yang mereka ikuti.</p>
          <p>Pada akhirnya, The Path of Her Light bukan hanya tentang apa yang terjadi. Tetapi tentang bagaimana perjalanan tersebut dirasakan.<br/>Karena beberapa cerita tidak diingat melalui peristiwanya.<br/>Melainkan melalui perasaan yang tertinggal setelah cerita itu selesai.</p>
        </div>
      ),
      visualTemplate: "cinematic"
    },
    {
      id: 6,
      title: "“The Fate of Ophelia” Influence",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <p>The Path of Her Light bukanlah cerita yang lahir dari ruang kosong.<br/>Sebelumnya, perjalanan Erine telah lebih dulu diceritakan melalui Erine in Etherland pada perayaan ulang tahunnya yang ke-18.</p>
          <p>Etherland menjadi ruang refleksi.<br/>Tempat di mana ia belajar memahami dirinya sendiri, menghadapi berbagai keraguan, dan memilih cahaya yang ingin ia ikuti.<br/>Karena itu, The Path of Her Light tidak dimulai dari awal.<br/>Ia melanjutkan langkah yang telah dimulai sebelumnya.</p>
          
          <div className="h-px w-full my-5" style={{ background: "var(--border)" }} />
          
          <p>Dalam proses pengembangannya, terdapat beberapa karya yang turut memberikan inspirasi emosional dan visual.<br/>Salah satu yang paling berpengaruh adalah <strong style={{ color: "var(--fg)" }}>The Fate of Ophelia</strong>.</p>
          <p>Bukan sebagai cerita yang diadaptasi secara langsung.<br/>Melainkan sebagai sumber atmosfer, suasana, dan potongan-potongan imajinasi yang kemudian berkembang menjadi dunia baru bagi perjalanan Erine.</p>
          <p>Beberapa baris yang meninggalkan kesan kuat di antaranya adalah:<br/>
          <span className="italic font-medium" style={{ color: "var(--fg)" }}>“Keep it one hundred<br/>On the land, the sea, the sky”</span><br/><br/>
          <span className="italic font-medium" style={{ color: "var(--fg)" }}>“I sat alone in my tower”</span></p>
          <p>Potongan-potongan kecil tersebut kemudian bertemu dengan cerita yang telah lebih dulu dibangun melalui Etherland. Dari sana lahir berbagai gagasan yang kemudian berkembang menjadi The Path of Her Light.</p>
          <p>Tower yang kembali muncul dalam prolog.<br/>Perjalanan yang terbagi menjadi LAND, SEA, dan SKY.<br/>Serta seseorang yang terus melangkah, meski belum mengetahui apa yang menunggunya di depan.</p>
          <p>Pada akhirnya, The Path of Her Light bukanlah cerita tentang Ophelia.<br/>Ia adalah kelanjutan dari perjalanan Erine.<br/>Sebuah bab baru yang lahir dari berbagai kenangan, inspirasi, dan langkah yang telah lebih dulu ada sebelumnya.</p>
        </div>
      ),
      visualTemplate: "theater"
    },
    {
      id: 7,
      title: "The Feeling Before The Journey",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <p>Sebelum LAND.<br/>Sebelum SEA.<br/>Sebelum SKY.</p>
          <p>Ada satu perasaan yang lebih dulu hadir.<br/>Perasaan bahwa ada sesuatu yang berbeda.<br/>Namun belum bisa dijelaskan.</p>
          
          <div className="h-px w-full my-5" style={{ background: "var(--border)" }} />
          
          <p>Dalam tahap awal pengembangan cerita, salah satu lirik yang cukup memengaruhi suasana emosional Prolog berasal dari lagu Dracula karya Tame Impala:<br/>
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
      id: 8,
      title: "Story Structure",
      content: (
        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <p>The Path of Her Light dibangun sebagai sebuah perjalanan yang terbagi ke dalam tiga bab utama:<br/>
          <strong style={{ color: "var(--fg)" }}>LAND</strong><br/>
          <strong style={{ color: "var(--fg)" }}>SEA</strong><br/>
          <strong style={{ color: "var(--fg)" }}>SKY</strong></p>
          <p>Ketiga bab tersebut bukan sekadar lokasi.<br/>Mereka merepresentasikan fase emosional yang berbeda dalam perjalanan Erine.<br/>Setiap bab memiliki suasana, simbol, dan pertanyaan yang berbeda untuk dijawab.<br/>Namun semuanya tetap terhubung sebagai satu perjalanan yang utuh.</p>
          
          <div className="h-px w-full my-6" style={{ background: "var(--border)" }} />
          
          <h4 className="font-bold text-lg" style={{ fontFamily: "var(--serif)", color: "var(--gold)" }}>LAND</h4>
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
          
          <div className="h-px w-full my-6" style={{ background: "var(--border)" }} />
          
          <p>Ketiga bab tersebut membentuk satu perjalanan yang saling terhubung.<br/>Sebuah perjalanan yang dimulai dari langkah pertama di LAND.<br/>Belajar menerima di SEA.<br/>Dan menemukan keberanian untuk terus bergerak di SKY.</p>
          <p>Karena pada akhirnya, The Path of Her Light bukanlah cerita tentang tujuan yang berhasil dicapai.<br/>Melainkan cerita tentang seseorang yang terus berjalan menuju arah yang belum sepenuhnya tersentuh.</p>
        </div>
      )
    }
  ];

  const toggleSection = (id: number) => {
    setOpenSection(openSection === id ? null : id);
  };

  if (!isClient) {
    return null; // Prevents hydration mismatch
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
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="sectionTitle textGold text-5xl md:text-7xl font-black tracking-tight mb-2 uppercase">
            The Path of <br className="hidden md:block"/> Her Light
          </h1>
          
          <h2 className="text-xl md:text-2xl font-bold tracking-widest uppercase font-sans mt-4" style={{ color: "var(--fg-muted)" }}>
            Symbolism & Visual Guide
          </h2>
        </div>

        {/* Dropdown/Accordion List */}
        <div className="space-y-4">
          {dropdownData.map((item) => {
            const isOpen = openSection === item.id;
            return (
              <div 
                key={item.id} 
                className={`transition-all duration-300 ${isOpen ? "mb-8" : ""}`}
              >
                {/* Trigger Button - Simple Yellow Pill Style */}
                <button
                  onClick={() => toggleSection(item.id)}
                  className={`w-full px-6 py-4 rounded-xl md:rounded-full flex items-center justify-between font-bold text-lg md:text-xl transition-all duration-300 shadow-sm`}
                  style={{
                    backgroundColor: "var(--gold)",
                    color: "#1c1917", // Always dark text on the bright gold pill for readability
                    transform: isOpen ? "translateY(-2px)" : "translateY(0)"
                  }}
                >
                  <span className="font-sans text-left">{item.title}</span>
                  <ChevronDown className={`w-6 h-6 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={3} />
                </button>

                {/* Collapsible Content */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out
                    ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`}
                >
                  <div className="overflow-hidden">
                    <div 
                      className="p-6 md:p-8 rounded-2xl shadow-sm backdrop-blur-sm"
                      style={{ 
                        background: "var(--surface)", 
                        border: "1px solid var(--border)" 
                      }}
                    >
                      {item.content}

                      {/* Interactive Visual/Concept Mockups depending on template */}
                      {item.visualTemplate === "chess" && (
                        <div className="p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 mt-8" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <div className="text-4xl filter drop-shadow-sm select-none" style={{ color: "var(--gold)" }}>♞</div>
                          <div className="text-left">
                            <h4 className="text-xs font-mono font-bold uppercase" style={{ color: "var(--gold)" }}>The Knight's Journey</h4>
                            <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>Bidak Knight melambangkan pergerakan bebas, keluar dari pakem lurus menuju ruang tak terduga.</p>
                          </div>
                        </div>
                      )}

                      {item.visualTemplate === "timeline" && (
                        <div className="p-4 rounded-xl mt-8" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <h4 className="text-xs font-mono font-bold uppercase mb-3" style={{ color: "var(--gold)" }}>Narrative Timeline Transition</h4>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 text-xs">
                            <span className="px-3 py-1.5 rounded-lg border" style={{ color: "var(--gold)", borderColor: "var(--border-gold)", background: "var(--gold-dim)" }}>Refleksi (Etherland)</span>
                            <span className="rotate-90 md:rotate-0" style={{ color: "var(--fg-dim)" }}>➔</span>
                            <span className="px-3 py-1.5 rounded-lg" style={{ color: "var(--fg)", background: "var(--bg-checker)", border: "1px solid var(--border)" }}>Realitas (The Path)</span>
                          </div>
                        </div>
                      )}

                      {item.visualTemplate === "cinematic" && (
                        <div className="p-4 rounded-xl flex gap-3 mt-8" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ color: "var(--gold)", borderColor: "var(--border-gold)", background: "var(--gold-dim)" }}><i className="bx bx-sun text-xl" /></div>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ color: "var(--fg)", borderColor: "var(--border)", background: "var(--bg-checker)" }}><i className="bx bx-palette text-xl" /></div>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ color: "var(--fg-muted)", borderColor: "var(--border)", background: "var(--surface)" }}><i className="bx bx-moon text-xl" /></div>
                          <div className="ml-2 flex flex-col justify-center">
                            <h4 className="text-xs font-mono font-bold uppercase" style={{ color: "var(--fg)" }}>Cinematic Mood Colorway</h4>
                            <p className="text-[10px] mt-1" style={{ color: "var(--fg-muted)" }}>Amber (60%), Shadow Black (30%), Charcoal (10%)</p>
                          </div>
                        </div>
                      )}

                      {item.visualTemplate === "theater" && (
                        <div className="p-4 rounded-xl flex items-center gap-4 mt-8" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <span className="text-3xl" style={{ color: "var(--gold)" }}>🎭</span>
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase" style={{ color: "var(--gold)" }}>Atmosfer Ophelia</h4>
                            <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>Simbolisme menara (tower) dan penyatuan elemen Land, Sea, Sky dalam representasi panggung.</p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decorative elements or bottom note */}
        <div className="mt-16 text-center border-t pt-8 max-w-lg mx-auto" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs italic" style={{ color: "var(--fg-muted)" }}>
            &ldquo;Satu abad penampilan, seribu kenangan indah. Panggung ke-100 didedikasikan untuk perjalanan penuh warna Erine JKT48.&rdquo;
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-[1px] w-8" style={{ background: "var(--border)" }} />
            <span className="text-[10px] tracking-widest font-mono uppercase" style={{ color: "var(--gold)" }}>Cavallery.id</span>
            <span className="h-[1px] w-8" style={{ background: "var(--border)" }} />
          </div>
        </div>

      </div>
    </div>
  );
}
