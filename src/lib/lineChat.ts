// ============================================================
// CAVALLERY LINE CHAT HELPER
// Menyimpan dan mengambil pesan chat LINE dari MySQL
// ============================================================
import { query } from "@/lib/mysql";

let _tableEnsured = false;

/** Pastikan tabel line_contacts & line_chat_messages ada */
async function ensureTables() {
  if (_tableEnsured) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS line_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        line_user_id VARCHAR(64) NOT NULL,
        line_group_id VARCHAR(64) DEFAULT NULL,
        display_name VARCHAR(255) DEFAULT NULL,
        picture_url TEXT DEFAULT NULL,
        source_type ENUM('user','group','room') NOT NULL DEFAULT 'user',
        last_message_at TIMESTAMP NULL,
        is_blocked TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_line_user_group (line_user_id, line_group_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS line_chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contact_id INT NOT NULL,
        line_user_id VARCHAR(64) NOT NULL,
        line_group_id VARCHAR(64) DEFAULT NULL,
        display_name VARCHAR(255) DEFAULT NULL,
        message_text TEXT NOT NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'text',
        direction ENUM('in','out') NOT NULL DEFAULT 'in',
        line_message_id VARCHAR(64) DEFAULT NULL,
        sent_by_admin VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_contact (contact_id),
        KEY idx_direction (direction),
        KEY idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    _tableEnsured = true;
  } catch {
    _tableEnsured = true;
  }
}

export interface LineContact {
  id: number;
  line_user_id: string;
  line_group_id: string | null;
  display_name: string | null;
  picture_url: string | null;
  source_type: "user" | "group" | "room";
  last_message_at: string | null;
  is_blocked: number;
  created_at: string;
  unread_count?: number;
  last_message?: string;
}

export interface LineChatMessage {
  id: number;
  contact_id: number;
  line_user_id: string;
  line_group_id: string | null;
  display_name: string | null;
  message_text: string;
  message_type: string;
  direction: "in" | "out";
  line_message_id: string | null;
  sent_by_admin: string | null;
  created_at: string;
}

/**
 * Upsert kontak LINE (buat baru jika belum ada, update jika sudah)
 */
export async function upsertContact(
  lineUserId: string,
  lineGroupId: string | null,
  displayName: string | null,
  pictureUrl: string | null,
  sourceType: "user" | "group" | "room"
): Promise<number> {
  await ensureTables();

  const groupVal = lineGroupId || null;

  // Cek apakah sudah ada
  const existing = await query<any[]>(
    `SELECT id FROM line_contacts WHERE line_user_id = ? AND (line_group_id = ? OR (line_group_id IS NULL AND ? IS NULL)) LIMIT 1`,
    [lineUserId, groupVal, groupVal]
  );

  if (existing && existing.length > 0) {
    // Update display name & picture jika berubah
    await query(
      `UPDATE line_contacts SET display_name = COALESCE(?, display_name), picture_url = COALESCE(?, picture_url), last_message_at = NOW() WHERE id = ?`,
      [displayName, pictureUrl, existing[0].id]
    );
    return existing[0].id;
  }

  // Insert baru
  const res = await query<any>(
    `INSERT INTO line_contacts (line_user_id, line_group_id, display_name, picture_url, source_type, last_message_at) VALUES (?, ?, ?, ?, ?, NOW())`,
    [lineUserId, groupVal, displayName, pictureUrl, sourceType]
  );

  return res?.insertId || 0;
}

/**
 * Simpan pesan masuk dari webhook
 */
export async function saveIncomingMessage(
  contactId: number,
  lineUserId: string,
  lineGroupId: string | null,
  displayName: string | null,
  messageText: string,
  messageType: string,
  lineMessageId: string | null
): Promise<void> {
  await ensureTables();
  await query(
    `INSERT INTO line_chat_messages (contact_id, line_user_id, line_group_id, display_name, message_text, message_type, direction, line_message_id) VALUES (?, ?, ?, ?, ?, ?, 'in', ?)`,
    [contactId, lineUserId, lineGroupId || null, displayName, messageText, messageType, lineMessageId]
  );
}

/**
 * Simpan pesan keluar (dari admin)
 */
export async function saveOutgoingMessage(
  contactId: number,
  lineUserId: string,
  lineGroupId: string | null,
  messageText: string,
  adminUsername: string
): Promise<void> {
  await ensureTables();
  await query(
    `INSERT INTO line_chat_messages (contact_id, line_user_id, line_group_id, message_text, message_type, direction, sent_by_admin) VALUES (?, ?, ?, ?, 'text', 'out', ?)`,
    [contactId, lineUserId, lineGroupId || null, messageText, adminUsername]
  );
  // Update last_message_at
  await query(`UPDATE line_contacts SET last_message_at = NOW() WHERE id = ?`, [contactId]);
}

