"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./AboutErineSection.module.css";

export default function AboutErineSection() {
  const [age, setAge] = useState(18);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlayingJiko, setIsPlayingJiko] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ image: "", date: "", desc: "" });
  const [counts, setCounts] = useState({ shows: 0, setlists: 0, units: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const slides = [
    "/images/erine1.jpg",
    "/images/erine2.jpg",
    "/images/erine3.jpg",
  ];

  const stats = [
    { label: "Total Shows", target: 98, icon: "bx-calendar" },
    { label: "Setlists", target: 7, icon: "bx-music" },
    { label: "Unit Songs", target: 15, icon: "bx-microphone" }
  ];

  useEffect(() => {
    // Age Calculation
    const birthDate = new Date('2007-08-21');
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);

    // Slideshow
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 8000);

    // Counter animation
    const counterTimer = setTimeout(() => {
      setCounts({ shows: 98, setlists: 7, units: 15 });
    }, 500);

    // Embed scripts
    const twScript = document.createElement("script");
    twScript.src = "https://platform.twitter.com/widgets.js";
    twScript.async = true;
    document.body.appendChild(twScript);

    const tkScript = document.createElement("script");
    tkScript.src = "https://www.tiktok.com/embed.js";
    tkScript.async = true;
    document.body.appendChild(tkScript);

    const thScript = document.createElement("script");
    thScript.src = "https://platform.threads.net/en_US/embed.js";
    thScript.async = true;
    document.body.appendChild(thScript);

    return () => {
      clearInterval(slideTimer);
      clearTimeout(counterTimer);
    };
  }, []);

  const toggleJiko = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/jikorine1.mp4');
      audioRef.current.onended = () => setIsPlayingJiko(false);
    }

    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => {
        console.error("Audio error:", e);
        setIsPlayingJiko(false);
      });
      setIsPlayingJiko(true);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingJiko(false);
    }
  };

  const openModal = (image: string, date: string, desc: string) => {
    setModalData({ image, date, desc });
    setIsModalOpen(true);
  };

  return (
    <section className={styles.wrapper}>
      {/* 1. Wiki Style Profile Card */}
      <div className={styles.profileContainer}>
        <div className={styles.leftCol}>
          <div className={styles.headerSection}>
            <div className={styles.titleBox}>
              <h1 className={styles.wikiName}>Erine</h1>
              <a href="https://www.idn.app/jkt48_erine" target="_blank" className={styles.followBtn}>+ Follow</a>
            </div>
            <span className={styles.jpName}>Japan : エリーヌ</span>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.bioTable}>
              <tbody>
                <tr><td className={styles.labelCell}>Nama Asli</td><td className={styles.valueCell}>Catherina Vallencia Kurniawan</td></tr>
                <tr><td className={styles.labelCell}>Nama Panggilan</td><td className={styles.valueCell}>Erine</td></tr>
                <tr><td className={styles.labelCell}>Tanggal Lahir</td><td className={styles.valueCell}>21 Agustus 2007 <span className={styles.ageDim}>(Usia {age})</span></td></tr>
                <tr>
                  <td className={styles.labelCell}>Kota Asal</td>
                  <td className={styles.valueCell}>
                    <div className={styles.hometownContainer}>
                      <span>Bekasi, Jawa Barat, Indonesia</span>
                      <div className={styles.mapIcon}>
                        <img src="https://cavallery.id/wp-content/uploads/2026/01/bekasi.png" alt="Bekasi" />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr><td className={styles.labelCell}>Golongan Darah</td><td className={styles.valueCell}>B</td></tr>
                <tr><td className={styles.labelCell}>Zodiak</td><td className={styles.valueCell}>♌︎ Leo</td></tr>
                <tr><td className={styles.labelCell}>Tinggi Badan</td><td className={styles.valueCell}>162 cm</td></tr>
                <tr><td className={styles.labelCell}>Tim</td><td className={styles.valueCell}>Passion</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.jikoBar}>
            <div className={styles.jikoLeft}>
              <div className={styles.jikoLabel}>Jikoshoukai</div>
              <button className={styles.audioBtn} onClick={toggleJiko}>
                <i className={`bx ${isPlayingJiko ? 'bx-pause' : 'bx-play'}`} />
              </button>
            </div>
            <div className={styles.jikoQuoteBox}>
              Hadir dengan seribu kejutan,<br />
              <span className={styles.checkmateAnim}>Checkmate!</span><br />
              Siap memenangkan hatimu.
            </div>
          </div>

          <div className={styles.socialSection} id="sosmed">
            <div className={styles.socialTitle}>Erine's Social Media</div>
            <div className={styles.socialIcons}>
              <a href="https://x.com/CErine_JKT48" target="_blank" className={styles.socIcon}><i className="bx bxl-twitter" /></a>
              <a href="https://www.instagram.com/jkt48.erine/" target="_blank" className={styles.socIcon}><i className="bx bxl-instagram" /></a>
              <a href="https://www.threads.com/@jkt48.erine" target="_blank" className={styles.socIcon}><i className="bx bxl-facebook-circle" /></a>
              <a href="https://www.tiktok.com/@jkt48.erine_" target="_blank" className={styles.socIcon}><i className="bx bxl-tiktok" /></a>
              <a href="https://www.showroom-live.com/r/JKT48_Erine" target="_blank" className={styles.socIcon}>
                <img src="/images/showroom.png" alt="Showroom" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              </a>
              <a href="https://www.idn.app/jkt48_erine" target="_blank" className={styles.socIcon}>
                <img src="/images/idn.png" alt="IDN" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.mainPhotoFrame}>
            {slides.map((src, idx) => (
              <img key={src} src={src} className={`${styles.mainPhoto} ${idx === activeSlide ? styles.active : ""}`} alt="Erine" />
            ))}
          </div>
          <div className={styles.galleryStrip}>
            <div className={styles.thumbsGrid}>
              {slides.slice(1, 4).map((src) => (
                <div key={src} className={styles.thumbItem}><img src={src} alt="Thumb" /></div>
              ))}
            </div>
            <div className={styles.galleryLink}>
              See <a href="https://cavallery.id/gallery/" target="_blank"><strong>gallerine</strong></a> for more!
            </div>
          </div>
        </div>
      </div>

      {/* 2. Intro & Hashtags Section */}
      <div className={styles.ewContainer}>
        <div className={styles.ewIntro}>
          <h3>Introduction</h3>
          <p>Erine adalah member JKT48 generasi ke-12. Erine dikenal sebagai "Putri Bebek" oleh fans karena kepribadiannya yang unik dan menggemaskan.</p>
        </div>

        <div className={styles.ewSplit}>
          <div className={styles.ewBio}>
            <table>
              <tbody>
                <tr><td className={styles.lbl}>Debut</td><td>18 November 2023</td></tr>
                <tr><td className={styles.lbl}>Tahun Aktif</td><td>Member JKT48 Gen 12</td></tr>
                <tr><td className={styles.lbl}>Member Favorit</td><td><a href="https://x.com/I_KathrinaJKT48" target="_blank">Kathrina Irene</a></td></tr>
                <tr><td className={styles.lbl}>MBTI</td><td>ISFP / INFP</td></tr>
                <tr><td className={styles.lbl}>Shio</td><td>Babi</td></tr>
                <tr><td className={styles.lbl}>Hobi</td><td>Bermain Piano, Menari</td></tr>
                <tr><td className={styles.lbl}>Angka Favorit</td><td>7</td></tr>
                <tr><td className={styles.lbl}>Warna Favorit</td><td>Pink, Blue, Tosca</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.ewHt}>
            <p className={styles.ewHtTitle}># Official Hashtags</p>
            <ul>
              <li><span className={styles.lbl2}>Setiap Hari Jumat</span><a href="https://cavallery.id/diesvenerine/" target="_blank" className={styles.tag}>#DiesVenErine</a></li>
              <li><span className={styles.lbl2}>Setiap Jurnal</span><span className={styles.tag}>#MemoRine</span></li>
              <li><span className={styles.lbl2}>Setiap Sahur</span><span className={styles.tag}>#SahuRine</span></li>
              <li><span className={styles.lbl2}>Sebelum Berbuka</span><span className={styles.tag}>#Ngabuburine</span></li>
              <li><span className={styles.lbl2}>Setiap Berbuka</span><span className={styles.tag}>#BukbeRine</span></li>
            </ul>
            <div className={styles.ewPm}>
              <img src="/images/pm.png" alt="PM" />
              <span className={styles.tag}>#NgabaRine</span>
            </div>
          </div>
        </div>

        <div className={styles.ewFf}>
          <h3>Funfact Erine</h3>
          <ol>
            <li>Penampilan pertamanya sebagai penari latar di JKT48 Stage ke-5 untuk lagu Glory Days adalah pada tanggal 1 Februari 2025.</li>
            <li>Suka aespa, terutama member bernama Ningning.</li>
            <li>Cita-cita pengen bawa bendera saat upacara.</li>
            <li>Erine Waktu SMA ada dijurusan IPS.</li>
            <li>Bisa memainkan Kalimba.</li>
            <li>Mata sehat, tidak silinder atau minus.</li>
            <li>Mendaftar JKT48 di hari terakhir pendaftaran.</li>
            <li>Tidak bisa maen catur, "Checkmate" cuman spontan kepikiran.</li>
          </ol>
        </div>
      </div>

      {/* 3. Showcase Section (Video Debut, Kabesha, SSK) */}
      <div className={styles.showcaseContainer}>
        <div className={styles.castleSkyline} />
        
        <div className={styles.videoDebut}>
          <div className={styles.nailedFrame} />
          <h3 className={styles.erineTitle}>Erine's Video Debut</h3>
          <div className={styles.videoFrameWrapper}>
            <div className={styles.responsiveVideo}>
              <iframe src="https://www.youtube.com/embed/Obxn7knXq38" title="Debut" allowFullScreen />
            </div>
          </div>
        </div>

        <div className={styles.nailedFrame} />
        <h3 className={styles.erineTitle}>Erine's Kabesha</h3>
        <div className={styles.galleryGrid}>
          {/* Kabesha Grid */}
          {[
            { img: "/images/trainee.jpg", year: "2023", title: "First Kabesha", desc: "Bergabung dengan JKT48 sebagai Trainee di Jak Japan Matsuri." },
            { img: "/images/regular.webp", year: "2026", title: "Regular Member", desc: "Dipromosikan menjadi Member reguler JKT48." },
            { img: "/images/erine-passion.webp", year: "2026", title: "Team Passion", desc: "Dipromosikan menjadi Member Passion JKT48." }
          ].map((item) => (
            <div key={`${item.year}-${item.title}`} className={styles.frameCard} onClick={() => openModal(item.img, item.year, item.desc)}>
              <div className={styles.imageContainer}><img src={item.img} alt={item.year} /></div>
              <div className={styles.captionBox}>
                <span className={styles.captionYear}>{item.year}</span>
                {item.title}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.electionSection}>
          <div className={styles.nailedFrame} />
          <h3 className={styles.erineTitle}>7th JKT48 Senbatsu Election</h3>
          <div className={styles.frameCardWide}>
            <div className={styles.responsiveVideo}>
              <iframe src="https://www.youtube.com/embed/XbAqE7iBJAw" title="SSK" allowFullScreen />
            </div>
            <div className={styles.electionGrid}>
              <div className={styles.electionItem} onClick={() => openModal("/images/chapter.jpg", "Campaign 2024", "Erine mengusung Project SSK dengan #Dongeng & #Chapter.")}>
                <div className={styles.electionImg}><img src="/images/chapter.jpg" alt="Poster" /></div>
                <div className={styles.captionBox}>Poster Erine's Sousenkyo</div>
              </div>
              <div className={styles.electionItem} onClick={() => openModal("https://cavallery.id/wp-content/uploads/2025/05/LINE_ALBUM_Erine-X_250515_276.jpg", "Result Rank #18", "Erine berhasil mendapatkan posisi ke 18.")}>
                <div className={styles.electionImg}><img src="https://cavallery.id/wp-content/uploads/2025/05/LINE_ALBUM_Erine-X_250515_276.jpg" alt="Rank" /></div>
                <div className={styles.captionBox}>Erine di posisi #18 (Undergirls)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Journal & Stats Section */}
      <div className={styles.journalWrapper}>
        <div className={styles.statsBoard}>
          <div className={styles.pinTack} />
          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statIcon}><i className={`bx ${s.icon}`} /></div>
                <div className={styles.statNumber}>{(counts as any)[['shows', 'setlists', 'units'][i]]}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cardsGrid}>
          {[
            { title: "Passion 200%", date: "10 April - Present", badge: "1 Show", songs: ["Wagamama na Nagareboshi"], img: "https://cavallery.id/wp-content/uploads/2026/04/passion-200.webp" },
            { title: "Ramune No Namikata", date: "15 Jan 2023 - Present", badge: "3 Show", songs: ["Nice To Meet You"], img: "https://cavallery.id/wp-content/uploads/2026/01/ramune.webp" },
            { title: "Renai Kinshi Jourei", date: "20 Mar 2021 - 26 Dec 2025", badge: "2 Shows", songs: ["Renai Kinshi Jourei"], img: "https://cavallery.id/wp-content/uploads/2025/06/rkj-1.jpg" },
            { title: "Te wo Tsunaginagara", date: "01 Feb 2025 - Present", badge: "4 Shows", songs: ["Ame no Pianist"], img: "https://cavallery.id/wp-content/uploads/2025/06/twt_waifu2x_art_noise1.png" }
          ].map((set) => (
            <div key={set.title} className={styles.stickyCard}>
              <div className={styles.tapeStrip} />
              <div className={styles.polaroidFrame}><img src={set.img} alt={set.title} /></div>
              <div className={styles.cardTitle}>{set.title}</div>
              <div className={styles.cardDates}>{set.date}</div>
              <span className={styles.showBadge}>{set.badge}</span>
              <ul className={styles.unitSongs}>
                {set.songs.map((song, i) => (
                  <li key={song} className={styles.songRow}><span className={styles.songNum}>{i+1}.</span> {song}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Social Media Embeds */}
      <div className={styles.embedsSection}>
        <div className={styles.nailedFrame} />
        <h3 className={styles.erineTitle}>Latest Updates</h3>
        <div className={styles.embedsGrid}>
          {/* X (Twitter) */}
          <div className={styles.embedCard}>
            <blockquote className="twitter-tweet" data-theme="dark">
              <a href="https://twitter.com/CErine_JKT48/status/2056685755616104632"></a>
            </blockquote>
          </div>
          
          {/* TikTok */}
          <div className={styles.embedCard}>
            <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@jkt48.erine_/video/7640445924992470280" data-video-id="7640445924992470280" style={{maxWidth: "100%", minWidth: 325}}>
              <section><a href="https://www.tiktok.com/@jkt48.erine_">@jkt48.erine_</a></section>
            </blockquote>
          </div>

          {/* Instagram */}
          <div className={styles.embedCard}>
            <iframe src="https://www.instagram.com/p/DXt1vRJEpuf/embed" width="100%" height="480" frameBorder="0" scrolling="no"></iframe>
          </div>

          {/* Threads */}
          <div className={styles.embedCard}>
             <blockquote className="twitter-tweet" data-theme="dark">
                <a href="https://www.threads.com/@jkt48.erine/post/DXt1wb4EjK2">View on Threads</a>
             </blockquote>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={`${styles.modalOverlay} ${styles.active}`} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>&times;</button>
            <div className={styles.modalImgWrapper}><img src={modalData.image} alt="Detail" /></div>
            <div className={styles.modalDetails}>
              <span className={styles.modalDate}>{modalData.date}</span>
              <p className={styles.modalDesc} dangerouslySetInnerHTML={{ __html: modalData.desc }} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
