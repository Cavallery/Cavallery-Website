"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function MobileInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isChromeIOS, setIsChromeIOS] = useState(false);
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
      if (typeof window === "undefined") return false;
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

    // 4. Deteksi iOS (iPhone / iPad / iPod)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isCriOS = ua.includes("crios"); // Google Chrome di iOS

    if (isIosDevice) {
      setIsIOS(true);
      setIsChromeIOS(isCriOS);
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
    setShowIOSModal(false);
    localStorage.setItem("cavallery_pwa_dismissed", Date.now().toString());
  };

  if (isInstalled || !isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes cavalleryBannerSlideUp {
          from {
            opacity: 0;
            transform: translateY(35px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cavalleryModalZoomIn {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(15px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* ── FLOATING BOTTOM BANNER TAMPILAN HP ── */}
      <aside
        aria-label="Tawaran Pasang Aplikasi Mobile"
        style={{
          position: "fixed",
          bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
          left: "14px",
          right: "14px",
          margin: "0 auto",
          maxWidth: "460px",
          boxSizing: "border-box",
          zIndex: 99998,
          background: "linear-gradient(135deg, rgba(20, 18, 14, 0.96), rgba(10, 10, 10, 0.98))",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1.5px solid rgba(201, 168, 76, 0.45)",
          boxShadow: "0 14px 34px rgba(0, 0, 0, 0.85), 0 0 20px rgba(201, 168, 76, 0.2)",
          borderRadius: "18px",
          padding: "14px 16px",
          animation: "cavalleryBannerSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          color: "#f3f4f6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", boxSizing: "border-box" }}>
          {/* Logo App */}
          <div
            style={{
              position: "relative",
              width: "46px",
              height: "46px",
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
              width={46}
              height={46}
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
                  fontSize: "0.62rem",
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
                fontSize: "0.75rem",
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
              fontSize: "0.95rem",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", boxSizing: "border-box" }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #c9a84c 0%, #b8933b 100%)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(201, 168, 76, 0.35)",
            }}
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
              padding: "10px 14px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Nanti
          </button>
        </div>
      </aside>

      {/* ── MODAL PANDUAN KHUSUS IPHONE / IPAD ── */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowIOSModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000000,
            background: "rgba(0, 0, 0, 0.82)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              boxSizing: "border-box",
              background: "#161513",
              border: "1.5px solid #c9a84c",
              borderRadius: "20px",
              padding: "20px 18px",
              color: "#fff",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.95), 0 0 25px rgba(201, 168, 76, 0.25)",
              animation: "cavalleryModalZoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              margin: "0 auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bx bxl-apple" style={{ fontSize: "1.5rem", color: "#c9a84c" }} />
                <h3 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 800 }}>Pasang di iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "#fff",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.78)", margin: "0 0 14px 0", lineHeight: 1.4 }}>
              {isChromeIOS
                ? "Anda membuka melalui Google Chrome di iPhone. Ikuti langkah mudah berikut:"
                : "Pasang aplikasi Cavallery langsung ke Layar Utama iPhone tanpa App Store:"}
            </p>

            {/* Steps Container */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              {/* Step 1 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#c9a84c",
                    color: "#0a0a0a",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  1
                </div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.4, flex: 1 }}>
                  {isChromeIOS ? (
                    <>
                      Tekan ikon <strong>Bagikan / Share</strong> (<i className="bx bx-export" style={{ color: "#38bdf8", fontSize: "1rem" }} />) di sebelah alamat web, ATAU tekan menu titik tiga (<strong>...</strong>) di pojok kanan bawah.
                    </>
                  ) : (
                    <>
                      Tekan tombol <strong>Bagikan / Share</strong> (<i className="bx bx-export" style={{ color: "#38bdf8", fontSize: "1rem" }} />) di bilah navigasi bawah Safari.
                    </>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#c9a84c",
                    color: "#0a0a0a",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  2
                </div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.4, flex: 1 }}>
                  Gulir ke bawah dan pilih opsi:
                  <div
                    style={{
                      marginTop: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(201, 168, 76, 0.15)",
                      color: "var(--gold, #c9a84c)",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    <i className="bx bx-plus-square" /> &quot;Tambah ke Layar Utama&quot; / &quot;Add to Home Screen&quot;
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#c9a84c",
                    color: "#0a0a0a",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  3
                </div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.4, flex: 1 }}>
                  Tekan <strong>&quot;Tambah&quot; (Add)</strong> di sudut kanan atas. Ikon aplikasi Cavallery akan langsung muncul di HP Anda!
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
                boxShadow: "0 4px 14px rgba(201, 168, 76, 0.35)",
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
