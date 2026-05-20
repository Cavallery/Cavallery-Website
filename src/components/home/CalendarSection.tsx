"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./CalendarSection.module.css";

interface ShowMember {
  name: string;
}

interface Show {
  id?: string;
  title?: string;
  date?: string;
  showDate?: string;
  startTime?: string;
  members?: ShowMember[];
  member?: ShowMember[];
  lineup?: ShowMember[];
  url?: string;
}

const ERINE_KEYS = ["erine", "catherina", "vallencia"];
function isErine(name: string) {
  const n = (name ?? "").toLowerCase();
  return ERINE_KEYS.some((k) => n.includes(k));
}

export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [apiShows, setApiShows] = useState<Show[]>([]);
  const [apiLives, setApiLives] = useState<Show[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Fetch actual JKT48 schedule data dynamically based on selected month/year
  useEffect(() => {
    async function fetchTheater() {
      try {
        const formattedMonth = String(month + 1).padStart(2, "0");
        const res = await fetch(`/api/theater?month=${formattedMonth}&year=${year}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setApiShows(json.data);
        } else {
          setApiShows([]);
        }
      } catch (err) {
        console.error("Failed to load theater schedule:", err);
      }
    }
    fetchTheater();
  }, [month, year]);

  // Fetch active live streams (Showroom / IDN)
  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/live");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Map live streams to Show format (they happen today)
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`;
          
          const lives: Show[] = json.data.map((stream: any, idx: number) => ({
            id: `live-${idx}`,
            title: `LIVE: ${stream.room_name || stream.name || "Showroom / IDN"}`,
            date: todayStr,
            startTime: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
            members: [{ name: stream.member_name || "Catherina Vallencia (Erine)" }],
            url: stream.url_key ? `https://www.showroom-live.com/r/${stream.url_key}` : stream.url || "https://jkt48.com"
          }));
          setApiLives(lives);
        }
      } catch (err) {
        console.error("Failed to load live data:", err);
      }
    }
    fetchLive();
  }, []);

  // Filter live API shows to include only those featuring Erine, and combine with active Lives
  const shows = useMemo(() => {
    const filteredShows = apiShows.filter((s) => {
      const members = s.members ?? s.member ?? s.lineup ?? [];
      return members.some((m) => isErine(m.name));
    });
    
    // Only add lives if we are viewing the current month/year
    const now = new Date();
    if (now.getFullYear() === year && now.getMonth() === month) {
      return [...filteredShows, ...apiLives];
    }
    return filteredShows;
  }, [apiShows, apiLives, year, month]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayIndex = useMemo(() => {
    const day = new Date(year, month, 1).getDay(); // Sunday: 0, Monday: 1...
    return day;
  }, [year, month]);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Find shows on a specific day
  const getShowsForDay = (day: number) => {
    return shows.filter((show) => {
      const showDateStr = show.date ?? show.showDate;
      if (!showDateStr) return false;
      const d = new Date(showDateStr);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  // Render Days Header
  const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const cells = [];
  // Empty slots before first day of month
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<div key={`empty-${i}`} className={`${styles.cell} ${styles.emptyCell}`} />);
  }

  // Days in month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayShows = getShowsForDay(day);
    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

    cells.push(
      <div
        key={day}
        className={`${styles.cell} ${isToday ? styles.today : ""}`}
        onClick={() => setSelectedDay(day)}
        style={{ cursor: "pointer" }}
      >
        <span className={styles.dateNum}>{day}</span>
        <div className={styles.eventInfoList}>
          {dayShows.slice(0, 2).map((show, idx) => {
            const hasErine = (show.members ?? show.member ?? show.lineup ?? []).some((m) => isErine(m.name));
            return (
              <div
                key={show.id ?? idx}
                className={`${styles.eventBadge} ${hasErine ? styles.eventErine : ""}`}
                title={show.title}
              >
                {hasErine ? <><i className="bx bxs-flame" style={{ fontSize: ".7rem" }} />{" "}</> : ""}{show.title}
              </div>
            );
          })}
          {dayShows.length > 2 && (
            <div className={styles.eventBadge} style={{ background: "var(--fg-dim)" }}>
              +{dayShows.length - 2} Lainnya
            </div>
          )}
        </div>
      </div>
    );
  }

  const selectedDayShows = selectedDay ? getShowsForDay(selectedDay) : [];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bx-calendar-event" /> Event Calendar
          </div>
          <h2 className={`sectionTitle textGold ${styles.title}`}>Kalender Kegiatan</h2>
          <p className={styles.subtitle}>
            Pantau jadwal konser, pertunjukan theater, live streaming, dan kegiatan Erine JKT48.
          </p>
        </div>

        <div className={`${styles.calendarCard} glassCard`}>
          <div className={styles.calendarHeader}>
            <span className={styles.monthTitle}>
              {monthNames[month]} {year}
            </span>
            <div className={styles.monthNav}>
              <button className={styles.navBtn} onClick={handlePrevMonth}>
                <i className="bx bx-chevron-left" /> Prev
              </button>
              <button className={styles.navBtn} onClick={handleNextMonth}>
                Next <i className="bx bx-chevron-right" />
              </button>
            </div>
          </div>

          <div className={styles.grid}>
            {daysOfWeek.map((day) => (
              <div key={day} className={styles.dayOfWeek}>
                {day.slice(0, 3)}
              </div>
            ))}
            {cells}
          </div>

          {selectedDay !== null && (
            <div className={styles.activeDayPanel}>
              <h3 className={styles.activeDayTitle}>
                Jadwal Tanggal {selectedDay} {monthNames[month]} {year}
              </h3>
              {selectedDayShows.length === 0 ? (
                <p style={{ color: "var(--fg-dim)" }}>Tidak ada kegiatan untuk hari ini.</p>
              ) : (
                selectedDayShows.map((show, idx) => {
                  const members = show.members ?? show.member ?? show.lineup ?? [];
                  return (
                    <div key={show.id ?? idx} className={styles.eventCard}>
                      <div className={styles.eventTitle}>{show.title}</div>
                      <div className={styles.eventMeta}>
                        <i className="bx bx-time" /> {show.startTime ?? "19:00"} WIB
                      </div>
                      {members.length > 0 && (
                        <div className={styles.membersList}>
                          {members.map((m, mi) => {
                            const match = isErine(m.name);
                            return (
                              <span
                                key={mi}
                                className={`${styles.memberTag} ${match ? styles.memberErine : ""}`}
                              >
                                {match ? <><i className="bx bxs-flame" style={{ fontSize: ".75rem" }} />{" "}</> : ""}{m.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {show.url && (
                        <a
                          href={show.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btnPrimary"
                          style={{ marginTop: 12, padding: "8px 20px", fontSize: "0.85rem" }}
                        >
                          Beli Tiket
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
