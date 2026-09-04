"use client";

import React, { useMemo } from "react";
import styles from "./PassionFireBackground.module.css";

// 24 pre-defined organic embers with varied positions, sizes, and delays
const SEED_EMBERS = [
  { id: 1, left: 5, size: 3, dur: 7.2, delay: 0.2, color: "gold", d1: 15, d2: -10, d3: 20, d4: -5 },
  { id: 2, left: 12, size: 4, dur: 6.5, delay: 1.8, color: "fire", d1: -12, d2: 18, d3: -10, d4: 15 },
  { id: 3, left: 18, size: 2.5, dur: 8.4, delay: 3.2, color: "amber", d1: 20, d2: -15, d3: 12, d4: -18 },
  { id: 4, left: 24, size: 5, dur: 5.8, delay: 0.8, color: "fire", d1: -18, d2: 12, d3: -22, d4: 8 },
  { id: 5, left: 29, size: 3.5, dur: 7.8, delay: 2.4, color: "gold", d1: 10, d2: -12, d3: 15, d4: -8 },
  { id: 6, left: 35, size: 2, dur: 9.1, delay: 4.1, color: "amber", d1: -15, d2: 10, d3: -18, d4: 12 },
  { id: 7, left: 42, size: 4.5, dur: 6.2, delay: 1.1, color: "fire", d1: 18, d2: -20, d3: 10, d4: -15 },
  { id: 8, left: 48, size: 3, dur: 8.0, delay: 2.9, color: "gold", d1: -10, d2: 15, d3: -12, d4: 20 },
  { id: 9, left: 54, size: 2.5, dur: 7.5, delay: 0.5, color: "amber", d1: 12, d2: -10, d3: 22, d4: -12 },
  { id: 10, left: 61, size: 4, dur: 6.9, delay: 3.7, color: "fire", d1: -22, d2: 14, d3: -15, d4: 10 },
  { id: 11, left: 67, size: 3.2, dur: 8.6, delay: 1.5, color: "gold", d1: 16, d2: -18, d3: 14, d4: -20 },
  { id: 12, left: 73, size: 5, dur: 5.9, delay: 2.1, color: "fire", d1: -14, d2: 20, d3: -10, d4: 16 },
  { id: 13, left: 79, size: 2.8, dur: 9.5, delay: 0.9, color: "amber", d1: 10, d2: -15, d3: 18, d4: -10 },
  { id: 14, left: 86, size: 3.8, dur: 7.0, delay: 3.4, color: "gold", d1: -16, d2: 12, d3: -20, d4: 14 },
  { id: 15, left: 92, size: 4.2, dur: 6.7, delay: 1.9, color: "fire", d1: 14, d2: -12, d3: 16, d4: -8 },
  { id: 16, left: 8, size: 3.2, dur: 8.2, delay: 4.5, color: "amber", d1: -12, d2: 16, d3: -14, d4: 18 },
  { id: 17, left: 22, size: 4.8, dur: 6.0, delay: 3.9, color: "fire", d1: 15, d2: -18, d3: 12, d4: -15 },
  { id: 18, left: 38, size: 2.5, dur: 9.0, delay: 2.2, color: "gold", d1: -10, d2: 14, d3: -16, d4: 12 },
  { id: 19, left: 51, size: 3.6, dur: 7.4, delay: 4.8, color: "amber", d1: 18, d2: -14, d3: 20, d4: -16 },
  { id: 20, left: 64, size: 4.5, dur: 6.4, delay: 2.7, color: "fire", d1: -20, d2: 15, d3: -12, d4: 14 },
  { id: 21, left: 77, size: 2.2, dur: 8.8, delay: 5.1, color: "gold", d1: 14, d2: -16, d3: 18, d4: -12 },
  { id: 22, left: 89, size: 3.4, dur: 7.1, delay: 4.2, color: "fire", d1: -15, d2: 12, d3: -18, d4: 10 },
  { id: 23, left: 15, size: 2.8, dur: 8.5, delay: 5.6, color: "gold", d1: 12, d2: -14, d3: 15, d4: -8 },
  { id: 24, left: 82, size: 4.0, dur: 6.8, delay: 5.3, color: "amber", d1: -18, d2: 15, d3: -12, d4: 16 },
];

const COLOR_MAP: Record<string, { bg: string; shadow: string }> = {
  fire: {
    bg: "#ff4500",
    shadow: "0 0 6px #ff3300, 0 0 12px #ff6600",
  },
  amber: {
    bg: "#ff8c00",
    shadow: "0 0 6px #ff7700, 0 0 12px #ffaa00",
  },
  gold: {
    bg: "#f5d880",
    shadow: "0 0 6px #eab308, 0 0 12px #ca8a04",
  },
};

export default function PassionFireBackground() {
  return (
    <div className={styles.fireContainer} aria-hidden="true">
      {/* 1. Hawa Hangat Membara dari Bawah */}
      <div className={styles.ambientHeatGlow} />

      {/* 2. Aura Api Lembut di Balik Kuda (Knight) */}
      <div className={styles.knightFireAura} />

      {/* 3. Aura Api Lembut di Balik Pion (Pawn) */}
      <div className={styles.pawnFireAura} />
    </div>
  );
}
