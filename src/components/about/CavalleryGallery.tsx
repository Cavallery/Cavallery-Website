"use client";

import { useState, useEffect, useRef } from "react";
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

const API_URL = "https://v5.jkt48connect.com/api/cavallery/media?apikey=JKTCONNECT";

export default function CavalleryGallery() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Gagal mengambil data media");
        const json = await res.json();
        if (!json.status) throw new Error(json.message || "Response tidak valid");

        const filtered: MediaItem[] = (json.data.items as MediaItem[]).filter(
          (item) =>
            item.deleted_at === null &&
            (item.folder === "cavallery/images" || item.folder === "cavallery/videos")
        );

        setMediaItems(filtered);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const checkScroll = () => {
    if (viewportRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = viewportRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [mediaItems]);

  const handleScroll = (direction: "left" | "right") => {
    if (viewportRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      viewportRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (index === null) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIndex(null);
      } else if (e.key === "ArrowRight") {
        setIndex((prev) => (prev !== null ? (prev + 1) % mediaItems.length : null));
      } else if (e.key === "ArrowLeft") {
        setIndex((prev) => (prev !== null ? (prev - 1 + mediaItems.length) % mediaItems.length : null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [index, mediaItems.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev !== null ? (prev - 1 + mediaItems.length) % mediaItems.length : null));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev !== null ? (prev + 1) % mediaItems.length : null));
  };

  const currentItem = index !== null ? mediaItems[index] : null;

  return (
    <div className={styles.gallerySection}>
      <div className={styles.headerWrapper}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bx-image" /> Galeri Foto
          </div>
          <h2 className={styles.sectionH} style={{ marginTop: 16 }}>
            Keseruan Bersama Cavallery
          </h2>
        </div>

        <div className={styles.navButtons}>
          <button
            className={styles.slideBtn}
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <i className="bx bx-chevron-left" />
          </button>
          <button
            className={styles.slideBtn}
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <i className="bx bx-chevron-right" />
          </button>
        </div>
      </div>

      <div className={styles.carouselContainer}>
        <div className={styles.carouselViewport} ref={viewportRef}>
          <div className={styles.carouselTrack}>
            {loading && (
              <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                Memuat galeri...
              </div>
            )}
            {error && (
              <div style={{ padding: "2rem", color: "red" }}>
                {error}
              </div>
            )}
            {!loading && !error && mediaItems.length === 0 && (
              <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                Belum ada media tersedia.
              </div>
            )}
            {!loading &&
              !error &&
              mediaItems.map((item, i) => (
                <div
                  key={item.id}
                  className={styles.galleryCard}
                  onClick={() => setIndex(i)}
                  style={{ position: "relative" }}
                >
                  {item.type === "video" ? (
                    <>
                      <video
                        src={item.public_url}
                        className={styles.galleryImage}
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.25)",
                          borderRadius: "inherit",
                        }}
                      >
                        <i className="bx bx-play-circle" style={{ fontSize: 40, color: "#fff" }} />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.public_url}
                      alt={item.alt_text}
                      className={styles.galleryImage}
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {index !== null && currentItem && (
        <div className={styles.lightbox} onClick={() => setIndex(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIndex(null)}>
              <i className="bx bx-x" />
            </button>
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrev}>
              <i className="bx bx-chevron-left" />
            </button>

            {currentItem.type === "video" ? (
              <video
                src={currentItem.public_url}
                className={styles.lightboxImage}
                controls
                autoPlay
              />
            ) : (
              <img
                src={currentItem.public_url}
                alt={currentItem.alt_text}
                className={styles.lightboxImage}
              />
            )}

            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNext}>
              <i className="bx bx-chevron-right" />
            </button>
            <div className={styles.counter}>
              {index + 1} / {mediaItems.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
