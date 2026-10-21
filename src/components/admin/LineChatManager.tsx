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
  latest_reply_token?: string | null;
  latest_reply_token_at?: string | null;
  latest_reply_token_epoch?: number | string | null;
  has_reply_token?: boolean;
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
  message_type: string;
  media_url?: string | null;
  quoted_message_id?: number | null;
  quoted_text?: string | null;
  quoted_sender?: string | null;
  direction: "in" | "out";
  sent_by_admin: string | null;
  created_at: string;
}

interface GroupMember {
  line_user_id: string;
  display_name: string;
}

interface MentionItem {
  index: number;
  length: number;
  userId?: string;
  type?: "user" | "all";
}

interface ReplyingTo {
  id: number;
  displayName: string;
  text: string;
  lineUserId: string;
}

export default function LineChatManager() {
  const [contacts, setContacts] = useState<LineContact[]>([]);
  const [activeContact, setActiveContact] = useState<LineContact | null>(null);
  const [messages, setMessages] = useState<LineMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Fitur Reply / Kutipan
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);

  // Fitur Upload Media (Gambar / Video)
  const [selectedMedia, setSelectedMedia] = useState<{
    file: File;
    previewUrl: string;
    type: "image" | "video";
  } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Fitur Mention @user
  const [mentionListVisible, setMentionListVisible] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [trackedMentions, setTrackedMentions] = useState<
    Array<{ name: string; userId?: string; isAll?: boolean }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ambil daftar kontak
  const fetchContacts = async () => {
    try {
      const res = await fetch(`/api/admin/line-chat${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      if (data.status) {
        setContacts(data.contacts || []);
        if (activeContact) {
          const updatedActive = (data.contacts || []).find((c: LineContact) => c.id === activeContact.id);
          if (updatedActive) {
            setActiveContact(updatedActive);
          }
        }
      }
    } catch (err) {
      console.error("Fetch contacts error:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Ambil riwayat chat dan anggota grup
  const fetchMessages = async (contactId: number, autoScroll = true) => {
    try {
      const res = await fetch(`/api/admin/line-chat?contactId=${contactId}`);
      const data = await res.json();
      if (data.status) {
        setMessages(data.messages || []);
        if (data.members) {
          setMembers(data.members || []);
        }
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
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchContacts();
        if (activeContact) {
          fetchMessages(activeContact.id, false);
        }
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [activeContact, search]);

  const selectContact = async (contact: LineContact) => {
    setActiveContact(contact);
    setLoadingMessages(true);
    setFeedback(null);
    setReplyingTo(null);
    setSelectedMedia(null);
    await fetchMessages(contact.id, true);
    setLoadingMessages(false);
  };

  // Cek apakah reply token masih segar (< 65 detik)
  const isReplyTokenFresh = Boolean(
    activeContact?.latest_reply_token &&
      ((activeContact?.latest_reply_token_epoch &&
        Date.now() - Number(activeContact.latest_reply_token_epoch) < 65000) ||
        (!activeContact?.latest_reply_token_epoch && Boolean(activeContact?.latest_reply_token)))
  );

  // Tangani ketikan input teks (mendeteksi @ untuk mention)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart || 0;
    setInputText(val);
    setCursorPos(pos);

    // Cek apakah kursor berada setelah kata yang diawali '@'
    const textBeforeCursor = val.slice(0, pos);
    const lastWord = textBeforeCursor.split(/\s+/).pop() || "";

    if (lastWord.startsWith("@")) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setMentionListVisible(true);
    } else {
      setMentionListVisible(false);
    }
  };

  // Pilih anggota untuk di-mention
  const insertMention = (target: { name: string; userId?: string; isAll?: boolean }) => {
    const textBeforeCursor = inputText.slice(0, cursorPos);
    const textAfterCursor = inputText.slice(cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    words.pop(); // Hapus kata partial '@...'
    const newPrefix = words.length > 0 ? words.join(" ") + " " : "";
    const mentionTag = `@${target.name} `;
    const newText = newPrefix + mentionTag + textAfterCursor;

    setInputText(newText);
    setTrackedMentions((prev) => [...prev, target]);
    setMentionListVisible(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = (newPrefix + mentionTag).length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 50);
  };

  // Tangani pemilihan file media (Gambar / Video)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || "";
    const isVid = mime.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
    const isImg = mime.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

    if (!isVid && !isImg) {
      alert("Hanya format file gambar (JPG, PNG, WebP) atau video (MP4) yang didukung.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedMedia({
      file,
      previewUrl,
      type: isVid ? "video" : "image",
    });

    // Reset value input file agar file yang sama bisa dipilih lagi jika perlu
    e.target.value = "";
  };

  // Kirim pesan dari admin (teks, kutipan, mention, atau gambar/video)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeContact || sending || (!inputText.trim() && !selectedMedia)) return;

    setSending(true);
    setFeedback(null);

    let uploadedMediaUrl: string | null = null;
    let uploadedMediaType: "image" | "video" = "image";

    // 1. Jika ada lampiran media, unggah terlebih dahulu
    if (selectedMedia) {
      setUploadingMedia(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedMedia.file);

        const uploadRes = await fetch("/api/admin/line-chat/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.status) {
          setFeedback({
            text: uploadData.message || "Gagal mengunggah file media",
            type: "error",
          });
          setSending(false);
          setUploadingMedia(false);
          return;
        }

        uploadedMediaUrl = uploadData.url;
        uploadedMediaType = uploadData.mediaType;
      } catch (err) {
        console.error("Upload media error:", err);
        setFeedback({
          text: "Gagal mengunggah media ke server",
          type: "error",
        });
        setSending(false);
        setUploadingMedia(false);
        return;
      } finally {
        setUploadingMedia(false);
      }
    }

    // 2. Susun daftar mention LINE
    const textToSend = inputText.trim();
    const finalMentions: MentionItem[] = [];

    if (textToSend) {
      // Cari posisi @All
      const allRegex = /@All\b/gi;
      let mMatch;
      while ((mMatch = allRegex.exec(textToSend)) !== null) {
        finalMentions.push({
          index: mMatch.index,
          length: mMatch[0].length,
          type: "all",
        });
      }

      // Cari posisi nama member yang di-mention
      for (const tm of trackedMentions) {
        if (tm.isAll) continue;
        const tag = `@${tm.name}`;
        let startIdx = 0;
        while ((startIdx = textToSend.indexOf(tag, startIdx)) !== -1) {
          // Hindari duplikat index yang sama
          if (!finalMentions.some((fm) => fm.index === startIdx)) {
            finalMentions.push({
              index: startIdx,
              length: tag.length,
              userId: tm.userId,
              type: "user",
            });
          }
          startIdx += tag.length;
        }
      }
    }

    // 3. Kirim ke API backend
    try {
      const res = await fetch("/api/admin/line-chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: activeContact.id,
          messageText: textToSend,
          mediaUrl: uploadedMediaUrl,
          mediaType: uploadedMediaUrl ? uploadedMediaType : undefined,
          mentions: finalMentions.length > 0 ? finalMentions : undefined,
          quotedMessageId: replyingTo?.id || null,
          quotedText: replyingTo?.text || null,
          quotedSender: replyingTo?.displayName || null,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setFeedback({
          text: data.message || "Pesan terkirim!",
          type: "success",
        });
        setInputText("");
        setReplyingTo(null);
        setSelectedMedia(null);
        setTrackedMentions([]);
        await fetchMessages(activeContact.id, true);
        fetchContacts();
      } else {
        setFeedback({
          text: data.message || "Gagal mengirim pesan ke LINE",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Send message error:", err);
      setFeedback({
        text: "Terjadi kesalahan jaringan saat mengirim pesan",
        type: "error",
      });
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
    if (
      !confirm(
        `Bersihkan semua riwayat pesan dengan ${activeContact.display_name || "kontak ini"}? Pesan akan dihapus dari database.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/line-chat?contactId=${activeContact.id}&action=clear_chat`, {
        method: "DELETE",
      });
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
    if (
      !confirm(
        `Hapus kontak ${activeContact.display_name || "ini"} beserta seluruh percakapannya dari database?`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/line-chat?contactId=${activeContact.id}&action=delete_contact`, {
        method: "DELETE",
      });
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

  // Filter daftar mention berdasarkan teks yang sedang diketik
  const filteredMembers = members.filter((m) =>
    m.display_name.toLowerCase().includes(mentionQuery)
  );

  // Render teks pesan dengan highlight tag @mention
  const renderMessageContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@[a-zA-Z0-9_.\u{1F300}-\u{1F9FF}]+)/u);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className={styles.mentionTag}>
            {part}
          </span>
        );
      }
      return part;
    });
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
                <div className={styles.contactAvatar} style={{ width: 40, height: 40 }}>
                  {activeContact.picture_url ? (
                    <img src={activeContact.picture_url} alt="" />
                  ) : activeContact.source_type === "group" ? (
                    <i className="bx bx-group" />
                  ) : (
                    (activeContact.display_name || "L").charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={styles.headerTitle}>
                      {activeContact.display_name || "Pengguna LINE"}
                    </span>
                    {activeContact.source_type === "group" && (
                      <span className={styles.badgeGroup}>GRUP</span>
                    )}
                    {isReplyTokenFresh ? (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          backgroundColor: "#059669",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontWeight: 600,
                        }}
                        title="Pesan baru saja masuk. Balasan Anda akan terkirim GRATIS tanpa mengurangi kuota bulanan LINE!"
                      >
                        🟢 Siap Reply (Bebas Kuota)
                      </span>
                    ) : activeContact.source_type === "group" ? (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          backgroundColor: "#b45309",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontWeight: 600,
                        }}
                        title="Tidak ada reply token aktif. Pesan dikirim via Push (memotong kuota bulanan LINE)."
                      >
                        ⚡ Mode Push
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.headerSubtitle}>
                    {activeContact.source_type === "group"
                      ? `ID Grup: ${activeContact.line_group_id} • ${members.length} Anggota Aktif`
                      : `User ID: ${activeContact.line_user_id}`}
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

            {/* Riwayat Pesan (Tampil Semua di Layar) */}
            <div className={styles.messageHistory}>
              {loadingMessages ? (
                <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                  <i className="bx bx-loader-alt bx-spin" /> Memuat riwayat chat...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                  Belum ada riwayat pesan dalam obrolan ini.
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
                          <i className="bx bx-user" style={{ marginRight: 3 }} />
                          {m.display_name || "Anggota LINE"}
                        </div>
                      )}

                      {/* Tampilan Kutipan Pesan jika membalas pesan tertentu */}
                      {m.quoted_text && (
                        <div className={styles.msgQuoteBox}>
                          <div className={styles.msgQuoteSender}>
                            <i className="bx bx-reply" style={{ marginRight: 3 }} />
                            {m.quoted_sender || "Pesan"}
                          </div>
                          <div className={styles.msgQuoteText}>{m.quoted_text}</div>
                        </div>
                      )}

                      {/* Tampilan Media Gambar */}
                      {(m.media_url || (m.message_type === "image" && m.line_message_id)) && (
                        <img
                          src={
                            m.media_url ||
                            `/api/admin/line-chat/media-proxy?messageId=${m.line_message_id}`
                          }
                          alt="Lampiran Foto"
                          className={styles.msgMediaImage}
                          onClick={() =>
                            setLightboxImg(
                              m.media_url ||
                                `/api/admin/line-chat/media-proxy?messageId=${m.line_message_id}`
                            )
                          }
                          title="Klik untuk memperbesar gambar"
                          loading="lazy"
                        />
                      )}

                      {/* Tampilan Media Video */}
                      {(m.media_url || (m.message_type === "video" && m.line_message_id)) && (
                        <video
                          src={
                            m.media_url ||
                            `/api/admin/line-chat/media-proxy?messageId=${m.line_message_id}`
                          }
                          controls
                          className={styles.msgMediaVideo}
                        />
                      )}

                      {/* Teks Pesan */}
                      {m.message_text && !m.message_text.startsWith("[Gambar]") && !m.message_text.startsWith("[Video]") && (
                        <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                          {renderMessageContent(m.message_text)}
                        </div>
                      )}

                      {/* Metadata Pesan & Tombol Aksi */}
                      <div className={styles.msgMeta}>
                        <span>{formatTime(m.created_at)}</span>
                        {isOut && <i className="bx bx-check-double" title="Terkirim oleh Admin" />}

                        {/* Tombol Balas / Kutip Pesan */}
                        <button
                          type="button"
                          className={styles.btnReplyMsg}
                          onClick={() => {
                            setReplyingTo({
                              id: m.id,
                              displayName: m.display_name || (isOut ? "Admin" : "Anggota"),
                              text: m.message_text || "[Media]",
                              lineUserId: m.line_user_id,
                            });
                            textareaRef.current?.focus();
                          }}
                          title="Balas dan kutip pesan ini"
                        >
                          <i className="bx bx-reply" />
                        </button>

                        {/* Tombol Hapus Pesan */}
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

            {/* Notifikasi Feedback (Status Berhasil/Gagal) */}
            {feedback && (
              <div
                style={{
                  padding: "8px 16px",
                  fontSize: "0.82rem",
                  backgroundColor:
                    feedback.type === "success"
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  color: feedback.type === "success" ? "#34d399" : "#f87171",
                  borderTop: `1px solid ${
                    feedback.type === "success" ? "#059669" : "#dc2626"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <i
                    className={
                      feedback.type === "success"
                        ? "bx bx-check-circle"
                        : "bx bx-error-circle"
                    }
                    style={{ marginRight: 6 }}
                  />
                  {feedback.text}
                </span>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Bar Kutipan Pesan (Reply Banner) */}
            {replyingTo && (
              <div className={styles.replyBanner}>
                <div className={styles.replyBannerContent}>
                  <div className={styles.replyBannerTitle}>
                    <i className="bx bx-reply" /> Membalas @{replyingTo.displayName}
                  </div>
                  <div className={styles.replyBannerText}>{replyingTo.text}</div>
                </div>
                <button
                  type="button"
                  className={styles.btnCancelReply}
                  onClick={() => setReplyingTo(null)}
                  title="Batalkan kutipan"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Tray Preview Lampiran Media (Foto / Video) */}
            {selectedMedia && (
              <div className={styles.mediaPreviewTray}>
                <div className={styles.mediaPreviewThumb}>
                  {selectedMedia.type === "image" ? (
                    <img src={selectedMedia.previewUrl} alt="Preview" />
                  ) : (
                    <video src={selectedMedia.previewUrl} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: "0.82rem" }}>
                  <div style={{ fontWeight: 700, color: "var(--cv-text)" }}>
                    {selectedMedia.type === "image" ? "📷 Foto siap dikirim" : "🎥 Video siap dikirim"}
                  </div>
                  <div style={{ color: "var(--cv-text-mute)", fontSize: "0.75rem" }}>
                    {selectedMedia.file.name} ({(selectedMedia.file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.btnCancelReply}
                  onClick={() => setSelectedMedia(null)}
                  title="Batalkan lampiran"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Input Pesan, Attachment Button & Autocomplete @Mention */}
            <div style={{ position: "relative" }}>
              {/* Dropdown Autocomplete @Mention */}
              {mentionListVisible && (
                <div className={styles.mentionDropdown}>
                  <div
                    className={styles.mentionItem}
                    onClick={() => insertMention({ name: "All", isAll: true })}
                  >
                    <i className="bx bx-broadcast" style={{ color: "#38bdf8", fontSize: "1.1rem" }} />
                    <span className={`${styles.mentionItemName} ${styles.mentionItemAll}`}>
                      @All (Tag Seluruh Anggota Grup)
                    </span>
                  </div>
                  {filteredMembers.map((member) => (
                    <div
                      key={member.line_user_id}
                      className={styles.mentionItem}
                      onClick={() =>
                        insertMention({
                          name: member.display_name,
                          userId: member.line_user_id,
                        })
                      }
                    >
                      <i className="bx bx-user" style={{ color: "#a89a90" }} />
                      <span className={styles.mentionItemName}>@{member.display_name}</span>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <div style={{ padding: "8px 14px", color: "#888", fontSize: "0.8rem" }}>
                      Tidak ditemukan anggota yang cocok.
                    </div>
                  )}
                </div>
              )}

              {/* Tips Kuota */}
              <div style={{ padding: "6px 18px 2px", background: "var(--cv-ink, #0f0c0b)" }}>
                <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                  💡 <strong>Ketik @</strong> untuk tag anggota • Klik tombol 📎 untuk kirim Foto/Video • Balas saat ada chat (kurang dari 1 menit) untuk kirim <strong>Bebas Kuota</strong>.
                </div>
              </div>

              {/* Form Input Chat */}
              <form onSubmit={handleSendMessage} className={styles.msgInputArea}>
                {/* Input file tersembunyi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  onChange={handleFileSelect}
                />

                {/* Tombol Lampiran Media */}
                <button
                  type="button"
                  className={styles.btnAttach}
                  onClick={() => fileInputRef.current?.click()}
                  title="Lampirkan Gambar atau Video"
                >
                  <i className="bx bx-paperclip" />
                </button>

                {/* Textarea Input */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className={styles.msgInput}
                  placeholder={
                    selectedMedia
                      ? "Tambahkan keterangan (opsional)..."
                      : isReplyTokenFresh
                      ? "Ketik balasan gratis (ketik @ untuk tag)..."
                      : "Ketik pesan (ketik @ untuk tag)..."
                  }
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  disabled={sending || uploadingMedia || (!inputText.trim() && !selectedMedia)}
                  className={styles.btnSend}
                >
                  {sending || uploadingMedia ? (
                    <i className="bx bx-loader-alt bx-spin" />
                  ) : (
                    <>
                      <i className="bx bxs-paper-plane" /> Kirim
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <i className="bx bx-conversation" style={{ fontSize: "3.5rem", color: "var(--cv-orange)" }} />
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cv-text)" }}>
              LINE Bot Live Chat
            </div>
            <p style={{ maxWidth: 360, fontSize: "0.85rem", lineHeight: 1.5 }}>
              Pilih salah satu kontak atau grup dari daftar di sebelah kiri untuk melihat obrolan, mengutip pesan, mention anggota, dan mengirim foto/video langsung ke LINE.
            </p>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX GAMBAR FULLSCREEN ── */}
      {lightboxImg && (
        <div className={styles.lightboxBackdrop} onClick={() => setLightboxImg(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setLightboxImg(null)}
            >
              ✕
            </button>
            <img src={lightboxImg} alt="Preview Foto" />
          </div>
        </div>
      )}
    </div>
  );
}
