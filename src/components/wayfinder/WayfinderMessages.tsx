"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./WayfinderMessages.module.css";

interface BirthdayMessage {
  id?: number | string;
  name: string;
  msg: string;
  date: string;
}

// Organic tilt angles for pinned notes
const TILTS = [-1.5, 1.8, -2.2, 1.4, -1, 2.1, -1.8, 1.2];

// Soft pastel note color themes (like real post-its)
const NOTE_THEMES = [
  "themeYellow",
  "themeBlue",
  "themePink",
  "themeGreen",
  "themePeach",
];

export default function WayfinderMessages() {
  const [messages, setMessages] = useState<BirthdayMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
      id: Date.now(),
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
      setTimeout(loadMessages, 1500);
    } catch {}

    setSubmitting(false);
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.msg.toLowerCase().includes(q);
  });

  const displayedMessages =
    showAll || searchQuery.trim() ? filteredMessages : filteredMessages.slice(0, 15);

  return (
    <section className={styles.wrapper}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTag}>Birthday Wishes &amp; Love</span>
        <h2 className={styles.sectionTitle}>💌 Titip Pesan Ulang Tahun Erine</h2>
        <p className={styles.sectionDesc}>
          Tuliskan doa, harapan, dan ucapan selamat ulang tahun terbaikmu untuk Erine JKT48 di sini!
        </p>
        <div className={styles.headerActionRow}>
          <button
            type="button"
            className={styles.toggleFormBtn}
            onClick={() => setShowForm(!showForm)}
          >
            <i className={`bx ${showForm ? "bx-chevron-up" : "bx-edit"}`} />
            {showForm ? "Sembunyikan Form" : "Tulis Ucapan Baru"}
          </button>
        </div>
      </div>

      {/* Form Board */}
      {showForm && (
        <div className={styles.formBoardWrap}>
          {!isSubmitted ? (
            <div className={styles.formBoard}>
              <div className={styles.formHeaderRow}>
                <div className={styles.formPin} />
                <h3>Sematkan Catatan Ulang Tahun</h3>
                <p>Ucapanmu akan langsung tertempel di papan seitansai #ErineTheWayfinder!</p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                  <label>Nama / Panggilan Kamu *</label>
                  <input
                    type="text"
                    name="Nama"
                    placeholder="Contoh: Cavallers Sejati"
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label>Doa &amp; Harapan untuk Erine *</label>
                  <textarea
                    name="pesan"
                    rows={4}
                    placeholder="Tuliskan ucapan dan doa manis untuk Erine di hari ulang tahunnya..."
                    required
                    className={styles.textarea}
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Menyematkan Ucapan...
                    </>
                  ) : (
                    <>
                      <i className="bx bxs-pin" /> SEMATKAN KE PAPAN UCAPAN
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.successMsg}>
              <div className={styles.successIcon}>
                <i className="bx bxs-check-circle" />
              </div>
              <h3>Ucapanmu Berhasil Ditempel! ✨</h3>
              <p>Terima kasih atas doa dan cinta manis untuk Erine di #ErineTheWayfinder.</p>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => setIsSubmitted(false)}
              >
                <i className="bx bx-plus" /> Kirim Ucapan Lainnya
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PAPAN UCAPAN BULLETIN BOARD ── */}
      <div className={styles.madingBoardFrame}>
        {/* Corkboard / Bulletin Board Surface */}
        <div className={styles.corkBoardSurface}>
          {/* Top Board Brass/Wooden Plate */}
          <div className={styles.boardHeaderPlate}>
            <div className={styles.plateScrewLeft} />
            <div className={styles.plateTitle}>
              <i className="bx bx-notepad" /> Papan Ucapan #ErineTheWayfinder ({messages.length})
            </div>
            <div className={styles.plateScrewRight} />
          </div>

          {/* Search / Filter bar if messages exist */}
          {messages.length > 0 && (
            <div className={styles.boardFilterBar}>
              <div className={styles.searchBox}>
                <i className="bx bx-search" />
                <input
                  type="text"
                  placeholder="Cari nama pengirim atau isi ucapan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => setSearchQuery("")}
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className={styles.boardCountBadge}>
                {searchQuery
                  ? `Ditemukan: ${filteredMessages.length} dari ${messages.length}`
                  : `Menampilkan ${displayedMessages.length} dari ${messages.length} ucapan`}
              </div>
            </div>
          )}

          {loading ? (
            <div className={styles.boardLoading}>
              <i className="bx bx-loader-alt bx-spin" /> Memuat papan ucapan...
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.boardEmpty}>
              <i className="bx bx-note" />
              <h4>Papan Masih Kosong</h4>
              <p>Jadilah yang pertama menyematkan ucapan ulang tahun manis untuk Erine di atas! ✨</p>
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className={styles.boardEmpty}>
              <i className="bx bx-search-alt" />
              <h4>Tidak Ada Ucapan Yang Cocok</h4>
              <p>Coba kata kunci lain atau bersihkan pencarian untuk melihat semua ucapan.</p>
            </div>
          ) : (
            <>
              <div className={styles.notesGrid}>
                {displayedMessages.map((m, idx) => {
                  const isLongMsg = m.msg.length > 150;
                  const displayMsg = isLongMsg ? `${m.msg.slice(0, 145)}...` : m.msg;
                  const tilt = TILTS[idx % TILTS.length];
                  const themeClass = styles[NOTE_THEMES[idx % NOTE_THEMES.length]];

                  return (
                    <div
                      key={m.id || idx}
                      className={`${styles.stickyNote} ${themeClass}`}
                      style={{
                        transform: `rotate(${tilt}deg)`,
                      }}
                      onClick={() => setModalData(m)}
                    >
                      {/* Realistic 3D Pushpin with needle and shadow */}
                      <div className={styles.notePushPin} title="Tertempel di papan ucapan">
                        <div className={styles.pinHead} />
                        <div className={styles.pinNeedle} />
                        <div className={styles.pinShadow} />
                      </div>

                      {/* Card Header: Author & Date */}
                      <div className={styles.noteHeader}>
                        <h4 className={styles.authorName}>{m.name}</h4>
                        <span className={styles.noteDate}>{m.date}</span>
                      </div>

                      {/* Card Body */}
                      <div className={styles.noteBody}>
                        <p className={styles.noteText}>
                          &ldquo;{displayMsg}&rdquo;
                          {isLongMsg && (
                            <span
                              className={styles.readMoreBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalData(m);
                              }}
                            >
                              {" "}Baca Selengkapnya..
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expand / Collapse Button if > 15 messages and not searching */}
              {!searchQuery && messages.length > 15 && (
                <div className={styles.expandRow}>
                  <button
                    type="button"
                    className={styles.expandBtn}
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? (
                      <>
                        <i className="bx bx-chevron-up" /> Ciutkan Papan Ucapan
                      </>
                    ) : (
                      <>
                        <i className="bx bx-chevron-down" /> Lihat Semua ({messages.length} Ucapan Tertempel)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Detail Popup */}
      {modalData && (
        <div className={styles.modalOverlay} onClick={() => setModalData(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalPin}>
              <div className={styles.pinHead} />
              <div className={styles.pinNeedle} />
            </div>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setModalData(null)}
              aria-label="Tutup"
            >
              &times;
            </button>
            <div className={styles.modalHeader}>
              <span className={styles.modalBadge}>#ErineTheWayfinder</span>
              <h3 className={styles.modalName}>{modalData.name}</h3>
              <div className={styles.modalDate}>{modalData.date}</div>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalMsg}>&ldquo;{modalData.msg}&rdquo;</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
