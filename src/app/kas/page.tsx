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

const KAS_12_BULAN = [
  { bulan: 1, nominal: 15000, label: "1 Bulan", detail: "1 Bulan: Rp 15.000" },
  { bulan: 2, nominal: 30000, label: "2 Bulan", detail: "2 Bulan: Rp 30.000" },
  { bulan: 3, nominal: 45000, label: "3 Bulan", detail: "3 Bulan: Rp 45.000" },
  { bulan: 4, nominal: 60000, label: "4 Bulan", detail: "4 Bulan: Rp 60.000" },
  { bulan: 5, nominal: 75000, label: "5 Bulan", detail: "5 Bulan: Rp 75.000" },
  { bulan: 6, nominal: 90000, label: "6 Bulan (Setengah Tahun)", detail: "6 Bulan (Setengah Tahun): Rp 90.000" },
  { bulan: 7, nominal: 105000, label: "7 Bulan", detail: "7 Bulan: Rp 105.000" },
  { bulan: 8, nominal: 120000, label: "8 Bulan", detail: "8 Bulan: Rp 120.000" },
  { bulan: 9, nominal: 135000, label: "9 Bulan", detail: "9 Bulan: Rp 135.000" },
  { bulan: 10, nominal: 150000, label: "10 Bulan", detail: "10 Bulan: Rp 150.000" },
  { bulan: 11, nominal: 165000, label: "11 Bulan", detail: "11 Bulan: Rp 165.000" },
  { bulan: 12, nominal: 180000, label: "12 Bulan (1 Tahun)", detail: "12 Bulan (1 Tahun): Rp 180.000" },
];

function getKasCalculationText(nom: number): string | null {
  const m = Math.round(nom / 15000);
  if (nom <= 0 || nom % 15000 !== 0 || m <= 0) return null;
  if (m === 1) return "1 Bulan: Rp 15.000";
  if (m === 2) return "2 Bulan: Rp 30.000";
  if (m === 3) return "3 Bulan: Rp 45.000";
  if (m === 4) return "4 Bulan: Rp 60.000";
  if (m === 5) return "5 Bulan: Rp 75.000";
  if (m === 6) return "6 Bulan (Setengah Tahun): Rp 90.000";
  if (m === 7) return "7 Bulan: Rp 105.000";
  if (m === 8) return "8 Bulan: Rp 120.000";
  if (m === 9) return "9 Bulan: Rp 135.000";
  if (m === 10) return "10 Bulan: Rp 150.000";
  if (m === 11) return "11 Bulan: Rp 165.000";
  if (m === 12) return "12 Bulan (1 Tahun): Rp 180.000";
  return `${m} Bulan: Rp ${nom.toLocaleString("id-ID")}`;
}

