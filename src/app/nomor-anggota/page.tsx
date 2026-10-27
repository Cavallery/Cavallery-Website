"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Users,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  UserCheck,
  Flame,
} from "lucide-react";

interface PublicMember {
  id: number;
  batch: string;
  batchNumber: number;
  noAnggota: string;
  nama: string;
  status: "Aktif" | "Keluar";
}

function NomorAnggotaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("no") || "";
  const initialBatch = searchParams.get("batch") || "all";
  const initialStatus = searchParams.get("status") === "all" ? "all" : "aktif";

  const [members, setMembers] = useState<PublicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatch);
  const [statusFilter, setStatusFilter] = useState<"aktif" | "all">(initialStatus);
  const [copiedNo, setCopiedNo] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicData() {
      try {
        setLoading(true);
        const res = await fetch("/api/anggota?public=true", { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMembers(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat data anggota:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, []);

  const batches = useMemo(() => {
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

  // Hitung jumlah anggota aktif dan total
  const countAktif = useMemo(() => {
    return members.filter((m) => m.status === "Aktif").length;
  }, [members]);

  const countSemua = members.length;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Filter Status: Aktif vs Semua
      if (statusFilter === "aktif" && m.status !== "Aktif") {
        return false;
      }

      // Filter Batch
      if (selectedBatch !== "all") {
        if (m.batchNumber !== parseInt(selectedBatch, 10)) {
          return false;
        }
      }

      // Filter Search
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchNo = m.noAnggota.toLowerCase().includes(q);
        const matchNama = m.nama.toLowerCase().includes(q);
        const matchBatch = m.batch.toLowerCase().includes(q);

        // Jika ketik angka sederhana (misal 1 atau 001)
        const qDigits = q.replace(/[^\d]/g, "");
        const mDigits = m.noAnggota.replace(/[^\d]/g, "");
        const matchDigits = qDigits.length > 0 && (mDigits.endsWith(qDigits) || parseInt(mDigits, 10) === parseInt(qDigits, 10));

        return matchNo || matchNama || matchBatch || matchDigits;
      }

      return true;
    });
  }, [members, statusFilter, selectedBatch, searchTerm]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNo(text);
    setTimeout(() => setCopiedNo(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-orange-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-amber-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-orange-200 bg-clip-text text-transparent">
                CAVALLERY
              </span>
              <span className="text-[10px] uppercase font-semibold text-orange-400 block -mt-1 tracking-wider">
                Direktori Anggota
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Database Realtime
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Banner Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Pencarian Nomor Anggota Resmi LINE Fanbase
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Pencari Nomor Anggota
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Cari nomor anggota atau nama kamu dengan cepat. Gunakan filter status dan batch untuk hasil yang lebih spesifik.
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-[#111827]/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-xl mb-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor (contoh: CAVA-0001 atau 0001) atau nama..."
              className="w-full pl-12 pr-10 py-3 bg-[#0b0f19] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-slate-400 hover:text-white px-2 py-1 rounded"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Status Filter Buttons: Anggota Aktif vs Semua Anggota */}
          <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-white/5">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-orange-400" />
              Filter Keanggotaan:
            </span>
            <button
              onClick={() => setStatusFilter("aktif")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === "aktif"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Anggota Aktif ({countAktif})</span>
            </button>

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === "all"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-1 ring-orange-400"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Semua Anggota ({countSemua})</span>
            </button>
          </div>

          {/* Batch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {batches.map((b) => {
              const active = selectedBatch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatch(b.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
          <div>
            Menampilkan <span className="font-semibold text-orange-400">{filteredMembers.length}</span> anggota{" "}
            <span className="text-slate-500 font-normal">
              ({statusFilter === "aktif" ? "Hanya Aktif" : "Semua Status"})
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            Privasi Publik: Hanya 3 Kolom Ditampilkan
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#111827]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0b0f19] text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold w-32">
                    Batch
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Nomor Anggota
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">
                    Nama Anggota
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <div>Memuat direktori anggota Cavallery...</div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <div className="font-medium text-slate-300">Tidak ada anggota ditemukan</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Coba pilih &apos;Semua Anggota&apos; atau ganti kata kunci pencarian.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const isCopied = copiedNo === m.noAnggota;
                    const isAktif = m.status === "Aktif";

                    return (
                      <tr
                        key={m.id || m.noAnggota}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        {/* Batch */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-300 border border-orange-500/20">
                            {m.batch}
                          </span>
                        </td>

                        {/* Nomor Anggota (Format 4 digit: CAVA-0001) */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm bg-slate-950/60 px-2 py-0.5 rounded border border-white/10 group-hover:border-orange-500/40 transition-colors">
                              {m.noAnggota}
                            </span>
                            {isAktif ? (
                              <span
                                title="Anggota Aktif"
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span
                                title="Status Keluar"
                                className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium"
                              >
                                (Non-aktif)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Nama Anggota */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                            {m.nama}
                          </div>
                        </td>

                        {/* Action: Copy */}
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(m.noAnggota)}
                            title="Salin Nomor Anggota"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-orange-600 transition-all border border-white/5 active:scale-95"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LINE Group Instructions Box */}
        <div className="mt-8 bg-gradient-to-r from-orange-950/20 via-slate-900/60 to-amber-950/20 border border-orange-500/20 rounded-2xl p-5 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm mb-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            Integrasi LINE Group Fanbase Cavallery
          </div>
          <p className="leading-relaxed mb-2">
            Ketika mengetik nomor anggota di LINE Group Fanbase, anggota dapat langsung mencari nomor atau nama resmi melalui tautan ini:
          </p>
          <div className="bg-[#0b0f19] p-2.5 rounded-lg border border-white/10 font-mono text-orange-300 flex items-center justify-between overflow-x-auto">
            <span>https://cavallery.id/nomor-anggota?q=CAVA-0001</span>
            <button
              onClick={() => copyToClipboard("https://cavallery.id/nomor-anggota")}
              className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded ml-2"
            >
              Salin URL
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-slate-500 bg-[#0b0f19]">
        <p>© {new Date().getFullYear()} Cavallery Fanbase. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function NomorAnggotaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Memuat direktori anggota...</span>
          </div>
        </div>
      }
    >
      <NomorAnggotaContent />
    </Suspense>
  );
}
