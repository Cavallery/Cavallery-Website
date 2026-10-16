"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Legacy IntersectionObserver reveal for pages that haven't been redesigned.
 * Anything inside a [data-motion] subtree is owned by GSAP and skipped, so the
 * two systems never fight over transform/opacity (or break pinned sections).
 */
export default function ScrollRevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.08,
    });

    const setupObserver = () => {
      const selectors = ["section", ".glassCard", ".revealOnScroll", ".badge", ".divider"];

      const elements = document.querySelectorAll(selectors.join(", "));
      elements.forEach((el) => {
        if (el.closest("[data-motion]")) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add("revealed");
        } else {
          el.classList.add("reveal-init");
          const parent = el.parentElement;
          if (parent && (parent.classList.contains("grid") || parent.style.display === "grid")) {
            const siblings = Array.from(parent.children);
            const idx = siblings.indexOf(el);
            if (idx > 0 && idx < 6) {
              (el as HTMLElement).style.transitionDelay = `${idx * 0.08}s`;
            }
          }
          observer.observe(el);
        }
      });
    };

    const timer = setTimeout(setupObserver, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
