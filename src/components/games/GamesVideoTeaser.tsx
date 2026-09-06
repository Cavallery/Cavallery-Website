"use client";
import { useState } from "react";
import styles from "./GamesVideoTeaser.module.css";

export default function GamesVideoTeaser() {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className={styles.videoWrap}>
      {!videoError ? (
        <video
          src="https://cava.jkt48connect.com/erine-game.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className={styles.video}
          onError={() => setVideoError(true)}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
            minHeight: 200,
          }}
        >
          <i
            className="bx bxs-joystick-alt"
            style={{
              fontSize: "3.5rem",
              color: "var(--gold)",
              marginBottom: 8,
            }}
          />
          <p style={{ color: "var(--fg-muted)", fontSize: "0.85rem" }}>
            Video game teaser sedang tidak tersedia.
          </p>
        </div>
      )}
    </div>
  );
}
