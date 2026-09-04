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

  // ── STATE: Tab Utama ──
  const [activeTab, setActiveTab] = useState<"matriks" | "tagihan" | "pengeluaran" | "kupon" | "konfirmasi" | "war">("matriks");
  const [matrixYear, setMatrixYear] = useState(new Date().getFullYear());
  const [matrixData, setMatrixData] = useState<any | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixToggling, setMatrixToggling] = useState<string | null>(null);
  const [reSyncing, setReSyncing] = useState(false);
  const [exportingToSheets, setExportingToSheets] = useState(false);
  const [matrixSearch, setMatrixSearch] = useState("");

  // ── STATE: Tagihan & Kewajiban Kas ──
  const [tagihanList, setTagihanList] = useState<any[]>([]);
  const [loadingTagihan, setLoadingTagihan] = useState(false);
  const [tagihanSearch, setTagihanSearch] = useState("");

  // ── STATE: Pengeluaran Kas ──
  const [pengeluaranList, setPengeluaranList] = useState<any[]>([]);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [loadingPengeluaran, setLoadingPengeluaran] = useState(false);
  const [showPengeluaranModal, setShowPengeluaranModal] = useState(false);
  const [submittingPengeluaran, setSubmittingPengeluaran] = useState(false);
  const [uploadingNota, setUploadingNota] = useState(false);
  const [newPengeluaran, setNewPengeluaran] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    kategori: "Operasional",
    keperluan: "",
    nominal: "",
    buktiNotaUrl: "",
    catatan: "",
  });

  // ── STATE: Kupon Kas Reward ──
  const [kuponList, setKuponList] = useState<any[]>([]);
  const [loadingKupon, setLoadingKupon] = useState(false);
  const [showKuponModal, setShowKuponModal] = useState(false);
  const [submittingKupon, setSubmittingKupon] = useState(false);
  const [newKupon, setNewKupon] = useState({
    kodeKupon: "",
    judul: "",
    deskripsi: "",
    tipeReward: "Diskon Merch",
    nilaiReward: "10%",
    minBulanKas: 1,
    tahunKas: new Date().getFullYear(),
    kadaluarsaPada: "",
  });
  const [selectedKuponDetail, setSelectedKuponDetail] = useState<any | null>(null);
  const [penerimaList, setPenerimaList] = useState<any[]>([]);
  const [loadingPenerima, setLoadingPenerima] = useState(false);

  // ── STATE: Modal Input Kas Manual ──
  const [showInputModal, setShowInputModal] = useState(false);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [manualNoAnggota, setManualNoAnggota] = useState("");
  const [manualTahun, setManualTahun] = useState(new Date().getFullYear());
  const [manualBulan, setManualBulan] = useState(new Date().getMonth() + 1);
  const [manualNominal, setManualNominal] = useState("15.000");
  const [submittingManual, setSubmittingManual] = useState(false);
  // ── STATE: War Tiket STS Erine ──
  const [adminWarEvent, setAdminWarEvent] = useState<any | null>(null);
  const [adminWarPeserta, setAdminWarPeserta] = useState<any[]>([]);
  const [loadingAdminWar, setLoadingAdminWar] = useState(false);
  const [showWarModal, setShowWarModal] = useState(false);
  const [savingWarEvent, setSavingWarEvent] = useState(false);
  const [warForm, setWarForm] = useState({
    id: 0,
    judul: "War Tiket Project STS Erine 20th",
    deskripsi: "Akses khusus project perayaan Seitansai Catherina Vallencia (Erine) ke-20 bersama Cavallery Team Passion.",
    kuotaTotal: 50,
    waktuBuka: "",
    waktuTutup: "",
    status: "buka",
    syaratKetentuan: "1. Wajib memiliki akun anggota Cavallery aktif.\n2. 1 Akun anggota hanya dapat mengklaim maksimal 1 tiket.\n3. Tiket tidak dapat dipindahtangankan tanpa konfirmasi admin.",
  });

  const fetchAdminWarData = async () => {
    setLoadingAdminWar(true);
    try {
      const res = await fetch("/api/admin/war-tiket");
      const json = await res.json();
      if (json.status && json.data) {
        setAdminWarEvent(json.data.event);
        setAdminWarPeserta(json.data.peserta || []);
        if (json.data.event) {
          const ev = json.data.event;
          const toLocalInput = (dStr: string) => {
            if (!dStr) return "";
            const iso = dStr.includes(" ") ? dStr.replace(" ", "T") : dStr;
            const d = new Date(iso);
            if (isNaN(d.getTime())) return "";
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          };
          setWarForm({
            id: ev.id,
            judul: ev.judul || "",
            deskripsi: ev.deskripsi || "",
            kuotaTotal: Number(ev.kuota_total) || 50,
            waktuBuka: toLocalInput(ev.waktu_buka),
            waktuTutup: toLocalInput(ev.waktu_tutup),
            status: ev.status || "buka",
            syaratKetentuan: ev.syarat_ketentuan || "",
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdminWar(false);
    }
  };

  const handleSaveWarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWarEvent(true);
    try {
      const payload: any = { ...warForm };
      if (payload.status === "buka") {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const pastLocal = `${fiveMinAgo.getFullYear()}-${pad(fiveMinAgo.getMonth() + 1)}-${pad(fiveMinAgo.getDate())}T${pad(fiveMinAgo.getHours())}:${pad(fiveMinAgo.getMinutes())}`;
        if (!payload.waktuBuka) {
          payload.waktuBuka = pastLocal;
        }
        if (!payload.waktuTutup) {
          const defaultClose = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          payload.waktuTutup = `${defaultClose.getFullYear()}-${pad(defaultClose.getMonth() + 1)}-${pad(defaultClose.getDate())}T${pad(defaultClose.getHours())}:${pad(defaultClose.getMinutes())}`;
        }
      }
      const res = await fetch("/api/admin/war-tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status) {
        setMsg("Pengaturan War Tiket STS Erine berhasil disimpan!");
        setShowWarModal(false);
        fetchAdminWarData();
        setTimeout(() => setMsg(""), 4000);
      } else {
        alert(json.message || "Gagal menyimpan pengaturan");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSavingWarEvent(false);
    }
  };

  const handleDeleteWarPeserta = async (pesertaId: number, nama: string) => {
    if (!confirm(`Yakin ingin membatalkan/mencabut tiket milik "${nama}"? Kuota tiket akan otomatis bertambah 1.`)) return;
    try {
      const res = await fetch(`/api/admin/war-tiket?pesertaId=${pesertaId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status) {
        setMsg(`Tiket milik "${nama}" berhasil dicabut.`);
        fetchAdminWarData();
        setTimeout(() => setMsg(""), 4000);
      } else {
        alert(json.message || "Gagal mencabut tiket");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  const handleToggleWarStatus = async (newStatus: "buka" | "tutup") => {
    if (!adminWarEvent) return;
    try {
      const payload: any = {
        ...warForm,
        id: adminWarEvent.id,
        status: newStatus,
      };

      if (newStatus === "buka") {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const pastLocal = `${fiveMinAgo.getFullYear()}-${pad(fiveMinAgo.getMonth() + 1)}-${pad(fiveMinAgo.getDate())}T${pad(fiveMinAgo.getHours())}:${pad(fiveMinAgo.getMinutes())}`;

        // Buka sekarang juga (5 menit lalu agar langsung aktif di semua browser tanpa delay)
        payload.waktuBuka = pastLocal;

        // Jika waktu tutup sudah lewat, perpanjang default 30 hari
        const closeD = warForm.waktuTutup ? new Date(warForm.waktuTutup.replace(" ", "T")) : null;
        if (!closeD || isNaN(closeD.getTime()) || closeD.getTime() <= now.getTime()) {
          const defaultClose = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          payload.waktuTutup = `${defaultClose.getFullYear()}-${pad(defaultClose.getMonth() + 1)}-${pad(defaultClose.getDate())}T${pad(defaultClose.getHours())}:${pad(defaultClose.getMinutes())}`;
        }
      }

      const res = await fetch("/api/admin/war-tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(`Status war tiket berhasil diubah menjadi "${newStatus.toUpperCase()}"!`);
        fetchAdminWarData();
        setTimeout(() => setMsg(""), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    }
  };

  // ── Fetch Konfirmasi Kas ──
  const fetchKas = async () => {
    try {
      const res = await fetch("/api/admin/kas");
      if (res.status === 401) { window.location.replace("/admin"); return; }
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
      if (res.status === 401) { window.location.replace("/admin"); return; }
      const json = await res.json();
      if (json.status && json.data) setMatrixData(json.data);
    } catch (e) { console.error(e); }
    finally { setMatrixLoading(false); }
  }, []);

  // ── Fetch Tagihan Kas ──
  const fetchTagihan = useCallback(async (year: number) => {
    setLoadingTagihan(true);
    try {
      const res = await fetch(`/api/admin/kas/tagihan?tahun=${year}`);
      const json = await res.json();
      if (json.status && json.data) setTagihanList(json.data);
    } catch (e) { console.error(e); }
    finally { setLoadingTagihan(false); }
  }, []);

  // ── Fetch Pengeluaran Kas ──
  const fetchPengeluaran = useCallback(async (year: number) => {
    setLoadingPengeluaran(true);
    try {
      const res = await fetch(`/api/admin/kas/pengeluaran?tahun=${year}`);
      const json = await res.json();
      if (json.status) {
        setPengeluaranList(json.data || []);
        setTotalPengeluaran(json.totalPengeluaran || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingPengeluaran(false); }
  }, []);

  // ── Fetch Kupon Kas ──
  const fetchKupon = useCallback(async (year: number) => {
    setLoadingKupon(true);
    try {
      const res = await fetch(`/api/admin/kas/kupon?tahun=${year}`);
      const json = await res.json();
      if (json.status && json.data) setKuponList(json.data);
    } catch (e) { console.error(e); }
    finally { setLoadingKupon(false); }
  }, []);

  // ── STATE: Master Data Konfigurasi ──
  const [masterData, setMasterData] = useState<any>({
    kategoriPengeluaran: [
      "Operasional Fanbase", "Event / Project Show", "Konsumsi Tim", "Website & Server", "Produksi Merchandise", "Banner & Handbanner", "Dokumentasi & Media", "Lain-lain"
    ],
    tahunKasAktif: [2024, 2025, 2026, 2027, 2028, 2029],
    defaultNominalKas: 15000,
  });

  const fetchMasterData = async () => {
    try {
      const res = await fetch("/api/admin/master-data");
      const json = await res.json();
      if (json.status && json.data) {
        setMasterData(json.data);
      }
    } catch (e) { console.error(e); }
  };

  // ── Fetch Anggota untuk dropdown manual ──
  const fetchAnggota = async () => {
    try {
      const res = await fetch("/api/admin/keanggotaan");
      const json = await res.json();
      if (json.status && json.data) {
        if (Array.isArray(json.data)) {
          setAnggotaList(json.data);
        } else if (Array.isArray(json.data.direktori)) {
          setAnggotaList(json.data.direktori);
        } else {
          setAnggotaList([]);
        }
      }
    } catch (e) {
      console.error(e);
      setAnggotaList([]);
    }
  };

  useEffect(() => {
    fetchKas();
    fetchMatrix(matrixYear);
    fetchTagihan(matrixYear);
    fetchPengeluaran(matrixYear);
    fetchKupon(matrixYear);
    fetchAnggota();
    fetchMasterData();

    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const tab = p.get("tab");
      if (tab && ["matriks", "tagihan", "pengeluaran", "kupon", "konfirmasi", "war"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, [fetchMatrix, fetchTagihan, fetchPengeluaran, fetchKupon, matrixYear]);

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
        fetchTagihan(matrixYear);
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
      if (json.status) {
        fetchMatrix(matrixYear);
        fetchTagihan(matrixYear);
      } else {
        alert(json.message || "Gagal mengubah status");
      }
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
      if (json.status) {
        setMsg(json.message);
        fetchMatrix(matrixYear);
        fetchTagihan(matrixYear);
      } else {
        alert(json.message || "Gagal sinkronisasi");
      }
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
    finally { setReSyncing(false); }
  };

  // ── Handler: Ekspor / Buat Tab Lengkap ke Google Sheets ──
  const handleExportToSheets = async () => {
    if (!confirm("Kirim dan sinkronkan seluruh Tab Matriks Kas (2024-2029), Anggota Aktif, Status Anggota, Leaderboard Kontributor, dan Laporan Pengeluaran ke Google Spreadsheet sekarang?")) return;
    setExportingToSheets(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/spreadsheet", { method: "POST" });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message || "🎉 Berhasil! Seluruh tab telah disinkronkan ke Google Spreadsheet.");
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
        fetchTagihan(matrixYear);
      } else {
        alert(json.message || "Gagal menyimpan kas");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSubmittingManual(false);
    }
  };

  // ── Handler: Upload Foto Bukti Nota ──
  const handleUploadNota = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNota(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.status && json.url) {
        setNewPengeluaran((prev) => ({ ...prev, buktiNotaUrl: json.url }));
      } else {
        alert(json.message || "Gagal mengunggah foto");
      }
    } catch (err: any) {
      alert(err?.message || "Gagal mengunggah foto");
    } finally {
      setUploadingNota(false);
    }
  };

  // ── Handler: Submit Pengeluaran Kas Baru ──
  const handlePengeluaranSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNominal = Number(newPengeluaran.nominal.replace(/\D/g, ""));
    if (!cleanNominal || !newPengeluaran.keperluan) {
      alert("Keperluan dan nominal pengeluaran wajib diisi");
      return;
    }

    setSubmittingPengeluaran(true);
    try {
      const res = await fetch("/api/admin/kas/pengeluaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: newPengeluaran.tanggal,
          kategori: newPengeluaran.kategori,
          keperluan: newPengeluaran.keperluan,
          nominal: cleanNominal,
          buktiNotaUrl: newPengeluaran.buktiNotaUrl,
          catatan: newPengeluaran.catatan,
        }),
      });
      const json = await res.json();
      if (json.status) {
        setMsg("✅ Pengeluaran kas berhasil dicatat!");
        setShowPengeluaranModal(false);
        setNewPengeluaran({
          tanggal: new Date().toISOString().split("T")[0],
          kategori: "Operasional",
          keperluan: "",
          nominal: "",
          buktiNotaUrl: "",
          catatan: "",
        });
        fetchPengeluaran(matrixYear);
        fetchMatrix(matrixYear);
      } else {
        alert(json.message || "Gagal mencatat pengeluaran");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSubmittingPengeluaran(false);
    }
  };

  // ── Handler: Hapus Pengeluaran Kas ──
  const handleDeletePengeluaran = async (id: number) => {
    if (!confirm(`Hapus catatan pengeluaran kas #${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/kas/pengeluaran?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        fetchPengeluaran(matrixYear);
        fetchMatrix(matrixYear);
      } else {
        alert(json.message || "Gagal menghapus pengeluaran");
      }
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
  };

  // ── Handler: Submit Kupon Baru & Bagikan ──
  const handleKuponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKupon.kodeKupon || !newKupon.judul) {
      alert("Kode kupon dan judul hadiah wajib diisi");
      return;
    }
    setSubmittingKupon(true);
    try {
      const res = await fetch("/api/admin/kas/kupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKupon),
      });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        setShowKuponModal(false);
        setNewKupon({
          kodeKupon: "",
          judul: "",
          deskripsi: "",
          tipeReward: "Diskon Merch",
          nilaiReward: "10%",
          minBulanKas: 1,
          tahunKas: matrixYear,
          kadaluarsaPada: "",
        });
        fetchKupon(matrixYear);
      } else {
        alert(json.message || "Gagal membuat kupon");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setSubmittingKupon(false);
    }
  };

  // ── Handler: Hapus Kupon ──
  const handleDeleteKupon = async (id: number, kode: string = "") => {
    if (!confirm(`Hapus kupon "${kode}" ini dan batalkan distribusi reward ke seluruh anggota?`)) return;
    try {
      const res = await fetch(`/api/admin/kas/kupon?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        if (selectedKuponDetail?.id === id) {
          setSelectedKuponDetail(null);
        }
        fetchKupon(matrixYear);
      } else {
        alert(json.message || "Gagal menghapus kupon");
      }
    } catch (err: any) { alert(err.message || "Terjadi kesalahan"); }
  };

  // ── Handler: Lihat Detail Penerima Kupon ──
  const handleViewPenerima = async (kupon: any) => {
    setSelectedKuponDetail(kupon);
    setLoadingPenerima(true);
    try {
      const res = await fetch(`/api/admin/kas/kupon?detailId=${kupon.id}`);
      const json = await res.json();
      if (json.status) {
        setPenerimaList(json.data || []);
      } else {
        alert(json.message || "Gagal memuat penerima kupon");
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan");
    } finally {
      setLoadingPenerima(false);
    }
  };

  // ── Handler: Hapus/Cabut Kupon dari 1 Anggota Saja ──
  const handleDeletePenerima = async (kuponAnggotaId: number, nama: string) => {
    if (!confirm(`Cabut / hapus kupon hadiah untuk anggota "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/admin/kas/kupon?kuponAnggotaId=${kuponAnggotaId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status) {
        setMsg(json.message);
        if (selectedKuponDetail) {
          handleViewPenerima(selectedKuponDetail);
        }
        fetchKupon(matrixYear);
      } else {
        alert(json.message || "Gagal mencabut kupon anggota");
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan");
    }
  };

  useEffect(() => {
    if (activeTab === "war") {
      fetchAdminWarData();
    }
  }, [activeTab]);

  const pendingKas = kasList.filter((k) => k.status === "pending");
  const processedKas = kasList.filter((k) => k.status !== "pending");
  const grandTotalPemasukan = matrixData?.grandTotalPemasukan || 0;
  const saldoKasBersih = grandTotalPemasukan - totalPengeluaran;

  // Filter matrix rows by search query
  const filteredMatrixRows = (matrixData?.matrixRows || []).filter((r: any) => {
    if (!matrixSearch) return true;
    const q = matrixSearch.toLowerCase();
    return (
      (r.noAnggota || "").toLowerCase().includes(q) ||
      (r.nama || "").toLowerCase().includes(q)
    );
  });

  // Filter tagihan kas rows by search query
  const filteredTagihanRows = tagihanList.filter((d: any) => {
    if (!tagihanSearch) return true;
    const q = tagihanSearch.toLowerCase();
    return (
      (d.noAnggota || "").toLowerCase().includes(q) ||
      (d.nama || "").toLowerCase().includes(q)
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

        {/* ── TOMBOL AKSI CEPAT SINKRONISASI & INPUT KAS / PENGELUARAN ── */}
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
              Pusat Manajemen Kas, Kupon Reward &amp; Sinkronisasi Spreadsheet
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 2 }}>
              Ekspor seluruh data centang bulanan (2024-2029), Anggota Aktif, Status Anggota, Leaderboard, dan Laporan Pengeluaran.
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
              onClick={() => setShowPengeluaranModal(true)}
              className={styles.btnCreate}
              style={{ background: "#e11d48", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="bx bx-receipt" /> + Catat Pengeluaran Kas
            </button>

            <button
              type="button"
              onClick={() => setShowKuponModal(true)}
              className={styles.btnCreate}
              style={{ background: "#8b5cf6", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className="bx bx-gift" /> + Bagikan Kupon Kas
            </button>

            <button
              type="button"
              onClick={handleExportToSheets}
              disabled={exportingToSheets}
              className={styles.btnCreate}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <i className={`bx ${exportingToSheets ? "bx-loader-alt bx-spin" : "bx-cloud-upload"}`} />
              {exportingToSheets ? "Menyinkronkan..." : "Kirim Semua Tab ke Spreadsheet"}
            </button>

            {/* TOMBOL DOWNLOAD EXCEL */}
            <a
              href={`/api/admin/export-excel?type=${activeTab === "pengeluaran" ? "pengeluaran" : activeTab === "tagihan" ? "tagihan" : activeTab === "kupon" ? "kupon" : "matriks"}&tahun=${matrixYear}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnCreate}
              style={{ background: "#059669", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
              title={`Unduh file Microsoft Excel (.xls) untuk data ${activeTab} tahun ${matrixYear}`}
            >
              <i className="bx bxs-file-export" /> Download Excel ({activeTab === "pengeluaran" ? "Pengeluaran" : activeTab === "tagihan" ? "Tagihan" : activeTab === "kupon" ? "Kupon" : `Matriks ${matrixYear}`})
            </a>
          </div>
        </div>

        {/* ── NOTIFIKASI PESAN ── */}
        {msg && (
          <div style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <i className="bx bx-check-circle" /> {msg}
          </div>
        )}

        {/* ── STATS RINGKASAN KEUANGAN KAS TAHUNAN ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}>
          {/* 1. Total Pemasukan */}
          <div style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1.5px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 14,
            padding: "16px 18px",
          }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bx bx-trending-up" /> Total Pemasukan Kas {matrixYear}
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#10b981", marginTop: 4 }}>
              {formatRupiah(grandTotalPemasukan)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: 2 }}>
              Akumulasi iuran kas yang tercentang lunas
            </div>
          </div>

          {/* 2. Total Pengeluaran */}
          <div style={{
            background: "rgba(225, 29, 72, 0.08)",
            border: "1.5px solid rgba(225, 29, 72, 0.3)",
            borderRadius: 14,
            padding: "16px 18px",
          }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bx bx-trending-down" /> Total Pengeluaran Kas {matrixYear}
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#e11d48", marginTop: 4 }}>
              {formatRupiah(totalPengeluaran)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: 2 }}>
              {pengeluaranList.length} transaksi belanja operasional fanbase
            </div>
          </div>

          {/* 3. Saldo Bersih */}
          <div style={{
            background: saldoKasBersih >= 0 ? "rgba(201, 168, 76, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: saldoKasBersih >= 0 ? "1.5px solid var(--border-gold, #c9a84c)" : "1.5px solid #ef4444",
            borderRadius: 14,
            padding: "16px 18px",
          }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bx bx-wallet-alt" /> Saldo Bersih Kas {matrixYear}
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: saldoKasBersih >= 0 ? "var(--primary)" : "#ef4444", marginTop: 4 }}>
              {formatRupiah(saldoKasBersih)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginTop: 2 }}>
              Sisa saldo kas siap pakai untuk fanbase
            </div>
          </div>
        </div>

        {/* ── TAB SWITCHER UTAMA ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid var(--border)", paddingBottom: 0, overflowX: "auto" }}>
          {[
            { key: "matriks", label: "Matriks Iuran Kas Bulanan", icon: "bx-grid-alt" },
            { key: "tagihan", label: `Pelacak Tagihan Kas (${tagihanList.length})`, icon: "bx-user-x" },
            { key: "pengeluaran", label: `Laporan Pengeluaran (${pengeluaranList.length})`, icon: "bx-receipt" },
            { key: "kupon", label: `Kupon Reward Kas (${kuponList.length})`, icon: "bx-gift" },
            { key: "konfirmasi", label: `Antrean Verifikasi (${pendingKas.length})`, icon: "bx-check-shield" },
            { key: "war", label: `🔥 War Tiket STS (${adminWarPeserta.length})`, icon: "bx-flame" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "10px 18px",
                border: "none",
                borderBottom: activeTab === tab.key ? "3px solid var(--gold)" : "3px solid transparent",
                background: "transparent",
                color: activeTab === tab.key ? "var(--primary)" : "var(--fg-muted)",
                fontWeight: activeTab === tab.key ? 800 : 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
                marginBottom: -2,
                whiteSpace: "nowrap",
              }}
            >
              <i className={`bx ${tab.icon}`} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* TAB 1: MATRIKS IURAN BULANAN (TABEL CENTANG)*/}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "matriks" && (
          <div className={styles.sectionCard} style={{ padding: 20 }}>
            {/* Toolbar: Pemilih Tahun & Pencarian */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-muted)" }}>Tahun:</span>
                <div style={{ display: "flex", gap: 4, background: "var(--card-bg)", borderRadius: 10, padding: 4, border: "1px solid var(--border)" }}>
                  {(masterData.tahunKasAktif || SUPPORTED_YEARS).map((y: number) => (
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
                      width: 210,
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

            {/* Petunjuk Geser untuk Mobile */}
            <div style={{ fontSize: "0.76rem", color: "var(--gold)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bx bx-move-horizontal" /> Geser tabel ke kanan untuk melihat status pembayaran 12 bulan
            </div>

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
                <table className={styles.matrixTable}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr>
                      <th className={styles.colStickyNo} style={{ background: "#1155cc", color: "#fff" }}>No.</th>
                      <th className={styles.colStickyNoAnggota} style={{ background: "#1155cc", color: "#fff" }}>Nomor Anggota</th>
                      <th className={styles.colStickyNama} style={{ background: "#1155cc", color: "#fff" }}>Nama</th>
                      <th style={{ minWidth: 100, background: "#1155cc", color: "#fff" }}>Kas</th>
                      <th style={{ width: 75, background: "#1155cc", color: "#fff" }}>Bulan Mulai</th>
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
                    {filteredMatrixRows.map((row: any, idx: number) => (
                      <tr key={row.noAnggota}>
                        <td className={styles.colStickyNo} style={{ textAlign: "center", fontWeight: 700 }}>
                          {idx + 1}
                        </td>
                        <td className={styles.colStickyNoAnggota}>
                          <span className={styles.noAnggota} style={{ fontSize: "0.78rem" }}>{row.noAnggota}</span>
                        </td>
                        <td className={styles.colStickyNama}>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{row.nama}</div>
                          {row.isAdminRole ? (
                            <div style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 600 }}>{row.jabatan}</div>
                          ) : (
                            <div style={{ fontSize: "0.68rem", color: "var(--fg-muted)", fontWeight: 600 }}>Anggota</div>
                          )}
                        </td>
                        <td style={{ fontWeight: 800, fontSize: "0.85rem", color: row.isAdminRole ? "var(--fg-muted)" : row.totalKas > 0 ? "#10b981" : "var(--fg-muted)" }}>
                          {row.isAdminRole ? "-" : row.totalKas > 0 ? formatRupiah(row.totalKas) : "Rp -"}
                        </td>
                        <td style={{ color: "var(--fg-muted)", fontWeight: 700, textAlign: "center", fontSize: "0.82rem" }}>
                          {typeof row.bulanMulai === "number" && row.bulanMulai >= 1 && row.bulanMulai <= 12
                            ? MONTH_NAMES[row.bulanMulai - 1]
                            : row.bulanMulai}
                        </td>

                        {/* 12 Bulan Checkboxes */}
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                          const status = row.months?.[m];
                          const isPaid = status === true;
                          const isNotJoined = status === "not_joined";
                          const key = `${row.noAnggota}:${m}`;
                          const isToggling = matrixToggling === key;

                          return (
                            <td
                              key={m}
                              className={isPaid ? styles.matrixCellPaid : isNotJoined ? "" : styles.matrixCellUnpaid}
                              title={
                                isNotJoined
                                  ? `${row.nama}: Belum Bergabung pada ${MONTH_NAMES_FULL[m - 1]} ${matrixYear} (Bebas Kewajiban Kas)`
                                  : `${row.nama} (${MONTH_NAMES_FULL[m - 1]} ${matrixYear}): ${isPaid ? "LUNAS" : "Belum Bayar"}. Klik untuk ubah.`
                              }
                              onClick={() => !isToggling && handleToggleMonth(row.noAnggota, m, isPaid)}
                              style={{
                                cursor: "pointer",
                                textAlign: "center",
                                verticalAlign: "middle",
                                transition: "all 0.15s",
                                background: isNotJoined ? "rgba(255, 255, 255, 0.02)" : undefined,
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
                              ) : row.isAdminRole ? (
                                <span style={{ color: "var(--fg-muted)", fontSize: "0.9rem", fontWeight: 700 }} title={`${row.nama} (Pengurus Fanbase)`}>
                                  -
                                </span>
                              ) : isNotJoined ? (
                                <span style={{ color: "var(--fg-muted)", fontSize: "0.9rem", fontWeight: 700 }} title="Belum Bergabung">
                                  -
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
                <span>Anggota hanya wajib membayar kas sejak bulan resmi bergabung (kolom Bulan Mulai). Bulan sebelum bergabung otomatis bebas kewajiban kas.</span>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 18, height: 18, background: "#1155cc", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem" }}><i className="bx bx-check" /></span> Lunas
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 16, height: 16, border: "1.5px solid rgba(156,163,175,0.4)", borderRadius: 3, display: "inline-block" }} /> Belum Bayar
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <strong style={{ color: "var(--fg-muted)", fontSize: "1rem" }}>-</strong> Belum Bergabung
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB 2: PELACAK TAGIHAN & KEWAJIBAN KAS       */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "tagihan" && (
          <div className={styles.sectionCard} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  <i className="bx bx-user-x" style={{ color: "#ef4444" }} />
                  Pelacak Tagihan &amp; Kewajiban Kas Anggota Tahun {matrixYear}
                  <span className={styles.countBadge} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                    {tagihanList.length} Menunggak
                  </span>
                </h2>
                <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 4 }}>
                  Daftar anggota aktif yang belum melunasi kewajiban kas bulanan (Pengurus fanbase dibebaskan otomatis).
                </div>
              </div>

              {/* Search Bar Tagihan */}
              <div style={{ position: "relative" }}>
                <i className="bx bx-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)" }} />
                <input
                  type="text"
                  placeholder="Cari nama / nomor anggota..."
                  value={tagihanSearch}
                  onChange={(e) => setTagihanSearch(e.target.value)}
                  style={{
                    padding: "8px 12px 8px 32px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card-bg)",
                    color: "var(--fg)",
                    fontSize: "0.85rem",
                    outline: "none",
                    width: 250,
                  }}
                />
              </div>
            </div>

            {loadingTagihan ? (
              <div className={styles.emptyBox}><i className="bx bx-loader-alt bx-spin" /><p>Memuat data tagihan kas...</p></div>
            ) : filteredTagihanRows.length === 0 ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-check-shield" style={{ color: "#10b981" }} />
                <p>Luar biasa! Seluruh anggota telah melunasi kewajiban kas pada tahun {matrixYear}.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Nomor Anggota</th>
                      <th>Nama Anggota</th>
                      <th>Tagihan Kas</th>
                      <th>Kewajiban Kas</th>
                      <th>Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTagihanRows.map((d: any, idx: number) => (
                      <tr key={d.noAnggota}>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
                        <td><span className={styles.noAnggota}>{d.noAnggota}</span></td>
                        <td className={styles.nameCol}>
                          <div style={{ fontWeight: 700 }}>{d.nama}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>{d.jabatan}</div>
                        </td>
                        <td style={{ fontWeight: 900, color: "#ef4444", fontSize: "0.95rem" }}>
                          {formatRupiah(d.tagihanKas)}
                        </td>
                        <td>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                          }}>
                            {d.kewajibanText}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setManualNoAnggota(d.noAnggota);
                              setManualTahun(matrixYear);
                              setManualBulan(d.unpaidMonths?.[0] || 1);
                              setShowInputModal(true);
                            }}
                            className={styles.backBtn}
                            style={{ fontSize: "0.75rem", padding: "5px 10px", color: "var(--gold)", borderColor: "var(--border-gold)" }}
                          >
                            <i className="bx bx-check-circle" /> Bayar Bulan Pertama
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB 3: LAPORAN PENGELUARAN KAS FANBASE       */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "pengeluaran" && (
          <div className={styles.sectionCard} style={{ padding: 20 }}>
            <div className={styles.sectionHeader} style={{ flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-receipt" style={{ color: "#e11d48" }} />
                  Laporan Operasional &amp; Pengeluaran Kas Fanbase
                  <span className={styles.countBadge} style={{ background: "rgba(225, 29, 72, 0.15)", color: "#e11d48" }}>
                    {pengeluaranList.length} Transaksi
                  </span>
                </h2>
                <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 2 }}>
                  Total pengeluaran tercatat tahun {matrixYear}: <strong style={{ color: "#e11d48" }}>{formatRupiah(totalPengeluaran)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPengeluaranModal(true)}
                className={styles.btnCreate}
                style={{ background: "#e11d48", color: "#fff" }}
              >
                <i className="bx bx-plus" /> + Catat Pengeluaran Baru
              </button>
            </div>

            {loadingPengeluaran ? (
              <div className={styles.emptyBox}><i className="bx bx-loader-alt bx-spin" /><p>Memuat laporan pengeluaran...</p></div>
            ) : pengeluaranList.length === 0 ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-receipt" />
                <p>Belum ada catatan pengeluaran kas pada tahun {matrixYear}.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tanggal</th>
                      <th>Kategori</th>
                      <th>Keperluan</th>
                      <th>Nominal</th>
                      <th>Penanggung Jawab</th>
                      <th>Bukti Nota</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengeluaranList.map((p: any) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>{new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td>
                          <span style={{ padding: "3px 8px", borderRadius: 4, background: "rgba(0,0,0,0.2)", fontSize: "0.75rem", fontWeight: 700 }}>
                            {p.kategori}
                          </span>
                        </td>
                        <td className={styles.nameCol}>
                          <div style={{ fontWeight: 700 }}>{p.keperluan}</div>
                          {p.catatan && <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>{p.catatan}</div>}
                        </td>
                        <td style={{ fontWeight: 800, color: "#e11d48" }}>{formatRupiah(p.nominal)}</td>
                        <td>{p.pj_nama}</td>
                        <td>
                          {p.bukti_nota_url ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProof(p.bukti_nota_url)}
                              className={styles.backBtn}
                              style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                            >
                              <i className="bx bx-image" /> Lihat
                            </button>
                          ) : "-"}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeletePengeluaran(p.id)}
                            className={styles.btnDelete}
                            title="Hapus Pengeluaran"
                          >
                            <i className="bx bx-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB 4: KUPON REWARD KAS ANGGOTA (FITUR BARU) */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "kupon" && (
          <div className={styles.sectionCard} style={{ padding: 20 }}>
            <div className={styles.sectionHeader} style={{ flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-gift" style={{ color: "#8b5cf6" }} />
                  Kupon &amp; Voucher Reward Kas Fanbase
                  <span className={styles.countBadge} style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6" }}>
                    {kuponList.length} Kupon
                  </span>
                </h2>
                <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 2 }}>
                  Kupon hadiah otomatis dikirim khusus ke dashboard <strong>anggota yang rajin membayar kas</strong> (admin/pengurus bebas kas tidak menerima kupon reward).
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowKuponModal(true)}
                className={styles.btnCreate}
                style={{ background: "#8b5cf6", color: "#fff" }}
              >
                <i className="bx bx-plus" /> + Buat &amp; Bagikan Kupon Baru
              </button>
            </div>

            {loadingKupon ? (
              <div className={styles.emptyBox}><i className="bx bx-loader-alt bx-spin" /><p>Memuat daftar kupon...</p></div>
            ) : kuponList.length === 0 ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-purchase-tag-alt" />
                <p>Belum ada kupon reward yang dibuat. Klik tombol "+ Buat &amp; Bagikan Kupon Baru" untuk mengapresiasi anggota yang rajin bayar kas.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Kode Kupon</th>
                      <th>Judul Hadiah</th>
                      <th>Nilai Reward</th>
                      <th>Syarat Kelayakan Kas</th>
                      <th>Penerima Berhak</th>
                      <th>Kadaluarsa</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kuponList.map((k: any) => (
                      <tr key={k.id}>
                        <td>
                          <div>
                            <span style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: "rgba(139, 92, 246, 0.15)",
                              color: "#8b5cf6",
                              fontWeight: 900,
                              letterSpacing: "0.5px",
                              fontSize: "0.88rem",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                            }}>
                              {k.kode_kupon}
                            </span>
                            <div style={{ fontSize: "0.68rem", color: "var(--fg-muted)", marginTop: 3 }}>
                              *Kode personal unik beda tiap orang
                            </div>
                          </div>
                        </td>
                        <td className={styles.nameCol}>
                          <div style={{ fontWeight: 700 }}>{k.judul}</div>
                          {k.deskripsi && <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>{k.deskripsi}</div>}
                        </td>
                        <td style={{ fontWeight: 800, color: "var(--gold)" }}>
                          {k.nilai_reward} ({k.tipe_reward})
                        </td>
                        <td>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#10b981" }}>
                            Min. {k.min_bulan_kas} Bulan Lunas Kas ({k.tahun_kas})
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleViewPenerima(k)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "5px 12px",
                              borderRadius: 8,
                              background: "rgba(16, 185, 129, 0.12)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              color: "#10b981",
                              fontWeight: 800,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            title="Klik untuk melihat daftar anggota penerima & kode unik masing-masing"
                          >
                            <i className="bx bx-group" /> {k.total_penerima || 0} Anggota (Lihat)
                          </button>
                        </td>
                        <td>
                          {k.kadaluarsa_pada
                            ? new Date(k.kadaluarsa_pada).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "Tanpa Batas"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleViewPenerima(k)}
                              className={styles.backBtn}
                              style={{ fontSize: "0.75rem", padding: "4px 8px", color: "var(--gold)", borderColor: "var(--border-gold)" }}
                              title="Lihat Daftar Penerima Kupon & Kode Masing-Masing"
                            >
                              <i className="bx bx-show" /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteKupon(k.id, k.kode_kupon)}
                              className={styles.btnDelete}
                              title="Hapus Seluruh Kupon Ini Beserta Semua Penerimanya"
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
        )}

        {/* ── MODAL DETAIL PENERIMA KUPON & CABUT KUPON PER ORANG ── */}
        {selectedKuponDetail && (
          <div className={styles.modalOverlay} onClick={() => setSelectedKuponDetail(null)}>
            <div className={styles.modalCard} style={{ maxWidth: 780, width: "95%" }} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div>
                  <h3 className={styles.modalTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="bx bx-gift" style={{ color: "#8b5cf6" }} />
                    Daftar Penerima Kupon: <span style={{ color: "var(--gold)" }}>{selectedKuponDetail.kode_kupon}</span>
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)", marginTop: 2 }}>
                    {selectedKuponDetail.judul} ({selectedKuponDetail.nilai_reward}) • Setiap anggota memiliki kode kupon unik yang digenerate otomatis.
                  </div>
                </div>
                <button type="button" className={styles.modalClose} onClick={() => setSelectedKuponDetail(null)}>
                  <i className="bx bx-x" />
                </button>
              </div>

              <div style={{ padding: "16px 0" }}>
                {loadingPenerima ? (
                  <div className={styles.emptyBox}>
                    <i className="bx bx-loader-alt bx-spin" />
                    <p>Memuat daftar anggota penerima kupon...</p>
                  </div>
                ) : penerimaList.length === 0 ? (
                  <div className={styles.emptyBox}>
                    <i className="bx bx-user-x" />
                    <p>Belum ada anggota yang menerima kupon ini.</p>
                  </div>
                ) : (
                  <div className={styles.tableWrap} style={{ maxHeight: "55vh", overflow: "auto" }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nomor Anggota</th>
                          <th>Nama Lengkap</th>
                          <th>Kode Kupon Unik (Personal)</th>
                          <th>Bulan Lunas</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {penerimaList.map((p, idx) => (
                          <tr key={p.kupon_anggota_id}>
                            <td style={{ textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
                            <td><span className={styles.noAnggota}>{p.no_anggota}</span></td>
                            <td className={styles.nameCol}>
                              <div style={{ fontWeight: 700 }}>{p.nama_lengkap}</div>
                              <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>{p.jabatan || "Anggota"}</div>
                            </td>
                            <td>
                              <span style={{
                                display: "inline-block",
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: "rgba(139, 92, 246, 0.15)",
                                color: "#8b5cf6",
                                fontWeight: 900,
                                fontSize: "0.82rem",
                                letterSpacing: "0.5px",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                              }}>
                                {p.kode_kupon_unik}
                              </span>
                            </td>
                            <td style={{ textAlign: "center", fontWeight: 700, color: "#10b981" }}>
                              {p.bulan_terbayar} Bulan
                            </td>
                            <td>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                background: p.status_kupon === "digunakan" ? "rgba(100, 116, 139, 0.2)" : "rgba(16, 185, 129, 0.15)",
                                color: p.status_kupon === "digunakan" ? "#64748b" : "#10b981",
                              }}>
                                {p.status_kupon === "digunakan" ? "Digunakan" : "Aktif"}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleDeletePenerima(p.kupon_anggota_id, p.nama_lengkap)}
                                className={styles.btnDelete}
                                title="Cabut / Hapus Kupon dari Anggota Ini"
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "4px 8px" }}
                              >
                                <i className="bx bx-trash" /> Cabut
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={styles.modalActions} style={{ justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleDeleteKupon(selectedKuponDetail.id, selectedKuponDetail.kode_kupon)}
                  className={styles.btnDelete}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", padding: "8px 14px" }}
                >
                  <i className="bx bx-trash" /> Hapus Seluruh Kupon Ini
                </button>
                <button type="button" className={styles.backBtn} onClick={() => setSelectedKuponDetail(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB 5: ANTREAN VERIFIKASI KAS MASUK         */}
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

        {/* ════════════════════════════════════════════ */}
        {/* TAB 6: WAR TIKET PROJECT STS ERINE (ADMIN)  */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "war" && (
          <div className={styles.sectionCard} style={{ padding: 20 }}>
            <div className={styles.sectionHeader} style={{ flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-flame" style={{ color: "#ef4444" }} />
                  Manajemen War Tiket Project STS Erine
                  <span className={styles.countBadge} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                    {adminWarPeserta.length} / {adminWarEvent?.kuota_total || 50} Terisi
                  </span>
                </h2>
                <div style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 2 }}>
                  Kontrol kuota, jadwal buka/tutup war tiket, dan pantau daftar pemenang tiket secara live dengan presisi milidetik.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowWarModal(true)}
                  className={styles.btnCreate}
                  style={{ background: "#ef4444", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <i className="bx bx-slider-alt" /> Atur Event &amp; Kuota War
                </button>

                {adminWarEvent?.status === "buka" ? (
                  <button
                    type="button"
                    onClick={() => handleToggleWarStatus("tutup")}
                    className={styles.btnCreate}
                    style={{ background: "#4b5563", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
                    title="Tutup War Tiket sekarang secara manual"
                  >
                    <i className="bx bx-lock-alt" /> Tutup War Manual
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleWarStatus("buka")}
                    className={styles.btnCreate}
                    style={{ background: "#10b981", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
                    title="Buka War Tiket sekarang secara manual"
                  >
                    <i className="bx bx-lock-open-alt" /> Buka War Manual
                  </button>
                )}

                {/* Export Excel / CSV Peserta War */}
                <button
                  type="button"
                  onClick={() => {
                    if (adminWarPeserta.length === 0) {
                      alert("Belum ada data peserta untuk diunduh");
                      return;
                    }
                    const headers = ["No", "Nomor Tiket", "No Anggota", "Nama Lengkap", "Waktu Klaim"];
                    const csvRows = [headers.join(",")];
                    adminWarPeserta.forEach((p, idx) => {
                      csvRows.push([
                        idx + 1,
                        `"${p.nomor_tiket}"`,
                        `"${p.no_anggota}"`,
                        `"${(p.nama_lengkap || "").replace(/"/g, '""')}"`,
                        `"${p.waktu_klaim}"`
                      ].join(","));
                    });
                    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Peserta_War_Tiket_STS_Erine_${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className={styles.btnCreate}
                  style={{ background: "#059669", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <i className="bx bxs-file-export" /> Download Excel/CSV ({adminWarPeserta.length})
                </button>
              </div>
            </div>

            {/* Event Info Card */}
            {adminWarEvent && (
              <div
                style={{
                  marginTop: 16,
                  marginBottom: 20,
                  padding: "16px 20px",
                  borderRadius: 16,
                  background: "rgba(239, 68, 68, 0.05)",
                  border: "1.5px solid rgba(239, 68, 68, 0.25)",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                    Judul Event
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>
                    {adminWarEvent.judul}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--gold)", background: "rgba(201, 168, 76, 0.12)", padding: "2px 8px", borderRadius: 6, border: "1px dashed var(--gold)" }}>
                      Prefix: #{adminWarEvent.kode_tiket || "STS20"}-xxx
                    </span>
                    <Link href="/admin/master-data" style={{ fontSize: "0.75rem", color: "var(--primary)", textDecoration: "underline", fontWeight: 600 }}>
                      Ubah di Master Data →
                    </Link>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                    Status Sistem War
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 50,
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        background:
                          adminWarEvent.status === "buka" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: adminWarEvent.status === "buka" ? "#10b981" : "#ef4444",
                        border: `1px solid ${adminWarEvent.status === "buka" ? "#10b981" : "#ef4444"}`,
                      }}
                    >
                      <i className={`bx ${adminWarEvent.status === "buka" ? "bx-broadcast" : "bx-lock-alt"}`} />
                      {adminWarEvent.status === "buka" ? "TERBUKA" : "DITUTUP"}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                    Alokasi Kuota
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>
                    {adminWarEvent.kuota_terisi} / {adminWarEvent.kuota_total} Tiket{" "}
                    <span style={{ fontSize: "0.8rem", color: "#10b981" }}>
                      ({Math.max(0, adminWarEvent.kuota_total - adminWarEvent.kuota_terisi)} Sisa)
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                    Jadwal Buka &amp; Tutup
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--fg)", marginTop: 2, lineHeight: 1.4 }}>
                    Buka: {new Date(adminWarEvent.waktu_buka).toLocaleString("id-ID")}<br />
                    Tutup: {new Date(adminWarEvent.waktu_tutup).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            )}

            {/* Tabel Pemenang War Tiket */}
            {loadingAdminWar ? (
              <div className={styles.emptyBox}><i className="bx bx-loader-alt bx-spin" /><p>Memuat peserta war tiket...</p></div>
            ) : adminWarPeserta.length === 0 ? (
              <div className={styles.emptyBox}>
                <i className="bx bx-flame" style={{ color: "#ef4444" }} />
                <p>Belum ada anggota yang melakukan klaim tiket war.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>No. Tiket</th>
                      <th>No. Anggota</th>
                      <th>Nama Lengkap</th>
                      <th>Jabatan / Divisi</th>
                      <th>Kontak (LINE / ID)</th>
                      <th>Waktu Klaim (Presisi Server)</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminWarPeserta.map((p, idx) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700 }}>#{idx + 1}</td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#ef4444",
                              fontWeight: 900,
                              fontSize: "0.88rem",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            #{p.nomor_tiket}
                          </span>
                        </td>
                        <td><span className={styles.noAnggota}>{p.no_anggota}</span></td>
                        <td className={styles.nameCol}>{p.nama_lengkap}</td>
                        <td style={{ fontSize: "0.82rem" }}>
                          {p.jabatan || "Anggota"} {p.divisi ? `• ${p.divisi}` : ""}
                        </td>
                        <td style={{ fontSize: "0.82rem" }}>
                          {p.id_line ? `@${p.id_line}` : p.kontak_id || "-"}
                        </td>
                        <td style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--fg-muted)" }}>
                          {new Date(p.waktu_klaim).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.btnDelete}
                            onClick={() => handleDeleteWarPeserta(p.id, p.nama_lengkap)}
                            title="Batalkan &amp; Cabut Tiket (Kuota Otomatis Bertambah 1)"
                          >
                            <i className="bx bx-trash" /> Cabut
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
                  {(Array.isArray(anggotaList) ? anggotaList : []).map((a) => (
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
                    {(masterData.tahunKasAktif || SUPPORTED_YEARS).map((y: number) => (
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

      {/* ── MODAL CATAT PENGELUARAN KAS (DENGAN INPUT GAMBAR LANGSUNG) ── */}
      {showPengeluaranModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPengeluaranModal(false)}>
          <div className={styles.modalCard} style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-receipt" /> Catat Pengeluaran Kas Operasional
              </h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowPengeluaranModal(false)}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handlePengeluaranSubmit} className={styles.modalForm}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Tanggal Pengeluaran</label>
                  <input
                    type="date"
                    className={styles.modalInput}
                    value={newPengeluaran.tanggal}
                    onChange={(e) => setNewPengeluaran({ ...newPengeluaran, tanggal: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Kategori</label>
                  <select
                    className={styles.modalSelect}
                    value={newPengeluaran.kategori}
                    onChange={(e) => setNewPengeluaran({ ...newPengeluaran, kategori: e.target.value })}
                  >
                    {(masterData.kategoriPengeluaran || [
                      "Operasional Fanbase", "Event / Project Show", "Konsumsi Tim", "Website & Server", "Produksi Merchandise", "Banner & Handbanner", "Dokumentasi & Media", "Lain-lain"
                    ]).map((kat: string) => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Keperluan / Deskripsi Singkat</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Contoh: Banner Erine 200 Show, Snack Gath, dll."
                  value={newPengeluaran.keperluan}
                  onChange={(e) => setNewPengeluaran({ ...newPengeluaran, keperluan: e.target.value })}
                  required
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nominal Pengeluaran (Rp)</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Contoh: 150.000"
                  value={newPengeluaran.nominal}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setNewPengeluaran({
                      ...newPengeluaran,
                      nominal: digits ? Number(digits).toLocaleString("id-ID") : "",
                    });
                  }}
                  required
                />
              </div>

              {/* INPUT GAMBAR NOTA / KWITANSI LANGSUNG (FILE INPUT BUKAN URL) */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Upload Bukti Foto Nota / Kwitansi (Opsional)</label>
                {newPengeluaran.buktiNotaUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.15)" }}>
                    <img src={newPengeluaran.buktiNotaUrl} alt="Preview Nota" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                    <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.8rem", color: "#10b981", fontWeight: 700 }}>
                      <i className="bx bx-check-circle" /> Foto nota berhasil diunggah
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewPengeluaran({ ...newPengeluaran, buktiNotaUrl: "" })}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center" }}
                      title="Hapus foto"
                    >
                      <i className="bx bx-trash" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      id="uploadNotaInput"
                      style={{ display: "none" }}
                      onChange={handleUploadNota}
                      disabled={uploadingNota}
                    />
                    <label
                      htmlFor="uploadNotaInput"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: "1.5px dashed var(--border)",
                        background: "rgba(255, 255, 255, 0.02)",
                        color: "var(--fg-muted)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: uploadingNota ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <i className={`bx ${uploadingNota ? "bx-loader-alt bx-spin" : "bx-camera"}`} style={{ fontSize: "1.3rem", color: "var(--gold)" }} />
                      {uploadingNota ? "Mengunggah foto nota..." : "Pilih File Foto / Kamera Nota"}
                    </label>
                  </div>
                )}
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Catatan Tambahan (Opsional)</label>
                <textarea
                  className={styles.modalInput}
                  rows={2}
                  value={newPengeluaran.catatan}
                  onChange={(e) => setNewPengeluaran({ ...newPengeluaran, catatan: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.backBtn} onClick={() => setShowPengeluaranModal(false)}>
                  Batal
                </button>
                <button type="submit" className={styles.btnCreate} style={{ background: "#e11d48", color: "#fff" }} disabled={submittingPengeluaran || uploadingNota}>
                  <i className={`bx ${submittingPengeluaran ? "bx-loader-alt bx-spin" : "bx-save"}`} />
                  {submittingPengeluaran ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL BUAT KUPON REWARD KAS BARU ── */}
      {showKuponModal && (
        <div className={styles.modalOverlay} onClick={() => setShowKuponModal(false)}>
          <div className={styles.modalCard} style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bx bx-gift" style={{ color: "#8b5cf6" }} /> Buat &amp; Bagikan Kupon Reward Kas
              </h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowKuponModal(false)}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleKuponSubmit} className={styles.modalForm}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Kode Kupon (KAPITAL)</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Contoh: ERINE200SHOW"
                    value={newKupon.kodeKupon}
                    onChange={(e) => setNewKupon({ ...newKupon, kodeKupon: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Tahun Kas yang Dinilai</label>
                  <select
                    className={styles.modalSelect}
                    value={newKupon.tahunKas}
                    onChange={(e) => setNewKupon({ ...newKupon, tahunKas: Number(e.target.value) })}
                  >
                    {(masterData.tahunKasAktif || SUPPORTED_YEARS).map((y: number) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Judul Hadiah / Reward</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Contoh: Voucher Diskon Merchandise Fanbase"
                  value={newKupon.judul}
                  onChange={(e) => setNewKupon({ ...newKupon, judul: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Tipe Reward</label>
                  <select
                    className={styles.modalSelect}
                    value={newKupon.tipeReward}
                    onChange={(e) => setNewKupon({ ...newKupon, tipeReward: e.target.value })}
                  >
                    {(masterData.tipeRewardKupon || [
                      "Diskon Merchandise", "Potongan Iuran Kas", "Photocard / Goodies", "Undian Tiket Show", "Akses Event Eksklusif", "Lainnya"
                    ]).map((tr: string) => (
                      <option key={tr} value={tr}>{tr}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Nilai / Bentuk Reward</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Contoh: 15.000 / 20% / Free PC"
                    value={newKupon.nilaiReward}
                    onChange={(e) => setNewKupon({ ...newKupon, nilaiReward: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* KRITERIA MINIMAL BULAN KAS (ANGGOTA JARANG BAYAR KAS TIDAK DAPAT) */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>
                  <i className="bx bx-filter-alt" style={{ color: "var(--gold)" }} /> Syarat Pembayaran Kas (Kelayakan Anggota)
                </label>
                <select
                  className={styles.modalSelect}
                  value={newKupon.minBulanKas}
                  onChange={(e) => setNewKupon({ ...newKupon, minBulanKas: Number(e.target.value) })}
                >
                  <option value={1}>Minimal 1 Bulan Lunas Kas di Tahun {newKupon.tahunKas}</option>
                  <option value={3}>Minimal 3 Bulan Lunas Kas (Rajin Bayar)</option>
                  <option value={6}>Minimal 6 Bulan Lunas Kas (Setengah Tahun)</option>
                  <option value={9}>Minimal 9 Bulan Lunas Kas</option>
                  <option value={12}>Lunas Penuh 12 Bulan (Super Rajin)</option>
                </select>
                <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginTop: 2 }}>
                  * Khusus Anggota biasa yang membayar kas. Pengurus/Admin tidak diikutsertakan. Anggota yang belum memenuhi syarat <strong>tidak akan mendapatkan kupon</strong>.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Tanggal Kadaluarsa (Opsional)</label>
                  <input
                    type="date"
                    className={styles.modalInput}
                    value={newKupon.kadaluarsaPada}
                    onChange={(e) => setNewKupon({ ...newKupon, kadaluarsaPada: e.target.value })}
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Deskripsi / Catatan Singkat</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Contoh: Berlaku saat gath fanbase"
                    value={newKupon.deskripsi}
                    onChange={(e) => setNewKupon({ ...newKupon, deskripsi: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.backBtn} onClick={() => setShowKuponModal(false)}>
                  Batal
                </button>
                <button type="submit" className={styles.btnCreate} style={{ background: "#8b5cf6", color: "#fff" }} disabled={submittingKupon}>
                  <i className={`bx ${submittingKupon ? "bx-loader-alt bx-spin" : "bx-send"}`} />
                  {submittingKupon ? "Mendistribusikan..." : "Simpan & Kirim Kupon"}
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
              <h3 className={styles.modalTitle}><i className="bx bx-receipt" /> Bukti Pembayaran / Nota</h3>
              <button type="button" className={styles.modalClose} onClick={() => setSelectedProof(null)}><i className="bx bx-x" /></button>
            </div>
            <div style={{ marginTop: 16 }}>
              <img src={selectedProof} alt="Bukti" style={{ width: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 12, border: "1px solid var(--border)" }} />
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

      {/* ── MODAL SETTING EVENT WAR TIKET STS ERINE ── */}
      {showWarModal && (
        <div className={styles.modalOverlay} onClick={() => setShowWarModal(false)}>
          <div className={styles.modalCard} style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ color: "#ef4444" }}>
                <i className="bx bx-flame" /> Atur Event &amp; Kuota War Tiket
              </h3>
              <button type="button" className={styles.modalClose} onClick={() => setShowWarModal(false)}>
                <i className="bx bx-x" />
              </button>
            </div>

            <form onSubmit={handleSaveWarEvent} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nama Event War Tiket</label>
                <input
                  type="text"
                  required
                  className={styles.modalInput}
                  value={warForm.judul}
                  onChange={(e) => setWarForm({ ...warForm, judul: e.target.value })}
                  placeholder="Contoh: War Tiket Project STS Erine 20th"
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Deskripsi Singkat</label>
                <textarea
                  className={styles.modalTextarea}
                  rows={2}
                  value={warForm.deskripsi}
                  onChange={(e) => setWarForm({ ...warForm, deskripsi: e.target.value })}
                  placeholder="Penjelasan singkat event war tiket..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Total Kuota Tiket</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    className={styles.modalInput}
                    value={warForm.kuotaTotal}
                    onChange={(e) => setWarForm({ ...warForm, kuotaTotal: Number(e.target.value) })}
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Status Sistem</label>
                  <select
                    className={styles.modalSelect}
                    value={warForm.status}
                    onChange={(e) => setWarForm({ ...warForm, status: e.target.value as any })}
                  >
                    <option value="buka">Buka (Aktif Sesuai Jadwal)</option>
                    <option value="tutup">Tutup (Nonaktifkan War)</option>
                    <option value="draft">Draft (Disembunyikan)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Jadwal Buka War (Server)</label>
                  <input
                    type="datetime-local"
                    required
                    className={styles.modalInput}
                    value={warForm.waktuBuka}
                    onChange={(e) => setWarForm({ ...warForm, waktuBuka: e.target.value })}
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Jadwal Tutup War (Server)</label>
                  <input
                    type="datetime-local"
                    required
                    className={styles.modalInput}
                    value={warForm.waktuTutup}
                    onChange={(e) => setWarForm({ ...warForm, waktuTutup: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Syarat &amp; Ketentuan</label>
                <textarea
                  className={styles.modalTextarea}
                  rows={3}
                  value={warForm.syaratKetentuan}
                  onChange={(e) => setWarForm({ ...warForm, syaratKetentuan: e.target.value })}
                  placeholder="Aturan untuk anggota yang ikut war tiket..."
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowWarModal(false)}>
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingWarEvent}
                  className={styles.btnCreate}
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  {savingWarEvent ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
