"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./BirthdayCountdown.module.css";

const COLORS = ['#ff6b81', '#ffd93d', '#6bcbef', '#a685e2', '#7bed9f', '#ff9ff3', '#ffa502'];

export default function BirthdayCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [isBirthday, setIsBirthday] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; left: string; bg: string; dur: string; size: number; w: string; h: string; rot: string }[]>([]);

  useEffect(() => {
    // Target: 21 August 2026, 00:00:00 local time
    const target = new Date("August 21, 2026 00:00:00").getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setIsBirthday(true);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

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

  useEffect(() => {
    if (!isBirthday) return;
    
    // Spawn confetti continuously
    let idCounter = 0;
    const spawnConfetti = () => {
      setConfetti(prev => {
        const newPieces = [];
        for(let i=0; i<3; i++) {
          const size = 6 + Math.random() * 8;
          newPieces.push({
            id: idCounter++,
            left: Math.random() * 100 + "vw",
            bg: COLORS[Math.floor(Math.random() * COLORS.length)],
            dur: (3 + Math.random() * 3) + "s",
            size,
            w: size + "px",
            h: (size * 0.4) + "px",
            rot: "rotate(" + (Math.random() * 360) + "deg)"
          });
        }
        // keep last 50 pieces to prevent memory leak
        return [...prev, ...newPieces].slice(-50);
      });
    };

    const confettiTimer = setInterval(spawnConfetti, 300);
    return () => clearInterval(confettiTimer);
  }, [isBirthday]);

  return (
    <section className={styles.section}>
      <div className={`glassCard ${styles.countdownCard}`}>
        {isBirthday && (
          <div className={styles.confettiContainer}>
            {confetti.map(c => (
              <div
                key={c.id}
                className={styles.confettiPiece}
                style={{
                  left: c.left,
                  background: c.bg,
                  animationDuration: c.dur,
                  width: c.w,
                  height: c.h,
                  transform: c.rot,
                  opacity: 0.7 + Math.random() * 0.3
                }}
              />
            ))}
          </div>
        )}

        {!isBirthday ? (
          <>
            <div className={styles.header}>
              <i className={`bx bx-party ${styles.icon}`}></i>
              <h2 className={styles.title}>
                Menuju Ulang Tahun ke-19
              </h2>
              <p className={styles.subtitle}>Catherina Vallencia Kurniawan</p>
            </div>
            <div className={styles.timerWrap}>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.days}</div>
                <div className={styles.timeLabel}>Hari</div>
              </div>
              <div className={styles.timeSep}>:</div>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.hours}</div>
                <div className={styles.timeLabel}>Jam</div>
              </div>
              <div className={styles.timeSep}>:</div>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.minutes}</div>
                <div className={styles.timeLabel}>Menit</div>
              </div>
              <div className={styles.timeSep}>:</div>
              <div className={styles.timeUnit}>
                <div className={styles.timeNumber}>{timeLeft.seconds}</div>
                <div className={styles.timeLabel}>Detik</div>
              </div>
            </div>
            <div className="badge">
              <i className="bx bx-calendar-star" /> 21 Agustus 2026
            </div>
          </>
        ) : (
          <div className={styles.greetingWrap}>
            <div className={styles.header}>
              <i className={`bx bx-gift ${styles.icon}`}></i>
              <h2 className={styles.title}>Happy 19th Birthday, Erine!</h2>
            </div>
            <p className={styles.message}>
              Selamat ulang tahun untuk si bebek kesayangan Cavallery! 
              Semoga di usia yang baru ini kamu semakin bersinar, selalu sehat, dan terus menginspirasi kita semua. 
              Kami akan selalu ada di sini, mendukung setiap langkah dan mimpi-mimpimu. Terbanglah lebih tinggi! 💛
            </p>
          </div>
        )}

        {/* Cake Visualization always visible */}
        <div className={styles.cakeWrapper}>
          <div className={styles.plate}></div>
          <div className={`${styles.cakeLayer} ${styles.layerBottom}`}></div>
          <div className={`${styles.cakeLayer} ${styles.layerMiddle}`}></div>
          <div className={`${styles.cakeLayer} ${styles.layerTop}`}></div>
          <div className={styles.icing}></div>
          <div className={`${styles.drip} ${styles.drip1}`}></div>
          <div className={`${styles.drip} ${styles.drip2}`}></div>
          <div className={`${styles.drip} ${styles.drip3}`}></div>
          <div className={styles.candles}>
            <div className={`${styles.digit} ${styles.digit1}`}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <text x="62" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="900" textAnchor="middle" fill="#7B020B">1</text>
              </svg>
              <div className={`${styles.flame} ${styles.digit1Flame}`}></div>
            </div>
            <div className={`${styles.digit} ${styles.digit9}`}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <text x="38" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="900" textAnchor="middle" fill="#7B020B">9</text>
              </svg>
              <div className={`${styles.flame} ${styles.digit9Flame}`}></div>
            </div>
          </div>
        </div>

        {/* Memorine Form & Actions */}
        <div className={styles.formContainer}>
          <div className={styles.formTitle}>Kirim Pesan di Memorine</div>
          <form className={styles.inputGroup} onSubmit={(e) => { e.preventDefault(); alert('Pesan berhasil disimpan di Memorine!'); }}>
            <input type="text" className={styles.input} placeholder="Nama kamu" required />
            <textarea className={styles.textarea} placeholder="Tulis ucapan ulang tahun untuk Erine..." required></textarea>
            <button type="submit" className={styles.submitBtn}>
              <i className="bx bx-send" /> Kirim Pesan
            </button>
          </form>
        </div>

        <div className={styles.memorineActions}>
          <Link href="http://localhost:3001/journal" className={styles.memorineLink}>
            <i className="bx bx-book-heart" /> Lihat di pesan Memorine
          </Link>
        </div>
      </div>
    </section>
  );
}
