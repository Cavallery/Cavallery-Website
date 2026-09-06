"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./SplashScreen.module.css";
import { VIDEO_URLS } from "@/lib/videoAssets";

export default function SplashScreen() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const [visible, setVisible] = useState(!isAdmin);
  const [fadeOut, setFadeOut] = useState(false);
  const [desktopError, setDesktopError] = useState(false);
  const [splashVideoSrc, setSplashVideoSrc] = useState<string>(VIDEO_URLS.splashLogo);

  useEffect(() => {
    // Don't run splash logic on admin routes
    if (isAdmin) return;

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
  }, [isAdmin]);

  // Don't render splash on admin routes
  if (isAdmin) return null;

  if (!visible) return null;

  return (
    <div className={`${styles.splash} ${fadeOut ? styles.fadeOut : ""}`}>
      {/* Keying logo video */}
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
        <img
          src="/images/cava-logo-round.png"
          alt="Cavallery"
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      )}

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
