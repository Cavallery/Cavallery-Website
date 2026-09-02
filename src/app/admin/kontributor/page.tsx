"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../keanggotaan/page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

function formatRupiah(amount: number) {
  return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
}

export default function AdminKontributorPage() {
  const [kontributorList, setKontributorList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Form Create State
  const [newNama, setNewNama] = useState("");
  const [newKontakPlatform, setNewKontakPlatform] = useState("X (Twitter)");
  const [newKontakId, setNewKontakId] = useState("");
  const [newDiscord, setNewDiscord] = useState("");

  const fetchKontributor = async () => {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/kontributor${q}`);
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json();
      if (json.status && json.data) {
        setKontributorList(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKontributor();
  }, [search]);

  const handleAction = async (id: number, action: string, extra: any = {}) => {
    if (action === "delete") {
      if (!confirm("Yakin ingin menghapus data kontributor ini?")) return;
    }

    setActionLoading(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/kontributor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, ...extra }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchKontributor();
      } else {
        alert(json.message || "Gagal memproses aksi");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newKontakId) {
      alert("Nama dan ID Kontak wajib diisi");
      return;
    }

    try {
      const res = await fetch("/api/admin/kontributor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          nama: newNama,
          kontakPlatform: newKontakPlatform,
          kontakId: newKontakId,
          discord: newDiscord,
        }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setShowCreateModal(false);
        setNewNama("");
        setNewKontakId("");
        setNewDiscord("");
        fetchKontributor();
      } else {
        alert(json.message || "Gagal menambahkan kontributor");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      const res = await fetch("/api/admin/kontributor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setEditItem(null);
        fetchKontributor();
      } else {
        alert(json.message || "Gagal mengupdate kontributor");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const totalNominalAll = kontributorList.reduce((acc, k) => acc + (k.totalKontribusi || 0), 0);
  const totalAktif = kontributorList.filter((k) => k.status === "aktif").length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.topHeader}>
          <div>
            <Link href="/admin" className={styles.backBtn}>
              <i className="bx bx-arrow-back" /> Dashboard Utama
            </Link>
            <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
              <i className="bx bx-heart-circle" style={{ color: "var(--gold)", marginRight: 8 }} />
              Manajemen Kontributor Cavallery
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className={styles.btnCreate}
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bx bx-user-plus" /> Tambah Kontributor Manual
            </button>
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/kas" className={styles.backBtn}>
              <i className="bx bx-wallet" /> Verifikasi Kas
            </Link>
            <Link href="/admin/donasi" className={styles.backBtn}>
              <i className="bx bx-donate-heart" /> Verifikasi Donasi
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

        {/* Feedback Message */}
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

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div className={styles.sectionCard} style={{ padding: "20px 24px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--fg-muted)", fontWeight: 700 }}>Total Kontributor</span>
            <h3 style={{ margin: "6px 0 0", fontSize: "1.8rem", color: "var(--primary)", fontFamily: "var(--serif)" }}>
              {kontributorList.length} <span style={{ fontSize: "0.9rem", fontFamily: "var(--sans)" }}>Orang</span>
            </h3>
          </div>
          <div className={styles.sectionCard} style={{ padding: "20px 24px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--fg-muted)", fontWeight: 700 }}>Kontributor Aktif</span>
            <h3 style={{ margin: "6px 0 0", fontSize: "1.8rem", color: "#10b981", fontFamily: "var(--serif)" }}>
              {totalAktif} <span style={{ fontSize: "0.9rem", fontFamily: "var(--sans)" }}>Aktif</span>
            </h3>
          </div>
          <div className={styles.sectionCard} style={{ padding: "20px 24px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--fg-muted)", fontWeight: 700 }}>Total Kontribusi Masuk</span>
            <h3 style={{ margin: "6px 0 0", fontSize: "1.8rem", color: "var(--gold)", fontFamily: "var(--serif)" }}>
              {formatRupiah(totalNominalAll)}
            </h3>
          </div>
        </div>

        {/* Direktori Kontributor */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-list-ul" style={{ color: "var(--gold)" }} />
              Daftar Kontributor Terdaftar
              <span className={`${styles.countBadge} ${styles.countBadgeGreen}`}>
                {kontributorList.length} Kontributor
              </span>
            </h2>

            <div className={styles.searchBar}>
              <i className="bx bx-search" style={{ color: "var(--fg-dim)" }} />
              <input
                type="text"
                placeholder="Cari nama, kontak, platform..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", color: "var(--fg-dim)", cursor: "pointer" }}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat daftar kontributor...</p>
            </div>
          ) : kontributorList.length === 0 ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-user-x" />
              <p>Belum ada data kontributor yang ditemukan.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Kontributor</th>
                    <th>Platform & Kontak</th>
                    <th>Discord</th>
                    <th>Total Kontribusi</th>
                    <th>Frekuensi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kontributorList.map((k) => (
                    <tr key={k.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className={styles.avatarCellCircle}>
                            {k.nama ? k.nama.charAt(0).toUpperCase() : "K"}
                          </div>
                          <div>
                            <div className={styles.nameCol}>{k.nama}</div>
                            <span style={{ fontSize: "0.75rem", color: "var(--fg-dim)" }}>
                              ID #{k.id} &bull; Terdaftar: {k.createdAt ? new Date(k.createdAt).toLocaleDateString("id-ID") : "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--fg)" }}>{k.kontakId}</span>
                        <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>
                          {k.kontakPlatform}
                        </div>
                      </td>
                      <td>
                        {k.discord && k.discord !== "-" ? (
                          <span style={{ color: "#5865F2", fontWeight: 700, fontSize: "0.82rem" }}>
                            <i className="bx bxl-discord-alt" /> {k.discord}
                          </span>
                        ) : (
                          <span style={{ color: "var(--fg-dim)" }}>-</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: "var(--gold)" }}>
                          {formatRupiah(k.totalKontribusi)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--fg)" }}>
                          {k.frekuensiKontribusi}x
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badgeStatus} ${
                            k.status === "aktif" ? styles.statusAktif : styles.statusNonaktif
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtonGroup}>
                          <button
                            type="button"
                            className={styles.btnActionEdit}
                            onClick={() =>
                              setEditItem({
                                id: k.id,
                                nama: k.nama,
                                kontakPlatform: k.kontakPlatform,
                                kontakId: k.kontakId,
                                discord: k.discord === "-" ? "" : k.discord,
                                status: k.status,
                              })
                            }
                            title="Edit Data Kontributor"
                          >
                            <i className="bx bx-edit" /> Edit
                          </button>

                          {k.status === "aktif" ? (
                            <button
                              type="button"
                              className={styles.btnActionDeactivate}
                              onClick={() => handleAction(k.id, "update_status", { status: "nonaktif" })}
                              disabled={actionLoading === k.id}
                              title="Nonaktifkan Akun"
                            >
                              <i className="bx bx-power-off" /> Nonaktifkan
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={styles.btnActionActivate}
                              onClick={() => handleAction(k.id, "update_status", { status: "aktif" })}
                              disabled={actionLoading === k.id}
                              title="Aktifkan Kembali"
                            >
                              <i className="bx bx-check" /> Aktifkan
                            </button>
                          )}

                          <button
                            type="button"
                            className={styles.btnActionDelete}
                            onClick={() => handleAction(k.id, "delete")}
                            disabled={actionLoading === k.id}
                            title="Hapus Kontributor"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL CREATE KONTRIBUTOR ── */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-user-plus" /> Tambah Kontributor Manual
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nama Lengkap / Panggilan Kontributor *</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Contoh: Budi Santoso"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  required
                />
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Platform Kontak *</label>
                  <select
                    className={styles.modalSelect}
                    value={newKontakPlatform}
                    onChange={(e) => setNewKontakPlatform(e.target.value)}
                  >
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="LINE">LINE</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>ID Kontak / Username *</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="@username / Nomor WA"
                    value={newKontakId}
                    onChange={(e) => setNewKontakId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Username Discord (Opsional)</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Contoh: budi#1234"
                  value={newDiscord}
                  onChange={(e) => setNewDiscord(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnCreate}>
                  <i className="bx bx-save" /> Simpan Kontributor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT KONTRIBUTOR ── */}
      {editItem && (
        <div className={styles.modalOverlay} onClick={() => setEditItem(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-edit" /> Edit Data Kontributor
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setEditItem(null)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nama Lengkap / Panggilan *</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={editItem.nama || ""}
                  onChange={(e) => setEditItem({ ...editItem, nama: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Platform Kontak *</label>
                  <select
                    className={styles.modalSelect}
                    value={editItem.kontakPlatform || "X (Twitter)"}
                    onChange={(e) => setEditItem({ ...editItem, kontakPlatform: e.target.value })}
                  >
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="LINE">LINE</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>ID Kontak / Username *</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editItem.kontakId || ""}
                    onChange={(e) => setEditItem({ ...editItem, kontakId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Username Discord</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editItem.discord || ""}
                    onChange={(e) => setEditItem({ ...editItem, discord: e.target.value })}
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Status</label>
                  <select
                    className={styles.modalSelect}
                    value={editItem.status || "aktif"}
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setEditItem(null)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnCreate}>
                  <i className="bx bx-save" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
