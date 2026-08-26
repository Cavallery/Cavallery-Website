import Link from "next/link";
import styles from "../page.module.css";
import { query, isMySqlConfigured } from "@/lib/mysql";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  label: string;
  description: string;
  image_url: string;
  link_url: string;
  is_internal: boolean;
  published_at: string;
}

async function getCavalleryNews(): Promise<NewsItem[]> {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `news` WHERE `is_active`=1 ORDER BY `published_at` DESC, `id` DESC");
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows.map((r) => ({
          id: String(r.id),
          slug: r.slug || `statement-${r.id}`,
          title: r.title || "",
          label: r.category || r.label || "Statement",
          description: r.summary || r.description || r.content?.slice(0, 140) || "",
          image_url: r.image_url || "/images/cava-logo.jpg",
          link_url: `/news/cavallery-statement/${r.slug || r.id}`,
          is_internal: true,
          published_at: r.published_at ? new Date(r.published_at).toISOString() : new Date().toISOString(),
        }));
      }
    }

    const res = await fetch(
      "https://v5.jkt48connect.com/api/cavallery/news?apikey=JKTCONNECT",
      {
        cache: "no-store",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
        },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.news ?? [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "News Cavallery",
  description: "Berita dan pernyataan resmi dari Cavallery, fanbase Erine JKT48.",
};

export default async function CavalleryNewsPage() {
  const news = await getCavalleryNews();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge">
            <i className="bx bx-file-blank" /> Cavallery Statement
          </div>
          <h1 className={styles.heroTitle}>
            Pernyataan <span className="textGold">Resmi</span>
          </h1>
          <p className={styles.heroSub}>
            Rilisan pers, pengumuman proyek, dan pernyataan resmi dari fanbase Cavallery.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {news.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-news" />
            <p>Belum ada pernyataan resmi yang dipublikasikan.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {news.map((item) => {
              const href = item.is_internal
                ? `/news/cavallery-statement/${item.slug}`
                : item.link_url;

              const isExt = !item.is_internal;

              return (
                <div key={item.id} className={`glassCard ${styles.card}`}>
                  {item.image_url && (
                    <div className={styles.imgWrap}>
                      <img src={item.image_url} alt={item.title} />
                      <div className={styles.labelBadge}>{item.label}</div>
                    </div>
                  )}
                  <div className={styles.cardBody}>
                    <div className={styles.date}>
                      <i className="bx bx-calendar" />
                      {new Date(item.published_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <h2 className={styles.cardTitle}>{item.title}</h2>
                    {item.description && (
                      <p className={styles.cardDesc}>{item.description}</p>
                    )}
                    {isExt ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.readMore}
                      >
                        Baca Selengkapnya <i className="bx bx-link-external" />
                      </a>
                    ) : (
                      <Link href={href} className={styles.readMore}>
                        Baca Selengkapnya <i className="bx bx-right-arrow-alt" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
