import React from "react";
import styles from "./page.module.css";
import type { Metadata } from "next";
import Link from "next/link";
import WayfinderMessages from "@/components/wayfinder/WayfinderMessages";

export const metadata: Metadata = {
  title: "#ErineTheWayfinder | Seitansai Erine 2026 — Cavallery",
  description: "Perayaan ulang tahun Catherina Vallencia Kurniawan — #ErineTheWayfinder.",
  openGraph: {
    title: "#ErineTheWayfinder — Seitansai Erine 2026",
    description: "Perayaan ulang tahun Catherina Vallencia Kurniawan oleh CAVALLERY.",
  },
};

interface Gifter {
  rank: number;
  name: string;
  amount: string;
}

const TOP_GIFTERS: Gifter[] = [
  // Tier 2.500 (Rp 2.500.000)
  { rank: 1, name: "MPK", amount: "Rp 2.500.000" },
  { rank: 2, name: "William Santoso", amount: "Rp 2.500.000" },
  { rank: 3, name: "Rifqi Annafi", amount: "Rp 2.500.000" },
  { rank: 4, name: "Firstarisa", amount: "Rp 2.500.000" },

  // Tier 1.000 (Rp 1.000.000)
  { rank: 5, name: "Lucky Arasyah", amount: "Rp 1.000.000" },
  { rank: 6, name: "Indyraaa", amount: "Rp 1.000.000" },
  { rank: 7, name: "NabilRasyaaaa", amount: "Rp 1.000.000" },
  { rank: 8, name: "Salma Nada", amount: "Rp 1.000.000" },

  // Tier 500 (Rp 500.000)
  { rank: 9, name: "Cipuyyy/@cpydermant", amount: "Rp 500.000" },
  { rank: 10, name: "Angga", amount: "Rp 500.000" },
  { rank: 11, name: "RFDorable", amount: "Rp 500.000" },
  { rank: 12, name: "Vend.", amount: "Rp 500.000" },
  { rank: 13, name: "Roni Eriyanto", amount: "Rp 500.000" },
  { rank: 14, name: "🐝🐥", amount: "Rp 500.000" },
  { rank: 15, name: "Nugo", amount: "Rp 500.000" },
];

