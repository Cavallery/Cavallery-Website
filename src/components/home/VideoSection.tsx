"use client";
import { useState } from "react";
import styles from "./VideoSection.module.css";

const videos = [
  {
    src: "https://cavallery.id/wp-content/uploads/2025/11/Cavallery_ErineInEtherland_-_LAPAK_GAMING_SERU_BANGET____Hari_ini_kita_menemani_ketua_CErine_JKT4._5FWGRc.mp4",
    title: "LAPAK GAMING SERU BANGET!",
    desc: "Erine in Etherland Gaming Session",
    tag: "Gaming",
  },
  {
    src: "https://cavallery.id/wp-content/uploads/2025/09/video-sts-erineinetherland.mp4",
    title: "Erine In Etherland — STS",
    desc: "Special moments dari Erine In Etherland",
    tag: "Highlight",
  },
  {
    src: "https://cavallery.id/wp-content/uploads/2025/05/video-4.mp4",
    title: "Erine Moments #4",
    desc: "Koleksi momen terbaik Erine",
    tag: "Moments",
  },
  {
    src: "https://cavallery.id/wp-content/uploads/2025/05/video-2.mp4",
    title: "Erine Moments #2",
    desc: "Koleksi momen terbaik Erine",
    tag: "Moments",
  },
  {
    src: "https://cavallery.id/wp-content/uploads/2025/05/video-1.mp4",
    title: "Erine Moments #1",
    desc: "Koleksi momen terbaik Erine",
    tag: "Moments",
  },
];

export default function VideoSection() {
  const [active, setActive] = useState(0);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className="badge">
          <i className="bx bx-play-circle" /> Video Gallery
        </div>
        <h2 className={`sectionTitle textGold ${styles.title}`}>Erine Moments</h2>
        <div className="divider" />
        <p className={styles.subtitle}>Kumpulan video dan momen terbaik Erine bersama Cavallery.</p>
      </div>

      <div className={styles.grid}>
        {/* Main player */}
        <div className={styles.player}>
          <video
            key={videos[active].src}
            src={videos[active].src}
            controls
            autoPlay
            playsInline
            className={styles.video}
          />
          <div className={styles.playerInfo}>
            <span className="badge" style={{ fontSize: ".7rem" }}>
              {videos[active].tag}
            </span>
            <h3 className={styles.playerTitle}>{videos[active].title}</h3>
            <p className={styles.playerDesc}>{videos[active].desc}</p>
          </div>
        </div>

        {/* Playlist */}
        <div className={styles.playlist}>
          {videos.map((v, i) => (
            <button
              key={i}
              className={`${styles.item} ${i === active ? styles.itemActive : ""}`}
              onClick={() => setActive(i)}
            >
              <div className={styles.itemThumb}>
                <video
                  src={v.src + "#t=0.5"}
                  muted
                  playsInline
                  className={styles.thumbVideo}
                  preload="none"
                />
                <div className={styles.playIcon}>
                  <i className={`bx ${i === active ? "bxs-pause-circle" : "bxs-play-circle"}`} />
                </div>
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTag}>{v.tag}</span>
                <span className={styles.itemTitle}>{v.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
