"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  time: string;
  source?: "gemini" | "rules";
}

const DEFAULT_SUGGESTIONS = [
  "Siapa itu Erine JKT48?",
  "Ceritain projek Blue Rose Cavallery!",
  "Apa saja setlist teater yang pernah dibawakan Erine?",
  "Kapan Erine dipromosikan ke Team Passion?",
  "Berapa peringkat Erine di SSK 2024?",
  "Apa makanan dan hewan favorit Erine?",
  "Apa maskot resmi Cavallery?",
  "Apa hestek spesial #DiesVenErine dan #MemoRine?",
  "Di MV apa saja Erine pernah tampil?",
  "Bagaimana cara gabung ke fanbase Cavallery?"
];

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function AIJenderalPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiActive, setApiActive] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check API health and load suggestions on mount
  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setApiActive(Boolean(data.api_active ?? true));
            if (Array.isArray(data.suggested_questions) && data.suggested_questions.length > 0) {
              setSuggestions(data.suggested_questions);
            }
          }
        } else {
          if (isMounted) setApiActive(false);
        }
      } catch {
        if (isMounted) setApiActive(true); // default to true if pinged local rules
      }
    };

    checkApi();
    return () => { isMounted = false; };
  }, []);

  // Set initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome_msg",
        role: "bot",
        text: "Hai Bub! Aku Jenderal Cavallery 👋\nAsisten cerdas & sahabat resmi Fanbase Erine JKT48. Mau tanya seputar biodata Erine, jadwal teater, projek Blue Rose, lagu-lagunya, atau sekadar cerita? Yuk ngobrol!",
        time: formatCurrentTime(),
      },
    ]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: "usr_" + Date.now(),
      role: "user",
      text: query,
      time: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    // Build history for multi-turn chat context
    const history = messages
      .filter((m) => m.id !== "welcome_msg")
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        text: m.text,
      }));
    history.push({ role: "user", text: query });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history }),
        signal: AbortSignal.timeout(16000),
      });

      if (res.ok) {
        const data = await res.json();
        setApiActive(true);
        const replyText = data.reply || "Waduh, aku bingung mau jawab apa nih. Coba tanyakan hal lain seputar Erine ya!";
        setMessages((prev) => [
          ...prev,
          {
            id: "bot_" + Date.now(),
            role: "bot",
            text: replyText,
            time: formatCurrentTime(),
            source: data.source,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "bot_err_" + Date.now(),
            role: "bot",
            text: "Maaf ya kak, koneksi AI sedang sibuk. Tapi kamu bisa coba lagi dalam beberapa detik!",
            time: formatCurrentTime(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot_catch_" + Date.now(),
          role: "bot",
          text: "Waduh sinyal agak terganggu nih. Coba kirim lagi pertanyaannya ya Bub!",
          time: formatCurrentTime(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome_reset",
        role: "bot",
        text: "Percakapan telah direset. Mau tanya apa lagi tentang Erine atau projek Cavallery, Bub?",
        time: formatCurrentTime(),
      },
    ]);
    setShowSuggestions(true);
  };

  return (
    <div style={inlineStyles.pageRoot}>
      {/* BACKGROUND DECORATIVE GLOW */}
      <div style={inlineStyles.bgGlow1} />
      <div style={inlineStyles.bgGlow2} />

      {/* TOP HEADER */}
      <header style={inlineStyles.header}>
        <div style={inlineStyles.headerInner}>
          <div style={inlineStyles.headerLeft}>
            <div style={inlineStyles.avatarBox}>
              {/* Bot Avatar Icon */}
              <div style={inlineStyles.avatarCircle}>
                <img
                  src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
                  alt="Jenderal Bot"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/cava-logo-round.png";
                  }}
                />
              </div>
              {/* Green indicator: Active API */}
              <span
                style={{
                  ...inlineStyles.greenDot,
                  backgroundColor: apiActive === false ? "#ef4444" : "#22c55e",
                  boxShadow: apiActive === false ? "0 0 8px #ef4444" : "0 0 10px #22c55e, 0 0 2px #16a34a",
                }}
                title={apiActive === false ? "API Offline" : "API Aktif (Online)"}
              />
            </div>

            <div>
              <div style={inlineStyles.titleRow}>
                <h1 style={inlineStyles.headerTitle}>Jenderal Cavallery AI</h1>
                <span
                  style={{
                    ...inlineStyles.statusPill,
                    backgroundColor: apiActive === false ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                    color: apiActive === false ? "#ef4444" : "#16a34a",
                    borderColor: apiActive === false ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.4)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: apiActive === false ? "#ef4444" : "#22c55e",
                      marginRight: 5,
                    }}
                  />
                  {apiActive === false ? "Offline" : "API Aktif"}
                </span>
              </div>
              <p style={inlineStyles.headerSubtitle}>
                Official AI Assistant · Fanbase Catherina Vallencia (Erine JKT48)
              </p>
            </div>
          </div>

          <div style={inlineStyles.headerRight}>
            <button
              onClick={handleResetChat}
              style={inlineStyles.headerBtn}
              title="Mulai obrolan baru"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
              </svg>
              <span>Reset Chat</span>
            </button>
            <Link href="/" style={inlineStyles.homeLink}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* CHAT CONTAINER */}
      <main style={inlineStyles.mainContainer}>
        {/* MESSAGES LIST */}
        <div style={inlineStyles.messagesBox}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...inlineStyles.messageRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "bot" && (
                <div style={inlineStyles.botAvatarSmall}>
                  <img
                    src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
                    alt="Jenderal"
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/cava-logo-round.png";
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  ...inlineStyles.bubble,
                  ...(msg.role === "user" ? inlineStyles.userBubble : inlineStyles.botBubble),
                }}
              >
                <div style={inlineStyles.bubbleContent}>
                  {msg.text.split("\n").map((line, idx) => (
                    <p key={idx} style={{ margin: "4px 0", lineHeight: 1.55 }}>
                      {line}
                    </p>
                  ))}
                </div>
                <div
                  style={{
                    ...inlineStyles.bubbleMeta,
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <span style={inlineStyles.timeText}>{msg.time}</span>
                  {msg.source === "gemini" && (
                    <span style={inlineStyles.sourceBadge}>AI Gemini</span>
                  )}
                  {msg.source === "rules" && (
                    <span style={inlineStyles.sourceBadge}>Knowledge Base</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* LOADING TYPING INDICATOR */}
          {loading && (
            <div style={{ ...inlineStyles.messageRow, justifyContent: "flex-start" }}>
              <div style={inlineStyles.botAvatarSmall}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <rect x="3" y="8" width="18" height="12" rx="4" />
                  <circle cx="8.5" cy="13.5" r="1.5" fill="#16a34a" />
                  <circle cx="15.5" cy="13.5" r="1.5" fill="#16a34a" />
                </svg>
              </div>
              <div style={{ ...inlineStyles.bubble, ...inlineStyles.botBubble, padding: "12px 18px" }}>
                <div style={inlineStyles.typingDots}>
                  <span style={{ ...inlineStyles.dot, animationDelay: "0ms" }} />
                  <span style={{ ...inlineStyles.dot, animationDelay: "200ms" }} />
                  <span style={{ ...inlineStyles.dot, animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED QUESTIONS (CHIPS) */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={inlineStyles.suggestionSection}>
            <div style={inlineStyles.suggestionHeader}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span style={inlineStyles.suggestionTitle}>Pertanyaan Populer seputar Erine & Cavallery:</span>
            </div>
            <div style={inlineStyles.chipsWrap}>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item)}
                  disabled={loading}
                  style={inlineStyles.chipButton}
                >
                  <span style={inlineStyles.chipArrow}>Pilih →</span> {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM INPUT DOCK */}
        <div style={inlineStyles.inputWrap}>
          <div style={inlineStyles.inputBar}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan apa saja tentang Erine JKT48 atau Cavallery..."
              disabled={loading}
              style={inlineStyles.textInput}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                ...inlineStyles.sendButton,
                opacity: loading || !input.trim() ? 0.45 : 1,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              }}
              title="Kirim pesan"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={inlineStyles.inputFooterNotice}>
            <span>Jenderal Cavallery AI dapat memberikan info seputar Erine JKT48, jadwal, dan kegiatan fanbase.</span>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── INLINE STYLES ──────────────────────────────────────────────────────────
const inlineStyles: Record<string, React.CSSProperties> = {
  pageRoot: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0d1117",
    color: "#e6edf3",
    fontFamily: "var(--font-geist-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow1: {
    position: "absolute",
    top: "-150px",
    right: "-100px",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, rgba(22, 101, 52, 0.03) 70%, transparent 100%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgGlow2: {
    position: "absolute",
    bottom: "-150px",
    left: "-100px",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201, 168, 76, 0.1) 0%, rgba(22, 101, 52, 0.02) 70%, transparent 100%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "12px 20px",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },
  headerInner: {
    maxWidth: "960px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  avatarBox: {
    position: "relative",
  },
  avatarCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    border: "2px solid rgba(34, 197, 94, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  greenDot: {
    position: "absolute",
    bottom: "1px",
    right: "1px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "2px solid #0d1117",
    display: "block",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerTitle: {
    fontSize: "1.15rem",
    fontWeight: 700,
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.01em",
  },
  statusPill: {
    fontSize: "0.72rem",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "999px",
    border: "1px solid",
    display: "inline-flex",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: "0.78rem",
    color: "#8b949e",
    margin: "2px 0 0 0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#c9d1d9",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  homeLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    fontSize: "0.8rem",
    textDecoration: "none",
    fontWeight: 500,
  },
  mainContainer: {
    flex: 1,
    maxWidth: "960px",
    width: "100%",
    margin: "0 auto",
    padding: "16px 16px 24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1,
    boxSizing: "border-box",
  },
  messagesBox: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minHeight: "360px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  botAvatarSmall: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: "14px",
    padding: "10px 16px",
    fontSize: "0.92rem",
    wordBreak: "break-word",
  },
  userBubble: {
    backgroundColor: "#166534",
    color: "#ffffff",
    borderBottomRightRadius: "4px",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    boxShadow: "0 2px 10px rgba(22, 101, 52, 0.25)",
  },
  botBubble: {
    backgroundColor: "#161b22",
    color: "#e6edf3",
    borderBottomLeftRadius: "4px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.25)",
  },
  bubbleContent: {
    fontSize: "0.92rem",
  },
  bubbleMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
  },
  timeText: {
    fontSize: "0.7rem",
    opacity: 0.65,
  },
  sourceBadge: {
    fontSize: "0.65rem",
    padding: "1px 6px",
    borderRadius: "4px",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.25)",
  },
  typingDots: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    height: "14px",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    display: "inline-block",
    animation: "bounceDot 1.4s infinite ease-in-out",
  },
  suggestionSection: {
    margin: "12px 0 16px 0",
    padding: "14px 16px",
    borderRadius: "12px",
    backgroundColor: "rgba(22, 27, 34, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  suggestionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  suggestionTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#e6edf3",
  },
  chipsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  chipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "20px",
    padding: "6px 12px",
    fontSize: "0.8rem",
    color: "#c9d1d9",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  chipArrow: {
    color: "#22c55e",
    fontWeight: 600,
    fontSize: "0.78rem",
  },
  inputWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    position: "sticky",
    bottom: 0,
    backgroundColor: "rgba(13, 17, 23, 0.95)",
    backdropFilter: "blur(12px)",
    paddingTop: "10px",
  },
  inputBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#161b22",
    borderRadius: "12px",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    padding: "6px 8px 6px 16px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "0.92rem",
    outline: "none",
  },
  sendButton: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  inputFooterNotice: {
    textAlign: "center",
    fontSize: "0.72rem",
    color: "#8b949e",
    paddingBottom: "4px",
  },
};
