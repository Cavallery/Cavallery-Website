"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

interface FanartItem {
  id: number | string;
  title: string;
  artist_name: string;
  artist_social?: string | null;
  description?: string | null;
  image_url: string;
  highres_url?: string | null;
  likes: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function FanartPage() {
  const [items, setItems] = useState<FanartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<"newest" | "popular">("newest");
  const [search, setSearch] = useState("");

  // Submit Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [artistSocial, setArtistSocial] = useState("");
  const [description, setDescription] = useState("");
  const [highresUrl, setHighresUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Lightbox Modal state
  const [activeLightbox, setActiveLightbox] = useState<FanartItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string | number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFanarts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("status", "approved");
      params.set("sort", activeSort);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/fanart?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Fetch fanart error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFanarts();
  }, [activeSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFanarts();
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

  const handleLike = async (item: FanartItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedIds.has(item.id)) return;

    setLikedIds((prev) => new Set(prev).add(item.id));
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, likes: (i.likes || 0) + 1 } : i))
    );

    try {
      await fetch("/api/fanart/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Mohon isi Judul Karya Seni.");
      return;
    }
    if (!artistName.trim()) {
      setFormError("Mohon isi Nama Seniman / Kredit.");
      return;
    }
    if (!selectedFile) {
      setFormError("Mohon pilih dan upload berkas gambar karya Anda.");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload File Gambar
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await fetch("/api/fanart/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.status) {
        throw new Error(uploadJson.message || "Gagal mengunggah gambar");
      }

      const imageUrl = uploadJson.data.image_url;

      // 2. Submit Data Fanart
      const submitRes = await fetch("/api/fanart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artist_name: artistName.trim(),
          artist_social: artistSocial.trim() || null,
          description: description.trim() || null,
          image_url: imageUrl,
          highres_url: highresUrl.trim() || null,
          status: "pending",
        }),
      });

      const submitJson = await submitRes.json();
      if (submitRes.ok && submitJson.success) {
        setSubmitted(true);
      } else {
        setFormError(submitJson.message || "Gagal mengirimkan karya.");
      }
    } catch (err: any) {
      setFormError(err.message || "Terjadi kendala saat mengirimkan karya.");
    } finally {
      setUploading(false);
    }
  };

  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setSubmitted(false);
    setTitle("");
    setArtistName("");
    setArtistSocial("");
    setDescription("");
    setHighresUrl("");
    removeSelectedFile();
    setFormError("");
  };

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge">
            <i className="bx bx-palette" /> Fanart Cavallery
          </div>
          <h1 className={styles.heroTitle}>
            Fanart <span className="textGold">Erine</span>
          </h1>
          <p className={styles.heroSub}>
            Sudut pameran ilustrasi indah, komik menarik, dan karya visual kreatif hasil goresan tangan berbakat rekan-rekan komunitas Cavallery untuk Catherina Vallencia (Erine) JKT48.
          </p>
          <button
            className={styles.heroCtaBtn}
            onClick={() => setShowSubmitModal(true)}
          >
            <i className="bx bx-cloud-upload" /> Kirim Karya Fanart Anda
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {/* Toolbar: Filters & Search */}
        <div className={styles.toolbar}>
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterBtn} ${activeSort === "newest" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveSort("newest")}
            >
              <i className="bx bx-time-five" /> Terbaru
            </button>
            <button
              className={`${styles.filterBtn} ${activeSort === "popular" ? styles.filterBtnActive : ""}`}
              onClick={() => setActiveSort("popular")}
            >
              <i className="bx bxs-heart" /> Terpopuler
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className={styles.searchWrap}>
            <i className={`bx bx-search ${styles.searchIcon}`} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari judul atau seniman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className={styles.loadingState}>
            <i className="bx bx-loader-alt bx-spin" />
            <p>Memuat karya fanart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="bx bx-palette" />
            <h3>Belum Ada Karya Fanart Ditampilkan</h3>
            <p>Jadilah yang pertama mengirimkan karya seni atau ilustrasimu untuk Erine!</p>
            <button
              className={styles.heroCtaBtn}
              style={{ marginTop: 12 }}
              onClick={() => setShowSubmitModal(true)}
            >
              <i className="bx bx-cloud-upload" /> Submit Karya Pertama
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <div
                key={item.id}
                className={styles.card}
                onClick={() => setActiveLightbox(item)}
              >
                <div className={styles.cardImgWrap}>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className={styles.cardImg}
                    loading="lazy"
                  />
                  <div className={styles.overlayZoom}>
                    <i className="bx bx-expand-alt" />
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>

                  <div className={styles.artistRow}>
                    {item.artist_social ? (
                      <a
                        href={item.artist_social.startsWith("http") ? item.artist_social : `https://x.com/${item.artist_social.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.artistName}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="bx bx-user" /> {item.artist_name}
                      </a>
                    ) : (
                      <span className={styles.artistName}>
                        <i className="bx bx-user" /> {item.artist_name}
                      </span>
                    )}

                    <span className={styles.dateBadge}>
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {item.description && (
                    <p className={styles.cardDesc}>{item.description}</p>
                  )}

                  <div className={styles.cardFooter}>
                    <button
                      className={styles.likeBtn}
                      onClick={(e) => handleLike(item, e)}
                    >
                      <i className={likedIds.has(item.id) ? "bx bxs-heart" : "bx bx-heart"} />{" "}
                      {item.likes || 0} Suka
                    </button>

                    {item.highres_url && (
                      <a
                        href={item.highres_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.actionPill}
                        style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="bx bx-link-external" /> Versi HD
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── SUBMIT FANART MODAL ─── */}
      {showSubmitModal && (
        <div className={styles.modalOverlay} onClick={closeSubmitModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <i className="bx bx-paint" /> Submit Karya Fanart Anda
              </h2>
              <button className={styles.closeBtn} onClick={closeSubmitModal}>
                <i className="bx bx-x" />
              </button>
            </div>

            {submitted ? (
              <div className={styles.successBox}>
                <i className={`bx bx-check-circle ${styles.successIcon}`} />
                <h3 className={styles.successTitle}>Karya Seni Berhasil Dikirim!</h3>
                <p className={styles.successDesc}>
                  Terima kasih banyak atas karya indahmu untuk Erine! Tim kurasi Cavallery akan memeriksa dan menerbitkan karyamu ke halaman galeri fanart.
                </p>
                <button className={styles.submitBtn} onClick={closeSubmitModal}>
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                {formError && (
                  <div style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: 8, fontSize: "0.86rem" }}>
                    <i className="bx bx-error-circle" /> {formError}
                  </div>
                )}

                {/* Judul Karya Seni */}
                <div className={styles.field}>
                  <label>
                    Judul Karya Seni <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Chibi Erine Summer Festival"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Nama Seniman / Kredit */}
                <div className={styles.field}>
                  <label>
                    Nama Seniman / Kredit <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: @seniman_cava (X) atau Nama Kamu"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    required
                  />
                </div>

                {/* Akun Sosial Media / Link Profil */}
                <div className={styles.field}>
                  <label>Link Akun Media Sosial (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: https://x.com/username atau https://instagram.com/username"
                    value={artistSocial}
                    onChange={(e) => setArtistSocial(e.target.value)}
                  />
                </div>

                {/* Deskripsi Singkat */}
                <div className={styles.field}>
                  <label>Deskripsi Singkat Karya</label>
                  <textarea
                    placeholder="Ceritakan sedikit inspirasi di balik pembuatan ilustrasi ini..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* File Upload Berkas Gambar */}
                <div className={styles.field}>
                  <label>
                    Pilih Berkas Gambar (JPG/PNG/WebP) <span>*</span>
                  </label>
                  <span className={styles.fieldSubtext}>
                    Unggah file ilustrasi gambar Anda (Maksimal 15MB).
                  </span>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                  />

                  {previewUrl ? (
                    <div className={styles.previewWrap}>
                      <img src={previewUrl} alt="Preview Fanart" className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.removePreviewBtn}
                        onClick={removeSelectedFile}
                        title="Hapus gambar"
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
                      <span className={styles.dropzoneTitle}>Pilih Berkas Gambar (JPG/PNG)</span>
                      <span className={styles.fieldSubtext}>Klik di sini untuk memilih berkas dari perangkat</span>
                    </div>
                  )}
                </div>

                {/* Link File Resolusi Tinggi (Opsional) */}
                <div className={styles.field}>
                  <label>Link File Resolusi Tinggi / Cloud (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Link Google Drive jika ingin membagikan versi resolusi HD"
                    value={highresUrl}
                    onChange={(e) => setHighresUrl(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Mengunggah & Mengirim...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send" /> Kirim Karya Fanart
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── LIGHTBOX MODAL ─── */}
      {activeLightbox && (
        <div
          className={styles.lightboxModal}
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxImgWrap}>
              <img
                src={activeLightbox.image_url}
                alt={activeLightbox.title}
                className={styles.lightboxImg}
              />
            </div>

            <div className={styles.lightboxDetails}>
              <div className={styles.lightboxTop}>
                <div>
                  <h3 className={styles.lightboxTitle}>{activeLightbox.title}</h3>
                  <div className={styles.lightboxArtist}>
                    Oleh <strong>{activeLightbox.artist_name}</strong>
                  </div>
                </div>
                <button
                  className={styles.closeBtn}
                  onClick={() => setActiveLightbox(null)}
                >
                  <i className="bx bx-x" />
                </button>
              </div>

              {activeLightbox.description && (
                <p className={styles.lightboxDesc}>{activeLightbox.description}</p>
              )}

              <div className={styles.lightboxActions}>
                <button
                  className={styles.likeBtn}
                  onClick={(e) => handleLike(activeLightbox, e)}
                >
                  <i className={likedIds.has(activeLightbox.id) ? "bx bxs-heart" : "bx bx-heart"} />{" "}
                  {activeLightbox.likes || 0} Suka
                </button>

                {activeLightbox.artist_social && (
                  <a
                    href={activeLightbox.artist_social.startsWith("http") ? activeLightbox.artist_social : `https://x.com/${activeLightbox.artist_social.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.actionPill}
                  >
                    <i className="bx bx-user" /> Profil Seniman
                  </a>
                )}

                {activeLightbox.highres_url && (
                  <a
                    href={activeLightbox.highres_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.actionPill}
                  >
                    <i className="bx bx-download" /> Unduh Versi HD
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
