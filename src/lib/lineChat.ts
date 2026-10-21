// ============================================================
// CAVALLERY LINE CHAT HELPER
// Menyimpan dan mengambil pesan chat LINE dari MySQL
// Mendukung Reply Token, Kirim Gambar/Video, Tag/Mention & Kutip Pesan
// ============================================================
import { query } from "@/lib/mysql";

let _tableEnsured = false;

/** Pastikan tabel line_contacts & line_chat_messages ada beserta kolom reply token & media */
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
        latest_reply_token VARCHAR(64) DEFAULT NULL,
        latest_reply_token_at TIMESTAMP NULL DEFAULT NULL,
        latest_reply_token_epoch BIGINT DEFAULT NULL,
        is_blocked TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_user (line_user_id),
        KEY idx_group (line_group_id)
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
        media_url TEXT DEFAULT NULL,
        quoted_message_id INT DEFAULT NULL,
        quoted_text TEXT DEFAULT NULL,
        quoted_sender VARCHAR(255) DEFAULT NULL,
        sent_by_admin VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_contact (contact_id),
        KEY idx_direction (direction),
        KEY idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Pastikan kolom-kolom baru tersedia
    try {
      const cols = await query<any[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'line_contacts' AND COLUMN_NAME = 'latest_reply_token_epoch' LIMIT 1`
      );
      if (!cols || cols.length === 0) {
        await query(`ALTER TABLE line_contacts ADD COLUMN latest_reply_token_epoch BIGINT DEFAULT NULL`);
      }
    } catch {}

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
  latest_reply_token?: string | null;
  latest_reply_token_at?: string | null;
  latest_reply_token_epoch?: number | string | null;
  has_reply_token?: boolean;
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
  media_url?: string | null;
  quoted_message_id?: number | null;
  quoted_text?: string | null;
  quoted_sender?: string | null;
  direction: "in" | "out";
  line_message_id: string | null;
  sent_by_admin: string | null;
  created_at: string;
}

// Cache sederhana untuk summary grup LINE agar tidak membebani rate limit LINE API
const _groupSummaryCache = new Map<string, { groupName: string; pictureUrl?: string; time: number }>();

/**
 * Ambil informasi nama & foto grup LINE via API
 */
export async function getLineGroupSummary(
  groupId: string
): Promise<{ groupName: string; pictureUrl?: string } | null> {
  const cached = _groupSummaryCache.get(groupId);
  if (cached && Date.now() - cached.time < 3600000) {
    return cached;
  }

  const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const channelAccessToken = rawToken.trim().replace(/^["']|["']$/g, "");
  if (!channelAccessToken) return null;

  try {
    const res = await fetch(`https://api.line.me/v2/bot/group/${groupId}/summary`, {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const result = {
        groupName: data.groupName || "Grup LINE",
        pictureUrl: data.pictureUrl,
      };
      _groupSummaryCache.set(groupId, { ...result, time: Date.now() });
      return result;
    }
  } catch {}
  return null;
}

/**
 * Upsert kontak LINE (Grup dijadikan 1 kontak induk agar semua obrolan anggota tampil dalam 1 layar)
 */
