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
          message: "Undangan tidak terdaftar di sistem",
        };
      } else if (json.success) {
        const item = json.item;
        scanResult = {
          slug: item.slug,
          name: item.name,
          checked_in: true,
          checked_in_at: item.checked_in_at,
          status: "success",
          message: `${item.name} berhasil check-in!`,
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
          const raw = code.data.trim();
          // Cocokkan URL /undangan/ atau /the-wayfinder/
          const matchUndangan = raw.match(/\/undangan\/([^/?#]+)/);
          const matchWayfinder = raw.match(/\/the-wayfinder\/([^/?#]+)/);
          const slug = matchUndangan ? matchUndangan[1] : (matchWayfinder ? matchWayfinder[1] : raw);
          if (slug && slug !== "scan" && slug !== "links") {
            handleCheckin(slug);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setError("Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan di browser.");
    }
  }, [handleCheckin]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const statusColor = (s?: string) =>
    s === "success" ? "#10b981" : s === "notfound" ? "#ef4444" : s === "already" ? "#f59e0b" : "#6b7280";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f0c", color: "#fff", fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#111a14", padding: "16px 24px", borderBottom: "1px solid #1e2d22", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/undangan/links" style={{ color: "#c9a84c", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <i className="bx bx-arrow-back" /> Daftar Link
        </a>
        <span style={{ color: "#3a4a3e" }}>|</span>
        <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 16, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <i className="bx bx-qr-scan" style={{ fontSize: 20 }} /> Scanner Check-in Undangan Fanbase
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
                {[["0,0"],["auto,0"],["0,auto"],["auto,auto"]].map(([pos], i) => (
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
                <i className="bx bx-camera" style={{ fontSize: 52, color: "#4b5563", marginBottom: 12, display: "block" }} />
                <div style={{ color: "#a0a8a3", fontSize: 14 }}>Kamera belum aktif</div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#ef4444", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="bx bx-error-circle" style={{ fontSize: 20 }} /> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {!scanning ? (
            <button
              onClick={startScan}
              style={{ flex: 1, background: "#c9a84c", color: "#0a0f0c", border: "none", borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="bx bx-camera" style={{ fontSize: 18 }} /> Buka Kamera & Scan QR
            </button>
          ) : (
            <button
              onClick={stopCamera}
              style={{ flex: 1, background: "#1e2d22", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <i className="bx bx-stop-circle" style={{ fontSize: 18 }} /> Matikan Kamera
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
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, marginBottom: 8, display: "block" }} />
                Memverifikasi data undangan...
              </div>
            ) : result ? (
              <>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  {result.status === "success" ? (
                    <i className="bx bxs-check-circle" style={{ color: "#10b981", fontSize: 48 }} />
                  ) : result.status === "already" ? (
                    <i className="bx bxs-error" style={{ color: "#f59e0b", fontSize: 48 }} />
                  ) : (
                    <i className="bx bxs-x-circle" style={{ color: "#ef4444", fontSize: 48 }} />
                  )}
                </div>
                <div style={{ textAlign: "center", fontWeight: 700, fontSize: 17, color: statusColor(result.status), marginBottom: 6 }}>
                  {result.message}
                </div>
                {result.name !== "—" && (
                  <div style={{ textAlign: "center", color: "#a0a8a3", fontSize: 13 }}>
                    Fanbase: <span style={{ color: "#c9a84c", fontWeight: 600 }}>{result.name}</span>
                  </div>
                )}
                {result.checked_in_at && (
                  <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, marginTop: 4 }}>
                    Waktu Check-in: {new Date(result.checked_in_at).toLocaleString("id-ID")}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div>
            <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>Daftar Hadir Terverifikasi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentScans.map((s, i) => (
                <div key={i} style={{
                  background: "#111a14",
                  border: `1px solid ${statusColor(s.status)}33`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  {s.status === "success" ? (
                    <i className="bx bxs-check-circle" style={{ color: "#10b981", fontSize: 22 }} />
                  ) : (
                    <i className="bx bxs-error" style={{ color: "#f59e0b", fontSize: 22 }} />
                  )}
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
