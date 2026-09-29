"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./ScheduleSections.module.css";
import {
  LiveNowList,
  LiveOfflineCard,
  mapApiToLiveCardProps,
} from "@/components/LiveNowCard";

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
  const [filterErine, setFilterErine] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/theater", { cache: "no-store" });
      const json = await res.json();
      setShows(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 180000);
    return () => clearInterval(id);
  }, [load]);

  const displayed = useMemo(() => {
    let list = shows;

    // 1. Filter Berdasarkan Tahun (2026, 2024, 2025, atau Semua)
    if (selectedYear !== "all") {
      const yNum = parseInt(selectedYear, 10);
      list = list.filter((s) => {
        const dateStr = s.date ?? s.showDate ?? "";
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getFullYear() === yNum;
      });
    }

    // 2. Filter Khusus Erine
    if (filterErine) {
      list = list.filter((s) => {
        const members: ShowMember[] = s.members ?? s.member ?? s.lineup ?? [];
        return members.some((m) => isErine(m.name ?? ""));
      });
    }

    // 3. Urutkan tanggal terbaru di atas
    return list.sort((a, b) => {
      const da = new Date(a.date ?? a.showDate ?? "").getTime();
      const db = new Date(b.date ?? b.showDate ?? "").getTime();
      return db - da;
    });
  }, [shows, selectedYear, filterErine]);

  return (
    <section className={styles.section} id="theater">
      <div className={styles.sectionHeader}>
        <div>
          <div className="badge"><i className="bx bx-calendar" /> Theater Schedule</div>
          <p style={{ fontSize: "0.85rem", color: "#aaa", marginTop: "4px" }}>
            {selectedYear === "2024"
              ? "Arsip Show Erine saat masa Trainee JKT48 (2024)"
              : selectedYear === "2026"
              ? "Jadwal & Riwayat Show Erine Tahun 2026 (Januari - Sekarang)"
              : "Jadwal Lengkap Show Theater JKT48"}
            {displayed.length > 0 && ` • (${displayed.length} show ditemukan)`}
          </p>
        </div>

        <div className={styles.controls}>
          {/* Filter Pilihan Tahun */}
          <div className={styles.yearTabs}>
            <button
              type="button"
              className={`${styles.yearBtn} ${selectedYear === "2026" ? styles.yearActive : ""}`}
              onClick={() => setSelectedYear("2026")}
            >
              2026
            </button>
            <button
              type="button"
              className={`${styles.yearBtn} ${selectedYear === "2024" ? styles.yearActive : ""}`}
              onClick={() => setSelectedYear("2024")}
            >
              2024 (Trainee)
            </button>
            <button
              type="button"
              className={`${styles.yearBtn} ${selectedYear === "2025" ? styles.yearActive : ""}`}
              onClick={() => setSelectedYear("2025")}
            >
              2025
            </button>
            <button
              type="button"
              className={`${styles.yearBtn} ${selectedYear === "all" ? styles.yearActive : ""}`}
              onClick={() => setSelectedYear("all")}
            >
              Semua
            </button>
          </div>

          {/* Toggle Khusus Erine */}
          <button
            type="button"
            className={`${styles.filterBtn} ${filterErine ? styles.filterActive : ""}`}
            onClick={() => setFilterErine((v) => !v)}
          >
            <i className={`bx ${filterErine ? "bxs-star" : "bx-star"}`} style={{ color: "orange" }} />
            {filterErine ? "Khusus Erine" : "Semua Member"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {[0, 1, 2].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className={styles.empty}>
          <i className="bx bx-calendar-x" />
          <p>
            {filterErine
              ? `Belum ada jadwal show Erine untuk tahun ${selectedYear === "all" ? "yang dipilih" : selectedYear}.`
              : "Belum ada jadwal show teater untuk periode ini."}
          </p>
        </div>
      ) : (
        <div className={styles.showList}>
          {displayed.map((show, idx) => {
            const date = show.date ?? show.showDate ?? "";
            const { dateStr, timeStr: fallback } = fmtDate(date);
            const timeStr = show.startTime ? show.startTime.slice(0, 5) : fallback;
            const members: ShowMember[] = show.members ?? show.member ?? show.lineup ?? [];
            const hasErine = members.some((m) => isErine(m.name ?? ""));
            const showYear = new Date(date).getFullYear();

            return (
              <div key={show.id ?? idx} className={`${styles.showCard} ${hasErine ? styles.showErine : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div className={styles.showDate}>{dateStr} · {timeStr} WIB</div>
                  <span className={`${styles.showBadgeYear} ${showYear === 2024 ? styles.showBadgeTrainee : ""}`}>
                    {showYear === 2024 ? "Trainee 2024" : `Tahun ${showYear}`}
                  </span>
                </div>

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

                {show.url && show.url !== "#" && (
                  <a href={show.url} target="_blank" rel="noreferrer" className="btnPrimary">
                    {showYear === 2026 && new Date(date).getTime() >= Date.now() ? "Tickets" : "Info Show"}
                  </a>
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const liveMembers = useMemo(() => mapApiToLiveCardProps(lives), [lives]);

  if (loading) return <div className={styles.loading}>Memeriksa siaran live Erine...</div>;

  // Jika Erine sedang live sekarang
  if (liveMembers.length > 0) {
    return (
      <section className={styles.section} id="live">
        <div className={styles.sectionHeader}>
          <div
            className="badge"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              borderColor: "rgba(239, 68, 68, 0.3)",
            }}
          >
            <i className="bx bx-broadcast bx-flashing" /> Sedang Live Sekarang!
          </div>
        </div>
        <LiveNowList members={liveMembers} />
      </section>
    );
  }

  // Jika sedang offline, tampilkan kanal live resmi Erine dengan UI elegan
  return (
    <section className={styles.section} id="live">
      <div className={styles.sectionHeader}>
        <div className="badge">
          <i className="bx bx-broadcast" /> Kanal Live Erine
        </div>
        <span
          style={{
            fontSize: "0.8rem",
            color: "#888",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#6b7280",
            }}
          />{" "}
          Sedang Offline
        </span>
      </div>
      <LiveOfflineCard
        name="Catherina Vallencia"
        nickname="Erine"
        avatarUrl="https://cava.jkt48connect.com/IMG-20260525-WA0211.jpg"
        idnUrl="https://www.idn.app/jkt48_erine"
        showroomUrl="https://www.showroom-live.com/r/JKT48_Erine"
        notice="Saat ini Erine belum melangsungkan siaran langsung. Kamu bisa mengunjungi kanal resmi IDN Live atau Showroom di bawah ini:"
      />
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
