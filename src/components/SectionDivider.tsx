import type { CSSProperties } from "react";
import styles from "./SectionDivider.module.css";
import KnightSvg from "./chess/KnightSvg";

const WORDS = ["Cavallery", "Team Passion", "Checkmate!", "Erine JKT48", "Hadir dengan seribu kejutan"];

function Tape({ rank, reverse, className }: { rank?: number; reverse?: boolean; className: string }) {
  const words = rank ? [...WORDS, `Rank ${rank}`] : WORDS;
  return (
    <div className={`${styles.tape} ${className}`}>
      <div className={styles.track} style={{ "--dir": reverse ? "reverse" : "normal" } as CSSProperties}>
        {[0, 1].map((g) => (
          <div className={styles.group} key={g}>
            {[...words, ...words].map((w, i) => (
              <span className={styles.item} key={i}>
                {w}
                <KnightSvg size={18} className={styles.knight} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Section break: two crossing Passion tapes that scroll in opposite
 * directions — fills the gap between sections with motion and colour.
 * Pure CSS (transform only); static under prefers-reduced-motion.
 */
export default function SectionDivider({ rank }: { rank?: number }) {
  return (
    <div className={styles.dividerWrap} aria-hidden="true">
      <Tape rank={rank} reverse className={styles.back} />
      <Tape rank={rank} className={styles.front} />
    </div>
  );
}
