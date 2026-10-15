import styles from "./SectionDivider.module.css";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

/** Rank/file divider: a board edge with a–h file coordinates. */
export default function SectionDivider({ rank }: { rank?: number }) {
  return (
    <div className={styles.dividerWrap} aria-hidden="true">
      <div className={styles.files}>
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
