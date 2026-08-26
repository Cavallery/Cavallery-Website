"use client";
import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

const ERINE_IDN_URL = "https://www.idn.app/jkt48_erine";
const ERINE_SHOWROOM_URL = "https://www.showroom-live.com/r/JKT48_Erine";

interface LiveItem {
  id?: string;
  name?: string;
  img?: string;
  type?: string;
  platform?: string;
  url_key?: string;
  slug?: string;
  started_at?: string;
  streaming_url?: string;
  url?: string;
  is_erine?: boolean;
}

export default function LivePage() {
  const [lives, setLives] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [erineLive, setErineLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const json = await res.json();
      const list: LiveItem[] = Array.isArray(json.data) ? json.data : [];
      setLives(list);
      setErineLive(Boolean(json.erine_live) || list.length > 0);
      setLastUpdate(new Date());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const currentLive = lives[0] || null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge">
            <span className={styles.livePulse} />
            LIVE ERINE
          </div>
          <h1 className={styles.heroTitle}>
            Live Streaming <span className="textGold">Erine</span>
          </h1>
          <p className={styles.heroSub}>
            {erineLive
              ? "Catherina Vallencia (Erine) sedang LIVE sekarang! Klik tombol di bawah untuk langsung menonton siarannya."
              : "Pantau siaran langsung Catherina Vallencia (Erine) di IDN Live dan Showroom secara real-time."}
          </p>
        </div>
      </div>

      <div className={styles.content}>
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
            {[0, 1].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <i className="bx bx-error-circle" /> {error}
          </div>
        ) : erineLive && currentLive ? (
          /* Erine is Currently Live */
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            <div className={`glassCard ${styles.card} ${styles.cardErine}`}>
              <div className={styles.erineBadge}>
                <i className="bx bxs-star" /> Erine sedang LIVE!
              </div>

              <div className={styles.cardImg} style={{ height: 260 }}>
                {currentLive.img ? (
                  <img src={currentLive.img} alt="Erine Live" loading="lazy" />
                ) : (
                  <div className={styles.noImg}>
                    <i className="bx bxs-user" />
                  </div>
                )}
                <div className={`${styles.liveDot} ${styles.liveDotGold}`} />
              </div>

              <div className={styles.cardBody} style={{ padding: "1.4rem", textAlign: "center" }}>
                <div className={styles.platform} style={{ justifyContent: "center", marginBottom: 6 }}>
                  <i
                    className={`bx ${
                      currentLive.type?.includes("showroom") ? "bx-broadcast" : "bx-video"
                    }`}
                  />
                  {currentLive.platform || "IDN LIVE"}
                </div>

                <h2 className={styles.memberName} style={{ fontSize: "1.4rem", marginBottom: 6 }}>
                  Catherina Vallencia (Erine)
                </h2>

                <p style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: 16 }}>
                  Sedang melangsungkan siaran langsung. Yuk gabung dan berikan semangat untuk Erine!
                </p>

                <a
                  href={currentLive.url || ERINE_IDN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={`btnPrimary ${styles.watchBtn}`}
                  style={{ fontSize: "1rem", padding: "12px 24px" }}
                >
                  <i className="bx bx-play-circle" /> Tonton Live Erine Sekarang!
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Erine is Currently Offline */
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <div className={styles.empty} style={{ padding: "3rem 1.5rem" }}>
              <i className="bx bx-video-off" style={{ fontSize: "3.5rem", color: "var(--gold)", opacity: 0.6 }} />
              <h3 style={{ fontSize: "1.3rem", color: "#fff", margin: "1rem 0 0.5rem" }}>
                Erine Belum Live Saat Ini
              </h3>
              <p style={{ fontSize: "0.92rem", color: "#aaa", maxWidth: 460, margin: "0 auto 1.8rem" }}>
                Saat ini Catherina Vallencia belum melangsungkan live streaming. Kamu bisa memantau dan mem-follow akun resmi Erine di bawah ini agar tidak ketinggalan saat live dimulai:
              </p>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href={ERINE_IDN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btnPrimary"
                  style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                >
                  <i className="bx bx-video" /> IDN Live Erine
                </a>
                <a
                  href={ERINE_SHOWROOM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btnOutline"
                  style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                >
                  <i className="bx bx-broadcast" /> Showroom Erine
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
