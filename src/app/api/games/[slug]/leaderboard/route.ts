import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

export const dynamic = "force-dynamic";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const GAMES_DATA_FILE = path.join(DATA_DIR, "game-sessions.json");

function ensureDataDirectory() {
  try {
    const dir = path.dirname(GAMES_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not ensure data directory:", e);
  }
}

interface GameSessionItem {
  id: number | string;
  game_id: string;
  player_id: string;
  username: string;
  score: number;
  duration_seconds: number;
  played_at: string;
}

function readLocalSessions(): GameSessionItem[] {
  ensureDataDirectory();
  try {
    if (fs.existsSync(GAMES_DATA_FILE)) {
      const content = fs.readFileSync(GAMES_DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading game-sessions.json:", e);
  }
  return [];
}

function writeLocalSessions(data: GameSessionItem[]) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(GAMES_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write game-sessions.json:", e);
  }
}

// GET /api/games/[slug]/leaderboard
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let stats = {
      rekor_teratas: 0,
      total_pemain: 0,
      sesi_dimainkan: 0,
      rata_rata_skor: 0,
    };

    let leaderboard: Array<{
      rank: number;
      username: string;
      score: number;
      played_at: string;
    }> = [];

    if (isMySqlConfigured()) {
      try {
        // 1. Ambil Statistik Agregat
        const statsRows = await query<any[]>(
          `SELECT 
            COALESCE(MAX(score), 0) AS rekor_teratas,
            COUNT(DISTINCT player_id) AS total_pemain,
            COUNT(id) AS sesi_dimainkan,
            COALESCE(ROUND(AVG(score), 1), 0) AS rata_rata_skor
          FROM game_sessions
          WHERE game_id = ?`,
          [slug]
        );

        if (statsRows && statsRows.length > 0) {
          const s = statsRows[0];
          stats = {
            rekor_teratas: Number(s.rekor_teratas) || 0,
            total_pemain: Number(s.total_pemain) || 0,
            sesi_dimainkan: Number(s.sesi_dimainkan) || 0,
            rata_rata_skor: Number(s.rata_rata_skor) || 0,
          };
        }

        // 2. Ambil Leaderboard Top 10 (Skor Tertinggi Tiap Pemain)
        const lbRows = await query<any[]>(
          `SELECT 
            COALESCE(p.username, s.player_id) AS username,
            MAX(s.score) AS top_score,
            MAX(s.played_at) AS last_played
          FROM game_sessions s
          LEFT JOIN players p ON s.player_id = p.id
          WHERE s.game_id = ?
          GROUP BY s.player_id, p.username
          ORDER BY top_score DESC, last_played ASC
          LIMIT 10`,
          [slug]
        );

        if (lbRows && Array.isArray(lbRows)) {
          leaderboard = lbRows.map((r, idx) => ({
            rank: idx + 1,
            username: r.username || "Pemain",
            score: Number(r.top_score) || 0,
            played_at: r.last_played ? new Date(r.last_played).toISOString() : new Date().toISOString(),
          }));
        }

        return NextResponse.json({
          status: true,
          slug,
          stats,
          leaderboard,
          source: "database",
        });
      } catch (dbErr) {
        console.error("MySQL Leaderboard query failed, fallback to local:", dbErr);
      }
    }

    // Fallback: Local JSON Storage
    const allSessions = readLocalSessions();
    const gameSessions = allSessions.filter((s) => s.game_id === slug);

    if (gameSessions.length > 0) {
      const scores = gameSessions.map((s) => s.score);
      const uniquePlayers = new Set(gameSessions.map((s) => s.player_id || s.username));
      const totalScore = scores.reduce((a, b) => a + b, 0);

      stats = {
        rekor_teratas: Math.max(...scores, 0),
        total_pemain: uniquePlayers.size,
        sesi_dimainkan: gameSessions.length,
        rata_rata_skor: Math.round((totalScore / gameSessions.length) * 10) / 10,
      };

      // Top scores per user
      const userBest: Record<string, { username: string; score: number; played_at: string }> = {};
      gameSessions.forEach((s) => {
        const key = s.username.toLowerCase();
        if (!userBest[key] || s.score > userBest[key].score) {
          userBest[key] = {
            username: s.username,
            score: s.score,
            played_at: s.played_at,
          };
        }
      });

      leaderboard = Object.values(userBest)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item, idx) => ({
          rank: idx + 1,
          username: item.username,
          score: item.score,
          played_at: item.played_at,
        }));
    }

    return NextResponse.json({
      status: true,
      slug,
      stats,
      leaderboard,
      source: "local",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/games/[slug]/leaderboard
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const username = (body.username || body.name || "Anonim").trim().slice(0, 50);
    const score = parseInt(body.score, 10);
    const duration = parseInt(body.duration_seconds || "0", 10) || 0;

    if (isNaN(score)) {
      return NextResponse.json(
        { status: false, message: "Score harus berupa angka" },
        { status: 400 }
      );
    }

    const playedAt = new Date().toISOString();
    const playerId = username.toLowerCase().replace(/\s+/g, "_");

    if (isMySqlConfigured()) {
      try {
        // Pastikan tabel ada / insert pemain jika belum ada
        await query(
          `INSERT INTO players (id, username) VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE username = VALUES(username)`,
          [playerId, username]
        );

        // Catat sesi permainan
        await query(
          `INSERT INTO game_sessions (player_id, game_id, score, duration_seconds) 
           VALUES (?, ?, ?, ?)`,
          [playerId, slug, score, duration]
        );
      } catch (dbErr) {
        console.error("MySQL Insert game session failed:", dbErr);
      }
    }

    // Simpan ke local cache/fallback
    const sessions = readLocalSessions();
    const newSession: GameSessionItem = {
      id: Date.now(),
      game_id: slug,
      player_id: playerId,
      username,
      score,
      duration_seconds: duration,
      played_at: playedAt,
    };
    sessions.push(newSession);
    writeLocalSessions(sessions);

    return NextResponse.json({
      status: true,
      message: "Skor berhasil disimpan!",
      data: newSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}
