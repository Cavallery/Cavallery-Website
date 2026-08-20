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

interface GifterGroup {
  tierId: "pathfinder" | "navigator" | "explorer";
  title: string;
  badge: string;
  rows: { name: string; rot: number; offset?: number; isLead?: boolean }[][];
}

const GIFTER_BOARD_GROUPS: GifterGroup[] = [
  {
    tierId: "pathfinder",
    title: "PATHFINDER",
    badge: "👑 PATHFINDER",
    rows: [
      // Baris 1 (Paling Atas & Paling Menonjol): MPK & William Santoso
      [
        { name: "MPK", rot: -1.8, offset: 4, isLead: true },
        { name: "William Santoso", rot: 1.5, offset: -4, isLead: true },
      ],
      // Baris 2: Rifqi Annafi, Firstarisa, Ucing Erine, iCaa
      [
        { name: "Rifqi Annafi", rot: -1.5, offset: 6 },
        { name: "Firstarisa", rot: 1.2, offset: -4 },
        { name: "Ucing Erine", rot: -1.6, offset: 5 },
        { name: "iCaa", rot: 1.4, offset: -5 },
      ],
    ],
  },
  {
    tierId: "navigator",
    title: "NAVIGATOR",
    badge: "💎 NAVIGATOR",
    rows: [
      [
        { name: "Lucky Arasyah", rot: 1.2, offset: 4 },
        { name: "Indyraaa", rot: -1.4, offset: -4 },
      ],
      [
        { name: "NabilRasyaaaa", rot: 1.6, offset: 5 },
        { name: "Salma Nada", rot: -1.1, offset: -3 },
      ],
    ],
  },
  {
    tierId: "explorer",
    title: "EXPLORER",
    badge: "⭐ EXPLORER",
    rows: [
      [
        { name: "Cipuyyy", rot: -1.2, offset: 2 },
        { name: "Angga", rot: 1.5, offset: -3 },
        { name: "RFDorable", rot: -0.9, offset: 4 },
        { name: "Vend.", rot: 1.3, offset: -2 },
      ],
      [
        { name: "Roni Eriyanto", rot: -1.6, offset: 3 },
        { name: "🐝🐥", rot: 1.1, offset: -4 },
        { name: "Nugo", rot: -1.4, offset: 3 },
      ],
    ],
  },
];

export default function ErineTheWayfinderPage() {
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

      {/* Top Gifters Appreciation Board (Sticker Collage Style) */}
      <section className={styles.gifterSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Special Appreciation</span>
          <h2 className={styles.sectionTitle}>🏆 Top Gifter #ErineTheWayfinder</h2>
          <p className={styles.sectionDesc}>
            Apresiasi dan terima kasih setinggi-tingginya kepada para Top Gifter atas kontribusi luar biasa untuk menyukseskan Seitansai Project Erine 2026.
          </p>
        </div>

        {/* The Exhibition Appreciation Board */}
        <div className={styles.appreciationBoard}>
          {GIFTER_BOARD_GROUPS.map((group) => (
            <div key={group.tierId} className={`${styles.boardTierSection} ${styles[group.tierId]}`}>
              {/* Category Ribbon / Strip */}
              <div className={styles.tierRibbon}>
                <span className={styles.tierRibbonText}>{group.title}</span>
              </div>

              {/* Rows Formation with Staggered Sticker Tags */}
              <div className={styles.stickersFlow}>
                {group.rows.map((row, rIdx) => (
                  <div key={rIdx} className={styles.stickersRow}>
                    {row.map((item, idx) => (
                      <span
                        key={idx}
                        className={`${styles.stickerTag} ${styles[`${group.tierId}Tag`]} ${item.isLead ? styles.leadTag : ""}`}
                        style={{
                          transform: `rotate(${item.rot}deg) translateY(${item.offset || 0}px)`,
                        }}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom Footer Note Strip */}
          <div className={styles.boardFooterStrip}>
            <span>
              serta seluruh warga Cavallery yang telah berpartisipasi dalam seluruh rangkaian penggalangan dana & kegiatan Seitansai Erine 2026
            </span>
          </div>
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
