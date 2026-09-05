// ============================================================
// CAVALLERY MYSQL DATABASE CONNECTOR (HOSTINGER READY)
// ============================================================
import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

export function isMySqlConfigured(): boolean {
  const pw = process.env.DB_PASSWORD;
  const name = process.env.DB_NAME;
  return Boolean(
    name &&
    name !== "cavallery_db" &&
    pw &&
    !pw.includes("GANTI_") &&
    !pw.includes("MasukkanPassword") &&
    pw.trim().length > 0
  );
}

let poolInstance: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (poolInstance) return poolInstance;
  if (global._mysqlPool) {
    poolInstance = global._mysqlPool;
    return poolInstance;
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "u410588002_Cavallery",
    waitForConnections: true,
    connectionLimit: 8,
    queueLimit: 20,
    connectTimeout: 3000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    charset: "utf8mb4",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  global._mysqlPool = pool;
  poolInstance = pool;
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  if (!isMySqlConfigured()) return null;
  try {
    const pool = getPool();
    if (params && params.length > 0) {
      const [results] = await pool.execute(sql, params);
      return results as T;
    } else {
      const [results] = await pool.query(sql);
      return results as T;
    }
  } catch (error: any) {
    console.error("[MySQL Error]:", error.message);
    return null;
  }
}

export async function resetAutoIncrement(tableName: string): Promise<void> {
  try {
    const rows = await query<any[]>(`SELECT COALESCE(MAX(id), 0) AS max_id FROM ${tableName}`);
    const maxId = rows && rows.length > 0 ? Number(rows[0].max_id || 0) : 0;
    const nextAutoInc = Math.max(1, maxId + 1);
    await query(`ALTER TABLE ${tableName} AUTO_INCREMENT = ${nextAutoInc}`);
  } catch (e: any) {
    console.error(`[MySQL] Error resetting AUTO_INCREMENT for ${tableName}:`, e?.message);
  }
}

export async function getNextAvailableId(tableName: string): Promise<number> {
  try {
    // 1. Jika ID 1 tidak ada, selalu mulai dari 1
    const checkOne = await query<any[]>(`SELECT id FROM ${tableName} WHERE id = 1 LIMIT 1`);
    if (!checkOne || checkOne.length === 0) {
      await query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
      return 1;
    }
    // 2. Cari lubang/gap ID terkecil yang kosong
    const rows = await query<any[]>(`
      SELECT t1.id + 1 AS next_id
      FROM ${tableName} t1
      LEFT JOIN ${tableName} t2 ON t1.id + 1 = t2.id
      WHERE t2.id IS NULL
      ORDER BY t1.id ASC
      LIMIT 1
    `);
    if (rows && rows.length > 0 && rows[0].next_id) {
      const nextId = Number(rows[0].next_id);
      return nextId;
    }
  } catch (e: any) {
    console.error(`[MySQL] Error finding next ID for ${tableName}:`, e?.message);
  }
  return 1;
}

export default getPool;
