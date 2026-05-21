"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import styles from "./HeroSection.module.css";

const typewriterTexts = [
  "Home of Erine’s Biggest supporters",
  "We are the Cavalry of princess erine",
  "Duck Princess named Catherina Vallencia"
];

const slideImages = [
  "/images/erine1.jpg",
  "/images/erine2.jpg",
  "/images/erine3.jpg"
];

export default function HeroSection() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlayingJiko, setIsPlayingJiko] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleJiko = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/jikorine1.mp4');
      audioRef.current.onended = () => setIsPlayingJiko(false);
    }
    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => {
        console.error("Audio error:", e);
        setIsPlayingJiko(false);
      });
      setIsPlayingJiko(true);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingJiko(false);
    }
  };

  // Typewriter Effect
  useEffect(() => {
    const currentFullText = typewriterTexts[textIndex];
    const speed = isDeleting ? 40 : 80;
    const delay = isDeleting ? (displayText === "" ? 1000 : speed) : (displayText === currentFullText ? 2000 : speed);

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText !== currentFullText) {
          setDisplayText(currentFullText.substring(0, displayText.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        if (displayText !== "") {
          setDisplayText(currentFullText.substring(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % typewriterTexts.length);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex]);

  // Slideshow Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slideImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className="badge">
            <i className="bx bxs-chess" /> Official Fanbase Erine JKT48
          </div>
          <h1 className={styles.title}>
            Welcome to <span className="textGold">Cavallery!</span>
          </h1>
          
          <div className={styles.typewriterWrapper}>
            <span className={styles.typewriterText}>{displayText}</span>
            <span className={styles.cursor}>|</span>
          </div>

          <p className={styles.desc}>
            Selamat datang di Cavallery — barisan pelindung Erine, selalu siap mendukungnya 
            di setiap langkah perjuangannya. Bersama kita susun strategi dukungan terbaik.
          </p>

          <div className={styles.actions}>
            <Link href="/about/erine" className="btnPrimary">
              Meet Erine? <i className="bx bx-chevron-down" />
            </Link>
            <button className="btnOutline" onClick={toggleJiko} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={`bx ${isPlayingJiko ? 'bx-pause-circle' : 'bx-play-circle'}`} style={{ fontSize: '1.2rem' }} /> 
              {isPlayingJiko ? 'Playing...' : 'Play Jikoshoukai'}
            </button>
          </div>
          
        </div>

        <div className={styles.visual}>
          <div className={styles.archWrapper}>
            <div className={styles.archBorder} />
            <div className={styles.archContainer}>
              {slideImages.map((src, idx) => (
                <img
                  key={src}
                  src={src}
                  alt={`Erine Slide ${idx + 1}`}
                  className={`${styles.slide} ${idx === slideIndex ? styles.active : ""}`}
                />
              ))}
            </div>
            <div className={styles.floatingCard}>
              <strong className="textGold">JKT48 Erine</strong>
              <span><i className="bx bxs-chess" /> Gen 12 Member</span>
            </div>
          </div>
          
          <div className={styles.knightWrapper}>
            <i className={`bx bxs-chess ${styles.knightIcon}`} />
          </div>
        </div>
      </div>
      
      {/* Decorative Chess Knight in background */}
      <div className={styles.bgKnight}>
        <i className="bx bxs-chess" />
      </div>
    </section>
  );
}
