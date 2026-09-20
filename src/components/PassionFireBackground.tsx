"use client";

import React, { useEffect, useState } from "react";
import styles from "./PassionFireBackground.module.css";

// 16 curated lightweight embers for smooth performance without laptop heating
const LIGHT_EMBERS = [
  { id: 1, left: 6, size: 6.5, dur: 6.2, delay: 0.2, dx1: 22, dx2: -16, color: "#ff4500" },
  { id: 2, left: 14, size: 7.5, dur: 5.4, delay: 1.8, dx1: -18, dx2: 20, color: "#ff8c00" },
  { id: 3, left: 21, size: 5.5, dur: 7.2, delay: 3.2, dx1: 18, dx2: -14, color: "#f59e0b" },
  { id: 4, left: 28, size: 8.5, dur: 5.0, delay: 0.7, dx1: -20, dx2: 16, color: "#ff3d00" },
  { id: 5, left: 36, size: 6.0, dur: 6.8, delay: 2.5, dx1: 16, dx2: -18, color: "#fbbf24" },
  { id: 6, left: 44, size: 7.0, dur: 5.8, delay: 4.1, dx1: -18, dx2: 14, color: "#ff4500" },
  { id: 7, left: 52, size: 5.5, dur: 7.0, delay: 1.2, dx1: 18, dx2: -22, color: "#ff8c00" },
  { id: 8, left: 59, size: 8.0, dur: 5.2, delay: 2.9, dx1: -16, dx2: 18, color: "#f59e0b" },
  { id: 9, left: 67, size: 6.5, dur: 6.5, delay: 0.5, dx1: 20, dx2: -16, color: "#ff3d00" },
  { id: 10, left: 74, size: 7.5, dur: 6.0, delay: 3.6, dx1: -22, dx2: 18, color: "#fbbf24" },
  { id: 11, left: 82, size: 6.0, dur: 7.5, delay: 1.6, dx1: 18, dx2: -14, color: "#ff8c00" },
  { id: 12, left: 90, size: 8.0, dur: 5.5, delay: 2.2, dx1: -18, dx2: 16, color: "#ff4500" },
  { id: 13, left: 18, size: 7.0, dur: 6.2, delay: 4.6, dx1: 16, dx2: -20, color: "#f59e0b" },
  { id: 14, left: 48, size: 5.5, dur: 7.8, delay: 5.2, dx1: -20, dx2: 18, color: "#fbbf24" },
  { id: 15, left: 63, size: 7.5, dur: 5.6, delay: 4.9, dx1: 18, dx2: -16, color: "#ff3d00" },
  { id: 16, left: 86, size: 6.5, dur: 6.6, delay: 5.5, dx1: -14, dx2: 20, color: "#ff8c00" },
];

export default function PassionFireBackground() {
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Pause animations when user switches to another tab to preserve 100% CPU & battery
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div
      className={`${styles.fireContainer} ${!isTabVisible ? styles.paused : ""}`}
      aria-hidden="true"
    >
      {/* 1. Hawa Hangat Membara dari Bawah (Ambient Heat) */}
      <div className={styles.ambientHeatGlow} />

      {/* 2. Gelombang Lidah Api Bergerak (Hardware-Accelerated SVG Flames) */}
      <div className={styles.flameWrapper}>
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          className={styles.flameSvg}
        >
          <defs>
            <linearGradient id="fireGradBack" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#c2410c" stopOpacity="0.55" />
              <stop offset="80%" stopColor="#d97706" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fireGradMid" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#ea580c" stopOpacity="0.65" />
              <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fireGradFront" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.90" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.70" />
              <stop offset="85%" stopColor="#fde047" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Lidah Api Belakang (Slow, Deep Red-Orange) */}
          <path
            className={styles.flamePathBack}
            fill="url(#fireGradBack)"
            d="M0,220 L0,120 Q120,40 240,110 T480,80 T720,120 T960,75 T1200,115 T1440,70 L1440,220 Z"
          />

          {/* Lidah Api Tengah (Dancing Vibrant Amber) */}
          <path
            className={styles.flamePathMid}
            fill="url(#fireGradMid)"
            d="M0,220 L0,135 Q180,65 360,125 T720,85 T1080,135 T1440,90 L1440,220 Z"
          />

          {/* Lidah Api Depan (Golden Flickering Warmth) */}
          <path
            className={styles.flamePathFront}
            fill="url(#fireGradFront)"
            d="M0,220 L0,150 Q160,95 320,145 T640,105 T960,150 T1280,100 T1440,145 L1440,220 Z"
          />
        </svg>
      </div>

      {/* 3. Aura Api Bergerak di Balik Kuda (Knight) & Pion (Pawn) */}
      <div className={styles.knightFireAura} />
      <div className={styles.pawnFireAura} />

      {/* 4. Percikan Bunga Api Membara (Ultra-lightweight GPU Embers) */}
      <div className={styles.embersContainer}>
        {LIGHT_EMBERS.map((emb) => (
          <span
            key={emb.id}
            className={styles.ember}
            style={
              {
                left: `${emb.left}%`,
                width: `${emb.size}px`,
                height: `${emb.size}px`,
                animationDuration: `${emb.dur}s`,
                animationDelay: `${emb.delay}s`,
                "--dx1": `${emb.dx1}px`,
                "--dx2": `${emb.dx2}px`,
                "--ember-color": emb.color,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
