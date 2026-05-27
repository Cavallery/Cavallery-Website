"use client";
import { useState, useEffect } from "react";
import styles from "./TimelineSection.module.css";

interface TimelineEvent {
  id: string;
  year: string;
  date_label: string;
  title: string;
  description: string;
  image_url: string | null;
}

interface TimelineData {
  years: string[];
  events: TimelineEvent[];
}

function groupByYear(events: TimelineEvent[]) {
  const groups: { year: string; events: TimelineEvent[] }[] = [];
  let current: { year: string; events: TimelineEvent[] } | null = null;
  for (const ev of events) {
    if (!current || current.year !== ev.year) {
      current = { year: ev.year, events: [ev] };
      groups.push(current);
    } else {
      current.events.push(ev);
    }
  }
  return groups;
}

export default function TimelineSection() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://v5.jkt48connect.com/api/cavallery/timeline?apikey=JKTCONNECT")
      .then((r) => r.json())
      .then((json) => {
        if (json?.status) setTimelineData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
                      <div className={styles.imgPlaceholder}>
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
    </section>
  );
}
