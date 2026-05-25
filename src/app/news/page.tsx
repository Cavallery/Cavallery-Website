"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const DEFAULT_IMG =
  "https://res.cloudinary.com/haymzm4wp/image/upload/v1760105848/bi5ej2hgh0cc2uowu5xr.jpg";

// Proxy untuk gambar dari jkt48.com
function proxyImg(url: string): string {
  if (!url) return DEFAULT_IMG;
  if (!url.includes("jkt48.com")) return url;
  return `https://autumn-limit-898f.aslannarnia806.workers.dev/?url=${encodeURIComponent(url)}`;
}

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
    fetch(`/api/news?v=${new Date().getTime()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.news) {
          const items: NewsItem[] = d.data.news.map((n: any) => ({
            id:          n.id,
            title:       n.title,
            label:       n.category,
            date:        n.date,
            link_url:    n.url,
            image_url:   n.background_image,
            description: undefined,
          }));
          setNews(items);
        } else {
          setError(d.message || "Gagal memuat berita");
          setNews([]);
        }
      })
      .catch((e) => { setError(String(e)); setNews([]); })
      .finally(() => setLoading(false));
  }, []);

  // Komponen card image dengan fallback
  const CardImage = ({ item }: { item: NewsItem }) => {
    const [imgError, setImgError] = useState(false);
    const imgSrc = imgError || !item.image_url
      ? DEFAULT_IMG
      : proxyImg(item.image_url);

    return (
      <div className={styles.imgWrap}>
        <img
          src={imgSrc}
          alt={item.title}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className={styles.labelBadge}>{item.label || "Terkini"}</div>
      </div>
    );
  };

  const cardContent = (item: NewsItem) => (
    <>
      <CardImage item={item} />
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
    </>
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-news" /> Berita Terbaru</div>
          <h1 className={styles.heroTitle}>News <span className="textGold">JKT48</span></h1>
          <p className={styles.heroSub}>Informasi terkini seputar JKT48.</p>
        </div>
      </div>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.skeletons}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <i className="bx bx-error-circle" /> {error}
          </div>
        ) : news.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-news" />
            <p>Belum ada berita yang tersedia.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {news.map((item, idx) =>
              item.link_url?.startsWith("/") ? (
                <Link
                  key={item.id || idx}
                  href={item.link_url}
                  className={`glassCard ${styles.card}`}
                >
                  {cardContent(item)}
                </Link>
              ) : (
                
                  key={item.id || idx}
                  href={item.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`glassCard ${styles.card}`}
                >
                  {cardContent(item)}
                </a>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
