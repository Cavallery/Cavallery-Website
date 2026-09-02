"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";

const PLATFORMS = [
  "LINE",
  "X (Twitter)",
  "Instagram",
  "TikTok",
  "Discord",
];

const GENDERS = ["Laki-laki", "Perempuan"];

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DONATION_TYPES = [
  "General Support (Kas & Event Erine)",
  "Project Ulang Tahun / Seitansai",
  "Project Bunga & Dukungan Panggung",
  "Project Merchandise & Kreatif Fanbase",
  "Project Media & Ads Support",
];

function getDefaultPeriode() {
  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function formatRupiah(amount?: number) {
  if (!amount) return "Rp 0";
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function CavalleryKasPage() {
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auth View State
  const [authMode, setAuthMode] = useState<"masuk" | "daftar">("masuk");
  const [tipe, setTipe] = useState<"anggota" | "donatur">("anggota");

  // Form Masuk State
  const [loginNoAnggota, setLoginNoAnggota] = useState("");
  const [loginIdLine, setLoginIdLine] = useState("");
  const [loginNamaDonatur, setLoginNamaDonatur] = useState("");
  const [loginKontakDonatur, setLoginKontakDonatur] = useState("");

  // Form Daftar State
  const [regNoAnggota, setRegNoAnggota] = useState("");
  const [regNamaLengkap, setRegNamaLengkap] = useState("");
  const [regIdLine, setRegIdLine] = useState("");
  const [regDisplayLine, setRegDisplayLine] = useState("");
  const [regDiscord, setRegDiscord] = useState("");
  const [regGender, setRegGender] = useState("Laki-laki");
  const [regDomisili, setRegDomisili] = useState("");
  const [regKontakPlatform, setRegKontakPlatform] = useState("X (Twitter)");
  const [regKontakId, setRegKontakId] = useState("");
  const [regNamaDonatur, setRegNamaDonatur] = useState("");
  const [regKontakPlatformDonatur, setRegKontakPlatformDonatur] = useState("X (Twitter)");
  const [regKontakIdDonatur, setRegKontakIdDonatur] = useState("");
  const [regDiscordDonatur, setRegDiscordDonatur] = useState("");

  // Auth feedback
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Registration Open/Close Status
  const [regAnggotaOpen, setRegAnggotaOpen] = useState(true);
  const [regDonaturOpen, setRegDonaturOpen] = useState(true);

  // Logged-in Dashboard State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [portalTab, setPortalTab] = useState<"bayar" | "riwayat" | "donasi">("bayar");
  const [periode, setPeriode] = useState(getDefaultPeriode);
  const [nominalKas, setNominalKas] = useState("15.000");
  const [selectedChipKas, setSelectedChipKas] = useState<number | "custom">(15000);
  const [fileKas, setFileKas] = useState<File | null>(null);
  const [previewKas, setPreviewKas] = useState<string | null>(null);
  const [kasAlert, setKasAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [submittingKas, setSubmittingKas] = useState(false);

  // Avatar Upload State (User Dashboard)
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingUserAvatar, setUploadingUserAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);

  // Kas History & Monthly Matrix Status
  const [kasHistory, setKasHistory] = useState<any[]>([]);
  const [monthlyStatus, setMonthlyStatus] = useState<any[]>([]);
  const [trackerYear, setTrackerYear] = useState<number>(new Date().getFullYear());
  const [loadingKasHistory, setLoadingKasHistory] = useState(false);

  // Donasi State
  const [tipeDonasi, setTipeDonasi] = useState(DONATION_TYPES[0]);
  const [nominalDonasi, setNominalDonasi] = useState("50.000");
  const [selectedChipDonasi, setSelectedChipDonasi] = useState<number | "custom">(50000);
  const [fileDonasi, setFileDonasi] = useState<File | null>(null);
  const [previewDonasi, setPreviewDonasi] = useState<string | null>(null);
  const [donasiAlert, setDonasiAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [submittingDonasi, setSubmittingDonasi] = useState(false);

  // Helper Formatter Pemisah Ribuan Otomatis (15000 -> 15.000)
  const handleNominalKasChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setNominalKas("");
      setSelectedChipKas("custom");
      return;
    }
    const formatted = Number(digits).toLocaleString("id-ID");
    setNominalKas(formatted);
    setSelectedChipKas("custom");
  };

  const handleNominalDonasiChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setNominalDonasi("");
      setSelectedChipDonasi("custom");
      return;
    }
    const formatted = Number(digits).toLocaleString("id-ID");
    setNominalDonasi(formatted);
    setSelectedChipDonasi("custom");
  };

  // Upload Foto Profil User
  const handleUserAvatarUpload = async (file: File) => {
    setUploadingUserAvatar(true);
    setAvatarToast(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.status) {
        throw new Error(uploadJson.message || "Gagal mengunggah foto profil");
      }

      const newPhotoUrl = uploadJson.url;

      // Update di database profil user
      const profileRes = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoProfil: newPhotoUrl }),
      });
      const profileJson = await profileRes.json();
      if (!profileRes.ok || !profileJson.status) {
        throw new Error(profileJson.message || "Gagal menyimpan foto profil");
      }

      setSessionUser((prev: any) => ({
        ...prev,
        fotoProfil: newPhotoUrl,
        foto_profil: newPhotoUrl,
      }));
      setAvatarToast("Foto profil berhasil diperbarui!");
      setTimeout(() => setAvatarToast(null), 4000);
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat mengganti foto profil");
    } finally {
      setUploadingUserAvatar(false);
    }
  };

  // Dynamic Master Data State
  const [donationTypes, setDonationTypes] = useState<string[]>(DONATION_TYPES);
  const [chipNominalsKas, setChipNominalsKas] = useState<number[]>([10000, 15000, 20000, 50000, 100000]);
  const [chipNominalsDonasi, setChipNominalsDonasi] = useState<number[]>([10000, 25000, 50000, 100000, 250000, 500000]);
  const [platformOptions, setPlatformOptions] = useState<string[]>([
    "LINE",
    "X (Twitter)",
    "Instagram",
    "TikTok",
    "Discord",
    "WhatsApp",
  ]);

  // Check registration open/close & auth on mount
  const checkSettings = async () => {
    try {
      const res = await fetch("/api/pengaturan");
      const json = await res.json();
      if (json.status && json.data) {
        setRegAnggotaOpen(json.data.registerAnggotaOpen);
        setRegDonaturOpen(json.data.registerDonaturOpen);
      }
    } catch {}

    try {
      const resMd = await fetch("/api/master-data");
      const jsonMd = await resMd.json();
      if (jsonMd.status && jsonMd.data) {
        if (jsonMd.data.tipeDonasi?.length) {
          setDonationTypes(jsonMd.data.tipeDonasi);
          setTipeDonasi(jsonMd.data.tipeDonasi[0]);
        }
        if (jsonMd.data.nominalKas?.length) setChipNominalsKas(jsonMd.data.nominalKas);
        if (jsonMd.data.nominalDonasi?.length) setChipNominalsDonasi(jsonMd.data.nominalDonasi);
        if (jsonMd.data.platforms?.length) setPlatformOptions(jsonMd.data.platforms);
      }
    } catch {}
  };

  const checkUserSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.status && json.user) {
          setSessionUser(json.user);
          if (json.user.riwayatKas) {
            setKasHistory(json.user.riwayatKas);
          }
        } else {
          setSessionUser(null);
        }
      } else {
        setSessionUser(null);
      }
    } catch {
      setSessionUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkUserSession();
    checkSettings();
  }, []);

  const loadKasHistory = async () => {
    setLoadingKasHistory(true);
    try {
      const res = await fetch("/api/kas");
      const json = await res.json();
      if (json.status) {
        if (json.data) setKasHistory(json.data);
        if (json.monthlyStatus) setMonthlyStatus(json.monthlyStatus);
      }
    } catch {
      console.error("Failed to load kas history");
    } finally {
      setLoadingKasHistory(false);
    }
  };

  useEffect(() => {
    if (sessionUser && portalTab === "riwayat") {
      loadKasHistory();
    }
  }, [portalTab, sessionUser]);

  // Auth: Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      let payload: any = { tipe };
      if (tipe === "anggota") {
        if (!loginNoAnggota.trim() || !loginIdLine.trim()) {
          setAuthError("Nomor Anggota dan ID LINE wajib diisi");
          setAuthLoading(false);
          return;
        }
        payload = { ...payload, noAnggota: loginNoAnggota.trim(), idLine: loginIdLine.trim() };
      } else {
        if (!loginNamaDonatur.trim() || !loginKontakDonatur.trim()) {
          setAuthError("Nama dan ID / Nomor Kontak wajib diisi");
          setAuthLoading(false);
          return;
        }
        payload = { ...payload, nama: loginNamaDonatur.trim(), kontakId: loginKontakDonatur.trim() };
      }

      const res = await fetch("/api/auth/masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        setAuthError(json.message || "Gagal masuk. Periksa kembali data Anda.");
      } else {
        await checkUserSession();
      }
    } catch (err: any) {
      setAuthError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setRegSuccess(null);
    setAuthLoading(true);

    try {
      let payload: any = { tipe };

      if (tipe === "anggota") {
        if (!regNoAnggota.trim() || !regNamaLengkap.trim() || !regIdLine.trim() || !regDomisili.trim() || !regKontakId.trim()) {
          setAuthError("Mohon lengkapi seluruh field bertanda WAJIB (termasuk Nomor Anggota)");
          setAuthLoading(false);
          return;
        }
        payload = {
          ...payload,
          noAnggota: regNoAnggota.trim().toUpperCase(),
          namaLengkap: regNamaLengkap,
          idLine: regIdLine,
          displayLine: regDisplayLine,
          discord: regDiscord,
          gender: regGender,
          domisili: regDomisili,
          kontakPlatform: regKontakPlatform,
          kontakId: regKontakId,
        };
      } else {
        if (!regNamaDonatur.trim() || !regKontakIdDonatur.trim()) {
          setAuthError("Mohon lengkapi Nama dan Kontak bertanda WAJIB");
          setAuthLoading(false);
          return;
        }
        payload = {
          ...payload,
          nama: regNamaDonatur,
          kontakPlatform: regKontakPlatformDonatur,
          kontakId: regKontakIdDonatur,
          discord: regDiscordDonatur,
        };
      }

      const res = await fetch("/api/auth/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        setAuthError(json.message || "Gagal melakukan pendaftaran.");
      } else {
        setRegSuccess(json.message);
      }
    } catch (err: any) {
      setAuthError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/keluar", { method: "POST" });
      setSessionUser(null);
      setAuthMode("masuk");
    } catch {
      setSessionUser(null);
    }
  };

  // Kas: Handle Submit
  const handleKasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKasAlert(null);

    const cleanNominal = parseInt(nominalKas.replace(/\D/g, ""), 10);
    if (!cleanNominal || cleanNominal <= 0) {
      setKasAlert({ type: "error", msg: "Nominal pembayaran tidak valid." });
      return;
    }

    if (!fileKas) {
      setKasAlert({ type: "error", msg: "Mohon unggah screenshot bukti transfer/QRIS." });
      return;
    }

    setSubmittingKas(true);

    try {
      // 1. Upload Bukti
      const formData = new FormData();
      formData.append("file", fileKas);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.status) {
        throw new Error(uploadJson.message || "Gagal mengunggah bukti bayar");
      }

      const buktiBayarUrl = uploadJson.url;

      // 2. Submit Kas
      const kasRes = await fetch("/api/kas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periode,
          nominal: cleanNominal,
          buktiBayarUrl,
        }),
      });

      const kasJson = await kasRes.json();
      if (!kasRes.ok || !kasJson.status) {
        throw new Error(kasJson.message || "Gagal mengirim konfirmasi kas");
      }

      setKasAlert({
        type: "success",
        msg: "Konfirmasi pembayaran kas berhasil dikirim! Menunggu verifikasi admin.",
      });

      setFileKas(null);
      setPreviewKas(null);
      loadKasHistory();
    } catch (err: any) {
      setKasAlert({ type: "error", msg: err.message || "Terjadi kesalahan saat memproses kas." });
    } finally {
      setSubmittingKas(false);
    }
  };

  // Donasi: Handle Submit
  const handleDonasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonasiAlert(null);

    const cleanNominal = parseInt(nominalDonasi.replace(/\D/g, ""), 10);
    if (!cleanNominal || cleanNominal <= 0) {
      setDonasiAlert({ type: "error", msg: "Nominal donasi tidak valid." });
      return;
    }

    if (!fileDonasi) {
      setDonasiAlert({ type: "error", msg: "Mohon unggah screenshot bukti transfer/QRIS." });
      return;
    }

    setSubmittingDonasi(true);

    try {
      const formData = new FormData();
      formData.append("file", fileDonasi);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.status) {
        throw new Error(uploadJson.message || "Gagal mengunggah bukti donasi");
      }

      const buktiBayarUrl = uploadJson.url;

      const donasiRes = await fetch("/api/donasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipeDonasi,
          nominal: cleanNominal,
          buktiBayarUrl,
        }),
      });

      const donasiJson = await donasiRes.json();
      if (!donasiRes.ok || !donasiJson.status) {
        throw new Error(donasiJson.message || "Gagal mengirim konfirmasi donasi");
      }

      setDonasiAlert({
        type: "success",
        msg: "Konfirmasi donasi berhasil dikirim! Terima kasih atas dukungan Anda untuk Erine.",
      });

      setFileDonasi(null);
      setPreviewDonasi(null);
    } catch (err: any) {
      setDonasiAlert({ type: "error", msg: err.message || "Terjadi kesalahan saat memproses donasi." });
    } finally {
      setSubmittingDonasi(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", color: "var(--gold)" }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2.5rem", marginBottom: "12px" }} />
          <p>Memuat portal kas Cavallery...</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // VIEW 1: USER BELUM LOGIN (TAMPILKAN SCREEN MASUK / DAFTAR SESUAI DESAIN)
  // ══════════════════════════════════════════════════════════════════════
  if (!sessionUser) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={`glassCard ${styles.authCard}`}>
            {/* Circular Logo Header */}
            <div className={styles.logoWrap}>
              <img
                src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
                alt="Cavallery Logo"
                className={styles.logoImg}
              />
            </div>

            <h1 className={styles.brandTitle}>Cavallery</h1>

            <div className={styles.subtitleRow}>
              <div className={styles.subtitleLine} />
              <span className={styles.subtitleText}>
                {authMode === "masuk" ? "Masuk" : "Daftar"}
              </span>
              <div className={styles.subtitleLine} />
            </div>

            <p className={styles.instruction}>
              {authMode === "masuk"
                ? "Pilih bagaimana kamu ingin masuk ke portal Cavallery."
                : "Pilih bagaimana kamu ingin bergabung dengan Cavallery."}
            </p>

            {/* Success State After Registration */}
            {regSuccess ? (
              <div className={styles.successBox} style={{ margin: "20px 0" }}>
                <i className={`bx bx-check-circle ${styles.successIcon}`} />
                <h3 className={styles.successTitle}>Pendaftaran Berhasil!</h3>
                <p className={styles.successDesc}>{regSuccess}</p>
                <button
                  type="button"
                  className={styles.submitBtn}
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setAuthMode("masuk");
                    setRegSuccess(null);
                  }}
                >
                  <i className="bx bx-log-in" /> Menuju Halaman Masuk
                </button>
              </div>
            ) : (
              <>
                {/* Mode Switch (Masuk | Daftar) */}
                <div className={styles.modeSwitch}>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${authMode === "masuk" ? styles.modeBtnActive : ""}`}
                    onClick={() => {
                      setAuthMode("masuk");
                      setAuthError("");
                      setRegSuccess(null);
                    }}
                  >
                    <i className="bx bx-log-in" /> Masuk
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${authMode === "daftar" ? styles.modeBtnActive : ""}`}
                    onClick={() => {
                      setAuthMode("daftar");
                      setAuthError("");
                      setRegSuccess(null);
                    }}
                  >
                    <i className="bx bx-user-plus" /> Daftar
                  </button>
                </div>

                {/* Role Switch Pill (Anggota | Kontributor) */}
                <div className={styles.togglePill}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${tipe === "anggota" ? styles.toggleBtnActive : ""}`}
                    onClick={() => {
                      setTipe("anggota");
                      setAuthError("");
                      setRegSuccess(null);
                    }}
                  >
                    <i className="bx bx-user" /> Anggota
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${tipe === "donatur" ? styles.toggleBtnActive : ""}`}
                    onClick={() => {
                      setTipe("donatur");
                      setAuthError("");
                      setRegSuccess(null);
                    }}
                  >
                    <i className="bx bx-heart-circle" /> Kontributor
                  </button>
                </div>

                {/* Error Message */}
                {authError && (
                  <div className={styles.errorBox} style={{ marginBottom: 14 }}>
                    <i className="bx bx-error-circle" /> {authError}
                  </div>
                )}

            {/* ── FORM CONTAINER ── */}
            {authMode === "masuk" ? (
              // ── FORM MASUK / LOGIN ──
              <form onSubmit={handleLoginSubmit} className={styles.form}>
                {tipe === "anggota" ? (
                  <>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Nomor Anggota</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Contoh: CAVA-0001"
                        value={loginNoAnggota}
                        onChange={(e) => setLoginNoAnggota(e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>ID LINE</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="ID LINE terdaftar"
                        value={loginIdLine}
                        onChange={(e) => setLoginIdLine(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Nama Kontributor</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Nama yang Anda daftarkan"
                        value={loginNamaDonatur}
                        onChange={(e) => setLoginNamaDonatur(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>ID Kontak / Username</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="ID LINE / X / WA yang terdaftar"
                        value={loginKontakDonatur}
                        onChange={(e) => setLoginKontakDonatur(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Memeriksa...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-log-in" /> Masuk
                    </>
                  )}
                </button>
              </form>
            ) : ((tipe === "anggota" && !regAnggotaOpen) || (tipe === "donatur" && !regDonaturOpen)) ? (
              // ── KONDISI DAFTAR DITUTUP (TIDAK MENAMPILKAN FORM) ──
              <div className={styles.closedStateWrap}>
                <div className={styles.closedIconBox}>
                  <i className="bx bxs-lock-alt" />
                </div>
                <h3 className={styles.closedStateTitle}>
                  Pendaftaran {tipe === "anggota" ? "Anggota Baru" : "Kontributor"} Sedang Ditutup
                </h3>
                <p className={styles.closedStateDesc}>
                  Mohon maaf, saat ini pendaftaran {tipe === "anggota" ? "anggota baru" : "kontributor"} Cavallery sedang tidak menerima pendaftar baru. Silakan pantau informasi resmi terbaru melalui media sosial kami.
                </p>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setAuthMode("masuk")}
                  style={{ marginTop: 10 }}
                >
                  <i className="bx bx-log-in" /> Kembali ke Halaman Masuk
                </button>
              </div>
            ) : (
              // ── FORM DAFTAR AKTIF ──
              <form onSubmit={handleRegisterSubmit} className={styles.form}>
                {tipe === "anggota" ? (
                  <>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>No Anggota</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="CAVA-0001"
                        value={regNoAnggota}
                        onChange={(e) => setRegNoAnggota(e.target.value.toUpperCase())}
                        required
                      />
                      <span className={styles.hint}>Sesuaikan dengan nomor anggota lama menggunakan format 4 digit.</span>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Nama</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Nama kamu"
                        value={regNamaLengkap}
                        onChange={(e) => setRegNamaLengkap(e.target.value)}
                        required
                      />
                      <span className={styles.hint}>Nama yang biasa kamu gunakan di Cavallery.</span>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>ID LINE</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="ID LINE aktif kamu"
                        value={regIdLine}
                        onChange={(e) => setRegIdLine(e.target.value)}
                        required
                      />
                      <span className={styles.hint}>Masukkan ID LINE yang aktif.</span>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Display Name LINE</label>
                        <span className={styles.badgeOpsional}>OPSIONAL</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Display Name LINE kamu"
                        value={regDisplayLine}
                        onChange={(e) => setRegDisplayLine(e.target.value)}
                      />
                      <span className={styles.hint}>Nama yang tampil di akun LINE kamu.</span>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Username Discord</label>
                        <span className={styles.badgeOpsional}>OPSIONAL</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="username_discord"
                        value={regDiscord}
                        onChange={(e) => setRegDiscord(e.target.value)}
                      />
                      <span className={styles.hint}>Masukkan username Discord kamu.</span>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Gender</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <select
                        className={styles.select}
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Kota Domisili</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Contoh: Jakarta, Surabaya, Bandung"
                        value={regDomisili}
                        onChange={(e) => setRegDomisili(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Kontak</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <div className={styles.inputGroup}>
                        <select
                          className={styles.select}
                          value={regKontakPlatform}
                          onChange={(e) => setRegKontakPlatform(e.target.value)}
                        >
                          {platformOptions.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="ID / Username akun kontak"
                          value={regKontakId}
                          onChange={(e) => setRegKontakId(e.target.value)}
                          required
                        />
                      </div>
                      <span className={styles.hint}>Pilih setidaknya satu akun yang bisa dihubungi.</span>
                    </div>
                  </>
                ) : (
                  // ── Form Kontributor ──
                  <>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Nama Kontributor</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Nama lengkap atau inisial"
                        value={regNamaDonatur}
                        onChange={(e) => setRegNamaDonatur(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Kontak</label>
                        <span className={styles.badgeWajib}>WAJIB</span>
                      </div>
                      <div className={styles.inputGroup}>
                        <select
                          className={styles.select}
                          value={regKontakPlatformDonatur}
                          onChange={(e) => setRegKontakPlatformDonatur(e.target.value)}
                        >
                          {platformOptions.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="ID / No. Kontak"
                          value={regKontakIdDonatur}
                          onChange={(e) => setRegKontakIdDonatur(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>ID / Nama Discord</label>
                        <span className={styles.badgeOpsional}>OPSIONAL</span>
                      </div>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Contoh: user#1234"
                        value={regDiscordDonatur}
                        onChange={(e) => setRegDiscordDonatur(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-user-plus" /> Daftar {tipe === "anggota" ? "Anggota" : "Kontributor"}
                    </>
                  )}
                </button>
              </form>
            )}
              </>
            )}

            <div className={styles.helpText}>
              Jika terjadi kendala, kehilangan, perubahan atau ketidaksesuaian data, dapat menghubungi admin Cavallery.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════
  // VIEW 2: USER SUDAH LOGIN (PORTAL KAS & DONASI CAVALLERY - STYLE GAMBAR 2)
  // ══════════════════════════════════════════════════════════════════════
  const displayName = sessionUser.namaLengkap || sessionUser.nama || "Ksatria";
  const userInitial = displayName.charAt(0).toUpperCase();
  const rawDate = sessionUser.anggotaSejak || sessionUser.createdAt;
  const formattedJoinDate = rawDate
    ? new Date(rawDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "9 Desember 2023";

  return (
    <div className={styles.page}>
      <div className={styles.containerDashboard}>
        {/* Feedback Ganti Foto Profil */}
        {avatarToast && (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              fontWeight: 700,
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <i className="bx bx-check-circle" /> {avatarToast}
          </div>
        )}

        {/* ── TOP MEMBER LUXURY CARD (Style Referensi Gambar 2) ── */}
        <div className={styles.memberCard}>
          <div className={styles.memberCardHeader}>
            <span className={styles.brandBadge}>CAVALLERY</span>
            <span className={styles.memberStatusText}>
              {sessionUser.jabatan === "Admin Fanbase" ? (
                <>
                  <i className="bx bxs-crown" style={{ color: "#f59e0b" }} /> Admin Fanbase {sessionUser.divisi ? `(${sessionUser.divisi})` : ""}
                </>
              ) : (
                <>
                  <i className="bx bxs-circle" style={{ fontSize: "0.5rem" }} />
                  {sessionUser.jabatan && sessionUser.jabatan !== "Anggota"
                    ? sessionUser.jabatan
                    : "Aktif"}
                </>
              )}
            </span>
          </div>

          <div className={styles.memberCardBody}>
            <div className={styles.memberAvatarWrapper}>
              <div
                className={styles.memberAvatarCircle}
                onClick={() => setShowVerifyModal(true)}
                title="Klik untuk melihat Kartu Verifikasi Anggota"
              >
                {sessionUser.fotoProfil || sessionUser.foto_profil ? (
                  <img
                    src={sessionUser.fotoProfil || sessionUser.foto_profil}
                    alt={displayName}
                    className={styles.memberAvatarImg}
                  />
                ) : (
                  userInitial
                )}
              </div>
              <button
                type="button"
                className={styles.avatarEditBadge}
                onClick={(e) => {
                  e.stopPropagation();
                  avatarFileInputRef.current?.click();
                }}
                title="Ganti Foto Profil"
              >
                {uploadingUserAvatar ? (
                  <i className="bx bx-loader-alt bx-spin" />
                ) : (
                  <i className="bx bx-camera" />
                )}
              </button>
              <input
                type="file"
                ref={avatarFileInputRef}
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUserAvatarUpload(file);
                }}
              />
            </div>
            <div className={styles.memberCardDetails}>
              <h2 className={styles.memberNameMain}>{displayName}</h2>
              <p className={styles.memberSubText}>
                {sessionUser.idLine ? `@${sessionUser.idLine}` : sessionUser.kontakId || displayName}
              </p>
              <div
                className={styles.memberCodeRow}
                onClick={() => setShowVerifyModal(true)}
                title="Klik untuk Verifikasi Kartu Anggota"
              >
                <span className={styles.memberCodeText}>
                  {sessionUser.noAnggota || "CAVA-0001"}
                </span>
                <i className={`bx bx-qr-scan ${styles.memberCodeQr}`} />
              </div>
              <span className={styles.memberSinceText}>
                Anggota Sejak: {formattedJoinDate}
              </span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM DUAL-PILL NAVIGATION & LOGOUT (Style Referensi Gambar 2) ── */}
        <div className={styles.navPillsCard}>
          <div className={styles.navPillsRow}>
            <button
              type="button"
              className={`${styles.navPillBtn} ${
                portalTab === "bayar" || portalTab === "riwayat" ? styles.navPillBtnActive : ""
              }`}
              onClick={() => setPortalTab("bayar")}
            >
              <i className="bx bx-wallet" /> Kas
            </button>
            <button
              type="button"
              className={`${styles.navPillBtn} ${portalTab === "donasi" ? styles.navPillBtnActive : ""}`}
              onClick={() => setPortalTab("donasi")}
            >
              <i className="bx bx-donate-heart" /> Donasi
            </button>
          </div>

          <button
            type="button"
            className={styles.logoutOutlineBtn}
            onClick={handleLogout}
            title="Keluar dari sesi akun"
          >
            <i className="bx bx-log-out" /> Keluar Akun
          </button>
        </div>

        {/* ── SUB-TABS ROW FOR KAS / RIWAYAT ── */}
        {(portalTab === "bayar" || portalTab === "riwayat") && (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <div className={styles.modeSwitch} style={{ maxWidth: 360 }}>
              <button
                type="button"
                className={`${styles.modeBtn} ${portalTab === "bayar" ? styles.modeBtnActive : ""}`}
                onClick={() => setPortalTab("bayar")}
              >
                <i className="bx bx-credit-card" /> {sessionUser.jabatan === "Admin Fanbase" ? "Status Kas" : "Bayar Kas"}
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${portalTab === "riwayat" ? styles.modeBtnActive : ""}`}
                onClick={() => setPortalTab("riwayat")}
              >
                <i className="bx bx-history" /> Riwayat Status
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 1: BAYAR KAS (ATAU STATUS BEBAS KAS UNTUK ADMIN FANBASE) ── */}
        {portalTab === "bayar" && (
          sessionUser.jabatan === "Admin Fanbase" ? (
            /* GOLDEN EXEMPTION CARD UNTUK ADMIN FANBASE */
            <div className={`glassCard ${styles.adminExemptionCard}`}>
              <div className={styles.adminCrownIconWrap}>
                <i className="bx bxs-crown" />
              </div>

              <span className={styles.adminExemptionBadge}>
                <i className="bx bxs-crown" style={{ marginRight: 6 }} /> Manajemen & Pengurus Fanbase
              </span>

              <h1 className={styles.adminExemptionTitle}>
                Bebas Iuran Kas Wajib Bulanan
              </h1>

              <div className={styles.adminDivisiBadge}>
                <i className="bx bx-badge-check" />
                <span>Divisi: {sessionUser.divisi || "Tim Inti / Koordinator"}</span>
              </div>

              <p className={styles.adminExemptionQuote}>
                "Terima kasih sebesar-besarnya atas waktu, tenaga, dan dedikasi Anda dalam mengelola & mengembangkan keluarga besar Cavallery untuk Erine. Sebagai pengurus resmi fanbase, Anda dibebaskan dari ketentuan iuran kas bulanan."
              </p>

              <a
                href="/admin/keanggotaan"
                className={styles.adminQuickBtn}
              >
                <i className="bx bxs-dashboard" /> Buka Dashboard Admin Fanbase
              </a>

              <button
                type="button"
                className={styles.adminDonasiLink}
                onClick={() => setPortalTab("donasi")}
              >
                Ingin tetap berpartisipasi donasi sukarela untuk project Erine? Klik di sini
              </button>
            </div>
          ) : (
            /* FORM PEMBAYARAN KAS ANGGOTA REGULER */
            <div className={`glassCard ${styles.dashCard}`}>
              <div className={styles.header}>
                <div className="badge">
                  <i className="bx bx-wallet" /> Kas Keanggotaan
                </div>
                <h1 className={styles.title}>Pembayaran Kas Cavallery</h1>
                <p className={styles.subtitle}>
                  Dukung operasional fanbase dan berbagai proyek kebersamaan untuk Erine.
                </p>
              </div>

            {/* QRIS Container */}
            <div className={styles.qrisWrap}>
              <img
                src="https://images.jkt48connect.com/cavallery/images/2026/09/b50e2fd04a9f4738.jpg"
                alt="QRIS Kas Cavallery"
                className={styles.qrisImg}
              />
              <div className={styles.qrisNote}>
                <i className="bx bx-info-circle" />
                <span>
                  <strong>Catatan:</strong> Pembayaran melebihi kewajiban bulan berjalan akan dianggap sebagai
                  deposit dan mengurangi ketentuan kas bulan berikutnya.
                </span>
              </div>
            </div>

            {/* Kas Feedback Alert */}
            {kasAlert && (
              <div
                className={`${styles.alertBox} ${
                  kasAlert.type === "success" ? styles.alertSuccess : styles.alertError
                }`}
              >
                <i className={`bx ${kasAlert.type === "success" ? "bx-check-circle" : "bx-error-circle"}`} />
                <span>{kasAlert.msg}</span>
              </div>
            )}

            <form onSubmit={handleKasSubmit} className={styles.form}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Periode Kas</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: Agustus 2026"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Nominal Pembayaran (Rp)</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  placeholder="15.000"
                  value={nominalKas}
                  onChange={(e) => handleNominalKasChange(e.target.value)}
                  required
                />
                <div className={styles.chipsRow}>
                  {chipNominalsKas.map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      className={`${styles.chip} ${selectedChipKas === nom ? styles.chipActive : ""}`}
                      onClick={() => {
                        setSelectedChipKas(nom);
                        setNominalKas(nom.toLocaleString("id-ID"));
                      }}
                    >
                      Rp {nom.toLocaleString("id-ID")}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChipKas === "custom" ? styles.chipActive : ""}`}
                    onClick={() => setSelectedChipKas("custom")}
                  >
                    Nominal Lain
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Bukti Transfer / QRIS</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>

                {previewKas ? (
                  <div className={styles.previewWrap}>
                    <img src={previewKas} alt="Preview Bukti Kas" className={styles.previewImg} />
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => {
                        setFileKas(null);
                        setPreviewKas(null);
                      }}
                      title="Hapus gambar"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const sel = e.target.files?.[0];
                        if (sel) {
                          setFileKas(sel);
                          setPreviewKas(URL.createObjectURL(sel));
                        }
                      }}
                      className={styles.fileInput}
                      required
                    />
                    <i className={`bx bx-cloud-upload ${styles.uploadIcon}`} />
                    <p className={styles.uploadText}>Klik atau seret screenshot bukti bayar ke sini</p>
                    <p className={styles.uploadHint}>Format: JPG, PNG, WebP (Maks. 5MB)</p>
                  </div>
                )}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submittingKas}>
                {submittingKas ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" /> Mengirim Konfirmasi...
                  </>
                ) : (
                  <>
                    <i className="bx bx-paper-plane" /> Kirim Konfirmasi Kas
                  </>
                )}
              </button>
            </form>
          </div>
          )
        )}

        {/* ── TAB 2: RIWAYAT STATUS KAS ── */}
        {portalTab === "riwayat" && (
          <div className={`glassCard ${styles.dashCard}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-history" /> Riwayat
              </div>
              <h2 className={styles.title}>Status Pembayaran Kas Anda</h2>
              <p className={styles.subtitle}>Pantau iuran kas bulanan Anda dan daftar konfirmasi kas yang telah dikirimkan.</p>
            </div>

            {/* ── TRACKER IURAN BULANAN MEMBER (2024 - 2029) ── */}
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="bx bx-calendar-check" style={{ color: "var(--gold)", fontSize: "1.2rem" }} />
                  Matriks Iuran Kas Tahun {trackerYear}
                </div>
                <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
                  {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setTrackerYear(y)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: trackerYear === y ? "var(--gold)" : "transparent",
                        color: trackerYear === y ? "#1a1612" : "var(--fg-muted)",
                        fontWeight: trackerYear === y ? 800 : 600,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* 12 Bulan Grid */}
              {(() => {
                let userJoinYear = 2024;
                let userJoinMonth = 1;
                const rawJoinDate = sessionUser?.anggotaSejak || sessionUser?.createdAt;
                if (rawJoinDate) {
                  const jd = new Date(rawJoinDate);
                  if (!isNaN(jd.getTime())) {
                    userJoinYear = jd.getFullYear();
                    userJoinMonth = jd.getMonth() + 1;
                  }
                }

                const isBeforeJoinYear = trackerYear < userJoinYear;
                const isJoinYear = trackerYear === userJoinYear;
                const startRequiredMonth = isJoinYear ? userJoinMonth : isBeforeJoinYear ? 13 : 1;
                const totalRequiredMonths = isBeforeJoinYear ? 0 : isJoinYear ? (12 - userJoinMonth + 1) : 12;
                const totalPaidThisYear = monthlyStatus.filter((s) => Number(s.tahun) === trackerYear && s.status === "diverifikasi").length;

                return (
                  <>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
                      gap: 8,
                    }}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                        const isPaid = monthlyStatus.some((s) => Number(s.tahun) === trackerYear && Number(s.bulan) === m && s.status === "diverifikasi");
                        const isBeforeJoined = isBeforeJoinYear || (isJoinYear && m < userJoinMonth);
                        const monthShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][m - 1];

                        return (
                          <div
                            key={m}
                            style={{
                              padding: "10px 4px",
                              borderRadius: 10,
                              textAlign: "center",
                              background: isPaid ? "rgba(16, 185, 129, 0.12)" : isBeforeJoined ? "rgba(255, 255, 255, 0.01)" : "rgba(255, 255, 255, 0.03)",
                              border: isPaid ? "1.5px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--border)",
                              opacity: isBeforeJoined && !isPaid ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                          >
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--fg-muted)", marginBottom: 4 }}>
                              {monthShort}
                            </div>
                            <div style={{ fontSize: "1.1rem", color: isPaid ? "#10b981" : "var(--fg-muted)" }}>
                              {isPaid ? (
                                <i className="bx bx-check-circle" />
                              ) : isBeforeJoined ? (
                                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--fg-muted)" }}>-</span>
                              ) : (
                                <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid rgba(156,163,175,0.4)", borderRadius: 3 }} />
                              )}
                            </div>
                            <div style={{ fontSize: "0.65rem", fontWeight: 800, marginTop: 4, color: isPaid ? "#10b981" : "var(--fg-muted)" }}>
                              {isPaid ? "Lunas" : isBeforeJoined ? "Bebas" : "Belum"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: "0.78rem", color: "var(--fg-muted)" }}>
                      <span>
                        Total Lunas {trackerYear}: <strong style={{ color: "#10b981" }}>{totalPaidThisYear} dari {totalRequiredMonths} Bulan Wajib</strong>
                        {isJoinYear && userJoinMonth > 1 && ` (Bergabung sejak ${["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][userJoinMonth - 1]} ${userJoinYear})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPortalTab("bayar")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--gold)",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        Bayar Kas Sekarang <i className="bx bx-right-arrow-alt" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {loadingKasHistory ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--gold)" }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2rem", marginBottom: "8px" }} />
                <p>Memuat riwayat...</p>
              </div>
            ) : kasHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="bx bx-wallet" />
                <p>Belum ada riwayat pembayaran kas tercatat.</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {kasHistory.map((item) => {
                  let badgeClass = styles.badgePending;
                  let badgeText = "Menunggu Verifikasi";
                  if (item.status === "diverifikasi") {
                    badgeClass = styles.badgeDiverifikasi;
                    badgeText = "Diverifikasi";
                  } else if (item.status === "ditolak") {
                    badgeClass = styles.badgeDitolak;
                    badgeText = "Ditolak";
                  }

                  const rawDate = item.created_at || item.createdAt;
                  let dateFormatted = "-";
                  if (rawDate) {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                      dateFormatted = d.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                  }
                  const proofUrl = item.bukti_bayar_url || item.buktiBayarUrl;

                  return (
                    <div key={item.id} className={styles.historyItem}>
                      <div className={styles.historyLeft}>
                        <h4 className={styles.historyPeriode}>{item.periode}</h4>
                        <span className={styles.historyNominal}>{formatRupiah(item.nominal)}</span>
                        <span className={styles.historyDate}>{dateFormatted}</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <span className={badgeClass}>{badgeText}</span>
                        {proofUrl && (
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewProofBtn}
                          >
                            <i className="bx bx-image" /> Lihat Bukti
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: DONASI ── */}
        {portalTab === "donasi" && (
          <div className={`glassCard ${styles.dashCard}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-donate-heart" /> Donasi Sukarela
              </div>
              <h1 className={styles.title}>Donasi Proyek Cavallery</h1>
              <p className={styles.subtitle}>
                Dukungan sukarela untuk perayaan ulang tahun, project fanbase, dan kegiatan bersama Erine.
              </p>
            </div>

            {/* QRIS Container */}
            <div className={styles.qrisWrap}>
              <img
                src="https://images.jkt48connect.com/cavallery/images/2026/09/b50e2fd04a9f4738.jpg"
                alt="QRIS Donasi Cavallery"
                className={styles.qrisImg}
              />
              <div className={styles.qrisNote}>
                <i className="bx bx-info-circle" />
                <span>
                  Donasi Anda 100% digunakan untuk pembiayaan project fanbase Erine & kegiatan resmi Cavallery.
                </span>
              </div>
            </div>

            {donasiAlert && (
              <div
                className={`${styles.alertBox} ${
                  donasiAlert.type === "success" ? styles.alertSuccess : styles.alertError
                }`}
              >
                <i className={`bx ${donasiAlert.type === "success" ? "bx-check-circle" : "bx-error-circle"}`} />
                <span>{donasiAlert.msg}</span>
              </div>
            )}

            <form onSubmit={handleDonasiSubmit} className={styles.form}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Tipe Proyek / Donasi</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <select
                  className={styles.select}
                  value={tipeDonasi}
                  onChange={(e) => setTipeDonasi(e.target.value)}
                >
                  {donationTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Nominal Donasi (Rp)</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  placeholder="50.000"
                  value={nominalDonasi}
                  onChange={(e) => handleNominalDonasiChange(e.target.value)}
                  required
                />
                <div className={styles.chipsRow}>
                  {chipNominalsDonasi.map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      className={`${styles.chip} ${selectedChipDonasi === nom ? styles.chipActive : ""}`}
                      onClick={() => {
                        setSelectedChipDonasi(nom);
                        setNominalDonasi(nom.toLocaleString("id-ID"));
                      }}
                    >
                      Rp {nom.toLocaleString("id-ID")}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`${styles.chip} ${selectedChipDonasi === "custom" ? styles.chipActive : ""}`}
                    onClick={() => setSelectedChipDonasi("custom")}
                  >
                    Nominal Lain
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Bukti Transfer / QRIS</label>
                  <span className={styles.badgeWajib}>WAJIB</span>
                </div>

                {previewDonasi ? (
                  <div className={styles.previewWrap}>
                    <img src={previewDonasi} alt="Preview Bukti Donasi" className={styles.previewImg} />
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => {
                        setFileDonasi(null);
                        setPreviewDonasi(null);
                      }}
                      title="Hapus gambar"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadBox}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const sel = e.target.files?.[0];
                        if (sel) {
                          setFileDonasi(sel);
                          setPreviewDonasi(URL.createObjectURL(sel));
                        }
                      }}
                      className={styles.fileInput}
                      required
                    />
                    <i className={`bx bx-cloud-upload ${styles.uploadIcon}`} />
                    <p className={styles.uploadText}>Klik atau seret screenshot bukti donasi ke sini</p>
                    <p className={styles.uploadHint}>Format: JPG, PNG, WebP (Maks. 5MB)</p>
                  </div>
                )}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submittingDonasi}>
                {submittingDonasi ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" /> Mengirim Donasi...
                  </>
                ) : (
                  <>
                    <i className="bx bx-paper-plane" /> Kirim Konfirmasi Donasi
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── MODAL POPUP VERIFIKASI ANGGOTA ── */}
      {showVerifyModal && (
        <div className={styles.verifyModalOverlay} onClick={() => setShowVerifyModal(false)}>
          <div className={styles.verifyModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.verifyLogoCircle}>
              <img
                src={
                  sessionUser.fotoProfil ||
                  sessionUser.foto_profil ||
                  "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
                }
                alt={displayName}
              />
            </div>

            <h2 className={styles.verifyBrandTitle}>CAVALLERY</h2>

            <div className={styles.verifySubtitleRow}>
              <div className={styles.verifySubtitleLine} />
              <span className={styles.verifySubtitleText}>Verifikasi</span>
              <div className={styles.verifySubtitleLine} />
            </div>

            <span className={styles.verifyStatusBadge}>
              <i className="bx bxs-check-circle" />{" "}
              {sessionUser.status === "aktif" ? "Aktif" : sessionUser.status || "Aktif"}
            </span>

            <h3 className={styles.verifyMemberName}>{displayName}</h3>
            <p className={styles.verifyMemberCode}>
              {sessionUser.noAnggota || "CAVA-0001"}
            </p>

            <span className={styles.verifyRoleBadge}>
              {sessionUser.jabatan === "Admin Fanbase" ? (
                <>
                  <i className="bx bxs-crown" style={{ marginRight: 5 }} /> Admin Fanbase {sessionUser.divisi ? `• ${sessionUser.divisi}` : ""}
                </>
              ) : (
                sessionUser.jabatan || "Anggota"
              )}
            </span>

            <span className={styles.verifySinceText}>
              Anggota Sejak: {formattedJoinDate}
            </span>

            <button
              type="button"
              className={styles.verifyCloseBtn}
              onClick={() => setShowVerifyModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
