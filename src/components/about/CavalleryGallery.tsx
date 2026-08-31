"use client";

import { useState, useEffect } from "react";
import styles from "@/app/about/cavallery/page.module.css";

interface MediaItem {
  id: string;
  r2_key: string;
  file_name: string;
  original_name: string;
  public_url: string;
  mime_type: string;
  type: "image" | "video";
  file_size: string;
  folder: string;
  alt_text: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch only published media directly from the server
const API_URL = "/api/media?published_only=true&limit=100";

export default function CavalleryGallery() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "image" | "video">("all");
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [lightboxList, setLightboxList] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);

        let items: MediaItem[] = [];

        // Fetch published media from our API
        try {
          const res = await fetch(API_URL);
          if (res.ok) {
            const json = await res.json();
            if (json.status && Array.isArray(json.data?.items)) {
              items = json.data.items;
            }
          }
        } catch {}

        // Secondary check with published-media if items is empty
        if (items.length === 0) {
          try {
            const allRes = await fetch("/api/media?limit=100");
            const pubRes = await fetch("/api/published-media");
            if (allRes.ok && pubRes.ok) {
              const allJson = await allRes.json();
              const pubJson = await pubRes.json();
              const pubSet = new Set(pubJson.publishedIds || []);
              if (Array.isArray(allJson.data?.items)) {
                items = allJson.data.items.filter(
                  (it: any) => pubSet.has(it.id) || pubSet.has(it.public_url) || Number(it.is_published) === 1
                );
              }
            }
          } catch {}
        }

        // Normalize items: detect video type properly
        const normalizedItems: MediaItem[] = items
          .filter((item) => item && !item.deleted_at)
          .map((item) => {
            const isVideo =
              item.type === "video" ||
              item.mime_type?.startsWith("video/") ||
              /\.(mp4|webm|ogg|mov)$/i.test(item.public_url || item.file_name || "");
            return {
              ...item,
              type: isVideo ? ("video" as const) : ("image" as const),
            };
          });

        setMediaItems(normalizedItems);
      } catch (err: unknown) {
        setError((err as Error).message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  useEffect(() => {
    if (!lightboxItem) return;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxItem(null); return; }
      const idx = lightboxList.findIndex((i) => i.id === lightboxItem?.id);
      if (e.key === "ArrowRight") setLightboxItem(lightboxList[(idx + 1) % lightboxList.length]);
      if (e.key === "ArrowLeft") setLightboxItem(lightboxList[(idx - 1 + lightboxList.length) % lightboxList.length]);
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxItem, lightboxList]);

  const photos = mediaItems.filter((i) => i.type === "image");
  const videos = mediaItems.filter((i) => i.type === "video");

  const displayedItems = activeTab === "all"
    ? mediaItems
    : activeTab === "image"
    ? photos
    : videos;

  const openLightbox = (item: MediaItem) => {
    setLightboxList(displayedItems);
    setLightboxItem(item);
  };

  const navLightbox = (dir: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = lightboxList.findIndex((i) => i.id === lightboxItem?.id);
    setLightboxItem(lightboxList[(idx + dir + lightboxList.length) % lightboxList.length]);
  };

  const currentIdx = lightboxList.findIndex((i) => i.id === lightboxItem?.id);

  return (
    <div className={styles.gallerySection}>
      <div className={styles.headerWrapper}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bx-image" /> Galeri Dokumentasi
          </div>
          <h2 className={styles.sectionH} style={{ marginTop: 16 }}>
            Keseruan Bersama Cavallery
          </h2>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", maxWidth: 600, margin: "8px auto 0" }}>
            Kumpulan momen indah, kegiatan fanbase, dan keseruan bersama seluruh anggota Cavallery dalam mendukung Erine.
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className={styles.filterTabBar}>
        <button
          className={`${styles.filterTab} ${activeTab === "all" ? styles.filterTabActive : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <i className="bx bx-grid-alt" /> Semua ({mediaItems.length})
        </button>
        <button
          className={`${styles.filterTab} ${activeTab === "image" ? styles.filterTabActive : ""}`}
          onClick={() => setActiveTab("image")}
        >
          <i className="bx bx-images" /> Foto ({photos.length})
        </button>
        <button
          className={`${styles.filterTab} ${activeTab === "video" ? styles.filterTabActive : ""}`}
          onClick={() => setActiveTab("video")}
        >
          <i className="bx bx-video" /> Video ({videos.length})
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--fg-muted)" }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", marginBottom: "8px", display: "block" }} />
          Memuat galeri keseruan...
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {!loading && !error && displayedItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--fg-muted)" }}>
          <i className="bx bx-folder-open" style={{ fontSize: "2.5rem", marginBottom: "8px", display: "block", opacity: 0.6 }} />
          Belum ada dokumentasi {activeTab === "image" ? "foto" : activeTab === "video" ? "video" : "media"} yang dipublikasikan.
        </div>
      )}

      {/* GALLERY GRID */}
      {!loading && !error && displayedItems.length > 0 && (
        <div className={styles.galleryGrid}>
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.galleryGridCard} ${item.type === "video" ? styles.galleryGridCardVideo : ""}`}
              onClick={() => openLightbox(item)}
            >
              {item.type === "video" ? (
                <>
                  <video
                    src={item.public_url}
                    className={styles.galleryGridImage}
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className={styles.videoOverlay}>
                    <div className={styles.playIconCircle}>
                      <i className="bx bx-play" />
                    </div>
                    <span className={styles.videoLabel}>Tonton Video</span>
                  </div>
                  <div className={styles.typeBadge}>
                    <i className="bx bx-video" /> Video
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={item.public_url}
                    alt={item.alt_text || "Dokumentasi Cavallery"}
                    className={styles.galleryGridImage}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = "true";
                        target.src = "/images/gallery/erine-gallery-1.jpg";
                      }
                    }}
                  />
                  <div className={styles.photoOverlay}>
                    <div className={styles.zoomIconCircle}>
                      <i className="bx bx-expand" />
                    </div>
                  </div>
                  <div className={styles.typeBadge}>
                    <i className="bx bx-image" /> Foto
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxItem && (
        <div className={styles.lightbox} onClick={() => setLightboxItem(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setLightboxItem(null)}
              aria-label="Tutup"
            >
              <i className="bx bx-x" />
            </button>

            {lightboxList.length > 1 && (
              <button
                className={`${styles.navBtn} ${styles.prevBtn}`}
                onClick={(e) => navLightbox(-1, e)}
                aria-label="Sebelumnya"
              >
                <i className="bx bx-chevron-left" />
              </button>
            )}

            {lightboxItem.type === "video" ? (
              <video
                src={lightboxItem.public_url}
                className={styles.lightboxImage}
                controls
                autoPlay
              />
            ) : (
              <img
                src={lightboxItem.public_url}
                alt={lightboxItem.alt_text || "Dokumentasi Cavallery"}
                className={styles.lightboxImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = "true";
                    target.src = "/images/gallery/erine-gallery-1.jpg";
                  }
                }}
              />
            )}

            {lightboxList.length > 1 && (
              <button
                className={`${styles.navBtn} ${styles.nextBtn}`}
                onClick={(e) => navLightbox(1, e)}
                aria-label="Berikutnya"
              >
                <i className="bx bx-chevron-right" />
              </button>
            )}

            <div className={styles.counter}>
              {currentIdx + 1} / {lightboxList.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
