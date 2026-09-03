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

  const filteredRows = (matrixData?.matrixRows || []).filter((r: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.noAnggota || "").toLowerCase().includes(q) ||
      (r.nama || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.page} style={{ paddingTop: "calc(var(--nav-h, 72px) + 24px)" }}>
      <div className={styles.container}>
        {/* ── TOP HEADER (SAMA DENGAN ADMIN) ── */}
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
              Matriks Iuran Kas Cavallery {tahun}
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--fg-muted)" }}>
              Halaman ini bersifat <strong style={{ color: "var(--gold)" }}>read-only</strong>. 
              Data kas sinkron langsung dengan pencatatan admin fanbase.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
          </div>
        </div>

        {/* ── SUMMARY STATS CARDS (WARNA TEMA KONSISTEN) ── */}
        {matrixData && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
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
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--fg)" }}>
                {matrixData.totalAnggota} <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--fg-muted)" }}>orang</span>
              </div>
            </div>

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
                  color: "#10b981",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bx bx-wallet" style={{ fontSize: "1.1rem" }} />
                Total Pemasukan Kas {tahun}
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981" }}>
                {formatRupiah(matrixData.grandTotalPemasukan)}
              </div>
            </div>
          </div>
        )}

        {/* ── CARD MATRIKS KAS (MENGGUNAKAN SECTIONCARD ADMIN) ── */}
        <div className={styles.sectionCard} style={{ padding: 22 }}>
          {/* Toolbar: Pemilih Tahun & Pencarian (Sama Persis dengan Admin) */}
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

          {/* Notice Info Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              background: "rgba(201, 168, 76, 0.08)",
              border: "1px solid var(--border-gold, rgba(201, 168, 76, 0.3))",
              borderRadius: 10,
              marginBottom: 16,
              fontSize: "0.82rem",
              color: "var(--fg)",
            }}
          >
            <i
              className="bx bx-lock-alt"
              style={{ color: "var(--gold)", fontSize: "1.25rem", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              Tabel ini hanya bisa dibaca (read-only).
              <span style={{ color: "var(--gold)", fontWeight: 700, marginLeft: 6 }}>
                <i className="bx bx-move-horizontal" style={{ marginRight: 3, verticalAlign: "middle" }} />
                Geser tabel ke kanan
              </span>{" "}
              untuk melihat status pembayaran 12 bulan.
            </div>
          </div>

          {/* TABEL MATRIKS CENTANG (CLASS SAMA DENGAN ADMIN KAS) */}
          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat tabel matriks kas {tahun}...</p>
            </div>
          ) : !matrixData || filteredRows.length === 0 ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-data" />
              <p>Tidak ada data anggota yang cocok untuk tahun {tahun}.</p>
            </div>
          ) : (
            <div className={styles.tableWrap} style={{ maxHeight: "72vh", overflow: "auto" }}>
              <table className={styles.matrixTable}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th className={styles.colStickyNo} style={{ background: "#1155cc", color: "#fff" }}>
                      No.
                    </th>
                    <th className={styles.colStickyNoAnggota} style={{ background: "#1155cc", color: "#fff" }}>
                      Nomor Anggota
                    </th>
                    <th className={styles.colStickyNama} style={{ background: "#1155cc", color: "#fff" }}>
                      Nama
                    </th>
                    <th style={{ minWidth: 100, background: "#1155cc", color: "#fff" }}>
                      Kas
                    </th>
                    <th style={{ width: 75, background: "#1155cc", color: "#fff" }}>
                      Bulan Mulai
                    </th>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <th key={m} style={{ minWidth: 46, background: "#1155cc", color: "#fff" }}>
                        <div style={{ fontWeight: 800 }}>{MONTH_NAMES[m - 1]}</div>
                        <div style={{ fontSize: "0.65rem", fontWeight: 400, opacity: 0.9 }}>
                          {formatRupiah(matrixData.monthlyTotals?.[m] || 0).replace("Rp ", "")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row: any, idx: number) => (
                    <tr key={row.noAnggota}>
                      {/* No */}
                      <td className={styles.colStickyNo} style={{ textAlign: "center", fontWeight: 700 }}>
                        {idx + 1}
                      </td>

                      {/* No Anggota */}
                      <td className={styles.colStickyNoAnggota}>
                        <span className={styles.noAnggota} style={{ fontSize: "0.78rem" }}>
                          {row.noAnggota}
                        </span>
                      </td>

                      {/* Nama + Jabatan */}
                      <td className={styles.colStickyNama}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--fg)" }}>
                          {row.nama}
                        </div>
                        {row.isAdminRole ? (
                          <div style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 600 }}>
                            {row.jabatan}
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.68rem", color: "var(--fg-muted)", fontWeight: 600 }}>
                            Anggota
                          </div>
                        )}
                      </td>

                      {/* Total Kas */}
                      <td
                        style={{
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          color: row.isAdminRole
                            ? "var(--fg-muted)"
                            : row.totalKas > 0
                            ? "#10b981"
                            : "var(--fg-muted)",
                        }}
                      >
                        {row.isAdminRole
                          ? "-"
                          : row.totalKas > 0
                          ? formatRupiah(row.totalKas)
                          : "Rp -"}
                      </td>

                      {/* Bulan Mulai */}
                      <td style={{ color: "var(--fg-muted)", fontWeight: 700, textAlign: "center", fontSize: "0.82rem" }}>
                        {typeof row.bulanMulai === "number" && row.bulanMulai >= 1 && row.bulanMulai <= 12
                          ? MONTH_NAMES[row.bulanMulai - 1]
                          : row.bulanMulai}
                      </td>

                      {/* 12 Bulan (Read-Only) */}
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                        const status = row.months?.[m];
                        const isPaid = status === true;
                        const isNotJoined = status === "not_joined";

                        return (
                          <td
                            key={m}
                            className={isPaid ? styles.matrixCellPaid : isNotJoined ? "" : styles.matrixCellUnpaid}
                            title={
                              isNotJoined
                                ? `${row.nama}: Belum Bergabung pada ${MONTH_NAMES_FULL[m - 1]} ${tahun} (Bebas Kewajiban Kas)`
                                : `${row.nama} (${MONTH_NAMES_FULL[m - 1]} ${tahun}): ${isPaid ? "LUNAS" : "Belum Bayar"}`
                            }
                            style={{
                              textAlign: "center",
                              verticalAlign: "middle",
                              background: isNotJoined ? "rgba(128, 128, 128, 0.04)" : undefined,
                            }}
                          >
                            {isPaid ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 22,
                                  height: 22,
                                  borderRadius: 4,
                                  background: "#1155cc",
                                  color: "#fff",
                                  fontSize: "0.85rem",
                                }}
                              >
                                <i className="bx bx-check" />
                              </span>
                            ) : row.isAdminRole ? (
                              <span
                                style={{
                                  color: "var(--fg-muted)",
                                  fontSize: "0.9rem",
                                  fontWeight: 700,
                                }}
                                title={`${row.nama} (Pengurus Fanbase)`}
                              >
                                -
                              </span>
                            ) : isNotJoined ? (
                              <span
                                style={{
                                  color: "var(--fg-muted)",
                                  fontSize: "0.9rem",
                                  fontWeight: 700,
                                }}
                                title="Belum Bergabung"
                              >
                                -
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 18,
                                  height: 18,
                                  borderRadius: 3,
                                  border: "1.5px solid var(--border, rgba(156, 163, 175, 0.4))",
                                  background: "transparent",
                                }}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── LEGENDA (SAMA DENGAN ADMIN KAS) ── */}
          <div
            style={{
              marginTop: 14,
              fontSize: "0.8rem",
              color: "var(--fg-muted)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bx bx-info-circle" style={{ color: "var(--gold)" }} />
              <span>
                Anggota hanya wajib membayar kas sejak bulan resmi bergabung (kolom Bulan Mulai).
              </span>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <strong style={{ color: "var(--fg-muted)", fontSize: "1rem" }}>-</strong> Belum Bergabung / Admin
              </span>
            </div>
          </div>
        </div>

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
          <span>Halaman ini hanya untuk penggunaan internal Cavallery Fanbase · Bersifat Read-Only</span>
        </div>
      </div>
    </div>
  );
}
