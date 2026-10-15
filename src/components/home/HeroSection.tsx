/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import styles from "./HeroSection.module.css";
import { VIDEO_URLS } from "@/lib/videoAssets";
import { gsap, useGSAP, MQ, prefersReducedMotion } from "@/lib/gsap";
import EmberField from "@/components/chess/EmberField";
import ChessEyebrow from "@/components/chess/ChessEyebrow";
import KnightSvg from "@/components/chess/KnightSvg";

const typewriterTexts = [
  "Home of Erine’s Biggest supporters",
  "We are the Cavalry of princess erine",
  "Duck Princess named Catherina Vallencia",
];

/** erine1–3 · per-slide framing so faces stay centred in the 3:4 frame. */
const SLIDES = [
  { src: "/images/erine1.jpg", pos: "50% 30%", zoom: 1 },
  { src: "/images/erine2.jpg", pos: "50% 26%", zoom: 1 },
  { src: "/images/erine3.jpg", pos: "50% 42%", zoom: 1.16 },
];

const COLS = 4;
const ROWS = 6; // 24 tiles
const TILES = Array.from({ length: COLS * ROWS }, (_, i) => ({ c: i % COLS, r: Math.floor(i / COLS) }));
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const pad = (n: number) => String(n).padStart(2, "0");

