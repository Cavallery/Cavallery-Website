/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "./AboutErineSection.module.css";

function parseSongs(raw: any): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((s) => String(s).replace(/^[\["'\s]+|[\]"'\s]+$/g, "").replace(/\\"/g, '"').trim())
      .filter(Boolean);
  }

  const s = String(raw).trim();
  if (s.startsWith("[") || s.startsWith("{")) {
    try {
      const parsed = JSON.parse(s.replace(/^\{/, "[").replace(/\}$/, "]"));
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).replace(/^[\["'\s]+|[\]"'\s]+$/g, "").replace(/\\"/g, '"').trim())
          .filter(Boolean);
      }
    } catch {}
  }

  return s
    .replace(/^[\[\{]+|[\]\}]+$/g, "")
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((item) => item.replace(/^[\["'\s]+|[\]"'\s]+$/g, "").replace(/\\"/g, '"').trim())
    .filter(Boolean);
}

function calculateAge() {
  const birthDate = new Date("2007-08-21");
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

interface SetlistData {
  title: string;
  date: string;
  badge: string;
  img: string;
  songs: string[];
}

function FlipCard({ set }: { set: SetlistData; idx: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={styles.stickyCard}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ zIndex: isFlipped ? 10 : 1 }}
    >
      <motion.div
        className={styles.flipInner}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className={styles.flipFront}>
          <div className={styles.tapeStrip} />
          <div className={styles.polaroidFrame}>
            <img src={set.img} alt={set.title} />
          </div>
          <div className={styles.cardTitle}>{set.title}</div>
          <div className={styles.cardDates}>{set.date}</div>
          <span className={styles.showBadge}>{set.badge}</span>
        </div>

        <div className={styles.flipBack}>
          <div className={styles.tapeStrip} style={{ top: "-15px" }} />
          <div className={styles.cardTitle} style={{ marginBottom: "15px", fontSize: "1.2rem" }}>
            Unit Songs
          </div>
          <ul className={styles.unitSongs}>
            {set.songs.map((song: string, i: number) => {
              const cleanSong = String(song).replace(/^[\["'\s]+|[\]"'\s]+$/g, "").trim();
              return (
                <li key={`${cleanSong}-${i}`} className={styles.songRow}>
                  <span className={styles.songNum}>{i + 1}.</span> {cleanSong}
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default function AboutErineSection() {
  const age = calculateAge();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlayingJiko, setIsPlayingJiko] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ image: "", date: "", desc: "" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pmStats, setPmStats] = useState<any>(null);
  const [pmLoading, setPmLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [setlists, setSetlists] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statsData, setStatsData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [updates, setUpdates] = useState<any[]>([]);
  const [kabeshas, setKabeshas] = useState<any[]>([]);
  const [funfacts, setFunfacts] = useState<any[]>([]);
  const [openFunFactIds, setOpenFunFactIds] = useState<number[]>([]);
  const [debutVideoId, setDebutVideoId] = useState<string>("Obxn7knXq38");
  const [sskVideoId, setSskVideoId] = useState<string>("_Qn9B9mD2bI");
  const [updatesLoaded, setUpdatesLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [slides, setSlides] = useState<string[]>([]);

  useEffect(() => {
    // Fetch slides from API
    fetch("/api/about-erine")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json.data) {
          setSlides(json.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(slideTimer);
  }, [slides]);

  useEffect(() => {
    fetch("/api/pm-statistik")
      .then((r) => r.json())
      .then((json) => { if (json.success) setPmStats(json.data); })
      .catch(() => {})
      .finally(() => setPmLoading(false));

    fetch("/api/setlists")
      .then((r) => r.json())
      .then((json) => {
        if (json?.status && Array.isArray(json.data) && json.data.length > 0) {
          setSetlists(json.data);
        } else {
          fetch("https://v5.jkt48connect.com/api/cavallery/setlists?apikey=JKTCONNECT")
            .then((r) => r.json())
            .then((ext) => { if (ext?.status) setSetlists(ext.data); })
            .catch(() => {});
        }
      })
      .catch(() => {
        fetch("https://v5.jkt48connect.com/api/cavallery/setlists?apikey=JKTCONNECT")
          .then((r) => r.json())
          .then((ext) => { if (ext?.status) setSetlists(ext.data); })
          .catch(() => {});
      });

    fetch("/api/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json?.status && Array.isArray(json.data) && json.data.length > 0) {
          const seen = new Set<string>();
          const uniqueList: any[] = [];
          for (const s of json.data) {
            const normKey = s.stat_key === "total_show" ? "total_shows" : (s.stat_key === "total_setlist" ? "setlists" : s.stat_key);
            if (!seen.has(normKey) && (normKey === "total_shows" || normKey === "setlists" || normKey === "unit_songs")) {
              seen.add(normKey);
              uniqueList.push({ ...s, stat_key: normKey });
            }
          }
          uniqueList.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
          setStatsData(uniqueList.length > 0 ? uniqueList : json.data);
        } else {
          fetch("https://v5.jkt48connect.com/api/cavallery/stats?apikey=JKTCONNECT")
            .then((r) => r.json())
            .then((ext) => {
              if (ext?.status && Array.isArray(ext.data)) {
                setStatsData(ext.data);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        fetch("https://v5.jkt48connect.com/api/cavallery/stats?apikey=JKTCONNECT")
          .then((r) => r.json())
          .then((ext) => {
            if (ext?.status && Array.isArray(ext.data)) {
              setStatsData(ext.data);
            }
          })
          .catch(() => {});
      });

    // Fetch kabeshas from API
    fetch("/api/kabesha")
      .then((r) => r.json())
      .then((json) => {
        const list = json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          setKabeshas(list.filter((k: any) => k.is_active !== false && k.is_active !== 0));
        }
      })
      .catch(() => {});

    // Fetch funfacts from API
    fetch("/api/funfacts")
      .then((r) => r.json())
      .then((json) => {
        const list = json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          setFunfacts(list.filter((f: any) => f.is_active !== false && f.is_active !== 0));
        }
      })
      .catch(() => {});

    // Fetch youtube videos to dynamically assign showcase video
    fetch("/api/youtube")
      .then((r) => r.json())
      .then((json) => {
        const list = json.data?.videos || (Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
        if (Array.isArray(list) && list.length > 0) {
          const debut = list.find((v: any) => {
            const t = (v.title || "").toLowerCase();
            const c = (v.category || "").toLowerCase();
            return t.includes("debut") || c.includes("debut");
          });
          if (debut?.video_id) setDebutVideoId(debut.video_id);

          const ssk = list.find((v: any) => {
            const t = (v.title || "").toLowerCase();
            return t.includes("pemilihan") || t.includes("sousenkyo") || t.includes("ssk");
          });
          if (ssk?.video_id) setSskVideoId(ssk.video_id);
        }
      })
      .catch(() => {});

    fetch("/api/updates")
      .then((r) => r.json())
      .then((json) => { if (json?.success) setUpdates(json.data); })
      .catch(console.error)
      .finally(() => setUpdatesLoaded(true));

    const twScript = document.createElement("script");
    twScript.src = "https://platform.twitter.com/widgets.js";
    twScript.async = true;
    document.body.appendChild(twScript);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (updates.length > 0) {
      if (typeof window !== "undefined") {
        if ((window as any).twttr) {
          (window as any).twttr.widgets.load();
        }
        
        // Delay to ensure React has rendered the blockquotes into the DOM
        const timer = setTimeout(() => {
          // Remove old tiktok script to force full re-init
          const oldScript = document.getElementById("tiktok-embed-script");
          if (oldScript) oldScript.remove();
          
          // Also remove TikTok's internal state so it re-processes blockquotes
          delete (window as any).__tiktokEmbed;
          
          const tkScript = document.createElement("script");
          tkScript.id = "tiktok-embed-script";
          tkScript.src = "https://www.tiktok.com/embed.js";
          tkScript.async = true;
          document.body.appendChild(tkScript);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [updates]);

  const toggleJiko = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/jikorine1.mp4");
      audioRef.current.onended = () => setIsPlayingJiko(false);
    }
    if (audioRef.current.paused) {
      audioRef.current.play().catch((e) => { console.error("Audio error:", e); setIsPlayingJiko(false); });
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
      <div className={`glassCard ${styles.profileContainer}`}>
        <div className={styles.leftCol}>
          <div className={styles.headerSection}>
            <div className={styles.titleBox}>
              <h1 className={styles.wikiName}>Erine</h1>
              <a
               href="https://www.idn.app/jkt48_erine"
  target="_blank"
  rel="noopener noreferrer"
  className={styles.followBtn}
>
  &#43; Follow
</a>
            </div>
            <span className={styles.jpName}>Japan : エリーヌ</span>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.bioTable}>
              <tbody>
                <tr>
                  <td className={styles.labelCell}>Nama Asli</td>
                  <td className={styles.valueCell}>Catherina Vallencia Kurniawan</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>Nama Panggilan</td>
                  <td className={styles.valueCell}>Erine</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>Tanggal Lahir</td>
                  <td className={styles.valueCell}>
                    21 Agustus 2007{" "}
                    <span className={styles.ageDim}>(Usia {age})</span>
                  </td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>Kota Asal</td>
                  <td className={styles.valueCell}>
                    <div className={styles.hometownContainer}>
                      <span>Bekasi, Jawa Barat, Indonesia</span>
                      <div className={styles.mapIcon}>
                        <img src="/images/bekasi.png" alt="Bekasi" />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>Golongan Darah</td>
                  <td className={styles.valueCell}>B</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>Zodiak</td>
                  <td className={styles.valueCell}>♌︎ Leo</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>Tinggi Badan</td>
                  <td className={styles.valueCell}>162 cm</td>
                </tr>
                <tr>
                  <td className={styles.labelCell}>Tim</td>
                  <td className={styles.valueCell}>Passion</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.jikoBar}>
            <div className={styles.jikoLeft}>
              <div className={styles.jikoLabel}>Jikoshoukai</div>
              <button className={styles.audioBtn} onClick={toggleJiko}>
                <i className={`bx ${isPlayingJiko ? "bx-pause" : "bx-play"}`} />
              </button>
            </div>
            <div className={styles.jikoQuoteBox}>
              Hadir dengan seribu kejutan,
              <br />
              <span className={styles.checkmateAnim}>Checkmate!</span>
              <br />
              Siap memenangkan hatimu.
            </div>
          </div>

          <div className={styles.socialSection} id="sosmed">
            <div className={styles.socialTitle}>{"Erine's Social Media"}</div>
            <div className={styles.socialIcons}>
              <a href="https://x.com/CErine_JKT48" target="_blank" rel="noopener noreferrer" className={styles.socIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/jkt48.erine/" target="_blank" rel="noopener noreferrer" className={styles.socIcon}>
                <i className="bx bxl-instagram" />
              </a>
              <a href="https://www.threads.com/@jkt48.erine" target="_blank" rel="noopener noreferrer" className={styles.socIcon}>
                <i className="bx bxl-facebook-circle" />
              </a>
              <a href="https://www.tiktok.com/@jkt48.erine_" target="_blank" rel="noopener noreferrer" className={styles.socIcon}>
                <i className="bx bxl-tiktok" />
              </a>
              <a href="https://www.showroom-live.com/r/JKT48_Erine" target="_blank" rel="noopener noreferrer" className={styles.socIcon}>
                <img src="/images/showroom.png" alt="Showroom" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              </a>
              <a href="https://www.idn.app/jkt48_erine" target="_blank" rel="noopener noreferrer" className={styles.socIcon}>
                <img src="/images/idn.png" alt="IDN" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.mainPhotoFrame}>
            {slides.map((src, idx) => (
              <img
                key={src}
                src={src}
                className={`${styles.mainPhoto} ${idx === activeSlide ? styles.active : ""}`}
                alt="Erine"
              />
            ))}
          </div>
          <div className={styles.galleryStrip}>
            <div className={styles.thumbsGrid}>
              {slides.slice(1, 4).map((src) => (
                <div key={src} className={`glassCard ${styles.thumbItem}`}>
                  <img src={src} alt="Thumb" />
                </div>
              ))}
            </div>
            <div className={styles.galleryLink}>
              See{" "}
              <a href="/gallery"><strong>gallerine</strong></a>{" "}
              for more!
            </div>
          </div>
        </div>
      </div>

      {/* 2. Intro & Hashtags Section */}
      <div className={styles.ewContainer}>
        {/* Introduction */}
        <div className={styles.ewIntro}>
          <div className={styles.ewIntroBadge}>
            <i className="bx bx-user-circle" style={{ color: "var(--gold)" }} />
            <span>Introduction</span>
          </div>
          <p>
            Erine adalah member JKT48 generasi ke-12. Erine dikenal sebagai{" "}
            <strong className={styles.ewHighlight}>&quot;Putri Bebek&quot;</strong>{" "}
            oleh fans karena kepribadiannya yang unik dan menggemaskan.
          </p>
        </div>

        <div className={styles.ewSplit}>
          {/* Bio Cards */}
          <div className={styles.ewBio}>
            <div className={styles.ewBioHeader}>
              <i className="bx bx-id-card" style={{ color: "var(--gold)", fontSize: "1.2rem" }} />
              <span>Profil Erine</span>
            </div>
            <div className={styles.ewBioGrid}>
              {[
                { icon: "bx-calendar-star", label: "Debut", value: "18 November 2023" },
                { icon: "bx-group", label: "Tahun Aktif", value: "Member JKT48 Gen 12" },
                { icon: "bx-heart", label: "Member Favorit", value: <a href="https://x.com/I_KathrinaJKT48" target="_blank" rel="noopener noreferrer" className={styles.ewBioLink}>Kathrina Irene</a> },
                { icon: "bx-brain", label: "MBTI", value: "ISFP / INFP" },
                { icon: "bx-meteor", label: "Shio", value: "🐷 Babi" },
                { icon: "bx-music", label: "Hobi", value: "Bermain Piano, Menari" },
                { icon: "bx-hash", label: "Angka Favorit", value: "7" },
                { icon: "bx-palette", label: "Warna Favorit", value: <span className={styles.ewColors}><span className={styles.colorDotPink} />Pink<span className={styles.colorDotBlue} />Blue<span className={styles.colorDotTosca} />Tosca</span> },
              ].map((row, i) => (
                <div key={i} className={styles.ewBioRow}>
                  <div className={styles.ewBioIcon}>
                    <i className={`bx ${row.icon}`} />
                  </div>
                  <div className={styles.ewBioContent}>
                    <span className={styles.ewBioLabel}>{row.label}</span>
                    <span className={styles.ewBioValue}>{row.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div className={styles.ewHt}>
            <div className={styles.ewHtHeader}>
              <i className="bx bxl-twitter" style={{ color: "var(--gold)", fontSize: "1.2rem" }} />
              <span># Official Hashtags</span>
            </div>
            <div className={styles.ewHtList}>
              {[
                { when: "Setiap Hari Jumat", tag: "#DiesVenErine" },
                { when: "Setiap Jurnal", tag: "#MemoRine" },
                { when: "Setiap Sahur", tag: "#SahuRine" },
                { when: "Sebelum Berbuka", tag: "#Ngabuburine" },
                { when: "Setiap Berbuka", tag: "#BukbeRine" },
                { when: "Setiap Game", tag: "#GameRine" },
              ].map((h, i) => (
                <div key={i} className={styles.ewHtRow}>
                  <span className={styles.lbl2}>{h.when}</span>
                  <a
                    href={`https://x.com/search?q=${encodeURIComponent(h.tag)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tag}
                  >
                    {h.tag}
                  </a>
                </div>
              ))}
            </div>
            <div className={styles.ewPm}>
              <img src="/images/pm.png" alt="PM" />
              <div className={styles.ewPmContent}>
                <span className={styles.lbl2}>Personal Massage</span>
                <a
                  href="https://x.com/search?q=%23NgabaRine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.tag}
                >
                  #NgabaRine
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ewFf}>
          <div className={styles.ffHeader}>
            <div>
              <h3 className={styles.ffTitle}>
                <i className="bx bx-help-circle" style={{ color: "var(--gold)", marginRight: 8 }} />
                Fun Fact & Trivia Erine
              </h3>
              <p className={styles.ffSubtitle}>
                Klik pertanyaan di bawah untuk mengungkap fakta & rahasia menarik tentang Erine! 🐣✨
              </p>
            </div>
            <button
              type="button"
              className={styles.ffToggleAllBtn}
              onClick={() => {
                const totalIds = (funfacts.length > 0 ? funfacts : [1, 2, 3, 4, 5, 6, 7, 8]).map((_, i) => i + 1);
                setOpenFunFactIds(openFunFactIds.length === totalIds.length ? [] : totalIds);
              }}
            >
              {openFunFactIds.length > 0 ? "Tutup Semua" : "Buka Semua"}
            </button>
          </div>

          <div className={styles.ffGrid}>
            {(funfacts.length > 0
              ? funfacts.map((f: any, i: number) => {
                  const raw = f.fact || f.content || "";
                  let q = `Trivia #${i + 1}: Tahukah kamu tentang hal ini?`;
                  let a = raw;
                  if (raw.includes("?") || raw.includes("—") || raw.includes(":")) {
                    const parts = raw.split(/[?|—|:]/);
                    if (parts.length >= 2 && parts[0].trim().length > 5) {
                      q = parts[0].trim() + (raw.includes("?") ? "?" : "");
                      a = parts.slice(1).join(" ").trim();
                    }
                  }
                  if (!a.toLowerCase().includes("erine")) {
                    a = `Fakta Erine: ${a}`;
                  }
                  return { id: f.id || i + 1, q, a, tag: "Fun Fact" };
                })
              : [
                  {
                    id: 1,
                    q: "Kapan penampilan pertama Erine di panggung theater JKT48?",
                    a: "Penampilan pertama Erine sebagai penari latar (zenza girl) di JKT48 Stage ke-5 untuk lagu 'Glory Days' adalah pada tanggal 1 Februari 2025.",
                    tag: "Panggung Theater",
                  },
                  {
                    id: 2,
                    q: "Siapa grup dan idol K-Pop favorit Erine?",
                    a: "Erine sangat mengidolakan girlgroup aespa, dengan bias utama Erine yaitu Ningning.",
                    tag: "Favorit",
                  },
                  {
                    id: 3,
                    q: "Apa cita-cita unik Erine semasa upacara sekolah?",
                    a: "Erine punya cita-cita unik ingin menjadi petugas pembawa bendera saat Erine upacara bendera di sekolah.",
                    tag: "Masa Sekolah",
                  },
                  {
                    id: 4,
                    q: "Waktu SMA, Erine memilih jurusan apa?",
                    a: "Erine mengambil jurusan IPS saat Erine menempuh pendidikan di SMA.",
                    tag: "Pendidikan",
                  },
                  {
                    id: 5,
                    q: "Alat musik apa yang bisa dimainkan oleh Erine?",
                    a: "Erine mahir memainkan alat musik Kalimba (alat musik petik jempol).",
                    tag: "Bakat Musik",
                  },
                  {
                    id: 6,
                    q: "Bagaimana kondisi kesehatan mata Erine?",
                    a: "Mata Erine sangat sehat dan jernih, Erine sama sekali tidak memiliki silinder ataupun minus.",
                    tag: "Fisik & Kesehatan",
                  },
                  {
                    id: 7,
                    q: "Kapan Erine mengirimkan formulir pendaftaran audisi JKT48?",
                    a: "Erine mendaftarkan diri pada audisi JKT48 tepat di hari terakhir penutupan pendaftaran!",
                    tag: "Audisi JKT48",
                  },
                  {
                    id: 8,
                    q: "Apakah Erine benar-benar jago bermain catur?",
                    a: "Sebenarnya Erine tidak bisa main catur! Jikoshoukai 'Checkmate' Erine itu murni ide spontan yang terlintas begitu saja di pikiran Erine.",
                    tag: "Jikoshoukai",
                  },
                ]
            ).map((item: any) => {
              const isOpen = openFunFactIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`${styles.ffCard} ${isOpen ? styles.ffCardOpen : ""}`}
                  onClick={() => {
                    setOpenFunFactIds((prev) =>
                      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                    );
                  }}
                >
                  <div className={styles.ffQuestionRow}>
                    <div className={styles.ffQuestionLeft}>
                      <span className={styles.ffNumberBadge}>Q{item.id}</span>
                      <span className={styles.ffQuestionText}>{item.q}</span>
                    </div>
                    <div className={styles.ffChevron}>
                      <i className={`bx ${isOpen ? "bx-chevron-up" : "bx-chevron-down"}`} />
                    </div>
                  </div>

                  {isOpen && (
                    <div className={styles.ffAnswerBox}>
                      <div className={styles.ffAnswerHeader}>
                        <span className={styles.ffAnswerBadge}>
                          <i className="bx bx-bulb" /> Jawaban
                        </span>
                        {item.tag && <span className={styles.ffTagBadge}>{item.tag}</span>}
                      </div>
                      <p className={styles.ffAnswerText}>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Showcase Section */}
      <div className={styles.showcaseContainer}>
        <div className={styles.videoDebut}>
          <div className={styles.nailedFrame} />
          <h3 className={styles.erineTitle}>{"Erine's Video Debut"}</h3>
          <div className={styles.videoFrameWrapper}>
            <div className={styles.responsiveVideo}>
              <iframe src={`https://www.youtube.com/embed/${debutVideoId}`} title="Debut" allowFullScreen />
            </div>
          </div>
        </div>

        <div className={styles.nailedFrame} />
        <h3 className={styles.erineTitle}>{"Erine's Kabesha"}</h3>
        <div className={styles.galleryGrid}>
          {(kabeshas.length > 0 ? kabeshas : [
            { image_url: "/images/trainee.jpg", era: "2023", title: "First Kabesha", description: "Bergabung dengan JKT48 sebagai Trainee di Jak Japan Matsuri." },
            { image_url: "/images/regular.webp", era: "2026", title: "Regular Member", description: "Dipromosikan menjadi Member reguler JKT48." },
            { image_url: "/images/erine-passion.webp", era: "2026", title: "Team Passion", description: "Dipromosikan menjadi Member Passion JKT48." },
          ]).map((item: any, idx: number) => {
            const img = item.image_url || item.img || "/images/cava-logo.jpg";
            const year = item.era || item.year_label || item.year || "2026";
            const title = item.title || item.era_name || "Kabesha";
            const desc = item.description || item.desc || title;
            return (
              <div
                key={item.id || `${year}-${title}-${idx}`}
                className={styles.frameCard}
                onClick={() => openModal(img, year, desc)}
              >
                <div className={styles.imageContainer}>
                  <img src={img} alt={title} />
                </div>
                <div className={styles.captionBox}>
                  <span className={styles.captionYear}>{year}</span>
                  {title}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.electionSection}>
          <div className={styles.nailedFrame} />
          <h3 className={styles.erineTitle}>7th JKT48 Senbatsu Election</h3>
          <div className={styles.frameCardWide}>
            <div className={styles.responsiveVideo}>
              <iframe
                src="https://www.youtube.com/embed/_Qn9B9mD2bI"
                title="7th JKT48 Senbatsu Election Erine"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.electionGrid}>
              <div
                className={styles.electionItem}
                onClick={() => openModal("/images/chapter.jpg", "Campaign 2024", "Erine mengusung Project SSK dengan #Dongeng & #Chapter.")}
              >
                <div className={styles.electionImg}><img src="/images/chapter.jpg" alt="Poster" /></div>
                <div className={styles.captionBox}>{"Poster Erine's Sousenkyo"}</div>
              </div>
              <div
                className={styles.electionItem}
                onClick={() => openModal("https://cava.jkt48connect.com/IMG-20260525-WA0211.jpg", "Result Rank #18", "Erine berhasil mendapatkan posisi ke 18.")}
              >
                <div className={styles.electionImg}>
                  <img src="https://cava.jkt48connect.com/IMG-20260525-WA0211.jpg" alt="Rank" />
                </div>
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
            {statsData.length === 0 ? (
              <div style={{ color: "var(--gold)", padding: "1rem" }}>
                <i className="bx bx-loader-alt bx-spin" /> Memuat statistik...
              </div>
            ) : (
              statsData.map((s) => (
                <div key={s.id} className={styles.statItem}>
                  <div className={styles.statIcon}>
                    <i className={`bx ${s.icon}`} />
                  </div>
                  <div className={styles.statNumber}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.cardsGrid}>
          {setlists.length === 0 ? (
            <div style={{ color: "var(--gold)", padding: "1rem" }}>
              <i className="bx bx-loader-alt bx-spin" /> Memuat setlist...
            </div>
          ) : (
            setlists.map((set, idx) => (
              <FlipCard
                key={set.id}
                set={{
                  title: set.title,
                  date: set.date_range,
                  badge: set.badge,
                  img: set.image_url,
                  songs: parseSongs(set.songs),
                }}
                idx={idx}
              />
            ))
          )}
        </div>
      </div>

      {/* 4.5 PM Weekly Stats */}
      <div className={styles.pmStatsSection}>
        <div className={styles.nailedFrame} />
        <h3 className={styles.erineTitle}>Statistik PM Mingguan</h3>
        {pmLoading ? (
          <div className={styles.pmLoading}>
            <i className="bx bx-loader-alt bx-spin" /> Memuat data...
          </div>
        ) : pmStats ? (
          <div className={styles.pmStatsCard}>
            <div className={styles.pmCardHeader}>
              <img src={pmStats.profile_image} alt={pmStats.member_name} className={styles.pmAvatar} />
              <div className={styles.pmHeaderInfo}>
                <span className={styles.pmName}>{pmStats.member_name}</span>
                <span className={styles.pmId}>{pmStats.idol_id}</span>
                <div className={styles.pmBadges}>
                  {pmStats.is_active && <span className={styles.badgeActive}>● Aktif</span>}
                  {pmStats.is_popular && <span className={styles.badgePopular}>★ Popular</span>}
                </div>
              </div>
            </div>
            <div className={styles.pmStatsGrid}>
              <div className={styles.pmStatBox}>
                <i className="bx bx-medal" />
                <span className={styles.pmStatVal}>#{pmStats.current_rank}</span>
                <span className={styles.pmStatLbl}>Rank Saat Ini</span>
              </div>
              <div className={styles.pmStatBox}>
                <i className="bx bx-message-dots" />
                <span className={styles.pmStatVal}>{pmStats.messages_per_week}</span>
                <span className={styles.pmStatLbl}>Pesan / Minggu</span>
              </div>
              <div className={styles.pmStatBox}>
                <i className="bx bx-group" />
                <span className={styles.pmStatVal}>{pmStats.group_name}</span>
                <span className={styles.pmStatLbl}>Grup</span>
              </div>
            </div>
            <div className={styles.pmBarWrapper}>
              <div className={styles.pmBarLabel}>
                <span>Aktivitas Mingguan</span>
                <span>{pmStats.messages_per_week} pesan</span>
              </div>
              <div className={styles.pmBarTrack}>
                <div
                  className={styles.pmBarFill}
                  style={{ width: `${Math.min((parseInt(pmStats.messages_per_week) / 100) * 100, 100)}%` }}
                />
              </div>
              <div className={styles.pmBarHint}>Skala: 0 – 100 pesan/minggu</div>
            </div>
          </div>
        ) : (
          <p className={styles.pmError}>Data statistik tidak tersedia.</p>
        )}
      </div>

      {/* 5. Social Media Embeds */}
      <div className={styles.embedsSection}>
        <div className={styles.nailedFrame} />
        <h3 className={styles.erineTitle}>Latest Updates</h3>
        {updates.length === 0 ? (
          <div style={{ color: "var(--gold)", padding: "1rem", textAlign: "center" }}>
            {updatesLoaded ? (
              <><i className="bx bx-info-circle" /> Belum ada updates terbaru.</>
            ) : (
              <><i className="bx bx-loader-alt bx-spin" /> Memuat updates...</>
            )}
          </div>
        ) : (
          <div className={styles.embedsGrid}>
            {updates.map((update) => {
              if (update.platform === "twitter") {
                return (
                  <div key={update.id} className={styles.embedCard}>
                    <blockquote className="twitter-tweet" data-theme="dark">
                      <a href={update.url}></a>
                    </blockquote>
                  </div>
                );
              }
              if (update.platform === "tiktok") {
                // Extract video ID from URL like https://www.tiktok.com/@user/video/123456
                const urlParts = update.url.split("/");
                const videoId = urlParts[urlParts.length - 1].split("?")[0];
                const username = urlParts.find((p: string) => p.startsWith("@")) || "@jkt48.erine_";
                const isNumericId = /^\d+$/.test(videoId);

                return (
                  <div key={update.id} className={styles.embedCard}>
                    <blockquote
                      className="tiktok-embed"
                      cite={update.url}
                      data-video-id={isNumericId ? videoId : undefined}
                      style={{ maxWidth: 605, minWidth: 325 }}
                    >
                      <section>
                        <a
                          target="_blank"
                          title={username}
                          href={`https://www.tiktok.com/${username}?refer=embed`}
                          rel="noopener noreferrer"
                        >
                          {username}
                        </a>
                      </section>
                    </blockquote>
                  </div>
                );
              }
              if (update.platform === "instagram") {
                // URL should be the base URL without trailing slash, e.g. https://www.instagram.com/p/DXt1vRJEpuf
                const igUrl = update.url.endsWith("/") ? update.url : `${update.url}/`;
                return (
                  <div key={update.id} className={styles.embedCard}>
                    <iframe
                      src={`${igUrl}embed`}
                      width="100%"
                      height="480"
                      frameBorder="0"
                      scrolling="no"
                    />
                  </div>
                );
              }
              if (update.platform === "threads") {
                // URL e.g. https://www.threads.net/@jkt48.erine/post/DXt1wb4EjK2
                const threadsUrl = update.url.endsWith("/") ? update.url : `${update.url}/`;
                return (
                  <div key={update.id} className={styles.embedCard}>
                    <iframe
                      src={`${threadsUrl}embed`}
                      width="100%"
                      height="480"
                      frameBorder="0"
                      scrolling="no"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className={`${styles.modalOverlay} ${styles.active}`}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
              &times;
            </button>
            <div className={styles.modalImgWrapper}>
              <img src={modalData.image} alt="Detail" />
            </div>
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
