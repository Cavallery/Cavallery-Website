"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./JournalSection.module.css";

interface Message {
  id?: number | string;
  name: string;
  handle?: string;
  msg: string;
  spotify_url?: string | null;
  spotify_title?: string | null;
  spotify_artist?: string | null;
  spotify_thumbnail?: string | null;
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

// Extract Spotify track ID for optional iframe embed toggle
function extractSpotifyTrackId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export default function JournalSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalData, setModalData] = useState<Message | null>(null);
  const [activePlayingId, setActivePlayingId] = useState<number | string | null>(null);
  const [showForm, setShowForm] = useState(true);
  
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
            handle: item.handle || "",
            msg: item.msg || item.pesan || item.message || "",
            spotify_url: item.spotify_url || null,
            spotify_title: item.spotify_title || null,
            spotify_artist: item.spotify_artist || null,
            spotify_thumbnail: item.spotify_thumbnail || null,
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
    const handle = (fd.get("handle") as string) || "";
    const spotifyUrl = (fd.get("spotify_url") as string) || "";
    const msg = (fd.get("pesan") as string) || "";

    if (!msg.trim()) return;

    let cleanHandle = handle.trim();
    if (cleanHandle && !cleanHandle.startsWith("@")) {
      cleanHandle = `@${cleanHandle}`;
    }

    const tempId = Date.now();
    const newMsg: Message = {
      id: tempId,
      name: name.trim() || "Anonim",
      handle: cleanHandle,
      msg: msg.trim(),
      spotify_url: spotifyUrl.trim() || null,
      date: formatDate(new Date().toISOString()),
    };

    setMessages((prev) => [newMsg, ...prev]);
    setIsSubmitted(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonim",
          handle: cleanHandle,
          spotify_url: spotifyUrl.trim(),
          msg: msg.trim(),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // Update with resolved spotify metadata from server
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, ...json.data, date: formatDate(json.data.date) } : m))
          );
        }
      }
    } catch (err) {
      console.error("Gagal mengirim pesan journal:", err);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        {/* Header Title */}
        <div className={styles.header}>
          <span className={styles.badgeHeader}>📌 PAPAN MADING MEMORINE</span>
          <h1 className={styles.mainTitle}>Yuk Titip Pesan &amp; Lagu untuk Erine</h1>
          <p className={styles.subTitle}>
            Sematkan harapan terbaikmu beserta lagu Spotify favoritmu di papan mading digital Cavallery.
          </p>
          <div className={styles.headerActionRow}>
            <button
              type="button"
              className={styles.toggleFormBtn}
              onClick={() => setShowForm(!showForm)}
            >
              <i className={`bx ${showForm ? "bx-chevron-up" : "bx-edit"}`} />
              {showForm ? "Sembunyikan Form" : "Tulis Pesan Baru"}
            </button>
          </div>
        </div>

        {/* Form Sematkan Pesan di Papan Mading */}
        {showForm && (
          <div className={styles.formContainer}>
            {!isSubmitted ? (
              <section className={styles.formBoard}>
                <div className={styles.formHeaderRow}>
                  <div className={styles.formPin} />
                  <h3>Tulis Catatan MemoRine</h3>
                  <p>Catatanmu akan ditempel langsung di papan mading untuk Erine!</p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.inputGrid}>
                    <div className={styles.field}>
                      <label>Nama Kamu *</label>
                      <input
                        type="text"
                        name="Nama"
                        placeholder="Contoh: Santoso"
                        required
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Username / Handle Medsos (Opsional)</label>
                      <input
                        type="text"
                        name="handle"
                        placeholder="Contoh: @siapakahsayart"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>
                      <i className="bx bxl-spotify" style={{ color: "#1db954", marginRight: 4 }} />
                      URL Lagu Spotify (Opsional)
                    </label>
                    <input
                      type="url"
                      name="spotify_url"
                      placeholder="Contoh: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
                      className={styles.input}
                    />
                    <span className={styles.hint}>
                      Buka Spotify &gt; Bagikan (Share) &gt; Salin Tautan Lagu untuk memunculkan pemutar lagu di catatanmu.
                    </span>
                  </div>

                  <div className={styles.field}>
                    <label>Pesan &amp; Harapan untuk Erine *</label>
                    <textarea
                      name="pesan"
                      rows={4}
                      placeholder="Tuliskan ucapan, doa, dan kata-kata penyemangat untuk Erine di sini..."
                      required
                      className={styles.textarea}
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    <i className="bx bxs-pin" /> SEMATKAN KE PAPAN MADING
                  </button>
                </form>
              </section>
            ) : (
              <div className={styles.successMsgCard}>
                <div className={styles.successIcon}>
                  <i className="bx bxs-check-circle" />
                </div>
                <h3>Pesan Berhasil Disematkan! ✨</h3>
                <p>Terima kasih sudah mengirimkan cinta dan doa tulus untuk Erine.</p>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => setIsSubmitted(false)}
                >
                  <i className="bx bx-plus" /> Kirim Pesan Lainnya
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PAPAN MADING BULLETIN BOARD ── */}
        <div className={styles.madingBoardFrame}>
          {/* Corkboard / Bulletin Board Surface */}
          <div className={styles.corkBoardSurface}>
            <div className={styles.boardWoodTrimTop} />
            
            {loading ? (
              <div className={styles.boardLoading}>
                <i className="bx bx-loader-alt bx-spin" /> Memuat pesan di papan mading...
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.boardEmpty}>
                <i className="bx bx-note" />
                <h4>Papan Mading Masih Kosong</h4>
                <p>Jadilah yang pertama menyematkan pesan cinta dan lagu Spotify untuk Erine di atas! 💌</p>
              </div>
            ) : (
              <div className={styles.notesGrid}>
                {messages.map((m, idx) => {
                  const trackId = extractSpotifyTrackId(m.spotify_url);
                  const isPlaying = activePlayingId === (m.id || idx);
                  const isLongMsg = m.msg.length > 150;
                  const displayMsg = isLongMsg ? `${m.msg.slice(0, 145)}...` : m.msg;

                  return (
                    <div
                      key={m.id || idx}
                      className={styles.stickyNote}
                      style={{
                        animationDelay: `${(idx % 12) * 0.05}s`,
                      }}
                    >
                      {/* Realistic Pushpin */}
                      <div className={styles.notePushPin} title="Tertempel di papan mading">
                        <div className={styles.pinHead} />
                        <div className={styles.pinShadow} />
                      </div>

                      {/* Note Header: Author, Handle & Date */}
                      <div className={styles.noteHeader}>
                        <div className={styles.authorGroup}>
                          <h4 className={styles.authorName}>{m.name}</h4>
                          {m.handle && <span className={styles.authorHandle}>{m.handle}</span>}
                        </div>
                        <div className={styles.noteDate}>{m.date}</div>
                      </div>

                      {/* Note Message Body */}
                      <div className={styles.noteBody}>
                        <p className={styles.noteText}>
                          {displayMsg}
                          {isLongMsg && (
                            <span
                              className={styles.readMoreBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalData(m);
                              }}
                            >
                              {" "}Read More..
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Spotify Mini-Player Widget (Matching Image 2) */}
                      {m.spotify_url && (
                        <div className={styles.spotifyWidget}>
                          {isPlaying && trackId ? (
                            <div className={styles.spotifyIframeWrap}>
                              <iframe
                                src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                              />
                              <button
                                type="button"
                                className={styles.closeIframeBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePlayingId(null);
                                }}
                                title="Tutup Pemutar"
                              >
                                &times;
                              </button>
                            </div>
                          ) : (
                            <div className={styles.spotifyBar}>
                              {/* Album Art Thumbnail */}
                              <img
                                src={
                                  m.spotify_thumbnail ||
                                  "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
                                }
                                alt={m.spotify_title || "Spotify Track"}
                                className={styles.spotifyThumb}
                              />

                              {/* Track Info */}
                              <div className={styles.spotifyInfo}>
                                <div className={styles.spotifyTitleRow}>
                                  <span className={styles.spotifyTrackTitle}>
                                    {m.spotify_title || "Lagu Pilihan untuk Erine"}
                                  </span>
                                  <i className={`bx bxl-spotify ${styles.spotifyLogoIcon}`} />
                                </div>
                                <span className={styles.spotifyArtist}>
                                  {m.spotify_artist || "JKT48"}
                                </span>
                                <div className={styles.spotifyProgressRow}>
                                  <div className={styles.spotifyProgressBar}>
                                    <div className={styles.spotifyProgressFill} />
                                  </div>
                                  <span className={styles.spotifyDuration}>04:40</span>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className={styles.spotifyControls}>
                                <a
                                  href={m.spotify_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.spotifyIconBtn}
                                  title="Buka di Aplikasi Spotify"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <i className="bx bx-plus-circle" />
                                </a>
                                <button
                                  type="button"
                                  className={styles.spotifyPlayBtn}
                                  title="Putar Lagu"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (trackId) {
                                      setActivePlayingId(isPlaying ? null : (m.id || idx));
                                    } else {
                                      window.open(m.spotify_url || "", "_blank");
                                    }
                                  }}
                                >
                                  <i className="bx bx-play" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Full Note Modal */}
      {modalData && (
        <div className={styles.modalOverlay} onClick={() => setModalData(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalPin} />
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setModalData(null)}
            >
              &times;
            </button>

            <div className={styles.noteHeader}>
              <div className={styles.authorGroup}>
                <h3 className={styles.authorName} style={{ fontSize: "1.4rem" }}>
                  {modalData.name}
                </h3>
                {modalData.handle && (
                  <span className={styles.authorHandle} style={{ fontSize: "1rem" }}>
                    {modalData.handle}
                  </span>
                )}
              </div>
              <div className={styles.noteDate}>{modalData.date}</div>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>"{modalData.msg}"</p>
            </div>

            {modalData.spotify_url && (
              <div style={{ marginTop: 20 }}>
                {extractSpotifyTrackId(modalData.spotify_url) ? (
                  <iframe
                    src={`https://open.spotify.com/embed/track/${extractSpotifyTrackId(
                      modalData.spotify_url
                    )}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ borderRadius: 16 }}
                  />
                ) : (
                  <a
                    href={modalData.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.modalSpotifyLink}
                  >
                    <i className="bx bxl-spotify" /> Dengarkan Lagu di Spotify
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

