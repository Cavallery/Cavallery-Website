import type { ReactNode } from "react";
import ChessEyebrow from "./ChessEyebrow";
import SplitWords from "./SplitWords";
import styles from "./SectionHead.module.css";

interface Props {
  square: string;
  eyebrow: string;
  title: string;
  accent?: string;
  /** "pink" = primary accent, "fire" = Passion glow (use sparingly). */
  tone?: "pink" | "fire" | "none";
  subtitle?: ReactNode;
  /** "split": title left, subtitle right (desktop). */
  layout?: "stack" | "split" | "center";
  as?: "h1" | "h2";
  aside?: ReactNode;
  className?: string;
}

/** Editorial section header: notation eyebrow + display title + lead. */
export default function SectionHead({
  square,
  eyebrow,
  title,
  accent,
  tone = "fire",
  subtitle,
  layout = "stack",
  as: Tag = "h2",
  aside,
  className,
}: Props) {
  const accentClass = tone === "fire" ? styles.fire : tone === "pink" ? styles.pink : "";
  return (
    <header className={`${styles.head} ${className || ""}`} data-layout={layout}>
      <div className={styles.main}>
        <div data-reveal="fade">
          <ChessEyebrow square={square} label={eyebrow} />
        </div>
        <Tag className={`cv-display ${styles.title}`} data-reveal="words">
          <SplitWords text={title} />
          {accent ? (
            <>
              {" "}
              <SplitWords text={accent} className={accentClass} />
            </>
          ) : null}
        </Tag>
        {/* burning fuse: ignites from the left when the heading enters */}
        <span className={styles.fuse} aria-hidden="true">
          <span className={styles.fuseFill} data-reveal="fuse">
            <span className={styles.fuseSpark} />
          </span>
        </span>
      </div>
      {(subtitle || aside) && (
        <div className={styles.side}>
          {subtitle ? (
            <p className={styles.subtitle} data-reveal="up">
              {subtitle}
            </p>
          ) : null}
          {aside}
        </div>
      )}
    </header>
  );
}
