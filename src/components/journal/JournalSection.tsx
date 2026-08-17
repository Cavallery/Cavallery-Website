"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./JournalSection.module.css";


interface Message {
  name: string;
  msg: string;
  date: string;
}

const DEFAULT_PUBLIC_JOURNAL: Message[] = [
  { name: "lalallalalala", msg: "haloo ci erinee sayangg!! tauu gaa kehidupan aku jadi lebih berwarna saat ada ci erineee, ci erine tu uda aku anggap seperti kaka kandung tauuu ya walaupun ci erine gatau aku hidup huhuhu soalnya belum bisa vc in another day akuu vc ya ci tunggu akuu!!!, bertahan lebih lama di jkt48 ya ci!! aku adalah salah satu orang yang bangga smaa ciciii, HARUS SELALU PERCAYA DIRI YA CII OKAIIII, aku tau banyak yang selalu dukung ciciii, I LOVE U CATHERINA VALLENCIA KETUA BEBEK KUUUU🐣🤍", date: "9/3/2026" },
  { name: "Dinda duyoung ", msg: "Hai ci erine semangat terus yaa kegiatannya jaga kesehatannya jugaa apalagi sekarang kamu lagi sibuk\"nya latihan buat shonici setlist baru dan mv baru juga yaa semangat yaa, minum air putih yang cukup sehat\" cerine 🤍🍀. Cinta kamu banget 🫶🏻 jujur kangen 🥹", date: "12/3/2026" },
  { name: "faiz mahmud", msg: "hai erine! bagaimana kabarmu? semoga kamu sehat selalu ya. jangan jaga kesehatan, istirahat yang cukup, dan bersemangat dalam menjalani hari yang penuh dengan seribu kejutan. udah deh itu aja o ya sebelum itu aku punya kata-kata untuk erine agar semangat dalam menjalani hari. kata-kata hari ini= jalani hidupmu dengan sungguh-sungguh agar hati mu tetap teguh", date: "15/3/2026" },
  { name: "vernx ", msg: "Hai ci Erine semangat terus ya, jaga kesehatan selalu pokoknya apapun kegiatannya tetap semangat. Aku yakin kamu pasti bisa dan mampu untuk melakukannya dengan terbaik. Aku akan terus menemani perjalananmu sampai akhir, ci Erine kamu itu hebat, keren, luar biasa jadi jangan pernah merasa bahwa dirimu itu tidak layak ataupun tidak cocok untuk mendapatkan dukungan dan kebahagiaan yang dirasakan di JKT48. Ci Erine oshi kesayanganku yang tidak pernah tergantikan aku cuma mau bilang, tolong bertahan lebih lama di JKT48 kita sama-sama berjuang bikin chapter yang indah dan raih mimpi-mimpi besarmu. I love Ci Erine 🫶🏻💌", date: "19/3/2026" },
  { name: "dhafinnn", msg: "semangat yaa dalam menjalani semuanya, you are stronger than you think. you dont have to carry it all alone, we've got your back. sehat sehat terus yaaaa 🤍", date: "19/3/2026" },
  { name: "R_Syaa (aisyah_adl) ", msg: "Hai kak ci erine! minal aidzin wal faidzin, mohon maaf lahir dan batin yaa kakk🙏🏻 kakak semangattt terus yaaa kakk! aku selalu mendukung apapun yang kakak lakukan, terimakasih untuk semua kerja keras kak erine! kak ci erine hebat! aku sayang banget sama kak erine 🫂🤍", date: "20/3/2026" }
];

export default function JournalSection() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_PUBLIC_JOURNAL);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [modalData, setModalData] = useState<Message | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    let formatted: Message[] | null = null;
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : null);
        if (arr && arr.length > 0) {
          formatted = arr.map((item: any) => ({
            name: item.name || "Anonim",
            msg: item.msg || item.pesan || "",
            date: item.date ? new Date(item.date).toLocaleDateString("id-ID") : ""
          }));
        }
      }
    } catch {}

    if (!formatted || formatted.length === 0) {
      try {
        const saved = typeof window !== "undefined" ? localStorage.getItem("cavallery_journal") : null;
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) {
            formatted = arr.map((item: any) => ({
              name: item.name || "Anonim",
              msg: item.msg || item.pesan || "",
              date: item.date ? (item.date.includes("/") ? item.date : new Date(item.date).toLocaleDateString("id-ID")) : ""
            }));
          }
        }
      } catch {}
    }

    if (formatted && formatted.length > 0) {
      setMessages(formatted);
    } else {
      setMessages(DEFAULT_PUBLIC_JOURNAL);
    }
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
      name: name.trim() || "Anonim",
      msg: msg.trim(),
      date: new Date().toLocaleDateString("id-ID")
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    setIsSubmitted(true);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cavallery_journal", JSON.stringify(updated));
      } catch {}
    }

    try {
      await fetch("/api/journal", { method: "POST", body: fd });
    } catch {}
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
