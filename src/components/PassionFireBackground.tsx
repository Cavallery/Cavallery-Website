"use client";

import { usePathname } from "next/navigation";
import styles from "./PassionFireBackground.module.css";
import FlameLayer from "./chess/FlameLayer";
import KnightSvg from "./chess/KnightSvg";
import type { CSSProperties } from "react";

// Deterministic ember layout (same on server and client)
const EMBERS = Array.from({ length: 18 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * 12.9898 * n) * 43758.5453;
    return v - Math.floor(v);
  };
  return { x: r(1) * 100, d: 9 + r(2) * 10, dl: -r(3) * 18, s: 3 + r(4) * 4, sway: (r(5) - 0.5) * 80 };
});

/**
 * TEAM PASSION — ambient "heat horizon".
 * Redesigned from full-width cartoon flames into a refined, low-key glow on
 * the bottom edge of the viewport: a hairline of fire + a warm haze that
 * breathes (opacity only). Embers now live where they matter (hero, footer).
 */
export default function PassionFireBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/internal/dashboard-admin-xv7r2q")) {
    return null;
  }

  return (
    <>
    {/* Ambient layer: a giant knight watermark + embers drifting up the page */}
    <div className={styles.ambient} aria-hidden="true">
      <KnightSvg size="100%" className={styles.bigKnight} />
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className={styles.ember}
          style={{ "--x": `${e.x.toFixed(2)}%`, "--d": `${e.d.toFixed(2)}s`, "--dl": `${e.dl.toFixed(2)}s`, "--s": `${e.s.toFixed(1)}px`, "--sway": `${e.sway.toFixed(0)}px` } as CSSProperties}
        />
      ))}
    </div>
    <div className={styles.horizon} aria-hidden="true">
      <div className={styles.haze} />
      <div className={styles.hazeHot} />
      <FlameLayer id="horizon-flames" className={styles.flames} density={16} intensity={0.42} />
      <div className={styles.line} />
    </div>
    </>
  );
}
