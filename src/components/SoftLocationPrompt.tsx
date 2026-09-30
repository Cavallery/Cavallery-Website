"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * SoftLocationPrompt — Komponen izin akses lokasi yang halus.
 *
 * Cara kerja:
 * 1. Jika user sudah pernah mengizinkan / menolak → tidak tampil lagi
 * 2. Muncul setelah 20 detik browsing (tidak mengganggu pengalaman awal)
 * 3. Tampil sebagai "info card" kecil di pojok bawah, bukan pop-up mengganggu
 * 4. Bahasa ramah & menekankan manfaat (bukan perintah)
 * 5. Jika ditolak, baru muncul lagi setelah 14 hari
 * 6. Jika diizinkan, kirim koordinat ke server secara silent
 */
export default function SoftLocationPrompt() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Kirim data lokasi ke server
  const sendLocationToServer = useCallback(
    async (lat: number, lng: number, accuracy: number) => {
      try {
        await fetch("/api/visitor/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            accuracy,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // silent fail — jangan ganggu user
      }
    },
    []
  );

  // Cek apakah browser sudah pernah kasih izin (tanpa prompt)
  const trySilentGeolocation = useCallback(() => {
    if (!navigator.geolocation) return;

    // Cek status permission tanpa trigger prompt
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (result.state === "granted") {
            // Sudah diizinkan sebelumnya → ambil lokasi secara silent
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                sendLocationToServer(
                  pos.coords.latitude,
                  pos.coords.longitude,
                  pos.coords.accuracy
                );
              },
              () => {},
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
            );
          }
        })
        .catch(() => {});
    }
  }, [sendLocationToServer]);

  useEffect(() => {
    // Hanya di client
    if (typeof window === "undefined") return;

    // 1) Coba ambil lokasi secara silent (jika sudah pernah diizinkan)
    trySilentGeolocation();

    // 2) Cek apakah sudah pernah merespon prompt ini
    const answered = localStorage.getItem("cavallery_loc_answered");
    if (answered) {
      const diffDays =
        (Date.now() - parseInt(answered, 10)) / (1000 * 60 * 60 * 24);
      // Jika sudah pernah mengizinkan → jangan tampilkan lagi selamanya
      if (localStorage.getItem("cavallery_loc_granted") === "1") return;
      // Jika menolak, tampilkan lagi setelah 14 hari
      if (diffDays < 14) return;
    }

    // 3) Jangan tampil bersamaan dengan MobileInstallPrompt (tunggu 20 detik)
    const timer = setTimeout(() => {
      // Cek ulang permission state — kalau sudah granted, skip
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((result) => {
            if (result.state === "granted") {
              // Sudah diizinkan, tidak perlu prompt
              localStorage.setItem("cavallery_loc_granted", "1");
              return;
            }
            if (result.state === "denied") {
              // Sudah di-block, tidak tampilkan
              return;
            }
            // "prompt" — belum pernah ditanya, tampilkan card
            setVisible(true);
          })
          .catch(() => {
            // Browser lama tanpa Permissions API → tetap tampilkan
            setVisible(true);
          });
      } else {
        setVisible(true);
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, [trySilentGeolocation]);

  const dismiss = (saveAnswer: boolean) => {
    setFadingOut(true);
    if (saveAnswer) {
      localStorage.setItem("cavallery_loc_answered", Date.now().toString());
    }
    setTimeout(() => setVisible(false), 280);
  };

  const handleAllow = () => {
    if (!navigator.geolocation) {
      dismiss(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem("cavallery_loc_granted", "1");
        localStorage.setItem("cavallery_loc_answered", Date.now().toString());
        sendLocationToServer(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy
        );
        dismiss(false);
      },
      () => {
        // User menolak di pop-up browser → simpan supaya tidak tanya lagi
        dismiss(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleDismiss = () => {
    dismiss(true);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes cavLocSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cavLocFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(20px); }
        }
      `}</style>

      <aside
        aria-label="Permintaan akses lokasi"
        style={{
          position: "fixed",
          bottom: "max(16px, env(safe-area-inset-bottom, 16px))",
          left: "14px",
          right: "14px",
          margin: "0 auto",
          maxWidth: "400px",
          boxSizing: "border-box",
          zIndex: 99997,
          background:
            "linear-gradient(135deg, rgba(20, 18, 14, 0.96), rgba(10, 10, 10, 0.98))",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1.5px solid rgba(201, 168, 76, 0.35)",
          boxShadow:
            "0 14px 34px rgba(0, 0, 0, 0.85), 0 0 16px rgba(201, 168, 76, 0.15)",
          borderRadius: "16px",
          padding: "14px 16px",
          animation: fadingOut
            ? "cavLocFadeOut 0.28s ease forwards"
            : "cavLocSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
          color: "#f3f4f6",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(201, 168, 76, 0.12)",
              border: "1px solid rgba(201, 168, 76, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.15rem",
              color: "#c9a84c",
              flexShrink: 0,
            }}
          >
            <i className="bx bx-map" />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#fff",
                display: "block",
                marginBottom: "3px",
              }}
            >
              Tingkatkan Pengalaman Anda ✨
            </span>
            <p
              style={{
                margin: 0,
                fontSize: "0.74rem",
                color: "rgba(243, 244, 246, 0.65)",
                lineHeight: "1.4",
              }}
            >
              Izinkan akses lokasi untuk menampilkan info acara & event
              Cavallery terdekat di kota Anda.
            </p>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          <button
            type="button"
            onClick={handleAllow}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #c9a84c 0%, #b8933b 100%)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <i className="bx bx-check-circle" style={{ fontSize: "0.95rem" }} />
            Izinkan Lokasi
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Nanti Saja
          </button>
        </div>
      </aside>
    </>
  );
}
