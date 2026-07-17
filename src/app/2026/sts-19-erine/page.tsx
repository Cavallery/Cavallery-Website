import React from "react";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STS 19 ERINE | Cavallery",
  description: "Perayaan ulang tahun ke-19 Catherina Vallencia Kurniawan (Erine) JKT48.",
};

export default function Sts19ErinePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>STS 19 ERINE</h1>
      
      {/* Cake Visualization */}
      <div className={styles.cakeWrapper}>
        <div className={styles.plate}></div>
        <div className={`${styles.cakeLayer} ${styles.layerBottom}`}></div>
        <div className={`${styles.cakeLayer} ${styles.layerMiddle}`}></div>
        <div className={`${styles.cakeLayer} ${styles.layerTop}`}></div>
        <div className={styles.icing}></div>
        <div className={`${styles.drip} ${styles.drip1}`}></div>
        <div className={`${styles.drip} ${styles.drip2}`}></div>
        <div className={`${styles.drip} ${styles.drip3}`}></div>
        <div className={styles.candles}>
          <div className={`${styles.digit} ${styles.digit1}`}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <text x="62" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="900" textAnchor="middle" fill="#7B020B">1</text>
            </svg>
            <div className={`${styles.flame} ${styles.digit1Flame}`}></div>
          </div>
          <div className={`${styles.digit} ${styles.digit9}`}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <text x="38" y="80" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="900" textAnchor="middle" fill="#7B020B">9</text>
            </svg>
            <div className={`${styles.flame} ${styles.digit9Flame}`}></div>
          </div>
        </div>
      </div>
    </main>
  );
}
