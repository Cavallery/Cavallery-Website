"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./Chatbot.module.css";

const BOT_AVATAR_URL = "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const DEFAULT_RECOMMENDATIONS = [
  "Siapa itu Erine JKT48?",
  "Ceritain projek Blue Rose Cavallery!",
  "Apa saja setlist teater Erine?",
  "Kapan Erine dipromosikan ke Team Passion?",
  "Berapa rank Erine di SSK 2024?",
  "Apa makanan dan hewan favorit Erine?",
  "Apa maskot resmi Cavallery?",
  "Apa hestek spesial Erine?",
];

const FALLBACK_RULES = [
  { triggers: [["siapa", "kenal"], ["erine", "catherina"]], response: "Erine (Catherina Vallencia Kurniawan) itu member JKT48 generasi 12 yang sekarang berada di Team Passion! Dia diperkenalkan pertama kali tanggal 18 November 2023 di JakJapan Matsuri. Orangnya super gemesin dan berbakat banget!" },
  { triggers: [["setlist", "teater", "show"]], response: "Erine udah membawakan total 7 setlist lho! Mulai dari Aitakatta (sapu bersih unit song!), Pajama Drive, Renai Kinshi Jourei (RKJ), Te Wo Tsunaginagara (TWT), Kira Kira Girls (global center!), Ramune no Nomikata, dan Passion 200%!" },
  { triggers: [["projek", "project", "rose", "rh", "request hour", "obscura"]], response: "Saat ini Cavallery lagi ngadain projek Blue Rose dengan hestek #RoseObscura untuk Request Hour (RH) bertema #Memory! Kita juga ada hestek #NabungRine. Yuk ikutan!" },
  { triggers: [["lahir", "umur", "usia", "tanggal"]], response: "Erine lahir tanggal 21 Agustus 2007 (Zodiak Leo). Sekarang dia udah makin dewasa dan terus bersinar bersama JKT48!" },
  { triggers: [["hometown", "asal", "tinggal", "bekasi"]], response: "Erine berasal dari Bekasi, Jawa Barat, Indonesia! Anak Bekasi kebanggaan Cavallery nih, hehe." },
  { triggers: [["maskot", "bebek", "rinara"]], response: "Maskot resmi Cavallery namanya Rinara! Bentuknya bebek lucu yang nemenin perjuangan kita selama SSK 2024 kemarin." },
  { triggers: [["makanan", "kesukaan", "favorit", "suka"]], response: "Erine suka banget makan seafood, mala tang, dan dubai chewy cookie! Hewan kesukaannya Sealion." },
  { triggers: [["halo", "hai", "hey", "hi"]], response: "Halo juga! Aku asisten dari Jenderal Cavallery. Mau tanya apa nih soal Erine? Aku siap bantu!" },
  { triggers: [["terima kasih", "makasih", "thanks"]], response: "Sama-sama ya! Seneng bisa bantu. Jangan lupa terus dukung Erine dan Cavallery ya!" },
];

