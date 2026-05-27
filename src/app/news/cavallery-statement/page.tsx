import Link from "next/link";
import styles from "../page.module.css";

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
    const res = await fetch(
      "https://v5.jkt48connect.com/api/cavallery/news?apikey=JKTCONNECT",
      { cache: "no-store" } // Selalu ambil data terbaru (no cache)
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
            <i className="bx bx-shield-quarter" /> Berita Cavallery
          </div>
          <h1 className={styles.heroTitle}>
            News <span className="textGold">Cavallery</span>
          </h1>
          <p className={styles.heroSub}>
            Pernyataan resmi dan berita dari fanbase Cavallery.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {news.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-news" />
            <p>Belum ada berita yang tersedia.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {news.map((item) => (
              <Link
  key={item.id}
  href={`/news/cavallery-statement/${item.slug}`}  // ← pakai slug
  className={`glassCard ${styles.card}`}
>
                <div className={styles.imgWrap}>
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                  <div className={styles.labelBadge}>{item.label}</div>
                </div>
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
                  <p className={styles.cardDesc}>{item.description}</p>
                  <div className={styles.readMore}>
                    Baca Selengkapnya <i className="bx bx-right-arrow-alt" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
