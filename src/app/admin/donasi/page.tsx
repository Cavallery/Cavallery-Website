"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../keanggotaan/page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function AdminDonasiPage() {
  const [donasiList, setDonasiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [filterTipe, setFilterTipe] = useState<"semua" | "anggota" | "donatur">("semua");

  const fetchDonasi = async () => {
    try {
      const res = await fetch("/api/admin/donasi");
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json();
      if (json.status && json.data) {
        setDonasiList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonasi();
  }, []);

  const handleAction = async (id: number, action: string, extra: any = {}) => {
    setActionLoading(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/donasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, ...extra }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchDonasi();
      } else {
        alert(json.message || "Gagal memproses aksi");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDonasi = async (id: number) => {
    if (!confirm(`Hapus data donasi #${id} dari sistem & spreadsheet?`)) return;

    try {
      const res = await fetch(`/api/admin/donasi?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchDonasi();
      } else {
        alert(json.message || "Gagal menghapus donasi");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  // Filter List
  const filteredDonasi = donasiList.filter((d) => {
    const isAnggota = Boolean(d.anggota);
    if (filterTipe === "anggota" && !isAnggota) return false;
    if (filterTipe === "donatur" && isAnggota) return false;
    return true;
  });

  const pendingDonasi = filteredDonasi.filter((d) => d.status === "pending");
  const processedDonasi = filteredDonasi.filter((d) => d.status !== "pending");

  // Perhitungan Total Keseluruhan
  const totalNominalSemua = donasiList.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
  const totalNominalDiverifikasi = donasiList
    .filter((d) => d.status === "diverifikasi")
    .reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
  const totalNominalPending = donasiList
    .filter((d) => d.status === "pending")
    .reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topHeader}>
          <div>
            <Link href="/admin" className={styles.backBtn}>
              <i className="bx bx-arrow-back" /> Dashboard Utama
            </Link>
            <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
              Verifikasi & Manajemen Donasi Proyek
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/kontributor" className={styles.backBtn}>
              <i className="bx bx-user-heart" /> Kontributor
            </Link>
            <Link href="/admin/kas" className={styles.backBtn}>
              <i className="bx bx-wallet" /> Verifikasi Kas
            </Link>
            <Link href="/admin/master-data" className={styles.backBtn} style={{ color: "#8b5cf6", borderColor: "rgba(139,92,246,0.4)" }}>
              <i className="bx bx-slider-alt" /> Master Data
            </Link>
            <a
              href="https://docs.google.com/spreadsheets/d/1t9PlUNLN2rdskLq-ZpellJI0umclokLm7G-DI-VnFXg/edit?gid=1846326647#gid=1846326647"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.backBtn}
              style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.4)" }}
            >
              <i className="bx bx-table" /> Live Spreadsheet
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* ── STATISTIK TOTAL KESELURUHAN DONASI ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div className={styles.sectionCard} style={{ margin: 0, padding: 18 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)", fontWeight: 700 }}>
              <i className="bx bx-donate-heart" style={{ color: "var(--primary)", marginRight: 5 }} />
              TOTAL DIVERIFIKASI
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10b981", marginTop: 4 }}>
              {formatRupiah(totalNominalDiverifikasi)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: 2 }}>
              {donasiList.filter((d) => d.status === "diverifikasi").length} donasi berhasil diverifikasi
            </div>
          </div>

          <div className={styles.sectionCard} style={{ margin: 0, padding: 18 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)", fontWeight: 700 }}>
              <i className="bx bx-time" style={{ color: "#f59e0b", marginRight: 5 }} />
              TOTAL PENDING
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>
              {formatRupiah(totalNominalPending)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: 2 }}>
              {donasiList.filter((d) => d.status === "pending").length} donasi menunggu verifikasi
            </div>
          </div>

          <div className={styles.sectionCard} style={{ margin: 0, padding: 18 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)", fontWeight: 700 }}>
              <i className="bx bx-calculator" style={{ color: "var(--gold)", marginRight: 5 }} />
              TOTAL KESELURUHAN
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--primary)", marginTop: 4 }}>
              {formatRupiah(totalNominalSemua)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: 2 }}>
              {donasiList.length} total transaksi tercatat
            </div>
          </div>
        </div>

        {/* ── FILTER BUTTONS (Semua / Anggota / Kontributor) ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fg-muted)", marginRight: 4 }}>
            Filter Donatur:
          </span>
          {(["semua", "anggota", "donatur"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterTipe(t)}
              style={{
                padding: "6px 16px",
                borderRadius: 50,
                border: filterTipe === t ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                background: filterTipe === t ? "var(--primary)" : "transparent",
                color: filterTipe === t ? "#fff" : "var(--fg-muted)",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              {t === "semua" ? (
                <>
                  <i className="bx bx-layer" /> Semua Donasi ({donasiList.length})
                </>
              ) : t === "anggota" ? (
                <>
                  <i className="bx bx-user" /> Dari Anggota ({donasiList.filter((d) => Boolean(d.anggota)).length})
                </>
              ) : (
                <>
                  <i className="bx bx-user-heart" /> Dari Kontributor ({donasiList.filter((d) => !d.anggota).length})
                </>
              )}
            </button>
          ))}
        </div>

        {msg && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: 16,
            }}
          >
            <i className="bx bx-check-circle" /> {msg}
          </div>
        )}

        {/* 1. Antrean Donasi (Pending) */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-time-five" style={{ color: "#e11d48" }} />
              Antrean Konfirmasi Donasi (Menunggu Verifikasi)
              <span className={styles.countBadge}>{pendingDonasi.length} Menunggu</span>
            </h2>
          </div>

          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat antrean donasi...</p>
            </div>
          ) : pendingDonasi.length === 0 ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-check-double" style={{ color: "#10b981" }} />
              <p>Tidak ada donasi yang menunggu verifikasi.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipe Donatur</th>
                    <th>Nama</th>
                    <th>Kontak</th>
                    <th>Tipe Donasi</th>
                    <th>Nominal</th>
                    <th>Tanggal Kirim</th>
                    <th>Bukti</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDonasi.map((d) => {
                    const isAnggota = Boolean(d.anggota);
                    const donorName = d.anggota?.namaLengkap || d.donatur?.nama || "Ksatria";
                    const kontak = isAnggota
                      ? `${d.anggota.kontakPlatform}: ${d.anggota.kontakId}`
                      : `${d.donatur?.kontakPlatform || "-"}: ${d.donatur?.kontakId || "-"}`;

                    return (
                      <tr key={d.id}>
                        <td>#{d.id}</td>
                        <td>
                          <span
                            className={`${styles.badgeStatus} ${
                              isAnggota ? styles.statusAktif : styles.statusPending
                            }`}
                          >
                            {isAnggota ? `Anggota (${d.anggota.noAnggota || "-"})` : "Kontributor"}
                          </span>
                        </td>
                        <td className={styles.nameCol}>{donorName}</td>
                        <td>{kontak}</td>
                        <td>{d.tipeDonasi}</td>
                        <td style={{ fontWeight: 800, color: "var(--primary)" }}>
                          {formatRupiah(d.nominal)}
                        </td>
                        <td>
                          {new Date(d.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          {d.buktiBayarUrl ? (
                            <button
                              type="button"
                              className={styles.backBtn}
                              style={{ fontSize: "0.75rem", padding: "4px 10px", color: "var(--gold)" }}
                              onClick={() => setSelectedProof(d.buktiBayarUrl)}
                            >
                              <i className="bx bx-image-alt" /> Lihat Bukti
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <select
                            value={d.status}
                            disabled={actionLoading === d.id}
                            onChange={(e) =>
                              handleAction(d.id, "update_status", { status: e.target.value })
                            }
                            className={
                              d.status === "diverifikasi"
                                ? styles.selectStatusAktif
                                : d.status === "pending"
                                ? styles.selectStatusPending
                                : styles.selectStatusNonaktif
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="diverifikasi">Diverifikasi</option>
                            <option value="ditolak">Ditolak</option>
                          </select>
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button
                              className={styles.btnAccept}
                              disabled={actionLoading === d.id}
                              onClick={() => handleAction(d.id, "verifikasi")}
                              title="Verifikasi"
                            >
                              <i className="bx bx-check" />
                            </button>
                            <button
                              className={styles.btnReject}
                              disabled={actionLoading === d.id}
                              onClick={() => handleAction(d.id, "tolak")}
                              title="Tolak"
                            >
                              <i className="bx bx-x" />
                            </button>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDeleteDonasi(d.id)}
                              title="Hapus Donasi"
                            >
                              <i className="bx bx-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2. Riwayat Donasi Terproses */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-history" style={{ color: "var(--gold)" }} />
              Riwayat Donasi Terverifikasi & Ditolak
              <span className={`${styles.countBadge} ${styles.countBadgeGreen}`}>
                {processedDonasi.length} Donasi
              </span>
            </h2>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipe</th>
                  <th>Nama Donatur</th>
                  <th>Tipe Proyek</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Verifikator</th>
                  <th>Bukti</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {processedDonasi.map((d) => {
                  const isAnggota = Boolean(d.anggota);
                  const donorName = d.anggota?.namaLengkap || d.donatur?.nama || "Ksatria";

                  return (
                    <tr key={d.id}>
                      <td>#{d.id}</td>
                      <td>
                        <span
                          className={`${styles.badgeStatus} ${
                            isAnggota ? styles.statusAktif : styles.statusPending
                          }`}
                        >
                          {isAnggota ? "Anggota" : "Kontributor"}
                        </span>
                      </td>
                      <td className={styles.nameCol}>{donorName}</td>
                      <td>{d.tipeDonasi}</td>
                      <td style={{ fontWeight: 800 }}>{formatRupiah(d.nominal)}</td>
                      <td>
                        <select
                          value={d.status}
                          disabled={actionLoading === d.id}
                          onChange={(e) =>
                            handleAction(d.id, "update_status", { status: e.target.value })
                          }
                          className={
                            d.status === "diverifikasi"
                              ? styles.selectStatusAktif
                              : d.status === "pending"
                              ? styles.selectStatusPending
                              : styles.selectStatusNonaktif
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="diverifikasi">Diverifikasi</option>
                          <option value="ditolak">Ditolak</option>
                        </select>
                      </td>
                      <td>{d.verifiedBy || "-"}</td>
                      <td>
                        {d.buktiBayarUrl && (
                          <button
                            type="button"
                            className={styles.backBtn}
                            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                            onClick={() => setSelectedProof(d.buktiBayarUrl)}
                          >
                            <i className="bx bx-image" />
                          </button>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={styles.btnDelete}
                            onClick={() => handleDeleteDonasi(d.id)}
                            title="Hapus Donasi"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Preview Bukti Donasi */}
      {selectedProof && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 24,
          }}
          onClick={() => setSelectedProof(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 600,
              width: "100%",
              background: "var(--surface)",
              borderRadius: 20,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              border: "1.5px solid var(--border-gold)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.3)",
                border: "none",
                color: "#fff",
                width: 32,
                height: 32,
                borderRadius: "50%",
                fontSize: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setSelectedProof(null)}
            >
              &times;
            </button>
            <h3 style={{ fontFamily: "var(--serif)", margin: 0, color: "var(--primary)" }}>
              Bukti Transfer Donasi
            </h3>
            <img
              src={selectedProof}
              alt="Bukti Donasi"
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 12 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
