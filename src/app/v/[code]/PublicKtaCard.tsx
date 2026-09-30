"use client";

import { useState } from "react";
import type { BadgeDefinition } from "@/lib/badges";

interface PublicKtaCardProps {
  shortName: string;
  cardNo: string;
  badgeDef: BadgeDefinition;
  formattedJoin: string;
  photoUrl: string;
  safeCode: string;
}

export default function PublicKtaCard({
  shortName,
  cardNo,
  badgeDef,
  formattedJoin,
  photoUrl,
  safeCode,
}: PublicKtaCardProps) {
  const [side, setSide] = useState<"front" | "back">("front");

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(
    typeof window !== "undefined"
      ? `${window.location.origin}/v/${safeCode}`
      : `https://cavallery.site/v/${safeCode}`
  )}`;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Side Switcher (Depan / Belakang) */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          borderRadius: 50,
          padding: 3,
          marginBottom: 14,
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setSide("front")}
          style={{
            background: side === "front" ? "linear-gradient(135deg, #d4af37, #926a1b)" : "transparent",
            color: side === "front" ? "#0f0e0c" : "#d4af37",
            border: "none",
            borderRadius: 50,
            padding: "5px 14px",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
        >
          <span>Sisi Depan</span>
        </button>
        <button
          type="button"
          onClick={() => setSide("back")}
          style={{
            background: side === "back" ? "linear-gradient(135deg, #d4af37, #926a1b)" : "transparent",
            color: side === "back" ? "#0f0e0c" : "#d4af37",
            border: "none",
            borderRadius: 50,
            padding: "5px 14px",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
        >
          <span>Sisi Belakang</span>
        </button>
      </div>

      {/* Flip Hint */}
      <div
        onClick={() => setSide((s) => (s === "front" ? "back" : "front"))}
        style={{
          fontSize: "0.72rem",
          color: "#c9a84c",
          marginBottom: 12,
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: 0.9,
        }}
      >
        <span>🔄 Ketuk kartu untuk membalik (Sisi {side === "front" ? "Depan" : "Belakang"})</span>
      </div>

      {/* ── 3D FLIP CONTAINER ── */}
      <div
        onClick={() => setSide((s) => (s === "front" ? "back" : "front"))}
        style={{
          width: "100%",
          maxWidth: 360,
          perspective: 1000,
          WebkitPerspective: 1000,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "54 / 86",
            position: "relative",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            WebkitTransition: "-webkit-transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: side === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
            WebkitTransform: side === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
            borderRadius: 22,
          }}
        >
          {/* ════════ FRONT FACE ════════ */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              borderRadius: 22,
              background: "linear-gradient(155deg, #181715 0%, #0c0b0a 100%)",
              border: "1.5px solid rgba(212, 175, 55, 0.45)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.1)",
              padding: "20px 20px 16px",
              boxSizing: "border-box",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transform: "translateZ(1px)",
              WebkitTransform: "translateZ(1px)",
              zIndex: side === "front" ? 2 : 1,
              pointerEvents: side === "front" ? "auto" : "none",
            }}
          >
            {/* Subtle Watermark */}
            <div
              style={{
                position: "absolute",
                right: -25,
                bottom: 25,
                opacity: 0.06,
                pointerEvents: "none",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              <i className="fa-solid fa-chess-knight" style={{ fontSize: "13rem", color: "#d4af37" }} />
            </div>

            {/* Front Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src="/images/cava-logo.jpg"
                  alt="Cavallery"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1.5px solid #d4af37",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg";
                  }}
                />
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-cinzel, serif)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#fff3d0",
                      margin: 0,
                    }}
                  >
                    KARTU TANDA ANGGOTA
                  </h2>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      color: "#d4af37",
                      textTransform: "uppercase",
                    }}
                  >
                    FANBASE CAVALLERY
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "#d4af37",
                  background: "rgba(212, 175, 55, 0.12)",
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <i className="fa-solid fa-chess-knight" />
                <span>CAVA</span>
              </div>
            </div>

            {/* Photo + Card No */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: 82,
                  height: 104,
                  borderRadius: 14,
                  border: "2px solid #d4af37",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#111111",
                }}
              >
                <img
                  src={photoUrl}
                  alt={shortName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "#a8997a", fontWeight: 600 }}>
                    Nomor Anggota
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-cinzel, monospace)",
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "#f59e0b",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {cardNo}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#5fe3a1",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 50,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ● AKTIF
                  </span>
                </div>
              </div>
            </div>

            {/* Name Block */}
            <div style={{ marginTop: 12, position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-cinzel, serif)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#fff3d0",
                  lineHeight: 1.25,
                  textShadow: "0 0 12px rgba(212, 175, 55, 0.3)",
                }}
              >
                {shortName}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#a8997a", fontWeight: 600, marginTop: 2 }}>
                Anggota Resmi Cavallery
              </div>
            </div>

            {/* Public Attributes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 12px",
                marginTop: 12,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div>
                <span style={{ fontSize: "0.64rem", color: "#a8997a", fontWeight: 600 }}>Badge Kehormatan</span>
                <div style={{ fontSize: "0.78rem", color: badgeDef.color, fontWeight: 800, marginTop: 1 }}>
                  {badgeDef.name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.64rem", color: "#a8997a", fontWeight: 600 }}>Oshi Terdaftar</span>
                <div style={{ fontSize: "0.78rem", color: "#fbf0d4", fontWeight: 700, marginTop: 1 }}>
                  ❤️ Catherina Vallencia K.
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.64rem", color: "#a8997a", fontWeight: 600 }}>Anggota Sejak</span>
                <div style={{ fontSize: "0.78rem", color: "#fbf0d4", fontWeight: 700, marginTop: 1 }}>
                  {formattedJoin}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.64rem", color: "#a8997a", fontWeight: 600 }}>Masa Berlaku</span>
                <div style={{ fontSize: "0.78rem", color: "#fbf0d4", fontWeight: 800, marginTop: 1 }}>
                  SEUMUR HIDUP
                </div>
              </div>
            </div>

            {/* Front Footer */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 10,
                borderTop: "1px dashed rgba(212, 175, 55, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: "0.65rem", color: "#a8997a", fontWeight: 700 }}>
                Diterbitkan oleh Fanbase Cavallery
              </div>
              <div
                style={{
                  width: 28,
                  height: 20,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #d4af37 0%, #fff3d0 35%, #926a1b 70%, #f59e0b 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                }}
              />
            </div>
          </div>

          {/* ════════ BACK FACE (SISI BELAKANG) ════════ */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              borderRadius: 22,
              background: "linear-gradient(155deg, #181715 0%, #0c0b0a 100%)",
              border: "1.5px solid rgba(212, 175, 55, 0.45)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.1)",
              padding: "20px 20px 16px",
              boxSizing: "border-box",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transform: "rotateY(180deg) translateZ(1px)",
              WebkitTransform: "rotateY(180deg) translateZ(1px)",
              zIndex: side === "back" ? 2 : 1,
              pointerEvents: side === "back" ? "auto" : "none",
            }}
          >
            {/* Subtle Watermark */}
            <div
              style={{
                position: "absolute",
                right: -25,
                bottom: 25,
                opacity: 0.06,
                pointerEvents: "none",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              <i className="fa-solid fa-chess-knight" style={{ fontSize: "13rem", color: "#d4af37" }} />
            </div>

            {/* Back Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 10,
                borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src="/images/cava-logo.jpg"
                  alt="Cavallery"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1.5px solid #d4af37",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg";
                  }}
                />
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-cinzel, serif)",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#fff3d0",
                      margin: 0,
                    }}
                  >
                    KETENTUAN PENGGUNAAN
                  </h3>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#d4af37",
                      textTransform: "uppercase",
                    }}
                  >
                    OFFICIAL FANBASE CAVALLERY
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#d4af37",
                  background: "rgba(212, 175, 55, 0.12)",
                  padding: "3px 6px",
                  borderRadius: 6,
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                CAVA
              </div>
            </div>

            {/* QR Code Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px 0",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: "#ffffff",
                  borderRadius: 14,
                  padding: 8,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={qrUrl}
                  alt="QR Code KTA"
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.64rem",
                  color: "#c9a84c",
                  fontWeight: 700,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                Scan untuk Presensi Gathering & Verifikasi
              </div>
            </div>

            {/* Terms List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                margin: "6px 0",
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                "KTA Digital ini sah sebagai tanda pengenal resmi pendukung Erine JKT48.",
                "Wajib ditunjukkan untuk presensi event, gathering offline, & merchandise.",
                "Hak cipta & kepemilikan kartu berada di bawah naungan Fanbase Cavallery.",
              ].map((term, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    fontSize: "0.66rem",
                    color: "#f6e7bf",
                    lineHeight: 1.35,
                  }}
                >
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      background: "rgba(212, 175, 55, 0.2)",
                      border: "1px solid rgba(212, 175, 55, 0.4)",
                      color: "#d4af37",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{term}</span>
                </div>
              ))}
            </div>

            {/* Signature & Barcode Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 8,
                borderTop: "1px dashed rgba(212, 175, 55, 0.25)",
                marginTop: 6,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    width: 100,
                    height: 20,
                    background:
                      "repeating-linear-gradient(90deg, #d4af37 0, #d4af37 2px, transparent 2px, transparent 4px, #d4af37 4px, #d4af37 7px, transparent 7px, transparent 9px)",
                    opacity: 0.8,
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: "#a8997a",
                    letterSpacing: "0.08em",
                  }}
                >
                  {cardNo}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-cinzel, cursive)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#d4af37",
                  }}
                >
                  Cavallery Management
                </div>
                <span style={{ fontSize: "0.6rem", color: "#a8997a" }}>Official Fanbase</span>
              </div>
            </div>

            {/* Back Footer */}
            <div
              style={{
                fontSize: "0.62rem",
                color: "#a8997a",
                textAlign: "center",
                marginTop: 6,
                position: "relative",
                zIndex: 1,
              }}
            >
              Diterbitkan oleh Fanbase Cavallery • Terdaftar Sejak {formattedJoin}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
