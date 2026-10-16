"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./page.module.css";

const ERINE_KEYS = ["erine", "catherina", "vallencia"];

function isErine(name: string) {
  const n = name.toLowerCase();
  return ERINE_KEYS.some((k) => n.includes(k));
}

function fmtDate(d: string) {
  const date = new Date(d);
  return {
    dateStr: date.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    timeStr: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  };
}

interface ShowMember { name: string; }
interface Show {
  id?: string; title?: string; date?: string; showDate?: string;
  startTime?: string; members?: ShowMember[]; member?: ShowMember[];
  lineup?: ShowMember[]; poster?: string; banner?: string;
  url?: string; idnTheater?: { slug?: string } | string;
}

export default function ShowTheaterPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterErine, setFilterErine] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "next_week" | "month" | "all">("week");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/theater", { cache: "no-store" });
      const json = await res.json();
      setShows(Array.isArray(json.data) ? json.data : []);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 180000); return () => clearInterval(id); }, [load]);

  const displayed = useMemo(() => {
    let list = shows;

    // Filter Tahun jika tab all atau month
    if (selectedPeriod === "all" || selectedPeriod === "month") {
      if (selectedYear !== "all") {
        const yNum = parseInt(selectedYear, 10);
        list = list.filter((s) => {
          const dateStr = s.date ?? s.showDate ?? "";
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return d.getFullYear() === yNum;
        });
      }
    }

    // Filter Periode (Minggu Ini, Minggu Depan, Bulan Ini)
    if (selectedPeriod === "week" || selectedPeriod === "next_week") {
      const now = new Date();
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfCurrentWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
      startOfCurrentWeek.setHours(0, 0, 0, 0);

      const targetStart = new Date(startOfCurrentWeek);
      if (selectedPeriod === "next_week") {
        targetStart.setDate(targetStart.getDate() + 7);
      }
      const targetEnd = new Date(targetStart);
      targetEnd.setDate(targetEnd.getDate() + 7);

      const inWeek = list.filter((s) => {
        const dateStr = s.date ?? s.showDate ?? "";
        if (!dateStr) return false;
        const d = new Date(dateStr).getTime();
        return d >= targetStart.getTime() && d < targetEnd.getTime();
      });

      if (inWeek.length > 0) {
        list = inWeek;
      } else if (selectedPeriod === "week") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const upcoming = list
          .filter((s) => {
            const dateStr = s.date ?? s.showDate ?? "";
            if (!dateStr) return false;
            return new Date(dateStr).getTime() >= today;
          })
          .sort((a, b) => new Date(a.date ?? a.showDate ?? "").getTime() - new Date(b.date ?? b.showDate ?? "").getTime());

        if (upcoming.length > 0) {
          const firstShowTime = new Date(upcoming[0].date ?? upcoming[0].showDate ?? "").getTime();
          list = upcoming.filter((s) => {
            const t = new Date(s.date ?? s.showDate ?? "").getTime();
            return t >= firstShowTime && t <= firstShowTime + 7 * 86400000;
          });
        } else {
          list = list.slice(0, 7);
        }
      } else {
        list = [];
      }
    } else if (selectedPeriod === "month") {
      const now = new Date();
      list = list.filter((s) => {
        const dateStr = s.date ?? s.showDate ?? "";
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    // Filter Erine
    if (filterErine) {
      list = list.filter((s) => {
        const members: ShowMember[] = s.members ?? s.member ?? s.lineup ?? [];
        return members.some((m) => isErine(m.name ?? ""));
      });
    }

    // Sort: Newest first
    return list.sort((a, b) => {
      const da = new Date(a.date ?? a.showDate ?? "").getTime();
      const db = new Date(b.date ?? b.showDate ?? "").getTime();
      return db - da;
    });
  }, [shows, selectedYear, selectedPeriod, filterErine]);

  const erineCount = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const upcoming = shows.filter((s) => {
      const dateStr = s.date ?? s.showDate ?? "";
      if (!dateStr) return true;
      const d = new Date(dateStr).getTime();
      return !isNaN(d) && d >= today;
    });

    const target = upcoming.length > 0 ? upcoming : shows.filter((s) => {
      const dateStr = s.date ?? s.showDate ?? "";
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    return target.filter((s) => {
      const members: ShowMember[] = s.members ?? s.member ?? s.lineup ?? [];
      return members.some((m) => isErine(m.name ?? ""));
    }).length;
  }, [shows]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-calendar" /> JKT48 Theater</div>
          <h1 className={styles.heroTitle}>Show <span className="textGold">Theater</span></h1>
          <p className={styles.heroSub}>Jadwal upcoming show theater JKT48 — jadwal Erine di-highlight khusus!</p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlLeft} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Tab Periode */}
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", padding: "3px", borderRadius: "50px", border: "1px solid var(--border)", gap: "4px" }}>
              <button
                type="button"
                className={`${styles.filterBtn} ${selectedPeriod === "week" ? styles.filterActive : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                onClick={() => setSelectedPeriod("week")}
              >
                Minggu Ini
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${selectedPeriod === "next_week" ? styles.filterActive : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                onClick={() => setSelectedPeriod("next_week")}
              >
                Minggu Depan
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${selectedPeriod === "month" ? styles.filterActive : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                onClick={() => setSelectedPeriod("month")}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${selectedPeriod === "all" ? styles.filterActive : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                onClick={() => setSelectedPeriod("all")}
              >
                Semua
              </button>
            </div>

            {/* Pilihan Tahun (saat Semua dipilih) */}
            {selectedPeriod === "all" && (
              <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", padding: "3px", borderRadius: "50px", border: "1px solid var(--border)", gap: "4px" }}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${selectedYear === "2026" ? styles.filterActive : ""}`}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  onClick={() => setSelectedYear("2026")}
                >
                  2026
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${selectedYear === "2025" ? styles.filterActive : ""}`}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  onClick={() => setSelectedYear("2025")}
                >
                  2025
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${selectedYear === "2024" ? styles.filterActive : ""}`}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  onClick={() => setSelectedYear("2024")}
                >
                  2024
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${selectedYear === "all" ? styles.filterActive : ""}`}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  onClick={() => setSelectedYear("all")}
                >
                  Semua
                </button>
              </div>
            )}
            <span className={styles.count} style={{ marginLeft: "6px" }}>
              <i className="bx bx-list-ul" /> {displayed.length} show
            </span>
          </div>
          <div className={styles.controlRight}>
            <button
              className={`${styles.filterBtn} ${filterErine ? styles.filterActive : ""}`}
              onClick={() => setFilterErine((v) => !v)}
            >
              <i className={`bx ${filterErine ? "bxs-star" : "bx-star"}`} />
              {filterErine ? "Khusus Erine" : "Semua Member"}
            </button>
            <button className={styles.refreshBtn} onClick={load}>
              <i className="bx bx-refresh" /> Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.skeletons}>
            {[0,1,2].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : error ? (
          <div className={styles.errorBox}><i className="bx bx-error-circle" /> {error}</div>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-calendar-x" />
            <p>{filterErine ? "Tidak ada jadwal dengan Erine saat ini." : "Tidak ada jadwal yang tersedia."}</p>
          </div>
        ) : (
          <div className={styles.showList}>
            {displayed.map((show, idx) => {
              const date = show.date ?? show.showDate ?? "";
              const { dateStr, timeStr: fallback } = fmtDate(date);
              const timeStr = show.startTime ? show.startTime.slice(0, 5) : fallback;
              const members: ShowMember[] = show.members ?? show.member ?? show.lineup ?? [];
              const hasErine = members.some((m) => isErine(m.name ?? ""));
              const idn = show.idnTheater;

              return (
                <div key={show.id ?? idx} className={`${styles.showCard} ${hasErine ? styles.showErine : ""}`}>
                  {hasErine && <div className={styles.erineBanner}><i className="bx bxs-star" /> Erine ada di show ini!</div>}

                  <div className={styles.showHead}>
                    <div className={styles.showDate}><i className="bx bx-calendar" /> {dateStr}</div>
                    <div className={styles.showTime}><i className="bx bx-time-five" /> {timeStr} WIB</div>
                  </div>

                  <div className={styles.showBody}>
                    <div className={styles.showMain}>
                      <h2 className={styles.showTitle}>{(show.title ?? "").toUpperCase()}</h2>

                      <div className={styles.memberList}>
                        {members.map((m, mi) => (
                          <div key={mi} className={`${styles.memberTag} ${isErine(m.name ?? "") ? styles.memberErine : ""}`}>
                            {isErine(m.name ?? "") && <i className="bx bxs-star" />}
                            {m.name}
                          </div>
                        ))}
                      </div>

                      <div className={styles.showActions}>
                        {show.url && (
                          <a href={show.url} target="_blank" rel="noreferrer" className="btnPrimary" style={{ fontSize: ".85rem", padding: "11px 24px" }}>
                            <i className="bx bx-receipt" /> Beli Tiket
                          </a>
                        )}
                        {idn && (
                          <a
                            href={typeof idn === "string" ? `https://www.idn.app/jkt48-official/live/${idn}` : `https://www.idn.app/jkt48-official/live/${idn.slug}`}
                            target="_blank" rel="noreferrer"
                            className="btnOutline" style={{ fontSize: ".85rem", padding: "10px 22px" }}
                          >
                            <i className="bx bx-play-circle" /> Nonton IDN
                          </a>
                        )}
                      </div>
                    </div>

                    <div className={styles.showPoster}>
                      {(show.poster ?? show.banner) ? (
                        <img src={show.poster ?? show.banner} alt={show.title ?? ""} loading="lazy" />
                      ) : (
                        <div className={styles.noPoster}><i className="bx bx-image" /></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
