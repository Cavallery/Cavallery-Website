import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { query } from "@/lib/mysql";
import { checkKtaRateLimit } from "@/lib/rate-limit";
import { getMemberBadge } from "@/lib/badges";
import Link from "next/link";
import type { Metadata } from "next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

function formatShortName(fullName?: string): string {
  if (!fullName) return "Member Cavallery";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[1].charAt(0).toUpperCase() + ".";
  return `${first} ${lastInitial}`;
}

function formatIndoDate(dateStr?: string | Date): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return String(dateStr);
  } catch {
    return String(dateStr);
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const safeCode = (code || "").trim();

  const rows = await query<any[]>(
    "SELECT nama_lengkap, no_anggota, public_card_enabled FROM anggota WHERE public_code = ? LIMIT 1",
    [safeCode]
  );

  const member = rows && rows.length > 0 ? rows[0] : null;
  if (!member || !member.public_card_enabled) {
    return {
      title: "Kartu Tidak Tersedia • Fanbase Cavallery",
      description: "Kartu Tanda Anggota ini tidak ditemukan atau dinonaktifkan.",
    };
  }

  const shortName = formatShortName(member.nama_lengkap);
  const cardNo = member.no_anggota || "CAVA";

  return {
    title: `KTA Digital: ${shortName} (${cardNo}) • Fanbase Cavallery`,
    description: `Kartu Tanda Anggota Resmi pendukung Catherina Vallencia (Erine) JKT48.`,
    openGraph: {
      title: `KTA Digital: ${shortName} (${cardNo})`,
      description: `Kartu Tanda Anggota Resmi pendukung Catherina Vallencia (Erine) JKT48.`,
      type: "website",
      images: [
        {
          url: `/v/${encodeURIComponent(safeCode)}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `KTA Digital Cavallery - ${shortName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `KTA Digital: ${shortName} (${cardNo})`,
      description: `Kartu Tanda Anggota Resmi pendukung Catherina Vallencia (Erine) JKT48.`,
      images: [`/v/${encodeURIComponent(safeCode)}/opengraph-image`],
    },
  };
}

export default async function PublicKtaPage({ params }: PageProps) {
  const { code } = await params;
  const safeCode = (code || "").trim();

  // 1. Rate Limiting Check
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const { allowed } = await checkKtaRateLimit(ip, 60, 1);

  if (!allowed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0d0b09",
          color: "#f6e7bf",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "var(--font-jakarta, sans-serif)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: "#181512",
            border: "1.5px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
          <h1
            style={{
              fontFamily: "var(--font-cinzel, serif)",
              fontSize: "1.3rem",
              color: "#fff3d0",
              marginBottom: 10,
            }}
          >
            Terlalu Banyak Permintaan
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#b8a877", lineHeight: 1.6 }}>
            Silakan tunggu sejenak sebelum memuat ulang halaman kartu anggota ini.
          </p>
        </div>
      </main>
    );
  }

  // 2. Fetch Member Data (Hanya data publik yang aman!)
  const rows = await query<any[]>(
    `SELECT no_anggota, nama_lengkap, badge, status, foto_profil, anggota_sejak, public_card_enabled
     FROM anggota
     WHERE public_code = ?
     LIMIT 1`,
    [safeCode]
  );

  const member = rows && rows.length > 0 ? rows[0] : null;

  // Jika kode tidak ditemukan atau kartu dinonaktifkan, tampilkan halaman yang sama
  if (!member || !member.public_card_enabled) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0d0b09",
          color: "#f6e7bf",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "var(--font-jakarta, sans-serif)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: "#181512",
            border: "1.5px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 24,
            padding: 36,
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(212, 175, 55, 0.12)",
              border: "1.5px solid rgba(212, 175, 55, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "1.8rem",
              color: "#d4af37",
            }}
          >
            ♞
          </div>
          <h1
            style={{
              fontFamily: "var(--font-cinzel, serif)",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#fff3d0",
              marginBottom: 12,
            }}
          >
            Kartu Ini Tidak Tersedia
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#b8a877", lineHeight: 1.6, marginBottom: 24 }}>
            Tautan kartu publik ini tidak aktif atau belum diizinkan untuk dibagikan oleh pemilik kartu.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #b4530f, #d97706)",
              color: "#ffffff",
              textDecoration: "none",
              padding: "10px 22px",
              borderRadius: 50,
              fontSize: "0.85rem",
              fontWeight: 800,
              boxShadow: "0 4px 14px rgba(180, 83, 15, 0.35)",
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const shortName = formatShortName(member.nama_lengkap);
  const cardNo = member.no_anggota || "CAVA-0001";
  const badgeDef = getMemberBadge(member.badge);
  const formattedJoin = formatIndoDate(member.anggota_sejak);
  const photoUrl =
    member.foto_profil ||
    "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0908",
        backgroundImage: "radial-gradient(ellipse at 50% 15%, rgba(212, 175, 55, 0.08) 0%, transparent 70%)",
        color: "#f6e7bf",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px 48px",
        fontFamily: "var(--font-jakarta, sans-serif)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
        {/* Verification Pill Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#5fe3a1",
            borderRadius: 50,
            padding: "6px 14px",
            fontSize: "0.75rem",
            fontWeight: 800,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <span>✓</span>
          <span>Kartu Terverifikasi Fanbase Cavallery</span>
        </div>

        {/* ── CARD CONTAINER (CR-80 PORTRAIT RATIO 54:86) ── */}
        <div
          style={{
            width: "100%",
            aspectRatio: "54 / 86",
            borderRadius: 22,
            background: "linear-gradient(155deg, #181715 0%, #0c0b0a 100%)",
            border: "1.5px solid rgba(212, 175, 55, 0.45)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.1)",
            padding: "20px 20px 16px",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Subtle Watermark */}
          <div
            style={{
              position: "absolute",
              right: -25,
              bottom: 25,
              fontSize: "13rem",
              color: "#d4af37",
              opacity: 0.06,
              pointerEvents: "none",
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            ♞
          </div>

          <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
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
                }}
              >
                CAVA
              </div>
            </div>

            {/* Top Row: Photo + Card No */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
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
            <div style={{ marginTop: 12 }}>
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

            {/* Public Verified Attributes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 12px",
                marginTop: 12,
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

            {/* Footer */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 10,
                borderTop: "1px dashed rgba(212, 175, 55, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
        </div>

        {/* Back Link */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.78rem",
              color: "#d4af37",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Kunjungi Website Resmi Cavallery
          </Link>
        </div>
      </div>
    </main>
  );
}
