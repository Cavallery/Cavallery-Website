"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import defaultAnnouncementsData from "@/data/discord-announcements.json";

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

const REACTION_CONFIG = [
  { id: "heart", icon: "bx bxs-heart", color: "#e11d48", defaultCount: 172 },
  { id: "star", icon: "bx bxs-star", color: "#eab308", defaultCount: 148 },
  { id: "party", icon: "bx bxs-party", color: "#a855f7", defaultCount: 120 },
  { id: "like", icon: "bx bxs-like", color: "#3b82f6", defaultCount: 114 },
  { id: "flame", icon: "bx bxs-flame", color: "#f97316", defaultCount: 96 },
];

export default function DiscordAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    defaultAnnouncementsData as Announcement[]
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMention, setSelectedMention] = useState<string>("semua");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [userReactions, setUserReactions] = useState<Record<string, Record<string, number>>>({
    "sts-terima-kasih-2026": { heart: 172, star: 148, party: 120, like: 114 },
    "sts-project-launch-2026": { heart: 165, star: 134, flame: 142, party: 110 },
    "sts-rapat-koordinasi-2026": { like: 104, star: 88, flame: 67 },
    "transparansi-dana-rh-2026": { heart: 156, star: 112, like: 98 },
  });
  const [myClickedReactions, setMyClickedReactions] = useState<Record<string, string[]>>({});

  // ── Fetch pengumuman terbaru dari /api/discord (Sinkron dengan Dashboard Admin) ──
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/discord");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setAnnouncements(json.data);
      }
    } catch (e) {
      console.error("[Discord Internal] Gagal memuat pengumuman terbaru:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchMention =
        selectedMention === "semua" ||
        item.mention.toLowerCase().includes(selectedMention.toLowerCase());
      if (!matchMention) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchContent = (item.content || "").toLowerCase().includes(q);
      const matchAuthor = (item.author?.name || "").toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchContent || matchAuthor || matchTags;
    });
  }, [announcements, search, selectedMention]);

  const handleToggleReaction = (announcementId: string, reactionId: string) => {
    const currentMy = myClickedReactions[announcementId] || [];
    const hasClicked = currentMy.includes(reactionId);

    setMyClickedReactions((prev) => ({
      ...prev,
      [announcementId]: hasClicked
        ? (prev[announcementId] || []).filter((e) => e !== reactionId)
        : [...(prev[announcementId] || []), reactionId],
    }));

    setUserReactions((prev) => {
      const annMap = { ...(prev[announcementId] || {}) };
      const currentCount = annMap[reactionId] || 0;
      annMap[reactionId] = hasClicked ? Math.max(0, currentCount - 1) : currentCount + 1;
      return { ...prev, [announcementId]: annMap };
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
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
                color: "var(--cv-orange)",
                background: "var(--cv-orange-soft)",
                padding: "4px 12px",
                borderRadius: 8,
                border: "1px solid var(--cv-orange-line)",
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
              <i className="bx bx-broadcast" style={{ color: "var(--gold)" }} />
              Pengumuman Resmi Discord Cavallery
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--fg-muted)",
                lineHeight: 1.5,
              }}
            >
              Salinan arsip resmi pengumuman dari server Discord Fanbase. Memudahkan seluruh anggota
              dan kawan-kawan Cavallery memantau info penting tanpa harus selalu membuka Discord.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={fetchAnnouncements}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "8px 14px",
                borderRadius: 10,
                background: "var(--surface)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Segarkan pengumuman terbaru"
            >
              <i className={`bx bx-refresh ${loading ? "bx-spin" : ""}`} style={{ fontSize: "1.1rem", color: "#5865F2" }} />
              {loading ? "Memuat..." : "Segarkan"}
            </button>

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
                background: "color-mix(in srgb, var(--cv-orange) 12%, transparent)",
                color: "var(--gold)",
                border: "1px solid color-mix(in srgb, var(--cv-orange) 30%, transparent)",
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
            border: "1px solid var(--cv-line)",
            borderBottom: "1px solid var(--cv-line)",
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
              <i className="bx bxs-megaphone" style={{ color: "#5865F2", fontSize: "1.15rem" }} />
              <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.01em" }}>
                pengumuman-fanbase
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
            border: "1px solid var(--cv-line)",
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
                        ? "var(--cv-orange)"
                        : "var(--gold)"
                      : "#2b2d31",
                  color:
                    selectedMention === tab.id
                      ? tab.id === "@everyone"
                        ? "#fff"
                        : "var(--cv-on-orange)"
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
                border: "1px solid var(--cv-line)",
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
                border: "1px dashed var(--cv-line)",
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
                    border: "1px solid var(--cv-line)",
                    padding: "20px 22px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Left Discord Line Indicator */}
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
                          ? "var(--cv-orange)"
                          : "var(--gold)",
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
                        src={item.author?.avatar || "/images/cava-logo-round.png"}
                        alt={item.author?.name || "Admin"}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid var(--cv-line)",
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
                            {item.author?.name || "Cavallery Official"}
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
                            {item.author?.role || "ADMIN"}
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
                          <span>
                            <i className="bx bxs-megaphone" style={{ fontSize: "0.8rem", marginRight: 3, verticalAlign: "middle" }} />
                            #{item.channel || "pengumuman-fanbase"}
                          </span>
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
                              : "color-mix(in srgb, var(--cv-orange) 20%, transparent)",
                          color:
                            item.mention === "@everyone" ? "#c9cdfb" : "var(--cv-orange-hi)",
                          border:
                            item.mention === "@everyone"
                              ? "1px solid rgba(88, 101, 242, 0.4)"
                              : "1px solid color-mix(in srgb, var(--cv-orange) 40%, transparent)",
                        }}
                      >
                        <i className="bx bx-at" />
                        {(item.mention || "@everyone").replace("@", "")}
                      </span>
                    </div>
                  </div>

                  {/* Judul Pengumuman */}
                  <h2
                    style={{
                      fontSize: "1.22rem",
                      fontWeight: 800,
                      color: "var(--gold)",
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
                            border: "1px solid var(--cv-line)",
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
                              border: "1px solid var(--cv-line)",
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

                  {/* Tags & Reaksi Boxicons Discord */}
                  <div
                    style={{
                      borderTop: "1px solid var(--cv-line)",
                      paddingTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    {/* Reaksi Boxicon (Bukan unicode emoji) */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {REACTION_CONFIG.map((rc) => {
                        const count = reactions[rc.id] ?? rc.defaultCount;
                        const isClicked = myReactions.includes(rc.id);

                        return (
                          <button
                            key={rc.id}
                            type="button"
                            onClick={() => handleToggleReaction(item.id, rc.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 10px",
                              borderRadius: 8,
                              border: isClicked
                                ? "1.5px solid #5865F2"
                                : "1px solid var(--cv-line)",
                              background: isClicked ? "rgba(88, 101, 242, 0.2)" : "#2b2d31",
                              color: isClicked ? "#c9cdfb" : "#dbdee1",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <i className={rc.icon} style={{ color: rc.color, fontSize: "1rem" }} />
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
                              background: "color-mix(in srgb, var(--cv-bone) 5%, transparent)",
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

        {/* ── FOOTER DOKUMEN (Tanpa Caterine Vallencia Fanbase © 2026) ── */}
        <div
          style={{
            marginTop: 32,
            padding: "16px 20px",
            background: "#2b2d31",
            borderRadius: 14,
            border: "1px solid var(--cv-line)",
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
          <span>Arsip Pengumuman Discord Resmi Cavallery</span>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL: FULL PREVIEW GAMBAR ── */}
      {activeImage && (
        <div
          className="cv-dark"
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
                  background: "color-mix(in srgb, var(--cv-bone) 15%, transparent)",
                  border: "none",
                  color: "var(--cv-text)",
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
                <i className="bx bx-x" />
              </button>
            </div>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--cv-line-strong)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                background: "var(--cv-ink)",
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