/**
 * Ambil daftar kontak dengan pesan terakhir
 */
export async function getContacts(search?: string): Promise<LineContact[]> {
  await ensureTables();

  let sql = `
    SELECT c.*,
      (SELECT COUNT(*) FROM line_chat_messages m WHERE m.contact_id = c.id AND m.direction = 'in' AND m.created_at > COALESCE(c.updated_at, c.created_at)) AS unread_count,
      (SELECT m2.message_text FROM line_chat_messages m2 WHERE m2.contact_id = c.id ORDER BY m2.created_at DESC LIMIT 1) AS last_message
    FROM line_contacts c
  `;
  const params: any[] = [];

  if (search && search.trim()) {
    sql += ` WHERE c.display_name LIKE ? OR c.line_user_id LIKE ?`;
    const s = `%${search.trim()}%`;
    params.push(s, s);
  }

  sql += ` ORDER BY c.last_message_at DESC`;

  const rows = await query<LineContact[]>(sql, params);
  return rows || [];
}

/**
 * Ambil riwayat pesan per kontak
 */
export async function getMessages(
  contactId: number,
  limit: number = 100,
  before?: number
): Promise<LineChatMessage[]> {
  await ensureTables();

  let sql = `SELECT * FROM line_chat_messages WHERE contact_id = ?`;
  const params: any[] = [contactId];

  if (before) {
    sql += ` AND id < ?`;
    params.push(before);
  }

  sql += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);

  const rows = await query<LineChatMessage[]>(sql, params);
  return (rows || []).reverse();
}

/**
 * Ambil kontak by ID
 */
export async function getContactById(id: number): Promise<LineContact | null> {
  await ensureTables();
  const rows = await query<any[]>(`SELECT * FROM line_contacts WHERE id = ? LIMIT 1`, [id]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Kirim pesan ke LINE user/group via Push Message API
 */
export async function sendLineMessage(
  to: string,
  messageText: string
): Promise<{ ok: boolean; error?: string }> {
  const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const channelAccessToken = rawToken.trim().replace(/^["']|["']$/g, "");

  if (!channelAccessToken) {
    return { ok: false, error: "LINE Channel Access Token belum dikonfigurasi" };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text: messageText }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[LINE Push Error]:", response.status, errText);
      return { ok: false, error: `LINE API error: ${response.status}` };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[LINE Push Error]:", err);
    return { ok: false, error: err?.message || "Gagal mengirim pesan" };
  }
}

/**
 * Ambil profil LINE user via API
 */
export async function getLineProfile(
  userId: string,
  groupId?: string | null
): Promise<{ displayName: string; pictureUrl?: string } | null> {
  const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const channelAccessToken = rawToken.trim().replace(/^["']|["']$/g, "");
  if (!channelAccessToken) return null;

  try {
    let url: string;
    if (groupId) {
      url = `https://api.line.me/v2/bot/group/${groupId}/member/${userId}`;
    } else {
      url = `https://api.line.me/v2/bot/profile/${userId}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return { displayName: data.displayName, pictureUrl: data.pictureUrl };
    }
  } catch {}
  return null;
}

/**
 * Mark messages as read for a contact (update updated_at)
 */
export async function markContactRead(contactId: number): Promise<void> {
  await ensureTables();
  await query(`UPDATE line_contacts SET updated_at = NOW() WHERE id = ?`, [contactId]);
}

/**
 * Hapus 1 pesan chat berdasarkan ID
 */
export async function deleteMessage(messageId: number): Promise<boolean> {
  await ensureTables();
  const res = await query(`DELETE FROM line_chat_messages WHERE id = ?`, [messageId]);
  return Boolean(res);
}

/**
 * Hapus seluruh percakapan dengan kontak tertentu (clear chat)
 */
export async function clearContactMessages(contactId: number): Promise<boolean> {
  await ensureTables();
  const res = await query(`DELETE FROM line_chat_messages WHERE contact_id = ?`, [contactId]);
  return Boolean(res);
}

/**
 * Hapus kontak beserta seluruh pesannya
 */
export async function deleteContact(contactId: number): Promise<boolean> {
  await ensureTables();
  await query(`DELETE FROM line_chat_messages WHERE contact_id = ?`, [contactId]);
  const res = await query(`DELETE FROM line_contacts WHERE id = ?`, [contactId]);
  return Boolean(res);
}

