"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../keanggotaan/page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

function formatRupiah(amount: number) {
  return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
}

export default function AdminKasPage() {
  const [kasList, setKasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [editKas, setEditKas] = useState<any | null>(null);

  const fetchKas = async () => {
    try {
      const res = await fetch("/api/admin/kas");
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json();
      if (json.status && json.data) {
        setKasList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKas();
  }, []);

  const handleAction = async (id: number, action: "verifikasi" | "tolak") => {
    setActionLoading(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/kas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchKas();
      } else {
        alert(json.message || "Gagal memproses aksi");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKas) return;

    try {
      const res = await fetch("/api/admin/kas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editKas),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setEditKas(null);
        fetchKas();
      } else {
        alert(json.message || "Gagal memperbarui kas");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleDeleteKas = async (id: number) => {
    if (!confirm(`Hapus data pembayaran kas #${id} dari database?`)) return;

    try {
      const res = await fetch(`/api/admin/kas?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchKas();
      } else {
        alert(json.message || "Gagal menghapus kas");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const pendingKas = kasList.filter((k) => k.status === "pending");
  const processedKas = kasList.filter((k) => k.status !== "pending");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topHeader}>
          <div>
            <Link href="/admin" className={styles.backBtn}>
              <i className="bx bx-arrow-back" /> Dashboard Utama
            </Link>
            <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
              Verifikasi & Manajemen Kas Anggota
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/donasi" className={styles.backBtn}>
              <i className="bx bx-donate-heart" /> Verifikasi Donasi
            </Link>
            <Link
              href="/admin/spreadsheet"
              className={styles.backBtn}
              style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.4)" }}
            >
              <i className="bx bx-table" /> Live Spreadsheet
            </Link>
            <ThemeToggle />
          </div>
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="bx bx-check-circle" /> {msg}
          </div>
        )}

        {/* 1. Antrean Kas Pending */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-time-five" style={{ color: "var(--gold)" }} />
              Antrean Pembayaran Kas Masuk
              <span className={styles.countBadge}>{pendingKas.length} Pending</span>
            </h2>
          </div>

          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat antrean kas...</p>
            </div>
          ) : pendingKas.length === 0 ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-check-double" style={{ color: "#10b981" }} />
              <p>Tidak ada pembayaran kas yang menunggu verifikasi.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>No. Anggota</th>
                    <th>Nama Anggota</th>
                    <th>Periode</th>
                    <th>Nominal</th>
                    <th>Tanggal Kirim</th>
                    <th>Bukti Transfer</th>
                    <th>Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingKas.map((k) => {
                    const noAnggota = k.noAnggota || k.no_anggota || k.anggota?.noAnggota || k.anggota?.no_anggota || "-";
                    const namaLengkap = k.namaLengkap || k.nama_lengkap || k.anggota?.namaLengkap || k.anggota?.nama_lengkap || "Member Cavallery";

                    return (
                      <tr key={k.id}>
                        <td>#{k.id}</td>
                        <td>
                          <span className={styles.noAnggota}>{noAnggota}</span>
                        </td>
                        <td className={styles.nameCol}>{namaLengkap}</td>
                        <td>{k.periode}</td>
                        <td style={{ fontWeight: 800, color: "var(--primary)" }}>
                          {formatRupiah(k.nominal)}
                        </td>
                        <td>
                          {new Date(k.createdAt || k.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          {k.buktiBayarUrl || k.bukti_bayar_url ? (
                            <button
                              type="button"
                              className={styles.backBtn}
                              style={{ fontSize: "0.75rem", padding: "4px 10px", color: "var(--gold)" }}
                              onClick={() => setSelectedProof(k.buktiBayarUrl || k.bukti_bayar_url)}
                            >
                              <i className="bx bx-image-alt" /> Lihat Bukti
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button
                              className={styles.btnAccept}
                              disabled={actionLoading === k.id}
                              onClick={() => handleAction(k.id, "verifikasi")}
                            >
                              <i className="bx bx-check" /> Verifikasi
                            </button>
                            <button
                              className={styles.btnReject}
                              disabled={actionLoading === k.id}
                              onClick={() => handleAction(k.id, "tolak")}
                            >
                              <i className="bx bx-x" /> Tolak
                            </button>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDeleteKas(k.id)}
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

        {/* 2. Riwayat Pembayaran Kas Terverifikasi / Ditolak */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-history" style={{ color: "var(--gold)" }} />
              Riwayat Pembayaran Kas
              <span className={`${styles.countBadge} ${styles.countBadgeGreen}`}>
                {processedKas.length} Terproses
              </span>
            </h2>
          </div>

          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat riwayat kas...</p>
            </div>
          ) : processedKas.length === 0 ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-inbox" />
              <p>Belum ada riwayat pembayaran kas.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>No. Anggota</th>
                    <th>Nama Anggota</th>
                    <th>Periode</th>
                    <th>Nominal</th>
                    <th>Status</th>
                    <th>Verifikator</th>
                    <th>Bukti</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {processedKas.map((k) => {
                    const noAnggota = k.noAnggota || k.no_anggota || k.anggota?.noAnggota || k.anggota?.no_anggota || "-";
                    const namaLengkap = k.namaLengkap || k.nama_lengkap || k.anggota?.namaLengkap || k.anggota?.nama_lengkap || "Member Cavallery";

                    return (
                      <tr key={k.id}>
                        <td>#{k.id}</td>
                        <td>
                          <span className={styles.noAnggota}>{noAnggota}</span>
                        </td>
                        <td className={styles.nameCol}>{namaLengkap}</td>
                        <td>{k.periode}</td>
                        <td style={{ fontWeight: 800 }}>{formatRupiah(k.nominal)}</td>
                        <td>
                          <span
                            className={`${styles.badgeStatus} ${
                              k.status === "diverifikasi" ? styles.statusAktif : styles.statusNonaktif
                            }`}
                          >
                            {k.status}
                          </span>
                        </td>
                        <td>{k.verifiedBy || k.verified_by || "-"}</td>
                        <td>
                          {(k.buktiBayarUrl || k.bukti_bayar_url) && (
                            <button
                              type="button"
                              className={styles.backBtn}
                              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                              onClick={() => setSelectedProof(k.buktiBayarUrl || k.bukti_bayar_url)}
                            >
                              <i className="bx bx-image" />
                            </button>
                          )}
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button
                              type="button"
                              className={styles.btnEdit}
                              onClick={() =>
                                setEditKas({
                                  id: k.id,
                                  periode: k.periode,
                                  nominal: k.nominal,
                                  status: k.status,
                                })
                              }
                            >
                              <i className="bx bx-edit" /> Edit
                            </button>
                            <button
                              type="button"
                              className={styles.btnDelete}
                              onClick={() => handleDeleteKas(k.id)}
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
      </div>

      {/* ── MODAL PROOF IMAGE VIEWER ── */}
      {selectedProof && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProof(null)}>
          <div
            className={styles.modalCard}
            style={{ maxWidth: 520, textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-receipt" /> Bukti Pembayaran Kas
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setSelectedProof(null)}
              >
                <i className="bx bx-x" />
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              <img
                src={selectedProof}
                alt="Bukti Transfer"
                style={{
                  width: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                }}
              />
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              <a
                href={selectedProof}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.backBtn}
              >
                <i className="bx bx-link-external" /> Buka Ukuran Penuh
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT KAS ── */}
      {editKas && (
        <div className={styles.modalOverlay} onClick={() => setEditKas(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-edit" /> Edit Data Pembayaran Kas #{editKas.id}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setEditKas(null)}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Periode Kas</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={editKas.periode || ""}
                  onChange={(e) => setEditKas({ ...editKas, periode: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nominal (Rp)</label>
                <input
                  type="number"
                  className={styles.modalInput}
                  value={editKas.nominal || ""}
                  onChange={(e) => setEditKas({ ...editKas, nominal: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Status Verifikasi</label>
                <select
                  className={styles.modalSelect}
                  value={editKas.status || "diverifikasi"}
                  onChange={(e) => setEditKas({ ...editKas, status: e.target.value })}
                >
                  <option value="diverifikasi">Diverifikasi (Valid)</option>
                  <option value="pending">Pending (Menunggu)</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setEditKas(null)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnCreate}>
                  <i className="bx bx-check" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
