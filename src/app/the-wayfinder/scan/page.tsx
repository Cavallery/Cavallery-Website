"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── QR decode via jsQR from CDN ─── */
declare global {
  interface Window {
    jsQR?: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;
  }
}

function loadJsQR(): Promise<void> {
  return new Promise((resolve) => {
    if (window.jsQR) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

type ScanResult = {
  slug: string;
  name: string;
  checked_in: boolean;
  checked_in_at?: string;
  status: "success" | "already" | "notfound" | "error";
  message: string;
};

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleCheckin = useCallback(async (slug: string) => {
    if (cooldownRef.current || slug === lastScannedRef.current) return;
    cooldownRef.current = true;
    lastScannedRef.current = slug;
    setLoading(true);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin", slug }),
      });
      const json = await res.json();

      let scanResult: ScanResult;
      if (res.status === 404 || (!json.success && json.message?.includes("tidak ditemukan"))) {
        scanResult = {
          slug,
          name: "—",
          checked_in: false,
          status: "notfound",
          message: "❌ Undangan tidak ditemukan",
        };
      } else if (json.success) {
        const item = json.item;
        scanResult = {
          slug: item.slug,
          name: item.name,
          checked_in: true,
          checked_in_at: item.checked_in_at,
          status: "success",
          message: `✅ ${item.name} berhasil check-in!`,
        };
      } else {
        scanResult = {
          slug,
          name: "—",
          checked_in: false,
          status: "error",
          message: json.message || "Terjadi kesalahan",
        };
      }

      setResult(scanResult);
      setRecentScans((prev) => [scanResult, ...prev.slice(0, 9)]);
    } catch {
      setResult({ slug, name: "—", checked_in: false, status: "error", message: "Gagal terhubung ke server" });
    }

    setLoading(false);
    // 3 detik cooldown agar tidak scan ulang yang sama
    setTimeout(() => {
      cooldownRef.current = false;
      lastScannedRef.current = "";
    }, 3000);
  }, []);

  const startScan = useCallback(async () => {
    setError("");
    setResult(null);
    try {
      await loadJsQR();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const tick = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx || !video.videoWidth) { rafRef.current = requestAnimationFrame(tick); return; }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR?.(imageData.data, canvas.width, canvas.height);
        if (code?.data) {
          // Ekstrak slug dari URL the-wayfinder atau gunakan langsung
          const raw = code.data.trim();
          const match = raw.match(/\/the-wayfinder\/([^/?#]+)/);
          const slug = match ? match[1] : raw;
          if (slug && slug !== "scan" && slug !== "links") {
            handleCheckin(slug);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setError("Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan.");
    }
  }, [handleCheckin]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const statusColor = (s?: string) =>
    s === "success" ? "#10b981" : s === "notfound" ? "#ef4444" : s === "already" ? "#f59e0b" : "#6b7280";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f0c", color: "#fff", fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#111a14", padding: "16px 24px", borderBottom: "1px solid #1e2d22", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/the-wayfinder/links" style={{ color: "#c9a84c", textDecoration: "none", fontSize: 13 }}>
          ← Kembali
        </a>
        <span style={{ color: "#3a4a3e" }}>|</span>
        <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 16 }}>
          📷 Scan Check-in Undangan
        </span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
        {/* Camera View */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#111", border: "2px solid #1e2d22", marginBottom: 20 }}>
          <video ref={videoRef} style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover" }} playsInline muted />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Scanning overlay */}
          {scanning && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{
                width: 200, height: 200, border: "3px solid #c9a84c", borderRadius: 12, position: "relative",
                boxShadow: "0 0 0 3000px rgba(0,0,0,0.4)",
              }}>
                {/* Corner marks */}
                {[["0,0","0,0"],["auto,0","0,0"],["0,auto","0,0"],["auto,auto","0,0"]].map(([pos], i) => (
                  <div key={i} style={{
                    position: "absolute",
                    width: 20, height: 20,
                    borderColor: "#c9a84c",
                    borderStyle: "solid",
                    borderWidth: i === 0 ? "3px 0 0 3px" : i === 1 ? "3px 3px 0 0" : i === 2 ? "0 0 3px 3px" : "0 3px 3px 0",
                    top: i < 2 ? -3 : "auto", bottom: i >= 2 ? -3 : "auto",
                    left: i % 2 === 0 ? -3 : "auto", right: i % 2 === 1 ? -3 : "auto",
                  }} />
                ))}
              </div>
            </div>
          )}

          {!scanning && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                <div style={{ color: "#a0a8a3", fontSize: 14 }}>Kamera tidak aktif</div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#ef4444", fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {!scanning ? (
            <button
              onClick={startScan}
              style={{ flex: 1, background: "#c9a84c", color: "#0a0f0c", border: "none", borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >
              📷 Mulai Scan QR
            </button>
          ) : (
            <button
              onClick={stopCamera}
              style={{ flex: 1, background: "#1e2d22", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >
              ⏹ Stop Kamera
            </button>
          )}
        </div>

        {/* Result Card */}
        {(result || loading) && (
          <div style={{
            background: "#111a14",
            border: `2px solid ${loading ? "#c9a84c" : statusColor(result?.status)}`,
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 24,
            transition: "border-color 0.3s",
          }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "#c9a84c", fontSize: 15 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                Memverifikasi undangan...
              </div>
            ) : result ? (
              <>
                <div style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>
                  {result.status === "success" ? "✅" : result.status === "already" ? "⚠️" : "❌"}
                </div>
                <div style={{ textAlign: "center", fontWeight: 700, fontSize: 17, color: statusColor(result.status), marginBottom: 6 }}>
                  {result.message}
                </div>
                {result.name !== "—" && (
                  <div style={{ textAlign: "center", color: "#a0a8a3", fontSize: 13 }}>
                    Slug: <span style={{ color: "#c9a84c" }}>{result.slug}</span>
                  </div>
                )}
                {result.checked_in_at && (
                  <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                    {new Date(result.checked_in_at).toLocaleString("id-ID")}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div>
            <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>Riwayat Scan Terkini</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentScans.map((s, i) => (
                <div key={i} style={{
                  background: "#111a14",
                  border: `1px solid ${statusColor(s.status)}33`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>
                    {s.status === "success" ? "✅" : s.status === "already" ? "⚠️" : "❌"}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#e5e7eb" }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{s.slug}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
