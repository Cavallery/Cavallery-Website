/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./HomeInfoSection.module.css";
import type { HomeBannerItem } from "@/lib/settings";
import SectionHead from "@/components/chess/SectionHead";
import { useReveal } from "@/hooks/useReveal";

const QUICK_LINKS = [
  { sq: "a1", icon: "bx-id-card", label: "Daftar Member", desc: "Gabung keluarga Cavallery", href: "/join" },
  { sq: "c3", icon: "bx-calendar-star", label: "Jadwal Erine", desc: "Theater, live & video call", href: "/schedule" },
  { sq: "e5", icon: "bx-joystick", label: "Main GameRine", desc: "Mini game bertema Erine", href: "/games" },
  { sq: "g7", icon: "bx-wallet", label: "Kas & Donasi", desc: "Transparansi kas fanbase", href: "/cavallery-kas" },
];

export default function HomeInfoSection() {
  const [banners, setBanners] = useState<HomeBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLElement | null>(null);

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

  useReveal(rootRef, [loading, banners.length]);

  // Jika tidak ada banner aktif, sembunyikan section agar tidak memakan ruang
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

  const toEmbed = (url: string) =>
    url.includes("youtube.com/shorts/")
      ? url.replace("youtube.com/shorts/", "www.youtube.com/embed/")
      : url.includes("watch?v=")
        ? url.replace("watch?v=", "embed/")
        : url.includes("youtu.be/")
          ? url.replace("youtu.be/", "www.youtube.com/embed/")
          : url;

  return (
    <section ref={rootRef} className={styles.section} id="info-berita" data-motion>
      <div className={styles.layout}>
        <div className={styles.aside}>
          <div className={styles.asideSticky}>
            <SectionHead
              square="f6"
              eyebrow="Agenda & Pengumuman"
              title="Informasi"
              accent="Terkini"
              subtitle="Pengumuman resmi komunitas, info open member, meet & greet, serta kegiatan terbaru Cavallery."
            />
            {!loading && (
              <p className={styles.count} data-reveal="fade">
                <span className={styles.countNum}>{String(banners.length).padStart(2, "0")}</span>
                <span>pengumuman aktif</span>
              </p>
            )}

            {/* Quick moves — fills the sticky column with useful shortcuts */}
            <nav className={styles.quick} aria-label="Pintasan cepat" data-reveal="stagger">
              {QUICK_LINKS.map((q) => (
                <a key={q.href} href={q.href} className={`${styles.quickLink} cv-flame-hover`} data-reveal-item>
                  <i className={`bx ${q.icon}`} aria-hidden="true" />
                  <span className={styles.quickText}>
                    <strong>{q.label}</strong>
                    <span>{q.desc}</span>
                  </span>
                  <span className={styles.quickArrow} aria-hidden="true">→</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className={styles.list} data-reveal="stagger">
          {loading &&
            [0, 1].map((i) => <div key={i} className={styles.skeleton} data-reveal-item aria-hidden="true" />)}

          {banners.map((item, idx) => {
            const isExternal = item.actionUrl?.startsWith("http://") || item.actionUrl?.startsWith("https://");
            const url = item.actionUrl || "/join";
            const lead = idx === 0;

            return (
              <article
                key={item.id}
                className={`${styles.card} ${lead ? styles.lead : ""}`}
                data-reveal-item
              >
                <div className={styles.topRow}>
                  <span className={styles.index}>{String(idx + 1).padStart(2, "0")}</span>
                  <span className={`${styles.badge} ${getBadgeClass(item.badgeColor)}`}>
                    <i className={`bx ${getBadgeIcon(item.badge)}`} /> {item.badge}
                  </span>
                  {item.priority && item.priority === 1 && <span className={styles.priority}>Utama</span>}
                </div>

                <div className={styles.body}>
                  {/* Media Video / Gambar Utama */}
                  {item.videoUrl ? (
                    <div
                      className={styles.videoWrap}
                      data-orientation={item.videoOrientation === "portrait" ? "portrait" : "landscape"}
                    >
                      {item.videoUrl.includes("youtube.com") || item.videoUrl.includes("youtu.be") ? (
                        <iframe
                          src={toEmbed(item.videoUrl)}
                          title={item.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      ) : (
                        <video src={item.videoUrl} controls playsInline preload="metadata" />
                      )}
                    </div>
                  ) : item.imageUrl ? (
                    <div className={styles.imageWrap}>
                      <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async" />
                    </div>
                  ) : null}

                  <div className={styles.text}>
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

                    {item.sessions && item.sessions.length > 0 && (
                      <div className={styles.sessionsTableWrap}>
                        <div className={styles.sessionsTableTitle}>
                          <i className="bx bx-time-five" />
                          <span>Jadwal Sesi &amp; Waktu</span>
                        </div>
                        <table className={styles.sessionsTable}>
                          <thead>
                            <tr>
                              <th>Sesi</th>
                              <th>Waktu / Jam</th>
                              <th>Keterangan / Jalur</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.sessions.map((s, sIdx) => (
                              <tr key={sIdx}>
                                <td>
                                  <span className={styles.sessionTag}>{s.sessionName}</span>
                                </td>
                                <td className={styles.sessionTime}>{s.time}</td>
                                <td className={styles.sessionInfo}>{s.info || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {isExternal ? (
                      <a href={url} target="_blank" rel="noreferrer" className={`${styles.actionBtn} cv-flame-hover`}>
                        <span>{item.actionText || "Selengkapnya"}</span>
                        <i className="bx bx-right-arrow-alt" />
                      </a>
                    ) : (
                      <Link href={url} className={`${styles.actionBtn} cv-flame-hover`}>
                        <span>{item.actionText || "Selengkapnya"}</span>
                        <i className="bx bx-right-arrow-alt" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
