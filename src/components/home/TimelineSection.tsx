/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./TimelineSection.module.css";
import initialMilestones from "@/data/milestone.json";
import SectionHead from "@/components/chess/SectionHead";
import KnightSvg from "@/components/chess/KnightSvg";
import { useKnightPath } from "@/hooks/useKnightPath";
import { useReveal } from "@/hooks/useReveal";

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
/** Team Passion era — the path "ignites" from this year onward. */
const FIRE_FROM_YEAR = 2025;
const PASSION_RE = /passion|promosi|promoted|dipromosikan|200%/i;
const EMBER_POOL = 18;

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

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

  useReveal(sectionRef);
  useKnightPath({
    container: boardRef,
    fireFromYear: FIRE_FROM_YEAR,
    dependencies: [timelineData.events],
  });

  const head = (
    <SectionHead
      square="c7"
      eyebrow="Milestone · Knight's Path"
      title="Milestone"
      accent="Perjalanan Erine"
      layout="split"
      subtitle="Menyusuri setiap jejak langkah, panggung, dan momen berharga Erine bersama JKT48 dan Cavallery."
    />
  );

  if (!timelineData || timelineData.events.length === 0) {
    return (
      <section className={styles.section} ref={sectionRef} data-motion>
        <div className={styles.container}>
          {head}
          <div className={styles.empty}>
            <KnightSvg size={40} />
            <div>Belum ada data milestone perjalanan.</div>
          </div>
        </div>
      </section>
    );
  }

  const yearGroups = groupByYear(timelineData.events);
  const totalEvents = yearGroups.reduce((n, g) => n + g.events.length, 0);
  let globalItemIndex = 0;

  return (
    <section className={styles.section} ref={sectionRef} data-motion id="milestone">
      <div className={styles.container}>
        {head}

        <div className={styles.board} ref={boardRef} data-kp-era="cold">
          {/* Sticky year "ranks" */}
          <aside className={styles.rail} aria-hidden="true">
            <div className={styles.railSticky}>
              <span className={styles.railLabel}>Rank</span>
              <div className={styles.railYears}>
                {yearGroups.map((g, i) => (
                  <span
                    key={g.year}
                    className={`${styles.railYear} ${Number(g.year) >= FIRE_FROM_YEAR ? styles.railFire : ""}`}
                    data-kp-year={g.year}
                  >
                    <span className={styles.railRank}>R{i + 1}</span>
                    <span className={styles.railNum}>{g.year}</span>
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* Path + knight overlay (drawn from live DOM positions) */}
          <svg className={styles.svg} data-kp-svg aria-hidden="true">
            <defs>
              <linearGradient id="kp-trail" data-kp-grad gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
                <stop data-kp-stop="0" offset="0" stopColor="#ff8f4d" />
                <stop data-kp-stop="1" offset="0.5" stopColor="#ff8f4d" />
                <stop data-kp-stop="2" offset="0.55" stopColor="#ff6b1a" />
                <stop data-kp-stop="3" offset="0.8" stopColor="#ff6b1a" />
                <stop data-kp-stop="4" offset="1" stopColor="#ff8f4d" />
              </linearGradient>
              {/* flowing embers: invisible in the cold era, heat in the Passion era */}
              <linearGradient id="kp-flow" data-kp-flowgrad gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
                <stop offset="0" stopColor="#ffc7a1" stopOpacity="0" />
                <stop offset="0.5" stopColor="#ffc7a1" stopOpacity="0" />
                <stop offset="0.52" stopColor="#ffc7a1" stopOpacity="1" />
                <stop offset="1" stopColor="#ff8f4d" stopOpacity="1" />
              </linearGradient>
              <mask id="kp-travelled" data-kp-mask maskUnits="userSpaceOnUse">
                <path data-kp-maskpath d="" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
              </mask>
            </defs>
            <path className={styles.pathBase} data-kp-base d="" />
            <path className={styles.pathGlow} d="" data-kp-glow stroke="url(#kp-trail)" />
            <path className={styles.pathLit} data-kp-lit d="" stroke="url(#kp-trail)" />
            <path className={styles.pathFlow} data-kp-flow d="" stroke="url(#kp-flow)" mask="url(#kp-travelled)" />
          </svg>

          <div className={styles.knight} data-kp-knight aria-hidden="true">
            <KnightSvg size="100%" />
          </div>
          {Array.from({ length: EMBER_POOL }).map((_, i) => (
            <span key={i} className={styles.ember} data-kp-ember aria-hidden="true" />
          ))}

          <ol className={styles.list}>
            {yearGroups.map((group, gIdx) => (
              <li key={group.year} className={styles.yearGroup}>
                <div
                  className={`${styles.yearMark} ${Number(group.year) >= FIRE_FROM_YEAR ? styles.yearFire : ""}`}
                >
                  <span className={styles.yearRank}>Rank {gIdx + 1}</span>
                  <span className={styles.yearNum}>{group.year}</span>
                  <span className={styles.yearLine} aria-hidden="true" />
                </div>

                <ol className={styles.items}>
                  {group.events.map((event) => {
                    const idx = globalItemIndex;
                    const rotation = ROTATIONS[idx % ROTATIONS.length];
                    globalItemIndex++;
                    const side = idx % 2 === 0 ? "left" : "right";
                    const isFireEra = Number(group.year) >= FIRE_FROM_YEAR;
                    const isPassion = PASSION_RE.test(`${event.title} ${event.description}`);
                    const isLast = idx === totalEvents - 1;
                    const captionText = event.handwriting_caption || event.date_label || event.title;

                    return (
                      <li
                        key={event.id}
                        className={styles.item}
                        data-kp-item
                        data-side={side}
                        data-era={isFireEra ? "fire" : "cold"}
                        data-passion={isPassion ? "true" : "false"}
                        data-state="idle"
                      >
                        <div className={styles.lane} data-kp-lane>
                          <span className={styles.node} data-kp-node data-year={group.year} data-state="idle">
                            <span className={styles.tile} data-kp-tile />
                            <span className={styles.nodeGlow} />
                            <span className={styles.core} data-kp-core />
                          </span>
                        </div>

                        <article className={styles.card} data-kp-card>
                          <div className={styles.polaroidWrap} data-kp-photo>
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
                              onKeyDown={(e) => {
                                if ((e.key === "Enter" || e.key === " ") && event.image_url) {
                                  e.preventDefault();
                                  openModal(event.image_url, event.date_label, event.title, event.description);
                                }
                              }}
                              title="Klik untuk memperbesar foto Polaroid"
                              role="button"
                              tabIndex={0}
                            >
                              <div className={styles.polaroidPhoto}>
                                {event.image_url ? (
                                  <img src={event.image_url} alt={event.title} loading="lazy" decoding="async" />
                                ) : (
                                  <div className={styles.noImg}>
                                    <KnightSvg size={36} />
                                  </div>
                                )}
                              </div>
                              <div className={styles.polaroidCaption}>{captionText}</div>
                            </div>
                          </div>

                          <div className={styles.textSide} data-kp-text>
                            <div className={styles.metaRow}>
                              <span className={styles.moveNo}>{String(idx + 1).padStart(2, "0")}.</span>
                              <span className={styles.dateBadge}>{event.date_label}</span>
                              {isPassion && <span className={`${styles.passionTag} cv-fire-text`}>Team Passion</span>}
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
                              >
                                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                                  <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" />
                                  <path d="M5 10l2.5-3 2 2 1.5-2 1 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                                Lihat Foto Polaroid
                              </button>
                            )}
                            {isLast && (
                              <span className={styles.checkmate}>
                                <KnightSvg size={16} />
                                <span className="cv-fire-text">Checkmate!</span>
                                <span className={styles.checkmateSub}>to be continued</span>
                              </span>
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Lightbox Modal: di-portal langsung ke document.body agar position:fixed selalu berada di tengah layar */}
      {mounted && isModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={modalData.title}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Tutup">
              &times;
            </button>
            <div className={styles.modalImgWrapper}>
              <img src={modalData.image} alt={modalData.title} />
            </div>
            <div className={styles.modalDetails}>
              <div className={styles.modalDate}>{modalData.date}</div>
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
