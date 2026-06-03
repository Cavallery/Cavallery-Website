"use client";
import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

const ERINE_KEYS = ["erine", "catherina", "vallencia"];
function isErine(name: string) {
  const n = (name ?? "").toLowerCase();
  return ERINE_KEYS.some((k) => n.includes(k));
}

interface LiveItem {
  id?: string; name?: string; member_name?: string;
  image?: string; img?: string; avatar?: string;
  platform?: string; type?: string;
  url?: string; idn_url?: string; showroom_url?: string;
  title?: string; started_at?: string; live_at?: string;
  view_count?: number; total_views?: number;
}

export default function LivePage() {
  const [lives, setLives] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const json = await res.json();
      setLives(Array.isArray(json.data) ? json.data : []);
      setLastUpdate(new Date());
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const erineLives = lives.filter((l) => isErine(l.name ?? l.member_name ?? ""));
  const otherLives = lives.filter((l) => !isErine(l.name ?? l.member_name ?? ""));

  const LiveCard = ({ live, highlight = false }: { live: LiveItem; highlight?: boolean }) => {
    const name = live.name ?? live.member_name ?? "Unknown";
    const img = live.image ?? live.img ?? live.avatar ?? "";
    const platform = live.platform ?? live.type ?? "IDN";
    
    let url = live.url ?? live.idn_url ?? live.showroom_url ?? "#";
    if (highlight || isErine(name)) {
      if (platform.toLowerCase().includes("idn") || url.includes("idn.app")) {
        url = "https://www.idn.app/jkt48_erine";
      } else {
        url = "https://www.showroom-live.com/r/JKT48_Erine";
      }
    }

    return (
      <div className={`glassCard ${styles.card} ${highlight ? styles.cardErine : ""}`}>
        {highlight && (
          <div className={styles.erineBadge}><i className="bx bxs-star" /> Erine sedang LIVE!</div>
        )}
        <div className={styles.cardImg}>
          {img ? (
            <img src={img} alt={name} loading="lazy" />
          ) : (
            <div className={styles.noImg}><i className="bx bxs-user" /></div>
          )}
          <div className={`${styles.liveDot} ${highlight ? styles.liveDotGold : ""}`} />
        </div>
        <div className={styles.cardBody}>
          <div className={styles.platform}>
            <i className={`bx ${platform.toLowerCase().includes("showroom") ? "bx-broadcast" : "bx-video"}`} />
            {platform}
          </div>
          <h3 className={styles.memberName}>{name}</h3>
          {live.title && <p className={styles.liveTitle}>{live.title}</p>}
          {live.view_count || live.total_views ? (
            <div className={styles.views}>
              <i className="bx bx-show" />
              {(live.view_count ?? live.total_views ?? 0).toLocaleString("id-ID")} penonton
            </div>
          ) : null}
          <a href={url} target="_blank" rel="noreferrer" className={`${highlight ? "btnPrimary" : "btnOutline"} ${styles.watchBtn}`}>
            <i className="bx bx-play-circle" /> Tonton Sekarang
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge">
            <span className={styles.livePulse} />
            LIVE NOW
          </div>
          <h1 className={styles.heroTitle}>Live <span className="textGold">Erine</span></h1>
          <p className={styles.heroSub}>
            Pantau siapa yang sedang live saat ini. Jadwal Erine paling diprioritaskan!
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Controls */}
        <div className={styles.topBar}>
          <span className={styles.updateTime}>
            <i className="bx bx-time-five" />
            {lastUpdate ? `Update: ${lastUpdate.toLocaleTimeString("id-ID")}` : "Memuat..."}
          </span>
          <button className={styles.refreshBtn} onClick={load}>
            <i className="bx bx-refresh" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className={styles.skeletons}>
            {[0,1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : error ? (
          <div className={styles.errorBox}><i className="bx bx-error-circle" /> {error}</div>
        ) : lives.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-video-off" />
            <p>Tidak ada yang sedang live saat ini.</p>
            <button className={styles.refreshBtn} onClick={load} style={{ marginTop: 16 }}>
              <i className="bx bx-refresh" /> Cek Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Erine Live — highlighted */}
            {erineLives.length > 0 && (
              <div className={styles.erineSection}>
                <h2 className={styles.sectionLabel}>
                  <i className="bx bxs-star" /> Erine sedang Live!
                </h2>
                <div className={styles.grid}>
                  {erineLives.map((l, i) => <LiveCard key={l.id ?? i} live={l} highlight />)}
                </div>
              </div>
            )}

            {/* Other members */}
            {otherLives.length > 0 && (
              <div className={styles.otherSection}>
                <h2 className={styles.sectionLabel}>
                  <i className="bx bx-broadcast" /> Member Lain yang Live
                </h2>
                <div className={styles.grid}>
                  {otherLives.map((l, i) => <LiveCard key={l.id ?? i} live={l} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
