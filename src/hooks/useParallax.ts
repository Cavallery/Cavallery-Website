"use client";
import type { RefObject } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

/**
 * Subtle scrubbed parallax for `[data-parallax="<yPercent>"]` inside scope.
 * Positive values move the element down (slower than the page).
 * Mobile uses half intensity; reduced-motion disables it entirely.
 */
export function useParallax(scope: RefObject<HTMLElement | null>, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const factor = ctx.conditions?.desktop ? 1 : 0.5;
        root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = parseFloat(el.dataset.parallax || "8") * factor;
          gsap.fromTo(
            el,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest("[data-parallax-root]") || el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true }
  );
}
