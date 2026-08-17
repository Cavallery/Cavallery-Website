"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./Chatbot.module.css";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Halo! Aku Jenderal Cavallery. Ada yang mau kamu tanyakan seputar Erine atau Cavallery?",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const msgsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (msgsEndRef.current) {
      msgsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

const FALLBACK_RULES = [
  { triggers: [["siapa", "kenal"], ["erine", "catherina"]], response: "Erine (Catherina Vallencia Kurniawan) itu member JKT48 generasi 12 yang sekarang berada di Team Passion! Dia diperkenalkan pertama kali tanggal 18 November 2023 di JakJapan Matsuri. Orangnya super gemesin dan berbakat banget!" },
  { triggers: [["setlist", "teater", "show"]], response: "Erine udah membawakan total 7 setlist lho! Mulai dari Aitakatta, Pajama Drive, Renai Kinshi Jourei (RKJ), Te Wo Tsunaginagara (TWT), Kira Kira Girls (global center!), Ramune no Nomikata, dan Passion 200%!" },
  { triggers: [["projek", "project", "rose", "rh", "request hour", "obscura"]], response: "Saat ini Cavallery lagi ngadain projek Blue Rose dengan hestek #RoseObscura untuk Request Hour (RH) bertema #Memory! Kita juga ada hestek #NabungRine. Yuk ikutan!" },
  { triggers: [["lahir", "umur", "usia", "tanggal"]], response: "Erine lahir tanggal 21 Agustus 2007 (Zodiak Leo). Sekarang dia udah makin dewasa dan terus bersinar bersama JKT48!" },
  { triggers: [["hometown", "asal", "tinggal", "bekasi"]], response: "Erine berasal dari Bekasi, Jawa Barat, Indonesia! Anak Bekasi kebanggaan Cavallery nih, hehe." },
  { triggers: [["maskot", "bebek", "rinara"]], response: "Maskot resmi Cavallery namanya Rinara! Bentuknya bebek lucu yang nemenin perjuangan kita selama SSK 2024 kemarin." },
  { triggers: [["makanan", "kesukaan", "favorit", "suka"]], response: "Erine suka banget makan seafood, mala tang, dan dubai chewy cookie! Hewan kesukaannya Sealion." },
  { triggers: [["halo", "hai", "hey", "hi"]], response: "Halo juga! Aku asisten dari Jenderal Cavallery. Mau tanya apa nih soal Erine? Aku siap bantu!" },
  { triggers: [["terima kasih", "makasih", "thanks"]], response: "Sama-sama ya! Seneng bisa bantu. Jangan lupa terus dukung Erine dan Cavallery ya!" }
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

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    // Add user message
    const updatedMessages = [...messages, { text, sender: "user" as const }];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    // Build conversation history for memory
    const history = updatedMessages
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
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
    } catch (error) {
      const fallbackReply = getClientFallbackReply(text);
      setMessages((prev) => [
        ...prev,
        { text: fallbackReply, sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className={styles.chatContainer}>
      {isOpen && (
        <div className={styles.chatBox}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <i className="bx bxs-horse" />
              <span>Jenderal Cavallery</span>
            </div>
            <i
              className={`bx bx-chevron-down ${styles.closeBtn}`}
              style={{ cursor: "pointer", fontSize: "24px" }}
              onClick={() => setIsOpen(false)}
            />
          </div>

          <div className={styles.msgs}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.msg} ${
                  msg.sender === "user" ? styles.user : styles.bot
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.msg} ${styles.bot}`}>
                Mengetik
                <span className={styles.loadingDot}>.</span>
                <span className={styles.loadingDot}>.</span>
                <span className={styles.loadingDot}>.</span>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              className={styles.input}
              placeholder="Tulis pesan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button className={styles.send} onClick={handleSend}>
              <i className="bx bxs-send" />
            </button>
          </div>
        </div>
      )}

      <button className={styles.trigger} onClick={() => setIsOpen((prev) => !prev)}>
        <img
          src="/images/cava-logo.jpg"
          alt="Cava Logo"
          className={styles.triggerImg}
        />
      </button>
    </div>
  );
}
