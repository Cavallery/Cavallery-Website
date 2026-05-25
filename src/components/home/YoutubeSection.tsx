"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./YoutubeSection.module.css";

interface YtVideo {
  title: string;
  url: string;
  id: string;
  category: string;
}

const VIDEOS: YtVideo[] = [
  {
    title: "Q&A ABOUT JKT48 TEAM PASSION - PASSION 200%",
    url: "https://youtu.be/dpg5K1eKuEQ?si=Vo8lyMnZ6HAImE7U",
    id: "dpg5K1eKuEQ",
    category: "Q&A"
  },
  {
    title: "TURNAMEN KUTUKAN - Siapa Member JKT48 Terkuat di Free Fire?",
    url: "https://youtu.be/oOMBVU6EM98?si=8RxU1LrkL9bjbKyM",
    id: "oOMBVU6EM98",
    category: "Turnamen"
  },
  {
    title: "[SECRET CAM] JKT48 THE FIRST SNOW",
    url: "https://youtu.be/FgSr-tSxRiA?si=jmsjEb3xZ-f_1HFe",
    id: "FgSr-tSxRiA",
    category: "Secret Cam"
  },
  {
    title: "[WARTAK S2] KETIKA LIVE STREAMING JADI PASSION",
    url: "https://youtu.be/nQcCt2wgU6g?si=ARxO1x6AMlO4gg0I",
    id: "nQcCt2wgU6g",
    category: "Wartak"
  },
  {
    title: "JKT48 OFC EVENT",
    url: "https://youtu.be/3k6293_4pTI?si=EDoNmLZZ9eeRoAaa",
    id: "3k6293_4pTI",
    category: "OFC Event"
  },
  {
    title: "[BTS] JKT48 & AKB48 PERSONAL MEET AND GREET FESTIVAL “SISTER REUNION”",
    url: "https://youtu.be/Zt41KYWMQh8?si=GzquFT-GfOJz2IiU",
    id: "Zt41KYWMQh8",
    category: "BTS"
  },
  {
    title: "[SECRET CAM] JKT48 & AKB48 PERSONAL M&G FESTIVAL “SISTER REUNION”",
    url: "https://youtu.be/9a2Z4eYOn7w?si=z5LE3inEgrs1Da8b",
    id: "9a2Z4eYOn7w",
    category: "Secret Cam"
  },
  {
    title: "[CHEMISTRY] BESTIE BUKTIIN CHEMISTRY",
    url: "https://youtu.be/33H7HTUr0JE?si=ORkoL2FGgVT0nGhh",
    id: "33H7HTUr0JE",
    category: "Chemistry"
  },
  {
    title: "JKT48 OFC EVENT",
    url: "https://youtu.be/G23wXCze0_k?si=DikFNaWeLiSeDZWg",
    id: "G23wXCze0_k",
    category: "OFC Event"
  },
  {
    title: "THE BATTLE: VOCAL QUEENS",
    url: "https://youtu.be/RGl5oLi81Us?si=6k0kX3shfCzrZoiJ",
    id: "RGl5oLi81Us",
    category: "The Battle"
  },
  {
    title: "THE BATTLE: DANCING QUEENS",
    url: "https://youtu.be/oSr56czCL-s?si=B2IZOMFeKzmptpgk",
    id: "oSr56czCL-s",
    category: "The Battle"
  },
  {
    title: "[JAHAT-JAHATAN] SPESIAL DIRGAHAYU RI KE-80!",
    url: "https://youtu.be/ek8xyzdx0NI?si=rMTmwn2VPF_HiSeS",
    id: "ek8xyzdx0NI",
    category: "Spesial"
  },
  {
    title: "[CEKIDOT] KESERUAN DI MAMMA MIA! THE MUSICAL",
    url: "https://youtu.be/ocTnD00-wf0?si=eFIOjm2dtJRKD4w6",
    id: "ocTnD00-wf0",
    category: "Cekidot"
  },
  {
    title: "[SHOWDOWN] SELAMAT HARI PENDIDIKAN!",
    url: "https://youtu.be/klDPWsFqUP0?si=_iEVcVdKEMKKv3FT",
    id: "klDPWsFqUP0",
    category: "Showdown"
  },
  {
    title: "[BEHIND THE SCENE] JKT48 26th Single Personal M&G Festival",
    url: "https://youtu.be/SzE-sXR253A?si=rxZtbJGMk-YCc9TM",
    id: "SzE-sXR253A",
    category: "BTS"
  },
  {
    title: "[SAHUR BOWL] Bedanya Sahur dan Sarapan Pagi!",
    url: "https://youtu.be/8CFdavUenqg?si=42fh6Tgk87wHs5iK",
    id: "8CFdavUenqg",
    category: "Sahur Bowl"
  },
  {
    title: "[Dance Practice] Bibir yang Telah Dicuri - JKT48 Undergirls",
    url: "https://youtu.be/DrK8n8dCYdg?si=DVEfERD2WaqOPc6d",
    id: "DrK8n8dCYdg",
    category: "Dance Practice"
  },
  {
    title: "[MV REACTION] BIBIR YANG TELAH DICURI - JKT48 UNDERGIRLS",
    url: "https://youtu.be/S_nOwUMIuQA?si=KNUacV3ObTZX18Br",
    id: "S_nOwUMIuQA",
    category: "MV Reaction"
  },
  {
    title: "[CEKIDOT] TAHUN BARUAN EDISI JOGJA!",
    url: "https://youtu.be/A_oJveTk21Q?si=GoRq514DcLPPWXq6",
    id: "A_oJveTk21Q",
    category: "Cekidot"
  },
  {
    title: "[SECRET CAM] JKT48 Wonderland - PART 2",
    url: "https://youtu.be/z37JBEos2s4?si=jVVgOfi7XcMqZhQ0",
    id: "z37JBEos2s4",
    category: "Secret Cam"
  },
  {
    title: "Breakfast Time with Erine",
    url: "https://youtu.be/5-d_4NoNLQ4?si=eI44NTBILoUa1H3Y",
    id: "5-d_4NoNLQ4",
    category: "Breakfast"
  },
  {
    title: "GEN MANA YANG PALING JAGO DI TRAINEE TRIALS?",
    url: "https://youtu.be/t8E0ta8w49M?si=CnZzX29JkKqlcFA8",
    id: "t8E0ta8w49M",
    category: "Trainee Trials"
  },
  {
    title: "[SECRET CAM] Personal M&G Festival “Road to Sousenkyo 2024”",
    url: "https://youtu.be/OGRz3xaYFBA?si=ThUpbvyVRWmGmnB7",
    id: "OGRz3xaYFBA",
    category: "Secret Cam"
  },
  {
    title: "OFC EVENT",
    url: "https://youtu.be/unZzBUREzNU?si=I74FJkJ3mRut6sJz",
    id: "unZzBUREzNU",
    category: "OFC Event"
  },
  {
    title: "[MV REACTION] Belalang yang Membangkang - JKT48 Trainee",
    url: "https://youtu.be/FxlMnw36WAw?si=PmHFmRnl9d6F1fry",
    id: "FxlMnw36WAw",
    category: "MV Reaction"
  }
];

