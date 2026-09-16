"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function MobileInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Cavallery PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("PWA Service Worker registration failed:", err);
        });
    }

    // 2. Periksa apakah sudah terpasang (Standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      return isStandaloneMode;
    };

    if (checkStandalone()) {
      setIsInstalled(true);
      return;
    }

    // 3. Cek apakah user pernah menutup banner dalam 3 hari terakhir
    const dismissedTime = localStorage.getItem("cavallery_pwa_dismissed");
    if (dismissedTime) {
      const diffHours = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60);
      if (diffHours < 72) {
        return; // Jangan tampilkan dulu jika baru ditutup
      }
    }

    // 4. Deteksi iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("crios");
    if (isIosDevice) {
      setIsIOS(true);
      // Munculkan tawaran setelah jeda 2.5 detik
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // 5. Handler untuk Android / Chromium (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tampilkan banner setelah jeda 2 detik
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Event jika berhasil di-install
    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsVisible(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      // Fallback jika browser mobile belum trigger event native
      alert(
        "Untuk memasang di HP:\n1. Buka menu browser (titik 3 di kanan atas)\n2. Pilih 'Tambahkan ke Layar Utama' / 'Install App'."
      );
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("cavallery_pwa_dismissed", Date.now().toString());
  };

  if (isInstalled || !isVisible) return null;

  return (
    <>
      {/* ── FLOATING BOTTOM BANNER TAMPILAN HP ── */}
      <aside
        aria-label="Tawaran Pasang Aplikasi Mobile"
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "480px",
          zIndex: 99999,
          background: "linear-gradient(135deg, rgba(20, 18, 14, 0.95), rgba(12, 12, 12, 0.98))",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1.5px solid rgba(201, 168, 76, 0.4)",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(201, 168, 76, 0.2)",
          borderRadius: "18px",
          padding: "14px 16px",
          animation: "slideUpPwa 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          color: "#f3f4f6",
        }}
      >
        <style>{`
          @keyframes slideUpPwa {
            from {
              opacity: 0;
              transform: translate(-50%, 40px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}</style>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Logo App */}
          <div
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              flexShrink: 0,
              borderRadius: "12px",
              overflow: "hidden",
              border: "1.5px solid #c9a84c",
              boxShadow: "0 4px 12px rgba(201, 168, 76, 0.3)",
              background: "#0a0a0a",
            }}
          >
            <Image
              src="/images/cava-logo-round.png"
              alt="Cavallery App Logo"
              width={48}
              height={48}
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Info Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.92rem",
                  color: "#fff",
                  letterSpacing: "0.2px",
                }}
              >
                Aplikasi Cavallery
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #c9a84c, #e5c158)",
                  color: "#0a0a0a",
                  padding: "1.5px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                Mobile
              </span>
            </div>
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: "0.76rem",
                color: "rgba(243, 244, 246, 0.75)",
                lineHeight: "1.3",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              Pasang ke layar HP untuk akses instan &amp; tampilan layar penuh tanpa browser!
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup penawaran"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              color: "rgba(255, 255, 255, 0.6)",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #c9a84c 0%, #b8933b 100%)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "10px",
              padding: "9px 14px",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(201, 168, 76, 0.35)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <i className="bx bx-download" style={{ fontSize: "1.05rem" }} />
            {isIOS ? "Lihat Cara Pasang di HP" : "Pasang / Unduh Aplikasi"}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              color: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "10px",
              padding: "9px 12px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Nanti
          </button>
        </div>
      </aside>

      {/* ── MODAL PANDUAN KHUSUS IPHONE / IOS SAFARI ── */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowIOSModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#181715",
              border: "1.5px solid #c9a84c",
              borderRadius: "22px",
              padding: "22px 20px",
              color: "#fff",
              boxShadow: "0 20px 40px rgba(0,0,0,0.9)",
              animation: "slideUpPwa 0.3s ease-out forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bxl-apple" style={{ fontSize: "1.4rem", color: "#c9a84c" }} />
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Pasang di iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "#fff",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.8)", margin: "0 0 16px 0", lineHeight: 1.4 }}>
              Safari di iPhone mengizinkan Anda memasang aplikasi Cavallery langsung ke Layar Utama tanpa App Store:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.04)", padding: "10px 14px", borderRadius: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#c9a84c", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                  1
                </div>
                <div style={{ fontSize: "0.84rem", flex: 1 }}>
                  Tekan tombol <strong>Bagikan / Share</strong> (<i className="bx bx-export" style={{ color: "#38bdf8", fontSize: "1rem" }} />) di bilah bawah Safari.
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.04)", padding: "10px 14px", borderRadius: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#c9a84c", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                  2
                </div>
                <div style={{ fontSize: "0.84rem", flex: 1 }}>
                  Gulir ke bawah lalu pilih <strong>&quot;Tambah ke Layar Utama&quot; (Add to Home Screen)</strong> (<i className="bx bx-plus-square" style={{ color: "#c9a84c", fontSize: "1rem" }} />).
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255, 255, 255, 0.04)", padding: "10px 14px", borderRadius: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#c9a84c", color: "#000", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                  3
                </div>
                <div style={{ fontSize: "0.84rem", flex: 1 }}>
                  Tekan <strong>&quot;Tambah&quot; (Add)</strong> di sudut kanan atas. Selesai!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSModal(false);
                handleDismiss();
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #c9a84c, #b8933b)",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "12px",
                padding: "11px",
                fontSize: "0.86rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
