"use client";
import { useRef } from "react";
import styles from "./SectionDivider.module.css";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

/** Rank/file divider: a board edge with a–h coordinates and a burning fuse. */
export default function SectionDivider({ rank }: { rank?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-fuse]",
          { xPercent: -101 },
          {
            xPercent: 0,
            duration: 1.8,
            ease: "power2.inOut",
            scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div className={styles.dividerWrap} aria-hidden="true" ref={ref}>
      <div className={styles.files}>
        <span className={styles.fuse}>
          <span className={styles.fuseFill} data-fuse>
            <span className={styles.spark} />
          </span>
        </span>
        {FILES.map((f, i) => (
          <span key={f} className={styles.file} data-dark={i % 2 === 0 ? "true" : "false"}>
            <span className={styles.label}>
              {f}
              {rank ? rank : ""}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
