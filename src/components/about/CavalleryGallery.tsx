"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/app/about/cavallery/page.module.css";

const GALLERY_IMAGES = Array.from({ length: 18 }, (_, i) => `/images/about/cava-group-${i + 1}.jpeg`);

export default function CavalleryGallery() {
  const [index, setIndex] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (viewportRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340; // width (320) + gap (20)
      viewportRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (index === null) return;

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIndex(null);
      } else if (e.key === "ArrowRight") {
        setIndex((prev) => (prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null));
      } else if (e.key === "ArrowLeft") {
        setIndex((prev) => (prev !== null ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [index]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev !== null ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null));
  };

  return (
    <div className={styles.gallerySection}>
      <div className={styles.headerWrapper}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bx-image" /> Galeri Foto
          </div>
          <h2 className={styles.sectionH} style={{ marginTop: 16 }}>Keseruan Bersama Cavallery</h2>
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
            {GALLERY_IMAGES.map((src, i) => (
              <div
                key={src}
                className={styles.galleryCard}
                onClick={() => setIndex(i)}
              >
                <img
                  src={src}
                  alt={`Keseruan Cavallery ${i + 1}`}
                  className={styles.galleryImage}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {index !== null && (
        <div className={styles.lightbox} onClick={() => setIndex(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIndex(null)}>
              <i className="bx bx-x" />
            </button>
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrev}>
              <i className="bx bx-chevron-left" />
            </button>
            <img
              src={GALLERY_IMAGES[index]}
              alt={`Keseruan Cavallery ${index + 1}`}
              className={styles.lightboxImage}
            />
            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNext}>
              <i className="bx bx-chevron-right" />
            </button>
            <div className={styles.counter}>
              {index + 1} / {GALLERY_IMAGES.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
