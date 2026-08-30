"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

interface TwoShotItem {
  id: number | string;
  user_name: string;
  user_social?: string | null;
  event_name?: string | null;
  event_date?: string | null;
  message: string;
  image_url: string;
  likes: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const STORAGE_KEY = "cavallery_2s_submitted_v1";

export default function TwoShotPage() {
  const [items, setItems] = useState<TwoShotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<"newest" | "popular" | "oldest">("newest");
  const [search, setSearch] = useState("");

  // Submit Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const [userName, setUserName] = useState("");
  const [userSocial, setUserSocial] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Lightbox Modal state
  const [activeLightbox, setActiveLightbox] = useState<TwoShotItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string | number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHasSubmittedBefore(true);
      }
    } catch {}
  }, []);

  const fetchTwoShots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("status", "approved");
      params.set("sort", activeSort);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/twoshot?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Fetch twoshot error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwoShots();
  }, [activeSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTwoShots();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormError("Format berkas harus berupa gambar (JPG, PNG, WebP)");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormError("");
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLike = async (item: TwoShotItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedIds.has(item.id)) return;

    setLikedIds((prev) => new Set(prev).add(item.id));
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, likes: (i.likes || 0) + 1 } : i))
    );

    try {
      await fetch("/api/twoshot/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (hasSubmittedBefore) {
      setFormError("Kamu sudah pernah mengirimkan 1 foto 2-Shot. Setiap penggemar dibatasi maksimal 1 kiriman.");
      return;
    }

    if (!userName.trim()) {
      setFormError("Mohon isi Nama Penggemar.");
      return;
    }
    if (!message.trim()) {
      setFormError("Mohon tulis Pesan tulus kamu untuk Erine.");
      return;
    }
    if (!selectedFile) {
      setFormError("Mohon pilih dan upload foto 2-Shot kamu.");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload Foto 2-Shot
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await fetch("/api/twoshot/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.status) {
        throw new Error(uploadJson.message || "Gagal mengunggah foto 2-Shot");
      }

      const imageUrl = uploadJson.data.image_url;

      // 2. Submit Data 2-Shot & Pesan (Status default: pending untuk di-ACC admin)
      const submitRes = await fetch("/api/twoshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: userName.trim(),
          user_social: userSocial.trim() || null,
          event_name: eventName.trim() || "2-Shot with Erine",
          event_date: eventDate.trim() || null,
          message: message.trim(),
          image_url: imageUrl,
          status: "pending",
        }),
      });

      const submitJson = await submitRes.json();
      if (!submitRes.ok || !submitJson.success) {
        throw new Error(submitJson.message || "Gagal mengirim data 2-Shot");
      }

      // Catat bahwa user sudah mengirim 1x
      try {
        localStorage.setItem(STORAGE_KEY, "true");
        setHasSubmittedBefore(true);
      } catch {}

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowSubmitModal(false);
        setUserName("");
        setUserSocial("");
        setEventName("");
        setEventDate("");
        setMessage("");
        removeSelectedFile();
      }, 3000);
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan saat mengirim.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ─── HERO SECTION ─── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <i className="bx bx-pin" /> Papan Mading Kenangan
          </div>
          <h1 className={styles.heroTitle}>
            <span>2S with</span>
            <span className={styles.heroTitleHighlight}>Erine</span>
          </h1>
          <p className={styles.heroSub}>
            Papan mading polaroid kenangan 2-Shot bersama Catherina Vallencia (Erine) JKT48. 
            Semua momen hangat, tawa, dan pesan manis dari para Cavalliers tertempel di sini!
          </p>

          <button
            className={styles.heroCtaBtn}
            onClick={() => setShowSubmitModal(true)}
          >
            <i className="bx bx-pin" /> {hasSubmittedBefore ? "Cek Status 2-Shot Kamu" : "Tempel 2-Shot & Pesan Kamu"}
          </button>
        </div>
      </section>

      {/* ─── PAPAN MADING CORKBOARD ─── */}
      <div className={styles.container}>
        <div className={styles.madingBoard}>
          {/* Header Mading Toolbar */}
          <div className={styles.boardHeaderBanner}>
            <div className={styles.boardTitleTag}>
              <i className="bx bxs-pin" style={{ color: "#e11d48" }} />
              <span>Mading Foto & Pesan 2-Shot</span>
            </div>

            <div className={styles.toolbarControls}>
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterBtn} ${activeSort === "newest" ? styles.filterBtnActive : ""}`}
                  onClick={() => setActiveSort("newest")}
                >
                  <i className="bx bx-time" /> Terbaru
                </button>
                <button
                  className={`${styles.filterBtn} ${activeSort === "popular" ? styles.filterBtnActive : ""}`}
                  onClick={() => setActiveSort("popular")}
                >
                  <i className="bx bxs-heart" /> Terpopuler
                </button>
                <button
                  className={`${styles.filterBtn} ${activeSort === "oldest" ? styles.filterBtnActive : ""}`}
                  onClick={() => setActiveSort("oldest")}
                >
                  <i className="bx bx-history" /> Paling Lama
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className={styles.searchWrap}>
                <i className={`bx bx-search ${styles.searchIcon}`} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Cari foto di mading..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Banner Status Jika Sudah Pernah Submit */}
          {hasSubmittedBefore && (
            <div className={styles.alreadySubmittedBanner}>
              <i className="bx bxs-check-shield" style={{ fontSize: "1.3rem" }} />
              <span>Kamu sudah mengirimkan 1 foto 2-Shot. Kirimanmu sedang dalam tahap pemeriksaan (ACC) oleh Admin atau sudah terbit di mading!</span>
            </div>
          )}

          {/* RULES SECTION MADING */}
          <div className={styles.rulesBox}>
            <div className={styles.rulesHeader}>
              <i className="bx bx-notepad" style={{ fontSize: "1.25rem" }} />
              <span>Rules & Ketentuan Kirim Foto 2-Shot:</span>
            </div>
            <ul className={styles.rulesList}>
              <li className={styles.ruleItem}>
                <span className={styles.ruleNumber}>1</span>
                <span><strong>Batas 1x Kirim:</strong> Setiap penggemar hanya diperbolehkan mengirim <strong>1 foto 2-Shot</strong> terbaik bersama Erine.</span>
              </li>
              <li className={styles.ruleItem}>
                <span className={styles.ruleNumber}>2</span>
                <span><strong>Verifikasi Admin (ACC):</strong> Foto & pesan tidak langsung muncul, melainkan akan <strong>diperiksa dan di-ACC oleh Admin Cavallery</strong> terlebih dahulu.</span>
              </li>
              <li className={styles.ruleItem}>
                <span className={styles.ruleNumber}>3</span>
                <span><strong>Foto Sopan & Orisinal:</strong> Foto 2-Shot asli bersama Erine, tidak blur parah, dan menjaga norma kesopanan.</span>
              </li>
              <li className={styles.ruleItem}>
                <span className={styles.ruleNumber}>4</span>
                <span><strong>Pesan Positif:</strong> Tuliskan pesan yang hangat, memotivasi, dan menghargai Erine sebagai idol.</span>
              </li>
            </ul>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingState}>
              <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2.5rem", color: "#e11d48", marginBottom: "1rem" }} />
              <p>Membuka papan mading 2S with Erine...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div className={styles.emptyState}>
              <i className={`bx bx-camera-off ${styles.emptyStateIcon}`} />
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Papan Mading Masih Kosong</h3>
              <p style={{ maxWidth: 450, margin: "0.5rem auto 1.5rem" }}>
                Yuk jadi yang pertama menempelkan foto 2-Shot dan pesan hangatmu untuk Erine di papan mading ini!
              </p>
              <button
                className={styles.heroCtaBtn}
                onClick={() => setShowSubmitModal(true)}
              >
                <i className="bx bx-pin" /> Tempel Foto 2-Shot
              </button>
            </div>
          )}

          {/* Grid Polaroid Cards */}
          {!loading && items.length > 0 && (
            <div className={styles.grid}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={styles.polaroidCard}
                  onClick={() => setActiveLightbox(item)}
                >
                  {/* Pushpin at the top */}
                  <div className={styles.pushPin} />

                  {/* Photo Frame */}
                  <div className={styles.photoFrame}>
                    <img
                      src={item.image_url}
                      alt={`2-Shot Erine oleh ${item.user_name}`}
                      className={styles.photoImg}
                      loading="lazy"
                    />
                    {item.event_name && (
                      <div className={styles.eventSticker}>
                        <i className="bx bx-calendar-heart" /> {item.event_name}
                      </div>
                    )}
                    <button
                      className={`${styles.likePinBtn} ${likedIds.has(item.id) ? styles.likePinBtnActive : ""}`}
                      onClick={(e) => handleLike(item, e)}
                      aria-label="Suka foto ini"
                      title="Sukai foto 2-Shot"
                    >
                      <i className={`bx ${likedIds.has(item.id) ? "bxs-heart" : "bx-heart"}`} />
                      <span>{item.likes || 0}</span>
                    </button>
                  </div>

                  {/* Polaroid Body: Name, Social, and Sticky Memo */}
                  <div className={styles.polaroidBody}>
                    <div className={styles.polaroidHeader}>
                      <div className={styles.fansName}>
                        {item.user_name}
                      </div>
                      {item.user_social && (
                        <span className={styles.fansSocial}>{item.user_social}</span>
                      )}
                    </div>

                    {/* Yellow Sticky Note Memo for Message */}
                    {item.message && (
                      <div className={styles.stickyMemo}>
                        "{item.message}"
                      </div>
                    )}

                    <div className={styles.polaroidFooter}>
                      <span>
                        {item.event_date || new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className={styles.readMoreHint}>
                        <i className="bx bx-expand-alt" /> Buka
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL SUBMIT 2-SHOT ─── */}
      {showSubmitModal && (
        <div className={styles.modalOverlay} onClick={() => !uploading && setShowSubmitModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-pin" style={{ color: "#e11d48" }} />
                Tempel Foto 2-Shot & Pesan di Mading
              </h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => !uploading && setShowSubmitModal(false)}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            {hasSubmittedBefore && !submitted ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <i className="bx bxs-badge-check" style={{ fontSize: "3.5rem", color: "#10b981", marginBottom: "0.8rem", display: "block" }} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                  Kamu Sudah Mengirimkan 1 Foto 2-Shot
                </h3>
                <p style={{ color: "var(--fg-muted)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 1.5rem", fontSize: "0.9rem" }}>
                  Sesuai ketentuan, setiap penggemar hanya diperbolehkan mengirimkan <strong>1 foto 2-Shot</strong>. Foto kamu sedang dalam antrean verifikasi atau sudah di-ACC oleh Admin Cavallery.
                </p>
                <button
                  type="button"
                  className={styles.submitBtn}
                  style={{ margin: "0 auto" }}
                  onClick={() => setShowSubmitModal(false)}
                >
                  <i className="bx bx-check" /> Mengerti
                </button>
              </div>
            ) : submitted ? (
              <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                <i className="bx bxs-check-circle" style={{ fontSize: "4rem", color: "#10b981", marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                  Momen 2-Shot Berhasil Dikirim!
                </h3>
                <p style={{ color: "var(--fg-muted)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
                  Terima kasih sudah berbagi momen dan pesan manis untuk Erine. <strong>Admin Cavallery akan segera mengecek dan meng-ACC foto kamu</strong> sebelum tampil di papan mading.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  {formError && (
                    <div style={{ padding: "10px 14px", background: "rgba(225, 29, 72, 0.1)", border: "1px solid rgba(225, 29, 72, 0.3)", borderRadius: 10, color: "#e11d48", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="bx bx-error-circle" style={{ fontSize: "1.2rem" }} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Rules reminder inside form */}
                  <div style={{ background: "rgba(225, 29, 72, 0.05)", borderLeft: "3px solid #e11d48", padding: "8px 12px", borderRadius: "0 8px 8px 0", fontSize: "0.82rem", color: "var(--fg-muted)" }}>
                    <i className="bx bx-info-circle" style={{ color: "#e11d48", marginRight: 4 }} />
                    Batas: <strong>1 foto per orang</strong>. Foto akan diperiksa dan di-ACC Admin sebelum tampil di mading.
                  </div>

                  {/* Upload Foto */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Foto 2-Shot <span className={styles.formRequired}>*</span>
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                    />

                    {previewUrl ? (
                      <div className={styles.previewWrap}>
                        <img src={previewUrl} alt="Preview 2-Shot" className={styles.previewImg} />
                        <button
                          type="button"
                          className={styles.removePreviewBtn}
                          onClick={removeSelectedFile}
                          title="Hapus foto"
                        >
                          <i className="bx bx-trash" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={styles.dropzone}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className={`bx bx-cloud-upload ${styles.dropzoneIcon}`} />
                        <span className={styles.dropzoneText}>Pilih Foto 2-Shot Polaroid Kamu</span>
                        <span className={styles.dropzoneSub}>Format JPG, PNG, WebP (Maks. 20MB)</span>
                      </div>
                    )}
                  </div>

                  {/* Nama Penggemar */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Nama Kamu / Panggilan <span className={styles.formRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Contoh: Aditya / Cavalliers"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Akun Medsos */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Akun Media Sosial <span style={{ fontSize: "0.78rem", color: "var(--fg-dim)", fontWeight: 400 }}>(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Contoh: @username_x / @instagram"
                      value={userSocial}
                      onChange={(e) => setUserSocial(e.target.value)}
                    />
                  </div>

                  {/* Nama Event & Tanggal */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Event / Sesi</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Contoh: Seitansai / 2S Theater"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tanggal 2-Shot</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Contoh: 22 Agustus 2026"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Pesan Buat Erine */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Pesan Sticky Note untuk Erine <span className={styles.formRequired}>*</span>
                    </label>
                    <textarea
                      className={styles.formTextarea}
                      placeholder="Tuliskan ucapan manis, kenangan seru 2-Shot, atau kata-kata penyemangat untuk Erine..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowSubmitModal(false)}
                    disabled={uploading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <i className="bx bx-loader-alt bx-spin" /> Mengirimkan...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-pin" /> Tempel di Mading
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL LIGHTBOX / DETAIL ─── */}
      {activeLightbox && (
        <div className={styles.modalOverlay} onClick={() => setActiveLightbox(null)}>
          <div
            className={`${styles.modalContent} ${styles.lightboxModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxImageWrap}>
              <img
                src={activeLightbox.image_url}
                alt={`2-Shot oleh ${activeLightbox.user_name}`}
                className={styles.lightboxImage}
              />
            </div>

            <div className={styles.lightboxInfo}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div className={styles.lightboxAuthorWrap}>
                    <div className={styles.lightboxAvatar}>
                      {activeLightbox.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.lightboxAuthorName}>{activeLightbox.user_name}</div>
                      {activeLightbox.user_social && (
                        <div style={{ fontSize: "0.82rem", color: "#e11d48", fontWeight: 600 }}>
                          {activeLightbox.user_social}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className={styles.modalCloseBtn}
                    onClick={() => setActiveLightbox(null)}
                  >
                    <i className="bx bx-x" />
                  </button>
                </div>

                <div className={styles.lightboxMetaRow}>
                  {activeLightbox.event_name && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(225, 29, 72, 0.1)", color: "#e11d48", padding: "4px 10px", borderRadius: 8, fontWeight: 700, fontSize: "0.8rem" }}>
                      <i className="bx bx-calendar-event" /> {activeLightbox.event_name}
                    </span>
                  )}
                  <span>
                    <i className="bx bx-time" /> {activeLightbox.event_date || new Date(activeLightbox.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

                <div style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg-dim)" }}>
                  <i className="bx bxs-note" style={{ color: "#eab308", marginRight: 4 }} /> Pesan Tempel untuk Erine:
                </div>

                <div className={styles.lightboxMessageFull}>
                  "{activeLightbox.message}"
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <button
                  className={`${styles.likePinBtn} ${likedIds.has(activeLightbox.id) ? styles.likePinBtnActive : ""}`}
                  style={{ position: "static" }}
                  onClick={(e) => handleLike(activeLightbox, e)}
                >
                  <i className={`bx ${likedIds.has(activeLightbox.id) ? "bxs-heart" : "bx-heart"}`} />
                  <span>{activeLightbox.likes || 0} Suka</span>
                </button>

                <span style={{ fontSize: "0.8rem", color: "var(--fg-dim)" }}>
                  Papan Mading Cavallery
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
