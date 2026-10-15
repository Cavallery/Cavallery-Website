"use client";
import type { RefObject } from "react";
import { gsap, useGSAP, MQ, refreshOnImages } from "@/lib/gsap";

/**
 * Declarative scroll reveals inside `scope`. Mark elements with:
 *  - data-reveal="words"   → per-word mask reveal (use <SplitWords/>)
 *  - data-reveal="up"      → rise + fade (default)
 *  - data-reveal="stagger" → children ([data-reveal-item] or direct) stagger in
 *  - data-reveal="fade"    → opacity only
 * Optional: data-reveal-start="top 80%".
 * prefers-reduced-motion: nothing is hidden; content shows immediately.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const isDesktop = Boolean(ctx.conditions?.desktop);
        const dist = isDesktop ? 48 : 24;

        root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          const type = el.dataset.reveal || "up";
          const scrollTrigger = {
            trigger: el,
            start: el.dataset.revealStart || "top 86%",
            once: true,
          };

          if (type === "words") {
            const words = el.querySelectorAll(".cv-word__in");
            if (!words.length) return;
            gsap.from(words, {
              yPercent: 112,
              duration: 1.05,
              ease: "power4.out",
              stagger: isDesktop ? 0.06 : 0.04,
              scrollTrigger,
            });
          } else if (type === "stagger") {
            const marked = el.querySelectorAll("[data-reveal-item]");
            const items = marked.length ? marked : el.children;
            if (!items.length) return;
            gsap.from(items, {
              y: dist,
              opacity: 0,
              duration: 0.9,
              stagger: isDesktop ? 0.08 : 0.05,
              scrollTrigger,
            });
          } else if (type === "fade") {
            gsap.from(el, { opacity: 0, duration: 1, ease: "power2.out", scrollTrigger });
          } else {
            gsap.from(el, { y: dist, opacity: 0, duration: 0.9, scrollTrigger });
          }
        });
      });

      const offImages = refreshOnImages(root);
      return () => {
        offImages();
        mm.revert();
      };
    },
    { scope, dependencies, revertOnUpdate: true }
  );
}
