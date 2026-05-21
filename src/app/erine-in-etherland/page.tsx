"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const scenes = [
  { src: "/assets/prolog-scene.mp4", title: "Prolog", desc: "Awal dari perjalanan Erine di dunia Etherland." },
  { src: "https://cava.jkt48connect.com/scene-1.mp4", title: "Scene 1", desc: "Erine menemukan portal menuju Etherland." },
  { src: "https://cava.jkt48connect.com/scene-2.mp4", title: "Scene 2", desc: "Petualangan pertama di tanah asing." },
  { src: "https://cava.jkt48connect.com/scene-3.mp4", title: "Scene 3", desc: "Bertemu dengan penduduk Etherland." },
  { src: "https://cava.jkt48connect.com/scene-4.mp4", title: "Scene 4", desc: "Tantangan yang harus dihadapi." },
  { src: "https://cava.jkt48connect.com/scene-5.mp4", title: "Scene 5", desc: "Menuju puncak petualangan." },
  { src: "https://cava.jkt48connect.com/penutup.mp4", title: "Penutup", desc: "Akhir dari perjalanan Erine di Etherland." },
];

const contributors = [
  [
    { name: "FH.", handle: "@FarrelHanief10" },
    { name: "DitoCieks.", handle: "@DitoCiell" },
    { name: "Rangga", handle: "@Rangga_n10" },
    { name: "Ucing Hibeur", handle: "@alpin_09" },
    { name: "William Santoso", handle: "@reaperws69" },
    { name: "Mushthafa Hikmah", handle: "@hkmhh_m" },
  ],
  [
    { name: "iCaa", handle: "@icanyaerine" },
    { name: "Dimsam", handle: "@_dimsam" },
    { name: "PRAS DR", handle: "@tigrzeus" },
    { name: "Ery D", handle: "@Tobberry5" },
    { name: "Ayam Bakar", handle: "@mlnmlk" },
    { name: "Rama Henda", handle: "@Ramahenda0" },
  ],
  [
    { name: "Nada", handle: "@gyunadaa" },
    { name: "Firanakips", handle: "@firanakIPS" },
    { name: "Mifu", handle: "@mifuuuuuuuuuuu" },
    { name: "Angga Trilaksono", handle: "@Angga3son" },
    { name: "Reza Alif", handle: "@ererezaaa" },
    { name: "Sarigandum", handle: "@ssarine_" },
  ],
];

