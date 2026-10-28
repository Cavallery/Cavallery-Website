"use client";

import React, { CSSProperties } from "react";
import styles from "./AdminPassionBackground.module.css";
import FlameLayer from "@/components/chess/FlameLayer";
import KnightSvg from "@/components/chess/KnightSvg";

// Deterministic ember layout (identik di server dan client)
const EMBERS = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * 12.9898 * n) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    x: r(1) * 100,
    d: 8 + r(2) * 8,
    dl: -r(3) * 16,
    s: 3 + r(4) * 4,
    sway: (r(5) - 0.5) * 80,
  };
});

/**
 * Background Passion khas Cavallery untuk halaman Login Admin:
 * - Watermark Ksatria Catur (Knight) raksasa
 * - Partikel bara api (embers) melayang ke atas
 * - Horizon api (FlameLayer) + hangatnya glow haze di bagian bawah
 */
export default function AdminPassionBackground() {
  return (
    <div className={styles.bgRoot} aria-hidden="true">
      {/* Texture Grain & Ambient Gradients */}
      <div className={styles.texture} />
      <div className={styles.radialGlowTop} />

      {/* Ambient layer: Watermark Knight & Embers melayang */}
      <div className={styles.ambient}>
        <KnightSvg size="100%" className={styles.bigKnight} />
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className={styles.ember}
            style={
              {
                "--x": `${e.x.toFixed(2)}%`,
                "--d": `${e.d.toFixed(2)}s`,
                "--dl": `${e.dl.toFixed(2)}s`,
                "--s": `${e.s.toFixed(1)}px`,
                "--sway": `${e.sway.toFixed(0)}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Horizon layer: Lidah Api & Haze hangat di bawah */}
      <div className={styles.horizon}>
        <div className={styles.haze} />
        <div className={styles.hazeHot} />
        <FlameLayer id="admin-passion-flames" className={styles.flames} density={18} intensity={0.5} />
        <div className={styles.line} />
      </div>
    </div>
  );
}
