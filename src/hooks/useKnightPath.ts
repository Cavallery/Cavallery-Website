"use client";
import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ, refreshOnImages } from "@/lib/gsap";

/**
 * KNIGHT'S PATH — scroll-driven milestone journey.
 *
 * DOM contract (all inside `container`, which must be position:relative):
 *   svg[data-kp-svg]                      absolute, top/left 0
 *     path[data-kp-base]                  dashed "untravelled" path (amber/orange)
 *     path[data-kp-lit]                   travelled path (stroke = gradient)
 *     mask[data-kp-mask] > path[data-kp-maskpath]   reveals the fire flow
 *     path[data-kp-flow]                  flowing embers (fire era only)
 *     linearGradient[data-kp-grad] / [data-kp-flowgrad]  (userSpaceOnUse)
 *   [data-kp-knight]                      the ♞ avatar (absolute, top/left 0)
 *   [data-kp-ember]                       pooled ember / spark particles
 *   [data-kp-item]                        one milestone row
 *     [data-kp-node][data-year]         node marker (NOT inside the card)
 *         [data-kp-tile] [data-kp-core]
 *     [data-kp-card]                      revealed when the knight lands
 *       [data-kp-photo] img / [data-kp-text] > *
 *   [data-kp-year-rail] [data-kp-year]    sticky "rank" labels per year
 *
 * Jalur meliuk & melingkar (meandering S-curves & loop-the-loops) yang menyusuri
 * seluruh timeline secara dinamis dan mulus.
 */

interface Options {
  container: RefObject<HTMLElement | null>;
  /** Year from which the path "ignites" (Team Passion era). */
  fireFromYear?: number;
  dependencies?: unknown[];
}

interface Pt {
  x: number;
  y: number;
}

interface NodePoint extends Pt {
  year: number;
  el: HTMLElement;
  item: HTMLElement;
  laneLeft: number;
  laneRight: number;
}

const LINE = 0.7; // arrival line, fraction of the viewport height

/**
 * Generator alur meliuk & melingkar (Catmull-Rom & 360° Loop-the-loop Bezier):
 * Menghubungkan setiap milestone node dengan kurva meliuk (S-curve meanders) dan loop melingkar
 * 360 derajat di antara milestone cards, menciptakan pengalaman visual berjalan yang hidup.
 */
