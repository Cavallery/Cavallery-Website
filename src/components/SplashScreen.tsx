"use client";
import { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [desktopError, setDesktopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("splashShown")) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("splashShown", "1");
      }, 600);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.splash} ${fadeOut ? styles.fadeOut : ""}`}>
      {/* Desktop: keying logo video */}
      {!desktopError && (
        <video
          className={`${styles.video} ${styles.desktop}`}
          src="/assets/keying-logo-center.mp4"
          autoPlay
          muted
          playsInline
          onError={() => setDesktopError(true)}
        />
      )}
      {/* Mobile: portrait video */}
      {!mobileError && (
        <video
          className={`${styles.video} ${styles.mobile}`}
          src="https://cavallery.id/wp-content/uploads/2025/12/logo-center-portrait.mp4"
          autoPlay
          muted
          playsInline
          onError={() => setMobileError(true)}
        />
      )}
      {/* Fallback text logo */}
      <div className={styles.fallback}>
        <div className={styles.logoInfo}>
          <div className={styles.logoImageWrapper}>
            <img src="/images/cava-logo.jpg" alt="Cavallery Logo" className={styles.logoImage} />
            <div className={styles.logoGlow} />
          </div>
          <div className={styles.logoText}>Cavallery.id</div>
          <div className={styles.logoSub}>Fanbase of Catherina Vallencia</div>
        </div>
      </div>

      {/* Skip button */}
      <button
        className={styles.skip}
        onClick={() => {
          setFadeOut(true);
          setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem("splashShown", "1");
          }, 600);
        }}
      >
        Skip <i className="bx bx-chevron-right" />
      </button>
    </div>
  );
}
