"use client";

import { usePathname } from "next/navigation";
import styles from "./PassionFireBackground.module.css";

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
    <div className={styles.horizon} aria-hidden="true">
      <div className={styles.haze} />
      <div className={styles.hazeHot} />
      <div className={styles.line} />
    </div>
  );
}
