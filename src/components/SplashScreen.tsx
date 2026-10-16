"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./SplashScreen.module.css";
import { VIDEO_URLS } from "@/lib/videoAssets";

const COLUMNS = 8;
const EXIT_MS = 1100;

/** Tells the hero it can start its intro (under the lifting mask). */
function announceDone() {
  window.dispatchEvent(new Event("cv:splash-done"));
}

export default function SplashScreen() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/internal/dashboard-admin-xv7r2q");

  const [visible, setVisible] = useState(!isAdmin);
  const [fadeOut, setFadeOut] = useState(false);
  const [desktopError, setDesktopError] = useState(false);
  const [splashVideoSrc] = useState<string>(VIDEO_URLS.splashLogo);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginExit = () => {
    setFadeOut(true);
    announceDone();
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("splashShown", "1");
      } catch {
        /* private mode */
      }
    }, EXIT_MS);
  };

  useEffect(() => {
    if (isAdmin) return;

    let mainTimer: ReturnType<typeof setTimeout>;

    const startSplash = () => {
      setVisible(true);
      setFadeOut(false);
      clearTimeout(mainTimer);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      mainTimer = setTimeout(beginExit, 1800);
    };

    let shown = false;
    try {
      shown = Boolean(sessionStorage.getItem("splashShown"));
    } catch {
      shown = true;
    }

    if (shown) {
      setVisible(false);
      announceDone();
    } else {
      startSplash();
    }

    window.addEventListener("trigger-splash", startSplash);

    return () => {
      clearTimeout(mainTimer);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      window.removeEventListener("trigger-splash", startSplash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (isAdmin) return null;
  if (!visible) return null;

  return (
    <div
      className={`${styles.splash} ${fadeOut ? styles.fadeOut : ""}`}
      data-splash={fadeOut ? "exiting" : "active"}
      data-motion
    >
      {/* 8 board columns form the mask; they lift away on exit */}
      <div className={styles.columns} aria-hidden="true">
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <span
            key={i}
            className={styles.col}
            data-tone={i % 2 === 0 ? "a" : "b"}
            style={{ transitionDelay: `${Math.abs(i - (COLUMNS - 1) / 2) * 55}ms` }}
          />
        ))}
      </div>

      <div className={styles.content}>
        {!desktopError ? (
          <video
            className={styles.video}
            src={splashVideoSrc}
            autoPlay
            muted
            playsInline
            onError={() => {
              setDesktopError(true);
            }}
          />
        ) : (
          <img src="/images/cava-logo-round.png" alt="Cavallery" className={styles.fallbackLogo} />
        )}
      </div>

      <button className={styles.skip} onClick={beginExit}>
        Skip
        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
          <path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </div>
  );
}
