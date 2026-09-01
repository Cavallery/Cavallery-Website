"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function getDefaultPeriode() {
  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function KasPage() {
  const [activeTab, setActiveTab] = useState<"bayar" | "status">("bayar");

  // Form State
  const [periode, setPeriode] = useState(getDefaultPeriode);
  const [nominal, setNominal] = useState("20000");
  const [selectedChip, setSelectedChip] = useState<number | "custom">(20000);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status & Submit state
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Kas History State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/kas");
      const json = await res.json();
      if (json.status && json.data) {
        setHistoryList(json.data);
      }
    } catch {
      console.error("Failed to load kas history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "status") {
      fetchHistory();
    }
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setAlert({ type: "error", msg: "File harus berupa gambar (JPG, PNG, WebP)" });
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleChipClick = (amount: number) => {
    setSelectedChip(amount);
    setNominal(String(amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!periode.trim()) {
      setAlert({ type: "error", msg: "Periode kas wajib diisi." });
      return;
    }

    const cleanNominal = parseInt(nominal.replace(/\D/g, ""), 10);
    if (!cleanNominal || cleanNominal <= 0) {
      setAlert({ type: "error", msg: "Nominal pembayaran tidak valid." });
      return;
    }

    if (!file) {
      setAlert({ type: "error", msg: "Mohon unggah bukti pembayaran transfer/QRIS." });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload Bukti Bayar
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.status) {
        throw new Error(uploadJson.message || "Gagal mengunggah bukti bayar");
      }

      const buktiBayarUrl = uploadJson.url;

      // 2. Submit Kas Confirmation
      const kasRes = await fetch("/api/kas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periode,
          nominal: cleanNominal,
          buktiBayarUrl,
        }),
      });

      const kasJson = await kasRes.json();
      if (!kasRes.ok || !kasJson.status) {
        throw new Error(kasJson.message || "Gagal mengirim konfirmasi kas");
      }

      setAlert({
        type: "success",
        msg: "Konfirmasi pembayaran kas berhasil dikirim! Menunggu verifikasi admin.",
      });

      // Reset form
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message || "Terjadi kesalahan saat memproses kas." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Bar with Back Link & Tabs */}
        <div className={styles.topBar}>
          <Link href="/profil" className={styles.backBtn}>
            <i className="bx bx-arrow-back" /> Kembali ke Profil
          </Link>

          <div className={styles.tabPill}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "bayar" ? styles.tabBtnActive : ""}`}
              onClick={() => {
                setActiveTab("bayar");
                setAlert(null);
              }}
            >
              <i className="bx bx-wallet" /> Bayar Kas
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "status" ? styles.tabBtnActive : ""}`}
              onClick={() => {
                setActiveTab("status");
                setAlert(null);
              }}
            >
              <i className="bx bx-list-check" /> Cek Status Kas
            </button>
          </div>
        </div>

        {/* Tab 1: Form Bayar Kas */}
        {activeTab === "bayar" && (
          <div className={`glassCard ${styles.card}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-wallet" /> Kas Keanggotaan
              </div>
              <h1 className={styles.title}>Pembayaran Kas Cavallery</h1>
              <p className={styles.subtitle}>
                Dukung operasional fanbase dan berbagai proyek kebersamaan untuk Erine.
              </p>
            </div>

            {/* QRIS Container */}
            <div className={styles.qrisWrap}>
              <img
                src="https://images.jkt48connect.com/cavallery/images/2026/09/b50e2fd04a9f4738.jpg"
                alt="QRIS Kas Cavallery"
                className={styles.qrisImg}
              />
              <div className={styles.qrisNote}>
                <i className="bx bx-info-circle" />
                <span>
                  <strong>Catatan:</strong> Pembayaran melebihi kewajiban bulan berjalan akan dianggap sebagai
                  deposit dan mengurangi ketentuan kas bulan berikutnya.
                </span>
              </div>
            </div>

            {/* Alert Message */}
            {alert && (
              <div
                className={`${styles.alertBox} ${
                  alert.type === "success" ? styles.alertSuccess : styles.alertError
                }`}
              >
                <i className={`bx ${alert.type === "success" ? "bx-check-circle" : "bx-error-circle"}`} />
                <span>{alert.msg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Periode */}
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Periode Kas</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: Agustus 2026"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  required
                />
              </div>

              {/* Nominal */}
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Nominal Pembayaran (Rp)</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="20000"
                  value={nominal}
                  onChange={(e) => {
                    setNominal(e.target.value);
                    setSelectedChip("custom");
                  }}
                  required
                />
                <div className={styles.chipsRow}>
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChip === 20000 ? styles.chipActive : ""}`}
                    onClick={() => handleChipClick(20000)}
                  >
                    Rp 20.000 (1 Bln)
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChip === 40000 ? styles.chipActive : ""}`}
                    onClick={() => handleChipClick(40000)}
                  >
                    Rp 40.000 (2 Bln)
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChip === 60000 ? styles.chipActive : ""}`}
                    onClick={() => handleChipClick(60000)}
                  >
                    Rp 60.000 (3 Bln)
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChip === 100000 ? styles.chipActive : ""}`}
                    onClick={() => handleChipClick(100000)}
                  >
                    Rp 100.000 (5 Bln)
                  </button>
                </div>
              </div>

              {/* Bukti Bayar Upload */}
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Bukti Transfer / QRIS</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>

                {previewUrl ? (
                  <div className={styles.previewWrap}>
                    <img src={previewUrl} alt="Preview Bukti Bayar" className={styles.previewImg} />
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                      }}
                      title="Hapus gambar"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                      required
                    />
                    <i className={`bx bx-cloud-upload ${styles.uploadIcon}`} />
                    <p className={styles.uploadText}>Klik atau seret screenshot bukti bayar ke sini</p>
                    <p className={styles.uploadHint}>Format: JPG, PNG, WebP (Maks. 5MB)</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" /> Mengirim Konfirmasi...
                  </>
                ) : (
                  <>
                    <i className="bx bx-paper-plane" /> Kirim Konfirmasi Kas
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Cek Status Kas History */}
        {activeTab === "status" && (
          <div className={`glassCard ${styles.card}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-history" /> Riwayat
              </div>
              <h2 className={styles.title}>Status Pembayaran Kas</h2>
              <p className={styles.subtitle}>Daftar seluruh konfirmasi pembayaran kas yang telah Anda kirim.</p>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--gold)" }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", marginBottom: "8px" }} />
                <p>Memuat riwayat kas...</p>
              </div>
            ) : historyList.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="bx bx-wallet" />
                <p>Belum ada riwayat konfirmasi kas.</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {historyList.map((item) => {
                  let badgeClass = styles.badgePending;
                  let badgeText = "Menunggu Verifikasi";
                  if (item.status === "diverifikasi") {
                    badgeClass = styles.badgeDiverifikasi;
                    badgeText = "Diverifikasi";
                  } else if (item.status === "ditolak") {
                    badgeClass = styles.badgeDitolak;
                    badgeText = "Ditolak";
                  }

                  const dateFormatted = new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={item.id} className={styles.historyItem}>
                      <div className={styles.historyLeft}>
                        <h4 className={styles.historyPeriode}>{item.periode}</h4>
                        <span className={styles.historyNominal}>{formatRupiah(item.nominal)}</span>
                        <span className={styles.historyDate}>{dateFormatted}</span>
                      </div>

                      <div className={styles.historyRight}>
                        <span className={badgeClass}>{badgeText}</span>
                        {item.buktiBayarUrl && (
                          <a
                            href={item.buktiBayarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewProofBtn}
                          >
                            <i className="bx bx-image" /> Lihat Bukti
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
