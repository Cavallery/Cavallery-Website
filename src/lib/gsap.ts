// ============================================================
// GSAP — single registration point (client-only).
// Plugins are imported per-file to keep the bundle small.
// Never touches window/document at module scope on the server.
// ============================================================
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

let registered = false;

export function registerGSAP() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

registerGSAP();

/** Shared media queries for gsap.matchMedia(). */
export const MQ = {
  desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 899.98px) and (prefers-reduced-motion: no-preference)",
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(MQ.reduce).matches;
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced ScrollTrigger.refresh() — safe to call many times. */
export function scheduleRefresh(delay = 120) {
  if (typeof window === "undefined") return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    ScrollTrigger.refresh();
  }, delay);
}

/**
 * Calls ScrollTrigger.refresh() once images inside `root` finish loading
 * (prevents stale trigger positions → keeps CLS ~0 for pinned/scrubbed parts).
 * Returns a cleanup function.
 */
export function refreshOnImages(root: ParentNode | null | undefined): () => void {
  if (!root || typeof window === "undefined") return () => {};
  const imgs = Array.from(root.querySelectorAll("img")).filter((img) => !img.complete);
  if (imgs.length === 0) return () => {};
  const onDone = () => scheduleRefresh();
  imgs.forEach((img) => {
    img.addEventListener("load", onDone, { once: true });
    img.addEventListener("error", onDone, { once: true });
  });
  return () => {
    imgs.forEach((img) => {
      img.removeEventListener("load", onDone);
      img.removeEventListener("error", onDone);
    });
  };
}

export { gsap, ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, useGSAP };
