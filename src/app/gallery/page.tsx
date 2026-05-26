"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  date: string;
}

const initialGalleryItems: GalleryItem[] = [
  {
    id: 1,
    src: "/images/gallery/erine-gallery-1.jpg",
    title: "Selfie Manis Erine Bersama Member",
    date: "2026",
  },
  {
    id: 2,
    src: "/images/gallery/erine-gallery-2.jpg",
    title: "Keseruan Backstage Teater Cara Meminum Ramune",
    date: "2026",
  },
  {
    id: 3,
    src: "/images/gallery/erine-gallery-3.jpg",
    title: "Erine dengan Gaya Denim Kasual yang Keren",
    date: "2026",
  },
  {
    id: 4,
    src: "/images/gallery/erine-gallery-4.jpg",
    title: "Ekspresi Lucu dan Grumpy Menggemaskan Erine",
    date: "2026",
  },
];

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="badge">
          <i className="bx bx-image" /> Gallery
        </div>
        <h1 className={styles.heroTitle}>
          Erine <span className="textGold">Gallery</span>
        </h1>
        <p className={styles.heroSub}>
          Kumpulan foto terindah catherina vallencia.
        </p>
      </div>

      <div className={styles.grid}>
        {initialGalleryItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.card} glassCard`}
            onClick={() => setSelectedItem(item)}
          >
            <img src={item.src} alt={item.title} className={styles.cardImg} />
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className={styles.lightbox} onClick={() => setSelectedItem(null)}>
          <button className={styles.lightboxClose} onClick={() => setSelectedItem(null)}>
            <i className="bx bx-x" />
          </button>
          <img src={selectedItem.src} alt={selectedItem.title} className={styles.lightboxImg} />

        </div>
      )}
    </div>
  );
}
