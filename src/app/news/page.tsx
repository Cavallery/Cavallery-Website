"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface NewsItem {
  id: string;
  title: string;
  label: string;
  date: string;
  link_url: string;
  image_url?: string;
  description?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const items = Array.isArray(d.data) ? d.data : [];
          setNews(items);
        } else {
          setError(d.message || "Gagal memuat berita");
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-news" /> Berita Terbaru</div>
          <h1 className={styles.heroTitle}>News & <span className="textGold">Updates</span></h1>
          <p className={styles.heroSub}>
            Informasi terkini seputar Erine, JKT48, dan kegiatan fanbase Cavallery.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.skeletons}>
            {[0,1,2,3,4,5].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : error ? (
          <div className={styles.errorBox}><i className="bx bx-error-circle" /> {error}</div>
        ) : news.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-news" />
            <p>Belum ada berita yang tersedia.</p>
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
                <div className={styles.imgWrap}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} loading="lazy" />
                  ) : (
                    <div className={styles.noImg}><i className="bx bx-image" /></div>
                  )}
                  <div className={styles.labelBadge}>{item.label || "Terkini"}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.date}>
                    <i className="bx bx-calendar" />
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </div>
                  <h2 className={styles.cardTitle}>{item.title}</h2>
                  {item.description && <p className={styles.cardDesc}>{item.description}</p>}
                  <div className={styles.readMore}>
                    Baca Selengkapnya <i className="bx bx-right-arrow-alt" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
