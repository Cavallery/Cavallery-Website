"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./JournalSection.module.css";

const scriptURL = "https://script.google.com/macros/s/AKfycbxiiUkBqWpRrYSDkC-6RKZ_mFxPAWB2uydW_hxaYWL0tr-o_GwrJ6b4zt_Goj9gFeen/exec";

interface Message {
  name: string;
  msg: string;
  date: string;
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
    try {
      const res = await fetch(scriptURL);
      const data = await res.json();
      const formatted = data.map((row: any) => ({
        name: row[1],
        msg: row[2],
        date: row[3] ? new Date(row[3]).toLocaleDateString("id-ID") : ""
      }));
      setMessages(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    try {
      await fetch(scriptURL, { method: "POST", body: new FormData(formRef.current) });
      setIsSubmitted(true);
      loadMessages();
    } catch (e) {
      console.error(e);
    }
  };

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
              <textarea name="pesan" rows={4} placeholder="Pesan..." required></textarea>
              <button type="submit" className={styles.submitBtn}>SEMATKAN PESAN</button>
            </form>
          </section>
        ) : (
          <div className={styles.successMsg}>Pesan berhasil disematkan!</div>
        )}

        <h3 className={styles.carouselTitle}>"#MemoRine"</h3>

        <div className={styles.controls}>
          <button className={styles.scrollBtn} onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? "▶ Play" : "⏸ Pause"}
          </button>
        </div>

        <div className={styles.carouselWindow}>
          <div 
            className={`${styles.carouselTrack} ${isPaused ? styles.paused : ""}`}
          >
            {loading ? (
              <div className={styles.loading}>Memuat pesan...</div>
            ) : (
              // Double the array for seamless looping
              [...messages, ...messages].map((m, i) => (
                <div 
                  key={i} 
                  className={styles.stickyCard}
                  onClick={() => setModalData(m)}
                >
                  <div className={styles.cardPin} />
                  <div className={styles.cardName}>{m.name}</div>
                  <div className={styles.cardMsg}>"{m.msg}"</div>
                  <div className={styles.cardDate}>{m.date}</div>
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
            <div className={styles.date}>{modalData.date}</div>
          </div>
        </div>
      )}
    </div>
  );
}
