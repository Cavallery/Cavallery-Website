"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./VideoSection.module.css";
import { VIDEO_URLS } from "@/lib/videoAssets";
import SectionHead from "@/components/chess/SectionHead";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";

export default function VideoSection() {
  const [videoSrc] = useState<string>(VIDEO_URLS.homepageTeaser);
  const [videoError, setVideoError] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const rootRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userPaused = useRef(false);

  const handleVideoError = () => {
    setVideoError(true);
  };

  useReveal(rootRef);

  // Gentle scale-down of the full-bleed media while it scrolls through.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const from = ctx.conditions?.desktop ? 1.14 : 1.06;
        gsap.fromTo(
          "[data-media]",
          { scale: from },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "center center", scrub: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  // Only play while on screen (saves battery/data on mid-range phones).
  useEffect(() => {
    const v = videoRef.current;
    const root = rootRef.current;
    if (!v || !root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting;
        if (visible && !userPaused.current) {
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else if (!visible && !v.paused) {
          v.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [videoError]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.();
  };

  return (
    <section ref={rootRef} className={`${styles.section} cv-dark`} id="erine-moments" data-motion aria-labelledby="moments-title">
      <div className={styles.mediaClip}>
        <div className={styles.media} data-media>
          {!videoError ? (
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/erine2.jpg"
              className={styles.video}
              onError={handleVideoError}
              aria-label="Video teaser resmi Erine JKT48"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/erine2.jpg" alt="" className={styles.video} />
          )}
        </div>
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      <div className={styles.overlay}>
        <div id="moments-title" className={styles.head}>
          <SectionHead
            square="c3"
            eyebrow="Official Teaser"
            title="Erine"
            accent="Moments"
            subtitle="Video teaser resmi dan momen-momen terbaik Erine JKT48 bersama fanbase Cavallery."
          />
        </div>

        {videoError && (
          <div className={styles.fallbackPlayer} role="status" data-reveal="up">
            <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
              <rect x="1" y="1" width="46" height="46" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M19 15v18l14-9z" fill="currentColor" />
            </svg>
            <span>
              <strong className={styles.fallbackTitle}>Video Offline</strong>
              <span className={styles.fallbackDesc}>
                Mohon maaf, video preview dari cavallery.id sedang tidak dapat dimuat saat ini.
              </span>
            </span>
          </div>
        )}

        {!videoError && (
          <div className={styles.controls} data-reveal="up">
            <button type="button" className={styles.ctrl} onClick={togglePlay} aria-label={playing ? "Jeda video" : "Putar video"}>
              {playing ? (
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
                </svg>
              )}
              <span>{playing ? "Jeda" : "Putar"}</span>
            </button>
            <button type="button" className={styles.ctrl} onClick={toggleMute} aria-pressed={!muted}>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
                {muted ? (
                  <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.4" />
                ) : (
                  <path d="M11.5 5.5a3.5 3.5 0 0 1 0 5M13 4a6 6 0 0 1 0 8" fill="none" stroke="currentColor" strokeWidth="1.3" />
                )}
              </svg>
              <span>{muted ? "Suara" : "Bisu"}</span>
            </button>
            <button type="button" className={styles.ctrl} onClick={fullscreen} aria-label="Layar penuh">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>Layar Penuh</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
