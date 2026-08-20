import React from "react";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Photobooth Cheki — #ErineTheWayfinder | Cavallery",
  description: "Photobooth Cheki edisi Seitansai Erine ke-19 #ErineTheWayfinder oleh Cavallery.",
  openGraph: {
    title: "Photobooth Cheki — #ErineTheWayfinder",
    description: "Ambil foto cheki spesial Seitansai Erine bersama Cavallery.",
  },
};

export default function PhotoboothPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>✨ Special Feature</span>
          <h1 className={styles.title}>Photobooth Cheki</h1>
          <p className={styles.sub}>
            Ambil foto & hias Cheki spesial Seitansai Erine <strong>#ErineTheWayfinder</strong> langsung dari perangkatmu!
          </p>
        </div>

        <div className={styles.frameWrap}>
          <iframe
            src="https://photobooth-cheki-19.netlify.app/"
            title="Photobooth Cheki #ErineTheWayfinder"
            className={styles.iframe}
            allow="camera; microphone; fullscreen; clipboard-write; display-capture"
            allowFullScreen
          />
        </div>
      </div>
    </main>
  );
}