export default function ErineInEtherlandPage() {
  const [activeScene, setActiveScene] = useState(0);
  const [page, setPage] = useState(0);
  const [heroVideoError, setHeroVideoError] = useState(false);
  const [sceneErrors, setSceneErrors] = useState<Record<number, boolean>>({});

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        {!heroVideoError ? (
          <video
            src="/assets/Video Tron Ratplaz Erine.mp4"
            autoPlay muted loop playsInline
            className={styles.heroVideo}
            onError={() => setHeroVideoError(true)}
          />
        ) : (
          <div className={styles.heroBgFallback} />
        )}
      </div>


      {/* Scene Player */}
      <section className={styles.playerSection}>
        <div className="badge" style={{ marginBottom: 16 }}>
          <i className="bx bx-film" /> Scenes
        </div>
        <h2 className={`sectionTitle textGold`}>Saksikan Perjalanannya</h2>
        <div className="divider" />

        <div className={styles.playerGrid}>
          {/* Main Video */}
          <div className={styles.mainPlayer}>
            {!sceneErrors[activeScene] ? (
              <video
                key={scenes[activeScene].src}
                src={scenes[activeScene].src}
                controls autoPlay playsInline
                className={styles.mainVideo}
                onError={() => setSceneErrors(prev => ({ ...prev, [activeScene]: true }))}
              />
            ) : (
              <div className={styles.errorPlayer}>
                <div className={styles.errorPlayerGlow} />
                <i className="bx bx-film" style={{ fontSize: "4.5rem", color: "var(--gold)", filter: "drop-shadow(0 0 15px var(--gold))", marginBottom: "8px" }} />
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--gold)", fontWeight: 900 }}>Scene preview offline</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", maxWidth: "450px" }}>Preview video dari cavallery.id sedang tidak tersedia. Nikmati petualangannya dengan memainkan game interaktif di bawah!</p>
              </div>
            )}
            <div className={styles.sceneInfo}>
              <h3 className={styles.sceneTitle}>{scenes[activeScene].title}</h3>
              <p className={styles.sceneDesc}>{scenes[activeScene].desc}</p>
            </div>
          </div>

          {/* Scene List */}
          <div className={styles.sceneList}>
            {scenes.map((s, i) => (
              <button
                key={i}
                className={`${styles.sceneBtn} ${i === activeScene ? styles.sceneBtnActive : ""}`}
                onClick={() => setActiveScene(i)}
              >
                <div className={styles.sceneNum}>{String(i + 1).padStart(2, "0")}</div>
                <div className={styles.sceneLabel}>
                  <span className={styles.sceneLabelTitle}>{s.title}</span>
                  <span className={styles.sceneLabelDesc}>{s.desc}</span>
                </div>
                <i className={`bx ${i === activeScene ? "bxs-play-circle" : "bx-play-circle"} ${styles.scenePlay}`} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Game Section */}
      <section className={styles.gameSection}>
        <div className={styles.gameHeader}>
          <div className="badge"><i className="bx bx-joystick" /> Interactive Experience</div>
          <h2 className={`sectionTitle textGold`}>Play Erine in Etherland</h2>
          <p className={styles.gameSub}>Mainkan mini game eksklusif Cavallery langsung dari browser Anda.</p>
        </div>
        
        <div className={styles.gameContainer}>
          <div className={styles.gameFrameWrapper}>
            <iframe 
              src="/play/erine-in-etherland.html"
              title="Erine in Etherland"
              className={styles.gameFrame}
              sandbox="allow-scripts allow-same-origin"
              allowFullScreen
            />
          </div>
          <div className={styles.gameMeta}>
            <div className={styles.gameBadge}><i className="bx bxs-star" /> Cavallery Exclusive Game</div>
            <p>Jelajahi dunia Etherland secara interaktif dan bantu Erine menyelesaikan misi rahasia.</p>
            <Link href="/play/erine-in-etherland.html" target="_blank" rel="noreferrer" className="btnPrimary">
              <i className="bx bx-fullscreen" /> Fullscreen Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section id="contributors" className={styles.contribSection}>
        <div className={styles.contribHeader}>
          <div className="badge"><i className="bx bx-trophy" /> Wall of Fame</div>
          <h2 className={`sectionTitle textGold`}>Top Contributor</h2>
          <div className="divider" />
          <p className={styles.contribSub}>
            Terima kasih kepada para kontributor yang telah mewujudkan Erine in Etherland.
          </p>
        </div>

        <div className={styles.plaqueGrid}>
          {contributors[page].map((c) => (
            <div key={c.handle} className={styles.plaque}>
              <span className={styles.plaqueStar}><i className="bx bxs-star" /></span>
              <span className={styles.plaqueStar}><i className="bx bxs-star" /></span>
              <span className={styles.plaqueStar}><i className="bx bxs-star" /></span>
              <span className={styles.plaqueStar}><i className="bx bxs-star" /></span>
              <div className={styles.plaqueName}>{c.name}</div>
              <div className={styles.plaqueHandle}>{c.handle}</div>
            </div>
          ))}
        </div>

        <div className={styles.contribNav}>
          <button
            className={styles.navBtn}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous"
          >
            <i className="bx bx-chevron-left" />
          </button>
          {contributors.map((_, i) => (
            <button
              key={i}
              className={`${styles.dotBtn} ${i === page ? styles.dotActive : ""}`}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
          <button
            className={styles.navBtn}
            onClick={() => setPage((p) => Math.min(contributors.length - 1, p + 1))}
            disabled={page === contributors.length - 1}
            aria-label="Next"
          >
            <i className="bx bx-chevron-right" />
          </button>
        </div>
      </section>

      {/* #CathErine17 Project */}
      <section className={styles.catSection}>
        <div className={styles.catContainer}>
          <div className={styles.catCastleSkyline} />

          <div className={styles.catNailedDecoration} />
          <h2 className={styles.catTitle}>#CatErine17th</h2>

          <p className={styles.catDescription}>
            Hashtag tersebut merupakan gabungan dari dua kata, yaitu <strong>&quot;Cat&quot;</strong> dan <strong>&quot;Erine&quot;</strong>. Kucing merupakan hewan favorit Erine, yang dikenal sebagai binatang lucu, menggemaskan, namun sesekali dapat menunjukkan sifat pemarah &mdash; karakteristik yang selaras dengan kepribadian <strong>@CErine_JKT48</strong>.
          </p>

          <div className={styles.catImageCenter}>
            <div className={styles.catImageFrame}>
              <img src="https://cavallery.id/wp-content/uploads/2025/06/1.jpeg" alt="CatErine17th" />
            </div>
          </div>
        </div>

        {/* Offline Project */}
        <div className={styles.catContainer} style={{ marginTop: 60 }}>
          <div className={styles.catCastleSkyline} />
          <div className={styles.catNailedDecoration} />
          <h2 className={styles.catTitle}>Offline Project</h2>

          <div className={styles.catVideotronInfo}>
            Dalam rangka perayaan STS @CErine_JKT48 di Theater hari ini, kami telah menyiapkan Display Project di depan Theater yang dapat kalian kunjungi. Selain itu, bagi kalian yang menyaksikan show &quot;Aitakatta&quot; pada pertunjukan hari ini, akan tersedia freebies khusus yang sudah diletakkan di bangku penonton.
          </div>

          <div className={styles.catImagesGrid}>
            <div className={styles.catImageFrame}>
              <img src="https://cavallery.id/wp-content/uploads/2025/10/CATERINE17.jpg" alt="Princess CatErine Poster" />
            </div>
            <div className={styles.catImageFrame}>
              <img src="https://cavallery.id/wp-content/uploads/2025/10/CATERINE171.jpg" alt="Videotron CatErine17th" />
            </div>
          </div>
        </div>

        {/* Birthday Gallery */}
        <div className={styles.catContainer} style={{ marginTop: 60 }}>
          <div className={styles.catCastleSkyline} />
          <div className={styles.catNailedDecoration} />
          <h2 className={styles.catTitle}>Erine Birthday Gallery</h2>

          <p className={styles.catDescription}>
            Selamat ulang tahun, <strong>Erine</strong>! Semoga hari ini penuh tawa, doa baik, dan momen manis.
          </p>

          <div className={styles.catImagesGrid}>
            <div className={styles.catImageFrame}>
              <img src="https://cavallery.id/wp-content/uploads/2025/10/sts-2024-2.jpg" alt="Princess CatErine 1" />
            </div>
            <div className={styles.catImageFrame}>
              <img src="https://cavallery.id/wp-content/uploads/2025/10/sts2024.jpg" alt="Princess CatErine 2" />
            </div>
            <div className={styles.catImageFrame}>
              <img src="https://cavallery.id/wp-content/uploads/2025/10/erine-sts-3.jpg" alt="Princess CatErine 3" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
