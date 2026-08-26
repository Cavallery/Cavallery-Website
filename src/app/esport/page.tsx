"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface Division {
  id: string;
  name: string;
  cover_url: string;
  is_active: number;
  sort_order: number;
  roster_count: number;
}

interface RosterPlayer {
  id: number;
  player_name: string;
  game_id: string | null;
  role: string | null;
  avatar_url: string | null;
  is_captain: number;
}

interface EsportMatch {
  id: number;
  division_id: string;
  division_name?: string;
  tournament_name: string;
  opponent_name: string;
  opponent_logo: string | null;
  match_date: string;
  status: "upcoming" | "live" | "completed";
  score_cavallery: number;
  score_opponent: number;
  result: "win" | "lose" | "draw" | "pending";
  stream_url: string | null;
  notes: string | null;
}

const INITIAL_DIVISIONS: Division[] = [
  {
    id: "ml",
    name: "Mobile Legends",
    cover_url: "https://seagm-media.seagmcdn.com/item_480/1045.png",
    is_active: 1,
    sort_order: 1,
    roster_count: 0,
  },
  {
    id: "efootball",
    name: "eFootball",
    cover_url: "https://m.media-amazon.com/images/M/MV5BZjAzYjBiM2YtNTM4Zi00MmIzLWFhNDktZWNiNmY4N2YzYjFiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    is_active: 0,
    sort_order: 2,
    roster_count: 0,
  },
  {
    id: "coc",
    name: "Clash of Clans",
    cover_url: "https://m.media-amazon.com/images/M/MV5BZTEyNjE0OGEtYmIwNS00NjQ4LTgzNTEtYWVmMzBkMmYxMGI0XkEyXkFqcGc@._V1_.jpg",
    is_active: 0,
    sort_order: 3,
    roster_count: 0,
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    cover_url: "https://screenscore.digitalmama.id/wp-content/uploads/2024/05/IMG_0880.jpeg",
    is_active: 0,
    sort_order: 4,
    roster_count: 0,
  },
  {
    id: "ff",
    name: "Free Fire",
    cover_url: "https://cdn.wildflamestudio.com/common/web_event/official2.ff.garena.all/20266/f3ff01eefc0b3d7186b553edcd16debf.jpg",
    is_active: 0,
    sort_order: 5,
    roster_count: 0,
  },
  {
    id: "valorant",
    name: "Valorant",
    cover_url: "https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/valo2.png",
    is_active: 0,
    sort_order: 6,
    roster_count: 0,
  },
];