function Typewriter() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = typewriterTexts[textIndex];
    const speed = isDeleting ? 40 : 80;
    const delay = isDeleting
      ? displayText === ""
        ? 1000
        : speed
      : displayText === currentFullText
        ? 2000
        : speed;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText !== currentFullText) {
          setDisplayText(currentFullText.substring(0, displayText.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else if (displayText !== "") {
        setDisplayText(currentFullText.substring(0, displayText.length - 1));
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % typewriterTexts.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex]);

  return (
    <p className={styles.typewriter} aria-live="off">
      <span className={styles.typeText}>{displayText}</span>
      <span className={styles.caret} aria-hidden="true" />
    </p>
  );
}

function JikoTile() {
  const [isPlayingJiko, setIsPlayingJiko] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleJiko = () => {
    if (!audioRef.current) {
      const audio = new Audio(VIDEO_URLS.jikorineAudio);
      audio.onerror = () => {
        setIsPlayingJiko(false);
      };
      audio.onended = () => setIsPlayingJiko(false);
      audioRef.current = audio;
    }
    if (audioRef.current.paused) {
      audioRef.current.play().catch((e) => {
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

  useEffect(() => () => audioRef.current?.pause(), []);

  return (
    <button
      type="button"
      className={`${styles.tile} ${styles.tileDark}`}
      onClick={toggleJiko}
      aria-pressed={isPlayingJiko}
    >
      <span className={styles.tileFlip} aria-hidden="true" />
      <span className={styles.tileGlint} aria-hidden="true" />
      <span className={styles.tileSq}>e5</span>
      <span className={styles.tileLabel}>{isPlayingJiko ? "Playing..." : "Play Jikoshoukai"}</span>
      <span className={styles.tileIcon} aria-hidden="true">
        {isPlayingJiko ? (
          <span className={styles.eq}>
            <i />
            <i />
            <i />
          </span>
        ) : (
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default function HeroSection() {
  preload(SLIDES[0].src, { as: "image", fetchPriority: "high" });
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;

      const bases = Array.from(root.querySelectorAll<HTMLImageElement>("[data-base]"));
      const tileEls = Array.from(root.querySelectorAll<HTMLElement>("[data-tile]"));
      const tileImgs = tileEls.map((t) => t.querySelector("img") as HTMLImageElement);
      const burns = tileEls.map((t) => t.querySelector("[data-burn]") as HTMLElement);
      const counter = root.querySelector<HTMLElement>("[data-counter]");
      const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-dot]"));
      const words = root.querySelectorAll("[data-intro-word]");
      const copy = root.querySelectorAll("[data-intro-copy]");
      const reduce = prefersReducedMotion();

      const isDark = (i: number) => (TILES[i].c + TILES[i].r) % 2 === 0;
      const darkTiles = tileEls.filter((_, i) => isDark(i));
      const lightTiles = tileEls.filter((_, i) => !isDark(i));
      const darkBurns = burns.filter((_, i) => isDark(i));
      const lightBurns = burns.filter((_, i) => !isDark(i));

      let current = 0;
      let busy = false;

      const setActive = (i: number) => {
        bases.forEach((b, j) => (b.dataset.active = j === i ? "true" : "false"));
        if (counter) counter.textContent = `${pad(i + 1)} / ${pad(SLIDES.length)}`;
        dots.forEach((d, j) => (d.dataset.on = j === i ? "true" : "false"));
      };

      // Chessboard "burning tiles" transition: dark squares, then light squares.
      const reveal = contextSafe(async (to: number) => {
        if (busy) return;
        busy = true;
        const s = SLIDES[to];
        tileImgs.forEach((img) => {
          img.style.objectPosition = s.pos;
          img.style.transform = `scale(${s.zoom})`;
          if (img.getAttribute("src") !== s.src) img.setAttribute("src", s.src);
        });
        try {
          await tileImgs[0].decode();
        } catch {
          /* show anyway */
        }
        if (reduce) {
          setActive(to);
          current = to;
          busy = false;
          return;
        }
        gsap.set(tileEls, { autoAlpha: 0, scale: 0.35 });
        gsap.set(burns, { opacity: 0 });
        const stagger = { each: 0.04, from: "random" as const };
        gsap
          .timeline({
            onComplete: () => {
              setActive(to);
              current = to;
              gsap.set(tileEls, { autoAlpha: 0 });
              busy = false;
            },
          })
          .to(darkTiles, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out", stagger }, 0)
          .to(darkBurns, { keyframes: { opacity: [0, 1, 0] }, duration: 0.95, ease: "none", stagger }, 0)
          .to(lightTiles, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out", stagger }, 0.38)
          .to(lightBurns, { keyframes: { opacity: [0, 1, 0] }, duration: 0.95, ease: "none", stagger }, 0.38);
      });

      // ── Intro (after the splash video masks out) ─────────────────────
      const mm = gsap.matchMedia();
      let introPlayed = false;
      const playIntro = contextSafe(() => {
        if (introPlayed) return;
        introPlayed = true;
        if (reduce) return;
        gsap.to(words, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.08, delay: 0.05 });
        gsap.to(copy, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, delay: 0.45 });
        reveal(0);
      });

      if (!reduce) {
        // Pre-paint hidden state (SSR / no-JS keeps everything visible).
        gsap.set(words, { yPercent: 112 });
        gsap.set(copy, { autoAlpha: 0, y: 24 });
        bases.forEach((b) => (b.dataset.active = "false"));
      }

      // Parallax: photo slower than type, title words drift apart.
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const k = ctx.conditions?.desktop ? 1 : 0.5;
        const st = { trigger: root, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-par-photo]", { yPercent: 14 * k, ease: "none", scrollTrigger: st });
        gsap.to("[data-par-welcome]", { xPercent: -10 * k, ease: "none", scrollTrigger: st });
        gsap.to("[data-par-cav]", { xPercent: 7 * k, ease: "none", scrollTrigger: st });
        gsap.to("[data-par-copy]", { y: -60 * k, ease: "none", scrollTrigger: st });
      });

      let fallback: ReturnType<typeof setTimeout> | null = null;
      let splashShown = false;
      try {
        splashShown = Boolean(sessionStorage.getItem("splashShown"));
      } catch {
        splashShown = true;
      }
      const onSplashDone = () => playIntro();
      if (splashShown) {
        playIntro();
      } else {
        window.addEventListener("cv:splash-done", onSplashDone, { once: true });
        fallback = setTimeout(playIntro, 4500);
      }

      // ── Autoplay: only while visible & tab active ─────────────────────
      let inView = true;
      const io = new IntersectionObserver((e) => (inView = e[0]?.isIntersecting ?? true), { threshold: 0.2 });
      io.observe(root);
      const timer = setInterval(() => {
        if (!inView || document.hidden || busy || !introPlayed) return;
        reveal((current + 1) % SLIDES.length);
      }, 7000);

      return () => {
        clearInterval(timer);
        io.disconnect();
        if (fallback) clearTimeout(fallback);
        window.removeEventListener("cv:splash-done", onSplashDone);
        mm.revert();
      };
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className={styles.hero} data-motion aria-label="Selamat datang di Cavallery">
      <div className={styles.stage}>
        <h1 className={styles.srTitle}>Welcome to Cavallery!</h1>

        {/* WELCOME TO — fully in front of the photo */}
        <p className={`${styles.welcome} cv-display`} aria-hidden="true" data-par-welcome>
          <span className={styles.mask}>
            <span className={styles.wordIn} data-intro-word>
              Welcome
            </span>
          </span>{" "}
          <span className={styles.mask}>
            <span className={`${styles.wordIn} ${styles.to}`} data-intro-word>
              to
            </span>
          </span>
        </p>

        <div className={styles.frameWrap}>
          <div className={styles.embers} aria-hidden="true">
            <EmberField desktop={34} mobile={13} />
          </div>
          <div className={styles.heat} aria-hidden="true" />

          {/* CAVALLERY! behind the photo (solid) */}
          <p className={`${styles.cav} ${styles.cavBack} cv-display`} aria-hidden="true" data-par-cav>
            <span className={styles.mask}>
              <span className={styles.wordIn} data-intro-word>
                Cavallery!
              </span>
            </span>
          </p>

          <div className={styles.frame} data-par-photo>
            {SLIDES.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={i === 0 ? "Erine JKT48" : ""}
                data-base
                data-active={i === 0 ? "true" : "false"}
                className={styles.base}
                style={{ objectPosition: s.pos, transform: `scale(${s.zoom})` }}
                width={1180}
                height={1572}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding={i === 0 ? "sync" : "async"}
              />
            ))}
            <div className={styles.tiles} aria-hidden="true">
              {TILES.map((t, i) => (
                <div
                  key={i}
                  className={styles.tileCell}
                  data-tile
                  style={{
                    left: `${(t.c * 100) / COLS}%`,
                    top: `${(t.r * 100) / ROWS}%`,
                    width: `calc(${100 / COLS}% + 1px)`,
                    height: `calc(${100 / ROWS}% + 1px)`,
                  }}
                >
                  <img
                    alt=""
                    style={{
                      width: `${COLS * 100}%`,
                      height: `${ROWS * 100}%`,
                      left: `${-t.c * 100}%`,
                      top: `${-t.r * 100}%`,
                    }}
                  />
                  <span className={styles.burn} data-burn />
                </div>
              ))}
            </div>
            <span className={styles.frameSq}>e4</span>
            <span className={styles.counter}>
              <span data-counter>01 / {pad(SLIDES.length)}</span>
              <span className={styles.dots}>
                {SLIDES.map((s, i) => (
                  <i key={s.src} data-dot data-on={i === 0 ? "true" : "false"} />
                ))}
              </span>
            </span>
          </div>

          {/* CAVALLERY! outline copy in front — letters read across the photo */}
          <p className={`${styles.cav} ${styles.cavFront} cv-display`} aria-hidden="true" data-par-cav>
            <span className={styles.mask}>
              <span className={styles.wordIn} data-intro-word>
                Cavallery!
              </span>
            </span>
          </p>

          <div className={styles.files} aria-hidden="true">
            {FILES.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
          <div className={styles.ranks} aria-hidden="true">
            {[8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>

          <div className={styles.passionTag}>
            <span className={styles.passionName}>JKT48 Erine</span>
            <span className={styles.passionLine}>
              <svg viewBox="0 0 12 16" width="10" height="14" aria-hidden="true" className={styles.flame}>
                <path
                  d="M6 0C7 3.2 11 5.4 11 10a5 5 0 0 1-10 0c0-2.4 1.2-3.9 2.4-5 .1 1.6.8 2.7 1.9 3.1C5 5.6 5 2.6 6 0z"
                  fill="currentColor"
                />
              </svg>
              Gen 12 · <span className="cv-fire-text">Team Passion</span>
            </span>
          </div>
        </div>

        <div className={styles.copy} data-par-copy>
          <div data-intro-copy>
            <ChessEyebrow square="e4" label="Official Fanbase Erine JKT48" />
          </div>
          <div data-intro-copy>
            <Typewriter />
          </div>
          <p className={styles.desc} data-intro-copy>
            From first support to endless memories.
            <br />
            Cavallery welcomes every supporter with the same warmth and spirit, creating beautiful memories in
            every chapter ahead.
          </p>
          <div className={styles.ctas} data-intro-copy>
            <Link href="/about/erine" className={`${styles.tile} ${styles.tileLight}`}>
              <span className={styles.tileFlip} aria-hidden="true" />
              <span className={styles.tileGlint} aria-hidden="true" />
              <span className={styles.tileSq}>d4</span>
              <span className={styles.tileLabel}>Meet Erine?</span>
              <span className={styles.tileIcon} aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
            </Link>
            <JikoTile />
          </div>
        </div>
      </div>

      {/* Slow marquee */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {Array.from({ length: 2 }).map((_, k) => (
            <div className={styles.marqueeGroup} key={k}>
              {Array.from({ length: 4 }).map((__, j) => (
                <span className={styles.marqueeItem} key={j}>
                  Hadir dengan seribu kejutan, <span className="cv-fire-text">Checkmate!</span>
                  <KnightSvg size={22} className={styles.marqueeKnight} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