export default function ErineTheWayfinderPage() {
  const remainingGifters = TOP_GIFTERS.slice(3);

  const rank1 = TOP_GIFTERS.find((g) => g.rank === 1)!;
  const rank2 = TOP_GIFTERS.find((g) => g.rank === 2)!;
  const rank3 = TOP_GIFTERS.find((g) => g.rank === 3)!;

  return (
    <main className={styles.page}>
      {/* Video Section (Indonesia & Malaysia Videotron) */}
      <section className={styles.videoSection}>
        <div className={styles.videoGrid}>
          {/* Video 1: Indonesia */}
          <div className={styles.videoCard}>
            <div className={styles.videoHeader}>
              <span>🇮🇩 Videotron Project Jakarta, Indonesia</span>
            </div>
            <video
              className={styles.heroVideo}
              src="https://images.jkt48connect.com/cavallery/videos/2026/08/4ba3f44a5c674e6f.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </div>

          {/* Video 2: Malaysia */}
          <div className={styles.videoCard}>
            <div className={styles.videoHeader}>
              <span>🇲🇾 Videotron Project Kuala Lumpur, Malaysia</span>
            </div>
            <video
              className={styles.heroVideo}
              src="https://images.jkt48connect.com/cavallery/videos/2026/08/66c61b08fb884ad2.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </div>
        </div>
      </section>

      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.badge}>
          <span>✨ Seitansai Project 2026</span>
        </div>
        <h1 className={styles.title}>#ErineTheWayfinder</h1>
        <p className={styles.subtitle}>
          Perayaan hari ulang tahun Catherina Vallencia Kurniawan. Terima kasih atas dedikasi dan cinta dari seluruh Cavallers!
        </p>
      </div>

      {/* Cake Visualization */}
      <section className={styles.cakeSection} aria-label="Birthday Cake">
        <div className={styles.cakeWrapper}>
          <div className={styles.plate}></div>
          <div className={`${styles.cakeLayer} ${styles.layerBottom}`}></div>
          <div className={`${styles.cakeLayer} ${styles.layerMiddle}`}></div>
          <div className={`${styles.cakeLayer} ${styles.layerTop}`}></div>
          <div className={styles.icing}></div>
          <div className={`${styles.drip} ${styles.drip1}`}></div>
          <div className={`${styles.drip} ${styles.drip2}`}></div>
          <div className={`${styles.drip} ${styles.drip3}`}></div>
          <div className={styles.candles}>
            <div className={`${styles.digit} ${styles.digit1}`}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <text x="62" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="900" textAnchor="middle" fill="#7B020B">1</text>
              </svg>
              <div className={`${styles.flame} ${styles.digit1Flame}`}></div>
            </div>
            <div className={`${styles.digit} ${styles.digit9}`}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <text x="38" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="900" textAnchor="middle" fill="#7B020B">9</text>
              </svg>
              <div className={`${styles.flame} ${styles.digit9Flame}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Gifters Leaderboard */}
      <section className={styles.gifterSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Special Appreciation</span>
          <h2 className={styles.sectionTitle}>🏆 Top Gifter #ErineTheWayfinder</h2>
          <p className={styles.sectionDesc}>
            Apresiasi dan terima kasih setinggi-tingginya kepada para Top Gifter atas kontribusi luar biasa untuk menyukseskan Seitansai Project Erine 2026.
          </p>
        </div>

        {/* Podium (Top 3) */}
        <div className={styles.podiumGrid}>
          {/* Rank 2 - Silver */}
          <div className={`${styles.podiumCard} ${styles.rank2}`}>
            <span className={`${styles.rankBadge} ${styles.rankBadgeSilver}`}>2</span>
            <h3 className={styles.gifterName}>{rank2.name}</h3>
            <div className={styles.podiumAmount}>{rank2.amount}</div>
          </div>

          {/* Rank 1 - Gold */}
          <div className={`${styles.podiumCard} ${styles.rank1}`}>
            <div className={styles.crownBadge}>👑</div>
            <span className={`${styles.rankBadge} ${styles.rankBadgeGold}`}>1</span>
            <h3 className={styles.gifterName}>{rank1.name}</h3>
            <div className={`${styles.podiumAmount} ${styles.podiumAmountGold}`}>{rank1.amount}</div>
          </div>

          {/* Rank 3 - Bronze */}
          <div className={`${styles.podiumCard} ${styles.rank3}`}>
            <span className={`${styles.rankBadge} ${styles.rankBadgeBronze}`}>3</span>
            <h3 className={styles.gifterName}>{rank3.name}</h3>
            <div className={styles.podiumAmount}>{rank3.amount}</div>
          </div>
        </div>

        {/* Remaining Gifters (Rank 4 to 15) */}
        <div className={styles.gifterListGrid}>
          {remainingGifters.map((gifter) => (
            <div key={gifter.rank} className={styles.listCard}>
              <div className={styles.listRank}>{gifter.rank}</div>
              <div className={styles.listInfo}>
                <div className={styles.listName}>{gifter.name}</div>
                <div className={styles.listAmount}>{gifter.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Birthday Wishes Board Form */}
      <WayfinderMessages />

      {/* Photobooth Cheki Section */}
      <section className={styles.photoboothSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Interactive Cheki</span>
          <h2 className={styles.sectionTitle}>📸 Photobooth Cheki #ErineTheWayfinder</h2>
          <p className={styles.sectionDesc}>
            Ambil foto dan buat Cheki eksklusif Seitansai Erine langsung di bawah ini atau buka halaman penuh di{" "}
            <Link href="/photobooth" style={{ color: "#ffd778", textDecoration: "underline", fontWeight: 600 }}>
              cavallery.id/photobooth
            </Link>
            .
          </p>
        </div>

        <div className={styles.photoboothWrap}>
          <iframe
            src="https://photobooth-cheki-19.netlify.app/"
            title="Photobooth Cheki #ErineTheWayfinder"
            className={styles.photoboothIframe}
            allow="camera; microphone; fullscreen; clipboard-write; display-capture"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}
