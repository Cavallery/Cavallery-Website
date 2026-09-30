"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ScanHubPage() {
  useEffect(() => {
    document.title = "Cavallery | Scanner QR Hub";
  }, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f0c",
        backgroundImage: "radial-gradient(ellipse at 50% 20%, rgba(201, 168, 76, 0.1) 0%, transparent 70%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "var(--font-jakarta, sans-serif)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          background: "#121914",
          border: "1.5px solid rgba(201, 168, 76, 0.35)",
          borderRadius: 24,
          padding: "36px 28px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c9a84c, #8b6e28)",
            color: "#0a0f0c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 16px",
          }}
        >
          <i className="bx bx-qr-scan" />
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff3d0",
            marginBottom: 8,
          }}
        >
          Pilih Scanner QR
        </h1>
        <p style={{ fontSize: 13, color: "#a0a8a3", lineHeight: 1.5, marginBottom: 26 }}>
          Pilih modul scanner sesuai jenis event yang sedang berlangsung:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Opsi 1: Gathering Anggota */}
          <Link
            href="/gathering/scan"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(201, 168, 76, 0.15) 0%, rgba(139, 110, 40, 0.05) 100%)",
              border: "1.5px solid rgba(201, 168, 76, 0.5)",
              color: "#fff",
              textDecoration: "none",
              textAlign: "left",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#c9a84c",
                color: "#0a0f0c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              <i className="bx bx-user-check" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#ffd778" }}>
                Presensi Gathering Anggota
              </div>
              <div style={{ fontSize: 12, color: "#a0a8a3", marginTop: 2 }}>
                Scan QR KTA Digital untuk kehadiran acara offline & download Excel
              </div>
            </div>
            <i className="bx bx-chevron-right" style={{ color: "#c9a84c", fontSize: 22 }} />
          </Link>

          {/* Opsi 2: Undangan Fanbase */}
          <Link
            href="/undangan/scan"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              textDecoration: "none",
              textAlign: "left",
              transition: "transform 0.2s",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.1)",
                color: "#c9a84c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              <i className="bx bx-envelope" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#fff3d0" }}>
                Undangan Fanbase (The Wayfinder)
              </div>
              <div style={{ fontSize: 12, color: "#a0a8a3", marginTop: 2 }}>
                Scan check-in perwakilan fanbase partner & Seitansai
              </div>
            </div>
            <i className="bx bx-chevron-right" style={{ color: "#888", fontSize: 22 }} />
          </Link>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/"
            style={{
              fontSize: 12,
              color: "#c9a84c",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Kembali ke Beranda Cavallery
          </Link>
        </div>
      </div>
    </div>
  );
}
