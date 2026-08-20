"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./WayfinderMessages.module.css";

interface BirthdayMessage {
  id?: number;
  name: string;
  msg: string;
  date: string;
}

export default function WayfinderMessages() {
  const [messages, setMessages] = useState<BirthdayMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [modalData, setModalData] = useState<BirthdayMessage | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/birthday-messages", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : null);
        if (arr) {
          const formatted = arr
            .filter((item: any) => item && (item.msg || item.pesan))
            .map((item: any) => ({
              id: item.id,
              name: item.name || item.Nama || "Anonim",
              msg: item.msg || item.pesan || "",
              date: item.date
                ? item.date.includes("/")
                  ? item.date
                  : new Date(item.date).toLocaleDateString("id-ID")
                : new Date().toLocaleDateString("id-ID"),
            }));
          setMessages(formatted);
          setLoading(false);
          return;
        }
      }
    } catch {}

    setMessages([]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || submitting) return;

    const fd = new FormData(formRef.current);
    const name = (fd.get("Nama") as string) || "Anonim";
    const msg = (fd.get("pesan") as string) || "";

    if (!msg.trim()) return;

    setSubmitting(true);

    const newMsg: BirthdayMessage = {
      name: name.trim() || "Anonim",
      msg: msg.trim(),
      date: new Date().toLocaleDateString("id-ID"),
    };

    setMessages((prev) => [newMsg, ...prev]);
    setIsSubmitted(true);

    try {
      await fetch("/api/birthday-messages", {
        method: "POST",
        body: fd,
      });
      // Refresh to ensure full sync with sheet
      setTimeout(loadMessages, 1500);
    } catch {}

    setSubmitting(false);
  };

  return (
    <section className={styles.wrapper}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>Birthday Wishes & Love</span>
        <h2 className={styles.sectionTitle}>💌 Titip Pesan Ulang Tahun Erine</h2>
        <p className={styles.sectionDesc}>
          Tuliskan doa, harapan, dan ucapan selamat ulang tahun terbaikmu untuk Catherina Vallencia (Erine) di sini!
        </p>
      </div>

      {/* Form Board */}
      {!isSubmitted ? (
        <div className={styles.formBoard}>
          <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              name="Nama"
              placeholder="Nama / Panggilan Kamu"
              required
              className={styles.input}
            />
            <textarea
              name="pesan"
              rows={4}
              placeholder="Tuliskan ucapan dan doa manis untuk Erine di hari ulang tahunnya..."
              required
              className={styles.textarea}
            />
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? (
                <>
                  <i className="bx bx-loader-alt bx-spin" /> Menyematkan Ucapan...
                </>
              ) : (
                <>
                  <i className="bx bx-send" /> SEMATKAN UCAPAN ULANG TAHUN
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.successMsg}>
          <i className="bx bx-check-circle" style={{ fontSize: "1.3rem" }} />
          <span>Ucapanmu berhasil disematkan! Terima kasih atas doa manis untuk Erine. ✨</span>
        </div>
      )}

      {/* Carousel Controls (Only when messages exist) */}
      {messages.length > 0 && (
        <div className={styles.controls}>
          <div className={styles.carouselLabel}>
            <i className="bx bx-notepad" /> Papan Ucapan #ErineTheWayfinder ({messages.length})
          </div>
          <button className={styles.scrollBtn} onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? "▶ Putar Pesan" : "⏸ Jeda Pesan"}
          </button>
        </div>
      )}

      {/* Message Board / Carousel */}
      <div className={styles.carouselWindow}>
        {loading ? (
          <div style={{ color: "#a09882", padding: "24px 0", textAlign: "center" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.5rem", marginRight: 8 }} />
            Memuat ucapan...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ color: "#a09882", padding: "24px 0", textAlign: "center", fontStyle: "italic" }}>
            Belum ada ucapan yang disematkan. Jadilah yang pertama memberikan ucapan ulang tahun untuk Erine! ✨
          </div>
        ) : (
          <div className={`${styles.carouselTrack} ${isPaused ? styles.paused : ""}`}>
            {(messages.length > 2 ? [...messages, ...messages] : messages).map((m, i) => (
              <div key={i} className={styles.stickyCard} onClick={() => setModalData(m)}>
                <div className={styles.cardPin} />
                <div className={styles.cardName}>{m.name}</div>
                <div className={styles.cardMsg}>"{m.msg}"</div>
                <div className={styles.cardDate}>{m.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Popup Detail */}
      {modalData && (
        <div className={styles.modal} onClick={() => setModalData(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setModalData(null)}>
              &times;
            </button>
            <h3 className={styles.modalName}>{modalData.name}</h3>
            <p className={styles.modalMsg}>"{modalData.msg}"</p>
            <div className={styles.modalDate}>{modalData.date}</div>
          </div>
        </div>
      )}
    </section>
  );
}