export async function upsertContact(
  lineUserId: string,
  lineGroupId: string | null,
  displayName: string | null,
  pictureUrl: string | null,
  sourceType: "user" | "group" | "room",
  replyToken?: string | null
): Promise<number> {
  await ensureTables();

  const isGroup = (sourceType === "group" || sourceType === "room") && Boolean(lineGroupId);

  // Jika pesan dari GRUP: satukan seluruh chat ke dalam 1 kontak grup
  if (isGroup && lineGroupId) {
    const existingGroup = await query<any[]>(
      `SELECT id, display_name, picture_url FROM line_contacts WHERE line_group_id = ? AND source_type = 'group' ORDER BY id ASC LIMIT 1`,
      [lineGroupId]
    );

    if (existingGroup && existingGroup.length > 0) {
      const contactId = existingGroup[0].id;
      if (replyToken) {
        await query(
          `UPDATE line_contacts SET last_message_at = NOW(), latest_reply_token = ?, latest_reply_token_at = NOW(), latest_reply_token_epoch = ? WHERE id = ?`,
          [replyToken, Date.now(), contactId]
        );
      } else {
        await query(`UPDATE line_contacts SET last_message_at = NOW() WHERE id = ?`, [contactId]);
      }
      return contactId;
    }

    // Ambil info nama & foto profil grup dari LINE API
    let groupName = "Grup LINE";
    let groupPic: string | null = null;
    try {
      const summary = await getLineGroupSummary(lineGroupId);
      if (summary) {
        groupName = summary.groupName;
        groupPic = summary.pictureUrl || null;
      }
    } catch {}

    const res = await query<any>(
      `INSERT INTO line_contacts (line_user_id, line_group_id, display_name, picture_url, source_type, last_message_at, latest_reply_token, latest_reply_token_at, latest_reply_token_epoch) VALUES (?, ?, ?, ?, 'group', NOW(), ?, ?, ?)`,
      [lineGroupId, lineGroupId, groupName, groupPic, replyToken || null, replyToken ? new Date() : null, replyToken ? Date.now() : null]
    );
    return res?.insertId || 0;
  }

  // Jika pesan PERSONAL (1-on-1 user)
  const existing = await query<any[]>(
    `SELECT id FROM line_contacts WHERE line_user_id = ? AND line_group_id IS NULL LIMIT 1`,
    [lineUserId]
  );

  if (existing && existing.length > 0) {
    const contactId = existing[0].id;
    if (replyToken) {
      await query(
        `UPDATE line_contacts SET display_name = COALESCE(?, display_name), picture_url = COALESCE(?, picture_url), last_message_at = NOW(), latest_reply_token = ?, latest_reply_token_at = NOW(), latest_reply_token_epoch = ? WHERE id = ?`,
        [displayName, pictureUrl, replyToken, Date.now(), contactId]
      );
    } else {
      await query(
        `UPDATE line_contacts SET display_name = COALESCE(?, display_name), picture_url = COALESCE(?, picture_url), last_message_at = NOW() WHERE id = ?`,
        [displayName, pictureUrl, contactId]
      );
    }
    return contactId;
  }

  // Insert kontak personal baru
  const res = await query<any>(
    `INSERT INTO line_contacts (line_user_id, line_group_id, display_name, picture_url, source_type, last_message_at, latest_reply_token, latest_reply_token_at, latest_reply_token_epoch) VALUES (?, NULL, ?, ?, 'user', NOW(), ?, ?, ?)`,
    [lineUserId, displayName, pictureUrl, replyToken || null, replyToken ? new Date() : null, replyToken ? Date.now() : null]
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
  lineMessageId: string | null,
  mediaUrl?: string | null
): Promise<void> {
  await ensureTables();
  await query(
    `INSERT INTO line_chat_messages (contact_id, line_user_id, line_group_id, display_name, message_text, message_type, direction, line_message_id, media_url) VALUES (?, ?, ?, ?, ?, ?, 'in', ?, ?)`,
    [contactId, lineUserId, lineGroupId || null, displayName, messageText, messageType, lineMessageId, mediaUrl || null]
  );
}

/**
 * Simpan pesan keluar (dari admin) dengan dukungan media dan kutipan
 */
export async function saveOutgoingMessage(
  contactId: number,
  lineUserId: string,
  lineGroupId: string | null,
  messageText: string,
  adminUsername: string,
  options?: {
    mediaUrl?: string | null;
    messageType?: string;
    quotedMessageId?: number | null;
    quotedText?: string | null;
    quotedSender?: string | null;
  }
): Promise<void> {
  await ensureTables();
  const mType = options?.messageType || (options?.mediaUrl ? "image" : "text");
  await query(
    `INSERT INTO line_chat_messages (contact_id, line_user_id, line_group_id, message_text, message_type, direction, sent_by_admin, media_url, quoted_message_id, quoted_text, quoted_sender) VALUES (?, ?, ?, ?, ?, 'out', ?, ?, ?, ?, ?)`,
    [
      contactId,
      lineUserId,
      lineGroupId || null,
      messageText,
      mType,
      adminUsername,
      options?.mediaUrl || null,
      options?.quotedMessageId || null,
      options?.quotedText || null,
      options?.quotedSender || null,
    ]
  );
  await query(`UPDATE line_contacts SET last_message_at = NOW() WHERE id = ?`, [contactId]);
}

/**
 * Hapus / bersihkan reply token setelah dipakai agar tidak dikirim ulang
 */
export async function clearContactReplyToken(contactId: number): Promise<void> {
  await ensureTables();
  await query(
    `UPDATE line_contacts SET latest_reply_token = NULL, latest_reply_token_at = NULL, latest_reply_token_epoch = NULL WHERE id = ?`,
    [contactId]
  );
}

/**
 * Ambil daftar anggota grup yang pernah berbicara untuk autocomplete @mention
 */
export async function getGroupMembers(
  contactId: number
): Promise<Array<{ line_user_id: string; display_name: string }>> {
  await ensureTables();
  const sql = `
    SELECT line_user_id, MAX(display_name) AS display_name
    FROM line_chat_messages
    WHERE contact_id = ? AND direction = 'in' AND line_user_id IS NOT NULL AND line_user_id != ''
    GROUP BY line_user_id
    ORDER BY MAX(created_at) DESC
    LIMIT 100
  `;
  const rows = await query<any[]>(sql, [contactId]);
  return rows || [];
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
 * Kirim balasan array messages via LINE Reply Message API (GRATIS & TIDAK MENGURANGI KUOTA BULANAN)
 */
export async function sendLineReplyMessage(
  replyToken: string,
  messages: any[]
): Promise<{ ok: boolean; error?: string }> {
  const rawToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const channelAccessToken = rawToken.trim().replace(/^["']|["']$/g, "");

  if (!channelAccessToken) {
    return { ok: false, error: "LINE Channel Access Token belum dikonfigurasi" };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: messages.slice(0, 5), // Maksimal 5 pesan per request LINE
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("[LINE Reply Warning]:", response.status, errText);
      return { ok: false, error: `Reply error ${response.status}: ${errText}` };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[LINE Reply Error]:", err);
    return { ok: false, error: err?.message || "Gagal reply pesan" };
  }
}

/**
 * Kirim pesan chat LINE tingkat lanjut (Mendukung teks, kutipan, mention @user, dan foto/video)
 */
export async function sendLineChatMessage(
  to: string,
  payload: {
    messageText?: string;
    mediaUrl?: string | null;
    mediaType?: "image" | "video";
    previewUrl?: string | null;
    mentions?: Array<{ index: number; length: number; userId?: string; type?: "user" | "all" }>;
    quotedText?: string | null;
    quotedSender?: string | null;
  },
  replyToken?: string | null
): Promise<{ ok: boolean; error?: string; mode?: "reply" | "push" }> {
  const lineMessages: any[] = [];

  // 1. Lampiran Media (Gambar atau Video)
  if (payload.mediaUrl) {
    if (payload.mediaType === "video") {
      lineMessages.push({
        type: "video",
        originalContentUrl: payload.mediaUrl,
        previewImageUrl: payload.previewUrl || payload.mediaUrl,
      });
    } else {
      lineMessages.push({
        type: "image",
        originalContentUrl: payload.mediaUrl,
        previewImageUrl: payload.previewUrl || payload.mediaUrl,
      });
    }
  }

  // 2. Teks Pesan (dengan Mention jika ada, tanpa prefix kutipan bot yang kaku)
  if (payload.messageText && payload.messageText.trim()) {
    const fullText = payload.messageText.trim();
    const mentionees = payload.mentions ? [...payload.mentions] : [];

    const textMsg: any = {
      type: "text",
      text: fullText,
    };

    if (mentionees.length > 0) {
      textMsg.mention = {
        mentionees: mentionees.map((m) => {
          if (m.type === "all") {
            return { index: m.index, length: m.length, type: "all" };
          }
          return { index: m.index, length: m.length, userId: m.userId };
        }),
      };
    }

    lineMessages.push(textMsg);
  }

  if (lineMessages.length === 0) {
    return { ok: false, error: "Pesan atau media tidak boleh kosong" };
  }

  // A. Coba kirim via REPLY API terlebih dahulu (Gratis & Bebas Kuota / 429)
  if (replyToken) {
    const replyRes = await sendLineReplyMessage(replyToken, lineMessages);
    if (replyRes.ok) {
      return { ok: true, mode: "reply" };
    }
    console.log("[LINE] ReplyToken kadaluwarsa/tidak valid, mencoba Push Message API...");
  }

  // B. Fallback ke PUSH Message API
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
        messages: lineMessages.slice(0, 5),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[LINE Push Error]:", response.status, errText);

      if (response.status === 429) {
        return {
          ok: false,
          error:
            "LINE API Error 429: Batas kuota pesan bulanan LINE (500 push) telah tercapai untuk grup ini (180+ anggota). Silakan tunggu anggota grup mengirim pesan di LINE, lalu langsung balas dalam waktu 1 menit agar pesan terkirim GRATIS via Reply Token tanpa memotong kuota.",
        };
      }

      return { ok: false, error: `LINE API error: ${response.status}` };
    }

    return { ok: true, mode: "push" };
  } catch (err: any) {
    console.error("[LINE Push Error]:", err);
    return { ok: false, error: err?.message || "Gagal mengirim pesan" };
  }
}

/**
 * Backward compatibility: sendLineMessage sederhana
 */
export async function sendLineMessage(
  to: string,
  messageText: string,
  replyToken?: string | null
): Promise<{ ok: boolean; error?: string; mode?: "reply" | "push" }> {
  return sendLineChatMessage(to, { messageText }, replyToken);
}

/**
 * Ambil profil LINE user via API (dengan cache singkat)
 */
const _userProfileCache = new Map<string, { displayName: string; pictureUrl?: string; time: number }>();

export async function getLineProfile(
  userId: string,
  groupId?: string | null
): Promise<{ displayName: string; pictureUrl?: string } | null> {
  const cacheKey = `${groupId || "user"}_${userId}`;
  const cached = _userProfileCache.get(cacheKey);
  if (cached && Date.now() - cached.time < 3600000) {
    return cached;
  }

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
      const result = { displayName: data.displayName, pictureUrl: data.pictureUrl };
      _userProfileCache.set(cacheKey, { ...result, time: Date.now() });
      return result;
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
