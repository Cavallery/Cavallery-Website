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

  const isUpcoming = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return shows.some((s) => {
      const dateStr = s.date ?? s.showDate ?? "";
      if (!dateStr) return false;
      const d = new Date(dateStr).getTime();
      return !isNaN(d) && d >= today;
    });
  }, [shows]);

  const displayed = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // 1. Shows from today onwards
    const upcoming = shows.filter((s) => {
      const dateStr = s.date ?? s.showDate ?? "";
      if (!dateStr) return true;
      const d = new Date(dateStr).getTime();
      return !isNaN(d) && d >= today;
    });

    // 2. Jika ada upcoming, tampilkan upcoming; jika belum diumumkan, tampilkan show terbaru yang ada
    const targetList = upcoming.length > 0 ? upcoming : shows;

    const list = filterErine
      ? targetList.filter((s) => {
          const members: ShowMember[] = s.members ?? s.member ?? s.lineup ?? [];
          return members.some((m) => isErine(m.name ?? ""));
        })
      : targetList;

    // Urutkan: jika upcoming -> tanggal terdekat dulu (asc); jika riwayat -> tanggal terbaru dulu (desc)
    return list.sort((a, b) => {
      const da = new Date(a.date ?? a.showDate ?? "").getTime();
      const db = new Date(b.date ?? b.showDate ?? "").getTime();
      return upcoming.length > 0 ? da - db : db - da;
    });
  }, [shows, filterErine]);

  return (
    <section className={styles.section} id="theater">
      <div className={styles.sectionHeader}>
        <div>
          <div className="badge"><i className="bx bx-calendar" /> Theater Schedule</div>
          {!isUpcoming && displayed.length > 0 && (
            <p style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "4px" }}>
              Jadwal show resmi terbaru &bull; Nantikan pengumuman show Erine berikutnya
            </p>
          )}
        </div>
        <div className={styles.controls}>
          <button
            className={`${styles.filterBtn} ${filterErine ? styles.filterActive : ""}`}
            onClick={() => setFilterErine((v) => !v)}
          >
            <i className={`bx ${filterErine ? "bxs-star" : "bx-star"}`} style={{ color: "orange" }} />
            {filterErine ? "Semua Show" : "Khusus Jadwal Erine"}
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
          <p>Belum ada jadwal show mendatang saat ini.</p>
        </div>
      ) : (
        <div className={styles.showList}>
          {displayed.slice(0, 15).map((show, idx) => {
            const date = show.date ?? show.showDate ?? "";
            const { dateStr, timeStr: fallback } = fmtDate(date);
            const timeStr = show.startTime ? show.startTime.slice(0, 5) : fallback;
            const members: ShowMember[] = show.members ?? show.member ?? show.lineup ?? [];
            const hasErine = members.some((m) => isErine(m.name ?? ""));
            
            return (
              <div key={show.id ?? idx} className={`${styles.showCard} ${hasErine ? styles.showErine : ""}`}>
                <div className={styles.showDate}>{dateStr} · {timeStr} WIB</div>
                <h3 className={styles.showTitle}>
                  {show.title}{" "}
                  {hasErine && (
                    <span style={{ fontSize: "0.8rem", color: "orange", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <i className="bx bxs-star" /> Erine Show
                    </span>
                  )}
                </h3>
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
  url?: string; url_key?: string; slug?: string;
  is_erine?: boolean;
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

  if (loading) return <div className={styles.loading}>Memeriksa siaran live Erine...</div>;

  // Jika Erine sedang live sekarang
  if (lives.length > 0) {
    return (
      <section className={styles.section} id="live">
        <div className={styles.sectionHeader}>
          <div className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}>
            <i className="bx bx-broadcast bx-flashing" /> Sedang Live Sekarang!
          </div>
        </div>
        <div className={styles.liveGrid}>
          {lives.map((l, i) => {
            const name = l.name ?? l.member_name ?? "Catherina Vallencia (Erine)";
            const img = l.image ?? l.img ?? l.avatar ?? "https://cava.jkt48connect.com/IMG-20260525-WA0211.jpg";
            const highlight = l.is_erine || isErine(name);
            const url =
              l.url && l.url !== "#" && l.url.includes("/live/")
                ? l.url
                : highlight
                  ? (l.slug
                      ? `https://www.idn.app/${l.url_key || "jkt48_erine"}/live/${l.slug}`
                      : l.url || "https://www.idn.app/jkt48_erine")
                  : (l.slug && l.url_key
                      ? `https://www.idn.app/${l.url_key}/live/${l.slug}`
                      : l.url || (l.url_key ? `https://www.idn.app/${l.url_key}` : "#"));

            return (
              <div key={l.id ?? i} className={`${styles.liveCard} ${styles.liveErine}`}>
                <div className={styles.liveImg}><img src={img} alt={name} /></div>
                <div className={styles.liveInfo}>
                  <h4>{name}</h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--gold)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <i className="bx bxs-star" /> {l.platform || "IDN Live"}
                  </span>
                  <a href={url} target="_blank" rel="noreferrer" className="btnPrimary" style={{ marginTop: "8px" }}>
                    Tonton Live Erine Sekarang!
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // Jika sedang offline, tampilkan kanal live resmi Erine agar selalu muncul di halaman schedule
  return (
    <section className={styles.section} id="live">
      <div className={styles.sectionHeader}>
        <div className="badge"><i className="bx bx-broadcast" /> Kanal Live Erine</div>
        <span style={{ fontSize: "0.8rem", color: "#888", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6b7280" }} /> Sedang Offline
        </span>
      </div>
      <div className={styles.liveGrid}>
        {/* IDN Live Channel Card */}
        <div className={`${styles.liveCard} ${styles.liveErine}`}>
          <div className={styles.liveImg}>
            <img src="https://cava.jkt48connect.com/IMG-20260525-WA0211.jpg" alt="Erine IDN Live" />
          </div>
          <div className={styles.liveInfo} style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h4 style={{ margin: 0 }}>Catherina Vallencia</h4>
              <span className="badge" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>IDN Live</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#888", margin: "4px 0 10px" }}>
              @jkt48_erine &bull; Live interaktif & mabar rutin
            </p>
            <a
              href="https://www.idn.app/jkt48_erine"
              target="_blank"
              rel="noreferrer"
              className="btnOutline"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", padding: "6px 14px" }}
            >
              <i className="bx bx-play-circle" /> Buka IDN Live Erine
            </a>
          </div>
        </div>

        {/* Showroom Channel Card */}
        <div className={styles.liveCard}>
          <div className={styles.liveImg}>
            <img src="/images/erine1.jpg" alt="Erine Showroom" />
          </div>
          <div className={styles.liveInfo} style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h4 style={{ margin: 0 }}>JKT48_Erine</h4>
              <span className="badge" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>Showroom</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#888", margin: "4px 0 10px" }}>
              Ruang siaran resmi Erine di SHOWROOM
            </p>
            <a
              href="https://www.showroom-live.com/r/JKT48_Erine"
              target="_blank"
              rel="noreferrer"
              className="btnOutline"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", padding: "6px 14px" }}
            >
              <i className="bx bx-video" /> Buka Showroom Erine
            </a>
          </div>
        </div>
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
