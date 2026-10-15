"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import announcementsData from "@/data/discord-announcements.json";

interface Announcement {
  id: string;
  title: string;
  date: string;
  timestamp: string;
  mention: string;
  channel: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    bot?: boolean;
  };
  image?: string;
  additionalImages?: string[];
  content: string;
  tags?: string[];
}

export default function DiscordAnnouncementsPage() {
  const [search, setSearch] = useState("");
  const [selectedMention, setSelectedMention] = useState<string>("semua");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, Record<string, number>>>({
    "sts-terima-kasih-2026": { "🐴": 148, "❤️": 172, "✨": 120, "🎉": 96 },
    "sts-project-launch-2026": { "🐴": 134, "🔥": 165, "✨": 110, "🎂": 142 },
    "sts-rapat-koordinasi-2026": { "🫡": 88, "✅": 104, "📢": 67 },
    "transparansi-dana-rh-2026": { "🙏": 156, "💎": 98, "📊": 112 },
  });
  const [myClickedReactions, setMyClickedReactions] = useState<Record<string, string[]>>({});

  const announcements: Announcement[] = announcementsData as Announcement[];

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchMention =
        selectedMention === "semua" ||
        item.mention.toLowerCase().includes(selectedMention.toLowerCase());
      if (!matchMention) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      const matchAuthor = item.author.name.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchContent || matchAuthor || matchTags;
    });
  }, [announcements, search, selectedMention]);

  const handleToggleReaction = (announcementId: string, emoji: string) => {
    const currentMy = myClickedReactions[announcementId] || [];
    const hasClicked = currentMy.includes(emoji);

    setMyClickedReactions((prev) => ({
      ...prev,
      [announcementId]: hasClicked
        ? (prev[announcementId] || []).filter((e) => e !== emoji)
        : [...(prev[announcementId] || []), emoji],
    }));

    setUserReactions((prev) => {
      const annMap = { ...(prev[announcementId] || {}) };
      const currentCount = annMap[emoji] || 0;
      annMap[emoji] = hasClicked ? Math.max(0, currentCount - 1) : currentCount + 1;
      return { ...prev, [announcementId]: annMap };
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg, #0f1015)",
        color: "var(--fg, #f1f5f9)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        paddingTop: "calc(var(--nav-h, 72px) + 24px)",
        paddingBottom: 60,
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {/* ── TOP HEADER / BREADCRUMB ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#5865F2",
                background: "rgba(88, 101, 242, 0.12)",
                padding: "4px 12px",
                borderRadius: 8,
                border: "1px solid rgba(88, 101, 242, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <i className="bx bxl-discord-alt" style={{ fontSize: "1rem" }} />
              Discord Archive · Cavallery Fanbase
            </div>
            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                margin: "0 0 6px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <i className="bx bx-broadcast" style={{ color: "var(--gold, #c9a84c)" }} />
              Pengumuman Resmi Discord Cavallery
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--fg-muted, #94a3b8)",
                lineHeight: 1.5,
              }}
            >
              Salinan arsip resmi pengumuman dari server Discord Fanbase. Memudahkan seluruh anggota
              dan kawan-kawan Cavallery memantau info penting tanpa harus selalu membuka Discord.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/internal/iuran-kas-xv7r2q"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(201, 168, 76, 0.12)",
                color: "var(--gold, #c9a84c)",
                border: "1px solid rgba(201, 168, 76, 0.3)",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <i className="bx bx-spreadsheet" style={{ fontSize: "1.05rem" }} />
              Halaman Kas Internal ↗
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* ── DISCORD CHANNEL MOCKUP HEADER BAR ── */}
        <div
          style={{
            background: "#2b2d31",
            color: "#f2f3f5",
            borderRadius: "14px 14px 0 0",
            padding: "14px 20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: "1.3rem",
                color: "#949ba4",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              #
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.01em" }}>
                📢┃pengumuman-fanbase
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  background: "rgba(88, 101, 242, 0.25)",
                  color: "#c9cdfb",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <i className="bx bxs-pin" style={{ fontSize: "0.75rem" }} />
                Pinned Channel
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: "0.78rem",
              color: "#949ba4",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#23a55a",
                  display: "inline-block",
                }}
              />
              Official Server
            </span>
            <span>·</span>
            <span>{filteredAnnouncements.length} Pengumuman Tersimpan</span>
          </div>
        </div>

        {/* ── TOOLBAR FILTER & SEARCH ── */}
        <div
          style={{
            background: "#1e1f22",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderTop: "none",
            borderRadius: "0 0 14px 14px",
            padding: "12px 18px",
            marginBottom: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "#949ba4", fontWeight: 700 }}>
              Filter Mention:
            </span>
            {[
              { id: "semua", label: "Semua" },
              { id: "@everyone", label: "@everyone" },
              { id: "@here", label: "@here" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedMention(tab.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    selectedMention === tab.id
                      ? tab.id === "@everyone"
                        ? "#5865F2"
                        : tab.id === "@here"
                        ? "#eab308"
                        : "var(--gold, #c9a84c)"
                      : "#2b2d31",
                  color:
                    selectedMention === tab.id
                      ? tab.id === "@here"
                        ? "#000"
                        : "#fff"
                      : "#dbdee1",
                  fontWeight: selectedMention === tab.id ? 800 : 600,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", minWidth: 220, maxWidth: 300, flex: 1 }}>
            <i
              className="bx bx-search"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#949ba4",
                fontSize: "1rem",
              }}
            />
            <input
              type="text"
              placeholder="Cari kata kunci / judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 12px 7px 32px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#2b2d31",
                color: "#f2f3f5",
                fontSize: "0.82rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* ── LIST PENGUMUMAN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {filteredAnnouncements.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#2b2d31",
                borderRadius: 14,
                color: "#949ba4",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <i className="bx bx-message-rounded-x" style={{ fontSize: "2.8rem", opacity: 0.5, marginBottom: 10, display: "block" }} />
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f2f3f5" }}>
                Pengumuman Tidak Ditemukan
              </div>
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
                Tidak ada pesan pengumuman yang cocok dengan pencarian &quot;{search}&quot;.
              </div>
            </div>
          ) : (
            filteredAnnouncements.map((item) => {
              const reactions = userReactions[item.id] || {};
              const myReactions = myClickedReactions[item.id] || [];

              return (
                <div
                  key={item.id}
                  style={{
                    background: "#313338",
                    borderRadius: 14,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "20px 22px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Left Discord Amber/Blurple Line Indicator */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background:
                        item.mention === "@everyone"
                          ? "#5865F2"
                          : item.mention === "@here"
                          ? "#eab308"
                          : "var(--gold, #c9a84c)",
                    }}
                  />

                  {/* Header Pengirim */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={item.author.avatar || "/images/cava-logo-round.png"}
                        alt={item.author.name}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid rgba(255, 255, 255, 0.1)",
                        }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: "0.98rem",
                              color: "#f2f3f5",
                            }}
                          >
                            {item.author.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              background: "#5865F2",
                              color: "#fff",
                              padding: "2px 6px",
                              borderRadius: 4,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {item.author.role || "ADMIN"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#949ba4",
                            marginTop: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <i className="bx bx-calendar" style={{ fontSize: "0.85rem" }} />
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>in #{item.channel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mention Badge */}
                    <div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 6,
                          background:
                            item.mention === "@everyone"
                              ? "rgba(88, 101, 242, 0.2)"
                              : "rgba(234, 179, 8, 0.2)",
                          color:
                            item.mention === "@everyone" ? "#c9cdfb" : "#fef08a",
                          border:
                            item.mention === "@everyone"
                              ? "1px solid rgba(88, 101, 242, 0.4)"
                              : "1px solid rgba(234, 179, 8, 0.4)",
                        }}
                      >
                        <i className="bx bx-at" />
                        {item.mention.replace("@", "")}
                      </span>
                    </div>
                  </div>

                  {/* Judul Pengumuman */}
                  <h2
                    style={{
                      fontSize: "1.22rem",
                      fontWeight: 800,
                      color: "var(--gold, #fcd34d)",
                      margin: "0 0 12px",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </h2>

                  {/* Isi Pengumuman */}
                  <div
                    style={{
                      color: "#dbdee1",
                      fontSize: "0.92rem",
                      lineHeight: 1.65,
                      whiteSpace: "pre-line",
                      marginBottom: 16,
                    }}
                  >
                    {item.content}
                  </div>

                  {/* Gambar Terlampir */}
                  {item.image && (
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#949ba4",
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <i className="bx bx-image" style={{ fontSize: "0.95rem" }} />
                        Lampiran Gambar (Klik untuk memperbesar)
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div
                          onClick={() => setActiveImage(item.image || null)}
                          style={{
                            maxWidth: 420,
                            maxHeight: 280,
                            borderRadius: 10,
                            overflow: "hidden",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            cursor: "pointer",
                            background: "#1e1f22",
                            position: "relative",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                            transition: "transform 0.15s ease",
                          }}
                          title="Klik untuk melihat resolusi penuh"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </div>

                        {item.additionalImages?.map((addImg, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveImage(addImg)}
                            style={{
                              maxWidth: 160,
                              maxHeight: 160,
                              borderRadius: 10,
                              overflow: "hidden",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              cursor: "pointer",
                              background: "#1e1f22",
                              position: "relative",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }}
                            title="Klik untuk melihat resolusi penuh"
                          >
                            <img
                              src={addImg}
                              alt={`${item.title} - ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags & Reaksi Interaktif Discord */}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      paddingTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    {/* Emoji Reactions */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Object.entries(reactions).map(([emoji, count]) => {
                        const isClicked = myReactions.includes(emoji);
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(item.id, emoji)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 9px",
                              borderRadius: 8,
                              border: isClicked
                                ? "1.5px solid #5865F2"
                                : "1px solid rgba(255, 255, 255, 0.1)",
                              background: isClicked ? "rgba(88, 101, 242, 0.2)" : "#2b2d31",
                              color: isClicked ? "#c9cdfb" : "#dbdee1",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <span>{emoji}</span>
                            <span>{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: "0.72rem",
                              color: "#949ba4",
                              background: "rgba(255, 255, 255, 0.05)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── FOOTER DOKUMEN ── */}
        <div
          style={{
            marginTop: 32,
            padding: "16px 20px",
            background: "#2b2d31",
            borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "0.8rem",
            color: "#949ba4",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <i className="bx bxl-discord" style={{ color: "#5865F2", fontSize: "1.2rem" }} />
          <span>
            Arsip Pengumuman Discord Resmi Cavallery · Caterine Vallencia Fanbase © {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL: FULL PREVIEW GAMBAR ── */}
      {activeImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 20,
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setActiveImage(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 820,
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.2rem",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={activeImage}
                alt="Lampiran Pengumuman"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
