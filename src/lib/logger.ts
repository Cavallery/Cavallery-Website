import { query, isMySqlConfigured } from "@/lib/mysql";

export interface ActivityLog {
  id?: number | string;
  username: string;
  action: string;
  module: string;
  details?: string;
  ip_address?: string;
  created_at?: string;
}

export interface LoginLog {
  id?: number | string;
  username: string;
  status: "success" | "failed";
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Fallback in-memory storage if MySQL is offline
const inMemoryActivityLogs: ActivityLog[] = [];
const inMemoryLoginLogs: LoginLog[] = [];

export async function logActivity({
  username,
  action,
  module,
  details,
  ip_address,
}: ActivityLog): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (isMySqlConfigured()) {
    try {
      await query(
        `INSERT INTO activity_logs (username, action, module, details, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username || "admin", action, module, details || null, ip_address || "127.0.0.1", timestamp]
      );
      return;
    } catch (e: any) {
      console.warn("Failed to write to activity_logs table:", e.message);
    }
  }

  // In-memory fallback
  inMemoryActivityLogs.unshift({
    id: Date.now(),
    username: username || "admin",
    action,
    module,
    details,
    ip_address: ip_address || "127.0.0.1",
    created_at: timestamp,
  });
  if (inMemoryActivityLogs.length > 200) inMemoryActivityLogs.pop();
}

export async function logLogin({
  username,
  status,
  ip_address,
  user_agent,
}: LoginLog): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (isMySqlConfigured()) {
    try {
      await query(
        `INSERT INTO login_logs (username, status, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [username || "unknown", status, ip_address || "127.0.0.1", user_agent?.slice(0, 255) || null, timestamp]
      );
      return;
    } catch (e: any) {
      console.warn("Failed to write to login_logs table:", e.message);
    }
  }

  // In-memory fallback
  inMemoryLoginLogs.unshift({
    id: Date.now(),
    username: username || "unknown",
    status,
    ip_address: ip_address || "127.0.0.1",
    user_agent,
    created_at: timestamp,
  });
  if (inMemoryLoginLogs.length > 200) inMemoryLoginLogs.pop();
}

export function getFallbackActivityLogs(): ActivityLog[] {
  return inMemoryActivityLogs;
}

export function getFallbackLoginLogs(): LoginLog[] {
  return inMemoryLoginLogs;
}
