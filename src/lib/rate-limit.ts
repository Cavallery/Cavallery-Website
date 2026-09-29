import { query } from "@/lib/mysql";
import crypto from "crypto";

/**
 * Rate limiter checking against kta_rate_limits table.
 * Table schema: rl_key VARCHAR(120), window_start DATETIME, hits INT, PRIMARY KEY (rl_key, window_start)
 */
export async function checkKtaRateLimit(
  identifier: string,
  maxHits = 60,
  windowMinutes = 1
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const hashed = crypto
      .createHash("sha256")
      .update(identifier || "unknown_ip")
      .digest("hex")
      .slice(0, 32);

    const rlKey = `kta_pub:${hashed}`;

    // UTC window truncated to windowMinutes
    const now = new Date();
    const windowStartMs =
      Math.floor(now.getTime() / (windowMinutes * 60 * 1000)) *
      (windowMinutes * 60 * 1000);
    const windowStartDate = new Date(windowStartMs)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await query(
      `INSERT INTO kta_rate_limits (rl_key, window_start, hits)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE hits = hits + 1`,
      [rlKey, windowStartDate]
    );

    const rows = await query<any[]>(
      `SELECT hits FROM kta_rate_limits WHERE rl_key = ? AND window_start = ? LIMIT 1`,
      [rlKey, windowStartDate]
    );

    const hits = rows && rows.length > 0 ? Number(rows[0].hits) : 1;
    const allowed = hits <= maxHits;
    const remaining = Math.max(0, maxHits - hits);

    return { allowed, remaining };
  } catch (err: any) {
    console.error("[RateLimit Error]:", err?.message);
    // Fail open if database check fails
    return { allowed: true, remaining: maxHits };
  }
}
