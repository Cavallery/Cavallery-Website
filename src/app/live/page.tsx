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

function isErineName(name: string) {
  const n = (name ?? "").toLowerCase();
  return ["erine", "catherina", "vallencia", "catherine", "valencia"].some((k) => n.includes(k));
}

function getLiveUrl(live: LiveItem): string {
  if (live.url && live.url !== "#") return live.url;
  if (live.is_erine || isErineName(live.name ?? "")) {
    return (live.type ?? "idn").includes("showroom") ? ERINE_SHOWROOM_URL : ERINE_IDN_URL;
  }
  const key = live.url_key ?? "";
  const type = (live.type ?? live.platform ?? "idn").toLowerCase();
  if (type.includes("showroom")) return key ? `https://www.showroom-live.com/r/${key}` : "#";
  return key ? `https://www.idn.app/${key}` : (live.slug ? `https://www.idn.app/jkt48-official/live/${live.slug}` : "#");
}

export default function LivePage() {
  const [lives, setLives] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [erineLive, setErineLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const json = await res.json();
      setLives(Array.isArray(json.data) ? json.data : []);
      setErineLive(json.erine_live ?? false);
      setLastUpdate(new Date());
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const erineLives = lives.filter((l) => l.is_erine || isErineName(l.name ?? ""));
  const otherLives = lives.filter((l) => !l.is_erine && !isErineName(l.name ?? ""));

  const LiveCard = ({ live, highlight = false }: { live: LiveItem; highlight?: boolean }) => {
    const name = live.name ?? "Unknown";
    const img = live.img ?? "";
    const platform = (live.type ?? live.platform ?? "IDN").toUpperCase();
    const url = getLiveUrl(live);

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
            <i className={`bx ${platform.includes("SHOWROOM") ? "bx-broadcast" : "bx-video"}`} />
            {platform}
          </div>
          <h3 className={styles.memberName}>{name}</h3>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`${highlight ? "btnPrimary" : "btnOutline"} ${styles.watchBtn}`}
          >
            <i className="bx bx-play-circle" /> {highlight ? "Tonton Live Erine!" : "Tonton Sekarang"}
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
            {erineLive
              ? "Erine sedang live sekarang! Yuk tonton!"
              : "Pantau siapa yang sedang live saat ini. Jadwal Erine paling diprioritaskan!"}
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
            {[0,1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : error ? (
          <div className={styles.errorBox}><i className="bx bx-error-circle" /> {error}</div>
        ) : lives.length === 0 ? (
          <div className={styles.empty}>
            <i className="bx bx-video-off" />
            <p>Tidak ada yang sedang live saat ini.</p>
            <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: 4 }}>
              Kamu bisa langsung cek live Erine di IDN:
            </p>
            <a
              href={ERINE_IDN_URL}
              target="_blank"
              rel="noreferrer"
              className="btnOutline"
              style={{ marginTop: 12 }}
            >
              <i className="bx bx-play-circle" /> Cek Live Erine di IDN
            </a>
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

            {/* Shortcut to Erine even when not in list */}
            {erineLives.length === 0 && (
              <div className={styles.erineSection} style={{ marginBottom: "1.5rem" }}>
                <h2 className={styles.sectionLabel}>
                  <i className="bx bx-star" /> Erine
                </h2>
                <div className={styles.grid}>
                  <div className={`glassCard ${styles.card}`} style={{ opacity: 0.7 }}>
                    <div className={styles.cardImg}>
                      <div className={styles.noImg}><i className="bx bxs-user" /></div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.platform}><i className="bx bx-video" /> IDN Live</div>
                      <h3 className={styles.memberName}>Catherina Vallencia</h3>
                      <p style={{ fontSize: "0.78rem", color: "var(--gold)", marginBottom: 8 }}>Belum live saat ini</p>
                      <a href={ERINE_IDN_URL} target="_blank" rel="noreferrer" className={`btnOutline ${styles.watchBtn}`}>
                        <i className="bx bx-link-external" /> Pantau Live Erine
                      </a>
                    </div>
                  </div>
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
