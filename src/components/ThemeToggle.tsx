"use client";

import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // The theme itself is applied before paint by the inline script in
    // app/layout.tsx; here we only make sure class + data-theme agree.
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Observe perubahan class "dark" → sync balik ke data-theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <AnimatedThemeToggler
      className={`${styles.toggle} ${className || ""}`}
      aria-label="Ganti mode terang / gelap"
      title="Ganti mode terang / gelap"
      variant="circle"
      duration={500}
    />
  );
}