function buildKnightPath(nodes: NodePoint[], upTo = nodes.length - 1): string {
  if (!nodes || nodes.length === 0) return "";
  if (nodes.length === 1 || upTo === 0) {
    return `M ${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)} l 0 1`;
  }
  const maxIdx = Math.min(upTo, nodes.length - 1);
  let d = `M ${nodes[0].x.toFixed(1)} ${nodes[0].y.toFixed(1)}`;

  for (let i = 0; i < maxIdx; i++) {
    const p1 = nodes[i];
    const p2 = nodes[i + 1];
    const dy = p2.y - p1.y;

    if (dy <= 15) {
      d += ` L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      continue;
    }

    const xMid = (p1.x + p2.x) / 2;
    const yMid = p1.y + dy * 0.5;

    const laneWidth = Math.max(320, p1.laneRight - p1.laneLeft);
    const isDesktop = laneWidth > 550;
    const isYearTransition = p1.year !== p2.year;

    // Loop melingkar 360° pada segmen berkala dengan jarak cukup, dalam tahun yang sama
    const isLoopSegment = !isYearTransition && (i % 3 === 1) && (dy >= 95);

    if (isLoopSegment) {
      // ── ALUR MELINGKAR 360° (Loop-the-loop Circle) ──
      const loopSign = (Math.floor(i / 3) % 2 === 0) ? 1 : -1;
      const R = Math.min(isDesktop ? 32 : 18, Math.max(14, dy * 0.12));
      const k = 0.55228475 * R; // Konstanta aproksimasi lingkaran Bezier

      // Batasi titik pusat loop agar tetap aman di dalam batas lane
      const rawXc = xMid + loopSign * (R + (isDesktop ? 16 : 8));
      const xc = Math.max(p1.laneLeft + R + 20, Math.min(p1.laneRight - R - 20, rawXc));
      const yc = yMid;

      // 1. Masuk dari p1 ke puncak loop (xc, yc - R)
      const inCp1x = p1.x + loopSign * (isDesktop ? 22 : 10);
      const inCp1y = p1.y + dy * 0.22;
      const inCp2x = xc - loopSign * k;
      const inCp2y = yc - R;
      d += ` C ${inCp1x.toFixed(1)} ${inCp1y.toFixed(1)} ${inCp2x.toFixed(1)} ${inCp2y.toFixed(1)} ${xc.toFixed(1)} ${(yc - R).toFixed(1)}`;

      // 2. Putaran kuadran luar (atas -> sisi luar)
      const c1x = xc + loopSign * k;
      const c1y = yc - R;
      const c2x = xc + loopSign * R;
      const c2y = yc - k;
      const pRightX = xc + loopSign * R;
      const pRightY = yc;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${pRightX.toFixed(1)} ${pRightY.toFixed(1)}`;

      // 3. Putaran kuadran bawah (sisi luar -> bawah)
      const c3x = xc + loopSign * R;
      const c3y = yc + k;
      const c4x = xc + loopSign * k;
      const c4y = yc + R;
      const pBottomX = xc;
      const pBottomY = yc + R;
      d += ` C ${c3x.toFixed(1)} ${c3y.toFixed(1)} ${c4x.toFixed(1)} ${c4y.toFixed(1)} ${pBottomX.toFixed(1)} ${pBottomY.toFixed(1)}`;

      // 4. Putaran kuadran dalam (bawah -> sisi dalam)
      const c5x = xc - loopSign * k;
      const c5y = yc + R;
      const c6x = xc - loopSign * R;
      const c6y = yc + k;
      const pLeftX = xc - loopSign * R;
      const pLeftY = yc;
      d += ` C ${c5x.toFixed(1)} ${c5y.toFixed(1)} ${c6x.toFixed(1)} ${c6y.toFixed(1)} ${pLeftX.toFixed(1)} ${pLeftY.toFixed(1)}`;

      // 5. Keluar dari putaran loop menyilang anggun menuju p2
      const outCp1x = xc - loopSign * R;
      const outCp1y = yc - k;
      const outCp2x = p2.x - loopSign * (isDesktop ? 20 : 10);
      const outCp2y = p2.y - dy * 0.25;
      d += ` C ${outCp1x.toFixed(1)} ${outCp1y.toFixed(1)} ${outCp2x.toFixed(1)} ${outCp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    } else {
      // ── ALUR MELIUK (Meandering S-Curve sweep) ──
      const swingSign = (i % 2 === 0) ? 1 : -1;
      const swingAmp = Math.min(isDesktop ? 56 : 22, Math.max(14, dy * 0.22));
      const rawXPeak = xMid + swingSign * swingAmp;
      const xPeak = Math.max(p1.laneLeft + 25, Math.min(p1.laneRight - 25, rawXPeak));

      // Paruh pertama: p1 ke titik puncak liukan
      const cp1x = p1.x + swingSign * swingAmp * 0.45;
      const cp1y = p1.y + dy * 0.25;
      const cp2x = xPeak;
      const cp2y = yMid - dy * 0.12;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${xPeak.toFixed(1)} ${yMid.toFixed(1)}`;

      // Paruh kedua: dari titik puncak liukan menuju p2
      const cp3x = xPeak;
      const cp3y = yMid + dy * 0.12;
      const cp4x = p2.x + swingSign * swingAmp * 0.25;
      const cp4y = p2.y - dy * 0.25;
      d += ` C ${cp3x.toFixed(1)} ${cp3y.toFixed(1)} ${cp4x.toFixed(1)} ${cp4y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
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
      const maskPath = root.querySelector<SVGPathElement>("[data-kp-maskpath]");
      const glow = root.querySelector<SVGPathElement>("[data-kp-glow]");
      const mask = root.querySelector<SVGMaskElement>("[data-kp-mask]");
      const flow = root.querySelector<SVGPathElement>("[data-kp-flow]");
      const grad = root.querySelector<SVGLinearGradientElement>("[data-kp-grad]");
      const flowGrad = root.querySelector<SVGLinearGradientElement>("[data-kp-flowgrad]");
      const knight = root.querySelector<HTMLElement>("[data-kp-knight]");
      const embers = Array.from(root.querySelectorAll<HTMLElement>("[data-kp-ember]"));
      const yearEls = Array.from(root.querySelectorAll<HTMLElement>("[data-kp-year]"));
      if (!svg || !base || !lit || !knight) return;

      const reduce = window.matchMedia(MQ.reduce).matches;
      const revealed = new Set<number>();
      let master: ScrollTrigger | null = null;
      let tl: gsap.core.Timeline | null = null;
      let flowTween: gsap.core.Tween | null = null;
      let lastWidth = 0;
      let lastHeight = 0;
      let total = 1;

      const setEra = (fire: boolean) => root.setAttribute("data-kp-era", fire ? "fire" : "cold");

      // Year rail ------------------------------------------------------------
      let activeYear = "";
      const showYear = (year: string, dir: 1 | -1) => {
        if (!year || year === activeYear) return;
        const prev = yearEls.find((e) => e.dataset.kpYear === activeYear);
        const next = yearEls.find((e) => e.dataset.kpYear === year);
        activeYear = year;
        setEra(Number(year) >= fireFromYear);
        if (reduce) {
          yearEls.forEach((e) => gsap.set(e, { autoAlpha: e === next ? 1 : 0, yPercent: 0 }));
          return;
        }
        if (prev && prev !== next) {
          gsap.to(prev, { yPercent: -60 * dir, autoAlpha: 0, duration: 0.45, ease: "power2.in", overwrite: true });
        }
        if (next) {
          gsap.fromTo(next, { yPercent: 60 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, delay: 0.08, ease: "power3.out", overwrite: true });
        }
      };

      // Inisialisasi awal tahun: hanya tahun pertama yang terlihat
      yearEls.forEach((e, i) => gsap.set(e, { autoAlpha: i === 0 ? 1 : 0, yPercent: 0 }));
      if (yearEls[0]) {
        activeYear = yearEls[0].dataset.kpYear || "";
        setEra(Number(activeYear) >= fireFromYear);
      }

      // Embers & sparks (pooled) ---------------------------------------------
      let emberIdx = 0;
      let lastEmberAt = 0;
      const nextEmber = () => embers[emberIdx++ % embers.length];
      const spawnEmber = (x: number, y: number) => {
        if (!embers.length) return;
        const now = performance.now();
        if (now - lastEmberAt < 40) return;
        lastEmberAt = now;
        const e = nextEmber();
        const jx = (Math.random() - 0.5) * 16;
        gsap.killTweensOf(e);
        gsap.fromTo(
          e,
          { x: x + jx, y: y + 6, autoAlpha: 1, scale: 0.6 + Math.random() * 0.8 },
          { x: x + jx * 2, y: y - 22 - Math.random() * 26, autoAlpha: 0, scale: 0.15, duration: 0.7 + Math.random() * 0.4, ease: "power1.out" }
        );
      };
      const burst = (x: number, y: number) => {
        for (let k = 0; k < 7; k++) {
          const e = nextEmber();
          if (!e) return;
          const a = (Math.PI * 2 * k) / 7 + Math.random() * 0.5;
          const r = 26 + Math.random() * 26;
          gsap.killTweensOf(e);
          gsap.fromTo(
            e,
            { x, y, autoAlpha: 1, scale: 1.2 },
            { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r - 14, autoAlpha: 0, scale: 0.2, duration: 0.75, ease: "power2.out" }
          );
        }
      };

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
        if (core) gsap.fromTo(core, { scale: 0.4, rotate: -45 }, { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(3)", overwrite: true });
        if (tile) gsap.fromTo(tile, { autoAlpha: 1, scale: 0.6 }, { autoAlpha: 0, scale: 1.6, duration: 1.05, ease: "power2.out", overwrite: true });
        if (n.year >= fireFromYear) burst(n.x, n.y);
        if (card && !revealed.has(idx)) {
          revealed.add(idx);
          const photo = card.querySelector<HTMLElement>("[data-kp-photo] img");
          const text = card.querySelectorAll<HTMLElement>("[data-kp-text] > *");
          gsap.fromTo(card, { autoAlpha: 0, y: 40, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out" });
          if (photo) gsap.fromTo(photo, { yPercent: 8, scale: 1.12 }, { yPercent: 0, scale: 1, duration: 1.2, ease: "power3.out" });
          if (text.length) gsap.fromTo(text, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, delay: 0.12 });
        }
      };
      const leave = (n: NodePoint) => {
        n.el.setAttribute("data-state", "idle");
        n.item.setAttribute("data-state", "idle");
      };

      // Build / rebuild ------------------------------------------------------
      const build = contextSafe(() => {
        tl?.kill();
        master?.kill();
        flowTween?.kill();
        tl = null;
        master = null;
        flowTween = null;

        const rect = root.getBoundingClientRect();
        const W = Math.round(rect.width);
        const H = Math.round(root.scrollHeight);
        if (W <= 0 || H <= 0) return;
        lastWidth = W;
        lastHeight = H;

        // The route may wander across the whole field (the list column).
        const field = (root.querySelector("[data-kp-field]") as HTMLElement | null)?.getBoundingClientRect() || rect;
        const fieldL = field.left - rect.left;
        const fieldR = field.right - rect.left;

        const nodes: NodePoint[] = Array.from(root.querySelectorAll<HTMLElement>("[data-kp-node]")).map((el) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - rect.left,
            y: r.top + r.height / 2 - rect.top,
            year: Number(el.dataset.year || 0),
            el,
            item: (el.closest("[data-kp-item]") as HTMLElement) || el,
            laneLeft: fieldL,
            laneRight: fieldR,
          };
        });
        if (nodes.length < 1) return;

        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", String(W));
        svg.setAttribute("height", String(H));
        if (mask) {
          mask.setAttribute("x", "0");
          mask.setAttribute("y", "0");
          mask.setAttribute("width", String(W));
          mask.setAttribute("height", String(H));
        }

        // Cumulative path length at every node using buildKnightPath
        const fractions: number[] = [];
        const lens: number[] = [];
        for (let i = 0; i < nodes.length; i++) {
          if (i === 0) {
            lens.push(0);
          } else {
            base.setAttribute("d", buildKnightPath(nodes, i));
            lens.push(base.getTotalLength());
          }
        }
        const d = buildKnightPath(nodes);
        [base, glow, lit, maskPath, flow].forEach((p) => p?.setAttribute("d", d));
        total = Math.max(1, lit.getTotalLength());
        lens.forEach((l) => fractions.push(l / total));

        // Gradients anchored at the first Team Passion era node.
        const fireNode = nodes.find((n) => n.year >= fireFromYear);
        const fy = fireNode ? fireNode.y / H : 1.2;
        const clamp = (v: number) => Math.min(1, Math.max(0, v));
        [grad, flowGrad].forEach((g) => {
          if (!g) return;
          g.setAttribute("x1", "0");
          g.setAttribute("y1", "0");
          g.setAttribute("x2", "0");
          g.setAttribute("y2", String(H));
        });
        if (grad) {
          const stops = Array.from(grad.querySelectorAll<SVGStopElement>("[data-kp-stop]"));
          const offs = [0, clamp(fy - 0.07), clamp(fy), clamp(fy + (1 - fy) * 0.45), 1];
          stops.forEach((s, i) => s.setAttribute("offset", String(offs[i] ?? 1)));
        }
        if (flowGrad) {
          const stops = Array.from(flowGrad.querySelectorAll<SVGStopElement>("stop"));
          const offs = [0, clamp(fy - 0.01), clamp(fy + 0.02), 1];
          stops.forEach((s, i) => s.setAttribute("offset", String(offs[i] ?? 1)));
        }

        const dashTargets = [lit, glow, maskPath].filter(Boolean) as SVGPathElement[];
        gsap.set(dashTargets, { strokeDasharray: total, strokeDashoffset: reduce ? 0 : total });
        gsap.set(knight, { x: 0, y: 0, xPercent: 0, yPercent: 0 });

        const y0 = nodes[0].y;
        const yN = nodes[nodes.length - 1].y;
        const spanY = Math.max(1, yN - y0);
        const thresholds = nodes.map((n) => (n.y - y0) / spanY);
        const motion = (start: number, end: number) => ({ path: lit, align: lit, alignOrigin: [0.5, 0.5] as [number, number], start, end });

        const updateNodes = (p: number, animate: boolean, dir: 1 | -1) => {
          let current = 0;
          nodes.forEach((n, i) => {
            const shouldVisit = p >= thresholds[i] - 0.0008 && (p > 0.0005 || i === 0);
            const isVisited = n.el.dataset.state === "visited";
            if (shouldVisit) current = i;
            if (shouldVisit && !isVisited) land(n, i, animate);
            else if (!shouldVisit && isVisited) leave(n);
          });
          showYear(String(nodes[current].year), dir);
        };

        if (reduce) {
          gsap.set(knight, { motionPath: motion(1, 1) });
          nodes.forEach((n, i) => land(n, i, false));
          setEra(true);
          master = ScrollTrigger.create({
            trigger: root,
            start: () => `top+=${y0} ${LINE * 100}%`,
            end: () => `top+=${yN} ${LINE * 100}%`,
            onUpdate(self) {
              let current = 0;
              nodes.forEach((_, i) => {
                if (self.progress >= thresholds[i] - 0.001) current = i;
              });
              showYear(String(nodes[current].year), 1);
            },
          });
          return;
        }

        nodes.forEach((n, i) => {
          const card = n.item.querySelector<HTMLElement>("[data-kp-card]");
          if (card && !revealed.has(i)) gsap.set(card, { autoAlpha: 0, y: 40 });
        });

        // Flowing embers along the travelled (masked) fire-era path.
        if (flow) {
          gsap.set(flow, { strokeDasharray: "2 16", strokeDashoffset: 0 });
          flowTween = gsap.to(flow, { strokeDashoffset: -180, duration: 2.6, ease: "none", repeat: -1 });
        }

        gsap.set(knight, { motionPath: motion(0, 0) });

        let lastP = 0;
        tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: `top+=${y0} ${LINE * 100}%`,
            end: `top+=${yN} ${LINE * 100}%`,
            scrub: 0.5,
            onUpdate(self) {
              const p = self.progress;
              const dir: 1 | -1 = p >= lastP ? 1 : -1;
              updateNodes(p, true, dir);
              if (Math.abs(p - lastP) > 0.0003 && p > 0 && p < 1) {
                const off = Number(gsap.getProperty(lit, "strokeDashoffset")) || 0;
                const pt = lit.getPointAtLength(Math.max(0, total - off));
                spawnEmber(pt.x, pt.y);
              }
              lastP = p;
            },
          },
        });

        // Segmen tween berkelanjutan untuk garis berjalan & pergerakan avatar knight
        for (let i = 0; i < nodes.length - 1; i++) {
          const dur = Math.max(1, nodes[i + 1].y - nodes[i].y);
          const at = nodes[i].y - y0;
          tl.to(
            dashTargets,
            { strokeDashoffset: total * (1 - fractions[i + 1]), duration: dur, ease: "none" },
            at
          );
          tl.to(knight, { motionPath: motion(fractions[i], fractions[i + 1]), duration: dur, ease: "none" }, at);
        }

        master = tl.scrollTrigger || null;
        updateNodes(master ? master.progress : 0, false, 1);
      });

      build();

      // Refresh ekstra untuk memastikan DOM & font sudah ter-render sempurna
      const timerA = setTimeout(build, 250);
      const timerB = setTimeout(() => {
        build();
        ScrollTrigger.refresh();
      }, 700);

      // Refresh saat gambar selesai dimuat agar posisi node akurat
      const handleImageDone = () => {
        build();
        ScrollTrigger.refresh();
      };
      const imgs = Array.from(root.querySelectorAll("img"));
      imgs.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", handleImageDone, { once: true });
        }
      });
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
        clearTimeout(timerA);
        clearTimeout(timerB);
        ro.disconnect();
        offImages();
        imgs.forEach((img) => img.removeEventListener("load", handleImageDone));
        tl?.kill();
        master?.kill();
        flowTween?.kill();
      };
    },
    { scope: container, dependencies, revertOnUpdate: true }
  );
}
