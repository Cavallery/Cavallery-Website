"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "../keanggotaan/page.module.css";
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

export default function AdminKasPage() {
  // ── STATE: Konfirmasi Kas ──
  const [kasList, setKasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [editKas, setEditKas] = useState<any | null>(null);

  // ── STATE: Matriks Tab (DEFAULT UTAMA = "matriks") ──
  const [activeTab, setActiveTab] = useState<"matriks" | "konfirmasi">("matriks");
  const [matrixYear, setMatrixYear] = useState(new Date().getFullYear());
  const [matrixData, setMatrixData] = useState<any | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixToggling, setMatrixToggling] = useState<string | null>(null);
  const [reSyncing, setReSyncing] = useState(false);
  const [exportingToSheets, setExportingToSheets] = useState(false);
  const [matrixSearch, setMatrixSearch] = useState("");

  // ── STATE: Modal Input Kas Manual ──
  const [showInputModal, setShowInputModal] = useState(false);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [manualNoAnggota, setManualNoAnggota] = useState("");
  const [manualTahun, setManualTahun] = useState(new Date().getFullYear());
  const [manualBulan, setManualBulan] = useState(new Date().getMonth() + 1);
  const [manualNominal, setManualNominal] = useState("15.000");
  const [submittingManual, setSubmittingManual] = useState(false);

  // ── Fetch Konfirmasi Kas ──
  const fetchKas = async () => {
    try {
      const res = await fetch("/api/admin/kas");
      if (res.status === 401) { window.location.href = "/admin"; return; }
      const json = await res.json();
      if (json.status && json.data) setKasList(json.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Fetch Matriks Iuran ──
  const fetchMatrix = useCallback(async (year: number) => {
    setMatrixLoading(true);
    try {
      const res = await fetch(`/api/admin/kas/matrix?tahun=${year}`);
      const json = await res.json();
      if (json.status && json.data) setMatrixData(json.data);
    } catch (e) { console.error(e); }
    finally { setMatrixLoading(false); }
  }, []);

  // ── Fetch Anggota untuk dropdown manual ──
  const fetchAnggota = async () => {
    try {
      const res = await fetch("/api/admin/keanggotaan");
      const json = await res.json();
      if (json.status && json.data) setAnggotaList(json.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchKas();
    fetchMatrix(matrixYear);
    fetchAnggota();
  }, [fetchMatrix, matrixYear]);

  // ── Handlers: Konfirmasi ──
  const handleAction = async (id: number, action: string, extra: any = {}) => {
    setActionLoading(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/kas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, ...extra }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchKas();
        fetchMatrix(matrixYear);
      } else {
        alert(json.message || "Gagal memproses aksi");
      }
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
    finally { setActionLoading(null); }
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
      if (json.status) { setMsg(json.message); setEditKas(null); fetchKas(); fetchMatrix(matrixYear); }
      else alert(json.message || "Gagal memperbarui kas");
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
  };

  const handleDeleteKas = async (id: number) => {
    if (!confirm(`Hapus data pembayaran kas #${id} dari sistem & spreadsheet?`)) return;
    try {
      const res = await fetch(`/api/admin/kas?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status) { setMsg(json.message); fetchKas(); fetchMatrix(matrixYear); }
      else alert(json.message || "Gagal menghapus kas");
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
  };

  // ── Handler: Toggle Bulan di Matriks ──
  const handleToggleMonth = async (noAnggota: string, bulan: number, isPaid: boolean) => {
    const key = `${noAnggota}:${bulan}`;
    setMatrixToggling(key);
    try {
      const res = await fetch("/api/admin/kas/matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noAnggota, tahun: matrixYear, bulan, isPaid: !isPaid, nominal: 15000 }),
      });
      const json = await res.json();
      if (json.status) { fetchMatrix(matrixYear); }
      else alert(json.message || "Gagal mengubah status");
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
    finally { setMatrixToggling(null); }
  };

  // ── Handler: Re-sync semua data ke matriks ──
  const handleReSync = async () => {
    if (!confirm("Sinkronkan ulang semua data kas yang sudah diverifikasi ke matriks bulanan?")) return;
    setReSyncing(true);
    try {
      const res = await fetch("/api/admin/kas/matrix", { method: "PUT" });
      const json = await res.json();
      if (json.status) { setMsg(json.message); fetchMatrix(matrixYear); }
      else alert(json.message || "Gagal sinkronisasi");
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
    finally { setReSyncing(false); }
  };

  // ── Handler: Ekspor / Buat Tab Matriks ke Google Sheets ──
  const handleExportToSheets = async () => {
    if (!confirm("Kirim dan buat seluruh Tab Matriks Kas 2024 s/d 2029 ke Google Spreadsheet sekarang?")) return;
    setExportingToSheets(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/spreadsheet", { method: "POST" });
      const json = await res.json();
      if (json.status) {
        setMsg("🎉 Berhasil! Seluruh Tab Kas 2024 s/d 2029 dengan checkbox & subtotal telah dibuat dan disinkronkan ke Google Spreadsheet Anda.");
      } else {
        alert(json.message || "Gagal ekspor ke spreadsheet");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menghubungkan ke Spreadsheet");
    } finally {
      setExportingToSheets(false);
    }
  };

  // ── Handler: Submit Input Kas Manual ──
  const handleManualKasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNoAnggota) {
      alert("Pilih nomor anggota terlebih dahulu");
      return;
    }
    const cleanNominal = Number(manualNominal.replace(/\D/g, "")) || 15000;
    setSubmittingManual(true);
    try {
      const res = await fetch("/api/admin/kas/matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noAnggota: manualNoAnggota,
          tahun: Number(manualTahun),
          bulan: Number(manualBulan),
          isPaid: true,
          nominal: cleanNominal,
        }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(`✅ Pembayaran kas ${manualNoAnggota} untuk ${MONTH_NAMES_FULL[manualBulan - 1]} ${manualTahun} berhasil dicentang & dikirim ke Spreadsheet!`);
        setShowInputModal(false);
        fetchMatrix(matrixYear);
      } else {
        alert(json.message || "Gagal menyimpan kas");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSubmittingManual(false);
    }
  };

  const pendingKas = kasList.filter((k) => k.status === "pending");
  const processedKas = kasList.filter((k) => k.status !== "pending");
  const totalNominalKasDiverifikasi = kasList.filter((k) => k.status === "diverifikasi").reduce((a, c) => a + (Number(c.nominal) || 0), 0);
  const totalNominalKasPending = kasList.filter((k) => k.status === "pending").reduce((a, c) => a + (Number(c.nominal) || 0), 0);
  const totalNominalKasSemua = kasList.reduce((a, c) => a + (Number(c.nominal) || 0), 0);

  // Filter matrix rows by search query
  const filteredMatrixRows = (matrixData?.matrixRows || []).filter((r: any) => {
    if (!matrixSearch) return true;
    const q = matrixSearch.toLowerCase();
    return (
      (r.noAnggota || "").toLowerCase().includes(q) ||
      (r.nama || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── TOP HEADER ── */}
        <div className={styles.topHeader}>
          <div>
            <Link href="/admin" className={styles.backBtn}>
              <i className="bx bx-arrow-back" /> Dashboard Utama
            </Link>
            <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
              Matriks &amp; Manajemen Uang Kas Cavallery
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/kontributor" className={styles.backBtn}>
              <i className="bx bx-heart-circle" /> Kontributor
            </Link>
            <Link href="/admin/donasi" className={styles.backBtn}>
              <i className="bx bx-donate-heart" /> Verifikasi Donasi
            </Link>
            <Link href="/admin/master-data" className={styles.backBtn} style={{ color: "#8b5cf6", borderColor: "rgba(139,92,246,0.4)" }}>
              <i className="bx bx-slider-alt" /> Master Data
            </Link>
            <a
              href="https://docs.google.com/spreadsheets/d/1t9PlUNLN2rdskLq-ZpellJI0umclokLm7G-DI-VnFXg/edit?gid=1846326647#gid=1846326647"
              target="_blank" rel="noopener noreferrer"
              className={styles.backBtn}
              style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.4)" }}
            >
              <i className="bx bx-table" /> Live Spreadsheet
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* ── TOMBOL AKSI CEPAT SINKRONISASI & EXPORT KE SPREADSHEET ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(201, 168, 76, 0.12) 0%, rgba(17, 85, 204, 0.1) 100%)",
          border: "1.5px solid var(--border-gold, #c9a84c)",
          borderRadius: 16,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--primary)" }}>
              <i className="bx bx-spreadsheet" style={{ marginRight: 6, fontSize: "1.2rem", color: "var(--gold)" }} />
              Sinkronisasi Matriks Kas ke Google Spreadsheet
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 2 }}>
              Ekspor seluruh data centang bulanan ke tab <strong>Kas 2024 s/d Kas 2029</strong> di Google Spreadsheet.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setShowInputModal(true)}
              className={styles.btnCreate}
              style={{ background: "#10b981", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="bx bx-plus-circle" /> + Input Kas Anggota
            </button>

            <button
              type="button"
              onClick={handleExportToSheets}
              disabled={exportingToSheets}
              className={styles.btnCreate}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className={`bx ${exportingToSheets ? "bx-loader-alt bx-spin" : "bx-cloud-upload"}`} />
              {exportingToSheets ? "Membuat Tab di Google Sheets..." : "Kirim Tab Matriks ke Spreadsheet"}
            </button>
          </div>
        </div>

        {/* ── NOTIFIKASI PESAN ── */}
        {msg && (
          <div style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bx bx-check-circle" /> {msg}
          </div>
        )}

        {/* ── TAB SWITCHER (MATRIKS TABEL SEBAGAI PILIHAN UTAMA) ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid var(--border)", paddingBottom: 0 }}>
          {[
            { key: "matriks", label: "Matriks Iuran Kas (Tabel Centang Tahunan)", icon: "bx-grid-alt" },
            { key: "konfirmasi", label: `Antrean Verifikasi Pembayaran (${pendingKas.length})`, icon: "bx-receipt" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderBottom: activeTab === tab.key ? "3px solid var(--gold)" : "3px solid transparent",
                background: "transparent",
                color: activeTab === tab.key ? "var(--primary)" : "var(--fg-muted)",
                fontWeight: activeTab === tab.key ? 800 : 600,
                fontSize: "0.92rem",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
                marginBottom: -2,
              }}
            >
              <i className={`bx ${tab.icon}`} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* TAB UTAMA: MATRIKS IURAN BULANAN             */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "matriks" && (
          <div className={styles.sectionCard} style={{ padding: 20 }}>
            {/* Header Box (Iuran Kas & Total Pemasukan) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginBottom: 20,
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
            }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                  Judul Rekap Iuran
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>
                  Iuran Kas {matrixYear}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--fg-muted)", marginTop: 2 }}>
                  {matrixData?.totalAnggota || 0} Total Anggota Aktif Terdata
                </div>
              </div>

              <div style={{ background: "rgba(252, 229, 205, 0.2)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>
                  Total Pemasukan Kas {matrixYear}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#10b981", marginTop: 2 }}>
                  {formatRupiah(matrixData?.grandTotalPemasukan || 0)}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>
                  Akumulasi kas yang tercentang lunas
                </div>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                  Total Pengeluaran Kas {matrixYear}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--fg-muted)", marginTop: 2 }}>
                  -
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>
                  Pengeluaran operasional fanbase
                </div>
              </div>
            </div>

            {/* Toolbar: Pemilih Tahun & Pencarian */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              {/* Year Tabs */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>Tahun:</span>
                <div style={{ display: "flex", gap: 4, background: "var(--card-bg)", borderRadius: 10, padding: 4, border: "1px solid var(--border)" }}>
                  {SUPPORTED_YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setMatrixYear(y)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: matrixYear === y ? "var(--gold)" : "transparent",
                        color: matrixYear === y ? "#1a1612" : "var(--fg-muted)",
                        fontWeight: matrixYear === y ? 900 : 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {/* Search Bar */}
                <div style={{ position: "relative" }}>
                  <i className="bx bx-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }} />
                  <input
                    type="text"
                    placeholder="Cari anggota / CAVA-xxxx..."
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                    style={{
                      padding: "7px 12px 7px 32px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--card-bg)",
                      color: "var(--fg)",
                      fontSize: "0.82rem",
                      outline: "none",
                      width: 200,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleReSync}
                  disabled={reSyncing}
                  className={styles.backBtn}
                  style={{ color: "#6366f1", borderColor: "rgba(99,102,241,0.4)" }}
                  title="Hitung ulang semua pembayaran kas yang sudah diverifikasi ke dalam matriks"
                >
                  <i className={`bx ${reSyncing ? "bx-loader-alt bx-spin" : "bx-refresh"}`} />
                  {reSyncing ? "Menghitung..." : "Sinkronkan Ulang Matriks"}
                </button>
              </div>
            </div>

            {/* Subtotal Per-Bulan */}
            {matrixData && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: 6,
                marginBottom: 16,
                overflowX: "auto",
                paddingBottom: 4,
              }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const count = matrixData.monthlyPaidCounts?.[m] || 0;
                  const total = matrixData.totalAnggota || 1;
                  const pct = Math.round((count / total) * 100);
                  const sumNominal = matrixData.monthlyTotals?.[m] || 0;

                  return (
                    <div
                      key={m}
                      style={{
                        textAlign: "center",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 4px",
                        minWidth: 60,
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--fg-muted)" }}>
                        {MONTH_NAMES[m - 1]}
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>
                        {formatRupiah(sumNominal).replace("Rp ", "")}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: pct === 100 ? "#10b981" : pct > 50 ? "#f59e0b" : "var(--fg-muted)" }}>
                        {count} Lunas ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABEL MATRIKS CENTANG TAHUNAN */}
            {matrixLoading ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-loader-alt bx-spin" />
                <p>Memuat tabel matriks kas...</p>
              </div>
            ) : !matrixData || filteredMatrixRows.length === 0 ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-data" />
                <p>Tidak ada data anggota yang cocok untuk tahun {matrixYear}.</p>
              </div>
            ) : (
              <div className={styles.tableWrap} style={{ maxHeight: "70vh", overflow: "auto" }}>
                <table className={styles.matrixTable} style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    {/* Header Baris 4 */}
                    <tr>
                      <th style={{ width: 36, background: "#1155cc", color: "#fff", position: "sticky", left: 0, zIndex: 11 }}>No.</th>
                      <th style={{ minWidth: 100, textAlign: "left", background: "#1155cc", color: "#fff", position: "sticky", left: 36, zIndex: 11 }}>Nomor Anggota</th>
                      <th style={{ minWidth: 160, textAlign: "left", background: "#1155cc", color: "#fff", position: "sticky", left: 136, zIndex: 11 }}>Nama</th>
                      <th style={{ minWidth: 100, background: "#1155cc", color: "#fff" }}>Kas</th>
                      <th style={{ width: 60, background: "#1155cc", color: "#fff" }}>Bulan Mulai</th>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <th key={m} style={{ minWidth: 46, background: "#1155cc", color: "#fff" }}>
                          <div>{m}</div>
                          <div style={{ fontSize: "0.65rem", fontWeight: 400, opacity: 0.9 }}>
                            {formatRupiah(matrixData.monthlyTotals?.[m] || 0).replace("Rp ", "")}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatrixRows.map((row: any, idx: number) => (
                      <tr key={row.noAnggota}>
                        {/* No */}
                        <td style={{ textAlign: "center", fontWeight: 700, background: "var(--card-bg)", position: "sticky", left: 0, zIndex: 5 }}>
                          {idx + 1}
                        </td>

                        {/* Nomor Anggota */}
                        <td style={{ textAlign: "left", background: "var(--card-bg)", position: "sticky", left: 36, zIndex: 5 }}>
                          <span className={styles.noAnggota} style={{ fontSize: "0.78rem" }}>{row.noAnggota}</span>
                        </td>

                        {/* Nama */}
                        <td style={{ textAlign: "left", background: "var(--card-bg)", position: "sticky", left: 136, zIndex: 5 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{row.nama}</div>
                          {row.isAdminRole && (
                            <div style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 600 }}>{row.jabatan}</div>
                          )}
                        </td>

                        {/* Kas Total */}
                        <td style={{ fontWeight: 800, fontSize: "0.85rem", color: row.totalKas > 0 ? "#10b981" : "var(--fg-muted)" }}>
                          {row.totalKas > 0 ? formatRupiah(row.totalKas) : "Rp -"}
                        </td>

                        {/* Bulan Mulai */}
                        <td style={{ color: "var(--fg-muted)", fontWeight: 700 }}>
                          {row.bulanMulai}
                        </td>

                        {/* 12 Bulan Checkboxes */}
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                          const isPaid = row.months?.[m] === true;
                          const key = `${row.noAnggota}:${m}`;
                          const isToggling = matrixToggling === key;

                          return (
                            <td
                              key={m}
                              className={isPaid ? styles.matrixCellPaid : styles.matrixCellUnpaid}
                              title={`${row.nama} (${MONTH_NAMES_FULL[m - 1]} ${matrixYear}): ${isPaid ? "LUNAS" : "Belum Bayar"}. Klik untuk ubah.`}
                              onClick={() => !isToggling && handleToggleMonth(row.noAnggota, m, isPaid)}
                              style={{
                                cursor: "pointer",
                                textAlign: "center",
                                verticalAlign: "middle",
                                transition: "all 0.15s",
                              }}
                            >
                              {isToggling ? (
                                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "0.8rem", color: "var(--primary)" }} />
                              ) : isPaid ? (
                                <span style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 22,
                                  height: 22,
                                  borderRadius: 4,
                                  background: "#1155cc",
                                  color: "#fff",
                                  fontSize: "0.85rem",
                                }}>
                                  <i className="bx bx-check" />
                                </span>
                              ) : (
                                <span style={{
                                  display: "inline-block",
                                  width: 18,
                                  height: 18,
                                  borderRadius: 3,
                                  border: "1.5px solid rgba(156, 163, 175, 0.4)",
                                  background: "transparent",
                                }} />
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

            <div style={{ marginTop: 14, fontSize: "0.8rem", color: "var(--fg-muted)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <i className="bx bx-info-circle" style={{ color: "var(--gold)" }} />
                <span>Klik langsung pada kotak centang bulan untuk mengubah status lunas / belum bayar. Data tersimpan ke database &amp; otomatis terkirim ke Google Sheets.</span>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 16, height: 16, background: "#1155cc", borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem" }}><i className="bx bx-check" /></span> Lunas
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 14, height: 14, border: "1.5px solid rgba(156,163,175,0.4)", borderRadius: 3, display: "inline-block" }} /> Belum Bayar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB 2: ANTREAN VERIFIKASI PEMBAYARAN        */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "konfirmasi" && (
          <>
            {/* Antrean Pending */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-time-five" style={{ color: "var(--gold)" }} />
                  Antrean Pembayaran Kas Masuk
                  <span className={styles.countBadge}>{pendingKas.length} Pending</span>
                </h2>
              </div>
              {loading ? (
                <div className={styles.emptyBox}><i className="bx bx-loader-alt bx-spin" /><p>Memuat data...</p></div>
              ) : pendingKas.length === 0 ? (
                <div className={styles.emptyBox}><i className="bx bx-check-double" style={{ color: "#10b981" }} /><p>Tidak ada pembayaran yang menunggu verifikasi.</p></div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th><th>No. Anggota</th><th>Nama Anggota</th><th>Periode</th><th>Nominal</th><th>Tanggal Kirim</th><th>Bukti Transfer</th><th>Status</th><th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingKas.map((k) => {
                        const noAnggota = k.noAnggota || k.no_anggota || k.anggota?.noAnggota || "-";
                        const namaLengkap = k.namaLengkap || k.nama_lengkap || k.anggota?.namaLengkap || "Member Cavallery";
                        return (
                          <tr key={k.id}>
                            <td>#{k.id}</td>
                            <td><span className={styles.noAnggota}>{noAnggota}</span></td>
                            <td className={styles.nameCol}>{namaLengkap}</td>
                            <td>{k.periode}</td>
                            <td style={{ fontWeight: 800, color: "var(--primary)" }}>{formatRupiah(k.nominal)}</td>
                            <td>{new Date(k.createdAt || k.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                            <td>
                              {(k.buktiBayarUrl || k.bukti_bayar_url) ? (
                                <button type="button" className={styles.backBtn} style={{ fontSize: "0.75rem", padding: "4px 10px", color: "var(--gold)" }} onClick={() => setSelectedProof(k.buktiBayarUrl || k.bukti_bayar_url)}>
                                  <i className="bx bx-image-alt" /> Lihat Bukti
                                </button>
                              ) : "-"}
                            </td>
                            <td>
                              <select
                                value={k.status} disabled={actionLoading === k.id}
                                onChange={(e) => handleAction(k.id, "update_status", { status: e.target.value })}
                                className={k.status === "diverifikasi" ? styles.selectStatusAktif : k.status === "pending" ? styles.selectStatusPending : styles.selectStatusNonaktif}
                              >
                                <option value="pending">Pending</option>
                                <option value="diverifikasi">Diverifikasi</option>
                                <option value="ditolak">Ditolak</option>
                              </select>
                            </td>
                            <td>
                              <div className={styles.actionsCell}>
                                <button className={styles.btnAccept} disabled={actionLoading === k.id} onClick={() => handleAction(k.id, "verifikasi")} title="Verifikasi &amp; Centang Matriks"><i className="bx bx-check" /></button>
                                <button className={styles.btnReject} disabled={actionLoading === k.id} onClick={() => handleAction(k.id, "tolak")} title="Tolak"><i className="bx bx-x" /></button>
                                <button type="button" className={styles.btnDelete} onClick={() => handleDeleteKas(k.id)} title="Hapus"><i className="bx bx-trash" /></button>
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

            {/* Riwayat Terproses */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-history" style={{ color: "var(--gold)" }} />
                  Riwayat Pembayaran Kas
                  <span className={`${styles.countBadge} ${styles.countBadgeGreen}`}>{processedKas.length} Terproses</span>
                </h2>
              </div>
              {loading ? (
                <div className={styles.emptyBox}><i className="bx bx-loader-alt bx-spin" /><p>Memuat riwayat...</p></div>
              ) : processedKas.length === 0 ? (
                <div className={styles.emptyBox}><i className="bx bx-inbox" /><p>Belum ada riwayat pembayaran kas.</p></div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th><th>No. Anggota</th><th>Nama Anggota</th><th>Periode</th><th>Nominal</th><th>Status</th><th>Verifikator</th><th>Bukti</th><th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedKas.map((k) => {
                        const noAnggota = k.noAnggota || k.no_anggota || k.anggota?.noAnggota || "-";
                        const namaLengkap = k.namaLengkap || k.nama_lengkap || k.anggota?.namaLengkap || "Member Cavallery";
                        return (
                          <tr key={k.id}>
                            <td>#{k.id}</td>
                            <td><span className={styles.noAnggota}>{noAnggota}</span></td>
                            <td className={styles.nameCol}>{namaLengkap}</td>
                            <td>{k.periode}</td>
                            <td style={{ fontWeight: 800 }}>{formatRupiah(k.nominal)}</td>
                            <td>
                              <select
                                value={k.status} disabled={actionLoading === k.id}
                                onChange={(e) => handleAction(k.id, "update_status", { status: e.target.value })}
                                className={k.status === "diverifikasi" ? styles.selectStatusAktif : k.status === "pending" ? styles.selectStatusPending : styles.selectStatusNonaktif}
                              >
                                <option value="pending">Pending</option>
                                <option value="diverifikasi">Diverifikasi</option>
                                <option value="ditolak">Ditolak</option>
                              </select>
                            </td>
                            <td>{k.verifiedBy || k.verified_by || "-"}</td>
                            <td>
                              {(k.buktiBayarUrl || k.bukti_bayar_url) && (
                                <button type="button" className={styles.backBtn} style={{ fontSize: "0.75rem", padding: "4px 8px" }} onClick={() => setSelectedProof(k.buktiBayarUrl || k.bukti_bayar_url)}>
                                  <i className="bx bx-image" />
                                </button>
                              )}
                            </td>
                            <td>
                              <div className={styles.actionsCell}>
                                <button type="button" className={styles.btnEdit} onClick={() => setEditKas({ id: k.id, periode: k.periode, nominal: k.nominal, status: k.status })}>
                                  <i className="bx bx-edit" />
                                </button>
                                <button type="button" className={styles.btnDelete} onClick={() => handleDeleteKas(k.id)} title="Hapus">
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
          </>
        )}
      </div>

      {/* ── MODAL INPUT KAS ANGGOTA MANUAL ── */}
      {showInputModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInputModal(false)}>
          <div className={styles.modalCard} style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-plus-circle" /> Input Pembayaran Kas Anggota
              </h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowInputModal(false)}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleManualKasSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Pilih Anggota</label>
                <select
                  className={styles.modalSelect}
                  value={manualNoAnggota}
                  onChange={(e) => setManualNoAnggota(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Anggota --</option>
                  {anggotaList.map((a) => (
                    <option key={a.id} value={a.no_anggota || a.noAnggota}>
                      {a.no_anggota || a.noAnggota || "Tanpa No"} - {a.nama_lengkap || a.namaLengkap}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Tahun</label>
                  <select
                    className={styles.modalSelect}
                    value={manualTahun}
                    onChange={(e) => setManualTahun(Number(e.target.value))}
                  >
                    {SUPPORTED_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Bulan</label>
                  <select
                    className={styles.modalSelect}
                    value={manualBulan}
                    onChange={(e) => setManualBulan(Number(e.target.value))}
                  >
                    {MONTH_NAMES_FULL.map((m, idx) => (
                      <option key={idx} value={idx + 1}>{idx + 1} - {m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nominal Kas (Rp)</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={manualNominal}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setManualNominal(digits ? Number(digits).toLocaleString("id-ID") : "");
                  }}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.backBtn} onClick={() => setShowInputModal(false)}>
                  Batal
                </button>
                <button type="submit" className={styles.btnCreate} disabled={submittingManual}>
                  <i className={`bx ${submittingManual ? "bx-loader-alt bx-spin" : "bx-check"}`} />
                  {submittingManual ? "Menyimpan..." : "Simpan & Centang Matriks"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PROOF IMAGE VIEWER ── */}
      {selectedProof && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProof(null)}>
          <div className={styles.modalCard} style={{ maxWidth: 520, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}><i className="bx bx-receipt" /> Bukti Pembayaran Kas</h3>
              <button type="button" className={styles.modalClose} onClick={() => setSelectedProof(null)}><i className="bx bx-x" /></button>
            </div>
            <div style={{ marginTop: 16 }}>
              <img src={selectedProof} alt="Bukti Transfer" style={{ width: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 12, border: "1px solid var(--border)" }} />
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              <a href={selectedProof} target="_blank" rel="noopener noreferrer" className={styles.backBtn}>
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
              <h3 className={styles.modalTitle}><i className="bx bx-edit" /> Edit Data Pembayaran Kas #{editKas.id}</h3>
              <button type="button" className={styles.modalClose} onClick={() => setEditKas(null)}><i className="bx bx-x" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Periode Kas</label>
                <input type="text" className={styles.modalInput} value={editKas.periode || ""} onChange={(e) => setEditKas({ ...editKas, periode: e.target.value })} required />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nominal (Rp)</label>
                <input type="number" className={styles.modalInput} value={editKas.nominal || ""} onChange={(e) => setEditKas({ ...editKas, nominal: e.target.value })} required />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Status Verifikasi</label>
                <select className={styles.modalSelect} value={editKas.status || "diverifikasi"} onChange={(e) => setEditKas({ ...editKas, status: e.target.value })}>
                  <option value="diverifikasi">Diverifikasi (Valid)</option>
                  <option value="pending">Pending (Menunggu)</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.backBtn} onClick={() => setEditKas(null)}>Batal</button>
                <button type="submit" className={styles.btnCreate}><i className="bx bx-check" /> Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
