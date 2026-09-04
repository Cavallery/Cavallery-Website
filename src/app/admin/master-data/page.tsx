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
  kategoriPengeluaran: string[];
  tahunKasAktif: number[];
  jabatanBebasKas: string[];
  tipeRewardKupon: string[];
}

export default function AdminMasterDataPage() {
  const [data, setData] = useState<MasterDataState>({
    divisi: [],
    tipeDonasi: [],
    nominalKas: [],
    nominalDonasi: [],
    platforms: [],
    defaultNominalKas: 15000,
    kategoriPengeluaran: [],
    tahunKasAktif: [2024, 2025, 2026, 2027, 2028, 2029],
    jabatanBebasKas: ["Admin Fanbase", "Pengurus Fanbase"],
    tipeRewardKupon: [],
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
  const [newKategoriPengeluaran, setNewKategoriPengeluaran] = useState("");
  const [newTahunKas, setNewTahunKas] = useState("");
  const [newJabatanBebas, setNewJabatanBebas] = useState("");
  const [editDefaultNominal, setEditDefaultNominal] = useState("");

  // State Pengaturan Master War Tiket & Template E-Ticket
  const [warEvent, setWarEvent] = useState<{
    id?: number;
    judul: string;
    kodeTiket: string;
    subjudul: string;
    lokasiEvent: string;
    tanggalEvent: string;
    kategoriTiket: string;
    deskripsi: string;
    kuotaTotal: number;
    waktuBuka: string;
    waktuTutup: string;
    status: string;
    syaratKetentuan: string;
  }>({
    judul: "War Tiket Project STS Erine 19th",
    kodeTiket: "STS19",
    subjudul: "Cavallery • Official Fanbase Erine JKT48",
    lokasiEvent: "Theater JKT48, fX Sudirman Lt. 4",
    tanggalEvent: "Sabtu, 26 September 2026 • 19.00 WIB",
    kategoriTiket: "OFFICIAL VIP PASS • TEAM PASSION",
    deskripsi: "Akses khusus project perayaan Seitansai Catherina Vallencia (Erine) ke-19 bersama Cavallery Team Passion.",
    kuotaTotal: 50,
    waktuBuka: "",
    waktuTutup: "",
    status: "buka",
    syaratKetentuan: "1. Wajib memiliki akun anggota Cavallery aktif.\n2. 1 Akun anggota hanya dapat mengklaim maksimal 1 tiket.\n3. Tiket tidak dapat dipindahtangankan tanpa konfirmasi admin.",
  });
  const [savingWarEvent, setSavingWarEvent] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/master-data");
      if (res.status === 401) {
        window.location.replace("/admin");
        return;
      }
      const json = await res.json();
      if (json.status && json.data) {
        setData({
          divisi: json.data.divisi || [],
          tipeDonasi: json.data.tipeDonasi || [],
          nominalKas: json.data.nominalKas || [],
          nominalDonasi: json.data.nominalDonasi || [],
          platforms: json.data.platforms || [],
          defaultNominalKas: json.data.defaultNominalKas || 15000,
          kategoriPengeluaran: json.data.kategoriPengeluaran || [
            "Operasional Fanbase",
            "Event / Project Show",
            "Konsumsi Tim",
            "Website & Server",
            "Produksi Merchandise",
            "Banner & Handbanner",
            "Dokumentasi & Media",
            "Lain-lain",
          ],
          tahunKasAktif: json.data.tahunKasAktif || [
            2024, 2025, 2026, 2027, 2028, 2029,
          ],
          jabatanBebasKas: json.data.jabatanBebasKas || [
            "Admin Fanbase",
            "Pengurus Fanbase",
          ],
          tipeRewardKupon: json.data.tipeRewardKupon || [
            "Diskon Merchandise",
            "Potongan Iuran Kas",
            "Photocard / Goodies",
            "Undian Tiket Show",
            "Akses Event Eksklusif",
            "Lainnya",
          ],
        });
        setEditDefaultNominal(
          Number(json.data.defaultNominalKas || 15000).toLocaleString("id-ID"),
        );
      }

      // Fetch War Tiket Event Data
      try {
        const warRes = await fetch("/api/admin/war-tiket");
        if (warRes.ok) {
          const warJson = await warRes.json();
          if (warJson.status && warJson.data?.event) {
            const ev = warJson.data.event;
            const formatForInput = (dtStr: string) => {
              if (!dtStr) return "";
              const d = new Date(dtStr);
              if (isNaN(d.getTime())) return "";
              const pad = (n: number) => String(n).padStart(2, "0");
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };

            setWarEvent({
              id: ev.id,
              judul: ev.judul || "",
              kodeTiket: ev.kode_tiket || "STS19",
              subjudul: ev.subjudul || "Cavallery • Official Fanbase Erine JKT48",
              lokasiEvent: ev.lokasi_event || "Theater JKT48, fX Sudirman Lt. 4",
              tanggalEvent: ev.tanggal_event || "Sabtu, 26 September 2026 • 19.00 WIB",
              kategoriTiket: ev.kategori_tiket || "OFFICIAL VIP PASS • TEAM PASSION",
              deskripsi: ev.deskripsi || "",
              kuotaTotal: Number(ev.kuota_total) || 50,
              waktuBuka: formatForInput(ev.waktu_buka),
              waktuTutup: formatForInput(ev.waktu_tutup),
              status: ev.status || "buka",
              syaratKetentuan: ev.syarat_ketentuan || "",
            });
          }
        }
      } catch (err) {
        console.error("Fetch war event error in master data:", err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWarEvent(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/war-tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(warEvent),
      });
      const json = await res.json();
      if (json.status) {
        setMsg("✓ Pengaturan Event & Template Kode Tiket War berhasil disimpan!");
        setTimeout(() => setMsg(""), 5000);
      } else {
        alert(json.message || "Gagal menyimpan pengaturan tiket");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSavingWarEvent(false);
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

  // Helper Divisi
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

  // Helper Tipe Donasi
  const addTipeDonasi = () => {
    if (!newTipeDonasi.trim()) return;
    if (data.tipeDonasi.includes(newTipeDonasi.trim())) {
      alert("Tipe donasi sudah ada!");
      return;
    }
    const updated = {
      ...data,
      tipeDonasi: [...data.tipeDonasi, newTipeDonasi.trim()],
    };
    setData(updated);
    setNewTipeDonasi("");
    handleSave(updated);
  };
  const removeTipeDonasi = (item: string) => {
    if (!confirm(`Hapus tipe donasi "${item}"?`)) return;
    const updated = {
      ...data,
      tipeDonasi: data.tipeDonasi.filter((t) => t !== item),
    };
    setData(updated);
    handleSave(updated);
  };

  // Helper Nominal Kas
  const addNominalKas = () => {
    const val = parseInt(newNominalKas.replace(/\D/g, ""), 10);
    if (!val || isNaN(val)) return;
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
    if (!confirm(`Hapus pilihan nominal Rp ${val.toLocaleString("id-ID")}?`))
      return;
    const updated = {
      ...data,
      nominalKas: data.nominalKas.filter((n) => n !== val),
    };
    setData(updated);
    handleSave(updated);
  };

  // Helper Nominal Donasi
  const addNominalDonasi = () => {
    const val = parseInt(newNominalDonasi.replace(/\D/g, ""), 10);
    if (!val || isNaN(val)) return;
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
    if (!confirm(`Hapus pilihan nominal Rp ${val.toLocaleString("id-ID")}?`))
      return;
    const updated = {
      ...data,
      nominalDonasi: data.nominalDonasi.filter((n) => n !== val),
    };
    setData(updated);
    handleSave(updated);
  };

  // Helper Platform
  const addPlatform = () => {
    if (!newPlatform.trim()) return;
    if (data.platforms.includes(newPlatform.trim())) {
      alert("Platform sudah ada!");
      return;
    }
    const updated = {
      ...data,
      platforms: [...data.platforms, newPlatform.trim()],
    };
    setData(updated);
    setNewPlatform("");
    handleSave(updated);
  };
  const removePlatform = (item: string) => {
    if (!confirm(`Hapus platform "${item}"?`)) return;
    const updated = {
      ...data,
      platforms: data.platforms.filter((p) => p !== item),
    };
    setData(updated);
    handleSave(updated);
  };

  // Helper Kategori Pengeluaran
  const addKategoriPengeluaran = () => {
    if (!newKategoriPengeluaran.trim()) return;
    if (data.kategoriPengeluaran.includes(newKategoriPengeluaran.trim())) {
      alert("Kategori pengeluaran sudah ada!");
      return;
    }
    const updated = {
      ...data,
      kategoriPengeluaran: [
        ...data.kategoriPengeluaran,
        newKategoriPengeluaran.trim(),
      ],
    };
    setData(updated);
    setNewKategoriPengeluaran("");
    handleSave(updated);
  };
  const removeKategoriPengeluaran = (item: string) => {
    if (!confirm(`Hapus kategori pengeluaran "${item}"?`)) return;
    const updated = {
      ...data,
      kategoriPengeluaran: data.kategoriPengeluaran.filter((k) => k !== item),
    };
    setData(updated);
    handleSave(updated);
  };

  // Helper Tahun Kas Aktif
  const addTahunKas = () => {
    const val = parseInt(newTahunKas.replace(/\D/g, ""), 10);
    if (!val || val < 2020 || val > 2040) {
      alert("Masukkan tahun valid (2020-2040)");
      return;
    }
    if (data.tahunKasAktif.includes(val)) {
      alert("Tahun sudah ada!");
      return;
    }
    const updated = {
      ...data,
      tahunKasAktif: [...data.tahunKasAktif, val].sort((a, b) => a - b),
    };
    setData(updated);
    setNewTahunKas("");
    handleSave(updated);
  };
  const removeTahunKas = (val: number) => {
    if (!confirm(`Hapus tahun ${val} dari matriks kas?`)) return;
    const updated = {
      ...data,
      tahunKasAktif: data.tahunKasAktif.filter((y) => y !== val),
    };
    setData(updated);
    handleSave(updated);
  };

  // Helper Jabatan Bebas Kas
  const addJabatanBebas = () => {
    if (!newJabatanBebas.trim()) return;
    if (data.jabatanBebasKas.includes(newJabatanBebas.trim())) {
      alert("Jabatan sudah ada!");
      return;
    }
    const updated = {
      ...data,
      jabatanBebasKas: [...data.jabatanBebasKas, newJabatanBebas.trim()],
    };
    setData(updated);
    setNewJabatanBebas("");
    handleSave(updated);
  };
  const removeJabatanBebas = (item: string) => {
    if (!confirm(`Hapus jabatan bebas iuran "${item}"?`)) return;
    const updated = {
      ...data,
      jabatanBebasKas: data.jabatanBebasKas.filter((j) => j !== item),
    };
    setData(updated);
    handleSave(updated);
  };

  // Helper Tipe Reward Kupon
  const addTipeReward = () => {
    if (!newTipeReward.trim()) return;
    if (data.tipeRewardKupon.includes(newTipeReward.trim())) {
      alert("Tipe reward sudah ada!");
      return;
    }
    const updated = {
      ...data,
      tipeRewardKupon: [...data.tipeRewardKupon, newTipeReward.trim()],
    };
    setData(updated);
    setNewTipeReward("");
    handleSave(updated);
  };
  const removeTipeReward = (item: string) => {
    if (!confirm(`Hapus tipe reward "${item}"?`)) return;
    const updated = {
      ...data,
      tipeRewardKupon: data.tipeRewardKupon.filter((t) => t !== item),
    };
    setData(updated);
    handleSave(updated);
  };

  // Save Default Nominal Kas
  const handleSaveDefaultKas = () => {
    const val = parseInt(editDefaultNominal.replace(/\D/g, ""), 10);
    if (!val || isNaN(val)) {
      alert("Masukkan nominal valid");
      return;
    }
    const updated = { ...data, defaultNominalKas: val };
    setData(updated);
    handleSave(updated);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* TOP BAR */}
        <div className={styles.topHeader}>
          <div>
            <Link href="/admin" className={styles.backBtn}>
              <i className="bx bx-arrow-back" /> Dashboard Utama
            </Link>
            <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
              Master Data &amp; Konfigurasi Sistem Cavallery
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/kontributor" className={styles.backBtn}>
              <i className="bx bx-heart-circle" /> Kontributor
            </Link>
            <Link href="/admin/kas" className={styles.backBtn}>
              <i className="bx bx-wallet" /> Kas
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* NOTIFICATION */}
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
            {/* ── 0. PENGATURAN MASTER EVENT & TEMPLATE E-TICKET WAR (BARU) ── */}
            <div
              className={styles.sectionCard}
              style={{
                border: "2px solid rgba(201, 168, 76, 0.45)",
                background: "linear-gradient(180deg, rgba(201, 168, 76, 0.05) 0%, rgba(20, 16, 12, 0.4) 100%)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <div className={styles.sectionHeader} style={{ marginBottom: 12 }}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ color: "var(--gold)", fontSize: "1.25rem" }}>
                    <i className="bx bx-confirmation" style={{ color: "var(--gold)", fontSize: "1.4rem" }} />
                    Pengaturan Master Event &amp; Template E-Ticket War
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginTop: 2 }}>
                    Kustomisasi nama event tiket, kode unik tiket (dapat diubah dari STS19 ke kode event lain), kuota, venue acara, dan jadwal war tiket.
                  </p>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    background: warEvent.status === "buka" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    border: `1px solid ${warEvent.status === "buka" ? "#10b981" : "#ef4444"}`,
                    color: warEvent.status === "buka" ? "#10b981" : "#ef4444",
                    textTransform: "uppercase",
                  }}
                >
                  Status: {warEvent.status}
                </span>
              </div>

              <form onSubmit={handleSaveWarEvent} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                  {/* Nama Event / Judul Tiket */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      Judul / Nama Event Tiket:
                    </label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      value={warEvent.judul}
                      onChange={(e) => setWarEvent({ ...warEvent, judul: e.target.value })}
                      placeholder="Contoh: War Tiket Project STS Erine 19th"
                      required
                    />
                  </div>

                  {/* Kode Prefix Tiket (Bisa Diubah!) */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--gold)" }}>
                        Kode Prefix Tiket (Nomor Tiket):
                      </label>
                      <span style={{ fontSize: "0.72rem", color: "var(--fg-muted)" }}>
                        Contoh: <strong>STS19</strong>, <strong>ERINE19</strong>, <strong>PASSION</strong>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="text"
                        className={styles.modalInput}
                        style={{ fontWeight: 800, letterSpacing: "0.08em", color: "var(--gold)" }}
                        value={warEvent.kodeTiket}
                        onChange={(e) => setWarEvent({ ...warEvent, kodeTiket: e.target.value.toUpperCase() })}
                        placeholder="STS19"
                        required
                      />
                      <div
                        style={{
                          padding: "8px 14px",
                          borderRadius: 10,
                          background: "rgba(201, 168, 76, 0.12)",
                          border: "1px dashed var(--gold)",
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          color: "var(--gold)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Preview: #{warEvent.kodeTiket || "STS19"}-001
                      </div>
                    </div>
                  </div>

                  {/* Subjudul / Tema Acara */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      Subjudul / Tema Acara:
                    </label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      value={warEvent.subjudul}
                      onChange={(e) => setWarEvent({ ...warEvent, subjudul: e.target.value })}
                      placeholder="Contoh: Cavallery • Official Fanbase Erine JKT48"
                    />
                  </div>

                  {/* Kategori / Level Tiket */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      Kategori / Badge Tiket:
                    </label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      value={warEvent.kategoriTiket}
                      onChange={(e) => setWarEvent({ ...warEvent, kategoriTiket: e.target.value })}
                      placeholder="Contoh: OFFICIAL VIP PASS • TEAM PASSION"
                    />
                  </div>

                  {/* Lokasi / Venue Acara */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      <i className="bx bx-map-pin" style={{ color: "var(--gold)", marginRight: 4 }} />
                      Lokasi / Venue Acara:
                    </label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      value={warEvent.lokasiEvent}
                      onChange={(e) => setWarEvent({ ...warEvent, lokasiEvent: e.target.value })}
                      placeholder="Contoh: Theater JKT48, fX Sudirman Lt. 4"
                    />
                  </div>

                  {/* Tanggal & Waktu Acara */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      <i className="bx bx-calendar" style={{ color: "var(--gold)", marginRight: 4 }} />
                      Tanggal &amp; Waktu Pelaksanaan Acara:
                    </label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      value={warEvent.tanggalEvent}
                      onChange={(e) => setWarEvent({ ...warEvent, tanggalEvent: e.target.value })}
                      placeholder="Contoh: Sabtu, 26 September 2026 • 19.00 WIB"
                    />
                  </div>

                  {/* Kuota Total */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      <i className="bx bx-group" style={{ color: "var(--gold)", marginRight: 4 }} />
                      Kuota Tiket Tersedia:
                    </label>
                    <input
                      type="number"
                      min="1"
                      className={styles.modalInput}
                      value={warEvent.kuotaTotal}
                      onChange={(e) => setWarEvent({ ...warEvent, kuotaTotal: Number(e.target.value) || 1 })}
                      required
                    />
                  </div>

                  {/* Status War */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      Status Ketersediaan War:
                    </label>
                    <select
                      className={styles.modalInput}
                      value={warEvent.status}
                      onChange={(e) => setWarEvent({ ...warEvent, status: e.target.value })}
                    >
                      <option value="buka">Buka (Aktif &amp; Dapat Diwar)</option>
                      <option value="tutup">Tutup (Ditutup Sementara/Permanen)</option>
                      <option value="draft">Draft (Disembunyikan)</option>
                    </select>
                  </div>

                  {/* Waktu Buka War */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      <i className="bx bx-time" style={{ color: "var(--gold)", marginRight: 4 }} />
                      Waktu Mulai Dibuka (Countdown):
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.modalInput}
                      value={warEvent.waktuBuka}
                      onChange={(e) => setWarEvent({ ...warEvent, waktuBuka: e.target.value })}
                      required
                    />
                  </div>

                  {/* Waktu Tutup War */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                      <i className="bx bx-time-five" style={{ color: "var(--gold)", marginRight: 4 }} />
                      Waktu Ditutup (Batas Akhir War):
                    </label>
                    <input
                      type="datetime-local"
                      className={styles.modalInput}
                      value={warEvent.waktuTutup}
                      onChange={(e) => setWarEvent({ ...warEvent, waktuTutup: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Deskripsi Singkat */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                    Deskripsi Ringkas Event:
                  </label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={warEvent.deskripsi}
                    onChange={(e) => setWarEvent({ ...warEvent, deskripsi: e.target.value })}
                    placeholder="Deskripsi singkat yang tampil pada banner war tiket..."
                  />
                </div>

                {/* Syarat & Ketentuan */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                    Syarat &amp; Ketentuan War Tiket:
                  </label>
                  <textarea
                    className={styles.modalInput}
                    rows={3}
                    style={{ resize: "vertical" }}
                    value={warEvent.syaratKetentuan}
                    onChange={(e) => setWarEvent({ ...warEvent, syaratKetentuan: e.target.value })}
                    placeholder="Tuliskan syarat dan aturan klaim tiket..."
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                  <button
                    type="submit"
                    disabled={savingWarEvent}
                    className={styles.btnCreate}
                    style={{
                      background: "linear-gradient(135deg, #d4af37 0%, #b45309 100%)",
                      color: "#000",
                      fontWeight: 800,
                      padding: "10px 24px",
                      borderRadius: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      border: "none",
                      boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)",
                    }}
                  >
                    {savingWarEvent ? (
                      <>
                        <i className="bx bx-loader-alt bx-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-save" /> Simpan Pengaturan &amp; Kode E-Tiket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ── 1. KATEGORI PENGELUARAN KAS (BARU DITAMBAHKAN) ── */}
            <div
              className={styles.sectionCard}
              style={{ border: "1.5px solid rgba(225, 29, 72, 0.3)" }}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-receipt" style={{ color: "#e11d48" }} />
                  Kategori Pengeluaran Kas Operasional (
                  {data.kategoriPengeluaran.length})
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--fg-muted)",
                  marginTop: -6,
                  marginBottom: 14,
                }}
              >
                Pilihan kategori belanja operasional fanbase saat mencatat
                pengeluaran di halaman kas.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {data.kategoriPengeluaran.map((kat) => (
                  <span
                    key={kat}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(225, 29, 72, 0.1)",
                      border: "1px solid rgba(225, 29, 72, 0.3)",
                      color: "#e11d48",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-tag" style={{ fontSize: "0.9rem" }} />
                    {kat}
                    <button
                      type="button"
                      onClick={() => removeKategoriPengeluaran(kat)}
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
                      <i
                        className="bx bx-x-circle"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, maxWidth: 380 }}>
                <input
                  type="text"
                  placeholder="Kategori baru (cth: Banner & Project)..."
                  className={styles.modalInput}
                  value={newKategoriPengeluaran}
                  onChange={(e) => setNewKategoriPengeluaran(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && addKategoriPengeluaran()
                  }
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addKategoriPengeluaran}
                  disabled={saving || !newKategoriPengeluaran.trim()}
                  style={{
                    background: "#e11d48",
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>

            {/* ── 2. BESARAN IURAN KAS WAJIB & TAHUN AKTIF ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {/* Besaran Kas Wajib */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <i className="bx bx-money" style={{ color: "#10b981" }} />
                    Tarif Iuran Kas Wajib Bulanan
                  </h2>
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--fg-muted)",
                    marginTop: -6,
                    marginBottom: 14,
                  }}
                >
                  Standar nominal kewajiban iuran kas anggota per 1 bulan
                  (digunakan dalam pelacak tagihan kas).
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    maxWidth: 340,
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontWeight: 700,
                        color: "var(--fg-muted)",
                      }}
                    >
                      Rp
                    </span>
                    <input
                      type="text"
                      className={styles.modalInput}
                      style={{ paddingLeft: 38 }}
                      value={editDefaultNominal}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setEditDefaultNominal(
                          digits ? Number(digits).toLocaleString("id-ID") : "",
                        );
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSaveDefaultKas()
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.btnCreate}
                    onClick={handleSaveDefaultKas}
                    disabled={saving}
                  >
                    Simpan
                  </button>
                </div>
              </div>

              {/* Tahun Aktif Matriks Kas */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <i
                      className="bx bx-calendar"
                      style={{ color: "var(--gold)" }}
                    />
                    Tahun Aktif Matriks Kas ({data.tahunKasAktif.length})
                  </h2>
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--fg-muted)",
                    marginTop: -6,
                    marginBottom: 14,
                  }}
                >
                  Tahun yang didukung pada pemilih tahun matriks kas dan tab
                  Google Spreadsheet.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  {data.tahunKasAktif.map((yr) => (
                    <span
                      key={yr}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 50,
                        background: "rgba(201, 168, 76, 0.12)",
                        border: "1px solid rgba(201, 168, 76, 0.3)",
                        color: "var(--gold)",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                      }}
                    >
                      {yr}
                      {data.tahunKasAktif.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTahunKas(yr)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                          }}
                        >
                          <i
                            className="bx bx-x-circle"
                            style={{ fontSize: "1rem" }}
                          />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, maxWidth: 260 }}>
                  <input
                    type="number"
                    placeholder="Tambah Tahun (cth: 2030)"
                    className={styles.modalInput}
                    value={newTahunKas}
                    onChange={(e) => setNewTahunKas(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTahunKas()}
                  />
                  <button
                    type="button"
                    className={styles.btnCreate}
                    onClick={addTahunKas}
                    disabled={saving || !newTahunKas}
                  >
                    <i className="bx bx-plus" /> Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* ── 3. JABATAN BEBAS IURAN KAS ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i
                    className="bx bx-user-check"
                    style={{ color: "#3b82f6" }}
                  />
                  Jabatan Bebas Iuran Kas Wajib ({data.jabatanBebasKas.length})
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--fg-muted)",
                  marginTop: -6,
                  marginBottom: 14,
                }}
              >
                Anggota yang memiliki role jabatan ini secara otomatis
                dibebaskan dari kewajiban iuran kas bulanan.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {data.jabatanBebasKas.map((jab) => (
                  <span
                    key={jab}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      color: "#3b82f6",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-award" />
                    {jab}
                    <button
                      type="button"
                      onClick={() => removeJabatanBebas(jab)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      <i
                        className="bx bx-x-circle"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, maxWidth: 360 }}>
                <input
                  type="text"
                  placeholder="Nama jabatan (cth: Dewan Penasehat)..."
                  className={styles.modalInput}
                  value={newJabatanBebas}
                  onChange={(e) => setNewJabatanBebas(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addJabatanBebas()}
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addJabatanBebas}
                  disabled={saving || !newJabatanBebas.trim()}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>

            {/* ── 4. MASTER DIVISI ADMIN FANBASE ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i
                    className="bx bx-shield-quarter"
                    style={{ color: "var(--primary)" }}
                  />
                  Divisi Admin Fanbase ({data.divisi.length})
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--fg-muted)",
                  marginTop: -6,
                  marginBottom: 14,
                }}
              >
                Divisi ini akan muncul di dropdown saat memilih role{" "}
                <strong>Admin Fanbase</strong> di tabel Keanggotaan &amp; form
                user.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {data.divisi.map((div) => (
                  <span
                    key={div}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(201, 168, 76, 0.12)",
                      border: "1px solid rgba(201, 168, 76, 0.3)",
                      color: "var(--primary)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i
                      className="bx bx-check-shield"
                      style={{ fontSize: "0.9rem" }}
                    />
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
                      <i
                        className="bx bx-x-circle"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, maxWidth: 360 }}>
                <input
                  type="text"
                  placeholder="Nama Divisi Baru..."
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

            {/* ── 5. MASTER TIPE DONASI ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i
                    className="bx bx-donate-heart"
                    style={{ color: "var(--gold)" }}
                  />
                  Pilihan Tipe Donasi &amp; Project ({data.tipeDonasi.length})
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--fg-muted)",
                  marginTop: -6,
                  marginBottom: 14,
                }}
              >
                Kategori project yang dapat dipilih donatur/anggota saat
                melakukan donasi.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {data.tipeDonasi.map((tipe) => (
                  <span
                    key={tipe}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(201, 168, 76, 0.12)",
                      border: "1px solid rgba(201, 168, 76, 0.3)",
                      color: "var(--gold)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-gift" style={{ fontSize: "0.9rem" }} />
                    {tipe}
                    <button
                      type="button"
                      onClick={() => removeTipeDonasi(tipe)}
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
                      title="Hapus Tipe"
                    >
                      <i
                        className="bx bx-x-circle"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, maxWidth: 360 }}>
                <input
                  type="text"
                  placeholder="Nama Project / Tipe Donasi Baru..."
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

            {/* ── 6. MASTER PLATFORM KONTAK ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-share-alt" style={{ color: "#8b5cf6" }} />
                  Pilihan Platform Kontak ({data.platforms.length})
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--fg-muted)",
                  marginTop: -6,
                  marginBottom: 14,
                }}
              >
                Platform kontak yang tersedia di form pendaftaran anggota &amp;
                kontributor (LINE, X, Instagram, TikTok, dll).
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
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
                      <i
                        className="bx bx-x-circle"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </button>
                  </span>
                ))}
              </div>

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

            {/* ── 7. MASTER TIPE REWARD KUPON KAS ── */}
            <div
              className={styles.sectionCard}
              style={{ border: "1.5px solid rgba(139, 92, 246, 0.3)" }}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <i className="bx bx-gift" style={{ color: "#8b5cf6" }} />
                  Pilihan Tipe Reward Kupon Kas ({data.tipeRewardKupon.length})
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--fg-muted)",
                  marginTop: -6,
                  marginBottom: 14,
                }}
              >
                Pilihan reward / hadiah apresiasi kas yang tersedia saat admin
                membuat kupon reward untuk anggota yang rajin bayar kas.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {data.tipeRewardKupon.map((rew) => (
                  <span
                    key={rew}
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
                    <i className="bx bx-award" style={{ fontSize: "0.9rem" }} />
                    {rew}
                    <button
                      type="button"
                      onClick={() => removeTipeReward(rew)}
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
                      title="Hapus Tipe Reward"
                    >
                      <i
                        className="bx bx-x-circle"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, maxWidth: 380 }}>
                <input
                  type="text"
                  placeholder="Tipe reward baru (cth: Voucher Tiket Event)..."
                  className={styles.modalInput}
                  value={newTipeReward}
                  onChange={(e) => setNewTipeReward(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTipeReward()}
                />
                <button
                  type="button"
                  className={styles.btnCreate}
                  onClick={addTipeReward}
                  disabled={saving || !newTipeReward.trim()}
                  style={{
                    background: "#8b5cf6",
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>
            {/* ── 8. MASTER NOMINAL KAS (KELIPATAN IURAN KAS 1 - 12 BULAN) ── */}
            <div
              className={styles.sectionCard}
              style={{ border: "1.5px solid rgba(16, 185, 129, 0.3)" }}
            >
              <div
                className={styles.sectionHeader}
                style={{ flexWrap: "wrap", gap: 10 }}
              >
                <div>
                  <h2 className={styles.sectionTitle}>
                    <i className="bx bx-wallet" style={{ color: "#10b981" }} />
                    Pilihan Nominal Iuran Kas ({data.nominalKas.length})
                  </h2>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--fg-muted)",
                      marginTop: 2,
                    }}
                  >
                    Pilihan tombol cepat (chips) kelipatan kas 1 s/d 12 bulan di
                    portal kas anggota &amp; form bayar kas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const default12 = [
                      15000, 30000, 45000, 60000, 75000, 90000, 105000, 120000,
                      135000, 150000, 165000, 180000,
                    ];
                    const updated = { ...data, nominalKas: default12 };
                    setData(updated);
                    handleSave(updated);
                  }}
                  className={styles.btnSecondary}
                  style={{
                    fontSize: "0.78rem",
                    padding: "6px 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title="Reset pilihan nominal ke standar 1-12 bulan (15.000 s/d 180.000)"
                >
                  <i className="bx bx-reset" /> Reset 1 - 12 Bulan (15k - 180k)
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {data.nominalKas.map((nom) => {
                  const m = Math.round(nom / 15000);
                  const mLabel =
                    m === 1
                      ? "1 Bulan"
                      : m === 6
                        ? "6 Bulan (1/2 Thn)"
                        : m === 12
                          ? "12 Bulan (1 Thn)"
                          : `${m} Bulan`;

                  return (
                    <span
                      key={nom}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 50,
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#10b981",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      <i
                        className="bx bx-check-circle"
                        style={{ fontSize: "0.9rem" }}
                      />
                      Rp {nom.toLocaleString("id-ID")}{" "}
                      <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>
                        ({mLabel})
                      </span>
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
                        title={`Hapus Rp ${nom.toLocaleString("id-ID")}`}
                      >
                        <i
                          className="bx bx-x-circle"
                          style={{ fontSize: "1.1rem" }}
                        />
                      </button>
                    </span>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10, maxWidth: 380 }}>
                <input
                  type="text"
                  placeholder="Nominal kas baru (cth: 195000)..."
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
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  <i className="bx bx-plus" /> Tambah
                </button>
              </div>
            </div>

            {/* ── 9. MASTER NOMINAL DONASI (CHIPS CEPAT DONASI) ── */}
            <div
              className={styles.sectionCard}
              style={{ border: "1.5px solid rgba(245, 158, 11, 0.3)" }}
            >
              <div
                className={styles.sectionHeader}
                style={{ flexWrap: "wrap", gap: 10 }}
              >
                <div>
                  <h2 className={styles.sectionTitle}>
                    <i className="bx bx-heart" style={{ color: "#f59e0b" }} />
                    Pilihan Nominal Donasi ({data.nominalDonasi.length})
                  </h2>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--fg-muted)",
                      marginTop: 2,
                    }}
                  >
                    Pilihan tombol cepat (chips) nominal donasi di halaman
                    donasi publik &amp; portal kas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const defaultDonasi = [
                      10000, 25000, 50000, 100000, 250000, 500000,
                    ];
                    const updated = { ...data, nominalDonasi: defaultDonasi };
                    setData(updated);
                    handleSave(updated);
                  }}
                  className={styles.btnSecondary}
                  style={{
                    fontSize: "0.78rem",
                    padding: "6px 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title="Reset nominal donasi ke default"
                >
                  <i className="bx bx-reset" /> Reset Default (10k - 500k)
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {data.nominalDonasi.map((nom) => (
                  <span
                    key={nom}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#d97706",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="bx bx-heart" style={{ fontSize: "0.9rem" }} />
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
                      title={`Hapus Rp ${nom.toLocaleString("id-ID")}`}
                    >
                      <i
                        className="bx bx-x-circle"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, maxWidth: 380 }}>
                <input
                  type="text"
                  placeholder="Nominal donasi baru (cth: 1000000)..."
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
                  style={{
                    background: "#f59e0b",
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
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
