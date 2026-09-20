"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./HomeInfoSection.module.css";
import type { HomeBannerItem } from "@/lib/settings";

export default function HomeInfoSection() {
  const [banners, setBanners] = useState<HomeBannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/master-data?_t=${Date.now()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.status && Array.isArray(json?.data?.homeBanners)) {
          const activeList = json.data.homeBanners
            .filter((b: HomeBannerItem) => b.isActive !== false)
            .sort((a: HomeBannerItem, b: HomeBannerItem) => (a.priority || 99) - (b.priority || 99));
          setBanners(activeList);
        }
      })
      .catch((err) => console.error("Error loading home banners:", err))
      .finally(() => setLoading(false));
  }, []);

  // Jika sedang loading atau tidak ada banner aktif, sembunyikan section agar tidak memakan ruang
  if (!loading && banners.length === 0) {
    return null;
  }

  const getBadgeClass = (color?: string) => {
    switch (color) {
      case "blue":
        return styles.badgeBlue;
      case "green":
        return styles.badgeGreen;
      case "pink":
        return styles.badgePink;
      case "red":
        return styles.badgeRed;
      case "gold":
      default:
        return styles.badgeGold;
    }
  };

  const getBadgeIcon = (badge: string) => {
    const b = badge.toLowerCase();
    if (b.includes("member")) return "bx-user-plus";
    if (b.includes("meet") || b.includes("greet")) return "bx-conversation";
    if (b.includes("event") || b.includes("show")) return "bx-calendar-event";
    if (b.includes("war") || b.includes("tiket")) return "bx-flame";
    return "bx-bell";
  };

  return (
    <section className={styles.section} id="info-berita">
      <div className={styles.header}>
        <div className="badge">
          <i className="bx bx-broadcast" /> Agenda &amp; Pengumuman
        </div>
        <h2 className="sectionTitle textGold">Informasi Terkini</h2>
        <div className="divider" />
        <p className={styles.subtitle}>
          Pengumuman resmi komunitas, info open member, meet &amp; greet, serta kegiatan terbaru Cavallery.
        </p>
      </div>

      <div className={styles.grid}>
        {banners.map((item) => {
          const isExternal = item.actionUrl?.startsWith("http://") || item.actionUrl?.startsWith("https://");
          const url = item.actionUrl || "/join";

          return (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardGlow} />

              <div>
                <div className={styles.topRow}>
                  <span className={`${styles.badge} ${getBadgeClass(item.badgeColor)}`}>
                    <i className={`bx ${getBadgeIcon(item.badge)}`} /> {item.badge}
                  </span>
                  {item.priority && item.priority === 1 && (
                    <span style={{ fontSize: "0.72rem", color: "var(--gold)", fontWeight: 700 }}>
                      ? Utama
                    </span>
                  )}
                </div>

                {item.imageUrl && (
                  <div className={styles.imageWrap}>
                    <img src={item.imageUrl} alt={item.title} />
                  </div>
                )}

                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>

                {(item.dateInfo || item.locationInfo) && (
                  <div className={styles.metaInfo}>
                    {item.dateInfo && (
                      <div className={styles.metaItem}>
                        <i className="bx bx-calendar" />
                        <span>{item.dateInfo}</span>
                      </div>
                    )}
                    {item.locationInfo && (
                      <div className={styles.metaItem}>
                        <i className="bx bx-map-pin" />
                        <span>{item.locationInfo}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                {isExternal ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.actionBtn} ${styles.btnPrimary}`}
                  >
                    <span>{item.actionText || "Selengkapnya"}</span>
                    <i className="bx bx-right-arrow-alt" />
                  </a>
                ) : (
                  <Link
                    href={url}
                    className={`${styles.actionBtn} ${styles.btnPrimary}`}
                  >
                    <span>{item.actionText || "Selengkapnya"}</span>
                    <i className="bx bx-right-arrow-alt" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
