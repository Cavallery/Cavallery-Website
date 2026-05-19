"use client";
import { useState, useEffect } from "react";
import styles from "./BlueRoseCountdown.module.css";

export default function BlueRoseCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [isBloomed, setIsBloomed] = useState(false);

  useEffect(() => {
    const target = new Date("June 13, 2026 00:00:00").getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setIsBloomed(true);
        return;
      }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    const timer = setInterval(tick, 1000);
    tick();

    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.countdownCard}>
          <div className={styles.cdTitle}>Rose Obscura</div>
          
          {isBloomed ? (
            <div className={styles.bloomed}>#RoseObscura</div>
          ) : (
            <div className={styles.timerWrap}>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.days}</div>
                <div className={styles.timeLabel}>Days</div>
              </div>
              <div className={styles.timeSep}>·</div>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.hours}</div>
                <div className={styles.timeLabel}>Hours</div>
              </div>
              <div className={styles.timeSep}>·</div>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.minutes}</div>
                <div className={styles.timeLabel}>Mins</div>
              </div>
              <div className={styles.timeSep}>·</div>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.seconds}</div>
                <div className={styles.timeLabel}>Secs</div>
              </div>
            </div>
          )}
          <div className={styles.dateLine}>13 Juni 2026</div>
        </div>

        <div className={styles.visualContainer}>
          <div className={styles.table} />
          <div className={`${styles.shadeWrap} ${styles.hoverAnimation}`}>
            <div className={styles.flowerWrap}>
              <div className={styles.stem} />
              <div className={styles.petal1} />
              <div className={styles.petal2} />
              <div className={styles.petal3} />
              <div className={styles.petal4} />
              <div className={styles.petal5} />
              <div className={styles.fallingPetal} />
              <div className={styles.leaf1} />
              <div className={styles.leaf2} />
            </div>
          </div>
          
          <div className={styles.shadeWrap}>
            <div className={styles.shadeReflections} />
            <div className={styles.shadeMain}>
              <div className={styles.shadeHandleBig} />
              <div className={styles.shadeHandleSmall} />
              <div className={styles.bottomShade} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
