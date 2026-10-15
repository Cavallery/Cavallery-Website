import type { CSSProperties } from "react";
import styles from "./FlameLayer.module.css";

interface Props {
  className?: string;
  /** Number of tongues per layer (desktop). Mobile drops the front layer. */
  density?: number;
  /** 0–1 overall opacity. */
  intensity?: number;
  /** Unique gradient ids when several layers share a page. */
  id: string;
  /** Not anchored to a section edge: feather the base too so it floats. */
  floating?: boolean;
}

interface Tongue {
  x: number;
  w: number;
  h: number;
  /** horizontal offset of the tip — gives each tongue its own lean/curl */
  lean: number;
  dur: number;
  delay: number;
}

// Deterministic pseudo-random (stable between server and client renders).
const rnd = (n: number) => {
  const v = Math.sin(n * 91.345 + 7.31) * 43758.5453;
  return v - Math.floor(v);
};

const LAYERS = ["back", "mid", "front", "core"] as const;
const HEIGHT = [158, 122, 86, 52];
const WIDTH = [1.7, 1.5, 1.25, 0.9];
const SPEED = [3.4, 2.5, 1.8, 1.3];
const COUNT = [0.75, 1, 1.15, 0.9];

function tongues(count: number, layer: number): Tongue[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = i * 13 + layer * 101;
    const step = 400 / count;
    const w = step * (WIDTH[layer] + rnd(seed + 1) * 0.8);
    return {
      x: step * i + step / 2 + (rnd(seed) - 0.5) * step * 0.7,
      w,
      h: HEIGHT[layer] * (0.62 + rnd(seed + 2) * 0.55),
      lean: (rnd(seed + 5) - 0.5) * w * 0.7,
      dur: SPEED[layer] * (0.8 + rnd(seed + 3) * 0.5),
      delay: -rnd(seed + 4) * 3,
    };
  });
}

const f = (n: number) => n.toFixed(1);

/**
 * One flame tongue: a rounded belly near the base that narrows into a
 * curling, off-centre tip (S-curve), closed by a soft rounded bottom.
 */
function tonguePath({ x, w, h, lean }: Tongue): string {
  const b = 200;
  const l = x - w / 2;
  const r = x + w / 2;
  const tx = x + lean;
  const ty = b - h;
  return [
    `M ${f(l)} ${b}`,
    // left flank: bulge out, then pinch in toward the tip
    `C ${f(l - w * 0.1)} ${f(b - h * 0.3)} ${f(x - w * 0.46 + lean * 0.2)} ${f(b - h * 0.55)} ${f(x - w * 0.16 + lean * 0.55)} ${f(b - h * 0.76)}`,
    // curl into the tip
    `C ${f(x - w * 0.02 + lean * 0.8)} ${f(b - h * 0.86)} ${f(tx - lean * 0.15)} ${f(b - h * 0.93)} ${f(tx)} ${f(ty)}`,
    // right flank: thin wisp back down, then swell into the belly
    `C ${f(tx + w * 0.06 - lean * 0.1)} ${f(b - h * 0.84)} ${f(x + w * 0.3 + lean * 0.3)} ${f(b - h * 0.68)} ${f(x + w * 0.32 + lean * 0.1)} ${f(b - h * 0.45)}`,
    `C ${f(x + w * 0.5)} ${f(b - h * 0.24)} ${f(r + w * 0.08)} ${f(b - h * 0.1)} ${f(r)} ${b}`,
    // rounded base
    `C ${f(x + w * 0.28)} ${f(b + 10)} ${f(x - w * 0.28)} ${f(b + 10)} ${f(l)} ${b}`,
    "Z",
  ].join(" ");
}

/** A small detached lick that breaks off a tongue and rises away. */
function lickPath(cx: number, cy: number, s: number, lean: number): string {
  return [
    `M ${f(cx)} ${f(cy)}`,
    `C ${f(cx - s * 0.9)} ${f(cy - s * 0.4)} ${f(cx - s * 0.5 + lean)} ${f(cy - s * 1.6)} ${f(cx + lean)} ${f(cy - s * 2.4)}`,
    `C ${f(cx + s * 0.4 + lean * 0.4)} ${f(cy - s * 1.5)} ${f(cx + s * 0.9)} ${f(cy - s * 0.4)} ${f(cx)} ${f(cy)}`,
    "Z",
  ].join(" ");
}

/**
 * Team Passion flames — layered SVG tongues (back ember red → orange →
 * gold → white-hot core) that flicker with CSS transforms only, plus a few
 * detached licks that rise and burn out. No filters, no canvas.
 * Static under prefers-reduced-motion.
 */
export default function FlameLayer({ className, density = 9, intensity = 1, id, floating = false }: Props) {
  const layers = LAYERS.map((_, layer) => tongues(Math.max(2, Math.round(density * COUNT[layer])), layer));
  const licks = Array.from({ length: Math.max(3, Math.round(density * 0.6)) }, (_, i) => {
    const seed = 900 + i * 17;
    return {
      d: lickPath(20 + rnd(seed) * 360, 200 - 40 - rnd(seed + 1) * 60, 6 + rnd(seed + 2) * 7, (rnd(seed + 3) - 0.5) * 8),
      dur: 1.6 + rnd(seed + 4) * 1.4,
      delay: -rnd(seed + 5) * 3,
    };
  });

  return (
    <div className={`${styles.wrap} ${floating ? styles.floating : ""} ${className || ""}`} style={{ opacity: intensity }} aria-hidden="true">
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" className={styles.svg}>
        <defs>
          <linearGradient id={`${id}-back`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#8f1a0c" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#c8281a" stopOpacity="0.6" />
            <stop offset="1" stopColor="#e2541b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-mid`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#e2401b" stopOpacity="0.95" />
            <stop offset="0.55" stopColor="#f26a1b" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-front`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ff8a2a" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#ffc14a" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ffe3a3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-core`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff6dc" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#ffe3a3" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffc14a" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-bed`} cx="0.5" cy="1" r="0.75">
            <stop offset="0" stopColor="#ff8a2a" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#c8281a" stopOpacity="0.2" />
            <stop offset="1" stopColor="#c8281a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* glowing ember bed the flames grow from */}
        <rect x="-20" y="120" width="440" height="90" fill={`url(#${id}-bed)`} className={styles.bed} />

        {layers.map((ts, layer) => (
          <g key={layer} className={`${styles.layer} ${styles[`l${layer}`]}`} fill={`url(#${id}-${LAYERS[layer]})`}>
            {ts.map((t, i) => (
              <path
                key={i}
                d={tonguePath(t)}
                className={styles.tongue}
                style={{ "--d": `${t.dur.toFixed(2)}s`, "--dl": `${t.delay.toFixed(2)}s` } as CSSProperties}
              />
            ))}
          </g>
        ))}

        <g className={styles.layer} fill={`url(#${id}-front)`}>
          {licks.map((k, i) => (
            <path
              key={i}
              d={k.d}
              className={styles.lick}
              style={{ "--d": `${k.dur.toFixed(2)}s`, "--dl": `${k.delay.toFixed(2)}s` } as CSSProperties}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
