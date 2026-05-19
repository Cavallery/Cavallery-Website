"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./NewsPreview.module.css";

interface NewsItem {
  id: string;
  title: string;
  label: string;
  date: string;
  link_url: string;
  image_url?: string;
}

export default function NewsPreview() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => {
        const items = d?.data || d?.news || [];
        setNews(items.slice(0, 4));
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className="badge">
          <i className="bx bx-news" /> Berita Terkini
        </div>
        <h2 className={`sectionTitle textGold ${styles.title}`}>News & Updates</h2>
        <div className="divider" />
        <p className={styles.subtitle}>
          Informasi terbaru seputar Erine dan JKT48.
        </p>
      </div>

      {loading ? (
        <div className={styles.loadWrap}>
          {[0,1,2,3].map(i => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className={styles.empty}>
          <i className="bx bx-news" />
          <p>Berita tidak tersedia saat ini.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {news.map((item, idx) => (
            <a
              key={item.id || idx}
              href={item.link_url}
              target="_blank"
              rel="noreferrer"
              className={`glassCard ${styles.card}`}
            >
              {item.image_url && (
                <div className={styles.img}>
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                </div>
              )}
              <div className={styles.body}>
                <span className={styles.label}>{item.label || "Terkini"}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <span className={styles.date}>
                  <i className="bx bx-calendar" />
                  {new Date(item.date).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className={styles.cta}>
        <Link href="/news" className="btnOutline">
          <i className="bx bx-news" /> Lihat Semua Berita
        </Link>
      </div>
    </section>
  );
}
