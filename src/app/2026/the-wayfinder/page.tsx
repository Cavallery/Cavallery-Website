"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

// Target: 21 Agustus 2026 Pukul 02:00:00 WIB (UTC+7)
const UNLOCK_DATE = new Date("2026-08-21T02:00:00+07:00").getTime();

export default function TheWayfinder2026Page() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = UNLOCK_DATE - now;

      if (difference <= 0) {
        setIsUnlocked(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className={styles.page}>
      {/* Background Ambient Glow */}
      <div className={styles.ambientBg}>
        <div className={styles.glowOrb1}></div>
        <div className={styles.glowOrb2}></div>
      </div>

      <div className={styles.container}>
        {/* Navigation Breadcrumb */}
        <div className={styles.topNav}>
          <Link href="/2026/sts-19-erine" className={styles.backLink}>
            ← Kembali ke #ErineTheWayfinder
          </Link>
          <span className={styles.yearBadge}>PROJECT 2026</span>
        </div>

        {!isUnlocked ? (
          /* LOCKED STATE — COUNTDOWN TIMER */
          <div className={styles.lockedCard}>
            <div className={styles.lockIconWrap}>
              <span className={styles.lockIcon}>🧭</span>
              <div className={styles.lockPulse}></div>
            </div>

            <div className={styles.header}>
              <span className={styles.subBadge}>SEITANSAI ERINE 19TH</span>
              <h1 className={styles.title}>THE WAYFINDER</h1>
              <p className={styles.desc}>
                Halaman ini masih terkunci dan sedang dipersiapkan. Pintu gerbang akan terbuka secara otomatis tepat saat hari ulang tahun Erine tiba.
              </p>
            </div>

            {/* Countdown Grid */}
            {mounted && (
              <div className={styles.countdownGrid}>
                <div className={styles.timeBox}>
                  <div className={styles.timeVal}>{String(timeLeft.days).padStart(2, "0")}</div>
                  <div className={styles.timeLabel}>HARI</div>
                </div>
                <div className={styles.timeSeparator}>:</div>

                <div className={styles.timeBox}>
                  <div className={styles.timeVal}>{String(timeLeft.hours).padStart(2, "0")}</div>
                  <div className={styles.timeLabel}>JAM</div>
                </div>
                <div className={styles.timeSeparator}>:</div>

                <div className={styles.timeBox}>
                  <div className={styles.timeVal}>{String(timeLeft.minutes).padStart(2, "0")}</div>
                  <div className={styles.timeLabel}>MENIT</div>
                </div>
                <div className={styles.timeSeparator}>:</div>

                <div className={styles.timeBox}>
                  <div className={`${styles.timeVal} ${styles.secondsVal}`}>
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className={styles.timeLabel}>DETIK</div>
                </div>
              </div>
            )}

            <div className={styles.quoteWrap}>
              <p className={styles.quoteText}>
                “A World Beyond The Horizon awaits — 21 Agustus 2026, 02:00 WIB”
              </p>
            </div>


          </div>
        ) : (
          /* UNLOCKED STATE — THE WAYFINDER CONTENT */
          <div className={styles.unlockedCard}>
            <div className={styles.unlockedHeader}>
              <span className={styles.unlockedBadge}>✨ THE PORTAL IS OPEN</span>
              <h1 className={styles.unlockedTitle}>The Wayfinder Project</h1>
              <p className={styles.unlockedDesc}>
                Selamat datang di halaman resmi The Wayfinder 2026!
              </p>
            </div>

            <div className={styles.contentPlaceholder}>
              <div className={styles.placeholderIcon}>🌟</div>
              <h2>Konten The Wayfinder</h2>
              <p>Konten utama The Wayfinder siap ditampilkan di sini.</p>
              <Link href="/2026/sts-19-erine" className={styles.btnPrimary}>
                Lihat Seluruh Rangkaian Seitansai 2026
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
