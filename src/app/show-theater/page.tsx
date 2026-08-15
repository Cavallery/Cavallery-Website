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
    if (!filterErine) return shows;
    return shows.filter((s) => {
      const members: ShowMember[] = s.members ?? s.member ?? s.lineup ?? [];
      return members.some((m) => isErine(m.name ?? ""));
    });
  }, [shows, filterErine]);

  const erineCount = useMemo(() =>
    shows.filter((s) => {
      const members: ShowMember[] = s.members ?? s.member ?? s.lineup ?? [];
      return members.some((m) => isErine(m.name ?? ""));
    }).length,
  [shows]);

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
          <div className={styles.controlLeft}>
            <span className={styles.count}>
              <i className="bx bx-list-ul" /> {displayed.length} show ditemukan
              {filterErine && erineCount > 0 && <span className={styles.erineCount}> · {erineCount} dengan Erine!</span>}
            </span>
          </div>
          <div className={styles.controlRight}>
            <button
              className={`${styles.filterBtn} ${filterErine ? styles.filterActive : ""}`}
              onClick={() => setFilterErine((v) => !v)}
            >
              <i className={`bx ${filterErine ? "bxs-star" : "bx-star"}`} />
              {filterErine ? "Semua Jadwal Erine" : "Filter: Jadwal Erine"}
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
