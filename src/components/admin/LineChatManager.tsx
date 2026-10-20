"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./LineChatManager.module.css";

interface LineContact {
  id: number;
  line_user_id: string;
  line_group_id: string | null;
  display_name: string | null;
  picture_url: string | null;
  source_type: "user" | "group" | "room";
  last_message_at: string | null;
  unread_count?: number;
  last_message?: string;
}

interface LineMessage {
  id: number;
  contact_id: number;
  line_user_id: string;
  line_group_id: string | null;
  display_name: string | null;
  message_text: string;
  direction: "in" | "out";
  sent_by_admin: string | null;
  created_at: string;
}

export default function LineChatManager() {
  const [contacts, setContacts] = useState<LineContact[]>([]);
  const [activeContact, setActiveContact] = useState<LineContact | null>(null);
  const [messages, setMessages] = useState<LineMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ambil daftar kontak
  const fetchContacts = async () => {
    try {
      const res = await fetch(`/api/admin/line-chat${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      if (data.status) {
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error("Fetch contacts error:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Ambil riwayat chat kontak aktif
  const fetchMessages = async (contactId: number, autoScroll = true) => {
    try {
      const res = await fetch(`/api/admin/line-chat?contactId=${contactId}`);
      const data = await res.json();
      if (data.status) {
        setMessages(data.messages || []);
        if (autoScroll) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(() => {
      // Hanya polling jika tab browser sedang aktif dibuka untuk menghemat resource
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchContacts();
        if (activeContact) {
          fetchMessages(activeContact.id, false);
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [activeContact, search]);

  const selectContact = async (contact: LineContact) => {
    setActiveContact(contact);
    setLoadingMessages(true);
    await fetchMessages(contact.id, true);
    setLoadingMessages(false);
  };

  // Kirim pesan dari admin
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeContact || !inputText.trim() || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText("");

    try {
      const res = await fetch("/api/admin/line-chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: activeContact.id,
          messageText: textToSend,
        }),
      });
      const data = await res.json();
      if (data.status) {
        await fetchMessages(activeContact.id, true);
        fetchContacts();
      } else {
        alert(data.message || "Gagal mengirim pesan ke LINE");
        setInputText(textToSend); // Kembalikan teks jika gagal
      }
    } catch (err) {
      console.error("Send message error:", err);
      alert("Terjadi kesalahan saat mengirim pesan");
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  // Hapus 1 pesan
  const handleDeleteMessage = async (msgId: number) => {
    if (!confirm("Hapus pesan ini dari database?")) return;
    try {
      const res = await fetch(`/api/admin/line-chat?messageId=${msgId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      } else {
        alert(data.message || "Gagal menghapus pesan");
      }
    } catch {
      alert("Terjadi kesalahan");
    }
  };

  // Bersihkan riwayat chat kontak (Clear Chat)
  const handleClearChat = async () => {
    if (!activeContact) return;
    if (!confirm(`Bersihkan semua riwayat pesan dengan ${activeContact.display_name || "kontak ini"}? Pesan akan dihapus dari database.`)) return;
    try {
      const res = await fetch(`/api/admin/line-chat?contactId=${activeContact.id}&action=clear_chat`, { method: "DELETE" });
      const data = await res.json();
      if (data.status) {
        setMessages([]);
        fetchContacts();
      } else {
        alert(data.message || "Gagal membersihkan riwayat pesan");
      }
    } catch {
      alert("Terjadi kesalahan");
    }
  };

  // Hapus kontak beserta pesannya
  const handleDeleteContact = async () => {
    if (!activeContact) return;
    if (!confirm(`Hapus kontak ${activeContact.display_name || "ini"} beserta seluruh percakapannya dari database?`)) return;
    try {
      const res = await fetch(`/api/admin/line-chat?contactId=${activeContact.id}&action=delete_contact`, { method: "DELETE" });
      const data = await res.json();
      if (data.status) {
        setActiveContact(null);
        setMessages([]);
        fetchContacts();
      } else {
        alert(data.message || "Gagal menghapus kontak");
      }
    } catch {
      alert("Terjadi kesalahan");
    }
  };

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* ── SIDEBAR KONTAK ── */}
      <div className={styles.contactSidebar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari kontak / grup..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.contactList}>
          {loadingContacts ? (
            <div style={{ padding: 20, textAlign: "center", color: "#888", fontSize: "0.85rem" }}>
              <i className="bx bx-loader-alt bx-spin" /> Memuat obrolan...
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: "0.85rem" }}>
              Belum ada percakapan LINE yang masuk.
            </div>
          ) : (
            contacts.map((c) => {
              const isActive = activeContact?.id === c.id;
              const isGroup = c.source_type === "group" || c.source_type === "room";
              return (
                <div
                  key={c.id}
                  className={`${styles.contactItem} ${isActive ? styles.contactActive : ""}`}
                  onClick={() => selectContact(c)}
                >
                  <div className={styles.contactAvatar}>
                    {c.picture_url ? (
                      <img src={c.picture_url} alt={c.display_name || "LINE User"} />
                    ) : isGroup ? (
                      <i className="bx bx-group" />
                    ) : (
                      (c.display_name || "L").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactNameRow}>
                      <span className={styles.contactName}>
                        {c.display_name || (isGroup ? "Grup LINE" : "Pengguna LINE")}
                      </span>
                      <span className={styles.contactTime}>{formatTime(c.last_message_at)}</span>
                    </div>
                    <div className={styles.contactLastMsg}>
                      {isGroup && <span className={styles.badgeGroup}>GRUP</span>}
                      <span>{c.last_message || "Belum ada pesan"}</span>
                      {Number(c.unread_count || 0) > 0 && (
                        <span className={styles.badgeUnread}>{c.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div className={styles.chatArea}>
        {activeContact ? (
          <>
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <div className={styles.contactAvatar} style={{ width: 36, height: 36 }}>
                  {activeContact.picture_url ? (
                    <img src={activeContact.picture_url} alt="" />
                  ) : activeContact.source_type === "group" ? (
                    <i className="bx bx-group" />
                  ) : (
                    (activeContact.display_name || "L").charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className={styles.headerTitle}>
                    {activeContact.display_name || "Pengguna LINE"}
                  </div>
                  <div className={styles.headerSubtitle}>
                    {activeContact.source_type === "group"
                      ? `Grup ID: ${activeContact.line_group_id?.slice(0, 15)}...`
                      : `User ID: ${activeContact.line_user_id?.slice(0, 15)}...`}
                  </div>
                </div>
              </div>

              {/* Opsi Tombol Hapus Chat & Kontak */}
              <div className={styles.headerActions}>
                <button
                  type="button"
                  className={styles.btnActionClear}
                  onClick={handleClearChat}
                  title="Bersihkan seluruh pesan obrolan ini"
                >
                  <i className="bx bx-trash" /> Bersihkan Chat
                </button>
                <button
                  type="button"
                  className={styles.btnActionDeleteContact}
                  onClick={handleDeleteContact}
                  title="Hapus kontak dari daftar obrolan"
                >
                  <i className="bx bx-user-x" /> Hapus Kontak
                </button>
              </div>
            </div>

            {/* Riwayat Pesan */}
            <div className={styles.messageHistory}>
              {loadingMessages ? (
                <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                  <i className="bx bx-loader-alt bx-spin" /> Memuat pesan...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                  Belum ada riwayat pesan dengan kontak ini.
                </div>
              ) : (
                messages.map((m) => {
                  const isOut = m.direction === "out";
                  return (
                    <div
                      key={m.id}
                      className={`${styles.msgBubble} ${isOut ? styles.msgOut : styles.msgIn}`}
                    >
                      {!isOut && (
                        <div className={styles.msgSenderName}>
                          {m.display_name || "Pengguna LINE"}
                        </div>
                      )}
                      <div>{m.message_text}</div>
                      <div className={styles.msgMeta}>
                        <span>{formatTime(m.created_at)}</span>
                        {isOut && <i className="bx bx-check-double" />}
                        <button
                          type="button"
                          className={styles.btnDeleteMsg}
                          onClick={() => handleDeleteMessage(m.id)}
                          title="Hapus pesan ini dari database"
                        >
                          <i className="bx bx-trash" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Pesan */}
            <form onSubmit={handleSendMessage} className={styles.msgInputArea}>
              <textarea
                rows={1}
                className={styles.msgInput}
                placeholder="Ketik balasan untuk pengguna / grup LINE..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className={styles.btnSend}
              >
                {sending ? (
                  <i className="bx bx-loader-alt bx-spin" />
                ) : (
                  <>
                    <i className="bx bxs-paper-plane" /> Kirim
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.emptyState}>
            <i className="bx bx-conversation" style={{ fontSize: "3.5rem", color: "var(--cv-orange)" }} />
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cv-text)" }}>
              LINE Bot Live Chat
            </div>
            <p style={{ maxWidth: 360, fontSize: "0.85rem", lineHeight: 1.5 }}>
              Pilih salah satu kontak atau grup dari daftar di sebelah kiri untuk melihat pesan dan membalas langsung dari dashboard admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
