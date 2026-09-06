"use client";
import { useState } from "react";
import styles from "./VideoSection.module.css";
import { VIDEO_URLS } from "@/lib/videoAssets";

export default function VideoSection() {
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URLS.homepageTeaser);
  const [videoError, setVideoError] = useState(false);

  const handleVideoError = () => {
    setVideoError(true);
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bx-play-circle" /> Official Teaser
          </div>
          <h2 className={`sectionTitle textGold ${styles.title}`}>
            Erine Moments
          </h2>
          <div className="divider" style={{ margin: "16px auto 20px" }} />
          <p className={styles.subtitle}>
            Video teaser resmi dan momen-momen terbaik Erine JKT48 bersama
            fanbase Cavallery.
          </p>
        </div>

        <div className={styles.centerContainer}>
          <div className={styles.player}>
            {!videoError ? (
              <video
                src={videoSrc}
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className={styles.video}
                onError={handleVideoError}
              />
            ) : (
              <div className={styles.fallbackPlayer}>
                <i
                  className="bx bx-play-circle"
                  style={{
                    fontSize: "4.5rem",
                    color: "var(--gold)",
                    filter: "drop-shadow(0 0 15px var(--gold))",
                  }}
                />
                <h3 className={styles.fallbackTitle}>Video Offline</h3>
                <p className={styles.fallbackDesc}>
                  Mohon maaf, video preview dari cavallery.id sedang tidak dapat
                  dimuat saat ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
