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

  const handleAction = async (id: number, action: "verifikasi" | "tolak") => {
    setActionLoading(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/donasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
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

  const pendingDonasi = donasiList.filter((d) => d.status === "pending");
  const processedDonasi = donasiList.filter((d) => d.status !== "pending");

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

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/kas" className={styles.backBtn}>
              <i className="bx bx-wallet" /> Verifikasi Kas
            </Link>
            <Link href="/admin/spreadsheet" className={styles.backBtn} style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.4)" }}>
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
                    <th>Aksi Verifikasi</th>
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
                            {isAnggota ? `Anggota (${d.anggota.noAnggota || "-"})` : "Donatur"}
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
                          <div className={styles.actionsCell}>
                            <button
                              className={styles.btnAccept}
                              disabled={actionLoading === d.id}
                              onClick={() => handleAction(d.id, "verifikasi")}
                            >
                              <i className="bx bx-check" /> Verifikasi
                            </button>
                            <button
                              className={styles.btnReject}
                              disabled={actionLoading === d.id}
                              onClick={() => handleAction(d.id, "tolak")}
                            >
                              <i className="bx bx-x" /> Tolak
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
                          {isAnggota ? "Anggota" : "Donatur"}
                        </span>
                      </td>
                      <td className={styles.nameCol}>{donorName}</td>
                      <td>{d.tipeDonasi}</td>
                      <td style={{ fontWeight: 800 }}>{formatRupiah(d.nominal)}</td>
                      <td>
                        <span
                          className={`${styles.badgeStatus} ${
                            d.status === "diverifikasi" ? styles.statusAktif : styles.statusNonaktif
                          }`}
                        >
                          {d.status}
                        </span>
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
