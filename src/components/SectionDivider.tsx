import React from "react";
import styles from "./SectionDivider.module.css";

export default function SectionDivider() {
  return (
    <div className={styles.dividerWrap}>
      <div className={styles.line} />
      <div className={styles.icon}>♞</div>
      <div className={styles.line} />
    </div>
  );
}
