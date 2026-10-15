"use client";
import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ, refreshOnImages } from "@/lib/gsap";

/**
 * KNIGHT'S PATH — scroll-driven milestone journey.
 *
 * DOM contract (all inside `container`, which must be position:relative):
 *   svg[data-kp-svg]                      absolute, top/left 0
 *     path[data-kp-base]                  dashed "untravelled" path
 *     path[data-kp-lit]                   travelled path (stroke = gradient)
 *     linearGradient[data-kp-grad]        cold → fire gradient (userSpaceOnUse)
 *       stop[data-kp-stop="0..4"]
 *   [data-kp-knight]                      the ♞ (absolute, top/left 0)
 *   [data-kp-ember]                       pooled ember trail particles
 *   [data-kp-item]                        one milestone row
 *     [data-kp-node][data-year]           node marker (NOT inside the card)
 *       [data-kp-tile]                    board square that pulses on landing
 *     [data-kp-card]                      revealed when the knight lands
 *       [data-kp-photo] img               small parallax on reveal
 *       [data-kp-text] > *                text rises
 *   [data-kp-year-rail] [data-kp-year]    sticky "rank" labels per year
 *
 * Performance: one master ScrollTrigger (scrubbed) drives the line and the
 * knight; nodes switch state from progress thresholds inside onUpdate
 * (equivalent of onEnter/onLeaveBack without N triggers). No React state.
 */

interface Options {
  container: RefObject<HTMLElement | null>;
  /** Year from which the path "ignites" (Team Passion era). */
  fireFromYear?: number;
  dependencies?: unknown[];
}

interface NodePoint {
  x: number;
  y: number;
  year: number;
  el: HTMLElement;
  item: HTMLElement;
}

