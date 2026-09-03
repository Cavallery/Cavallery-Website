"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const DONATION_TYPES = [
  "General Support (Kas & Event Erine)",
  "Project Ulang Tahun / Seitansai",
  "Project Bunga & Dukungan Panggung",
  "Project Merchandise & Kreatif Fanbase",
  "Project Media & Ads Support",
];

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function DonasiPage() {
  const [activeTab, setActiveTab] = useState<"donasi" | "status" | "leaderboard">("donasi");

  // Form State
  const [donationTypes, setDonationTypes] = useState<string[]>(DONATION_TYPES);
  const [tipeDonasi, setTipeDonasi] = useState(DONATION_TYPES[0]);
  const [nominal, setNominal] = useState("50000");
  const [selectedChip, setSelectedChip] = useState<number | "custom">(50000);
  const [chipNominalsDonasi, setChipNominalsDonasi] = useState<number[]>([
    10000, 25000, 50000, 100000, 250000, 500000,
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status & Submit
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // My Donation History State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Leaderboard State
  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    // Load dynamic master data for donasi
    fetch("/api/master-data")
      .then((res) => res.json())
      .then((json) => {
        if (json.status && json.data) {
          if (json.data.tipeDonasi?.length) {
            setDonationTypes(json.data.tipeDonasi);
            setTipeDonasi(json.data.tipeDonasi[0]);
          }
          if (json.data.nominalDonasi?.length) {
            setChipNominalsDonasi(json.data.nominalDonasi);
            const firstNom = json.data.nominalDonasi[0];
            if (firstNom) {
              setNominal(String(firstNom));
              setSelectedChip(firstNom);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/donasi");
      const json = await res.json();
      if (json.status && json.data) {
        setHistoryList(json.data);
      }
    } catch {
      console.error("Failed to load donation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/donasi?type=leaderboard");
      const json = await res.json();
      if (json.status && json.data) {
        setLeaderboardList(json.data);
      }
    } catch {
      console.error("Failed to load leaderboard");
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === "status") {
      fetchHistory();
    } else if (activeTab === "leaderboard") {
      fetchLeaderboard();
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

    const cleanNominal = parseInt(nominal.replace(/\D/g, ""), 10);
    if (!cleanNominal || cleanNominal <= 0) {
      setAlert({ type: "error", msg: "Nominal donasi tidak valid." });
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

      // 2. Submit Donasi Confirmation
      const donasiRes = await fetch("/api/donasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipeDonasi,
          nominal: cleanNominal,
          buktiBayarUrl,
        }),
      });

      const donasiJson = await donasiRes.json();
      if (!donasiRes.ok || !donasiJson.status) {
        throw new Error(donasiJson.message || "Gagal mengirim konfirmasi donasi");
      }

      setAlert({
        type: "success",
        msg: "Konfirmasi donasi berhasil dikirim! Terima kasih atas dukungan tulus Anda untuk Erine.",
      });

      // Reset form
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message || "Terjadi kesalahan saat memproses donasi." });
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
              className={`${styles.tabBtn} ${activeTab === "donasi" ? styles.tabBtnActive : ""}`}
              onClick={() => {
                setActiveTab("donasi");
                setAlert(null);
              }}
            >
              <i className="bx bx-donate-heart" /> Donasi Sekarang
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "status" ? styles.tabBtnActive : ""}`}
              onClick={() => {
                setActiveTab("status");
                setAlert(null);
              }}
            >
              <i className="bx bx-list-check" /> Status Donasi
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "leaderboard" ? styles.tabBtnActive : ""}`}
              onClick={() => {
                setActiveTab("leaderboard");
                setAlert(null);
              }}
            >
              <i className="bx bx-trophy" /> Papan Peringkat
            </button>
          </div>
        </div>

        {/* Tab 1: Form Donasi */}
        {activeTab === "donasi" && (
          <div className={`glassCard ${styles.card}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-heart-circle" /> Dukungan & Proyek
              </div>
              <h1 className={styles.title}>Donasi untuk Erine & Cavallery</h1>
              <p className={styles.subtitle}>
                Setiap kontribusi Anda menjadi energi berharga bagi langkah dan impian Erine di JKT48.
              </p>
            </div>

            {/* QRIS Container */}
            <div className={styles.qrisWrap}>
              <img
                src="https://images.jkt48connect.com/cavallery/images/2026/09/b50e2fd04a9f4738.jpg"
                alt="QRIS Donasi Cavallery"
                className={styles.qrisImg}
              />
              <div className={styles.qrisNote}>
                <i className="bx bx-info-circle" />
                <span>
                  <strong>Catatan:</strong> Donasi di atas Rp 2.000.000,- harus dilakukan bertahap maksimal Rp 2.000.000,-
                  per transaksi transfer, dan akumulasinya akan tetap dihitung sebagai 1 donasi atas nama Anda.
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
              {/* Tipe Donasi */}
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Tipe Proyek / Donasi</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <select
                  className={styles.select}
                  value={tipeDonasi}
                  onChange={(e) => setTipeDonasi(e.target.value)}
                >
                  {donationTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nominal */}
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Nominal Donasi (Rp)</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="50000"
                  value={nominal}
                  onChange={(e) => {
                    setNominal(e.target.value);
                    setSelectedChip("custom");
                  }}
                  required
                />
                <div className={styles.chipsRow}>
                  {chipNominalsDonasi.map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      className={`${styles.chip} ${selectedChip === nom ? styles.chipActive : ""}`}
                      onClick={() => handleChipClick(nom)}
                    >
                      Rp {nom.toLocaleString("id-ID")}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChip === "custom" ? styles.chipActive : ""}`}
                    onClick={() => setSelectedChip("custom")}
                  >
                    Nominal Lain
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
                    <p className={styles.uploadText}>Klik atau seret screenshot bukti donasi ke sini</p>
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
                    <i className="bx bx-heart" /> Kirim Konfirmasi Donasi {nominal ? `(Rp ${parseInt(nominal || "0", 10).toLocaleString("id-ID")})` : ""}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Status Donasi Saya */}
        {activeTab === "status" && (
          <div className={`glassCard ${styles.card}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-history" /> Riwayat
              </div>
              <h2 className={styles.title}>Status Donasi Saya</h2>
              <p className={styles.subtitle}>Daftar seluruh konfirmasi donasi yang telah Anda kirimkan.</p>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--gold)" }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", marginBottom: "8px" }} />
                <p>Memuat riwayat donasi...</p>
              </div>
            ) : historyList.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="bx bx-donate-heart" />
                <p>Belum ada riwayat donasi yang tercatat.</p>
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
                        <h4 className={styles.historyTipe}>{item.tipeDonasi}</h4>
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
                            style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 700, textDecoration: "none" }}
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

        {/* Tab 3: Papan Peringkat Donasi (Leaderboard) */}
        {activeTab === "leaderboard" && (
          <div className={`glassCard ${styles.card}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-trophy" /> Leaderboard
              </div>
              <h2 className={styles.title}>Papan Peringkat Donatur</h2>
              <p className={styles.subtitle}>
                Apresiasi tertinggi untuk para ksatria dan donatur yang telah memberikan dukungan luar biasa.
              </p>
            </div>

            {loadingLeaderboard ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--gold)" }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", marginBottom: "8px" }} />
                <p>Memuat papan peringkat...</p>
              </div>
            ) : leaderboardList.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="bx bx-trophy" />
                <p>Belum ada donasi terverifikasi di papan peringkat.</p>
              </div>
            ) : (
              <div className={styles.leaderboardList}>
                {leaderboardList.map((rank, idx) => {
                  const rankNum = idx + 1;
                  let rankClass = styles.rankCard;
                  let rankIcon = String(rankNum);

                  if (rankNum === 1) {
                    rankClass = `${styles.rankCard} ${styles.rankTop1}`;
                    rankIcon = "🥇";
                  } else if (rankNum === 2) {
                    rankClass = `${styles.rankCard} ${styles.rankTop2}`;
                    rankIcon = "🥈";
                  } else if (rankNum === 3) {
                    rankClass = `${styles.rankCard} ${styles.rankTop3}`;
                    rankIcon = "🥉";
                  }

                  return (
                    <div key={rank.key} className={rankClass}>
                      <div className={styles.rankLeft}>
                        <div className={styles.rankNum}>{rankIcon}</div>
                        <div className={styles.rankInfo}>
                          <h4 className={styles.rankName}>{rank.nama}</h4>
                          <div className={styles.rankBadge}>
                            <span>
                              {rank.tipe === "Anggota" ? `Anggota (${rank.noAnggota || "-"})` : "Donatur"}
                            </span>
                            <span>•</span>
                            <span>{rank.count}x Donasi</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.rankRight}>
                        <span className={styles.rankAmount}>{formatRupiah(rank.totalNominal)}</span>
                        <span className={styles.rankCount}>Total Terverifikasi</span>
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