export default function KasPage() {
  const [activeTab, setActiveTab] = useState<"bayar" | "status">("bayar");

  // Form State
  const [periode, setPeriode] = useState(getDefaultPeriode);
  const [nominal, setNominal] = useState("15000");
  const [selectedChip, setSelectedChip] = useState<number | "custom">(15000);
  const [showTabelKas12Bulan, setShowTabelKas12Bulan] = useState(false);
  const [chipNominalsKas, setChipNominalsKas] = useState<number[]>([
    15000, 30000, 45000, 60000, 75000, 90000, 105000, 120000, 135000, 150000, 165000, 180000,
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status & Submit state
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [kasSuccessData, setKasSuccessData] = useState<{
    periode: string;
    nominal: number;
  } | null>(null);

  // Kas History State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    // Load dynamic master data for kas nominals
    fetch("/api/master-data")
      .then((res) => res.json())
      .then((json) => {
        if (json.status && json.data?.nominalKas?.length) {
          setChipNominalsKas(json.data.nominalKas);
          if (typeof json.data.defaultNominalKas === "number") {
            setNominal(String(json.data.defaultNominalKas));
            setSelectedChip(json.data.defaultNominalKas);
          }
        }
      })
      .catch(() => {});
  }, []);

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

      let uploadJson: any = {};
      const upType = uploadRes.headers.get("content-type") || "";
      if (upType.includes("application/json")) {
        uploadJson = await uploadRes.json();
      } else {
        throw new Error("Server penyimpanan sedang sibuk. Silakan coba unggah kembali.");
      }
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

      let kasJson: any = {};
      const kasType = kasRes.headers.get("content-type") || "";
      if (kasType.includes("application/json")) {
        kasJson = await kasRes.json();
      } else {
        throw new Error("Server sedang sibuk memproses antrean. Mohon tunggu beberapa detik dan coba lagi.");
      }
      if (!kasRes.ok || !kasJson.status) {
        throw new Error(kasJson.message || "Gagal mengirim konfirmasi kas");
      }

      setKasSuccessData({
        periode,
        nominal: cleanNominal,
      });

      setAlert(null);
      // Reset form
      setFile(null);
      setPreviewUrl(null);
      fetchHistory();
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
          kasSuccessData ? (
            /* SUCCESS CONFIRMATION CARD */
            <div className={`glassCard ${styles.card}`} style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                border: "2px solid #10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <i className="bx bx-check-circle" style={{ fontSize: "3rem", color: "#10b981" }} />
              </div>

              <div className="badge" style={{ marginBottom: 14 }}>
                <i className="bx bx-badge-check" /> Pembayaran Berhasil Dikirim
              </div>

              <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--fg)", marginBottom: 12 }}>
                Terima Kasih Sudah Membayar Kas!
              </h2>

              <p style={{
                fontSize: "0.96rem",
                lineHeight: 1.7,
                color: "var(--fg-muted)",
                maxWidth: 560,
                margin: "0 auto 26px",
              }}>
                Konfirmasi pembayaran kas Anda telah kami terima ke dalam sistem. Tim Admin Fanbase akan segera mengecek dan memverifikasi bukti pembayaran Anda. Dukungan Anda sangat berarti untuk memajukan keluarga besar Cavallery dan mendampingi perjalanan Erine.
              </p>

              {/* Rincian Singkat Pembayaran */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "18px 22px",
                maxWidth: 420,
                margin: "0 auto 30px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--fg-muted)" }}>Periode Kas:</span>
                  <strong style={{ color: "var(--fg)" }}>{kasSuccessData.periode}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--fg-muted)" }}>Nominal Dibayar:</span>
                  <strong style={{ color: "var(--gold)" }}>{formatRupiah(kasSuccessData.nominal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", alignItems: "center" }}>
                  <span style={{ color: "var(--fg-muted)" }}>Status Verifikasi:</span>
                  <span style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <i className="bx bx-time-five" /> Menunggu Pengecekan Admin
                  </span>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={styles.submitBtn}
                  style={{ maxWidth: 260, margin: 0 }}
                  onClick={() => {
                    setKasSuccessData(null);
                    setActiveTab("status");
                  }}
                >
                  <i className="bx bx-history" /> Lihat Status Kas Saya
                </button>
                <button
                  type="button"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                    padding: "12px 22px",
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onClick={() => {
                    setKasSuccessData(null);
                  }}
                >
                  <i className="bx bx-refresh" /> Bayar Kas Periode Lain
                </button>
              </div>
            </div>
          ) : (
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
                  {chipNominalsKas.map((nom) => {
                    const monthsCount = Math.round(nom / 15000);
                    const monthLabel =
                      monthsCount === 1
                        ? "1 Bulan"
                        : monthsCount === 6
                        ? "6 Bulan (Setengah Tahun)"
                        : monthsCount === 12
                        ? "12 Bulan (1 Tahun)"
                        : `${monthsCount} Bulan`;

                    return (
                      <button
                        key={nom}
                        type="button"
                        className={`${styles.chip} ${selectedChip === nom ? styles.chipActive : ""}`}
                        onClick={() => handleChipClick(nom)}
                        title={`Bayar Kas: ${monthLabel} = Rp ${nom.toLocaleString("id-ID")}`}
                      >
                        <span>Rp {nom.toLocaleString("id-ID")}</span>
                        <span style={{ fontSize: "0.7rem", opacity: 0.85, marginLeft: 4 }}>
                          ({monthLabel})
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChip === "custom" ? styles.chipActive : ""}`}
                    onClick={() => setSelectedChip("custom")}
                  >
                    Nominal Lain
                  </button>
                </div>

                {parseInt(nominal || "0", 10) > 0 && (
                  <div style={{
                    fontSize: "0.82rem",
                    color: "#10b981",
                    marginTop: 10,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(16, 185, 129, 0.08)",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}>
                    <i className="bx bx-check-circle" style={{ fontSize: "1.15rem", flexShrink: 0 }} />
                    <span>
                      {getKasCalculationText(parseInt(nominal || "0", 10)) ? (
                        <>Hitungan: <strong>{getKasCalculationText(parseInt(nominal || "0", 10))}</strong></>
                      ) : (
                        <>Total Iuran Kas: <strong>Rp {parseInt(nominal || "0", 10).toLocaleString("id-ID")}</strong></>
                      )}
                    </span>
                  </div>
                )}

                {/* ── TOGGLE TABEL HITUNGAN 1 S/D 12 BULAN LENGKAP ── */}
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowTabelKas12Bulan(!showTabelKas12Bulan)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--gold)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <i className={`bx ${showTabelKas12Bulan ? "bx-chevron-up" : "bx-list-ul"}`} />
                    <span>{showTabelKas12Bulan ? "Tutup Rincian Hitungan Kas" : "Lihat Rincian Hitungan Kas 1 s/d 12 Bulan"}</span>
                  </button>

                  {showTabelKas12Bulan && (
                    <div style={{
                      marginTop: 8,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 10,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
                    }}>
                      {KAS_12_BULAN.map((item) => {
                        const isSelected = parseInt(nominal || "0", 10) === item.nominal;
                        return (
                          <div
                            key={item.bulan}
                            onClick={() => handleChipClick(item.nominal)}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 8,
                              background: isSelected ? "var(--gold)" : "var(--bg)",
                              color: isSelected ? "#1a1612" : "var(--fg)",
                              border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border)",
                              fontSize: "0.75rem",
                              fontWeight: isSelected ? 800 : 600,
                              cursor: "pointer",
                              transition: "all 0.15s",
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                            title={`Pilih ${item.detail}`}
                          >
                            <span style={{ fontSize: "0.68rem", opacity: isSelected ? 0.9 : 0.7 }}>
                              {item.label}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: "0.82rem" }}>
                              Rp {item.nominal.toLocaleString("id-ID")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                    <i className="bx bx-paper-plane" /> Kirim Konfirmasi Kas {nominal ? `(Rp ${parseInt(nominal || "0", 10).toLocaleString("id-ID")})` : ""}
                  </>
                )}
              </button>
            </form>
          </div>
        ))}

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
