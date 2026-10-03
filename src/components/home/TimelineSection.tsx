/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./TimelineSection.module.css";
import initialMilestones from "@/data/milestone.json";

interface TimelineEvent {
  id: string;
  year: string;
  date_label: string;
  event_date?: string;
  title: string;
  description: string;
  image_url: string | null;
  handwriting_caption?: string;
  sort_order?: number;
}

interface TimelineData {
  years: string[];
  events: TimelineEvent[];
}

const ROTATIONS = [-2.4, 1.8, -1.6, 2.5, -2.8, 1.4, -2.1, 2.2];

function buildDefaultTimelineData(): TimelineData {
  const events = (initialMilestones || []) as TimelineEvent[];
  const yearsSet = new Set<string>();
  events.forEach((ev) => {
    yearsSet.add(String(ev.year || "2026"));
  });
  const years = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
  return { years, events };
}

function groupByYear(events: TimelineEvent[]) {
  const map = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const yr = String(ev.year || "2026");
    let dateLabel = ev.date_label || "";
    if (yr === "2024" && dateLabel.includes("2025")) {
      dateLabel = dateLabel.replace("2025", "2024");
    }
    const cleanEv = { ...ev, date_label: dateLabel };
    if (!map.has(yr)) {
      map.set(yr, []);
    }
    map.get(yr)!.push(cleanEv);
  }

  // Urutkan tahun dari terkecil ke terbesar (2023, 2024, 2025, 2026)
  const sortedYears = Array.from(map.keys()).sort((a, b) => Number(a) - Number(b));

  return sortedYears.map((year) => {
    const evList = map.get(year) || [];
    evList.sort((a, b) => {
      const da = a.event_date ? new Date(a.event_date).getTime() : NaN;
      const db = b.event_date ? new Date(b.event_date).getTime() : NaN;
      if (!isNaN(da) && !isNaN(db)) {
        return da - db; // Urutkan per bulan / tanggal (Januari -> Desember)
      }
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    return {
      year,
      events: evList,
    };
  });
}

export default function TimelineSection() {
  const [timelineData, setTimelineData] = useState<TimelineData>(buildDefaultTimelineData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ image: "", date: "", title: "", desc: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = (image: string, date: string, title: string, desc: string) => {
    setModalData({ image, date, title, desc });
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const res = await fetch("/api/timeline", { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const json = await res.json();
          if (json?.status && json.data?.events?.length > 0) {
            const yearsSet = new Set<string>();
            json.data.events.forEach((ev: TimelineEvent) => {
              yearsSet.add(String(ev.year || "2026"));
            });
            const sortedYears = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
            setTimelineData({ years: sortedYears, events: json.data.events });
          }
        }
      } catch {
        // Tetap menggunakan data bawaan awal (langsung tampil 0ms tanpa loading)
      }
    };

    loadTimeline();
  }, []);

  if (!timelineData || timelineData.events.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className="badge"><i className="bx bx-map-pin" /> Milestone</div>
            <h2 className={`sectionTitle ${styles.title}`}>
              Milestone <span className="textGold">Perjalanan Erine</span>
            </h2>
            <p className={styles.subtitle}>
              Menyusuri setiap jejak langkah, panggung, dan momen berharga Erine bersama JKT48 dan Cavallery.
            </p>
          </div>
          <div style={{ color: "var(--gold)", padding: "3rem", textAlign: "center" }}>
            <i className="bx bx-calendar-x" style={{ fontSize: "2.5rem", marginBottom: "8px" }} />
            <div>Belum ada data milestone perjalanan.</div>
          </div>
        </div>
      </section>
    );
  }

  const yearGroups = groupByYear(timelineData.events);
  let globalItemIndex = 0;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="badge"><i className="bx bx-map-pin" /> Milestone</div>
          <h2 className={`sectionTitle ${styles.title}`}>
            Milestone <span className="textGold">Perjalanan Erine</span>
          </h2>
          <p className={styles.subtitle}>
            Menyusuri setiap jejak langkah, panggung, dan momen berharga Erine bersama JKT48 dan Cavallery.
          </p>
        </div>

        {yearGroups.map((group) => (
          <div key={group.year} className={styles.yearSection}>
            <div className={styles.yearHeader}>
              <span className={styles.yearBadge}>{group.year}</span>
              <div className={styles.yearLine} />
            </div>

            <div className={styles.timeline}>
              {group.events.map((event) => {
                const rotation = ROTATIONS[globalItemIndex % ROTATIONS.length];
                globalItemIndex++;

                const captionText = event.handwriting_caption || event.date_label || event.title;

                return (
                  <div key={event.id} className={styles.item}>
                    <div className={styles.dot} />
                    <div className={`glassCard ${styles.content}`}>
                      <div className={styles.cardInner}>
                        {/* Polaroid Photo Frame */}
                        <div className={styles.polaroidWrap}>
                          <div
                            className={styles.polaroidFrame}
                            style={{ transform: `rotate(${rotation}deg)` }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (event.image_url) {
                                openModal(event.image_url, event.date_label, event.title, event.description);
                              }
                            }}
                            title="Klik untuk memperbesar foto Polaroid"
                            role="button"
                            tabIndex={0}
                          >
                            <div className={styles.polaroidTape} />
                            <div className={styles.polaroidPhoto}>
                              {event.image_url ? (
                                <img src={event.image_url} alt={event.title} loading="lazy" />
                              ) : (
                                <div className={styles.noImg}>
                                  <i className="bx bx-image" />
                                </div>
                              )}
                            </div>
                            <div className={styles.polaroidCaption}>
                              {captionText}
                            </div>
                          </div>
                        </div>

                        {/* Text Narrative Side */}
                        <div className={styles.textSide}>
                          <div className={styles.dateBadge}>
                            <i className="bx bx-calendar" /> {event.date_label}
                          </div>
                          <h3 className={styles.title}>{event.title}</h3>
                          <p className={styles.desc}>{event.description}</p>
                          {event.image_url && (
                            <button
                              type="button"
                              className={styles.expandHint}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openModal(event.image_url!, event.date_label, event.title, event.description);
                              }}
                              title="Buka Polaroid Erine"
                              style={{ background: "none", border: "none", padding: 0, font: "inherit", textAlign: "left" }}
                            >
                              <i className="bx bx-zoom-in" /> Lihat Foto Polaroid
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal: di-portal langsung ke document.body agar position:fixed selalu berada di tengah layar tanpa harus scroll ke atas */}
      {mounted && isModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Tutup">
              &times;
            </button>
            <div className={styles.modalImgWrapper}>
              <img src={modalData.image} alt={modalData.title} />
            </div>
            <div className={styles.modalDetails}>
              <div className={styles.modalDate}>
                <i className="bx bx-calendar" /> {modalData.date}
              </div>
              <h3 className={styles.modalTitle}>{modalData.title}</h3>
              <p className={styles.modalDesc}>{modalData.desc}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