export default function YoutubeSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (viewportRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = viewportRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();

      // Check on window resize
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (viewportRef.current) {
      const scrollAmount = direction === "left" ? -344 : 344; // width (320) + gap (24)
      viewportRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headerWrapper}>
          <div className={styles.header}>
            <div className="badge">
              <i className="bx bxl-youtube" style={{ color: "#ff0000" }} /> YouTube JKT48
            </div>
            <h2 className={`sectionTitle textGold ${styles.title}`}>Featured Videos</h2>
            <p className={styles.subtitle}>
              Ikuti keseruan, vlog, show practice, serta momen terbaik Erine JKT48.
            </p>
          </div>

          <div className={styles.navButtons}>
            <button
              className={styles.navBtn}
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <i className="bx bx-chevron-left" />
            </button>
            <button
              className={styles.navBtn}
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <i className="bx bx-chevron-right" />
            </button>
          </div>
        </div>

        <div className={styles.carouselContainer}>
          <div className={styles.carouselViewport} ref={viewportRef}>
            <div className={styles.carouselTrack}>
              {VIDEOS.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  <div className={styles.thumbnailWrapper}>
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className={styles.thumbnail}
                      loading="lazy"
                    />
                    <div className={styles.playOverlay}>
                      <div className={styles.playBtnCircle}>
                        <i className="bx bx-play" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.badge}>{video.category}</span>
                      <span className={styles.ytTag}>
                        <i className="bx bxl-youtube" /> YouTube
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{video.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