export default function EsportPage() {
  const [divisions, setDivisions] = useState<Division[]>(INITIAL_DIVISIONS);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<Division | null>(null);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Matches state
  const [matches, setMatches] = useState<EsportMatch[]>([]);
  const [activeMatchFilter, setActiveMatchFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/esport")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setDivisions(d.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/esport/matches")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setMatches(d.data);
        }
      })
      .catch(() => {});
  }, []);

  const openRoster = async (div: Division) => {
    if (!div.is_active) return;
    setModal(div);
    setRosterLoading(true);
    setRoster([]);
    try {
      const r = await fetch(`/api/esport/${div.id}/roster`);
      if (r.ok) {
        const d = await r.json();
        if (d.success && Array.isArray(d.data)) {
          setRoster(d.data);
        }
      }
    } catch {
      // Safe fallback
    } finally {
      setRosterLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setRoster([]);
  };

  const filteredMatches = matches.filter(
    (m) => activeMatchFilter === "all" || m.division_id === activeMatchFilter
  );

  const upcomingMatches = filteredMatches.filter((m) => m.status !== "completed");
  const completedMatches = filteredMatches.filter((m) => m.status === "completed");

  return (
    <div className={styles.page}>
      {/* Hero with Header Banner and Official Esport Logo */}
      <div className={styles.hero}>
        <img
          src="/uploads/cavallery/images/2026/08/0e2745f8922912e4.jpg"
          alt="Cavallery Esport Header"
          className={styles.heroBgImg}
        />
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          <img
            src="/uploads/cavallery/images/2026/08/ba2f4180738c4571.jpg"
            alt="Cavallery Esport Logo"
            className={styles.heroLogo}
          />
          <div className="badge">
            <i className="bx bx-trophy" /> Official Gaming Community
          </div>
          <h1 className={styles.heroTitle}>
            Cavallery <span className="textGold">Esports</span>
          </h1>
          <p className={styles.heroSub}>
            Wadah gaming kompetitif & kebersamaan pendukung Erine JKT48. Bermain dengan semangat sportivitas, meraih kemenangan bersama keluarga besar Cavallery!
          </p>
        </div>
      </div>

      {/* Intro & Pillars */}
      <div className={styles.introSection}>
        <div className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon}>
              <i className="bx bx-group" />
            </div>
            <div>
              <div className={styles.pillarTitle}>MabaRine & Gathering</div>
              <p className={styles.pillarDesc}>
                Ajang bermain bareng santai setiap minggu untuk mempererat keakraban sesama fans Erine di berbagai game favorit.
              </p>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon}>
              <i className="bx bx-trophy" />
            </div>
            <div>
              <div className={styles.pillarTitle}>Turnamen Komunitas</div>
              <p className={styles.pillarDesc}>
                Berkompetisi membawa nama Cavallery di turnamen e-sports resmi antar-fanbase JKT48 se-Indonesia.
              </p>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon}>
              <i className="bx bx-shield-quarter" />
            </div>
            <div>
              <div className={styles.pillarTitle}>Solid & Suportif</div>
              <p className={styles.pillarDesc}>
                Membangun ekosistem gaming yang positif, menjunjung tinggi fairplay, dan saling mendukung satu sama lain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Divisions Grid */}
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Divisi Game Resmi</h2>
          <p className={styles.sectionSub}>
            Pilih divisi game di bawah untuk melihat susunan roster dan status keaktifan tim saat ini.
          </p>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <i className="bx bx-loader-alt bx-spin" /> Memuat divisi...
          </div>
        ) : (
          <div className={styles.grid}>
            {divisions.map((div) => {
              const isActive = Boolean(div.is_active);
              return (
                <div
                  key={div.id}
                  className={`${styles.card} ${isActive ? styles.cardActive : styles.cardInactive}`}
                  onClick={() => isActive && openRoster(div)}
                  title={isActive ? `Lihat roster ${div.name}` : `${div.name} — Sedang Nonaktif`}
                >
                  <img src={div.cover_url} alt={div.name} className={styles.cardImg} />
                  <div className={styles.cardOverlay} />

                  {/* Roster count badge */}
                  <div className={styles.rosterBadge}>
                    {div.roster_count} ROSTER
                  </div>

                  {/* Bottom info */}
                  <div className={styles.cardBottom}>
                    <div className={styles.cardName}>{div.name}</div>
                    <div className={styles.statusRow}>
                      {isActive ? (
                        <>
                          <span className={styles.statusActive}>
                            <i className="bx bx-signal-5" /> AKTIF
                          </span>
                          <button className={styles.rosterBtn}>
                            LIHAT ROSTER <i className="bx bx-chevron-right" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={styles.statusInactive}>
                            <i className="bx bx-pause-circle" /> SEDANG NONAKTIF
                          </span>
                        </>
                      )}
                    </div>
                    {!isActive && (
                      <div className={styles.hiatus}>DIVISI SEDANG HIATUS</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MATCHES SECTION (Upcoming & Results) */}
        <div className={styles.matchesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-calendar-event" style={{ color: "var(--gold)", marginRight: 8 }} />
              Jadwal & Hasil Pertandingan
            </h2>
            <p className={styles.sectionSub}>
              Pantau jadwal pertandingan Cavallery Esport mendatang dan rekam jejak hasil pertandingan kami.
            </p>
          </div>

          {/* Game Filter Tabs */}
          <div className={styles.matchTabs}>
            <button
              className={`${styles.matchTab} ${activeMatchFilter === "all" ? styles.matchTabActive : ""}`}
              onClick={() => setActiveMatchFilter("all")}
            >
              Semua Game
            </button>
            {divisions.map((d) => (
              <button
                key={d.id}
                className={`${styles.matchTab} ${activeMatchFilter === d.id ? styles.matchTabActive : ""}`}
                onClick={() => setActiveMatchFilter(d.id)}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Upcoming & Live Matches */}
          {upcomingMatches.length > 0 && (
            <div style={{ marginBottom: "3rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", color: "var(--fg)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bx bx-time-five" style={{ color: "var(--gold)" }} /> Pertandingan Mendatang & Live
              </h3>
              <div className={styles.matchesGrid}>
                {upcomingMatches.map((m) => (
                  <div key={m.id} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <span className={styles.gameTag}>
                        {m.division_name || m.division_id.toUpperCase()}
                      </span>
                      {m.status === "live" ? (
                        <span className={`${styles.matchStatusBadge} ${styles.statusLive}`}>
                          🔴 LIVE STREAMING
                        </span>
                      ) : (
                        <span className={`${styles.matchStatusBadge} ${styles.statusUpcoming}`}>
                          ⏳ UPCOMING
                        </span>
                      )}
                    </div>

                    <div className={styles.matchVersusRow}>
                      <div className={styles.teamBox}>
                        <i className="bx bxs-shield-alt-2" style={{ color: "var(--gold)" }} /> Cavallery
                      </div>
                      <div className={styles.vsBadge}>VS</div>
                      <div className={styles.teamBox}>
                        <i className="bx bx-user" style={{ opacity: 0.6 }} /> {m.opponent_name}
                      </div>
                    </div>

                    <div className={styles.matchFooter}>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--fg)" }}>{m.tournament_name}</div>
                        <div style={{ fontSize: "0.78rem" }}>
                          {new Date(m.match_date).toLocaleString("id-ID", {
                            dateStyle: "full",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>
                      {m.stream_url && (
                        <a href={m.stream_url} target="_blank" rel="noopener noreferrer" className={styles.streamLinkBtn}>
                          <i className="bx bxl-youtube" /> Tonton Stream ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Match Results */}
          {completedMatches.length > 0 && (
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem", color: "var(--fg)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bx bx-select-multiple" style={{ color: "#34d399" }} /> Hasil Pertandingan Terakhir
              </h3>
              <div className={styles.matchesGrid}>
                {completedMatches.map((m) => {
                  const isWin = m.result === "win";
                  const isLose = m.result === "lose";

                  return (
                    <div key={m.id} className={styles.matchCard}>
                      <div className={styles.matchHeader}>
                        <span className={styles.gameTag}>
                          {m.division_name || m.division_id.toUpperCase()}
                        </span>
                        <span
                          className={`${styles.matchStatusBadge} ${
                            isWin ? styles.statusWin : isLose ? styles.statusLose : styles.statusDraw
                          }`}
                        >
                          {isWin ? "🟢 WIN" : isLose ? "🔴 LOSE" : "⚪ DRAW"}
                        </span>
                      </div>

                      <div className={styles.matchVersusRow}>
                        <div className={styles.teamBox}>Cavallery</div>
                        <div className={styles.matchScoreBox}>
                          {m.score_cavallery} - {m.score_opponent}
                        </div>
                        <div className={styles.teamBox}>{m.opponent_name}</div>
                      </div>

                      <div className={styles.matchFooter}>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--fg)" }}>{m.tournament_name}</div>
                          {m.notes && <div style={{ fontSize: "0.78rem" }}>{m.notes}</div>}
                        </div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                          {new Date(m.match_date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Join Roster Call to Action */}
        <div className={styles.joinCta}>
          <i className="bx bx-joystick" style={{ fontSize: "3rem", color: "var(--gold)", marginBottom: "0.8rem" }} />
          <h3 className={styles.joinCtaTitle}>Tertarik Bergabung Menjadi Roster Cavallery?</h3>
          <p className={styles.joinCtaDesc}>
            Perekrutan anggota tim divisi Esport dibuka secara berkala melalui pendaftaran pengurus Cavallery. Tunjukkan bakat gaming-mu dan berjuang bersama kami!
          </p>
          <Link href="/join" className={styles.joinBtn}>
            <i className="bx bx-user-plus" /> Daftar Tim Pengurus / Roster
          </Link>
        </div>
      </div>

      {/* Roster Modal */}
      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-group" />
                Roster {modal.name}
              </h3>
              <button className={styles.modalClose} onClick={closeModal}>
                <i className="bx bx-x" />
              </button>
            </div>
            <div className={styles.modalBody}>
              {rosterLoading ? (
                <div className={styles.loading}>
                  <i className="bx bx-loader-alt bx-spin" /> Memuat roster...
                </div>
              ) : roster.length === 0 ? (
                <div className={styles.emptyRoster}>
                  <i className="bx bx-user-x" />
                  Belum ada roster yang terdaftar
                </div>
              ) : (
                <div className={styles.rosterList}>
                  {roster.map((p) => (
                    <div key={p.id} className={styles.rosterItem}>
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.player_name} className={styles.rosterAvatar} />
                      ) : (
                        <div className={styles.rosterAvatarPlaceholder}>
                          <i className="bx bx-user" />
                        </div>
                      )}
                      <div className={styles.rosterInfo}>
                        <div className={styles.rosterName}>
                          {p.player_name}
                          {Boolean(p.is_captain) && (
                            <span className={styles.captainBadge}>Captain</span>
                          )}
                        </div>
                        {p.role && <div className={styles.rosterRole}>{p.role}</div>}
                      </div>
                      {p.game_id && (
                        <div className={styles.rosterGameId}>{p.game_id}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
