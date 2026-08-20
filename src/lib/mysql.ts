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

function getPool(): mysql.Pool {
  if (global._mysqlPool) return global._mysqlPool;

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "u410588002_Cavallery",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  if (process.env.NODE_ENV !== "production") {
    global._mysqlPool = pool;
  }

  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  if (!isMySqlConfigured()) return null;
  try {
    const pool = getPool();
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    console.error("[MySQL Error]:", error.message);
    return null;
  }
}

export default getPool;
