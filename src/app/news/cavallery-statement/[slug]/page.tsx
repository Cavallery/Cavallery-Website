import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../page.module.css";
import { query, isMySqlConfigured } from "@/lib/mysql";

interface NewsDetail {
  id: string;
  slug: string;
  title: string;
  label: string;
  description: string;
  content: string;
  image_url: string;
  images: string;
  published_at: string;
}

async function getNewsDetail(slug: string): Promise<NewsDetail | null> {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `news` WHERE `slug`=? OR `id`=? LIMIT 1", [slug, slug]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: String(r.id),
          slug: r.slug || `statement-${r.id}`,
          title: r.title || "",
          label: r.category || r.label || "Statement",
          description: r.summary || r.description || "",
          content: r.content || r.description || "",
          image_url: r.image_url || "/images/cava-logo.jpg",
          images: r.images || "",
          published_at: r.published_at ? new Date(r.published_at).toISOString() : new Date().toISOString(),
        };
      }
    }

    const res = await fetch(
      `https://v5.jkt48connect.com/api/cavallery/news/${slug}?apikey=JKTCONNECT`,
      {
        cache: "no-store",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0",
        },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// Parse "{url1,url2}" → ["url1", "url2"]
function parseImageArray(raw: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/^\{/, "")
    .replace(/\}$/, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Render content dengan \n\n sebagai paragraf terpisah
function renderContent(content: string) {
  return content.split("\n\n").map((para, i) => (
    <p key={i}>{para}</p>
  ));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsDetail(slug);
  if (!news) return { title: "Berita Tidak Ditemukan" };
  return {
    title: `${news.title} — Cavallery`,
    description: news.description,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsDetail(slug);

  if (!news) notFound();

  const galleryImages = parseImageArray(news.images);

  return (
    <div className={styles.page}>
      <div className={styles.detailContainer}>
        {/* Back button */}
        <Link href="/news" className={styles.backBtn}>
          <i className="bx bx-arrow-back" /> Kembali ke News
        </Link>

        {/* Header */}
        <div className={styles.detailHeader}>
          <div className={styles.labelBadge}>{news.label}</div>
          <h1 className={styles.detailTitle}>{news.title}</h1>
          <div className={styles.detailDate}>
            <i className="bx bx-calendar" />
            {new Date(news.published_at).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Main image */}
        {news.image_url && (
          <div className={styles.detailMainImg}>
            <Image
              src={news.image_url}
              alt={news.title}
              width={800}
              height={450}
              style={{ width: "100%", height: "auto" }}
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className={styles.detailContent}>
          {renderContent(news.content)}
        </div>

        {/* Image gallery jika ada gambar tambahan */}
        {galleryImages.length > 0 && (
          <div className={styles.detailGallery}>
            <h2 className={styles.galleryTitle}>Dokumentasi</h2>
            <div className={styles.detailGalleryGrid}>
              {galleryImages.map((url, i) => (
                <div key={i} className={styles.galleryImgWrap}>
                  <Image
                    src={url}
                    alt={`Dokumentasi ${i + 1}`}
                    width={400}
                    height={300}
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
