"use client";

import { useEffect, useState } from "react";
import styles from "@/app/admin/keanggotaan/page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const SUPPORTED_YEARS = [2024, 2025, 2026, 2027, 2028, 2029];

function formatRupiah(amount: number) {
  return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
}

export default function PublicKasMatrixPage() {
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [matrixData, setMatrixData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"matriks" | "pengeluaran">("matriks");
  const [pengeluaranKategori, setPengeluaranKategori] = useState<string>("semua");
  const [selectedNotaUrl, setSelectedNotaUrl] = useState<string | null>(null);

  const fetchMatrix = async (yr: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/kas-matrix?tahun=${yr}`);
      const json = await res.json();
      if (json.status) setMatrixData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix(tahun);
  }, [tahun]);

  // Filter Matriks Anggota
  const filteredRows = (matrixData?.matrixRows || []).filter((r: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.noAnggota || "").toLowerCase().includes(q) ||
      (r.nama || "").toLowerCase().includes(q)
    );
  });

  // Filter Pengeluaran Kas
  const pengeluaranList: any[] = matrixData?.pengeluaranList || [];
  const filteredPengeluaran = pengeluaranList.filter((p: any) => {
    const matchCat = pengeluaranKategori === "semua" || p.kategori === pengeluaranKategori;
    if (!matchCat) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.keperluan || "").toLowerCase().includes(q) ||
      (p.pj_nama || "").toLowerCase().includes(q) ||
      (p.catatan || "").toLowerCase().includes(q) ||
      (p.kategori || "").toLowerCase().includes(q)
    );
  });

  const totalPengeluaranTercatat = Number(matrixData?.totalPengeluaran || 0);
  const saldoKasBersihTercatat = Number(matrixData?.saldoKasBersih ?? (Number(matrixData?.grandTotalPemasukan || 0) - totalPengeluaranTercatat));

  // Daftar Kategori Unik untuk Filter
  const uniqueCategories = Array.from(new Set(pengeluaranList.map((p) => p.kategori).filter(Boolean)));

  return (
    <div className={styles.page} style={{ paddingTop: "calc(var(--nav-h, 72px) + 24px)" }}>
      <div className={styles.container}>
        {/* ── TOP HEADER ── */}
        <div className={styles.topHeader}>
          <div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--gold)",
                background: "rgba(201, 168, 76, 0.12)",
                padding: "4px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-gold, rgba(201, 168, 76, 0.3))",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <i className="bx bx-shield-quarter" />
              Internal Dokumen · Cavallery Fanbase
            </div>
            <h1 className={styles.pageTitle} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <i className="bx bx-spreadsheet" style={{ color: "var(--gold)", fontSize: "2rem" }} />
              Transparansi &amp; Laporan Kas Cavallery {tahun}
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--fg-muted)" }}>
              Halaman ini bersifat <strong style={{ color: "var(--gold)" }}>read-only</strong>. 
              Menampilkan matriks iuran bulanan dan laporan penggunaan belanja kas secara transparan dari pencatatan admin.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
          </div>
        </div>

        {/* ── SUMMARY STATS CARDS (4 KARTU KEUANGAN LENGKAP) ── */}
        {matrixData && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* 1. Anggota Aktif */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#1155cc",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bx bx-user-check" style={{ fontSize: "1.1rem" }} />
                Total Anggota Aktif
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--fg)" }}>
                {matrixData.totalAnggota} <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--fg-muted)" }}>orang</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginTop: 4 }}>
                Terdaftar di database fanbase
              </div>
            </div>

            {/* 2. Total Pemasukan Kas */}
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1.5px solid rgba(16, 185, 129, 0.3)",
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#10b981",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bx bx-trending-up" style={{ fontSize: "1.1rem" }} />
                Total Pemasukan Kas {tahun}
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#10b981" }}>
                {formatRupiah(matrixData.grandTotalPemasukan)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginTop: 4 }}>
                Akumulasi iuran kas terverifikasi
              </div>
            </div>

            {/* 3. Total Pengeluaran Kas */}
            <div
              style={{
                background: "rgba(225, 29, 72, 0.08)",
                border: "1.5px solid rgba(225, 29, 72, 0.3)",
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#e11d48",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bx bx-receipt" style={{ fontSize: "1.1rem" }} />
                Total Pengeluaran Kas {tahun}
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#e11d48" }}>
                {formatRupiah(totalPengeluaranTercatat)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginTop: 4 }}>
                {pengeluaranList.length} transaksi belanja operasional
              </div>
            </div>

            {/* 4. Sisa Saldo Bersih */}
            <div
              style={{
                background: saldoKasBersihTercatat >= 0 ? "rgba(201, 168, 76, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: saldoKasBersihTercatat >= 0 ? "1.5px solid var(--border-gold, #c9a84c)" : "1.5px solid #ef4444",
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bx bx-wallet-alt" style={{ fontSize: "1.1rem" }} />
                Saldo Bersih Kas {tahun}
              </div>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, color: saldoKasBersihTercatat >= 0 ? "var(--primary)" : "#ef4444" }}>
                {formatRupiah(saldoKasBersihTercatat)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginTop: 4 }}>
                Sisa saldo kas siap pakai fanbase
              </div>
            </div>
          </div>
        )}

        {/* ── TAB SWITCHER UTAMA (MATRIKS vs PENGELUARAN) ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, borderBottom: "2px solid var(--border)", paddingBottom: 0, overflowX: "auto" }}>
          <button
            type="button"
            onClick={() => { setActiveTab("matriks"); setSearch(""); }}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: activeTab === "matriks" ? "3px solid var(--gold)" : "3px solid transparent",
              background: "transparent",
              color: activeTab === "matriks" ? "var(--primary)" : "var(--fg-muted)",
              fontWeight: activeTab === "matriks" ? 800 : 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
              marginBottom: -2,
              whiteSpace: "nowrap",
            }}
          >
            <i className="bx bx-grid-alt" style={{ fontSize: "1.1rem" }} />
            Matriks Iuran Kas Bulanan
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("pengeluaran"); setSearch(""); }}
            style={{
              padding: "10px 18px",
              border: "none",
              borderBottom: activeTab === "pengeluaran" ? "3px solid #e11d48" : "3px solid transparent",
              background: "transparent",
              color: activeTab === "pengeluaran" ? "#e11d48" : "var(--fg-muted)",
              fontWeight: activeTab === "pengeluaran" ? 800 : 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
              marginBottom: -2,
              whiteSpace: "nowrap",
            }}
          >
            <i className="bx bx-receipt" style={{ fontSize: "1.1rem" }} />
            Laporan Pengeluaran Kas ({pengeluaranList.length})
          </button>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* TAB 1: MATRIKS IURAN KAS BULANAN (TABEL CENTANG) */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "matriks" && (
          <div className={styles.sectionCard} style={{ padding: 22 }}>
            {/* Toolbar: Pemilih Tahun & Pencarian */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)", whiteSpace: "nowrap" }}>
                  <i className="bx bx-calendar" style={{ marginRight: 4, color: "var(--gold)" }} />
                  Tahun:
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    background: "var(--surface)",
                    borderRadius: 10,
                    padding: 4,
                    border: "1px solid var(--border)",
                    overflowX: "auto",
                    maxWidth: "calc(100vw - 100px)",
                    WebkitOverflowScrolling: "touch" as any,
                  }}
                >
                  {SUPPORTED_YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setTahun(y)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: tahun === y ? "var(--gold)" : "transparent",
                        color: tahun === y ? "#1a1612" : "var(--fg-muted)",
                        fontWeight: tahun === y ? 900 : 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 280 }}>
                <i
                  className="bx bx-search"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--fg-muted)",
                    fontSize: "1rem",
                  }}
                />
                <input
                  type="text"
                  placeholder="Cari anggota / CAVA-xxxx..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 14px 8px 36px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--fg)",
                    fontSize: "0.82rem",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Subtotal Bulan Per-Kolom */}
            {matrixData && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gap: 6,
                  marginBottom: 16,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const count = matrixData.monthlyPaidCounts?.[m] || 0;
                  const total = matrixData.totalAnggota || 1;
                  const pct = Math.round((count / total) * 100);
                  const isCurrentMonth = m === new Date().getMonth() + 1 && tahun === new Date().getFullYear();

                  return (
                    <div
                      key={m}
                      style={{
                        padding: "8px 4px",
                        borderRadius: 8,
                        background: isCurrentMonth
                          ? "rgba(201, 168, 76, 0.15)"
                          : "var(--surface)",
                        border: isCurrentMonth
                          ? "1.5px solid var(--border-gold, #c9a84c)"
                          : "1px solid var(--border)",
                        textAlign: "center",
                        minWidth: 50,
                      }}
                      title={`${MONTH_NAMES_FULL[m - 1]} ${tahun}: ${count} lunas (${pct}%)`}
                    >
                      <div
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: isCurrentMonth ? 900 : 700,
                          color: isCurrentMonth ? "var(--gold)" : "var(--fg-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        {MONTH_NAMES[m - 1]}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 900,
                          color: count > 0 ? "#10b981" : "var(--fg-muted)",
                          marginTop: 2,
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: "var(--fg-muted)",
                          marginTop: 1,
                        }}
                      >
                        {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tabel Matriks */}
            {loading ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", color: "var(--gold)" }} />
                <p>Memuat data matriks kas...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-search" style={{ fontSize: "2rem", color: "var(--fg-muted)" }} />
                <p>Tidak ada anggota yang cocok dengan pencarian.</p>
              </div>
            ) : (
              <div className={styles.tableWrap} style={{ maxHeight: "68vh", overflowY: "auto" }}>
                <table className={styles.table}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: 44, textAlign: "center" }}>No</th>
                      <th style={{ width: 100 }}>No. Anggota</th>
                      <th style={{ minWidth: 160 }}>Nama Anggota</th>
                      {MONTH_NAMES.map((m, idx) => {
                        const mNum = idx + 1;
                        const isCurrentMonth = mNum === new Date().getMonth() + 1 && tahun === new Date().getFullYear();
                        return (
                          <th
                            key={m}
                            style={{
                              textAlign: "center",
                              width: 48,
                              background: isCurrentMonth ? "rgba(201, 168, 76, 0.15)" : undefined,
                              color: isCurrentMonth ? "var(--gold)" : undefined,
                              fontWeight: 800,
                            }}
                          >
                            {m}
                          </th>
                        );
                      })}
                      <th style={{ textAlign: "right", minWidth: 100 }}>Total Lunas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r: any, idx: number) => {
                      return (
                        <tr key={r.noAnggota || idx}>
                          <td style={{ textAlign: "center", color: "var(--fg-muted)", fontSize: "0.8rem" }}>
                            {idx + 1}
                          </td>
                          <td>
                            <span className={styles.noAnggota} style={{ fontSize: "0.78rem" }}>
                              {r.noAnggota}
                            </span>
                          </td>
                          <td className={styles.nameCol}>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                              <span>{r.nama}</span>
                              {r.isAdminRole && (
                                <span
                                  style={{
                                    fontSize: "0.62rem",
                                    fontWeight: 800,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: "rgba(99, 102, 241, 0.12)",
                                    color: "#6366f1",
                                    border: "1px solid rgba(99, 102, 241, 0.25)",
                                  }}
                                >
                                  {r.jabatan}
                                </span>
                              )}
                            </div>
                          </td>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                            const status = r.months?.[m];
                            const isCurrentMonth = m === new Date().getMonth() + 1 && tahun === new Date().getFullYear();

                            return (
                              <td
                                key={m}
                                style={{
                                  textAlign: "center",
                                  padding: "6px 2px",
                                  background: isCurrentMonth ? "rgba(201, 168, 76, 0.04)" : undefined,
                                }}
                              >
                                {status === "not_joined" ? (
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "var(--fg-muted)",
                                      opacity: 0.4,
                                    }}
                                    title={`Belum bergabung (${r.noAnggota})`}
                                  >
                                    -
                                  </span>
                                ) : status === true ? (
                                  <span
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 6,
                                      background: "#1155cc",
                                      color: "#fff",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.85rem",
                                      boxShadow: "0 2px 4px rgba(17, 85, 204, 0.3)",
                                    }}
                                    title={`Lunas (${MONTH_NAMES_FULL[m - 1]} ${tahun})`}
                                  >
                                    <i className="bx bx-check" />
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 4,
                                      border: "1.5px solid rgba(156, 163, 175, 0.35)",
                                      display: "inline-block",
                                    }}
                                    title={`Belum bayar (${MONTH_NAMES_FULL[m - 1]} ${tahun})`}
                                  />
                                )}
                              </td>
                            );
                          })}
                          <td style={{ textAlign: "right", fontWeight: 800, color: "#10b981", fontSize: "0.85rem" }}>
                            {r.totalKas !== null ? formatRupiah(r.totalKas) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend Penjelasan Warna */}
            <div
              style={{
                marginTop: 18,
                padding: "12px 16px",
                borderRadius: 10,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                alignItems: "center",
                fontSize: "0.78rem",
              }}
            >
              <span style={{ fontWeight: 800, color: "var(--fg-muted)" }}>Keterangan:</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    background: "#1155cc",
                    borderRadius: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.75rem",
                  }}
                >
                  <i className="bx bx-check" />
                </span>{" "}
                Lunas
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "1.5px solid rgba(156, 163, 175, 0.4)",
                    borderRadius: 3,
                    display: "inline-block",
                  }}
                />{" "}
                Belum Bayar
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong style={{ color: "var(--fg-muted)", fontSize: "1rem" }}>-</strong> Belum Bergabung / Admin
              </span>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB 2: LAPORAN PENGELUARAN KAS (TRANSPARANSI BELANJA) */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "pengeluaran" && (
          <div className={styles.sectionCard} style={{ padding: 22 }}>
            {/* Header Laporan Pengeluaran */}
            <div className={styles.sectionHeader} style={{ flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div>
                <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="bx bx-receipt" style={{ color: "#e11d48", fontSize: "1.4rem" }} />
                  Laporan Pengeluaran &amp; Penggunaan Kas Fanbase
                  <span className={styles.countBadge} style={{ background: "rgba(225, 29, 72, 0.15)", color: "#e11d48" }}>
                    {filteredPengeluaran.length} Transaksi
                  </span>
                </h2>
                <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 4 }}>
                  Menampilkan seluruh rincian belanja operasional fanbase, keperluan uang kas, dan bukti nota tahun {tahun}.
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>Total Pengeluaran {tahun}:</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#e11d48" }}>
                  {formatRupiah(totalPengeluaranTercatat)}
                </div>
              </div>
            </div>

            {/* Toolbar Filter Kategori, Search Keperluan, & Tahun */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Pemilih Tahun */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>Tahun:</span>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      background: "var(--surface)",
                      borderRadius: 10,
                      padding: 4,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {SUPPORTED_YEARS.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setTahun(y)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: tahun === y ? "#e11d48" : "transparent",
                          color: tahun === y ? "#fff" : "var(--fg-muted)",
                          fontWeight: tahun === y ? 900 : 600,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Kategori */}
                {uniqueCategories.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>Kategori:</span>
                    <select
                      value={pengeluaranKategori}
                      onChange={(e) => setPengeluaranKategori(e.target.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--fg)",
                        fontSize: "0.82rem",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="semua">Semua Kategori</option>
                      {uniqueCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Search Keperluan Belanja */}
              <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
                <i
                  className="bx bx-search"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--fg-muted)",
                    fontSize: "1rem",
                  }}
                />
                <input
                  type="text"
                  placeholder="Cari keperluan / untuk apa kas dipakai..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 14px 8px 36px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--fg)",
                    fontSize: "0.82rem",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Tabel Rincian Pengeluaran */}
            {loading ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", color: "#e11d48" }} />
                <p>Memuat catatan pengeluaran kas...</p>
              </div>
            ) : filteredPengeluaran.length === 0 ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-receipt" style={{ fontSize: "2.2rem", color: "var(--fg-muted)" }} />
                <p>Belum ada catatan pengeluaran kas tercatat pada tahun {tahun}.</p>
              </div>
            ) : (
              <div className={styles.tableWrap} style={{ maxHeight: "68vh", overflowY: "auto" }}>
                <table className={styles.table}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: 44, textAlign: "center" }}>No</th>
                      <th style={{ minWidth: 105 }}>Tanggal</th>
                      <th style={{ minWidth: 120 }}>Kategori</th>
                      <th style={{ minWidth: 220 }}>Keperluan Belanja (Untuk Apa)</th>
                      <th style={{ minWidth: 120, textAlign: "right" }}>Nominal</th>
                      <th style={{ minWidth: 130 }}>Penanggung Jawab (PJ)</th>
                      <th style={{ minWidth: 100, textAlign: "center" }}>Bukti Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPengeluaran.map((p: any, idx: number) => {
                      const tglStr = p.tanggal
                        ? new Date(p.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-";

                      return (
                        <tr key={p.id || idx}>
                          <td style={{ textAlign: "center", color: "var(--fg-muted)", fontSize: "0.8rem" }}>
                            {idx + 1}
                          </td>
                          <td style={{ fontSize: "0.82rem", color: "var(--fg)", whiteSpace: "nowrap" }}>
                            <i className="bx bx-calendar" style={{ marginRight: 4, opacity: 0.6 }} />
                            {tglStr}
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: 6,
                                background: "rgba(201, 168, 76, 0.12)",
                                color: "var(--gold)",
                                border: "1px solid rgba(201, 168, 76, 0.25)",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                display: "inline-block",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.kategori || "Operasional"}
                            </span>
                          </td>
                          <td className={styles.nameCol}>
                            <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--fg)" }}>
                              {p.keperluan}
                            </div>
                            {p.catatan && (
                              <div style={{ fontSize: "0.74rem", color: "var(--fg-muted)", marginTop: 3, lineHeight: 1.4 }}>
                                <i className="bx bx-note" style={{ marginRight: 3, verticalAlign: "middle" }} />
                                {p.catatan}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 900, color: "#e11d48", fontSize: "0.92rem", whiteSpace: "nowrap" }}>
                            {formatRupiah(p.nominal)}
                          </td>
                          <td style={{ fontSize: "0.82rem", color: "var(--fg-muted)", whiteSpace: "nowrap" }}>
                            <i className="bx bx-user" style={{ marginRight: 4 }} />
                            {p.pj_nama || "-"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {p.bukti_nota_url ? (
                              <button
                                type="button"
                                onClick={() => setSelectedNotaUrl(p.bukti_nota_url)}
                                className={styles.backBtn}
                                style={{
                                  fontSize: "0.72rem",
                                  padding: "4px 10px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  color: "var(--gold)",
                                  borderColor: "var(--border-gold, #c9a84c)",
                                  borderRadius: 8,
                                }}
                                title="Lihat foto bukti nota / kuitansi"
                              >
                                <i className="bx bx-image" style={{ fontSize: "0.9rem" }} />
                                Lihat Nota
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer info note */}
        <div
          style={{
            marginTop: 24,
            padding: "12px 16px",
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            fontSize: "0.75rem",
            color: "var(--fg-muted)",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <i className="bx bx-shield" />
          <span>Halaman ini hanya untuk penggunaan internal Cavallery Fanbase · Transparansi Pemasukan &amp; Pengeluaran Kas</span>
        </div>
      </div>

      {/* ── MODAL LIGHTBOX: LIHAT BUKTI NOTA BELANJA ── */}
      {selectedNotaUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 20,
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSelectedNotaUrl(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 640,
              width: "100%",
              background: "var(--surface, #1e1e24)",
              borderRadius: 16,
              border: "1px solid var(--border)",
              padding: 20,
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bx bx-receipt" style={{ color: "var(--gold)", fontSize: "1.3rem" }} />
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--fg)" }}>
                  Bukti Nota / Kuitansi Transaksi
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotaUrl(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--fg-muted)",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Tutup"
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <div
              style={{
                width: "100%",
                maxHeight: "70vh",
                overflow: "auto",
                borderRadius: 10,
                background: "rgba(0, 0, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
              }}
            >
              <img
                src={selectedNotaUrl}
                alt="Bukti Nota Transaksi"
                style={{
                  maxWidth: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a
                href={selectedNotaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.8rem",
                  color: "var(--gold)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontWeight: 700,
                }}
              >
                <i className="bx bx-link-external" /> Buka Gambar Ukuran Penuh
              </a>
              <button
                type="button"
                className={styles.btnCreate}
                onClick={() => setSelectedNotaUrl(null)}
                style={{ padding: "6px 16px", fontSize: "0.82rem" }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
