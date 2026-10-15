"use client";
import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface Options {
  /** When `current` is true the header never hides (menus open). */
  lockRef?: RefObject<boolean>;
  /** Re-run when the route changes so progress resets correctly. */
  dependencies?: unknown[];
}

/**
 * "Rank bar" header behaviour — one ScrollTrigger, no React re-renders:
 *  - 8 board squares ([data-rank-fill]) fill one-by-one with page progress
 *  - data-compact="true" once the page leaves the very top (header shrinks)
 *  - data-hidden="true" while scrolling down, removed when scrolling up
 */
export function useHeaderScroll(header: RefObject<HTMLElement | null>, options: Options = {}) {
  const { lockRef, dependencies = [] } = options;

  useGSAP(
    () => {
      const el = header.current;
      if (!el) return;
      const fills = Array.from(el.querySelectorAll<HTMLElement>("[data-rank-fill]"));
      const setters = fills.map((f) => gsap.quickSetter(f, "scaleX"));
      const count = fills.length || 8;
      let lastY = typeof window !== "undefined" ? window.scrollY : 0;

      const paint = (progress: number) => {
        for (let i = 0; i < setters.length; i++) {
          const v = Math.min(1, Math.max(0, progress * count - i));
          setters[i](v);
        }
      };

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate(self) {
          paint(self.progress);
          const y = self.scroll();
          el.setAttribute("data-compact", y > 24 ? "true" : "false");
          const locked = Boolean(lockRef?.current);
          const delta = y - lastY;
          if (locked || y < 140) {
            el.setAttribute("data-hidden", "false");
          } else if (delta > 6) {
            el.setAttribute("data-hidden", "true");
          } else if (delta < -6) {
            el.setAttribute("data-hidden", "false");
          }
          lastY = y;
        },
      });

      paint(st.progress);
      el.setAttribute("data-compact", window.scrollY > 24 ? "true" : "false");
      el.setAttribute("data-hidden", "false");

      return () => st.kill();
    },
    { scope: header, dependencies, revertOnUpdate: true }
  );
}
