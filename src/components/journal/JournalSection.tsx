"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./JournalSection.module.css";

interface Message {
  id?: number | string;
  name: string;
  msg: string;
  date: string;
}

function formatDate(dateVal: any): string {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } catch {}
  return String(dateVal).replace(/Invalid Date/gi, "");
}

export default function JournalSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [modalData, setModalData] = useState<Message | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    let formatted: Message[] = [];
    try {
      const res = await fetch(`/api/journal?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (arr && arr.length > 0) {
          formatted = arr.map((item: any) => ({
            id: item.id,
            name: item.name || "Anonim",
            msg: item.msg || item.pesan || item.message || "",
            date: formatDate(item.date || item.created_at || item.date_label),
          })).filter((m: Message) => m.msg && m.msg.trim().length > 0);
        }
      }
    } catch {}

    setMessages(formatted);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const fd = new FormData(formRef.current);
    const name = (fd.get("Nama") as string) || "Anonim";
    const msg = (fd.get("pesan") as string) || "";

    if (!msg.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      name: name.trim() || "Anonim",
      msg: msg.trim(),
      date: formatDate(new Date().toISOString()),
    };

    setMessages((prev) => [newMsg, ...prev]);
    setIsSubmitted(true);

    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonim",
          msg: msg.trim(),
        }),
      });
    } catch (err) {
      console.error("Gagal mengirim pesan journal:", err);
    }
  };

  const displayList = messages.length > 0 ? (messages.length < 5 ? [...messages, ...messages, ...messages] : [...messages, ...messages]) : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1>Yuk titip pesan untuk Erine</h1>
          <h2>Lewat #MemoRine</h2>
        </div>

        {!isSubmitted ? (
          <section className={styles.formBoard}>
            <form ref={formRef} onSubmit={handleSubmit}>
              <input type="text" name="Nama" placeholder="Nama Kamu" required />
              <textarea name="pesan" rows={4} placeholder="Tuliskan pesan atau dukunganmu untuk Erine..." required></textarea>
              <button type="submit" className={styles.submitBtn}>SEMATKAN PESAN</button>
            </form>
          </section>
        ) : (
          <div className={styles.successMsg}>
            ✨ Pesan berhasil disematkan! Terima kasih sudah mendukung Erine.
          </div>
        )}

        <h3 className={styles.carouselTitle}>"#MemoRine"</h3>

        {messages.length > 0 && (
          <div className={styles.controls}>
            <button className={styles.scrollBtn} onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? "▶ Play" : "⏸ Pause"}
            </button>
          </div>
        )}

        <div className={styles.carouselWindow}>
          <div 
            className={`${styles.carouselTrack} ${isPaused ? styles.paused : ""}`}
          >
            {loading ? (
              <div className={styles.loading}>Memuat pesan #MemoRine...</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--fg-muted, #888)" }}>
                Belum ada pesan. Jadilah yang pertama menyematkan pesan untuk Erine di atas! 💌
              </div>
            ) : (
              displayList.map((m, i) => (
                <div 
                  key={`${m.id || i}-${i}`} 
                  className={styles.stickyCard}
                  onClick={() => setModalData(m)}
                >
                  <div className={styles.cardPin} />
                  <div className={styles.cardName}>{m.name}</div>
                  <div className={styles.cardMsg}>"{m.msg}"</div>
                  {m.date && <div className={styles.cardDate}>{m.date}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalData && (
        <div className={styles.modal} onClick={() => setModalData(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.close} onClick={() => setModalData(null)}>&times;</span>
            <h3>{modalData.name}</h3>
            <p>"{modalData.msg}"</p>
            {modalData.date && <div className={styles.date}>{modalData.date}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
