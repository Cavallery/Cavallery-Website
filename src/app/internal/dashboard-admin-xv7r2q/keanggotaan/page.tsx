"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import ThemeToggle from "@/components/ThemeToggle";
import AdminSubNav from "@/components/admin/AdminSubNav";
import ImportBatchModal from "@/components/admin/ImportBatchModal";
import { BADGE_OPTIONS, getMemberBadge, MEMBER_BADGES } from "@/lib/badges";

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
  const [filterStatus, setFilterStatus] = useState<"semua" | "aktif" | "nonaktif">("semua");
  const [filterJabatan, setFilterJabatan] = useState<"semua" | "anggota" | "admin">("semua");
  const [filterGender, setFilterGender] = useState<"semua" | "perempuan" | "laki">("semua");
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("semua");
  const [exportFilter, setExportFilter] = useState<"all" | "aktif" | "nonaktif">("all");
  const [exporting, setExporting] = useState(false);
  const [showImportBatchModal, setShowImportBatchModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  // Dynamic Master Data
  const [divisiOptions, setDivisiOptions] = useState<string[]>(DIVISI_OPTIONS);
  const [platformOptions, setPlatformOptions] = useState<string[]>([
    "LINE",
    "X (Twitter)",
    "Instagram",
    "TikTok",
    "Discord",
    "WhatsApp",
  ]);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMember, setEditMember] = useState<any | null>(null);
  const [showBadgeGuideModal, setShowBadgeGuideModal] = useState(false);
  const [activeGuideBadgeId, setActiveGuideBadgeId] = useState<string | null>(null);

  // Registration Open/Close Settings State
  const [regAnggotaOpen, setRegAnggotaOpen] = useState(true);
  const [regDonaturOpen, setRegDonaturOpen] = useState(true);
  const [settingLoading, setSettingLoading] = useState(false);

  // Bulk / Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Form Create State
  const [newNoAnggota, setNewNoAnggota] = useState("");
  const [newNamaLengkap, setNewNamaLengkap] = useState("");
  const [newIdLine, setNewIdLine] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newDisplayLine, setNewDisplayLine] = useState("");
  const [newDiscord, setNewDiscord] = useState("");
  const [newGender, setNewGender] = useState("Laki-laki");
  const [newDomisili, setNewDomisili] = useState("");
  const [newKontakPlatform, setNewKontakPlatform] = useState("X (Twitter)");
  const [newKontakId, setNewKontakId] = useState("");
  const [newJabatan, setNewJabatan] = useState("Anggota");
  const [newDivisi, setNewDivisi] = useState("Ketua");
  const [newBadge, setNewBadge] = useState("squire");
  const [newFotoProfil, setNewFotoProfil] = useState("");
  const [uploadingCreateFoto, setUploadingCreateFoto] = useState(false);
  const [uploadingEditFoto, setUploadingEditFoto] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/pengaturan");
      const json = await res.json();
      if (json.status && json.data) {
        setRegAnggotaOpen(json.data.registerAnggotaOpen);
        setRegDonaturOpen(json.data.registerDonaturOpen);
      }

      // Fetch Master Data
      const resMd = await fetch("/api/admin/master-data");
      const jsonMd = await resMd.json();
      if (jsonMd.status && jsonMd.data) {
        if (jsonMd.data.divisi?.length) setDivisiOptions(jsonMd.data.divisi);
        if (jsonMd.data.platforms?.length) setPlatformOptions(jsonMd.data.platforms);
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

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/admin/recruitment-batches");
      const json = await res.json();
      if (json.status && json.batches) {
        setBatches(json.batches);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportAnggota = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/keanggotaan/export?filter=${exportFilter}&t=${Date.now()}`);
      if (!res.ok) throw new Error("Gagal mengunduh data anggota");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      const label = exportFilter === "all" ? "Semua" : exportFilter === "aktif" ? "Aktif" : "NonAktif";
      link.setAttribute("href", url);
      link.setAttribute("download", `Data_Anggota_Cavallery_${label}_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setMsg("Data anggota berhasil diexport ke Excel (.csv)!");
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh data anggota");
    } finally {
      setExporting(false);
    }
  };

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedBatch !== "semua") params.append("batchId", selectedBatch);
      const url = `/api/admin/keanggotaan?${params.toString()}`;
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = "/internal/dashboard-admin-xv7r2q";
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
  const handleAction = async (id: number, action: string, extra?: { status?: string; jabatan?: string; divisi?: string; badge?: string }) => {
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
          pin: newPin.trim() || undefined,
          displayLine: newDisplayLine.trim() || undefined,
          discord: newDiscord.trim() || undefined,
          gender: newGender,
          domisili: newDomisili.trim() || "Bekasi",
          kontakPlatform: newKontakPlatform,
          kontakId: newKontakId.trim() || newIdLine.trim(),
          jabatanBaru: newJabatan,
          divisi: newJabatan === "Admin Fanbase" ? newDivisi : undefined,
          badge: newBadge,
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
        setNewPin("");
        setNewDisplayLine("");
        setNewDiscord("");
        setNewDomisili("");
        setNewKontakId("");
        setNewBadge("squire");
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
      setSavingEdit(true);
      const res = await fetch("/api/admin/keanggotaan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMember),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        // Jika status diubah dari nonaktif menjadi aktif, reset filter status ke "semua" agar data tidak hilang dari pandangan admin
        if (filterStatus === "nonaktif" && editMember.status === "aktif") {
          setFilterStatus("semua");
        }
        setEditMember(null);
        fetchData();
      } else {
        alert(json.message || "Gagal memperbarui anggota");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSavingEdit(false);
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
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchData();
      } else {
        alert(json.message || "Gagal menghapus anggota");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  // ─── BULK / MULTI-SELEKSI HANDLERS ─────────────────────────
  const toggleSelectMember = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = (filteredItems: any[]) => {
    const currentIds = filteredItems.map((item) => item.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleBulkUpdateStatus = async (targetStatus: "aktif" | "nonaktif") => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/keanggotaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_update_status",
          ids: selectedIds,
          status: targetStatus,
        }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setSelectedIds([]);
        fetchData();
      } else {
        alert(json.message || "Gagal memperbarui status anggota terpilih");
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan jaringan");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/keanggotaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_delete",
          ids: selectedIds,
        }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setSelectedIds([]);
        setShowBulkDeleteModal(false);
        fetchData();
      } else {
        alert(json.message || "Gagal menghapus anggota terpilih");
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan jaringan");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Header Sub-Navbar Konsisten */}
        <AdminSubNav
          activeKey="keanggotaan"
          title="Manajemen Keanggotaan Cavallery"
          subtitle="Kelola status approval anggota baru, direktori nomor anggota resmi, jabatan pengurus, dan badge apresiasi."
        />

        {/* Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {/* Download Excel Anggota */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "4px 8px" }}>
              <i className="bx bx-filter" style={{ color: "var(--cv-orange)" }} />
              <select
                value={exportFilter}
                onChange={(e) => setExportFilter(e.target.value as any)}
                style={{
                  background: "transparent",
                  color: "var(--fg)",
                  border: "none",
                  outline: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <option value="all">Semua Anggota</option>
                <option value="aktif">Anggota Aktif</option>
                <option value="nonaktif">Non Aktif</option>
              </select>
            </div>
            <button
              type="button"
              className={styles.btnCreate}
              onClick={handleExportAnggota}
              disabled={exporting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(135deg, #0f9d58, #0b7a3e)",
                cursor: exporting ? "not-allowed" : "pointer",
              }}
              title="Download Seluruh Data Anggota ke Excel (.csv)"
            >
              {exporting ? (
                <><i className="bx bx-loader-alt bx-spin" /> Mengunduh...</>
              ) : (
                <><i className="bx bx-spreadsheet" /> Unduh Excel (.csv)</>
              )}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={styles.btnCreate}
              onClick={() => setShowImportBatchModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #10b981, #059669)" }}
              title="Import Anggota Batch dari Spreadsheet"
            >
              <i className="bx bx-import" /> Import Anggota Batch
            </button>
            <button
              type="button"
              className={styles.btnCreate}
              onClick={() => setShowCreateModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="bx bx-user-plus" /> Tambah Anggota Manual
            </button>
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
                <i className="bx bx-heart-circle" style={{ color: "var(--gold)" }} /> Pendaftaran Kontributor
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
                              className={styles.btnActionEdit}
                              onClick={() => setEditMember(p)}
                              title="Edit Data Pendaftar"
                            >
                              <i className="bx bx-edit" /> Edit
                            </button>
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

            {/* Filter Batch Tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", width: "100%", marginTop: 8, paddingBottom: 10, borderBottom: "1px dashed var(--border)" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <i className="bx bx-filter-alt" /> Filter Batch:
              </span>
              <button
                type="button"
                onClick={() => setSelectedBatch("semua")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: selectedBatch === "semua" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: selectedBatch === "semua" ? "var(--primary)" : "transparent",
                  color: selectedBatch === "semua" ? "#fff" : "var(--fg-muted)",
                }}
              >
                Semua Batch
              </button>
              {batches.map((b) => {
                const isSel = selectedBatch === String(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBatch(String(b.id))}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: isSel ? "2px solid var(--cv-orange)" : "1px solid var(--border)",
                      background: isSel ? "var(--cv-orange)" : "transparent",
                      color: isSel ? "#fff" : "var(--fg-muted)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{b.name} ({b.year})</span>
                    {b.status === "open" && (
                      <span style={{ background: "#10b981", color: "#fff", fontSize: "0.62rem", padding: "1px 5px", borderRadius: 8 }}>
                        OPEN
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedBatch("none")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: selectedBatch === "none" ? "2px solid #888" : "1px solid var(--border)",
                  background: selectedBatch === "none" ? "#888" : "transparent",
                  color: selectedBatch === "none" ? "#fff" : "var(--fg-muted)",
                }}
              >
                Tanpa Batch / Arsip Lama
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
              {/* Filter Status (Semua / Aktif / Nonaktif) */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["semua", "aktif", "nonaktif"] as const).map((st) => {
                  const isActive = filterStatus === st;
                  const count = st === "semua" 
                    ? direktoriList.length 
                    : direktoriList.filter((a) => a.status === st).length;
                  const borderCol = st === "aktif" ? "#10b981" : st === "nonaktif" ? "#ef4444" : "var(--primary)";
                  const bgCol = st === "aktif" 
                    ? (isActive ? "#10b981" : "rgba(16,185,129,0.12)") 
                    : st === "nonaktif" 
                    ? (isActive ? "#ef4444" : "rgba(239,68,68,0.12)")
                    : (isActive ? "var(--primary)" : "transparent");
                  const textCol = isActive ? "#fff" : (st === "aktif" ? "#10b981" : st === "nonaktif" ? "#ef4444" : "var(--fg-muted)");

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFilterStatus(st)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 50,
                        border: isActive ? `2px solid ${borderCol}` : `1.5px solid ${borderCol}`,
                        background: bgCol,
                        color: textCol,
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        transition: "all 0.18s",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {st === "semua" ? (
                        <><i className="bx bx-group" /> Semua Status ({count})</>
                      ) : st === "aktif" ? (
                        <><i className="bx bx-check-circle" /> Aktif ({count})</>
                      ) : (
                        <><i className="bx bx-x-circle" /> Nonaktif ({count})</>
                      )}
                    </button>
                  );
                })}
              </div>

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
                      color: filterJabatan === f ? "var(--cv-on-orange)" : "var(--fg-muted)",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {f === "semua" ? (
                      <><i className="bx bx-group" /> Semua Role ({direktoriList.length})</>
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
                      border: filterGender === g ? "2px solid var(--cv-orange)" : "1.5px solid var(--border)",
                      background: filterGender === g ? "color-mix(in srgb, var(--cv-orange) 15%, transparent)" : "transparent",
                      color: filterGender === g ? "var(--cv-orange-hi)" : "var(--fg-muted)",
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
              if (filterStatus === "aktif" && a.status !== "aktif") return false;
              if (filterStatus === "nonaktif" && a.status !== "nonaktif") return false;
              if (filterJabatan === "anggota" && jabatan !== "Anggota") return false;
              if (filterJabatan === "admin" && jabatan === "Anggota") return false;
              if (filterGender === "perempuan" && a.gender !== "Perempuan") return false;
              if (filterGender === "laki" && a.gender !== "Laki-laki") return false;
              return true;
            });
            const totalNominal = filtered.length;
            return (
            <div className={styles.tableWrap}>
              <div style={{ padding: "8px 14px", marginBottom: 10, background: "color-mix(in srgb, var(--cv-orange) 8%, transparent)", borderRadius: 10, fontSize: "0.82rem", color: "var(--fg-muted)", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span><i className="bx bx-user-check" style={{ color: "#10b981" }} /> <strong style={{ color: "var(--fg)" }}>{totalNominal}</strong> anggota ditampilkan</span>
                <span><i className="bx bx-check-circle" style={{ color: "#10b981" }} /> <strong style={{ color: "#10b981" }}>{filtered.filter(a => a.status === "aktif").length}</strong> aktif</span>
                <span><i className="bx bx-x-circle" style={{ color: "#ef4444" }} /> <strong style={{ color: "#ef4444" }}>{filtered.filter(a => a.status === "nonaktif").length}</strong> nonaktif</span>
                <span><i className="bx bx-female" style={{ color: "var(--cv-orange-hi)" }} /> <strong style={{ color: "var(--cv-orange-hi)" }}>{filtered.filter(a => a.gender === "Perempuan").length}</strong> perempuan</span>
                <span><i className="bx bx-male" style={{ color: "var(--cv-orange-hi)" }} /> <strong style={{ color: "var(--cv-orange-hi)" }}>{filtered.filter(a => a.gender === "Laki-laki").length}</strong> laki-laki</span>
                <span><i className="bx bx-shield" style={{ color: "var(--primary)" }} /> <strong style={{ color: "var(--primary)" }}>{filtered.filter(a => (a.jabatan || "Anggota") !== "Anggota").length}</strong> admin fanbase</span>
              </div>

              {/* Bulk Action Toolbar */}
              {selectedIds.length > 0 && (
                <div
                  style={{
                    padding: "10px 16px",
                    marginBottom: 12,
                    background: "linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(30, 64, 175, 0.25))",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        background: "#2563eb",
                        color: "#fff",
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {selectedIds.length} Terpilih
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--fg)", fontWeight: 600 }}>
                      Aksi massal untuk anggota terpilih:
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={bulkLoading}
                      onClick={() => handleBulkUpdateStatus("aktif")}
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                      title="Ubah status semua anggota terpilih menjadi Aktif"
                    >
                      <i className="bx bx-check-circle" /> Aktifkan Terpilih
                    </button>
                    <button
                      type="button"
                      disabled={bulkLoading}
                      onClick={() => handleBulkUpdateStatus("nonaktif")}
                      style={{
                        background: "#f59e0b",
                        color: "#000",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                      title="Ubah status semua anggota terpilih menjadi Nonaktif"
                    >
                      <i className="bx bx-pause-circle" /> Nonaktifkan Terpilih
                    </button>
                    <button
                      type="button"
                      disabled={bulkLoading}
                      onClick={() => setShowBulkDeleteModal(true)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                      title="Hapus data semua anggota terpilih dari database"
                    >
                      <i className="bx bx-trash" /> Hapus Terpilih
                    </button>
                    <button
                      type="button"
                      disabled={bulkLoading}
                      onClick={() => setSelectedIds([])}
                      style={{
                        background: "transparent",
                        color: "var(--fg-muted)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Batal Pilih
                    </button>
                  </div>
                </div>
              )}

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        title="Pilih Semua yang Ditampilkan"
                        checked={filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.id))}
                        onChange={() => toggleSelectAllFiltered(filtered)}
                        style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#2563eb" }}
                      />
                    </th>
                    <th>Foto</th>
                    <th>No. Anggota</th>
                    <th>Nama Lengkap</th>
                    <th>ID LINE</th>
                    <th>Gender</th>
                    <th>Domisili</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th>Jabatan</th>
                    <th>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span>Badge</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGuideBadgeId(null);
                            setShowBadgeGuideModal(true);
                          }}
                          style={{
                            background: "color-mix(in srgb, var(--cv-orange) 20%, transparent)",
                            border: "1px solid var(--border-gold)",
                            color: "var(--gold)",
                            borderRadius: "50%",
                            width: 18,
                            height: 18,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            padding: 0,
                          }}
                          title="Klik untuk melihat Panduan & Syarat Naik Tingkat 5 Badge"
                        >
                          <i className="bx bx-question-mark" />
                        </button>
                      </div>
                    </th>
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
                      <tr
                        key={a.id}
                        style={{
                          background: selectedIds.includes(a.id) ? "rgba(37, 99, 235, 0.08)" : undefined,
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(a.id)}
                            onChange={() => toggleSelectMember(a.id)}
                            style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#2563eb" }}
                          />
                        </td>
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
                            <span style={{ marginLeft: 5, fontSize: "0.7rem", padding: "1px 6px", borderRadius: 50, background: "color-mix(in srgb, var(--cv-orange) 18%, transparent)", color: "var(--cv-orange-hi)", fontWeight: 700, verticalAlign: "middle" }}>
                              <i className="bx bx-female" /> P
                            </span>
                          )}
                        </td>
                        <td>
                          {idLine && idLine !== "-" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <a
                                href={`line://ti/p/~${encodeURIComponent(idLine.trim().replace(/^@/, ""))}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  color: "#06c755",
                                  fontWeight: 700,
                                  textDecoration: "none",
                                }}
                                title={`Buka langsung di aplikasi LINE`}
                              >
                                <i className="bx bxl-line" style={{ fontSize: "1.1rem" }} />
                                <span>{idLine}</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                                    navigator.clipboard.writeText(idLine.trim().replace(/^@/, ""));
                                    setMsg(`ID LINE "${idLine}" berhasil disalin!`);
                                    setTimeout(() => setMsg(""), 3000);
                                  }
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--fg-muted)",
                                  cursor: "pointer",
                                  padding: "2px 4px",
                                  fontSize: "0.85rem",
                                }}
                                title="Salin ID LINE"
                              >
                                <i className="bx bx-copy" />
                              </button>
                            </div>
                          ) : (
                            <span>{idLine}</span>
                          )}

                          {/* PIN Info */}
                          <div style={{ marginTop: 4 }}>
                            {a.pin ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: "0.75rem",
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  background: "color-mix(in srgb, var(--cv-orange) 12%, transparent)",
                                  border: "1px solid color-mix(in srgb, var(--cv-orange) 30%, transparent)",
                                  color: "var(--gold)",
                                  fontWeight: 700,
                                }}
                                title="PIN Login Akun Anggota"
                              >
                                <i className="bx bxs-key" /> PIN: {a.pin}
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  color: "var(--fg-muted)",
                                  fontStyle: "italic",
                                }}
                              >
                                PIN: Belum disetel
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {a.gender ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: a.gender === "Perempuan" ? "var(--cv-orange-hi)" : "var(--cv-orange-hi)",
                              }}
                            >
                              <i className={a.gender === "Perempuan" ? "bx bx-female" : "bx bx-male"} />
                              {a.gender}
                            </span>
                          ) : (
                            <span style={{ color: "var(--fg-muted)" }}>-</span>
                          )}
                        </td>
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
                                {divisiOptions.map((div) => (
                                  <option key={div} value={div}>
                                    {div}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const bDef = getMemberBadge(a.badge);
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <select
                                  value={a.badge || "squire"}
                                  onChange={(e) =>
                                    handleAction(a.id, "update_badge", {
                                      badge: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "5px 8px",
                                    borderRadius: 8,
                                    fontSize: "0.78rem",
                                    fontWeight: 800,
                                    border: `1.5px solid ${bDef.borderColor}`,
                                    background: bDef.bgColor,
                                    color: bDef.color,
                                    cursor: "pointer",
                                    outline: "none",
                                  }}
                                  title={`Badge: ${bDef.name} - ${bDef.description}`}
                                >
                                  {BADGE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveGuideBadgeId(bDef.id);
                                    setShowBadgeGuideModal(true);
                                  }}
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 800,
                                    color: bDef.color,
                                    background: "transparent",
                                    border: "none",
                                    padding: "2px 0",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    width: "fit-content",
                                  }}
                                  title={`Klik untuk melihat penjelasan badge ${bDef.name} & cara naik ke badge selanjutnya`}
                                >
                                  <i className={`bx ${bDef.icon}`} style={{ fontSize: "0.9rem" }} />
                                  <span>{bDef.name}</span>
                                  <i className="bx bx-info-circle" style={{ fontSize: "0.75rem", opacity: 0.7 }} />
                                </button>
                              </div>
                            );
                          })()}
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
                                  pin: a.pin || "",
                                  displayLine: a.displayLine || a.display_line || "",
                                  discord: a.discord || "",
                                  gender: a.gender || "Laki-laki",
                                  domisili: a.domisili || "",
                                  kontakPlatform: a.kontakPlatform || a.kontak_platform || "X (Twitter)",
                                  kontakId: a.kontakId || a.kontak_id || "",
                                  status: a.status || "aktif",
                                  jabatan,
                                  divisi: a.divisi || "Ketua",
                                  badge: a.badge || "squire",
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
                    {divisiOptions.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Badge Anggota */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Badge Anggota</label>
                <select
                  className={styles.modalSelect}
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                >
                  {BADGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {MEMBER_BADGES[opt.value]?.description}
                    </option>
                  ))}
                </select>
              </div>

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
                  <label className={styles.modalLabel}>PIN Login (4-6 Digit)</label>
                  <input
                    type="text"
                    maxLength={6}
                    className={styles.modalInput}
                    placeholder="Cth: 123456 (Opsional)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
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
                    {divisiOptions.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Badge Anggota */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Badge Anggota</label>
                <select
                  className={styles.modalSelect}
                  value={editMember.badge || "squire"}
                  onChange={(e) => setEditMember({ ...editMember, badge: e.target.value })}
                >
                  {BADGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {MEMBER_BADGES[opt.value]?.description}
                    </option>
                  ))}
                </select>
              </div>

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
                  <label className={styles.modalLabel}>PIN Login (4-6 Digit)</label>
                  <input
                    type="text"
                    maxLength={6}
                    className={styles.modalInput}
                    placeholder="Kosongkan jika belum ada"
                    value={editMember.pin || ""}
                    onChange={(e) => setEditMember({ ...editMember, pin: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
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
                    {platformOptions.map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
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
                    value={(() => {
                      if (!editMember.anggotaSejak) return "";
                      try {
                        const d = new Date(editMember.anggotaSejak);
                        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
                      } catch {
                        return "";
                      }
                    })()}
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
                  disabled={savingEdit}
                  onClick={() => setEditMember(null)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnCreate} disabled={savingEdit}>
                  {savingEdit ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-check" /> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      <ImportBatchModal
        isOpen={showImportBatchModal}
        onClose={() => setShowImportBatchModal(false)}
        onSuccess={() => {
          setMsg("Anggota batch berhasil di-import!");
          fetchData();
          fetchBatches();
        }}
        defaultBatchName="Batch 9"
      />

      {/* ── MODAL PANDUAN 5 BADGE & CARA NAIK TINGKAT ── */}
      {showBadgeGuideModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBadgeGuideModal(false)}>
          <div
            className={styles.modalCard}
            style={{ maxWidth: 840, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "color-mix(in srgb, var(--cv-orange) 15%, transparent)",
                    border: "1px solid var(--border-gold)",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  <i className="bx bx-award" />
                </div>
                <div>
                  <h3 className={styles.modalTitle} style={{ margin: 0, fontSize: "1.15rem" }}>
                    Panduan &amp; Syarat Naik Tingkat 5 Badge Cavallery
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--fg-muted)" }}>
                    Sistem kehormatan dedikasi anggota, hierarki tingkatan, dan panduan promosi badge.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowBadgeGuideModal(false)}
                title="Tutup"
              >
                <i className="bx bx-x" />
              </button>
            </div>

            {/* Visual Roadmap Hierarki */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                padding: "14px 18px",
                background: "color-mix(in srgb, var(--cv-ink) 50%, transparent)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                marginBottom: 20,
              }}
            >
              {Object.values(MEMBER_BADGES).map((b, idx, arr) => {
                const isActive = activeGuideBadgeId === b.id;
                return (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveGuideBadgeId(b.id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 20,
                        background: isActive ? b.bgColor : "color-mix(in srgb, var(--cv-bone) 4%, transparent)",
                        border: `1.5px solid ${isActive ? b.color : b.borderColor}`,
                        color: b.color,
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        transition: "all 0.2s",
                      }}
                    >
                      <i className={`bx ${b.icon}`} style={{ fontSize: "1rem" }} />
                      <span>{b.name}</span>
                      <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>Lvl {b.level}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <i className="bx bx-chevron-right" style={{ color: "var(--fg-muted)", fontSize: "1.1rem" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* List Detail 5 Badge */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.values(MEMBER_BADGES).map((b) => {
                const isSelected = activeGuideBadgeId === b.id;
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: "16px 18px",
                      borderRadius: 14,
                      background: isSelected ? b.bgColor : "color-mix(in srgb, var(--cv-bone) 2%, transparent)",
                      border: isSelected ? `2px solid ${b.color}` : "1px solid var(--border)",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: b.bgColor,
                            border: `1.5px solid ${b.borderColor}`,
                            color: b.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.3rem",
                          }}
                        >
                          <i className={`bx ${b.icon}`} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 900, fontSize: "1.05rem", color: b.color }}>
                              {b.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 20,
                                background: b.bgColor,
                                border: `1px solid ${b.borderColor}`,
                                color: b.color,
                              }}
                            >
                              Tingkat {b.level} of 5
                            </span>
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--fg-muted)" }}>
                            {b.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            background: b.color,
                            color: "#000",
                            padding: "3px 10px",
                            borderRadius: 20,
                          }}
                        >
                          Dipilih
                        </span>
                      )}
                    </div>

                    {/* Kriteria Saat Ini */}
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--fg)",
                        background: "color-mix(in srgb, var(--cv-ink) 40%, transparent)",
                        padding: "8px 12px",
                        borderRadius: 8,
                        borderLeft: `3px solid ${b.color}`,
                      }}
                    >
                      <strong>Kriteria Anggota:</strong> {b.criteria}
                    </div>

                    {/* Syarat & Cara Naik Tingkat */}
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: b.nextBadge ? "var(--cv-orange)" : "#10b981",
                        background: b.nextBadge ? "color-mix(in srgb, var(--cv-orange) 8%, transparent)" : "rgba(16, 185, 129, 0.08)",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1px solid ${b.nextBadge ? "color-mix(in srgb, var(--cv-orange) 30%, transparent)" : "rgba(16, 185, 129, 0.3)"}`,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <i
                        className={`bx ${b.nextBadge ? "bx-up-arrow-circle" : "bx-crown"}`}
                        style={{ fontSize: "1.2rem", marginTop: 1, flexShrink: 0 }}
                      />
                      <div>
                        <strong>{b.nextBadge ? `Cara Berubah ke Badge ${b.nextBadge}:` : "Puncak Gelar:"}</strong>{" "}
                        <span style={{ color: "var(--fg)" }}>{b.howToUpgrade}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className={styles.btnCreate}
                onClick={() => setShowBadgeGuideModal(false)}
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS MASSAL ── */}
      {showBulkDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => !bulkLoading && setShowBulkDeleteModal(false)}>
          <div
            className={styles.formModal}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480 }}
          >
            <div className={styles.formModalHeader} style={{ borderBottomColor: "rgba(239, 68, 68, 0.3)" }}>
              <h3 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bx bx-error-circle" /> Konfirmasi Hapus Massal
              </h3>
              <button
                type="button"
                className={styles.closeX}
                disabled={bulkLoading}
                onClick={() => setShowBulkDeleteModal(false)}
              >
                <i className="bx bx-x" />
              </button>
            </div>
            <div className={styles.formBody} style={{ padding: "16px 20px" }}>
              <p style={{ margin: "0 0 12px", fontSize: "0.92rem", lineHeight: 1.5, color: "var(--fg)" }}>
                Anda akan menghapus secara permanen <strong>{selectedIds.length}</strong> anggota yang dipilih.
              </p>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: "0.82rem",
                  color: "#ef4444",
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                <i className="bx bx-info-circle" /> Tindakan ini akan menghapus data profil anggota, riwayat konfirmasi kas, kupon, dan mencatat penghapusan ke spreadsheet terkait. Tindakan ini tidak dapat dibatalkan.
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => setShowBulkDeleteModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "var(--surface)",
                    color: "var(--fg)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={handleBulkDelete}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {bulkLoading ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Menghapus...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-trash" /> Ya, Hapus {selectedIds.length} Anggota
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
