"use client";
import Link from "next/link";
import styles from "./GameRineSection.module.css";

const games = [
  {
    title: "Grasshopper Collector",
    desc: "Kumpulkan belalang sebanyak mungkin sebelum waktu habis! Game pertama dari seri GameRine.",
    href: "/games/grasshopper-collector",
    icon: "bx-bug",
    tag: "Arcade",
    color: "#4ade80",
  },
  {
    title: "Zombie Escape",
    desc: "Lari dari para zombie dan selamatkan diri! Bisakah kamu bertahan hidup?",
    href: "/games/zombie-escape",
    icon: "bx-run",
    tag: "Survival",
    color: "#f87171",
  },
  {
    title: "Jumping Adventure",
    desc: "Lompati rintangan dan raih skor tertinggi dalam petualangan seru ini.",
    href: "/games/jumping-adventure",
    icon: "bx-up-arrow-circle",
    tag: "Adventure",
    color: "#60a5fa",
  },
  {
    title: "Love Erine Meter",
    desc: "Seberapa besar cintamu untuk Erine? Ukur sekarang dan bagikan hasilnya!",
    href: "/games/love-erine-meter",
    icon: "bxs-heart",
    tag: "Fun",
    color: "#f472b6",
  },
];

export default function GameRineSection() {
  return (
    <section className={styles.section}>
      {/* BG accent */}
      <div className={styles.bgAccent} />

      <div className={styles.inner}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bx-joystick" /> #GameRine
          </div>
          <h2 className={`sectionTitle textGold ${styles.title}`}>
            Erine Pernah Main Ini!
          </h2>
          <div className="divider" style={{ margin: "16px auto 20px" }} />
          <p className={styles.subtitle}>
            Mini games eksklusif yang pernah dimainkan oleh Erine. Coba semua dan raih skor tertinggi!
          </p>
        </div>

        {/* Featured game video */}
        <div className={styles.featured}>
          <video
            src="https://cavallery.id/wp-content/uploads/2025/06/erine-game-.mp4"
            autoPlay
            muted
            loop
            playsInline
            className={styles.featVideo}
          />
          <div className={styles.featOverlay}>
            <span className={styles.featBadge}>
              <i className="bx bx-play-circle" /> Erine Gaming
            </span>
            <p className={styles.featText}>Ketua Cavallery sedang beraksi! 🎮</p>
          </div>
        </div>

        {/* Game cards */}
        <div className={styles.grid}>
          {games.map((g) => (
            <Link
              key={g.title}
              href={g.href}
              className={`glassCard ${styles.card}`}
              style={{ "--card-color": g.color } as React.CSSProperties}
            >
              <div className={styles.cardIcon}>
                <i className={`bx ${g.icon}`} />
              </div>
              <div className={styles.cardTag}>{g.tag}</div>
              <h3 className={styles.cardTitle}>{g.title}</h3>
              <p className={styles.cardDesc}>{g.desc}</p>
              <div className={styles.cardArrow}>
                <i className="bx bx-right-arrow-alt" />
                Play Now
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <Link href="/games" className="btnPrimary">
            <i className="bx bx-joystick" /> Lihat Semua Games
          </Link>
        </div>
      </div>
    </section>
  );
}
