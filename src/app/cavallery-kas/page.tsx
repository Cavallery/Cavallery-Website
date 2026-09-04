"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./page.module.css";

const PLATFORMS = ["LINE", "X (Twitter)", "Instagram", "TikTok", "Discord"];

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

const KAS_12_BULAN = [
  { bulan: 1, nominal: 15000, label: "1 Bulan", detail: "1 Bulan: Rp 15.000" },
  { bulan: 2, nominal: 30000, label: "2 Bulan", detail: "2 Bulan: Rp 30.000" },
  { bulan: 3, nominal: 45000, label: "3 Bulan", detail: "3 Bulan: Rp 45.000" },
  { bulan: 4, nominal: 60000, label: "4 Bulan", detail: "4 Bulan: Rp 60.000" },
  { bulan: 5, nominal: 75000, label: "5 Bulan", detail: "5 Bulan: Rp 75.000" },
  {
    bulan: 6,
    nominal: 90000,
    label: "6 Bulan (Setengah Tahun)",
    detail: "6 Bulan (Setengah Tahun): Rp 90.000",
  },
  {
    bulan: 7,
    nominal: 105000,
    label: "7 Bulan",
    detail: "7 Bulan: Rp 105.000",
  },
  {
    bulan: 8,
    nominal: 120000,
    label: "8 Bulan",
    detail: "8 Bulan: Rp 120.000",
  },
  {
    bulan: 9,
    nominal: 135000,
    label: "9 Bulan",
    detail: "9 Bulan: Rp 135.000",
  },
  {
    bulan: 10,
    nominal: 150000,
    label: "10 Bulan",
    detail: "10 Bulan: Rp 150.000",
  },
  {
    bulan: 11,
    nominal: 165000,
    label: "11 Bulan",
    detail: "11 Bulan: Rp 165.000",
  },
  {
    bulan: 12,
    nominal: 180000,
    label: "12 Bulan (1 Tahun)",
    detail: "12 Bulan (1 Tahun): Rp 180.000",
  },
];