function getClientFallbackReply(text: string): string {
  const msg = text.toLowerCase();
  let rules = FALLBACK_RULES;
  let fallbackDefault = "Wah pertanyaan seru nih! Coba tanyain aku soal Erine, setlist teaternya, projek Cavallery kayak #RoseObscura, atau hestek-hestek seru lainnya ya! Aku siap bantu.";

  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cavallery_bot_config");
      if (saved) {
        const conf = JSON.parse(saved);
        if (conf.fallbackResponse) fallbackDefault = conf.fallbackResponse;
        if (Array.isArray(conf.rules) && conf.rules.length > 0) rules = conf.rules;
      }
    }
  } catch {}

  for (const rule of rules) {
    if (!rule.triggers || !Array.isArray(rule.triggers) || rule.triggers.length === 0) continue;
    const groups: string[][] = rule.triggers.map((item: any) => Array.isArray(item) ? item : [item]);
    const isMatch = groups.every((group: string[]) => group.some((t: string) => msg.includes(t.toLowerCase().trim())));
    if (isMatch) return rule.response;
  }

  return fallbackDefault;
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>(DEFAULT_RECOMMENDATIONS);
  // Initial messages starts empty as requested (removed "Hai Bub, Apa kabar? Ada yang mau ditanyakan?")
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (msgsEndRef.current) {
      msgsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Fetch recommendations from API / Health check on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data.suggested_questions) && data.suggested_questions.length > 0) {
          setRecommendations(data.suggested_questions);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleSend = async (customText?: string) => {
    const text = (customText ?? inputText).trim();
    if (!text || isLoading) return;

    // Add user message
    const updatedMessages = [...messages, { text, sender: "user" as const }];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);
    setShowRecommendations(false);

    // Build conversation history for memory
    const history = updatedMessages.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      text: m.text,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
          setIsLoading(false);
          return;
        }
      }

      // If response not ok or no reply, use client fallback
      const fallbackReply = getClientFallbackReply(text);
      setMessages((prev) => [...prev, { text: fallbackReply, sender: "bot" }]);
    } catch {
      const fallbackReply = getClientFallbackReply(text);
      setMessages((prev) => [...prev, { text: fallbackReply, sender: "bot" }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Hide floating widget in admin pages
  if (pathname?.startsWith("/internal/dashboard-admin-xv7r2q") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className={styles.chatContainer}>
      {/* ── CHAT POPUP WINDOW ── */}
      {isOpen && (
        <div className={styles.chatBox}>
          {/* HEADER */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar}>
                <img
                  src={BOT_AVATAR_URL}
                  alt="Jenderal Bot"
                  className={styles.headerAvatarImg}
                  onError={(e) => {
                    e.currentTarget.src = "/images/cava-logo-round.png";
                  }}
                />
              </div>
              <div className={styles.headerTitleBox}>
                <h3 className={styles.headerTitle}>Jenderal Cavallery</h3>
                <div className={styles.headerSubtitle}>
                  <span className={styles.headerDot} />
                  <span>Asistennya Erine JKT48</span>
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.iconBtn}
                onClick={() => setIsOpen(false)}
                title="Minimalkan"
              >
                <i className="bx bx-chevron-down" />
              </button>
              <button
                className={styles.iconBtn}
                onClick={() => setIsOpen(false)}
                title="Tutup"
              >
                <i className="bx bx-x" />
              </button>
            </div>
          </div>

          {/* MESSAGES LIST */}
          <div className={styles.msgs}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconBox}>
                  <i className="bx bx-bot" />
                </div>
                <div className={styles.emptyTitle}>Ada yang bisa aku bantu?</div>
                <div className={styles.emptyDesc}>
                  Pilih salah satu pertanyaan rekomendasi di bawah atau ketik langsung pertanyaanmu seputar Erine!
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.msg} ${
                    msg.sender === "user" ? styles.user : styles.bot
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}

            {/* TYPING INDICATOR */}
            {isLoading && (
              <div className={styles.typingIndicator}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* REKOMENDASI PERTANYAAN ACCORDION */}
          <div className={styles.recommendSection}>
            <div
              className={styles.recommendHeader}
              onClick={() => setShowRecommendations((prev) => !prev)}
            >
              <div className={styles.recommendTitle}>
                <i className="bx bx-message-dots" style={{ color: "var(--gold, #b45309)" }} />
                <span>Rekomendasi Pertanyaan</span>
                <span className={styles.slashBadge}>/</span>
              </div>
              <i
                className={`bx bx-chevron-down ${styles.chevronIcon} ${
                  showRecommendations ? styles.chevronIconRotated : ""
                }`}
              />
            </div>

            {showRecommendations && (
              <div className={styles.chipsContainer}>
                {recommendations.map((item, idx) => (
                  <button
                    key={idx}
                    className={styles.chipBtn}
                    onClick={() => handleSend(item)}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INPUT BAR */}
          <div className={styles.inputSection}>
            <div className={styles.inputPill}>
              <input
                ref={inputRef}
                type="text"
                className={styles.textInput}
                placeholder="Tanyakan sesuatu ke Jenderal..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                disabled={isLoading}
              />
              <button
                className={styles.sendBtn}
                onClick={() => handleSend()}
                disabled={isLoading || !inputText.trim()}
                title="Kirim pesan"
              >
                <i className="bx bxs-paper-plane" />
              </button>
            </div>
            <p className={styles.footerText}>
              Powered by <span className={styles.footerBrand}>Cavallery AI</span>
            </p>
          </div>
        </div>
      )}

      {/* ── FLOATING TRIGGER (CLOSED STATE) ── */}
      {!isOpen && (
        <div className={styles.triggerWrap}>
          {showTooltip && (
            <div
              className={styles.tooltipBubble}
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
            >
              <span>Hai Erine Oshi, ada yang bisa aku bantu? 👋</span>
            </div>
          )}

          <button
            className={styles.trigger}
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
            aria-label="Buka Chatbot Jenderal Cavallery"
          >
            <img
              src={BOT_AVATAR_URL}
              alt="Jenderal Cavallery"
              className={styles.triggerImg}
              onError={(e) => {
                e.currentTarget.src = "/images/cava-logo-round.png";
              }}
            />
            {/* Bright Green Active Indicator */}
            <span className={styles.greenStatusDot} title="Online · Siap Membantu" />
          </button>
        </div>
      )}
    </div>
  );
}
