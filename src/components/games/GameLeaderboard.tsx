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

interface GameLeaderboardProps {
  slug: string;
  gameTitle: string;
}

export default function GameLeaderboard({ slug, gameTitle }: GameLeaderboardProps) {
  const [stats, setStats] = useState<GameStats>({
    rekor_teratas: 0,
    total_pemain: 0,
    sesi_dimainkan: 0,
    rata_rata_skor: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const fetchStatsAndLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/games/${slug}/leaderboard`, { cache: "no-store" });
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
  }, [slug]);

  // Submit score ke API
  const submitScore = useCallback(
    async (username: string, score: number, duration: number = 0) => {
      try {
        const res = await fetch(`/api/games/${slug}/leaderboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, score, duration_seconds: duration }),
        });
        const result = await res.json();
        if (result.status) {
          setAlertMsg(`🎉 Skor ${score} milik "${username}" berhasil dicatat ke database!`);
          setTimeout(() => setAlertMsg(null), 5000);
          fetchStatsAndLeaderboard();
        }
      } catch (err) {
        console.error("Error submitting score:", err);
      }
    },
    [slug, fetchStatsAndLeaderboard]
  );

  // Listener untuk postMessage dari iframe permainan
  useEffect(() => {
    fetchStatsAndLeaderboard();

    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      const { type, score, playerName, username } = event.data;

      if (type === "GAME_OVER" || type === "GAME_SCORE_SUBMIT" || type === "SUBMIT_SCORE") {
        const finalName = playerName || username || "Pemain GameRine";
        const finalScore = Number(score);
        if (!isNaN(finalScore)) {
          submitScore(finalName, finalScore);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchStatsAndLeaderboard, submitScore]);

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
      {/* Notifikasi realtime jika skor masuk */}
      {alertMsg && (
        <div
          style={{
            background: "linear-gradient(90deg, #ca8a04, #eab308)",
            color: "#000",
            fontWeight: 700,
            padding: "12px 20px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(234, 179, 8, 0.4)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {alertMsg}
        </div>
      )}

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
            <h2 className={styles.sectionTitle}>Papan Peringkat (Leaderboard)</h2>
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
            <p>Belum ada catatan skor untuk {gameTitle}.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
              Jadilah yang pertama bermain dan catatkan namamu di papan peringkat!
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
                  <th className={styles.th} style={{ textAlign: "right" }}>Waktu</th>
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
            Skor kamu akan otomatis tersimpan ke leaderboard database saat permainan berakhir.
          </span>
        </div>
      </div>
    </div>
  );
}
