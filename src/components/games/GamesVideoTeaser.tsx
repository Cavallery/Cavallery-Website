"use client";
import { useState } from "react";
import styles from "./GamesVideoTeaser.module.css";

export default function GamesVideoTeaser() {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className={styles.videoWrap}>
      {!videoError ? (
        <video
          src="https://cavallery.id/wp-content/uploads/2025/06/erine-game-.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={styles.video}
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className={styles.fallbackTeaser}>
          <div className={styles.fallbackGlow} />
          <i className="bx bxs-game" style={{ fontSize: "5rem", color: "var(--gold)", filter: "drop-shadow(0 0 15px var(--gold))", marginBottom: "8px" }} />
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--gold)", fontWeight: 900 }}>#GameRine Live Teaser</h2>
          <p style={{ color: "var(--fg-muted)", fontSize: "1rem", fontWeight: 300 }}>Kumpulan mini game seru buatan fanbase Cavallery!</p>
        </div>
      )}
      <div className={styles.videoOverlay}>
        <span className={styles.videoBadge}>
          <i className="bx bxs-joystick" /> Erine Gaming Live
        </span>
        <h2 className={styles.videoTitle}>Erine pernah main semua game ini! 🎮</h2>
      </div>
    </div>
  );
}
