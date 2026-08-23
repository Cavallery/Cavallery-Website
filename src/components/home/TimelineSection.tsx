/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import styles from "./TimelineSection.module.css";

interface TimelineEvent {
  id: string;
  year: string;
  date_label: string;
  event_date?: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order?: number;
}

interface TimelineData {
  years: string[];
  events: TimelineEvent[];
}

function groupByYear(events: TimelineEvent[]) {
  const map = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const yr = String(ev.year || "2026");
    // Fix known typo if date_label says 2025 under year 2024
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

  // Sort years descending (2026, 2025, 2024, 2023)
  const sortedYears = Array.from(map.keys()).sort((a, b) => Number(b) - Number(a));

  return sortedYears.map((year) => {
    const evList = map.get(year) || [];
    // Sort events within each year (latest first or by sort_order)
    evList.sort((a, b) => {
      if (a.event_date && b.event_date) {
        return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
      }
      return (b.sort_order || 0) - (a.sort_order || 0);
    });
    return {
      year,
      events: evList,
    };
  });
}

export default function TimelineSection() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ image: "", date: "", title: "", desc: "" });

  const openModal = (image: string, date: string, title: string, desc: string) => {
    setModalData({ image, date, title, desc });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        let loadedData: TimelineData | null = null;

        try {
          const res = await fetch("/api/timeline");
          if (res.ok) {
            const json = await res.json();
            if (json?.status && json.data?.events?.length > 0) {
              loadedData = json.data;
            }
          }
        } catch {}

        if (!loadedData) {
          try {
            const extRes = await fetch("https://v5.jkt48connect.com/api/cavallery/timeline?apikey=JKTCONNECT");
            if (extRes.ok) {
              const extJson = await extRes.json();
              if (extJson?.status && extJson.data?.events?.length > 0) {
                loadedData = extJson.data;
              }
            }
          } catch (e) {
            console.error("External timeline fetch failed:", e);
          }
        }

        if (loadedData) {
          setTimelineData(loadedData);
        }
      } catch (err) {
        console.error("Timeline loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className="badge"><i className="bx bx-history" /> Journey</div>
            <h2 className="sectionTitle">Timeline <span className="textGold">Erine</span></h2>
          </div>
          <div style={{ color: "var(--gold)", padding: "2rem", textAlign: "center" }}>
            <i className="bx bx-loader-alt bx-spin" /> Memuat timeline...
          </div>
        </div>
      </section>
    );
  }

  if (!timelineData || timelineData.events.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className="badge"><i className="bx bx-history" /> Journey</div>
            <h2 className="sectionTitle">Timeline <span className="textGold">Erine</span></h2>
          </div>
          <div style={{ color: "var(--gold)", padding: "2rem", textAlign: "center" }}>
            <i className="bx bx-calendar-x" /> Belum ada data timeline.
          </div>
        </div>
      </section>
    );
  }

  const yearGroups = groupByYear(timelineData.events);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="badge"><i className="bx bx-history" /> Journey</div>
          <h2 className="sectionTitle">Timeline <span className="textGold">Erine</span></h2>
        </div>

        {yearGroups.map((group) => (
          <div key={group.year} className={styles.yearSection}>
            <div className={styles.yearHeader}>
              <span className={styles.yearBadge}>{group.year}</span>
              <div className={styles.yearLine} />
            </div>

            <div className={styles.timeline}>
              {group.events.map((event) => (
                <div key={event.id} className={styles.item}>
                  <div className={styles.dot} />
                  <div className={styles.content}>
                    <div className={styles.cardInner}>
                      <div
                        className={styles.imgPlaceholder}
                        style={{ cursor: event.image_url ? "pointer" : "default" }}
                        onClick={() => event.image_url && openModal(event.image_url, event.date_label, event.title, event.description)}
                      >
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} />
                        ) : (
                          <div className={styles.noImg}>
                            <i className="bx bx-image" />
                          </div>
                        )}
                      </div>
                      <div className={styles.textSide}>
                        <div className={styles.date}>{event.date_label}</div>
                        <h3 className={styles.title}>{event.title}</h3>
                        <p className={styles.desc}>{event.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          className={`${styles.modalOverlay} ${styles.active}`}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
              &times;
            </button>
            <div className={styles.modalImgWrapper}>
              <img src={modalData.image} alt={modalData.title} />
            </div>
            <div className={styles.modalDetails}>
              <span className={styles.modalDate}>{modalData.date}</span>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "10px", color: "var(--primary)" }}>{modalData.title}</h3>
              <p className={styles.modalDesc}>{modalData.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
