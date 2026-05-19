"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Chatbot.module.css";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export default function Chatbot() {
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

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: "Maaf, Erine lagi banyak yang nyariin nih. Coba tanya lagi bentar ya!",
            sender: "bot",
          },
        ]);
        console.error("DEBUG:", data.error || "Unknown error");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "❌ Koneksi ke server gagal.", sender: "bot" },
      ]);
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

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
              className="bx bx-chevron-down styles.closeBtn"
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
                Memikirkan jawaban
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
          src="http://localhost:3001/images/cava-logo.jpg"
          alt="Cava Logo"
          className={styles.triggerImg}
        />
      </button>
    </div>
  );
}
