"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../keanggotaan/page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

interface MasterDataState {
  divisi: string[];
  tipeDonasi: string[];
  nominalKas: number[];
  nominalDonasi: number[];
  platforms: string[];
  defaultNominalKas: number;
}

export default function AdminMasterDataPage() {
  const [data, setData] = useState<MasterDataState>({
    divisi: [],
    tipeDonasi: [],
    nominalKas: [],
    nominalDonasi: [],
    platforms: [],
    defaultNominalKas: 15000,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Input states for new items
  const [newDivisi, setNewDivisi] = useState("");
  const [newTipeDonasi, setNewTipeDonasi] = useState("");
  const [newNominalKas, setNewNominalKas] = useState("");
  const [newNominalDonasi, setNewNominalDonasi] = useState("");
  const [newPlatform, setNewPlatform] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/master-data");
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json();
      if (json.status && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (updatedData: MasterDataState) => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/master-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const json = await res.json();
      if (json.status) {
        setData(json.data);
        setMsg(json.message || "Master data berhasil disimpan!");
      } else {
        alert(json.message || "Gagal menyimpan data");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  // Helper Add / Remove functions
  const addDivisi = () => {
    if (!newDivisi.trim()) return;
    if (data.divisi.includes(newDivisi.trim())) {
      alert("Divisi sudah ada!");
      return;
    }
    const updated = { ...data, divisi: [...data.divisi, newDivisi.trim()] };
    setData(updated);
    setNewDivisi("");
    handleSave(updated);
  };

  const removeDivisi = (item: string) => {
    if (!confirm(`Hapus divisi "${item}"?`)) return;
    const updated = { ...data, divisi: data.divisi.filter((d) => d !== item) };
    setData(updated);
    handleSave(updated);
  };

  const addTipeDonasi = () => {
    if (!newTipeDonasi.trim()) return;
    if (data.tipeDonasi.includes(newTipeDonasi.trim())) {
      alert("Kategori donasi sudah ada!");
      return;
    }
    const updated = { ...data, tipeDonasi: [...data.tipeDonasi, newTipeDonasi.trim()] };
    setData(updated);
    setNewTipeDonasi("");
    handleSave(updated);
  };

  const removeTipeDonasi = (item: string) => {
    if (!confirm(`Hapus kategori donasi "${item}"?`)) return;
    const updated = { ...data, tipeDonasi: data.tipeDonasi.filter((t) => t !== item) };
    setData(updated);
    handleSave(updated);
  };

  const addNominalKas = () => {
    const val = parseInt(newNominalKas.replace(/\D/g, ""), 10);
    if (!val || val <= 0) return;
    if (data.nominalKas.includes(val)) {
      alert("Nominal kas sudah ada!");
      return;
    }
    const updated = {
      ...data,
      nominalKas: [...data.nominalKas, val].sort((a, b) => a - b),
    };
    setData(updated);
    setNewNominalKas("");
    handleSave(updated);
  };

  const removeNominalKas = (val: number) => {
    if (data.nominalKas.length <= 1) {
      alert("Minimal harus ada 1 pilihan nominal kas!");
      return;
    }
    const updated = { ...data, nominalKas: data.nominalKas.filter((n) => n !== val) };
    setData(updated);
    handleSave(updated);
  };

  const addNominalDonasi = () => {
    const val = parseInt(newNominalDonasi.replace(/\D/g, ""), 10);
    if (!val || val <= 0) return;
    if (data.nominalDonasi.includes(val)) {
      alert("Nominal donasi sudah ada!");
      return;
    }
    const updated = {
      ...data,
      nominalDonasi: [...data.nominalDonasi, val].sort((a, b) => a - b),
    };
    setData(updated);
    setNewNominalDonasi("");
    handleSave(updated);
  };

  const removeNominalDonasi = (val: number) => {
    if (data.nominalDonasi.length <= 1) {
      alert("Minimal harus ada 1 pilihan nominal donasi!");
      return;
    }
    const updated = { ...data, nominalDonasi: data.nominalDonasi.filter((n) => n !== val) };
    setData(updated);
    handleSave(updated);
  };

  const addPlatform = () => {
    if (!newPlatform.trim()) return;
    if (data.platforms.includes(newPlatform.trim())) {
      alert("Platform sudah ada!");
      return;
    }
    const updated = { ...data, platforms: [...data.platforms, newPlatform.trim()] };
    setData(updated);
    setNewPlatform("");
    handleSave(updated);
  };

  const removePlatform = (item: string) => {
    if (data.platforms.length <= 1) {
      alert("Minimal harus ada 1 platform kontak!");
      return;
    }
    const updated = { ...data, platforms: data.platforms.filter((p) => p !== item) };
    setData(updated);
    handleSave(updated);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.topHeader}>
          <div>
            <Link href="/admin" className={styles.backBtn}>
              <i className="bx bx-arrow-back" /> Dashboard Utama
            </Link>
            <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
              <i className="bx bx-slider-alt" style={{ color: "var(--primary)", marginRight: 8 }} />
              Master Data & Pengaturan Dropdown
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--fg-muted)" }}>
              Kelola opsi divisi admin fanbase, kategori donasi, nominal cepat, dan platform kontak secara dinamis.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/kontributor" className={styles.backBtn}>
              <i className="bx bx-heart-circle" /> Kontributor
            </Link>
            <Link href="/admin/kas" className={styles.backBtn}>
              <i className="bx bx-wallet" /> Kas
            </Link>
            <Link href="/admin/donasi" className={styles.backBtn}>
              <i className="bx bx-donate-heart" /> Donasi
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
              marginBottom: 16,
            }}
          >
            <i className="bx bx-check-circle" /> {msg}
          </div>
        )}

        {loading ? (
          <div className={styles.emptyBox}>
            <i className="bx bx-loader-alt bx-spin" />
            <p>Memuat master data...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* 1. MASTER DIVISI ADMIN FANBASE */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-shield-quarter" style={{ color: "var(--primary)" }} />
                  Divisi Admin Fanbase ({data.divisi.length})
                </h2>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: -6, marginBottom: 14 }}>
                Divisi ini akan muncul di dropdown saat memilih role <strong>Admin Fanbase</strong> di tabel Keanggotaan & form user.
              </p>

              {/* Tag List */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {data.divisi.map((div) => (
                  <span
                    key={div}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(var(--primary-rgb, 160, 100, 30), 0.12)",
                      border: "1px solid rgba(var(--primary-rgb, 160, 100, 30), 0.3)",
                      color: "var(--primary)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-check-shield" style={{ fontSize: "0.9rem" }} />
                    {div}
                    <button
                      type="button"
                      onClick={() => removeDivisi(div)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Hapus Divisi"
                    >
                      <i className="bx bx-x-circle" style={{ fontSize: "1.1rem" }} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Form Tambah Divisi */}
              <div style={{ display: "flex", gap: 10, maxWidth: 480 }}>
                <input
                  type="text"
                  placeholder="Nama Divisi Baru (cth: Divisi Dokumentasi)"
                  className={styles.modalInput}
                  value={newDivisi}
                  onChange={(e) => setNewDivisi(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDivisi()}
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addDivisi}
                  disabled={saving || !newDivisi.trim()}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>

            {/* 2. MASTER KATEGORI / TIPE DONASI */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-donate-heart" style={{ color: "#e11d48" }} />
                  Kategori / Tipe Donasi & Proyek ({data.tipeDonasi.length})
                </h2>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: -6, marginBottom: 14 }}>
                Pilihan kategori ini akan muncul pada dropdown formulir donasi / kontribusi bagi anggota maupun donatur.
              </p>

              {/* Tag List */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {data.tipeDonasi.map((td) => (
                  <span
                    key={td}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(225, 29, 72, 0.12)",
                      border: "1px solid rgba(225, 29, 72, 0.3)",
                      color: "#e11d48",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-gift" style={{ fontSize: "0.9rem" }} />
                    {td}
                    <button
                      type="button"
                      onClick={() => removeTipeDonasi(td)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Hapus Kategori"
                    >
                      <i className="bx bx-x-circle" style={{ fontSize: "1.1rem" }} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Form Tambah Kategori Donasi */}
              <div style={{ display: "flex", gap: 10, maxWidth: 480 }}>
                <input
                  type="text"
                  placeholder="Kategori Donasi Baru (cth: Project Handshake)"
                  className={styles.modalInput}
                  value={newTipeDonasi}
                  onChange={(e) => setNewTipeDonasi(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTipeDonasi()}
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addTipeDonasi}
                  disabled={saving || !newTipeDonasi.trim()}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>

            {/* 3. MASTER CHIP NOMINAL CEPAT KAS */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-money" style={{ color: "#10b981" }} />
                  Pilihan Nominal Cepat Kas (Chip Kas)
                </h2>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: -6, marginBottom: 14 }}>
                Tombol cepat nominal yang muncul di formulir bayar kas anggota di portal `/cavallery-kas`.
              </p>

              {/* Tag List */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {data.nominalKas.map((nom) => (
                  <span
                    key={nom}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#10b981",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-wallet" style={{ fontSize: "0.9rem" }} />
                    Rp {nom.toLocaleString("id-ID")}
                    <button
                      type="button"
                      onClick={() => removeNominalKas(nom)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Hapus Nominal"
                    >
                      <i className="bx bx-x-circle" style={{ fontSize: "1.1rem" }} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Form Tambah Nominal Kas */}
              <div style={{ display: "flex", gap: 10, maxWidth: 360 }}>
                <input
                  type="text"
                  placeholder="Nominal baru (cth: 25000)"
                  className={styles.modalInput}
                  value={newNominalKas}
                  onChange={(e) => setNewNominalKas(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNominalKas()}
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addNominalKas}
                  disabled={saving || !newNominalKas.trim()}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>

            {/* 4. MASTER CHIP NOMINAL CEPAT DONASI */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-coin-stack" style={{ color: "var(--gold)" }} />
                  Pilihan Nominal Cepat Donasi (Chip Donasi)
                </h2>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: -6, marginBottom: 14 }}>
                Tombol cepat nominal yang muncul di formulir donasi / kontribusi di portal `/cavallery-kas`.
              </p>

              {/* Tag List */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {data.nominalDonasi.map((nom) => (
                  <span
                    key={nom}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(217, 119, 6, 0.12)",
                      border: "1px solid rgba(217, 119, 6, 0.3)",
                      color: "#d97706",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-coin" style={{ fontSize: "0.9rem" }} />
                    Rp {nom.toLocaleString("id-ID")}
                    <button
                      type="button"
                      onClick={() => removeNominalDonasi(nom)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Hapus Nominal"
                    >
                      <i className="bx bx-x-circle" style={{ fontSize: "1.1rem" }} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Form Tambah Nominal Donasi */}
              <div style={{ display: "flex", gap: 10, maxWidth: 360 }}>
                <input
                  type="text"
                  placeholder="Nominal donasi baru (cth: 150000)"
                  className={styles.modalInput}
                  value={newNominalDonasi}
                  onChange={(e) => setNewNominalDonasi(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNominalDonasi()}
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addNominalDonasi}
                  disabled={saving || !newNominalDonasi.trim()}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>

            {/* 5. MASTER PLATFORM KONTAK */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-share-alt" style={{ color: "#8b5cf6" }} />
                  Pilihan Platform Kontak ({data.platforms.length})
                </h2>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: -6, marginBottom: 14 }}>
                Platform kontak yang tersedia di form pendaftaran anggota & kontributor (LINE, X, Instagram, TikTok, dll).
              </p>

              {/* Tag List */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {data.platforms.map((plat) => (
                  <span
                    key={plat}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(139, 92, 246, 0.12)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      color: "#8b5cf6",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-link" style={{ fontSize: "0.9rem" }} />
                    {plat}
                    <button
                      type="button"
                      onClick={() => removePlatform(plat)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Hapus Platform"
                    >
                      <i className="bx bx-x-circle" style={{ fontSize: "1.1rem" }} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Form Tambah Platform */}
              <div style={{ display: "flex", gap: 10, maxWidth: 360 }}>
                <input
                  type="text"
                  placeholder="Nama Platform Baru (cth: Telegram)"
                  className={styles.modalInput}
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlatform()}
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addPlatform}
                  disabled={saving || !newPlatform.trim()}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
