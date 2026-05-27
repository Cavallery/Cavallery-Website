"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./NewsPreview.module.css";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  label: string;
  description?: string;
  published_at: string;
  link_url: string;
  image_url?: string | null;
  is_internal: boolean;
  is_pinned: boolean;
  is_active: boolean;
}

const API_URL = "https://v5.jkt48connect.com/api/cavallery/news?apikey=JKTCONNECT";

export default function NewsPreview() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}&_t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.status && Array.isArray(d?.data?.news)) {
          // Tampilkan hanya yang aktif, pinned duluan
          const items: NewsItem[] = d.data.news
            .filter((n: NewsItem) => n.is_active)
            .sort((a: NewsItem, b: NewsItem) => Number(b.is_pinned) - Number(a.is_pinned))
            .slice(0, 4);
          setNews(items);
        } else {
          setNews([]);
        }
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
          {[0, 1, 2, 3].map((i) => (
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
          {news.map((item, idx) => {
            const cardInner = (
              <>
                {item.image_url && (
                  <div className={styles.img}>
                    <img src={item.image_url} alt={item.title} loading="lazy" />
                  </div>
                )}
                <div className={styles.body}>
                  <div className={styles.labelRow}>
                    <span className={styles.label}>{item.label || "Terkini"}</span>
                    {item.is_pinned && (
                      <span className={styles.pinned}>
                        <i className="bx bx-pin" /> Pinned
                      </span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  {item.description && (
                    <p className={styles.desc}>{item.description}</p>
                  )}
                  <span className={styles.date}>
                    <i className="bx bx-calendar" />
                    {new Date(item.published_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </>
            );

            // Resolve URL: internal pakai Link, eksternal pakai <a>
            const resolvedHref = item.is_internal
              ? item.link_url.startsWith("/")
                ? item.link_url
                : `/${item.link_url}`
              : item.link_url;

            return item.is_internal ? (
              <Link
                key={item.id ?? idx}
                href={resolvedHref}
                className={`glassCard ${styles.card}`}
              >
                {cardInner}
              </Link>
            ) : (
              
                key={item.id ?? idx}
                href={resolvedHref}
                target="_blank"
                rel="noreferrer"
                className={`glassCard ${styles.card}`}
              >
                {cardInner}
              </a>
            );
          })}
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