function getKasCalculationText(nom: number): string | null {
  const m = Math.round(nom / 15000);
  if (nom <= 0 || nom % 15000 !== 0 || m <= 0) return null;
  if (m === 1) return "1 Bulan: Rp 15.000";
  if (m === 2) return "2 Bulan: Rp 30.000";
  if (m === 3) return "3 Bulan: Rp 45.000";
  if (m === 4) return "4 Bulan: Rp 60.000";
  if (m === 5) return "5 Bulan: Rp 75.000";
  if (m === 6) return "6 Bulan (Setengah Tahun): Rp 90.000";
  if (m === 7) return "7 Bulan: Rp 105.000";
  if (m === 8) return "8 Bulan: Rp 120.000";
  if (m === 9) return "9 Bulan: Rp 135.000";
  if (m === 10) return "10 Bulan: Rp 150.000";
  if (m === 11) return "11 Bulan: Rp 165.000";
  if (m === 12) return "12 Bulan (1 Tahun): Rp 180.000";
  return `${m} Bulan: Rp ${nom.toLocaleString("id-ID")}`;
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
  const [regKontakPlatformDonatur, setRegKontakPlatformDonatur] =
    useState("X (Twitter)");
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
  const [portalTab, setPortalTab] = useState<
    "bayar" | "riwayat" | "kupon" | "donasi" | "war"
  >("bayar");
  const [periodeBulan, setPeriodeBulan] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [periodeTahun, setPeriodeTahun] = useState<number>(
    new Date().getFullYear(),
  );
  const [filterTahunRiwayat, setFilterTahunRiwayat] = useState<
    number | "semua"
  >(new Date().getFullYear());
  const [nominalKas, setNominalKas] = useState("15.000");
  const [selectedChipKas, setSelectedChipKas] = useState<number | "custom">(
    15000,
  );
  const [fileKas, setFileKas] = useState<File | null>(null);
  const [previewKas, setPreviewKas] = useState<string | null>(null);
  const [kasAlert, setKasAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [submittingKas, setSubmittingKas] = useState(false);
  const [showTabelKas12Bulan, setShowTabelKas12Bulan] = useState(false);

  // User Kupon Reward State
  const [userKupons, setUserKupons] = useState<any[]>([]);
  const [userLunasTahunIni, setUserLunasTahunIni] = useState(0);
  const [loadingUserKupons, setLoadingUserKupons] = useState(false);
  const [copiedKupon, setCopiedKupon] = useState<string | null>(null);

  // War Tiket STS Erine State
  const [warEvent, setWarEvent] = useState<any | null>(null);
  const [userWarTicket, setUserWarTicket] = useState<any | null>(null);
  const [loadingWar, setLoadingWar] = useState(false);
  const [claimingWar, setClaimingWar] = useState(false);
  const [downloadingTicket, setDownloadingTicket] = useState(false);
  const [warAlert, setWarAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [warTimeLeft, setWarTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isStarted: boolean;
    isEnded: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isStarted: false,
    isEnded: false,
  });

  // Avatar Upload State (User Dashboard)
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingUserAvatar, setUploadingUserAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);

  // Kas History & Monthly Matrix Status
  const [kasHistory, setKasHistory] = useState<any[]>([]);
  const [monthlyStatus, setMonthlyStatus] = useState<any[]>([]);
  const [trackerYear, setTrackerYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [loadingKasHistory, setLoadingKasHistory] = useState(false);

  // Donasi State
  const [tipeDonasi, setTipeDonasi] = useState(DONATION_TYPES[0]);
  const [nominalDonasi, setNominalDonasi] = useState("50.000");
  const [selectedChipDonasi, setSelectedChipDonasi] = useState<
    number | "custom"
  >(50000);
  const [fileDonasi, setFileDonasi] = useState<File | null>(null);
  const [previewDonasi, setPreviewDonasi] = useState<string | null>(null);
  const [donasiAlert, setDonasiAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
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
  const [chipNominalsDonasi, setChipNominalsDonasi] = useState<number[]>([
    10000, 25000, 50000, 100000, 250000, 500000,
  ]);
  const [platformOptions, setPlatformOptions] = useState<string[]>([
    "LINE",
    "X (Twitter)",
    "Instagram",
    "TikTok",
    "Discord",
    "WhatsApp",
  ]);

  // Derived: parsed kas nominal for display hints
  const cleanNominalKas =
    parseInt((nominalKas || "").replace(/\D/g, ""), 10) || 0;

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
        if (jsonMd.data.nominalDonasi?.length)
          setChipNominalsDonasi(jsonMd.data.nominalDonasi);
        if (jsonMd.data.platforms?.length)
          setPlatformOptions(jsonMd.data.platforms);
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

  const fetchUserKupons = useCallback(async () => {
    setLoadingUserKupons(true);
    try {
      const res = await fetch("/api/kas/kupon");
      const json = await res.json();
      if (json.status) {
        setUserKupons(json.data || []);
        setUserLunasTahunIni(json.totalLunasTahunIni || 0);
      }
    } catch {
      console.error("Failed to load user kupons");
    } finally {
      setLoadingUserKupons(false);
    }
  }, []);

  // State Riwayat Donasi User & Leaderboard Donatur
  const [donasiHistory, setDonasiHistory] = useState<any[]>([]);
  const [loadingDonasiHistory, setLoadingDonasiHistory] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const fetchDonasiHistory = useCallback(async () => {
    setLoadingDonasiHistory(true);
    try {
      const res = await fetch("/api/donasi");
      const json = await res.json();
      if (json.status && json.data) {
        setDonasiHistory(json.data);
      }
    } catch {
      console.error("Failed to load user donasi history");
    } finally {
      setLoadingDonasiHistory(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/donasi?type=leaderboard");
      const json = await res.json();
      if (json.status && json.data) {
        setLeaderboard(json.data);
      }
    } catch {
      console.error("Failed to load leaderboard");
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  const fetchWarEvent = useCallback(async () => {
    setLoadingWar(true);
    try {
      const res = await fetch("/api/war-tiket");
      const json = await res.json();
      if (json.status && json.data) {
        setWarEvent(json.data.event);
        setUserWarTicket(json.data.userTicket);
      }
    } catch {
      console.error("Failed to load war event");
    } finally {
      setLoadingWar(false);
    }
  }, []);

  // Timer countdown war tiket sinkron waktu server (hanya aktif saat tab war dibuka & belum punya tiket)
  useEffect(() => {
    if (!warEvent || portalTab !== "war" || userWarTicket) return;

    const updateTimer = () => {
      const now = Date.now();
      const openTime = new Date(warEvent.waktu_buka).getTime();
      const closeTime = new Date(warEvent.waktu_tutup).getTime();

      if (now < openTime) {
        // Belum mulai (Hitung mundur menuju buka)
        const diff = Math.max(0, openTime - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setWarTimeLeft((prev) => {
          if (
            prev.seconds === seconds &&
            prev.minutes === minutes &&
            prev.hours === hours &&
            prev.days === days &&
            !prev.isStarted &&
            !prev.isEnded
          ) {
            return prev;
          }
          return { days, hours, minutes, seconds, isStarted: false, isEnded: false };
        });
      } else if (now <= closeTime) {
        // Sedang berlangsung!
        const diff = Math.max(0, closeTime - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setWarTimeLeft((prev) => {
          if (
            prev.seconds === seconds &&
            prev.minutes === minutes &&
            prev.hours === hours &&
            prev.days === days &&
            prev.isStarted &&
            !prev.isEnded
          ) {
            return prev;
          }
          return { days, hours, minutes, seconds, isStarted: true, isEnded: false };
        });
      } else {
        // Selesai
        setWarTimeLeft((prev) => {
          if (prev.isStarted && prev.isEnded) return prev;
          return { days: 0, hours: 0, minutes: 0, seconds: 0, isStarted: true, isEnded: true };
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [warEvent, portalTab, userWarTicket]);

  const handleClaimWarTicket = async () => {
    if (!warEvent || claimingWar) return;
    setClaimingWar(true);
    setWarAlert(null);

    try {
      const res = await fetch("/api/war-tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: warEvent.id }),
      });
      const json = await res.json();

      if (!res.ok || !json.status) {
        setWarAlert({ type: "error", msg: json.message || "Gagal mengklaim tiket war." });
        if (json.ticket) {
          setUserWarTicket(json.ticket);
        }
      } else {
        setWarAlert({ type: "success", msg: json.message || "Selamat! Kamu berhasil mendapatkan tiket!" });
        setUserWarTicket(json.data);
      }
      fetchWarEvent();
    } catch (err: any) {
      setWarAlert({ type: "error", msg: err?.message || "Terjadi kesalahan saat memproses klaim tiket." });
    } finally {
      setClaimingWar(false);
    }
  };

  const handleDownloadETicket = () => {
    if (!userWarTicket) return;
    setDownloadingTicket(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = 860;
      const h = 1320;
      canvas.width = w;
      canvas.height = h;

      // 1. Dark Luxury Obsidian Background
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#1c1814");
      bg.addColorStop(0.5, "#13100e");
      bg.addColorStop(1, "#0a0807");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle warm glow in center
      const radialGlow = ctx.createRadialGradient(w / 2, 420, 40, w / 2, 420, 460);
      radialGlow.addColorStop(0, "rgba(201, 168, 76, 0.12)");
      radialGlow.addColorStop(1, "transparent");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, w, h);

      // 3. Elegant Double Golden Border
      ctx.strokeStyle = "#c9a84c";
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      ctx.strokeStyle = "rgba(201, 168, 76, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(46, 46, w - 92, h - 92);

      // Corner Accents (Decorative Golden Brackets)
      const drawCorner = (x: number, y: number, dx: number, dy: number) => {
        ctx.fillStyle = "#c9a84c";
        ctx.fillRect(x, y, dx * 26, dy * 4);
        ctx.fillRect(x, y, dx * 4, dy * 26);
      };
      drawCorner(54, 54, 1, 1);
      drawCorner(w - 54, 54, -1, 1);
      drawCorner(54, h - 54, 1, -1);
      drawCorner(w - 54, h - 54, -1, -1);

      // 4. Header Top Badge
      ctx.textAlign = "center";
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#e2b857";
      ctx.fillText(warEvent?.kategori_tiket || "★ OFFICIAL VIP EVENT PASS ★", w / 2, 95);

      // Brand Title
      ctx.font = "bold 26px serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("CAVALLERY FANBASE", w / 2, 134);

      // Project Title
      ctx.font = "bold 22px serif";
      ctx.fillStyle = "#c9a84c";
      ctx.fillText((warEvent?.judul || "PROJECT STS ERINE 19TH BIRTHDAY").toUpperCase(), w / 2, 170);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText(warEvent?.subjudul || "Team Passion • Exclusive Limited Entry Pass", w / 2, 200);

      // Thin separator
      ctx.strokeStyle = "rgba(201, 168, 76, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(90, 224);
      ctx.lineTo(w - 90, 224);
      ctx.stroke();

      // 5. Ticket Number Badge Box
      const badgeW = 360;
      const badgeH = 76;
      const badgeX = (w - badgeW) / 2;
      const badgeY = 248;
      const bGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      bGrad.addColorStop(0, "#d4af37");
      bGrad.addColorStop(1, "#92400e");

      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 20);
      ctx.fill();
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ticket Number Text
      ctx.font = "900 44px serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 8;
      ctx.fillText(`#${userWarTicket.nomor_tiket}`, w / 2, badgeY + 54);
      ctx.shadowBlur = 0;

      // 6. Member Information Card
      const cardY = 352;
      const cardW = w - 160;
      const cardX = 80;
      const cardH = 340;
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(201, 168, 76, 0.22)";
      ctx.stroke();

      // Member Name Label & Value
      ctx.textAlign = "center";
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#a1a1aa";
      ctx.fillText("NAMA PEMEGANG TIKET", w / 2, cardY + 44);

      ctx.font = "bold 30px serif";
      ctx.fillStyle = "#ffffff";
      const name = userWarTicket.nama_lengkap || displayName || "Anggota Cavallery";
      ctx.fillText(name.toUpperCase(), w / 2, cardY + 84);

      // No Anggota
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#c9a84c";
      const noAngg = userWarTicket.no_anggota || sessionUser?.noAnggota || "-";
      ctx.fillText(`NO. ANGGOTA: ${noAngg}`, w / 2, cardY + 120);

      // Access Level
      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = "#fbbf24";
      const accessLvl = warEvent?.kategori_tiket || "FULL ENTRY VIP PASS";
      ctx.fillText(`AKSES: ${accessLvl.toUpperCase()}`, w / 2, cardY + 160);

      // Verified Status Chip
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(w / 2 - 125, cardY + 186, 250, 36, 18);
      ctx.fill();
      ctx.stroke();
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#34d399";
      ctx.fillText("✓ TERVERIFIKASI RESMI", w / 2, cardY + 209);

      // Venue & Date Info
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#c9a84c";
      const venueStr = `${warEvent?.lokasi_event || "Theater JKT48"} • ${warEvent?.tanggal_event || "September 2026"}`;
      ctx.fillText(venueStr, w / 2, cardY + 248);

      // Waktu Klaim
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#71717a";
      const claimDate = new Date(userWarTicket.waktu_klaim);
      const claimStr = `${claimDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • ${claimDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB`;
      ctx.fillText(`Waktu Registrasi Klaim: ${claimStr}`, w / 2, cardY + 276);

      // Unique Security Code
      const secPrefix = warEvent?.kode_tiket || "STS";
      const secCode = `SEC-${String(userWarTicket.id || 1).padStart(4, "0")}-${(userWarTicket.nomor_tiket || secPrefix).replace(/[^a-zA-Z0-9]/g, "")}`;
      ctx.font = "12px monospace";
      ctx.fillStyle = "#52525b";
      ctx.fillText(`KODE KEAMANAN: ${secCode}`, w / 2, cardY + 304);

      // 7. Perforated Tear Line (Garis Potong Tiket)
      const tearY = 730;
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = "rgba(201, 168, 76, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(70, tearY);
      ctx.lineTo(w - 70, tearY);
      ctx.stroke();
      ctx.setLineDash([]); // reset dash

      // Notches (Lingkaran Potongan Tiket Kiri & Kanan)
      ctx.fillStyle = "#0a0807";
      ctx.beginPath();
      ctx.arc(36, tearY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c9a84c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(36, tearY, 26, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w - 36, tearY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w - 36, tearY, 26, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.stroke();

      // 8. Stub & QR Verification Section
      const qrSize = 180;
      const qrX = (w - qrSize) / 2;
      const qrY = 774;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(201, 168, 76, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Procedural Crisp QR Pattern
      const pCount = 15;
      const cellSize = (qrSize - 30) / pCount;
      ctx.fillStyle = "#18181b";
      const drawFinder = (fx: number, fy: number) => {
        ctx.fillRect(fx, fy, cellSize * 4, cellSize * 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 2, cellSize * 2);
        ctx.fillStyle = "#18181b";
        ctx.fillRect(fx + cellSize * 1.5, fy + cellSize * 1.5, cellSize, cellSize);
      };
      drawFinder(qrX + 15, qrY + 15);
      drawFinder(qrX + qrSize - 15 - cellSize * 4, qrY + 15);
      drawFinder(qrX + 15, qrY + qrSize - 15 - cellSize * 4);

      const seed = userWarTicket.nomor_tiket.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
      for (let r = 0; r < pCount; r++) {
        for (let c = 0; c < pCount; c++) {
          if ((r < 5 && c < 5) || (r < 5 && c > pCount - 6) || (r > pCount - 6 && c < 5)) continue;
          if (((r * c + seed * (r + 1)) % 3) === 0) {
            ctx.fillRect(qrX + 15 + c * cellSize, qrY + 15 + r * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }

      // 9. Simulated Barcode Lines
      const barY = 988;
      const barW = 380;
      const barX = (w - barW) / 2;
      ctx.fillStyle = "#ffffff";
      const bars = [3, 1, 4, 2, 1, 5, 2, 3, 1, 4, 2, 1, 3, 5, 1, 2, 4, 1, 3, 2, 5, 1, 2, 4, 3, 1, 2, 4, 2, 3, 1, 5, 2, 1, 4];
      let curX = barX;
      bars.forEach((bWidth, idx) => {
        if (idx % 2 === 0) {
          ctx.fillRect(curX, barY, bWidth * 2.2, 40);
        }
        curX += bWidth * 2.8;
      });

      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "#a1a1aa";
      ctx.textAlign = "center";
      const codePfx = warEvent?.kode_tiket || "STS19";
      ctx.fillText(`*${codePfx}-${userWarTicket.nomor_tiket}-${noAngg}*`, w / 2, barY + 62);

      // 10. Important Event Notice Box
      const noticeY = 1080;
      const noticeW = w - 160;
      const noticeX = 80;
      const noticeH = 120;
      ctx.fillStyle = "rgba(201, 168, 76, 0.08)";
      ctx.beginPath();
      ctx.roundRect(noticeX, noticeY, noticeW, noticeH, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(201, 168, 76, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#fef08a";
      ctx.fillText("PETUNJUK KEDATANGAN DI VENUE ACARA:", w / 2, noticeY + 38);

      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#d4d4d8";
      ctx.fillText("Simpan gambar ini di galeri ponsel Anda. Pada hari acara, cukup tunjukkan", w / 2, noticeY + 66);
      ctx.fillText("tiket digital ini kepada panitia Cavallery untuk penukaran wristband masuk.", w / 2, noticeY + 88);

      // 11. Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `E-Ticket-${codePfx}-Cavallery-${userWarTicket.nomor_tiket}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setWarAlert({
        type: "success",
        msg: "E-Ticket berhasil diunduh ke ponsel/perangkat Anda! Cukup tunjukkan gambar ini kepada panitia di hari acara.",
      });
    } catch (err: any) {
      console.error("Download ticket error:", err);
      alert("Gagal mengunduh tiket: " + err.message);
    } finally {
      setDownloadingTicket(false);
    }
  };

  useEffect(() => {
    if (sessionUser && (portalTab === "kupon" || portalTab === "bayar")) {
      fetchUserKupons();
    }
  }, [portalTab, sessionUser, fetchUserKupons]);

  useEffect(() => {
    if (sessionUser && portalTab === "war") {
      fetchWarEvent();
    }
  }, [portalTab, sessionUser, fetchWarEvent]);

  useEffect(() => {
    if (sessionUser && portalTab === "riwayat") {
      loadKasHistory();
    }
  }, [portalTab, sessionUser]);

  useEffect(() => {
    if (sessionUser && portalTab === "donasi") {
      fetchDonasiHistory();
      fetchLeaderboard();
    }
  }, [portalTab, sessionUser, fetchDonasiHistory, fetchLeaderboard]);

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
        payload = {
          ...payload,
          noAnggota: loginNoAnggota.trim(),
          idLine: loginIdLine.trim(),
        };
      } else {
        if (!loginNamaDonatur.trim() || !loginKontakDonatur.trim()) {
          setAuthError("Nama dan ID / Nomor Kontak wajib diisi");
          setAuthLoading(false);
          return;
        }
        payload = {
          ...payload,
          nama: loginNamaDonatur.trim(),
          kontakId: loginKontakDonatur.trim(),
        };
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
        if (
          !regNoAnggota.trim() ||
          !regNamaLengkap.trim() ||
          !regIdLine.trim() ||
          !regDomisili.trim() ||
          !regKontakId.trim()
        ) {
          setAuthError(
            "Mohon lengkapi seluruh field bertanda WAJIB (termasuk Nomor Anggota)",
          );
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
      setKasAlert({
        type: "error",
        msg: "Mohon unggah screenshot bukti transfer/QRIS.",
      });
      return;
    }

    setSubmittingKas(true);

    try {
      // 1. Upload Bukti
      const formData = new FormData();
      formData.append("file", fileKas);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.status) {
        throw new Error(uploadJson.message || "Gagal mengunggah bukti bayar");
      }

      const buktiBayarUrl = uploadJson.url;

      const finalPeriode = `${MONTH_NAMES[periodeBulan - 1]} ${periodeTahun}`;
      // 2. Submit Kas
      const kasRes = await fetch("/api/kas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periode: finalPeriode,
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
      setKasAlert({
        type: "error",
        msg: err.message || "Terjadi kesalahan saat memproses kas.",
      });
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
      setDonasiAlert({
        type: "error",
        msg: "Mohon unggah screenshot bukti transfer/QRIS.",
      });
      return;
    }

    setSubmittingDonasi(true);

    try {
      const formData = new FormData();
      formData.append("file", fileDonasi);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
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
        throw new Error(
          donasiJson.message || "Gagal mengirim konfirmasi donasi",
        );
      }

      setDonasiAlert({
        type: "success",
        msg: "Konfirmasi donasi berhasil dikirim! Terima kasih atas dukungan Anda untuk Erine.",
      });

      setFileDonasi(null);
      setPreviewDonasi(null);
      fetchDonasiHistory();
      fetchLeaderboard();
    } catch (err: any) {
      setDonasiAlert({
        type: "error",
        msg: err.message || "Terjadi kesalahan saat memproses donasi.",
      });
    } finally {
      setSubmittingDonasi(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", color: "var(--gold)" }}>
          <i
            className="bx bx-loader-alt bx-spin"
            style={{ fontSize: "2.5rem", marginBottom: "12px" }}
          />
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
                            <label className={styles.label}>
                              Nomor Anggota
                            </label>
                            <span className={styles.badgeWajib}>WAJIB</span>
                          </div>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Contoh: CAVA-0001"
                            value={loginNoAnggota}
                            onChange={(e) =>
                              setLoginNoAnggota(e.target.value.toUpperCase())
                            }
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
                            <label className={styles.label}>
                              Nama Kontributor
                            </label>
                            <span className={styles.badgeWajib}>WAJIB</span>
                          </div>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Nama yang Anda daftarkan"
                            value={loginNamaDonatur}
                            onChange={(e) =>
                              setLoginNamaDonatur(e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <div className={styles.labelRow}>
                            <label className={styles.label}>
                              ID Kontak / Username
                            </label>
                            <span className={styles.badgeWajib}>WAJIB</span>
                          </div>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="ID LINE / X / WA yang terdaftar"
                            value={loginKontakDonatur}
                            onChange={(e) =>
                              setLoginKontakDonatur(e.target.value)
                            }
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
                          <i className="bx bx-loader-alt bx-spin" />{" "}
                          Memeriksa...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-log-in" /> Masuk
                        </>
                      )}
                    </button>
                  </form>
                ) : (tipe === "anggota" && !regAnggotaOpen) ||
                  (tipe === "donatur" && !regDonaturOpen) ? (
                  // ── KONDISI DAFTAR DITUTUP (TIDAK MENAMPILKAN FORM) ──
                  <div className={styles.closedStateWrap}>
                    <div className={styles.closedIconBox}>
                      <i className="bx bxs-lock-alt" />
                    </div>
                    <h3 className={styles.closedStateTitle}>
                      Pendaftaran{" "}
                      {tipe === "anggota" ? "Anggota Baru" : "Kontributor"}{" "}
                      Sedang Ditutup
                    </h3>
                    <p className={styles.closedStateDesc}>
                      Mohon maaf, saat ini pendaftaran{" "}
                      {tipe === "anggota" ? "anggota baru" : "kontributor"}{" "}
                      Cavallery sedang tidak menerima pendaftar baru. Silakan
                      pantau informasi resmi terbaru melalui media sosial kami.
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
                            onChange={(e) =>
                              setRegNoAnggota(e.target.value.toUpperCase())
                            }
                            required
                          />
                          <span className={styles.hint}>
                            Sesuaikan dengan nomor anggota lama menggunakan
                            format 4 digit.
                          </span>
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
                          <span className={styles.hint}>
                            Nama yang biasa kamu gunakan di Cavallery.
                          </span>
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
                          <span className={styles.hint}>
                            Masukkan ID LINE yang aktif.
                          </span>
                        </div>

                        <div className={styles.field}>
                          <div className={styles.labelRow}>
                            <label className={styles.label}>
                              Display Name LINE
                            </label>
                            <span className={styles.badgeOpsional}>
                              OPSIONAL
                            </span>
                          </div>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Display Name LINE kamu"
                            value={regDisplayLine}
                            onChange={(e) => setRegDisplayLine(e.target.value)}
                          />
                          <span className={styles.hint}>
                            Nama yang tampil di akun LINE kamu.
                          </span>
                        </div>

                        <div className={styles.field}>
                          <div className={styles.labelRow}>
                            <label className={styles.label}>
                              Username Discord
                            </label>
                            <span className={styles.badgeOpsional}>
                              OPSIONAL
                            </span>
                          </div>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="username_discord"
                            value={regDiscord}
                            onChange={(e) => setRegDiscord(e.target.value)}
                          />
                          <span className={styles.hint}>
                            Masukkan username Discord kamu.
                          </span>
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
                            <label className={styles.label}>
                              Kota Domisili
                            </label>
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
                              onChange={(e) =>
                                setRegKontakPlatform(e.target.value)
                              }
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
                          <span className={styles.hint}>
                            Pilih setidaknya satu akun yang bisa dihubungi.
                          </span>
                        </div>
                      </>
                    ) : (
                      // ── Form Kontributor ──
                      <>
                        <div className={styles.field}>
                          <div className={styles.labelRow}>
                            <label className={styles.label}>
                              Nama Kontributor
                            </label>
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
                              onChange={(e) =>
                                setRegKontakPlatformDonatur(e.target.value)
                              }
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
                              onChange={(e) =>
                                setRegKontakIdDonatur(e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className={styles.field}>
                          <div className={styles.labelRow}>
                            <label className={styles.label}>
                              ID / Nama Discord
                            </label>
                            <span className={styles.badgeOpsional}>
                              OPSIONAL
                            </span>
                          </div>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Contoh: user#1234"
                            value={regDiscordDonatur}
                            onChange={(e) =>
                              setRegDiscordDonatur(e.target.value)
                            }
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
                          <i className="bx bx-loader-alt bx-spin" />{" "}
                          Mendaftarkan...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-user-plus" /> Daftar{" "}
                          {tipe === "anggota" ? "Anggota" : "Kontributor"}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}

            <div className={styles.helpText}>
              Jika terjadi kendala, kehilangan, perubahan atau ketidaksesuaian
              data, dapat menghubungi admin Cavallery.
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
                  <i className="bx bxs-crown" style={{ color: "#f59e0b" }} />{" "}
                  Admin Fanbase{" "}
                  {sessionUser.divisi ? `(${sessionUser.divisi})` : ""}
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
                {sessionUser.idLine
                  ? `@${sessionUser.idLine}`
                  : sessionUser.kontakId || displayName}
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
                portalTab === "bayar" || portalTab === "riwayat"
                  ? styles.navPillBtnActive
                  : ""
              }`}
              onClick={() => setPortalTab("bayar")}
            >
              <i className="bx bx-wallet" />
              <span>Kas</span>
            </button>
            <button
              type="button"
              className={`${styles.navPillBtn} ${portalTab === "kupon" ? styles.navPillBtnActive : ""}`}
              onClick={() => setPortalTab("kupon")}
            >
              <i className="bx bx-gift" />
              <span>
                Reward {userKupons.length > 0 ? `(${userKupons.length})` : ""}
              </span>
            </button>
            <button
              type="button"
              className={`${styles.navPillBtn} ${portalTab === "donasi" ? styles.navPillBtnActive : ""}`}
              onClick={() => setPortalTab("donasi")}
            >
              <i className="bx bx-donate-heart" />
              <span>Donasi</span>
            </button>
            <button
              type="button"
              className={`${styles.navPillBtn} ${portalTab === "war" ? styles.navPillBtnActive : ""}`}
              onClick={() => setPortalTab("war")}
            >
              <i className="bx bx-flame" />
              <span>War Tiket</span>
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
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <div className={styles.modeSwitch} style={{ maxWidth: 360 }}>
              <button
                type="button"
                className={`${styles.modeBtn} ${portalTab === "bayar" ? styles.modeBtnActive : ""}`}
                onClick={() => setPortalTab("bayar")}
              >
                <i className="bx bx-credit-card" />{" "}
                {sessionUser.jabatan === "Admin Fanbase"
                  ? "Status Kas"
                  : "Bayar Kas"}
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
        {portalTab === "bayar" &&
          (sessionUser.jabatan === "Admin Fanbase" ? (
            /* GOLDEN EXEMPTION CARD UNTUK ADMIN FANBASE */
            <div className={`glassCard ${styles.adminExemptionCard}`}>
              <div className={styles.adminCrownIconWrap}>
                <i className="bx bxs-crown" />
              </div>

              <span className={styles.adminExemptionBadge}>
                <i className="bx bxs-crown" style={{ marginRight: 6 }} />{" "}
                Manajemen & Pengurus Fanbase
              </span>

              <h1 className={styles.adminExemptionTitle}>
                Bebas Iuran Kas Wajib Bulanan
              </h1>

              <div className={styles.adminDivisiBadge}>
                <i className="bx bx-badge-check" />
                <span>
                  Divisi: {sessionUser.divisi || "Tim Inti / Koordinator"}
                </span>
              </div>

              <p className={styles.adminExemptionQuote}>
                "Terima kasih sebesar-besarnya atas waktu, tenaga, dan dedikasi
                Anda dalam mengelola & mengembangkan keluarga besar Cavallery
                untuk Erine. Sebagai pengurus resmi fanbase, Anda dibebaskan
                dari ketentuan iuran kas bulanan."
              </p>

              <a href="/admin/keanggotaan" className={styles.adminQuickBtn}>
                <i className="bx bxs-dashboard" /> Buka Dashboard Admin Fanbase
              </a>

              <button
                type="button"
                className={styles.adminDonasiLink}
                onClick={() => setPortalTab("donasi")}
              >
                Ingin tetap berpartisipasi donasi sukarela untuk project Erine?
                Klik di sini
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
                  Dukung operasional fanbase dan berbagai proyek kebersamaan
                  untuk Erine.
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
                    <strong>Catatan:</strong> Pembayaran melebihi kewajiban
                    bulan berjalan akan dianggap sebagai deposit dan mengurangi
                    ketentuan kas bulan berikutnya.
                  </span>
                </div>
              </div>

              {/* Kas Feedback Alert */}
              {kasAlert && (
                <div
                  className={`${styles.alertBox} ${
                    kasAlert.type === "success"
                      ? styles.alertSuccess
                      : styles.alertError
                  }`}
                >
                  <i
                    className={`bx ${kasAlert.type === "success" ? "bx-check-circle" : "bx-error-circle"}`}
                  />
                  <span>{kasAlert.msg}</span>
                </div>
              )}

              <form onSubmit={handleKasSubmit} className={styles.form}>
                {/* DROPDOWN PERIODE KAS (BULAN & TAHUN TERPISAH) */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>
                      Periode Kas yang Dibayar
                    </label>
                    <span className={styles.badgeWajib}>WAJIB</span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--fg-muted)",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Pilih Bulan
                      </label>
                      <select
                        className={styles.input}
                        value={periodeBulan}
                        onChange={(e) =>
                          setPeriodeBulan(Number(e.target.value))
                        }
                      >
                        {MONTH_NAMES.map((m, idx) => (
                          <option key={m} value={idx + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--fg-muted)",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Pilih Tahun
                      </label>
                      <select
                        className={styles.input}
                        value={periodeTahun}
                        onChange={(e) =>
                          setPeriodeTahun(Number(e.target.value))
                        }
                      >
                        {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--gold)",
                      marginTop: 6,
                      fontWeight: 600,
                    }}
                  >
                    <i
                      className="bx bx-calendar-check"
                      style={{ marginRight: 4 }}
                    />
                    Iuran Kas untuk:{" "}
                    <strong>
                      {MONTH_NAMES[periodeBulan - 1]} {periodeTahun}
                    </strong>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>
                      Nominal Pembayaran (Rp)
                    </label>
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
                  {cleanNominalKas > 0 && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "#10b981",
                        marginTop: 10,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(16, 185, 129, 0.08)",
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                      }}
                    >
                      <i
                        className="bx bx-check-circle"
                        style={{ fontSize: "1.15rem", flexShrink: 0 }}
                      />
                      <span>
                        {getKasCalculationText(cleanNominalKas) ? (
                          <>
                            Hitungan:{" "}
                            <strong>
                              {getKasCalculationText(cleanNominalKas)}
                            </strong>
                          </>
                        ) : (
                          <>
                            Total Iuran Kas:{" "}
                            <strong>
                              Rp {cleanNominalKas.toLocaleString("id-ID")}
                            </strong>
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {/* ── RINCIAN HITUNGAN KAS 1 S/D 12 BULAN — SELALU TAMPIL ── */}
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        marginTop: 8,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: 10,
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 8,
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      {KAS_12_BULAN.map((item) => {
                        const isSelected = cleanNominalKas === item.nominal;
                        return (
                          <div
                            key={item.bulan}
                            onClick={() => {
                              setSelectedChipKas(item.nominal);
                              setNominalKas(
                                item.nominal.toLocaleString("id-ID"),
                              );
                            }}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 8,
                              background: isSelected
                                ? "var(--gold)"
                                : "var(--bg)",
                              color: isSelected ? "#1a1612" : "var(--fg)",
                              border: isSelected
                                ? "1px solid var(--gold)"
                                : "1px solid var(--border)",
                              fontSize: "0.75rem",
                              fontWeight: isSelected ? 800 : 600,
                              cursor: "pointer",
                              transition: "all 0.15s",
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                            title={`Pilih ${item.detail}`}
                          >
                            <span
                              style={{
                                fontSize: "0.68rem",
                                opacity: isSelected ? 0.9 : 0.7,
                              }}
                            >
                              {item.label}
                            </span>
                            <span
                              style={{ fontWeight: 800, fontSize: "0.82rem" }}
                            >
                              Rp {item.nominal.toLocaleString("id-ID")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>
                      Bukti Transfer / QRIS
                    </label>
                    <span className={styles.badgeWajib}>WAJIB</span>
                  </div>

                  {previewKas ? (
                    <div className={styles.previewWrap}>
                      <img
                        src={previewKas}
                        alt="Preview Bukti Kas"
                        className={styles.previewImg}
                      />
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
                      <i
                        className={`bx bx-cloud-upload ${styles.uploadIcon}`}
                      />
                      <p className={styles.uploadText}>
                        Klik atau seret screenshot bukti bayar ke sini
                      </p>
                      <p className={styles.uploadHint}>
                        Format: JPG, PNG, WebP (Maks. 5MB)
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submittingKas}
                >
                  {submittingKas ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" /> Mengirim
                      Konfirmasi...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-paper-plane" /> Kirim Konfirmasi Kas{" "}
                      {nominalKas ? `(Rp ${nominalKas})` : ""}
                    </>
                  )}
                </button>
              </form>
            </div>
          ))}

        {/* ── TAB 2: RIWAYAT STATUS KAS ── */}
        {portalTab === "riwayat" && (
          <div className={`glassCard ${styles.dashCard}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-history" /> Riwayat
              </div>
              <h2 className={styles.title}>Status Pembayaran Kas Anda</h2>
              <p className={styles.subtitle}>
                Pantau iuran kas bulanan Anda dan daftar konfirmasi kas yang
                telah dikirimkan.
              </p>
            </div>

            {/* ── TRACKER IURAN BULANAN MEMBER (2024 - 2029) ── */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <i
                    className="bx bx-calendar-check"
                    style={{ color: "var(--gold)", fontSize: "1.2rem" }}
                  />
                  Matriks Iuran Kas Tahun {trackerYear}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: 8,
                    padding: 3,
                    border: "1px solid var(--border)",
                  }}
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setTrackerYear(y)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "none",
                        background:
                          trackerYear === y ? "var(--gold)" : "transparent",
                        color:
                          trackerYear === y ? "#1a1612" : "var(--fg-muted)",
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
                const rawJoinDate =
                  sessionUser?.anggotaSejak || sessionUser?.createdAt;
                if (rawJoinDate) {
                  const jd = new Date(rawJoinDate);
                  if (!isNaN(jd.getTime())) {
                    userJoinYear = jd.getFullYear();
                    userJoinMonth = jd.getMonth() + 1;
                  }
                }

                const isBeforeJoinYear = trackerYear < userJoinYear;
                const isJoinYear = trackerYear === userJoinYear;
                const startRequiredMonth = isJoinYear
                  ? userJoinMonth
                  : isBeforeJoinYear
                    ? 13
                    : 1;
                const totalRequiredMonths = isBeforeJoinYear
                  ? 0
                  : isJoinYear
                    ? 12 - userJoinMonth + 1
                    : 12;
                const totalPaidThisYear = monthlyStatus.filter(
                  (s) =>
                    Number(s.tahun) === trackerYear &&
                    s.status === "diverifikasi",
                ).length;

                return (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(70px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                        const isPaid = monthlyStatus.some(
                          (s) =>
                            Number(s.tahun) === trackerYear &&
                            Number(s.bulan) === m &&
                            s.status === "diverifikasi",
                        );
                        const isBeforeJoined =
                          isBeforeJoinYear || (isJoinYear && m < userJoinMonth);
                        const monthShort = [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "Mei",
                          "Jun",
                          "Jul",
                          "Agu",
                          "Sep",
                          "Okt",
                          "Nov",
                          "Des",
                        ][m - 1];

                        return (
                          <div
                            key={m}
                            style={{
                              padding: "10px 4px",
                              borderRadius: 10,
                              textAlign: "center",
                              background: isPaid
                                ? "rgba(16, 185, 129, 0.12)"
                                : isBeforeJoined
                                  ? "rgba(255, 255, 255, 0.01)"
                                  : "rgba(255, 255, 255, 0.03)",
                              border: isPaid
                                ? "1.5px solid rgba(16, 185, 129, 0.4)"
                                : "1px solid var(--border)",
                              opacity: isBeforeJoined && !isPaid ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "var(--fg-muted)",
                                marginBottom: 4,
                              }}
                            >
                              {monthShort}
                            </div>
                            <div
                              style={{
                                fontSize: "1.1rem",
                                color: isPaid ? "#10b981" : "var(--fg-muted)",
                              }}
                            >
                              {isPaid ? (
                                <i className="bx bx-check-circle" />
                              ) : isBeforeJoined ? (
                                <span
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: "var(--fg-muted)",
                                  }}
                                >
                                  -
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: 14,
                                    height: 14,
                                    border: "1.5px solid rgba(156,163,175,0.4)",
                                    borderRadius: 3,
                                  }}
                                />
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                marginTop: 4,
                                color: isPaid ? "#10b981" : "var(--fg-muted)",
                              }}
                            >
                              {isPaid
                                ? "Lunas"
                                : isBeforeJoined
                                  ? "Bebas"
                                  : "Belum"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                        fontSize: "0.78rem",
                        color: "var(--fg-muted)",
                      }}
                    >
                      <span>
                        Total Lunas {trackerYear}:{" "}
                        <strong style={{ color: "#10b981" }}>
                          {totalPaidThisYear} dari {totalRequiredMonths} Bulan
                          Wajib
                        </strong>
                        {isJoinYear &&
                          userJoinMonth > 1 &&
                          ` (Bergabung sejak ${["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][userJoinMonth - 1]} ${userJoinYear})`}
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
                        Bayar Kas Sekarang{" "}
                        <i className="bx bx-right-arrow-alt" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Filter Bar Riwayat Transaksi Kas Per-Tahun */}
            {kasHistory.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <i
                    className="bx bx-filter-alt"
                    style={{ color: "var(--gold)" }}
                  />
                  <span>Filter Riwayat Pembayaran:</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFilterTahunRiwayat("semua")}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 20,
                      border: "none",
                      background:
                        filterTahunRiwayat === "semua"
                          ? "var(--gold)"
                          : "rgba(255, 255, 255, 0.06)",
                      color:
                        filterTahunRiwayat === "semua"
                          ? "#000"
                          : "var(--fg-muted)",
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Semua ({kasHistory.length})
                  </button>
                  {[2026, 2025, 2024].map((yr) => {
                    const countInYear = kasHistory.filter((it) => {
                      const p = String(it.periode || "");
                      if (p.includes(String(yr))) return true;
                      const d = new Date(it.created_at || it.createdAt);
                      return !isNaN(d.getTime()) && d.getFullYear() === yr;
                    }).length;

                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setFilterTahunRiwayat(yr)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          border: "none",
                          background:
                            filterTahunRiwayat === yr
                              ? "var(--gold)"
                              : "rgba(255, 255, 255, 0.06)",
                          color:
                            filterTahunRiwayat === yr
                              ? "#000"
                              : "var(--fg-muted)",
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {yr} ({countInYear})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {loadingKasHistory ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--gold)",
                }}
              >
                <i
                  className="bx bx-loader-alt bx-spin"
                  style={{ fontSize: "2rem", marginBottom: "8px" }}
                />
                <p>Memuat riwayat...</p>
              </div>
            ) : kasHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="bx bx-wallet" />
                <p>Belum ada riwayat pembayaran kas tercatat.</p>
              </div>
            ) : (
              (() => {
                const filteredList =
                  filterTahunRiwayat === "semua"
                    ? kasHistory
                    : kasHistory.filter((it) => {
                        const p = String(it.periode || "");
                        if (p.includes(String(filterTahunRiwayat))) return true;
                        const d = new Date(it.created_at || it.createdAt);
                        return (
                          !isNaN(d.getTime()) &&
                          d.getFullYear() === filterTahunRiwayat
                        );
                      });

                if (filteredList.length === 0) {
                  return (
                    <div className={styles.emptyState}>
                      <i className="bx bx-calendar-x" />
                      <p>
                        Tidak ada riwayat pembayaran kas tercatat pada tahun{" "}
                        {filterTahunRiwayat}.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className={styles.historyList}>
                    {filteredList.map((item) => {
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
                      const proofUrl =
                        item.bukti_bayar_url || item.buktiBayarUrl;

                      return (
                        <div key={item.id} className={styles.historyItem}>
                          <div className={styles.historyLeft}>
                            <h4 className={styles.historyPeriode}>
                              {item.periode}
                            </h4>
                            <span className={styles.historyNominal}>
                              {formatRupiah(item.nominal)}
                            </span>
                            <span className={styles.historyDate}>
                              {dateFormatted}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 8,
                            }}
                          >
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
                );
              })()
            )}
          </div>
        )}

        {/* ── TAB KUPON REWARD KAS (FITUR BARU APRESIASI KAS) ── */}
        {portalTab === "kupon" && (
          <div className={`glassCard ${styles.dashCard}`}>
            <div className={styles.header}>
              <div className="badge">
                <i className="bx bx-gift" /> Reward Kas Eksklusif
              </div>
              <h1 className={styles.title}>Kupon &amp; Voucher Reward Kas</h1>
              <p className={styles.subtitle}>
                Apresiasi khusus dari fanbase Cavallery untuk anggota yang
                tertib dan rajin membayar uang kas bulanan.
              </p>
            </div>

            {/* Banner Status Kas User */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(201, 168, 76, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%)",
                border: "1.5px solid var(--border-gold, #c9a84c)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--gold)",
                    color: "#1a1612",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 900,
                  }}
                >
                  <i className="bx bx-award" />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "var(--primary)",
                    }}
                  >
                    Status Kas Anda:{" "}
                    {sessionUser?.jabatan === "Admin Fanbase"
                      ? "Pengurus Fanbase (Bebas Kas)"
                      : `${userLunasTahunIni} Bulan Lunas di Tahun ${new Date().getFullYear()}`}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--fg-muted)",
                      marginTop: 2,
                    }}
                  >
                    {sessionUser?.jabatan === "Admin Fanbase"
                      ? "Sebagai pengurus resmi, Anda berhak menerima seluruh kupon apresiasi fanbase."
                      : userLunasTahunIni >= 6
                        ? "Hebat! Anda termasuk anggota super rajin dalam membayar kas."
                        : userLunasTahunIni > 0
                          ? "Terima kasih telah membayar kas. Terus jaga keaktifan Anda untuk membuka lebih banyak reward!"
                          : "Ayo bayar uang kas bulanan Anda untuk membuka berbagai kupon & reward eksklusif."}
                  </div>
                </div>
              </div>

              {sessionUser?.jabatan !== "Admin Fanbase" &&
                userLunasTahunIni < 12 && (
                  <button
                    type="button"
                    onClick={() => setPortalTab("bayar")}
                    className={styles.backBtn}
                    style={{
                      color: "var(--gold)",
                      borderColor: "var(--border-gold)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <i className="bx bx-plus-circle" /> Bayar Kas Tambahan
                  </button>
                )}
            </div>

            {loadingUserKupons ? (
              <div className={styles.emptyState}>
                <i
                  className="bx bx-loader-alt bx-spin"
                  style={{ fontSize: "2rem", color: "var(--gold)" }}
                />
                <p>Memeriksa kupon reward Anda...</p>
              </div>
            ) : userKupons.length === 0 ? (
              <div
                className={styles.emptyState}
                style={{ padding: "40px 20px" }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: "1.8rem",
                    color: "var(--fg-muted)",
                  }}
                >
                  <i className="bx bx-purchase-tag-alt" />
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "var(--fg)",
                    marginBottom: 6,
                  }}
                >
                  Belum Ada Kupon Aktif
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--fg-muted)",
                    maxWidth: 440,
                    margin: "0 auto 18px",
                    lineHeight: 1.5,
                  }}
                >
                  Kupon reward dibagikan secara berkala oleh pengurus fanbase
                  kepada anggota yang aktif membayar kas. Tingkatkan riwayat
                  pembayaran kas Anda agar tidak ketinggalan kupon berikutnya!
                </p>
                <button
                  type="button"
                  className={styles.submitBtn}
                  style={{ maxWidth: 240, margin: "0 auto" }}
                  onClick={() => setPortalTab("bayar")}
                >
                  <i className="bx bx-wallet" /> Bayar Uang Kas Sekarang
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {userKupons.map((k) => {
                  const isCopied = copiedKupon === k.kode_kupon;
                  const isUsed = k.status_kupon === "digunakan";

                  return (
                    <div
                      key={k.kupon_anggota_id}
                      style={{
                        background: "var(--card-bg, #1a1612)",
                        border: isUsed
                          ? "1.5px solid var(--border)"
                          : "1.5px dashed var(--gold)",
                        borderRadius: 16,
                        padding: 18,
                        position: "relative",
                        overflow: "hidden",
                        opacity: isUsed ? 0.6 : 1,
                      }}
                    >
                      {/* Decorative Notch */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: isUsed ? "#64748b" : "var(--gold)",
                          color: "#1a1612",
                          padding: "4px 12px",
                          borderBottomLeftRadius: 10,
                          fontSize: "0.72rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                        }}
                      >
                        {isUsed ? "Sudah Digunakan" : k.tipe_reward}
                      </div>

                      <div
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          color: "var(--primary)",
                          marginTop: 10,
                          paddingRight: 60,
                        }}
                      >
                        {k.judul}
                      </div>

                      <div
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 900,
                          color: isUsed ? "var(--fg-muted)" : "var(--gold)",
                          margin: "8px 0",
                        }}
                      >
                        {k.nilai_reward}
                      </div>

                      {k.deskripsi && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--fg-muted)",
                            marginBottom: 14,
                            lineHeight: 1.4,
                          }}
                        >
                          {k.deskripsi}
                        </div>
                      )}

                      {/* Box Kode Kupon dengan Tombol Salin */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(0, 0, 0, 0.3)",
                          border: "1px solid var(--border)",
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "0.68rem",
                              color: "var(--fg-muted)",
                              textTransform: "uppercase",
                              fontWeight: 700,
                            }}
                          >
                            Kode Kupon
                          </div>
                          <div
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 900,
                              letterSpacing: "1px",
                              color: "#fff",
                            }}
                          >
                            {k.kode_kupon}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isUsed}
                          onClick={() => {
                            navigator.clipboard.writeText(k.kode_kupon);
                            setCopiedKupon(k.kode_kupon);
                            setTimeout(() => setCopiedKupon(null), 2500);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: isCopied ? "#10b981" : "var(--gold)",
                            color: isCopied ? "#fff" : "#1a1612",
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            cursor: isUsed ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            transition: "all 0.2s",
                          }}
                        >
                          <i
                            className={`bx ${isCopied ? "bx-check" : "bx-copy"}`}
                          />
                          {isCopied ? "Tersalin!" : "Salin"}
                        </button>
                      </div>

                      {/* Footer Kupon: Kadaluarsa */}
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--fg-muted)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          Syarat: Min. {k.min_bulan_kas} Bulan Kas {k.tahun_kas}
                        </span>
                        <span>
                          {k.kadaluarsa_pada
                            ? `Exp: ${new Date(k.kadaluarsa_pada).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
                            : "Tanpa Kadaluarsa"}
                        </span>
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
                Dukungan sukarela untuk perayaan ulang tahun, project fanbase,
                dan kegiatan bersama Erine.
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
                  Donasi Anda 100% digunakan untuk pembiayaan project fanbase
                  Erine & kegiatan resmi Cavallery.
                </span>
              </div>
            </div>

            {donasiAlert && (
              <div
                className={`${styles.alertBox} ${
                  donasiAlert.type === "success"
                    ? styles.alertSuccess
                    : styles.alertError
                }`}
              >
                <i
                  className={`bx ${donasiAlert.type === "success" ? "bx-check-circle" : "bx-error-circle"}`}
                />
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
                    <img
                      src={previewDonasi}
                      alt="Preview Bukti Donasi"
                      className={styles.previewImg}
                    />
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
                    <p className={styles.uploadText}>
                      Klik atau seret screenshot bukti donasi ke sini
                    </p>
                    <p className={styles.uploadHint}>
                      Format: JPG, PNG, WebP (Maks. 5MB)
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submittingDonasi}
              >
                {submittingDonasi ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" /> Mengirim
                    Donasi...
                  </>
                ) : (
                  <>
                    <i className="bx bx-paper-plane" /> Kirim Konfirmasi Donasi
                  </>
                )}
              </button>
            </form>

            {/* ── RIWAYAT DONASI SAYA ── */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <i
                    className="bx bx-receipt"
                    style={{ color: "var(--gold)" }}
                  />
                  Riwayat Donasi Saya
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
                  {donasiHistory.length} kontribusi tercatat
                </span>
              </div>

              {loadingDonasiHistory ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 0",
                    color: "var(--gold)",
                  }}
                >
                  <i
                    className="bx bx-loader-alt bx-spin"
                    style={{ fontSize: "1.8rem", marginBottom: 6 }}
                  />
                  <p style={{ margin: 0, fontSize: "0.85rem" }}>
                    Memuat riwayat donasi...
                  </p>
                </div>
              ) : donasiHistory.length === 0 ? (
                <div
                  className={styles.emptyState}
                  style={{ padding: "28px 16px" }}
                >
                  <i
                    className="bx bx-donate-heart"
                    style={{ fontSize: "2.2rem" }}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>
                    Belum ada riwayat donasi yang Anda kirimkan.
                  </p>
                </div>
              ) : (
                <div className={styles.donasiHistoryList}>
                  {donasiHistory.map((item) => {
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
                      <div key={item.id} className={styles.donasiHistoryItem}>
                        <div className={styles.donasiHistoryLeft}>
                          <h4 className={styles.donasiTipe}>
                            {item.tipe_donasi ||
                              item.tipeDonasi ||
                              "General Support"}
                          </h4>
                          <span className={styles.donasiNominal}>
                            {formatRupiah(item.nominal)}
                          </span>
                          <span className={styles.donasiDate}>
                            <i
                              className="bx bx-time-five"
                              style={{ marginRight: 4 }}
                            />
                            {dateFormatted}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 8,
                          }}
                        >
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

            {/* ── LEADERBOARD DONATUR CAVALLERY ── */}
            <div className={styles.leaderboardCard}>
              <div className={styles.leaderboardHeader}>
                <h3 className={styles.leaderboardTitle}>
                  <i className="bx bxs-trophy" style={{ color: "#f59e0b" }} />
                  Leaderboard Donatur Cavallery
                </h3>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--gold)",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="bx bx-award" /> Top Kontributor Fanbase
                </span>
              </div>

              {loadingLeaderboard ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 0",
                    color: "var(--gold)",
                  }}
                >
                  <i
                    className="bx bx-loader-alt bx-spin"
                    style={{ fontSize: "1.8rem", marginBottom: 6 }}
                  />
                  <p style={{ margin: 0, fontSize: "0.85rem" }}>
                    Memuat leaderboard donatur...
                  </p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div
                  className={styles.emptyState}
                  style={{ padding: "24px 16px" }}
                >
                  <i className="bx bx-trophy" style={{ fontSize: "2.2rem" }} />
                  <p style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>
                    Belum ada donasi terverifikasi di leaderboard.
                  </p>
                </div>
              ) : (
                <div className={styles.leaderboardList}>
                  {leaderboard.map((item, idx) => {
                    const rank = idx + 1;
                    let rankClass = styles.rankBadge;
                    let itemClass = styles.leaderboardItem;

                    if (rank === 1) {
                      rankClass = `${styles.rankBadge} ${styles.rankBadge1}`;
                      itemClass = `${styles.leaderboardItem} ${styles.leaderboardItemTop1}`;
                    } else if (rank === 2) {
                      rankClass = `${styles.rankBadge} ${styles.rankBadge2}`;
                      itemClass = `${styles.leaderboardItem} ${styles.leaderboardItemTop2}`;
                    } else if (rank === 3) {
                      rankClass = `${styles.rankBadge} ${styles.rankBadge3}`;
                      itemClass = `${styles.leaderboardItem} ${styles.leaderboardItemTop3}`;
                    }

                    return (
                      <div key={item.id || idx} className={itemClass}>
                        <div className={rankClass}>
                          {rank === 1 ? <i className="bx bxs-crown" /> : rank}
                        </div>

                        <div className={styles.donorInfo}>
                          <span className={styles.donorName}>
                            {item.donor_name || "Ksatria Cavallery"}
                          </span>
                          <span className={styles.donorMeta}>
                            <span
                              style={{
                                padding: "1px 6px",
                                borderRadius: 4,
                                background:
                                  item.donor_type === "Anggota"
                                    ? "rgba(17, 85, 204, 0.12)"
                                    : "rgba(245, 158, 11, 0.12)",
                                color:
                                  item.donor_type === "Anggota"
                                    ? "#3b82f6"
                                    : "#f59e0b",
                                fontWeight: 700,
                                fontSize: "0.68rem",
                              }}
                            >
                              {item.donor_type || "Donatur"}
                            </span>
                            <span>
                              • {item.tipe_donasi || "General Support"}
                            </span>
                          </span>
                        </div>

                        <div className={styles.donorNominal}>
                          {formatRupiah(item.nominal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── TAB 4: WAR TIKET PROJECT STS ERINE (TEAM PASSION FIRE) ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {portalTab === "war" && (
          <div className={styles.warCard}>
            {/* Header Event */}
            <div className={styles.warCardHeader}>
              <div className={styles.warTitleWrap}>
                <h2 className={styles.warMainTitle}>
                  <i className="bx bx-flame" style={{ color: "#ef4444" }} />
                  {warEvent?.judul || "War Tiket Project STS Erine 19th"}
                </h2>
                <p className={styles.warSubtitle}>
                  {warEvent?.deskripsi ||
                    "Akses khusus project perayaan Seitansai Catherina Vallencia (Erine) ke-19 bersama Cavallery Team Passion."}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {loadingWar ? (
                  <span className={`${styles.warStatusBadge} ${styles.warStatusWaiting}`}>
                    <i className="bx bx-loader-alt bx-spin" /> Memuat...
                  </span>
                ) : userWarTicket ? (
                  <span
                    className={styles.warStatusBadge}
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid #10b981",
                      color: "#10b981",
                    }}
                  >
                    <i className="bx bx-check-circle" /> TIKET KAMU TERKONFIRMASI
                  </span>
                ) : !warTimeLeft.isStarted ? (
                  <span className={`${styles.warStatusBadge} ${styles.warStatusWaiting}`}>
                    <i className="bx bx-time-five" /> WAR BELUM DIBUKA
                  </span>
                ) : warEvent && warEvent.kuota_terisi >= warEvent.kuota_total ? (
                  <span
                    className={styles.warStatusBadge}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                    }}
                  >
                    <i className="bx bx-x-circle" /> KUOTA HABIS
                  </span>
                ) : warTimeLeft.isEnded || warEvent?.status === "tutup" ? (
                  <span className={`${styles.warStatusBadge} ${styles.warStatusClosed}`}>
                    <i className="bx bx-lock-alt" /> WAR TELAH DITUTUP
                  </span>
                ) : (
                  <span className={`${styles.warStatusBadge} ${styles.warStatusOpen}`}>
                    <i className="bx bx-broadcast" /> WAR SEDANG BERLANGSUNG
                  </span>
                )}
              </div>
            </div>

            {/* Alert Message */}
            {warAlert && (
              <div
                style={{
                  padding: "12px 18px",
                  borderRadius: 14,
                  background:
                    warAlert.type === "success"
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${warAlert.type === "success" ? "#10b981" : "#ef4444"}`,
                  color: warAlert.type === "success" ? "#10b981" : "#ef4444",
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <i
                  className={`bx ${warAlert.type === "success" ? "bx-check-circle" : "bx-error-circle"}`}
                  style={{ fontSize: "1.2rem" }}
                />
                <span>{warAlert.msg}</span>
              </div>
            )}

            {/* ── JIKA USER SUDAH PUNYA TIKET: TAMPILKAN E-TICKET PASS MEWAH VIP STUB ── */}
            {userWarTicket ? (
              <div className={styles.warTicketPass}>
                <div className={styles.ticketTopBadge}>
                  {warEvent?.kategori_tiket || "★ OFFICIAL VIP PASS • TEAM PASSION ★"}
                </div>

                <h2 className={styles.ticketEventTitle}>
                  {warEvent?.judul || "PROJECT STS ERINE 19TH BIRTHDAY"}
                </h2>
                <div className={styles.ticketEventSub}>
                  {warEvent?.subjudul || "Cavallery • Fanbase Resmi Erine JKT48"}
                </div>

                <div className={styles.ticketNumberBadge}>
                  #{userWarTicket.nomor_tiket}
                </div>

                {/* Member Info Card */}
                <div className={styles.ticketOwnerCard}>
                  <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Pemegang Tiket Resmi
                  </div>
                  <h3 className={styles.ticketOwnerName}>
                    {userWarTicket.nama_lengkap || displayName}
                  </h3>
                  <div className={styles.ticketMetaRow}>
                    <span>No. Anggota: <strong style={{ color: "var(--gold)" }}>{userWarTicket.no_anggota || sessionUser.noAnggota}</strong></span>
                    <span>•</span>
                    <span className={styles.ticketStatusChip}>
                      <i className="bx bx-check-shield" /> Terverifikasi
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 700, margin: "6px 0 2px" }}>
                    <i className="bx bx-map-pin" style={{ marginRight: 4 }} />
                    {warEvent?.lokasi_event || "Theater JKT48"} • {warEvent?.tanggal_event || "September 2026"}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--fg-muted)" }}>
                    Waktu Registrasi: {new Date(userWarTicket.waktu_klaim).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • {new Date(userWarTicket.waktu_klaim).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </div>
                </div>

                {/* Perforated Tear Line */}
                <div className={styles.ticketPerforationLine}>
                  <div className={styles.ticketPerforationDash} />
                </div>

                {/* Stub QR & Barcode Section */}
                <div className={styles.ticketStubSection}>
                  <div className={styles.ticketQrBox}>
                    <div style={{ textAlign: "center" }}>
                      <i className="bx bx-qr-scan" style={{ fontSize: "4.2rem", color: "#1c1813" }} />
                      <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 800, marginTop: 2 }}>
                        {userWarTicket.nomor_tiket}
                      </div>
                    </div>
                  </div>

                  <div className={styles.ticketBarcodeWrap}>
                    <div className={styles.ticketBarcodeLines}>
                      {[3, 1, 4, 2, 1, 5, 2, 3, 1, 4, 2, 1, 3, 5, 1, 2, 4, 1, 3, 2, 5, 1, 2, 4].map((w, i) => (
                        <div
                          key={i}
                          style={{
                            width: `${w * 1.8}px`,
                            height: "26px",
                            background: i % 2 === 0 ? "var(--fg)" : "transparent",
                            borderRadius: "1px",
                          }}
                        />
                      ))}
                    </div>
                    <div className={styles.ticketBarcodeNumber}>
                      *{warEvent?.kode_tiket || "STS19"}-{userWarTicket.nomor_tiket}-{userWarTicket.no_anggota || sessionUser.noAnggota}*
                    </div>
                  </div>
                </div>

                {/* Event Notice Box (Tinggal Datang & Tunjukkan, Tidak Perlu Diprint) */}
                <div className={styles.ticketNoticeBox}>
                  <i className={`bx bx-mobile ${styles.ticketNoticeIcon}`} />
                  <div>
                    <strong style={{ color: "var(--gold)", display: "block", marginBottom: 3 }}>
                      Tunjukkan Tiket di Ponsel pada Hari Acara
                    </strong>
                    Simpan gambar tiket ini di ponsel Anda. Pada hari acara, cukup tunjukkan e-ticket digital ini kepada panitia Cavallery di venue untuk penukaran wristband masuk. Tidak perlu dicetak/diprint.
                  </div>
                </div>

                {/* Tombol Unduh E-Ticket (Gambar PNG) */}
                <div style={{ width: "100%", marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleDownloadETicket}
                    disabled={downloadingTicket}
                    className={styles.ticketDownloadBtn}
                  >
                    {downloadingTicket ? (
                      <>
                        <i className="bx bx-loader-alt bx-spin" /> Menyiapkan Tiket HD...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-download" /> Unduh E-Ticket (Simpan Gambar PNG)
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ── JIKA BELUM PUNYA TIKET: COUNTDOWN + KUOTA + TOMBOL WAR ── */}
                {/* Countdown Timer */}
                {!warTimeLeft.isStarted && (
                  <div className={styles.warCountdownWrap}>
                    <div className={styles.countdownHeading}>
                      <i className="bx bx-alarm" /> Hitung Mundur War Tiket
                    </div>
                    <div className={styles.countdownBoxes}>
                      <div className={styles.countdownBox}>
                        <span className={styles.countdownNum}>
                          {String(warTimeLeft.days).padStart(2, "0")}
                        </span>
                        <span className={styles.countdownLabel}>Hari</span>
                      </div>
                      <div className={styles.countdownBox}>
                        <span className={styles.countdownNum}>
                          {String(warTimeLeft.hours).padStart(2, "0")}
                        </span>
                        <span className={styles.countdownLabel}>Jam</span>
                      </div>
                      <div className={styles.countdownBox}>
                        <span className={styles.countdownNum}>
                          {String(warTimeLeft.minutes).padStart(2, "0")}
                        </span>
                        <span className={styles.countdownLabel}>Menit</span>
                      </div>
                      <div className={styles.countdownBox}>
                        <span className={styles.countdownNum}>
                          {String(warTimeLeft.seconds).padStart(2, "0")}
                        </span>
                        <span className={styles.countdownLabel}>Detik</span>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", margin: 0 }}>
                      Tombol War akan otomatis aktif serentak saat hitung mundur mencapai 00:00:00.
                    </p>
                  </div>
                )}

                {/* Progress Kuota Tiket */}
                {warEvent && (
                  <div className={styles.warQuotaWrap}>
                    <div className={styles.quotaTextRow}>
                      <span style={{ color: "var(--fg-muted)" }}>
                        <i className="bx bx-group" style={{ marginRight: 4 }} />
                        Kuota Terisi: <strong>{warEvent.kuota_terisi} / {warEvent.kuota_total} Tiket</strong>
                      </span>
                      <span style={{ color: warEvent.sisa_kuota <= 5 ? "#ef4444" : "#10b981" }}>
                        <i className="bx bx-check-shield" style={{ marginRight: 4 }} />
                        Sisa Slot: <strong>{warEvent.sisa_kuota} Tiket</strong>
                      </span>
                    </div>
                    <div className={styles.quotaBarBg}>
                      <div
                        className={styles.quotaBarFill}
                        style={{
                          width: `${Math.min(100, Math.round((warEvent.kuota_terisi / warEvent.kuota_total) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Tombol Utama WAR TIKET */}
                <div style={{ marginTop: 8 }}>
                  {!warTimeLeft.isStarted ? (
                    <button
                      type="button"
                      disabled
                      className={styles.warFlameBtn}
                      style={{ opacity: 0.6, cursor: "not-allowed", filter: "grayscale(40%)" }}
                    >
                      <i className="bx bx-time" /> War Belum Dibuka
                    </button>
                  ) : warEvent && warEvent.kuota_terisi >= warEvent.kuota_total ? (
                    <button
                      type="button"
                      disabled
                      className={styles.warFlameBtn}
                      style={{
                        background: "#4b5563",
                        boxShadow: "none",
                        cursor: "not-allowed",
                      }}
                    >
                      <i className="bx bx-x-circle" /> Mohon Maaf, Kuota Tiket Sudah Habis
                    </button>
                  ) : warTimeLeft.isEnded || warEvent?.status === "tutup" ? (
                    <button
                      type="button"
                      disabled
                      className={styles.warFlameBtn}
                      style={{
                        background: "#4b5563",
                        boxShadow: "none",
                        cursor: "not-allowed",
                      }}
                    >
                      <i className="bx bx-lock-alt" /> Periode War Tiket Telah Berakhir
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClaimWarTicket}
                      disabled={claimingWar}
                      className={styles.warFlameBtn}
                    >
                      {claimingWar ? (
                        <>
                          <i className="bx bx-loader-alt bx-spin" /> Memproses Antrean Tiket...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-flame" /> WAR TIKET SEKARANG!
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Syarat & Ketentuan Card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "16px 20px",
                fontSize: "0.82rem",
                color: "var(--fg-muted)",
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--fg)",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bx bx-info-circle" style={{ color: "var(--gold)" }} />
                Syarat &amp; Ketentuan War Tiket:
              </div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                <li>Setiap 1 akun anggota Cavallery hanya berhak mendapatkan maksimal 1 tiket.</li>
                <li>Sistem mengalokasikan nomor tiket secara urut dan instan berdasarkan kecepatan klik server.</li>
                <li>E-Ticket yang diperoleh wajib ditunjukkan kepada panitia Cavallery saat verifikasi di venue.</li>
                <li>Tiket tidak dapat diperjualbelikan atau dipindahtangankan tanpa persetujuan admin.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL POPUP VERIFIKASI ANGGOTA ── */}
      {showVerifyModal && (
        <div
          className={styles.verifyModalOverlay}
          onClick={() => setShowVerifyModal(false)}
        >
          <div
            className={styles.verifyModalCard}
            onClick={(e) => e.stopPropagation()}
          >
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
              {sessionUser.status === "aktif"
                ? "Aktif"
                : sessionUser.status || "Aktif"}
            </span>

            <h3 className={styles.verifyMemberName}>{displayName}</h3>
            <p className={styles.verifyMemberCode}>
              {sessionUser.noAnggota || "CAVA-0001"}
            </p>

            <span className={styles.verifyRoleBadge}>
              {sessionUser.jabatan === "Admin Fanbase" ? (
                <>
                  <i className="bx bxs-crown" style={{ marginRight: 5 }} />{" "}
                  Admin Fanbase{" "}
                  {sessionUser.divisi ? `• ${sessionUser.divisi}` : ""}
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
