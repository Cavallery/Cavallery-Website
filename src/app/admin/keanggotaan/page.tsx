"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

const JABATAN_OPTIONS = [
  "Anggota",
  "Admin Fanbase",
];

const DIVISI_OPTIONS = [
  "Ketua",
  "Wakil Ketua",
  "Sekretariat",
  "Bendahara",
  "Divisi Sosial Media",
  "Divisi Desain",
  "Divisi IT",
  "Divisi Kordinator Lapangan",
  "Divisi Esport",
  "Divisi Humas",
];

export default function AdminKeanggotaanPage() {
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [direktoriList, setDirektoriList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJabatan, setFilterJabatan] = useState<"semua" | "anggota" | "admin">("semua");
  const [filterGender, setFilterGender] = useState<"semua" | "perempuan" | "laki">("semua");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMember, setEditMember] = useState<any | null>(null);

  // Registration Open/Close Settings State
  const [regAnggotaOpen, setRegAnggotaOpen] = useState(true);
  const [regDonaturOpen, setRegDonaturOpen] = useState(true);
  const [settingLoading, setSettingLoading] = useState(false);

  // Form Create State
  const [newNoAnggota, setNewNoAnggota] = useState("");
  const [newNamaLengkap, setNewNamaLengkap] = useState("");
  const [newIdLine, setNewIdLine] = useState("");
  const [newDisplayLine, setNewDisplayLine] = useState("");
  const [newDiscord, setNewDiscord] = useState("");
  const [newGender, setNewGender] = useState("Laki-laki");
  const [newDomisili, setNewDomisili] = useState("");
  const [newKontakPlatform, setNewKontakPlatform] = useState("X (Twitter)");
  const [newKontakId, setNewKontakId] = useState("");
  const [newJabatan, setNewJabatan] = useState("Anggota");
  const [newDivisi, setNewDivisi] = useState("Ketua");
  const [newFotoProfil, setNewFotoProfil] = useState("");
  const [uploadingCreateFoto, setUploadingCreateFoto] = useState(false);
  const [uploadingEditFoto, setUploadingEditFoto] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/pengaturan");
      const json = await res.json();
      if (json.status && json.data) {
        setRegAnggotaOpen(json.data.registerAnggotaOpen);
        setRegDonaturOpen(json.data.registerDonaturOpen);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSetting = async (key: string, currentValue: boolean) => {
    setSettingLoading(true);
    try {
      const res = await fetch("/api/admin/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: !currentValue }),
      });
      const json = await res.json();
      if (json.status && json.data) {
        setRegAnggotaOpen(json.data.registerAnggotaOpen);
        setRegDonaturOpen(json.data.registerDonaturOpen);
        setMsg(
          key === "register_anggota_open"
            ? `Pendaftaran Anggota berhasil di-${!currentValue ? "BUKA" : "TUTUP"}`
            : `Pendaftaran Donatur berhasil di-${!currentValue ? "BUKA" : "TUTUP"}`
        );
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status pendaftaran");
    } finally {
      setSettingLoading(false);
    }
  };

  // Upload Foto Helper
  const handleUploadFoto = async (file: File, isEdit: boolean) => {
    if (isEdit) setUploadingEditFoto(true);
    else setUploadingCreateFoto(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.status && json.url) {
        if (isEdit) {
          setEditMember((prev: any) => ({ ...prev, fotoProfil: json.url }));
        } else {
          setNewFotoProfil(json.url);
        }
      } else {
        alert(json.message || "Gagal mengunggah foto");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan unggah foto");
    } finally {
      if (isEdit) setUploadingEditFoto(false);
      else setUploadingCreateFoto(false);
    }
  };

  const fetchData = async () => {
    try {
      const url = search ? `/api/admin/keanggotaan?search=${encodeURIComponent(search)}` : "/api/admin/keanggotaan";
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json();
      if (json.status && json.data) {
        setPendingList(json.data.antrean || json.data.pending || []);
        setDirektoriList(json.data.direktori || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, [search]);

  // Aksi Cepat: Terima / Tolak / Ubah Status / Ubah Jabatan
  const handleAction = async (id: number, action: string, extra?: { status?: string; jabatan?: string }) => {
    setActionLoading(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/keanggotaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, ...extra }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchData();
      } else {
        alert(json.message || "Gagal memproses aksi");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Tambah Anggota Manual (CREATE)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamaLengkap.trim() || !newIdLine.trim()) {
      alert("Nama Lengkap dan ID LINE wajib diisi!");
      return;
    }

    try {
      const res = await fetch("/api/admin/keanggotaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          noAnggota: newNoAnggota.trim() || undefined,
          namaLengkap: newNamaLengkap.trim(),
          idLine: newIdLine.trim(),
          displayLine: newDisplayLine.trim() || undefined,
          discord: newDiscord.trim() || undefined,
          gender: newGender,
          domisili: newDomisili.trim() || "Bekasi",
          kontakPlatform: newKontakPlatform,
          kontakId: newKontakId.trim() || newIdLine.trim(),
          jabatanBaru: newJabatan,
          divisi: newJabatan === "Admin Fanbase" ? newDivisi : undefined,
          fotoProfil: newFotoProfil.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setShowCreateModal(false);
        // Reset form
        setNewNoAnggota("");
        setNewNamaLengkap("");
        setNewIdLine("");
        setNewDisplayLine("");
        setNewDiscord("");
        setNewDomisili("");
        setNewKontakId("");
        setNewFotoProfil("");
        fetchData();
      } else {
        alert(json.message || "Gagal menambah anggota");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  // Submit Edit Anggota (UPDATE)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;

    try {
      const res = await fetch("/api/admin/keanggotaan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMember),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setEditMember(null);
        fetchData();
      } else {
        alert(json.message || "Gagal memperbarui anggota");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  // Submit Hapus Anggota (DELETE)
  const handleDeleteMember = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin MENGHAPUS anggota "${nama}" secara permanen dari database?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/keanggotaan?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchData();
      } else {
        alert(json.message || "Gagal menghapus anggota");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

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
              Manajemen Keanggotaan Cavallery
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className={styles.btnCreate}
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bx bx-user-plus" /> Tambah Anggota Manual
            </button>
            <Link href="/admin/kontributor" className={styles.backBtn}>
              <i className="bx bx-user-heart" /> Kontributor
            </Link>
            <Link href="/admin/kas" className={styles.backBtn}>
              <i className="bx bx-wallet" /> Verifikasi Kas
            </Link>
            <Link href="/admin/donasi" className={styles.backBtn}>
              <i className="bx bx-donate-heart" /> Verifikasi Donasi
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

        {/* Global Feedback Message */}
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

        {/* ── KONTROL BUKA / TUTUP PENDAFTARAN ── */}
        <div className={styles.toggleRow}>
          <div className={styles.toggleCard}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>
                <i className="bx bx-user-check" style={{ color: "var(--gold)" }} /> Pendaftaran Anggota
              </span>
              <span className={styles.toggleDesc}>
                {regAnggotaOpen
                  ? "Pendaftaran anggota baru sedang DIBUKA"
                  : "Pendaftaran anggota baru sedang DITUTUP"}
              </span>
            </div>
            <button
              type="button"
              disabled={settingLoading}
              className={`${styles.toggleBtn} ${
                regAnggotaOpen ? styles.toggleBtnOpen : styles.toggleBtnClosed
              }`}
              onClick={() => handleToggleSetting("register_anggota_open", regAnggotaOpen)}
            >
              <i className={`bx ${regAnggotaOpen ? "bx-lock-open" : "bx-lock"}`} />
              {regAnggotaOpen ? "Buka (Aktif)" : "Tutup (Nonaktif)"}
            </button>
          </div>

          <div className={styles.toggleCard}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>
                <i className="bx bx-user-heart" style={{ color: "var(--gold)" }} /> Pendaftaran Kontributor
              </span>
              <span className={styles.toggleDesc}>
                {regDonaturOpen
                  ? "Pendaftaran kontributor baru sedang DIBUKA"
                  : "Pendaftaran kontributor baru sedang DITUTUP"}
              </span>
            </div>
            <button
              type="button"
              disabled={settingLoading}
              className={`${styles.toggleBtn} ${
                regDonaturOpen ? styles.toggleBtnOpen : styles.toggleBtnClosed
              }`}
              onClick={() => handleToggleSetting("register_donatur_open", regDonaturOpen)}
            >
              <i className={`bx ${regDonaturOpen ? "bx-lock-open" : "bx-lock"}`} />
              {regDonaturOpen ? "Buka (Aktif)" : "Tutup (Nonaktif)"}
            </button>
          </div>
        </div>

        {/* 1. Antrean Pendaftar Baru (Pending) */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-time" style={{ color: "var(--gold)" }} />
              Antrean Pendaftar (Menunggu Verifikasi)
              <span className={styles.countBadge}>{pendingList.length} Menunggu</span>
            </h2>
          </div>

          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat data pendaftar...</p>
            </div>
          ) : pendingList.length === 0 ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-check-double" style={{ color: "#10b981" }} />
              <p>Tidak ada antrean pendaftar baru. Semua telah diverifikasi.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>No. Anggota</th>
                    <th>Nama Lengkap</th>
                    <th>ID LINE</th>
                    <th>Display LINE</th>
                    <th>Discord</th>
                    <th>Gender</th>
                    <th>Domisili</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th>Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingList.map((p, idx) => {
                    const noAnggota = p.noAnggota || p.no_anggota || "-";
                    const namaLengkap = p.namaLengkap || p.nama_lengkap || "-";
                    const idLine = p.idLine || p.id_line || "-";
                    const displayLine = p.displayLine || p.display_line || "-";
                    const kontakPlatform = p.kontakPlatform || p.kontak_platform || "Kontak";
                    const kontakId = p.kontakId || p.kontak_id || "-";

                    return (
                      <tr key={p.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <span className={styles.noAnggota}>{noAnggota}</span>
                        </td>
                        <td className={styles.nameCol}>{namaLengkap}</td>
                        <td>{idLine}</td>
                        <td>{displayLine}</td>
                        <td>{p.discord || "-"}</td>
                        <td>{p.gender || "-"}</td>
                        <td>{p.domisili || "-"}</td>
                        <td>
                          {kontakPlatform}: {kontakId}
                        </td>
                        <td>
                          <span className={`${styles.badgeStatus} ${styles.statusPending}`}>Pending</span>
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button
                              className={styles.btnAccept}
                              disabled={actionLoading === p.id}
                              onClick={() => handleAction(p.id, "terima")}
                            >
                              <i className="bx bx-check" /> Terima
                            </button>
                            <button
                              className={styles.btnReject}
                              disabled={actionLoading === p.id}
                              onClick={() => handleAction(p.id, "tolak")}
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

        {/* 2. Direktori Anggota Resmi */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-id-card" style={{ color: "var(--gold)" }} />
              Direktori Anggota Resmi
              <span className={`${styles.countBadge} ${styles.countBadgeGreen}`}>
                {direktoriList.length} Total
              </span>
            </h2>

            {/* Filter & Search Bar */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
              {/* Filter Jabatan */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["semua", "anggota", "admin"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterJabatan(f)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 50,
                      border: filterJabatan === f ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                      background: filterJabatan === f ? "var(--primary)" : "transparent",
                      color: filterJabatan === f ? "#fff" : "var(--fg-muted)",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {f === "semua" ? (
                      <><i className="bx bx-group" /> Semua ({direktoriList.length})</>
                    ) : f === "anggota" ? (
                      <><i className="bx bx-user" /> Anggota ({direktoriList.filter(a => (a.jabatan || "Anggota") === "Anggota").length})</>
                    ) : (
                      <><i className="bx bx-shield" /> Admin ({direktoriList.filter(a => (a.jabatan || "Anggota") !== "Anggota").length})</>
                    )}
                  </button>
                ))}
              </div>

              {/* Filter Gender */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["semua", "laki", "perempuan"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFilterGender(g)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 50,
                      border: filterGender === g ? "2px solid #e879f9" : "1.5px solid var(--border)",
                      background: filterGender === g ? "rgba(232,121,249,0.15)" : "transparent",
                      color: filterGender === g ? "#e879f9" : "var(--fg-muted)",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {g === "semua" ? (
                      <><i className="bx bx-filter-alt" /> Gender</>
                    ) : g === "perempuan" ? (
                      <><i className="bx bx-female" /> Perempuan ({direktoriList.filter(a => a.gender === "Perempuan").length})</>
                    ) : (
                      <><i className="bx bx-male" /> Laki-laki ({direktoriList.filter(a => a.gender === "Laki-laki").length})</>
                    )}
                  </button>
                ))}
              </div>

              <div className={styles.searchBar}>
                <i className="bx bx-search" />
                <input
                  type="text"
                  placeholder="Cari Nama / CAVA-xxxx / Domisili..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat direktori anggota...</p>
            </div>
          ) : direktoriList.length === 0 ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-search" />
              <p>Tidak ada data anggota yang cocok.</p>
            </div>
          ) : (() => {
            const filtered = direktoriList.filter((a) => {
              const jabatan = a.jabatan || "Anggota";
              if (filterJabatan === "anggota" && jabatan !== "Anggota") return false;
              if (filterJabatan === "admin" && jabatan === "Anggota") return false;
              if (filterGender === "perempuan" && a.gender !== "Perempuan") return false;
              if (filterGender === "laki" && a.gender !== "Laki-laki") return false;
              return true;
            });
            const totalNominal = filtered.length;
            return (
            <div className={styles.tableWrap}>
              <div style={{ padding: "6px 12px", marginBottom: 8, background: "rgba(var(--primary-rgb,160,100,30),0.08)", borderRadius: 8, fontSize: "0.82rem", color: "var(--fg-muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span><i className="bx bx-user-check" style={{ color: "#10b981" }} /> <strong style={{ color: "var(--fg)" }}>{totalNominal}</strong> anggota ditampilkan</span>
                <span><i className="bx bx-female" style={{ color: "#e879f9" }} /> <strong style={{ color: "#e879f9" }}>{filtered.filter(a => a.gender === "Perempuan").length}</strong> perempuan</span>
                <span><i className="bx bx-male" style={{ color: "#60a5fa" }} /> <strong style={{ color: "#60a5fa" }}>{filtered.filter(a => a.gender === "Laki-laki").length}</strong> laki-laki</span>
                <span><i className="bx bx-shield" style={{ color: "var(--primary)" }} /> <strong style={{ color: "var(--primary)" }}>{filtered.filter(a => (a.jabatan || "Anggota") !== "Anggota").length}</strong> admin fanbase</span>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>No. Anggota</th>
                    <th>Nama Lengkap</th>
                    <th>ID LINE</th>
                    <th>Gender</th>
                    <th>Domisili</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th>Jabatan</th>
                    <th>Aksi & Kelola</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const noAnggota = a.noAnggota || a.no_anggota || "-";
                    const namaLengkap = a.namaLengkap || a.nama_lengkap || "-";
                    const idLine = a.idLine || a.id_line || "-";
                    const kontakPlatform = a.kontakPlatform || a.kontak_platform || "Kontak";
                    const kontakId = a.kontakId || a.kontak_id || "-";
                    const jabatan = a.jabatan || "Anggota";
                    const isAdminRole = jabatan !== "Anggota";
                    const avatarUrl = a.fotoProfil || a.foto_profil;

                    return (
                      <tr key={a.id}>
                        <td>
                          <div className={styles.avatarCell}>
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={namaLengkap} className={styles.avatarCellImg} />
                            ) : (
                              <span>{namaLengkap.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={styles.noAnggota}>{noAnggota}</span>
                        </td>
                        <td className={styles.nameCol}>
                          {namaLengkap}
                          {a.gender === "Perempuan" && (
                            <span style={{ marginLeft: 5, fontSize: "0.7rem", padding: "1px 6px", borderRadius: 50, background: "rgba(232,121,249,0.18)", color: "#e879f9", fontWeight: 700, verticalAlign: "middle" }}>
                              <i className="bx bx-female" /> P
                            </span>
                          )}
                        </td>
                        <td>{idLine}</td>
                        <td>{a.gender || "-"}</td>
                        <td>{a.domisili || "-"}</td>
                        <td>
                          {kontakPlatform}: {kontakId}
                        </td>
                        <td>
                          <span
                            className={`${styles.badgeStatus} ${
                              a.status === "aktif" ? styles.statusAktif : styles.statusNonaktif
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            <select
                              value={jabatan}
                              onChange={(e) =>
                                handleAction(a.id, "update_jabatan", {
                                  jabatan: e.target.value,
                                  divisi: e.target.value === "Admin Fanbase" ? (a.divisi || "Ketua") : undefined,
                                })
                              }
                              className={isAdminRole ? styles.selectJabatanAdmin : styles.selectJabatanMember}
                              title="Ubah Jabatan / Role Anggota"
                            >
                              {JABATAN_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>

                            {isAdminRole && (
                              <select
                                value={a.divisi || "Ketua"}
                                onChange={(e) =>
                                  handleAction(a.id, "update_jabatan", {
                                    jabatan: "Admin Fanbase",
                                    divisi: e.target.value,
                                  })
                                }
                                className={styles.selectDivisiAdmin}
                                title="Ubah Divisi Pengurus"
                              >
                                {DIVISI_OPTIONS.map((div) => (
                                  <option key={div} value={div}>
                                    {div}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={styles.actionButtonGroup}>
                            {/* Tombol Edit */}
                            <button
                              type="button"
                              className={styles.btnActionEdit}
                              onClick={() =>
                                setEditMember({
                                  id: a.id,
                                  noAnggota: noAnggota !== "-" ? noAnggota : "",
                                  namaLengkap,
                                  idLine,
                                  displayLine: a.displayLine || a.display_line || "",
                                  discord: a.discord || "",
                                  gender: a.gender || "Laki-laki",
                                  domisili: a.domisili || "",
                                  kontakPlatform: a.kontakPlatform || a.kontak_platform || "X (Twitter)",
                                  kontakId: a.kontakId || a.kontak_id || "",
                                  status: a.status || "aktif",
                                  jabatan,
                                  divisi: a.divisi || "Ketua",
                                  fotoProfil: avatarUrl || "",
                                  anggotaSejak: a.anggotaSejak || a.anggota_sejak,
                                })
                              }
                              title="Edit Data Lengkap"
                            >
                              <i className="bx bx-edit" /> Edit
                            </button>

                            {/* Toggle Aktif / Nonaktif */}
                            <button
                              type="button"
                              className={
                                a.status === "aktif"
                                  ? styles.btnActionDeactivate
                                  : styles.btnActionActivate
                              }
                              onClick={() =>
                                handleAction(a.id, "update_status", {
                                  status: a.status === "aktif" ? "nonaktif" : "aktif",
                                })
                              }
                              title="Ubah Status Aktif/Nonaktif"
                            >
                              {a.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              className={styles.btnActionDelete}
                              onClick={() => handleDeleteMember(a.id, namaLengkap)}
                              title="Hapus Anggota"
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
            );
          })()}
        </div>
      </div>

      {/* ── MODAL CREATE: TAMBAH ANGGOTA MANUAL ── */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-user-plus" /> Tambah Anggota Manual
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowCreateModal(false)}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.modalForm}>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>No. Anggota (Opsional)</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Auto generate jika kosong (CAVA-xxxx)"
                    value={newNoAnggota}
                    onChange={(e) => setNewNoAnggota(e.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Jabatan / Role</label>
                  <select
                    className={styles.modalSelect}
                    value={newJabatan}
                    onChange={(e) => setNewJabatan(e.target.value)}
                  >
                    {JABATAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newJabatan === "Admin Fanbase" && (
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Divisi Pengurus Fanbase</label>
                  <select
                    className={styles.modalSelect}
                    value={newDivisi}
                    onChange={(e) => setNewDivisi(e.target.value)}
                  >
                    {DIVISI_OPTIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Foto Profil */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Foto Profil Anggota (Opsional)</label>
                <div className={styles.avatarUploadWrap}>
                  <div className={styles.avatarPreviewCircle}>
                    {newFotoProfil ? (
                      <img src={newFotoProfil} alt="Preview Foto" className={styles.avatarPreviewImg} />
                    ) : (
                      <span>{newNamaLengkap ? newNamaLengkap.charAt(0).toUpperCase() : "A"}</span>
                    )}
                  </div>
                  <div className={styles.avatarUploadActions}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFoto(file, false);
                      }}
                      style={{ fontSize: "0.85rem" }}
                    />
                    {uploadingCreateFoto && (
                      <span style={{ fontSize: "0.8rem", color: "var(--gold)" }}>
                        <i className="bx bx-loader-alt bx-spin" /> Mengunggah foto...
                      </span>
                    )}
                    {newFotoProfil && (
                      <button
                        type="button"
                        onClick={() => setNewFotoProfil("")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: 0,
                        }}
                      >
                        <i className="bx bx-trash" /> Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nama Lengkap *</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Nama Lengkap Anggota"
                  value={newNamaLengkap}
                  onChange={(e) => setNewNamaLengkap(e.target.value)}
                  required
                />
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>ID LINE *</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="ID LINE"
                    value={newIdLine}
                    onChange={(e) => setNewIdLine(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Display Name LINE</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Display LINE"
                    value={newDisplayLine}
                    onChange={(e) => setNewDisplayLine(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Gender</label>
                  <select
                    className={styles.modalSelect}
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Domisili / Kota</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Contoh: Jakarta / Bekasi"
                    value={newDomisili}
                    onChange={(e) => setNewDomisili(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Platform Kontak</label>
                  <select
                    className={styles.modalSelect}
                    value={newKontakPlatform}
                    onChange={(e) => setNewKontakPlatform(e.target.value)}
                  >
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Discord">Discord</option>
                    <option value="Telegram">Telegram</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Username / ID Kontak</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="@username atau nomor WA"
                    value={newKontakId}
                    onChange={(e) => setNewKontakId(e.target.value)}
                  />
                </div>
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
                  <i className="bx bx-check" /> Simpan Anggota Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT: UBAH DATA LENGKAP ANGGOTA ── */}
      {editMember && (
        <div className={styles.modalOverlay} onClick={() => setEditMember(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-edit" /> Edit Data Anggota #{editMember.id}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setEditMember(null)}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Nomor Anggota</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editMember.noAnggota || ""}
                    onChange={(e) =>
                      setEditMember({ ...editMember, noAnggota: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Jabatan / Role</label>
                  <select
                    className={styles.modalSelect}
                    value={editMember.jabatan || "Anggota"}
                    onChange={(e) => setEditMember({ ...editMember, jabatan: e.target.value })}
                  >
                    {JABATAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editMember.jabatan === "Admin Fanbase" && (
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Divisi Pengurus Fanbase</label>
                  <select
                    className={styles.modalSelect}
                    value={editMember.divisi || "Tim Inti / Koordinator"}
                    onChange={(e) => setEditMember({ ...editMember, divisi: e.target.value })}
                  >
                    {DIVISI_OPTIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Foto Profil */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Foto Profil Anggota</label>
                <div className={styles.avatarUploadWrap}>
                  <div className={styles.avatarPreviewCircle}>
                    {editMember.fotoProfil ? (
                      <img src={editMember.fotoProfil} alt="Preview Foto" className={styles.avatarPreviewImg} />
                    ) : (
                      <span>
                        {editMember.namaLengkap
                          ? editMember.namaLengkap.charAt(0).toUpperCase()
                          : "A"}
                      </span>
                    )}
                  </div>
                  <div className={styles.avatarUploadActions}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFoto(file, true);
                      }}
                      style={{ fontSize: "0.85rem" }}
                    />
                    {uploadingEditFoto && (
                      <span style={{ fontSize: "0.8rem", color: "var(--gold)" }}>
                        <i className="bx bx-loader-alt bx-spin" /> Mengunggah foto...
                      </span>
                    )}
                    {editMember.fotoProfil && (
                      <button
                        type="button"
                        onClick={() => setEditMember({ ...editMember, fotoProfil: "" })}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: 0,
                        }}
                      >
                        <i className="bx bx-trash" /> Hapus Foto (Gunakan Inisial Huruf)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nama Lengkap *</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={editMember.namaLengkap || ""}
                  onChange={(e) => setEditMember({ ...editMember, namaLengkap: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>ID LINE *</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editMember.idLine || ""}
                    onChange={(e) => setEditMember({ ...editMember, idLine: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Display LINE</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editMember.displayLine || ""}
                    onChange={(e) => setEditMember({ ...editMember, displayLine: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Gender</label>
                  <select
                    className={styles.modalSelect}
                    value={editMember.gender || "Laki-laki"}
                    onChange={(e) => setEditMember({ ...editMember, gender: e.target.value })}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Domisili / Kota</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editMember.domisili || ""}
                    onChange={(e) => setEditMember({ ...editMember, domisili: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Platform Kontak</label>
                  <select
                    className={styles.modalSelect}
                    value={editMember.kontakPlatform || "X (Twitter)"}
                    onChange={(e) =>
                      setEditMember({ ...editMember, kontakPlatform: e.target.value })
                    }
                  >
                    <option value="X (Twitter)">X (Twitter)</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Discord">Discord</option>
                    <option value="Telegram">Telegram</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>ID Kontak</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editMember.kontakId || ""}
                    onChange={(e) => setEditMember({ ...editMember, kontakId: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Status Keanggotaan</label>
                  <select
                    className={styles.modalSelect}
                    value={editMember.status || "aktif"}
                    onChange={(e) => setEditMember({ ...editMember, status: e.target.value })}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                    <option value="pending">Pending</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Anggota Sejak (Tanggal Bergabung)</label>
                  <input
                    type="date"
                    className={styles.modalInput}
                    value={
                      editMember.anggotaSejak
                        ? new Date(editMember.anggotaSejak).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditMember({ ...editMember, anggotaSejak: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setEditMember(null)}
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
