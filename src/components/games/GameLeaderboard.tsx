"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./GameLeaderboard.module.css";

interface GameStats {
  rekor_teratas: number;
  total_pemain: number;
  sesi_dimainkan: number;
  rata_rata_skor: number;
}

interface LeaderboardItem {
  rank: number;
  username: string;
  score: number;
  played_at: string;
}

const COMPETITIVE_GAMES = [
  {
    slug: "grasshopper-collector",
    title: "Game Belalang Yang Membangkang",
    icon: "bx-bug",
    tag: "Arcade",
    color: "#4ade80",
  },
  {
    slug: "jumping-adventure",
    title: "Game Bibir Yang Telah Dicuri",
    icon: "bx-up-arrow-circle",
    tag: "Adventure",
    color: "#60a5fa",
  },
];

export default function GameLeaderboard() {
  const [selectedGame, setSelectedGame] = useState(COMPETITIVE_GAMES[0].slug);
  const [stats, setStats] = useState<GameStats>({
    rekor_teratas: 0,
    total_pemain: 0,
    sesi_dimainkan: 0,
    rata_rata_skor: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentGameInfo = COMPETITIVE_GAMES.find((g) => g.slug === selectedGame) || COMPETITIVE_GAMES[0];

  const fetchStatsAndLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/games/${selectedGame}/leaderboard`, { cache: "no-store" });
      const data = await res.json();
      if (data.status) {
        setStats(data.stats);
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Gagal memuat leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedGame]);

  useEffect(() => {
    fetchStatsAndLeaderboard();
  }, [fetchStatsAndLeaderboard]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className={styles.container}>
      {/* SECTION TITLE & TAB SWITCHER */}
      <div className={styles.sectionHeaderWrap}>
        <div className={styles.titleAreaMain}>
          <div className="badge">
            <i className="bx bx-trophy" /> Leaderboard & Statistik
          </div>
          <h2 className={styles.mainTitle}>
            Papan Skor <span className="textGold">#GameRine</span>
          </h2>
          <p className={styles.mainSubtitle}>
            Catatan rekor teratas dan statistik dari game yang memiliki sistem input nama & skor.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className={styles.tabsContainer}>
          {COMPETITIVE_GAMES.map((game) => (
            <button
              key={game.slug}
              className={`${styles.tabBtn} ${selectedGame === game.slug ? styles.tabBtnActive : ""}`}
              onClick={() => setSelectedGame(game.slug)}
            >
              <i className={`bx ${game.icon}`} />
              <span>{game.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4 KARTU STATISTIK UTAMA */}
      <div className={styles.statsGrid}>
        {/* 1. Rekor Teratas */}
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <i className="bx bxs-trophy" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Rekor Teratas</span>
            <span className={styles.statValue}>
              {loading ? "..." : stats.rekor_teratas.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* 2. Total Pemain */}
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <i className="bx bxs-user-detail" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Pemain</span>
            <span className={styles.statValue}>
              {loading ? "..." : stats.total_pemain.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* 3. Sesi Dimainkan */}
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <i className="bx bxs-joystick-button" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Sesi Dimainkan</span>
            <span className={styles.statValue}>
              {loading ? "..." : stats.sesi_dimainkan.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* 4. Rata-rata Skor */}
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <i className="bx bxs-bar-chart-alt-2" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Rata-rata Skor</span>
            <span className={styles.statValue}>
              {loading ? "..." : stats.rata_rata_skor.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* LEADERBOARD TOP 10 */}
      <div className={styles.leaderboardSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleArea}>
            <i className="bx bxs-crown" />
            <h3 className={styles.sectionTitle}>
              Top 10 — {currentGameInfo.title}
            </h3>
          </div>
          <button
            onClick={fetchStatsAndLeaderboard}
            className={styles.refreshBtn}
            title="Segarkan Data"
          >
            <i className={`bx bx-refresh ${loading ? "bx-spin" : ""}`} /> Refresh
          </button>
        </div>

        {leaderboard.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            <i className="bx bx-ghost" />
            <p>Belum ada catatan skor untuk {currentGameInfo.title}.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              Mainkan permainannya, masukkan namamu, dan jadilah yang teratas di papan rekor!
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: "80px" }}>Rank</th>
                  <th className={styles.th}>Pemain</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Skor Tertinggi</th>
                  <th className={styles.th} style={{ textAlign: "right" }}>Waktu Bermain</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  let badgeClass = styles.rankOther;
                  if (entry.rank === 1) badgeClass = styles.rank1;
                  else if (entry.rank === 2) badgeClass = styles.rank2;
                  else if (entry.rank === 3) badgeClass = styles.rank3;

                  return (
                    <tr key={`${entry.rank}-${entry.username}`} className={styles.tr}>
                      <td className={styles.td}>
                        <span className={`${styles.rankBadge} ${badgeClass}`}>
                          {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.playerCell}>
                          <div className={styles.avatar}>
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <span>{entry.username}</span>
                        </div>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        <span className={styles.scoreVal}>
                          {entry.score.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: "right", color: "#a8a29e", fontSize: "0.88rem" }}>
                        {formatDate(entry.played_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.submitBanner}>
          <span>
            <i className="bx bx-info-circle" style={{ color: "#f59e0b" }} />
            Skor kamu otomatis tersimpan dan masuk ke database saat permainan selesai.
          </span>
        </div>
      </div>
    </div>
  );
}
