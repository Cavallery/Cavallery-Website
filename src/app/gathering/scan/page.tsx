"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { getMemberBadge } from "@/lib/badges";

/* ─── QR decode via jsQR from CDN ─── */
declare global {
  interface Window {
    jsQR?: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;
  }
}

function loadJsQR(): Promise<void> {
  return new Promise((resolve) => {
    if (window.jsQR) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

// Suara beep sintesis menggunakan Web Audio API (tanpa butuh aset file mp3 eksternal)
function playBeep(type: "success" | "warning" | "error") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "warning") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {}
}

type ScanResult = {
  no_anggota?: string;
  nama_lengkap?: string;
  domisili?: string;
  id_line?: string;
  badge?: string;
  foto_profil?: string;
  waktu_hadir?: string;
  status: "success" | "already" | "notfound" | "error";
  message: string;
};

export default function GatheringScanPage() {
  const [eventName, setEventName] = useState("Gathering Offline Cavallery 2026");
  const [editingEventName, setEditingEventName] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);

  const [scanning, setScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data Kehadiran
  const [attendees, setAttendees] = useState<any[]>([]);
  const [memberDirectory, setMemberDirectory] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalHadir: number; totalAnggota: number; perBadge: Record<string, number> }>({
    totalHadir: 0,
    totalAnggota: 0,
    perBadge: {},
  });

  // Manual Check-in
  const [manualQuery, setManualQuery] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  // Fetch data presensi & direktori anggota
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch(`/api/gathering?event=${encodeURIComponent(eventName)}`);
      const json = await res.json();
      if (json.success) {
        setAttendees(json.data || []);
        setStats(json.stats || { totalHadir: 0, totalAnggota: 0, perBadge: {} });
        if (json.members) setMemberDirectory(json.members);
      }
    } catch (e) {
      console.error("Gagal mengambil data kehadiran:", e);
    }
  }, [eventName]);

  useEffect(() => {
    document.title = "Cavallery | Scanner Presensi Gathering";
    fetchAttendance();
  }, [fetchAttendance]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  const handleProcessScan = useCallback(
    async (code: string) => {
      if (cooldownRef.current || code === lastScannedRef.current) return;
      cooldownRef.current = true;
      lastScannedRef.current = code;
      setLoading(true);

      try {
        const res = await fetch("/api/gathering", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "checkin",
            qrData: code,
            eventName,
          }),
        });
        const json = await res.json();

        let scanResult: ScanResult;

        if (json.status === "already") {
          playBeep("warning");
          scanResult = {
            no_anggota: json.item?.no_anggota,
            nama_lengkap: json.item?.nama_lengkap,
            domisili: json.item?.domisili,
            id_line: json.item?.id_line,
            badge: json.item?.badge,
            foto_profil: json.item?.foto_profil,
            waktu_hadir: json.item?.waktu_hadir,
            status: "already",
            message: json.message || "Anggota sudah check-in sebelumnya",
          };
        } else if (json.status === "success") {
          playBeep("success");
          scanResult = {
            no_anggota: json.item?.no_anggota,
            nama_lengkap: json.item?.nama_lengkap,
            domisili: json.item?.domisili,
            id_line: json.item?.id_line,
            badge: json.item?.badge,
            foto_profil: json.item?.foto_profil,
            waktu_hadir: json.item?.waktu_hadir,
            status: "success",
            message: json.message || "Berhasil presensi gathering!",
          };
          fetchAttendance();
        } else {
          playBeep("error");
          scanResult = {
            status: "notfound",
            message: json.message || `Data KTA (${code}) tidak ditemukan di sistem`,
          };
        }

        setResult(scanResult);
      } catch (err: any) {
        playBeep("error");
        setResult({
          status: "error",
          message: err.message || "Gagal menghubungi server database",
        });
      } finally {
        setLoading(false);
        setTimeout(() => {
          cooldownRef.current = false;
          lastScannedRef.current = "";
        }, 2800);
      }
    },
    [eventName, fetchAttendance]
  );

  const startScan = useCallback(async () => {
    setError("");
    setResult(null);
    try {
      await loadJsQR();
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Cek fitur senter/torch
      const track = stream.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      }

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const tick = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx || !video.videoWidth) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR?.(imageData.data, canvas.width, canvas.height);

        if (code?.data) {
          const raw = code.data.trim();
          if (raw) {
            handleProcessScan(raw);
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setError("Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan di browser Anda.");
    }
  }, [facingMode, handleProcessScan]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const next = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: next } as any],
        });
        setTorchOn(next);
      } catch {}
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    if (scanning) {
      startScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Handle Manual Check-in
  const handleManualCheckin = async (memberItem: any) => {
    if (manualSubmitting) return;
    setManualSubmitting(true);
    try {
      const res = await fetch("/api/gathering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_checkin",
          memberId: memberItem.id,
          noAnggotaInput: memberItem.no_anggota,
          namaLengkapInput: memberItem.nama_lengkap,
          eventName,
          catatan: "Presensi manual panitia",
        }),
      });
      const json = await res.json();
      if (json.status === "already") {
        playBeep("warning");
        setResult({
          no_anggota: json.item?.no_anggota,
          nama_lengkap: json.item?.nama_lengkap,
          badge: json.item?.badge,
          waktu_hadir: json.item?.waktu_hadir,
          status: "already",
          message: json.message,
        });
      } else if (json.success) {
        playBeep("success");
        setResult({
          no_anggota: json.item?.no_anggota,
          nama_lengkap: json.item?.nama_lengkap,
          badge: json.item?.badge,
          waktu_hadir: json.item?.waktu_hadir,
          status: "success",
          message: json.message,
        });
        setManualQuery("");
        fetchAttendance();
      } else {
        playBeep("error");
        alert(json.message || "Gagal melakukan presensi manual");
      }
    } catch (e: any) {
      alert(e.message || "Terjadi kesalahan saat presensi manual");
    } finally {
      setManualSubmitting(false);
    }
  };

  // Hapus Presensi
  const handleDeleteAttendance = async (id: number | string, nama: string) => {
    if (!confirm(`Hapus presensi untuk ${nama}?`)) return;
    try {
      const res = await fetch("/api/gathering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAttendance();
      }
    } catch {}
  };

  // Filter daftar hadir
  const filteredAttendees = attendees.filter((a) => {
    if (!searchTableQuery.trim()) return true;
    const q = searchTableQuery.toLowerCase();
    return (
      (a.nama_lengkap && a.nama_lengkap.toLowerCase().includes(q)) ||
      (a.no_anggota && a.no_anggota.toLowerCase().includes(q)) ||
      (a.domisili && a.domisili.toLowerCase().includes(q)) ||
      (a.badge && a.badge.toLowerCase().includes(q))
    );
  });

  // Filter anggota manual
  const filteredManualMembers = manualQuery.trim()
    ? memberDirectory.filter((m) => {
        const q = manualQuery.toLowerCase();
        return (
          (m.nama_lengkap && m.nama_lengkap.toLowerCase().includes(q)) ||
          (m.no_anggota && m.no_anggota.toLowerCase().includes(q)) ||
          (m.id_line && m.id_line.toLowerCase().includes(q))
        );
      }).slice(0, 5)
    : [];

  const statusColor = (s?: string) =>
    s === "success" ? "#10b981" : s === "already" ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f0c",
        backgroundImage: "radial-gradient(ellipse at 50% 15%, rgba(201, 168, 76, 0.08) 0%, transparent 75%)",
        color: "#fff",
        fontFamily: "var(--font-jakarta, sans-serif)",
        paddingBottom: 60,
      }}
    >
      {/* ── TOP NAV HEADER ── */}
      <div
        style={{
          background: "#111a14",
          borderBottom: "1px solid #1e2d22",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/internal/dashboard-admin-xv7r2q/keanggotaan"
            style={{
              color: "#c9a84c",
              textDecoration: "none",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
            }}
          >
            <i className="bx bx-arrow-back" /> Admin Keanggotaan
          </Link>
          <span style={{ color: "#3a4a3e" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a84c, #8b6e28)",
                color: "#0a0f0c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              ♞
            </span>
            <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: 16 }}>
              Scanner Presensi Gathering
            </span>
          </div>
        </div>

        {/* Action Excel Download */}
        <a
          href={`/api/gathering/export?event=${encodeURIComponent(eventName)}`}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: 50,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
          }}
        >
          <i className="bx bx-download" style={{ fontSize: 16 }} />
          <span>Unduh Data Excel (.csv)</span>
        </a>
      </div>

      <div style={{ maxWidth: 650, margin: "0 auto", padding: "20px 16px" }}>
        {/* ── EVENT NAME BANNER ── */}
        <div
          style={{
            background: "#141f18",
            border: "1px solid #233729",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: "0.72rem", color: "#a0a8a3", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Event Gathering Aktif
            </span>
            {editingEventName ? (
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  style={{
                    background: "#0a0f0c",
                    border: "1px solid #c9a84c",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 14,
                    flex: 1,
                  }}
                />
                <button
                  onClick={() => setEditingEventName(false)}
                  style={{
                    background: "#c9a84c",
                    color: "#0a0f0c",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  OK
                </button>
              </div>
            ) : (
              <div style={{ fontWeight: 800, fontSize: 16, color: "#f6e7bf", marginTop: 2 }}>
                {eventName}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditingEventName(!editingEventName)}
            style={{
              background: "transparent",
              color: "#c9a84c",
              border: "1px solid rgba(201, 168, 76, 0.4)",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <i className="bx bx-edit" /> Ubah Event
          </button>
        </div>

        {/* ── STATS SUMMARY BAR ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: 14,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(16, 185, 129, 0.2)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              <i className="bx bx-user-check" />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#a0a8a3", fontWeight: 600 }}>Total Hadir</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#10b981" }}>
                {stats.totalHadir} <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#a0a8a3" }}>Orang</span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(201, 168, 76, 0.15) 0%, rgba(139, 110, 40, 0.05) 100%)",
              border: "1px solid rgba(201, 168, 76, 0.35)",
              borderRadius: 14,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(201, 168, 76, 0.2)",
                color: "#c9a84c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              <i className="bx bx-group" />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#a0a8a3", fontWeight: 600 }}>Total Anggota</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffd778" }}>
                {stats.totalAnggota || attendees.length} <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#a0a8a3" }}>Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CAMERA VIEWPORT ── */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "#111",
            border: "2px solid #1e2d22",
            marginBottom: 16,
            boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
          }}
        >
          <video
            ref={videoRef}
            style={{ width: "100%", display: "block", maxHeight: 380, objectFit: "cover" }}
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Scanning Overlay (Kotak Bidik + Laser) */}
          {scanning && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 220,
                  height: 220,
                  border: "2px solid rgba(201, 168, 76, 0.4)",
                  borderRadius: 16,
                  position: "relative",
                  boxShadow: "0 0 0 3000px rgba(0,0,0,0.45)",
                }}
              >
                {/* 4 Sudut Emas */}
                {[
                  { top: -3, left: -3, borderTop: "4px solid #c9a84c", borderLeft: "4px solid #c9a84c" },
                  { top: -3, right: -3, borderTop: "4px solid #c9a84c", borderRight: "4px solid #c9a84c" },
                  { bottom: -3, left: -3, borderBottom: "4px solid #c9a84c", borderLeft: "4px solid #c9a84c" },
                  { bottom: -3, right: -3, borderBottom: "4px solid #c9a84c", borderRight: "4px solid #c9a84c" },
                ].map((corner, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      ...corner,
                    }}
                  />
                ))}

                {/* Laser scan line animasi */}
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    right: 4,
                    height: 2,
                    background: "linear-gradient(90deg, transparent, #10b981, #c9a84c, transparent)",
                    boxShadow: "0 0 10px #10b981",
                    animation: "scanPulse 2s ease-in-out infinite alternate",
                    top: "50%",
                  }}
                />
              </div>
            </div>
          )}

          {/* Placeholder Kamera Mati */}
          {!scanning && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(10, 15, 12, 0.92)",
                padding: 30,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(201, 168, 76, 0.12)",
                  border: "1.5px solid rgba(201, 168, 76, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#c9a84c",
                  fontSize: 34,
                }}
              >
                <i className="bx bx-camera" />
              </div>
              <div style={{ color: "#fff3d0", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                Kamera Scanner Siap Digunakan
              </div>
              <p style={{ color: "#a0a8a3", fontSize: 13, maxWidth: 360, margin: "0 auto 18px", lineHeight: 1.5 }}>
                Arahkan kamera ke QR Code di sisi belakang KTA Digital anggota untuk mencatat kehadiran gathering offline.
              </p>
              <button
                onClick={startScan}
                style={{
                  background: "linear-gradient(135deg, #c9a84c 0%, #a8842e 100%)",
                  color: "#0a0f0c",
                  border: "none",
                  borderRadius: 50,
                  padding: "12px 28px",
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 6px 20px rgba(201, 168, 76, 0.3)",
                }}
              >
                <i className="bx bx-camera" style={{ fontSize: 18 }} /> Buka Kamera & Mulai Scan
              </button>
            </div>
          )}

          {/* Quick Toolbar Camera Controls (saat aktif) */}
          {scanning && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                display: "flex",
                gap: 8,
                zIndex: 10,
              }}
            >
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  style={{
                    background: torchOn ? "#c9a84c" : "rgba(0,0,0,0.6)",
                    color: torchOn ? "#000" : "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 50,
                    width: 38,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Flashlight"
                >
                  <i className="bx bx-sun" style={{ fontSize: 18 }} />
                </button>
              )}
              <button
                type="button"
                onClick={switchCamera}
                style={{
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 50,
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title="Putar Kamera"
              >
                <i className="bx bx-sync" style={{ fontSize: 18 }} />
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "#1a0a0a",
              border: "1px solid #ef4444",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 16,
              color: "#ef4444",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="bx bx-error-circle" style={{ fontSize: 20 }} /> {error}
          </div>
        )}

        {/* Main Control Button saat Kamera Aktif */}
        {scanning && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button
              onClick={stopCamera}
              style={{
                flex: 1,
                background: "#1e2d22",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: 12,
                padding: "12px 0",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <i className="bx bx-stop-circle" style={{ fontSize: 18 }} /> Matikan Kamera
            </button>
          </div>
        )}

        {/* ── RESULT CARD MODAL / NOTIFICATION ── */}
        {(result || loading) && (
          <div
            style={{
              background: "#111a14",
              border: `2px solid ${loading ? "#c9a84c" : statusColor(result?.status)}`,
              borderRadius: 18,
              padding: "22px 24px",
              marginBottom: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", color: "#c9a84c", padding: "10px 0" }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 38, marginBottom: 8, display: "block" }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Memverifikasi KTA Anggota...</span>
              </div>
            ) : result ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  {result.status === "success" ? (
                    <i className="bx bxs-check-circle" style={{ color: "#10b981", fontSize: 52 }} />
                  ) : result.status === "already" ? (
                    <i className="bx bxs-error-alt" style={{ color: "#f59e0b", fontSize: 52 }} />
                  ) : (
                    <i className="bx bxs-x-circle" style={{ color: "#ef4444", fontSize: 52 }} />
                  )}
                </div>

                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: 18,
                    color: statusColor(result.status),
                    marginBottom: 10,
                  }}
                >
                  {result.message}
                </div>

                {/* Member Info Snippet */}
                {result.nama_lengkap && (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      marginTop: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        border: "2px solid #c9a84c",
                        overflow: "hidden",
                        background: "#181818",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          result.foto_profil && typeof result.foto_profil === "string" && !result.foto_profil.includes("jkt48connect.com")
                            ? (result.foto_profil.startsWith("uploads/") ? `/${result.foto_profil}` : result.foto_profil)
                            : "/images/cava-logo-round.png"
                        }
                        alt="Foto"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/cava-logo-round.png";
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#fff3d0" }}>
                        {result.nama_lengkap}
                      </div>
                      <div style={{ fontSize: 13, color: "#f59e0b", fontFamily: "monospace", fontWeight: 700 }}>
                        {result.no_anggota}
                      </div>
                      <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#a0a8a3", marginTop: 4 }}>
                        {result.domisili && <span>📍 {result.domisili}</span>}
                        {result.id_line && <span>💬 LINE: {result.id_line}</span>}
                        {result.badge && (() => {
                          const b = getMemberBadge(result.badge);
                          return <span style={{ color: b.color, fontWeight: 700 }}>🎖️ {b.name}</span>;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ── MANUAL INPUT CHECK-IN (UNTUK KASUS HP RUSAK / GELAP) ── */}
        <div
          style={{
            background: "#111a14",
            border: "1px solid #1e2d22",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#c9a84c", fontWeight: 700, fontSize: 14 }}>
            <i className="bx bx-search-alt" style={{ fontSize: 18 }} />
            <span>Pencarian & Presensi Manual (Tanpa QR)</span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Cari nama lengkap, No Anggota (CAVA-...), atau ID LINE..."
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#0a0f0c",
                border: "1px solid #2e4435",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#ffffff",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
            {filteredManualMembers.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#16221b",
                  border: "1px solid #2e4435",
                  borderRadius: 10,
                  marginTop: 6,
                  zIndex: 20,
                  boxShadow: "0 10px 24px rgba(0,0,0,0.6)",
                  overflow: "hidden",
                }}
              >
                {filteredManualMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleManualCheckin(m)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #1e2d22",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1f3026")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff3d0" }}>{m.nama_lengkap}</div>
                      <div style={{ fontSize: 12, color: "#c9a84c", fontFamily: "monospace" }}>{m.no_anggota}</div>
                    </div>
                    <button
                      type="button"
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Hadirkan ✓
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── DAFTAR HADIR TERVERIFIKASI REAL-TIME ── */}
        <div
          style={{
            background: "#111a14",
            border: "1px solid #1e2d22",
            borderRadius: 18,
            padding: "20px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#fff3d0", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bx bx-list-check" style={{ color: "#10b981", fontSize: 20 }} />
                Daftar Hadir Terverifikasi ({attendees.length})
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                Anggota yang sudah berhasil scan & presensi hari ini
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Filter nama/no..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                style={{
                  background: "#0a0f0c",
                  border: "1px solid #233729",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 12,
                  color: "#fff",
                  width: 140,
                }}
              />
              <a
                href={`/api/gathering/export?event=${encodeURIComponent(eventName)}`}
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <i className="bx bx-file" /> Excel
              </a>
            </div>
          </div>

          {filteredAttendees.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 10px", color: "#6b7280", fontSize: 13 }}>
              <i className="bx bx-calendar-x" style={{ fontSize: 36, display: "block", marginBottom: 8, opacity: 0.5 }} />
              Belum ada anggota yang check-in pada event ini.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
              {filteredAttendees.map((a, idx) => {
                const b = getMemberBadge(a.badge);
                const timeStr = a.waktu_hadir
                  ? new Date(a.waktu_hadir).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                  : "-";
                return (
                  <div
                    key={a.id || idx}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontFamily: "monospace",
                          width: 24,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: "#1a251e",
                          border: "1px solid #c9a84c",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={
                            a.foto_profil && typeof a.foto_profil === "string" && !a.foto_profil.includes("jkt48connect.com")
                              ? (a.foto_profil.startsWith("uploads/") ? `/${a.foto_profil}` : a.foto_profil)
                              : "/images/cava-logo-round.png"
                          }
                          alt="Avatar"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/cava-logo-round.png";
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#fff3d0" }}>
                          {a.nama_lengkap}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "#a0a8a3", marginTop: 2 }}>
                          <span style={{ fontFamily: "monospace", color: "#c9a84c" }}>{a.no_anggota}</span>
                          <span>•</span>
                          <span style={{ color: b.color, fontWeight: 700 }}>{b.name}</span>
                          {a.domisili && (
                            <>
                              <span>•</span>
                              <span>{a.domisili}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>{timeStr} WIB</div>
                        <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase" }}>
                          {a.metode_checkin === "manual" ? "Manual" : "QR Scan"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAttendance(a.id, a.nama_lengkap)}
                        style={{
                          background: "transparent",
                          color: "#ef4444",
                          border: "none",
                          cursor: "pointer",
                          padding: 6,
                          borderRadius: 6,
                          opacity: 0.7,
                        }}
                        title="Hapus Presensi"
                      >
                        <i className="bx bx-trash" style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
