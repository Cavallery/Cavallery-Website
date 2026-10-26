"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import AdminSubNav from "@/components/admin/AdminSubNav";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Download,
  Database,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  Copy,
  X,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";

interface AnggotaItem {
  id: number;
  batch: string;
  batchNumber: number;
  noAnggota: string;
  nama: string;
  idLine: string;
  domisili: string;
  displayName: string;
  status: "Aktif" | "Keluar";
  role: "Admin" | "Anggota" | "Keluar";
}

interface Stats {
  total: number;
  aktif: number;
  keluar: number;
  admin: number;
}

export default function AdminAnggotaPage() {
  const [members, setMembers] = useState<AnggotaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, aktif: 0, keluar: 0, admin: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AnggotaItem | null>(null);
  const [deletingMember, setDeletingMember] = useState<AnggotaItem | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State (Cleaned without kas fields)
  const [formData, setFormData] = useState({
    batch: "Batch 1",
    batchNumber: 1,
    noAnggota: "",
    nama: "",
    idLine: "",
    domisili: "",
    displayName: "",
    status: "Aktif" as "Aktif" | "Keluar",
    role: "Anggota" as "Admin" | "Anggota" | "Keluar",
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/anggota", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setMembers(json.data || []);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data anggota:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const batchList = useMemo(() => {
    return [
      { id: "all", label: "Semua Batch" },
      { id: "1", label: "Batch 1" },
      { id: "2", label: "Batch 2" },
      { id: "3", label: "Batch 3" },
      { id: "4", label: "Batch 4" },
      { id: "5", label: "Batch 5" },
      { id: "6", label: "Batch 6" },
      { id: "7", label: "Batch 7" },
      { id: "8", label: "Batch 8" },
      { id: "9", label: "Batch 9" },
    ];
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (selectedBatch !== "all" && m.batchNumber !== parseInt(selectedBatch, 10)) {
        return false;
      }
      if (selectedStatus !== "all" && m.status !== selectedStatus) {
        return false;
      }
      if (selectedRole !== "all" && m.role.toLowerCase() !== selectedRole.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const qDigits = q.replace(/[^\d]/g, "");
        const mDigits = m.noAnggota.replace(/[^\d]/g, "");
        const matchDigits = qDigits.length > 0 && (mDigits.endsWith(qDigits) || parseInt(mDigits, 10) === parseInt(qDigits, 10));

        return (
          m.noAnggota.toLowerCase().includes(q) ||
          m.nama.toLowerCase().includes(q) ||
          m.idLine.toLowerCase().includes(q) ||
          m.domisili.toLowerCase().includes(q) ||
          m.displayName.toLowerCase().includes(q) ||
          matchDigits
        );
      }
      return true;
    });
  }, [members, selectedBatch, selectedStatus, selectedRole, searchTerm]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormError("");
    let nextNum = 1;
    if (members.length > 0) {
      const allNums = members.map((m) => {
        const match = m.noAnggota.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      nextNum = Math.max(...allNums) + 1;
    }
    const autoNoAnggota = `CAVA-${String(nextNum).padStart(4, "0")}`;

    setFormData({
      batch: selectedBatch !== "all" ? `Batch ${selectedBatch}` : "Batch 8",
      batchNumber: selectedBatch !== "all" ? parseInt(selectedBatch, 10) : 8,
      noAnggota: autoNoAnggota,
      nama: "",
      idLine: "",
      domisili: "",
      displayName: "",
      status: "Aktif",
      role: "Anggota",
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (m: AnggotaItem) => {
    setFormError("");
    setEditingMember(m);
    setFormData({
      batch: m.batch,
      batchNumber: m.batchNumber,
      noAnggota: m.noAnggota,
      nama: m.nama,
      idLine: m.idLine === "-" ? "" : m.idLine,
      domisili: m.domisili === "-" ? "" : m.domisili,
      displayName: m.displayName === "-" ? "" : m.displayName,
      status: m.status,
      role: m.role,
    });
  };

  // Submit Add or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.noAnggota.trim() || !formData.nama.trim()) {
      setFormError("Nomor Anggota dan Nama Anggota wajib diisi!");
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingMember) {
        // UPDATE
        const res = await fetch("/api/anggota", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMember.id,
            ...formData,
            idLine: formData.idLine || "-",
            domisili: formData.domisili || "-",
            displayName: formData.displayName || formData.noAnggota,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setEditingMember(null);
          await fetchMembers();
        } else {
          setFormError(json.error || "Gagal memperbarui data.");
        }
      } else {
        // ADD
        const res = await fetch("/api/anggota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            idLine: formData.idLine || "-",
            domisili: formData.domisili || "-",
            displayName: formData.displayName || formData.noAnggota,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsAddModalOpen(false);
          await fetchMembers();
        } else {
          setFormError(json.error || "Gagal menambahkan anggota.");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan server");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Member
  const handleDeleteConfirm = async () => {
    if (!deletingMember) return;
    try {
      setFormSubmitting(true);
      const res = await fetch(`/api/anggota?id=${deletingMember.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setDeletingMember(null);
        await fetchMembers();
      } else {
        alert(json.error || "Gagal menghapus anggota");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Download Excel
  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (selectedBatch !== "all") params.set("batch", selectedBatch);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    window.open(`/api/admin/anggota/export?${params.toString()}`, "_blank");
  };

  // Download SQL
  const handleExportSql = () => {
    window.open("/api/admin/anggota/export-sql", "_blank");
  };

  const sqlCreateTableText = `-- Query SQL Tabel Anggota Hostinger
CREATE TABLE IF NOT EXISTS \`anggota_cava\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`batch\` VARCHAR(50) NOT NULL,
  \`batch_number\` INT NOT NULL DEFAULT 1,
  \`no_anggota\` VARCHAR(50) NOT NULL UNIQUE,
  \`nama\` VARCHAR(191) NOT NULL,
  \`id_line\` VARCHAR(191) DEFAULT '-',
  \`domisili\` VARCHAR(191) DEFAULT '-',
  \`display_name\` VARCHAR(191) DEFAULT '-',
  \`status\` ENUM('Aktif', 'Keluar') NOT NULL DEFAULT 'Aktif',
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'Anggota',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_batch\` (\`batch_number\`),
  INDEX \`idx_no_anggota\` (\`no_anggota\`),
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCreateTableText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Navigation Bar */}
      <AdminSubNav
        activeKey="anggota"
        title="Data Anggota Cavallery"
        subtitle="Tabel Data Anggota Aktif & Direktori Batch 1 - 9"
      />

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Anggota
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.total || members.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Batch 1 sampai Batch 9</div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Anggota Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats.aktif}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Status keanggotaan aktif</div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Anggota Keluar
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
            {stats.keluar}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Alumni / Non-aktif</div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Admin & Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
            {stats.admin}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pengurus Fanbase</div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 shadow-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor anggota (CAVA-0001 / 0001), nama, ID Line, domisili..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.csv)</span>
            </button>

            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all active:scale-95"
            >
              <Database className="w-4 h-4" />
              <span>Script SQL Realtime</span>
            </button>

            <button
              onClick={fetchMembers}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-medium transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Anggota</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          {/* Batch Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {batchList.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBatch(b.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedBatch === b.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Status & Role Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif Saja</option>
              <option value="Keluar">Keluar Saja</option>
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">Semua Status Anggota</option>
              <option value="Admin">Admin</option>
              <option value="Anggota">Anggota</option>
            </select>
          </div>
        </div>
      </div>

      {/* Public Page Quick Link Alert */}
      <div className="mb-4 bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-purple-300">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            Halaman pencari nomor anggota publik untuk LINE:{" "}
            <a
              href="/nomor-anggota"
              target="_blank"
              rel="noreferrer"
              className="underline font-semibold text-purple-200 hover:text-white inline-flex items-center gap-0.5 ml-1"
            >
              /nomor-anggota <ExternalLink className="w-3 h-3" />
            </a>
          </span>
        </div>
        <span className="text-slate-400 hidden sm:inline">
          Menampilkan {filteredMembers.length} dari {members.length}
        </span>
      </div>

      {/* Main Table: STRICTLY Sesuai Permintaan (Batch, Nomor Anggota, Nama Anggota, ID Line, Domisili, Display Name, Status, Status Anggota, Aksi) */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Batch</th>
                <th className="px-4 py-3.5 font-semibold">Nomor Anggota</th>
                <th className="px-4 py-3.5 font-semibold">Nama Anggota</th>
                <th className="px-4 py-3.5 font-semibold">ID Line</th>
                <th className="px-4 py-3.5 font-semibold">Domisili</th>
                <th className="px-4 py-3.5 font-semibold">Display Name</th>
                <th className="px-4 py-3.5 font-semibold text-center">Status</th>
                <th className="px-4 py-3.5 font-semibold text-center">Status Anggota</th>
                <th className="px-4 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Memuat seluruh data anggota Cavallery...</div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <div>Tidak ada anggota yang cocok dengan filter.</div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isAktif = m.status === "Aktif";
                  const isAdmin = m.role === "Admin";

                  return (
                    <tr
                      key={m.id || m.noAnggota}
                      className="hover:bg-purple-950/20 transition-colors"
                    >
                      {/* Batch */}
                      <td className="px-4 py-3.5 font-medium text-slate-300">
                        <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold text-[11px]">
                          {m.batch}
                        </span>
                      </td>

                      {/* Nomor Anggota (Format 4 digit: CAVA-0001) */}
                      <td className="px-4 py-3.5 font-mono font-bold text-white text-sm">
                        {m.noAnggota}
                      </td>

                      {/* Nama Anggota */}
                      <td className="px-4 py-3.5 font-semibold text-slate-100">
                        {m.nama}
                      </td>

                      {/* ID Line */}
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                        {m.idLine}
                      </td>

                      {/* Domisili */}
                      <td className="px-4 py-3.5 text-slate-300">
                        {m.domisili}
                      </td>

                      {/* Display Name */}
                      <td className="px-4 py-3.5 text-slate-300 text-[11px]">
                        {m.displayName}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        {isAktif ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Keluar
                          </span>
                        )}
                      </td>

                      {/* Status Anggota (Role) */}
                      <td className="px-4 py-3.5 text-center">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Admin
                          </span>
                        ) : m.role === "Keluar" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">
                            Keluar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-white/5">
                            Anggota
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-all"
                            title="Edit Anggota"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingMember(m)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all"
                            title="Hapus Anggota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT MEMBER (Tanpa input kas) */}
      {(isAddModalOpen || editingMember) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingMember(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              {editingMember ? "Edit Data Anggota" : "Tambah Anggota Baru"}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              {editingMember
                ? `Perbarui informasi untuk ${editingMember.noAnggota}`
                : "Masukkan data anggota baru untuk disimpan realtime ke database."}
            </p>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Batch</label>
                  <select
                    value={formData.batch}
                    onChange={(e) => {
                      const b = e.target.value;
                      const num = parseInt(b.replace(/[^\d]/g, ""), 10) || 1;
                      setFormData({ ...formData, batch: b, batchNumber: num });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={`Batch ${n}`}>
                        Batch {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nomor Anggota *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.noAnggota}
                    onChange={(e) => setFormData({ ...formData, noAnggota: e.target.value })}
                    placeholder="Contoh: CAVA-0583 (4 digit)"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Anggota *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap atau panggilan"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ID Line</label>
                  <input
                    type="text"
                    value={formData.idLine}
                    onChange={(e) => setFormData({ ...formData, idLine: e.target.value })}
                    placeholder="Username ID LINE"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Domisili</label>
                  <input
                    type="text"
                    value={formData.domisili}
                    onChange={(e) => setFormData({ ...formData, domisili: e.target.value })}
                    placeholder="Kota domisili (contoh: Denpasar)"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Display Name (LINE Name)
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Contoh: CAVA 583 Nama"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "Aktif" | "Keluar" })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status Anggota</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "Admin" | "Anggota" | "Keluar",
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Anggota">Anggota</option>
                    <option value="Admin">Admin</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMember ? "Simpan Perubahan" : "Tambah Anggota"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Hapus Data Anggota?</h3>
            <p className="text-xs text-slate-400 mb-5">
              Apakah Anda yakin ingin menghapus data{" "}
              <span className="font-semibold text-white">
                {deletingMember.noAnggota} - {deletingMember.nama}
              </span>
              ? Tindakan ini akan menghapus data secara permanen.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={formSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                {formSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SQL SCRIPT & SCHEMA */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSqlModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">SQL Schema Hostinger MySQL</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Jalankan query DDL tabel berikut di tab SQL phpMyAdmin Hostinger (Database:{" "}
              <code className="text-indigo-300">u410588002_Cavallery</code>).
            </p>

            <div className="relative mb-4">
              <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-slate-300 border border-white/10 overflow-x-auto max-h-56 leading-relaxed">
                {sqlCreateTableText}
              </pre>
              <button
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-white/10"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin DDL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
              <span className="text-slate-400 text-[11px]">
                File SQL mencakup CREATE TABLE + INSERT 394 anggota.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportSql}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File .SQL Lengkap</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