function buildPathD(pts: { x: number; y: number }[]): string {
  if (!pts.length) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
      d += ` L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      continue;
    }
    // Knight "L": long leg down, short leg across, rounded corner.
    const r = Math.min(22, Math.abs(dx) / 2, Math.abs(dy) / 2);
    const sx = Math.sign(dx);
    const sy = Math.sign(dy);
    d += ` L ${a.x.toFixed(1)} ${(b.y - sy * r).toFixed(1)}`;
    d += ` Q ${a.x.toFixed(1)} ${b.y.toFixed(1)} ${(a.x + sx * r).toFixed(1)} ${b.y.toFixed(1)}`;
    d += ` L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

export function useKnightPath({ container, fireFromYear = 2025, dependencies = [] }: Options) {
  useGSAP(
    (_ctx, contextSafe) => {
      const root = container.current;
      if (!root || !contextSafe) return;

      const svg = root.querySelector<SVGSVGElement>("[data-kp-svg]");
      const base = root.querySelector<SVGPathElement>("[data-kp-base]");
      const lit = root.querySelector<SVGPathElement>("[data-kp-lit]");
      const grad = root.querySelector<SVGLinearGradientElement>("[data-kp-grad]");
      const knight = root.querySelector<HTMLElement>("[data-kp-knight]");
      const embers = Array.from(root.querySelectorAll<HTMLElement>("[data-kp-ember]"));
      const yearEls = Array.from(root.querySelectorAll<HTMLElement>("[data-kp-year]"));
      if (!svg || !base || !lit || !knight) return;

      const reduce = window.matchMedia(MQ.reduce).matches;
      const revealed = new Set<number>();
      let master: ScrollTrigger | null = null;
      let tl: gsap.core.Timeline | null = null;
      let lastWidth = 0;
      let lastHeight = 0;

      // Year rail ------------------------------------------------------------
      let activeYear = "";
      const showYear = (year: string, dir: 1 | -1) => {
        if (year === activeYear) return;
        const prev = yearEls.find((e) => e.dataset.kpYear === activeYear);
        const next = yearEls.find((e) => e.dataset.kpYear === year);
        activeYear = year;
        root.setAttribute("data-kp-era", Number(year) >= fireFromYear ? "fire" : "cold");
        if (reduce) {
          yearEls.forEach((e) => gsap.set(e, { autoAlpha: e === next ? 1 : 0, yPercent: 0 }));
          return;
        }
        if (prev) gsap.to(prev, { yPercent: -60 * dir, autoAlpha: 0, duration: 0.45, ease: "power2.in", overwrite: true });
        if (next) gsap.fromTo(next, { yPercent: 60 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, delay: 0.1, ease: "power3.out", overwrite: true });
      };
      yearEls.forEach((e, i) => gsap.set(e, { autoAlpha: i === 0 ? 1 : 0 }));
      if (yearEls[0]) {
        activeYear = yearEls[0].dataset.kpYear || "";
        root.setAttribute("data-kp-era", Number(activeYear) >= fireFromYear ? "fire" : "cold");
      }

      // Landing / leaving ----------------------------------------------------
      const land = (n: NodePoint, idx: number, animate: boolean) => {
        n.el.setAttribute("data-state", "visited");
        n.item.setAttribute("data-state", "visited");
        const card = n.item.querySelector<HTMLElement>("[data-kp-card]");
        const tile = n.el.querySelector<HTMLElement>("[data-kp-tile]");
        const core = n.el.querySelector<HTMLElement>("[data-kp-core]");
        if (!animate) {
          if (card) gsap.set(card, { autoAlpha: 1, y: 0 });
          revealed.add(idx);
          return;
        }
        if (core) gsap.fromTo(core, { scale: 0.55 }, { scale: 1, duration: 0.55, ease: "back.out(3)", overwrite: true });
        if (tile) gsap.fromTo(tile, { autoAlpha: 1, scale: 0.7 }, { autoAlpha: 0, scale: 1.45, duration: 0.95, ease: "power2.out", overwrite: true });
        if (card && !revealed.has(idx)) {
          revealed.add(idx);
          const photo = card.querySelector<HTMLElement>("[data-kp-photo] img");
          const text = card.querySelectorAll<HTMLElement>("[data-kp-text] > *");
          gsap.to(card, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" });
          if (photo) gsap.fromTo(photo, { yPercent: 7, scale: 1.1 }, { yPercent: 0, scale: 1, duration: 1.2, ease: "power3.out" });
          if (text.length) gsap.fromTo(text, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, delay: 0.1 });
        }
      };
      const leave = (n: NodePoint) => {
        n.el.setAttribute("data-state", "idle");
        n.item.setAttribute("data-state", "idle");
      };

      // Ember trail (pooled) -------------------------------------------------
      let emberIdx = 0;
      let lastEmberAt = 0;
      const spawnEmber = (x: number, y: number) => {
        if (!embers.length) return;
        const now = performance.now();
        if (now - lastEmberAt < 55) return;
        lastEmberAt = now;
        const e = embers[emberIdx++ % embers.length];
        const jx = (Math.random() - 0.5) * 14;
        gsap.killTweensOf(e);
        gsap.fromTo(
          e,
          { x: x + jx, y: y + 6, autoAlpha: 0.95, scale: 1 },
          { x: x + jx * 1.6, y: y - 16 - Math.random() * 14, autoAlpha: 0, scale: 0.25, duration: 0.65, ease: "power1.out" }
        );
      };

      // Build / rebuild ------------------------------------------------------
      const build = contextSafe(() => {
        tl?.kill();
        master?.kill();
        tl = null;
        master = null;

        const rect = root.getBoundingClientRect();
        const W = Math.round(rect.width);
        const H = Math.round(root.scrollHeight);
        lastWidth = W;
        lastHeight = H;

        const nodes: NodePoint[] = Array.from(root.querySelectorAll<HTMLElement>("[data-kp-node]")).map((el) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - rect.left,
            y: r.top + r.height / 2 - rect.top,
            year: Number(el.dataset.year || 0),
            el,
            item: (el.closest("[data-kp-item]") as HTMLElement) || el,
          };
        });
        if (nodes.length < 1) return;

        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", String(W));
        svg.setAttribute("height", String(H));

        // Cumulative length at every node (prefix measurement on the base path).
        const fractions: number[] = [];
        const prefixLens: number[] = [];
        for (let i = 0; i < nodes.length; i++) {
          if (i === 0) {
            prefixLens.push(0);
            continue;
          }
          base.setAttribute("d", buildPathD(nodes.slice(0, i + 1)));
          prefixLens.push(base.getTotalLength());
        }
        const d = buildPathD(nodes.length > 1 ? nodes : [nodes[0], { ...nodes[0], y: nodes[0].y + 1 }]);
        base.setAttribute("d", d);
        lit.setAttribute("d", d);
        const total = Math.max(1, lit.getTotalLength());
        prefixLens.forEach((l) => fractions.push(l / total));

        // Cold → fire gradient anchored at the first Team Passion era node.
        if (grad) {
          grad.setAttribute("x1", "0");
          grad.setAttribute("y1", "0");
          grad.setAttribute("x2", "0");
          grad.setAttribute("y2", String(H));
          const fireNode = nodes.find((n) => n.year >= fireFromYear);
          const stops = Array.from(grad.querySelectorAll<SVGStopElement>("[data-kp-stop]"));
          if (stops.length >= 5) {
            const fy = fireNode ? fireNode.y / H : 1.2;
            const clamp = (v: number) => Math.min(1, Math.max(0, v));
            const offs = [0, clamp(fy - 0.07), clamp(fy), clamp(fy + (1 - fy) * 0.45), 1];
            stops.forEach((s, i) => s.setAttribute("offset", String(offs[i])));
          }
        }

        gsap.set(lit, { strokeDasharray: total, strokeDashoffset: reduce ? 0 : total });
        gsap.set(knight, { x: 0, y: 0, xPercent: 0, yPercent: 0 });

        const updateNodes = (p: number, animate: boolean, dir: 1 | -1) => {
          let current = -1;
          nodes.forEach((n, i) => {
            const shouldVisit = p > 0.0005 && p >= fractions[i] - 0.0015;
            const isVisited = n.el.dataset.state === "visited";
            if (shouldVisit) current = i;
            if (shouldVisit && !isVisited) land(n, i, animate);
            else if (!shouldVisit && isVisited) leave(n);
          });
          const yearOf = nodes[Math.max(0, current)].year;
          showYear(String(yearOf), dir);
        };

        if (reduce) {
          // Static: full line, knight on the last square, every card shown.
          gsap.set(knight, {
            motionPath: { path: lit, align: lit, alignOrigin: [0.5, 0.5], start: 1, end: 1 },
          });
          nodes.forEach((n, i) => land(n, i, false));
          root.setAttribute("data-kp-era", "fire");
          master = ScrollTrigger.create({
            trigger: root,
            start: "top 70%",
            end: "bottom 70%",
            onUpdate(self) {
              let current = 0;
              nodes.forEach((n, i) => {
                if (self.progress >= fractions[i] - 0.0015) current = i;
              });
              showYear(String(nodes[current].year), 1);
            },
          });
          return;
        }

        // Hide cards that haven't been reached yet.
        nodes.forEach((n, i) => {
          const card = n.item.querySelector<HTMLElement>("[data-kp-card]");
          if (card && !revealed.has(i)) gsap.set(card, { autoAlpha: 0, y: 40 });
        });

        let lastP = 0;
        tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top 70%",
            end: "bottom 70%",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const p = self.progress;
              const dir: 1 | -1 = p >= lastP ? 1 : -1;
              updateNodes(p, true, dir);
              if (Math.abs(p - lastP) > 0.0004 && p > 0 && p < 1) {
                const pt = lit.getPointAtLength(p * total);
                spawnEmber(pt.x, pt.y);
              }
              lastP = p;
            },
          },
        });
        tl.to(lit, { strokeDashoffset: 0, duration: 1 }, 0);
        tl.to(
          knight,
          { motionPath: { path: lit, align: lit, alignOrigin: [0.5, 0.5] }, duration: 1 },
          0
        );
        master = tl.scrollTrigger || null;
        updateNodes(master ? master.progress : 0, false, 1);
      });

      build();
      const offImages = refreshOnImages(root);

      // Recompute on resize (debounced) --------------------------------------
      let timer: ReturnType<typeof setTimeout> | null = null;
      const ro = new ResizeObserver(() => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const w = Math.round(root.getBoundingClientRect().width);
          const h = Math.round(root.scrollHeight);
          if (Math.abs(w - lastWidth) > 2 || Math.abs(h - lastHeight) > 2) {
            build();
            ScrollTrigger.refresh();
          }
        }, 220);
      });
      ro.observe(root);

      return () => {
        if (timer) clearTimeout(timer);
        ro.disconnect();
        offImages();
        tl?.kill();
        master?.kill();
      };
    },
    { scope: container, dependencies, revertOnUpdate: true }
  );
}
