"use client";
import { useEffect, useRef } from "react";

interface Props {
  /** Particle count on desktop (≤ 40). */
  desktop?: number;
  /** Particle count on mobile (≤ 15). */
  mobile?: number;
  className?: string;
  /** 0–1 multiplier for brightness. */
  intensity?: number;
}

interface Ember {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  life: number;
  max: number;
  hue: number;
}

// Passion palette in RGB (merah bara → oranye → kuning panas)
const PALETTE: [number, number, number][] = [
  [215, 48, 28],
  [242, 106, 27],
  [255, 193, 74],
];

/**
 * Lightweight rising embers on a 2D canvas.
 * - capped particle count, DPR capped at 1.5
 * - paused when the tab is hidden or the canvas is off-screen
 * - disabled entirely under prefers-reduced-motion (renders nothing)
 */
export default function EmberField({ desktop = 34, mobile = 13, className, intensity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.style.display = "none";
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const count = Math.min(isMobile ? Math.min(mobile, 15) : Math.min(desktop, 40), 40);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let inView = false;
    let tabVisible = document.visibilityState === "visible";
    let last = 0;

    const spawn = (e: Partial<Ember> = {}, initial = false): Ember => {
      const max = 5 + Math.random() * 6;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: 0.7 + Math.random() * (isMobile ? 1.6 : 2.1),
        vy: 14 + Math.random() * 26,
        sway: 6 + Math.random() * 16,
        phase: Math.random() * Math.PI * 2,
        life: initial ? Math.random() * max : 0,
        max,
        hue: Math.floor(Math.random() * PALETTE.length),
        ...e,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const embers: Ember[] = Array.from({ length: count }, () => spawn({}, true));

    const draw = (t: number) => {
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life += dt;
        e.y -= e.vy * dt;
        const x = e.x + Math.sin(e.phase + e.life * 1.3) * e.sway;
        const k = e.life / e.max;
        // fade in, glow, cool down
        const a = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * intensity;
        if (k >= 1 || e.y < -10) {
          embers[i] = spawn();
          continue;
        }
        const [r, g, b] = PALETTE[e.hue];
        ctx.fillStyle = `rgba(${r},${g},${b},${(a * 0.16).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, e.y, e.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${Math.min(255, r + 30)},${Math.min(255, g + 50)},${Math.min(255, b + 40)},${(a * 0.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    const sync = () => {
      const shouldRun = inView && tabVisible;
      if (shouldRun && !raf) {
        last = 0;
        raf = requestAnimationFrame(draw);
      } else if (!shouldRun && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { rootMargin: "80px" }
    );
    io.observe(canvas);

    const onVis = () => {
      tabVisible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [desktop, mobile, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
