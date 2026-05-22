import Link from "next/link";
import styles from "../page.module.css";

interface CavalleryNewsItem {
  id: string;
  title: string;
  label: string;
  date: string;
  link_url: string;
  image_url: string;
  description: string;
}

const CAVALLERY_NEWS: CavalleryNewsItem[] = [
  {
    id: "cavallery-statement-2026",
    title: "Pernyataan Resmi Cavallery",
    label: "Resmi",
    date: "2026-05-19T00:00:00",
    link_url: "/news/cavallery-statement/detail",
    image_url: "/images/cava-logo.jpg",
    description:
      "Cavallery menyadari bahwa dalam beberapa hari terakhir telah beredar sejumlah unggahan bernada ancaman dan pembahasan yang mengarah pada ancaman secara langsung terhadap Erine.",
  },
];

export const metadata = {
  title: "News Cavallery",
  description: "Berita dan pernyataan resmi dari Cavallery, fanbase Erine JKT48.",
};

export default function CavalleryNewsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-shield-quarter" /> Berita Cavallery</div>
          <h1 className={styles.heroTitle}>News <span className="textGold">Cavallery</span></h1>
          <p className={styles.heroSub}>
            Pernyataan resmi dan berita dari fanbase Cavallery.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {CAVALLERY_NEWS.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-news" />
            <p>Belum ada berita yang tersedia.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {CAVALLERY_NEWS.map((item) => (
              <Link
                key={item.id}
                href={item.link_url}
                className={`glassCard ${styles.card}`}
              >
                <div className={styles.imgWrap}>
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                  <div className={styles.labelBadge}>{item.label}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.date}>
                    <i className="bx bx-calendar" />
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
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
