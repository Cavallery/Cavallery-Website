// ============================================================
// CAVALLERY MYSQL DATABASE CONNECTOR (HOSTINGER READY)
// ============================================================
import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

const pool =
  global._mysqlPool ||
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cavallery_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global._mysqlPool = pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}

export default pool;
