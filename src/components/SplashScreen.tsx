"use client";
import { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [desktopError, setDesktopError] = useState(false);

  useEffect(() => {
    let mainTimer: NodeJS.Timeout;
    let fadeTimer: NodeJS.Timeout;

    const startSplash = () => {
      setVisible(true);
      setFadeOut(false);
      
      clearTimeout(mainTimer);
      clearTimeout(fadeTimer);

      mainTimer = setTimeout(() => {
        setFadeOut(true);
        fadeTimer = setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("splashShown", "1");
        }, 600);
      }, 1800);
    };

    // Initial check
    if (sessionStorage.getItem("splashShown")) {
      setVisible(false);
    } else {
      startSplash();
    }

    const handleTrigger = () => {
      startSplash();
    };

    window.addEventListener("trigger-splash", handleTrigger);

    return () => {
      clearTimeout(mainTimer);
      clearTimeout(fadeTimer);
      window.removeEventListener("trigger-splash", handleTrigger);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.splash} ${fadeOut ? styles.fadeOut : ""}`}>
      {/* Keying logo video */}
      {!desktopError && (
        <video
          className={styles.video}
          src="/assets/keying-logo-center.mp4"
          autoPlay
          muted
          playsInline
          onError={() => setDesktopError(true)}
        />
      )}
      {/* Fallback text logo removed as requested */}

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
