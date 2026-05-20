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
    src: "/images/erine1.jpg",
    title: "Erine JKT48 Trainee - Momen JakJapan Matsuri",
    date: "18 November 2023",
  },
  {
    id: 2,
    src: "/images/erine2.jpg",
    title: "Momen Te Wo Tsunaginagara - Erine",
    date: "Desember 2023",
  },
  {
    id: 3,
    src: "/images/erine3.jpg",
    title: "Erine JKT48 Promotional Banner",
    date: "2024",
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
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDate}>{item.date}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className={styles.lightbox} onClick={() => setSelectedItem(null)}>
          <button className={styles.lightboxClose} onClick={() => setSelectedItem(null)}>
            <i className="bx bx-x" />
          </button>
          <img src={selectedItem.src} alt={selectedItem.title} className={styles.lightboxImg} />
          <div className={styles.lightboxCaption}>
            <h3>{selectedItem.title}</h3>
            <p>{selectedItem.date}</p>
          </div>
        </div>
      )}
    </div>
  );
}
