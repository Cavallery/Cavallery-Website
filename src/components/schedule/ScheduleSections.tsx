"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./ScheduleSections.module.css";

const ERINE_KEYS = ["erine", "catherina", "vallencia"];
function isErine(name: string) {
  const n = (name ?? "").toLowerCase();
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

export function TheaterSection() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return shows.filter((s) => {
      const members: ShowMember[] = s.members ?? s.member ?? s.lineup ?? [];
      return members.some((m) => isErine(m.name ?? ""));
    });
  }, [shows]);

  return (
    <section className={styles.section} id="theater">
      <div className={styles.sectionHeader}>
        <div className="badge"><i className="bx bx-calendar" /> Theater Schedule</div>
        <div className={styles.controls}>
          <button className={`${styles.filterBtn} ${styles.filterActive}`}>
            <i className="bx bxs-hot" style={{color: "orange"}} />
            Erine's Shows
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {[0,1,2].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className={styles.empty}>
          <i className="bx bx-calendar-x" />
          <p>No shows available.</p>
        </div>
      ) : (
        <div className={styles.showList}>
          {displayed.map((show, idx) => {
            const date = show.date ?? show.showDate ?? "";
            const { dateStr, timeStr: fallback } = fmtDate(date);
            const timeStr = show.startTime ? show.startTime.slice(0, 5) : fallback;
            const members: ShowMember[] = show.members ?? show.member ?? show.lineup ?? [];
            const hasErine = members.some((m) => isErine(m.name ?? ""));
            
            return (
              <div key={show.id ?? idx} className={`${styles.showCard} ${hasErine ? styles.showErine : ""}`}>
                <div className={styles.showDate}>{dateStr} · {timeStr} WIB</div>
                <h3 className={styles.showTitle}>{show.title} {hasErine && <i className="bx bxs-hot" style={{color: "orange"}} title="Erine is performing!" />}</h3>
                <div className={styles.memberTags}>
                  {members.map((m, mi) => (
                    <span key={mi} className={`${styles.memberTag} ${isErine(m.name) ? styles.tagErine : ""}`}>
                      {m.name}
                    </span>
                  ))}
                </div>
                {show.url && (
                  <a href={show.url} target="_blank" rel="noreferrer" className="btnPrimary">Tickets</a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface LiveItem {
  id?: string; name?: string; member_name?: string;
  image?: string; img?: string; avatar?: string;
  platform?: string; type?: string;
  url?: string; idn_url?: string; showroom_url?: string;
  title?: string;
}

export function LiveSection() {
  const [lives, setLives] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const json = await res.json();
      setLives(Array.isArray(json.data) ? json.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 60000); return () => clearInterval(id); }, [load]);

  if (loading) return <div className={styles.loading}>Checking lives...</div>;
  if (lives.length === 0) return null;

  return (
    <section className={styles.section} id="live">
      <div className={styles.sectionHeader}>
        <div className="badge"><i className="bx bx-broadcast" /> Live Now</div>
      </div>
      <div className={styles.liveGrid}>
        {lives.map((l, i) => {
          const name = l.name ?? l.member_name ?? "Unknown";
          const img = l.image ?? l.img ?? l.avatar ?? "";
          const url = l.url ?? l.idn_url ?? l.showroom_url ?? "#";
          const highlight = isErine(name);

          return (
            <div key={l.id ?? i} className={`${styles.liveCard} ${highlight ? styles.liveErine : ""}`}>
              <div className={styles.liveImg}><img src={img || "/images/cava-logo.jpg"} alt={name} /></div>
              <div className={styles.liveInfo}>
                <h4>{name}</h4>
                <a href={url} target="_blank" rel="noreferrer" className="btnOutline">Watch</a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function VideoCallSection() {
  const [vcSchedule, setVcSchedule] = useState<any>(null);

  useEffect(() => {
    async function fetchVc() {
      try {
        const res = await fetch("/api/vcschedule");
        const json = await res.json();
        if (json.success && json.data) {
          setVcSchedule(json.data);
        }
      } catch (err) {
        console.error("Failed to load VC schedule:", err);
      }
    }
    fetchVc();
  }, []);

  if (!vcSchedule) return null;

  return (
    <section className={styles.section} id="videocall">
      <div className={styles.vcContainer}>
        <div className={styles.vcSkyline}></div>
        
        <div className={styles.vcNailed}></div>
        <h3 className={styles.vcTitle}>Jadwal Video Call Erine</h3>
        
        <div className={styles.vcContent}>
            {/* SCHEDULE */}
            <div className={styles.vcSchedule}>
                <div className={styles.vcDate}>{vcSchedule.date}</div>
                {vcSchedule.session1 && <div className={styles.vcSession}>{vcSchedule.session1}</div>}
                {vcSchedule.session2 && <div className={styles.vcSession}>{vcSchedule.session2}</div>}
                {vcSchedule.session3 && <div className={styles.vcSession}>{vcSchedule.session3}</div>}
                {vcSchedule.session4 && <div className={styles.vcSession}>{vcSchedule.session4}</div>}
                {!vcSchedule.session1 && !vcSchedule.session2 && !vcSchedule.session3 && !vcSchedule.session4 && (
                  <div className={styles.vcSession}>Belum ada jadwal sesi</div>
                )}
            </div>
            
            {/* POSTER */}
            {vcSchedule.imageUrl && (
              <div className={styles.vcPoster}>
                  <div className={styles.vcFrame}>
                      <img src={vcSchedule.imageUrl} alt="Poster VC" />
                  </div>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
