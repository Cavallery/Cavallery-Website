"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if IntersectionObserver is supported
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
      rootMargin: "0px 0px -40px 0px", // Trigger slightly before it hits bottom of viewport
      threshold: 0.08,
    });

    const setupObserver = () => {
      const selectors = [
        "section",
        ".glassCard",
        "[data-reveal]",
        ".revealOnScroll",
        ".badge",
        ".divider",
      ];

      const elements = document.querySelectorAll(selectors.join(", "));
      elements.forEach((el, index) => {
        // Skip hero top elements so they are immediately visible
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add("revealed");
        } else {
          el.classList.add("reveal-init");
          // Add staggered delay for sibling cards in same grid
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

    // Run after DOM paints
    const timer = setTimeout(setupObserver, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
