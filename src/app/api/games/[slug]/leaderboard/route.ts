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

let tablesChecked = false;
async function ensureTablesAndGamesExist() {
  if (tablesChecked || !isMySqlConfigured()) return;
  try {
    // 1. Pastikan tabel `games` ada dan terisi agar foreign key tidak gagal
    await query(`
      CREATE TABLE IF NOT EXISTS \`games\` (
        \`id\` VARCHAR(100) PRIMARY KEY,
        \`title\` VARCHAR(150) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await query(`
      INSERT INTO \`games\` (\`id\`, \`title\`) VALUES 
      ('grasshopper-collector', 'Game Belalang Yang Membangkang'),
      ('jumping-adventure', 'Game Bibir Yang Telah Dicuri'),
      ('zombie-escape', 'Game Erine In Etherland'),
      ('dress-up-erine', 'Game DressUp Erine'),
      ('love-erine-meter', 'Love Erine Meter')
      ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);
    `);

    // 2. Pastikan tabel `players` ada
    await query(`
      CREATE TABLE IF NOT EXISTS \`players\` (
        \`id\` VARCHAR(100) PRIMARY KEY,
        \`username\` VARCHAR(100) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Pastikan tabel `game_sessions` ada
    await query(`
      CREATE TABLE IF NOT EXISTS \`game_sessions\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`player_id\` VARCHAR(100) NOT NULL,
        \`game_id\` VARCHAR(100) NOT NULL,
        \`score\` INT NOT NULL DEFAULT 0,
        \`duration_seconds\` INT DEFAULT 0,
        \`played_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_game_score\` (\`game_id\`, \`score\`),
        INDEX \`idx_player\` (\`player_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    tablesChecked = true;
  } catch (e) {
    console.warn("[MySQL] ensureTablesAndGamesExist warning:", e);
  }
}

// GET /api/games/[slug]/leaderboard
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await ensureTablesAndGamesExist();

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
        // 1. Ambil Statistik Agregat dari MySQL
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

        // 2. Ambil Riwayat Skor Tertinggi
        const rawScores = await query<any[]>(
          `SELECT 
            COALESCE(p.username, s.player_id) AS username,
            s.score AS top_score,
            s.played_at AS last_played
          FROM game_sessions s
          LEFT JOIN players p ON s.player_id = p.id
          WHERE s.game_id = ?
          ORDER BY s.score DESC, s.played_at DESC
          LIMIT 50`,
          [slug]
        );

        if (rawScores && Array.isArray(rawScores) && rawScores.length > 0) {
          // Deduplikasi di JS agar 1 player hanya ambil high score terbaiknya
          const userBestMap = new Map<string, { username: string; score: number; played_at: string }>();
          for (const row of rawScores) {
            const uname = String(row.username || "Pemain").trim();
            const key = uname.toLowerCase();
            const scoreVal = Number(row.top_score) || 0;
            if (!userBestMap.has(key) || scoreVal > userBestMap.get(key)!.score) {
              userBestMap.set(key, {
                username: uname,
                score: scoreVal,
                played_at: row.last_played ? new Date(row.last_played).toISOString() : new Date().toISOString(),
              });
            }
          }

          leaderboard = Array.from(userBestMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((item, idx) => ({
              rank: idx + 1,
              username: item.username,
              score: item.score,
              played_at: item.played_at,
            }));
        }

        if (statsRows !== null && rawScores !== null) {
          return NextResponse.json({
            status: true,
            slug,
            stats,
            leaderboard,
            source: "database",
          });
        }
      } catch (dbErr) {
        console.error("MySQL Leaderboard query failed, fallback to local:", dbErr);
      }
    }

    // Fallback / Local Storage
    const allSessions = readLocalSessions();
    const gameSessions = allSessions.filter((s) => s.game_id === slug);

    if (gameSessions.length > 0) {
      const scores = gameSessions.map((s) => s.score);
      const uniquePlayers = new Set(gameSessions.map((s) => s.username.toLowerCase()));
      const totalScore = scores.reduce((a, b) => a + b, 0);

      stats = {
        rekor_teratas: Math.max(...scores, 0),
        total_pemain: uniquePlayers.size,
        sesi_dimainkan: gameSessions.length,
        rata_rata_skor: Math.round((totalScore / gameSessions.length) * 10) / 10,
      };

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
    await ensureTablesAndGamesExist();

    const body = await request.json();
    // Mendukung nama dengan spasi seperti "CATHERINA VALLENCIA"
    const rawName = (body.username || body.name || body.playerName || "Pemain").trim().slice(0, 50);
    const username = rawName || "Pemain";
    const score = parseInt(String(body.score), 10);
    const duration = parseInt(String(body.duration_seconds || "0"), 10) || 0;

    if (isNaN(score)) {
      return NextResponse.json(
        { status: false, message: "Score harus berupa angka" },
        { status: 400 }
      );
    }

    const playedAt = new Date().toISOString();
    // ID unik untuk relasi database, spasi diubah ke underscore untuk ID, nama asli tetap tersimpan dengan spasi
    const playerId = username.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 50) || "pemain";

    if (isMySqlConfigured()) {
      try {
        // 1. Pastikan game_id ada di tabel games
        await query(
          `INSERT INTO \`games\` (\`id\`, \`title\`) VALUES (?, ?) ON DUPLICATE KEY UPDATE \`id\`=\`id\``,
          [slug, slug.replace(/-/g, " ").toUpperCase()]
        );

        // 2. Simpan pemain dengan username lengkap (termasuk spasi, misal: "CATHERINA VALLENCIA")
        await query(
          `INSERT INTO \`players\` (\`id\`, \`username\`) VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE \`username\` = VALUES(\`username\`)`,
          [playerId, username]
        );

        // 3. Simpan sesi skor
        await query(
          `INSERT INTO \`game_sessions\` (\`player_id\`, \`game_id\`, \`score\`, \`duration_seconds\`) 
           VALUES (?, ?, ?, ?)`,
          [playerId, slug, score, duration]
        );
      } catch (dbErr: any) {
        console.error("[MySQL] Insert game session failed:", dbErr?.message);
      }
    }

    // Simpan ke local cache JSON juga agar selalu sinkron
    const sessions = readLocalSessions();
    const newSession: GameSessionItem = {
      id: Date.now(),
      game_id: slug,
      player_id: playerId,
      username, // username asli dengan spasi
      score,
      duration_seconds: duration,
      played_at: playedAt,
    };
    sessions.push(newSession);
    writeLocalSessions(sessions);

    return NextResponse.json({
      status: true,
      message: `Skor ${score} untuk "${username}" berhasil disimpan!`,
      data: newSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}
