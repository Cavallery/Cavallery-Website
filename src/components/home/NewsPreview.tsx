/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./NewsPreview.module.css";
import SectionHead from "@/components/chess/SectionHead";
import { useReveal } from "@/hooks/useReveal";

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

const API_URL = "/api/news";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Resolve URL: internal pakai Link, eksternal pakai <a>
function hrefOf(item: NewsItem) {
  return item.is_internal
    ? item.link_url.startsWith("/")
      ? item.link_url
      : `/${item.link_url}`
    : item.link_url;
}

function ItemLink({
  item,
  className,
  children,
}: {
  item: NewsItem;
  className: string;
  children: React.ReactNode;
}) {
  return item.is_internal ? (
    <Link href={hrefOf(item)} className={className} data-reveal-item>
      {children}
    </Link>
  ) : (
    <a href={hrefOf(item)} target="_blank" rel="noreferrer" className={className} data-reveal-item>
      {children}
    </a>
  );
}

export default function NewsPreview() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetch(`${API_URL}?type=cavallery&_t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        const list = d?.data?.news || (Array.isArray(d?.data) ? d.data : (Array.isArray(d) ? d : []));
        if (Array.isArray(list) && list.length > 0) {
          const items: NewsItem[] = list
            .filter((n: any) => n.is_active !== false)
            .sort((a: any, b: any) => Number(b.is_pinned || 0) - Number(a.is_pinned || 0))
            .slice(0, 4);
          setNews(items);
        } else {
          setNews([]);
        }
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  useReveal(rootRef, [loading, news.length]);

  const [lead, ...rest] = news;

  return (
    <section ref={rootRef} className={styles.section} id="news-updates" data-motion>
      <SectionHead
        square="h5"
        eyebrow="Cavallery Statement"
        title="News &"
        accent="Updates"
        layout="split"
        subtitle="Pernyataan resmi, pengumuman proyek, dan informasi terkini dari fanbase Cavallery."
        aside={
          <Link href="/news" className={styles.all} data-reveal="fade">
            Lihat Semua Berita
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </Link>
        }
      />

      {loading ? (
        <div className={styles.loadWrap} aria-hidden="true">
          <div className={`${styles.skeleton} ${styles.skeletonLead}`} />
          <div className={styles.skeletonList}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        </div>
      ) : news.length === 0 ? (
        <div className={styles.empty}>
          <i className="bx bx-news" />
          <p>Berita tidak tersedia saat ini.</p>
        </div>
      ) : (
        <div className={styles.layout} data-reveal="stagger">
          {lead && (
            <ItemLink item={lead} className={styles.lead}>
              <span className={styles.leadMedia}>
                {lead.image_url ? (
                  <img src={lead.image_url} alt={lead.title} loading="lazy" decoding="async" />
                ) : (
                  <span className={styles.noImg} aria-hidden="true" />
                )}
                <span className={styles.leadSq}>h5 · 01</span>
              </span>
              <span className={styles.leadBody}>
                <span className={styles.labelRow}>
                  <span className={styles.label}>{lead.label || "Terkini"}</span>
                  {lead.is_pinned && <span className={styles.pinned}>Pinned</span>}
                  <span className={styles.date}>{formatDate(lead.published_at)}</span>
                </span>
                <span className={styles.leadTitle}>{lead.title}</span>
                {lead.description && <span className={styles.desc}>{lead.description}</span>}
              </span>
            </ItemLink>
          )}

          {rest.length > 0 && (
            <div className={styles.list}>
              {rest.map((item, idx) => (
                <ItemLink key={item.id ?? idx} item={item} className={styles.row}>
                  <span className={styles.rowIndex}>{String(idx + 2).padStart(2, "0")}</span>
                  <span className={styles.rowBody}>
                    <span className={styles.labelRow}>
                      <span className={styles.label}>{item.label || "Terkini"}</span>
                      {item.is_pinned && <span className={styles.pinned}>Pinned</span>}
                    </span>
                    <span className={styles.rowTitle}>{item.title}</span>
                    <span className={styles.date}>{formatDate(item.published_at)}</span>
                  </span>
                  {item.image_url && (
                    <span className={styles.rowThumb}>
                      <img src={item.image_url} alt="" loading="lazy" decoding="async" />
                    </span>
                  )}
                </ItemLink>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
