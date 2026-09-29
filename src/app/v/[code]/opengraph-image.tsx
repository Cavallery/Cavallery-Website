import { ImageResponse } from "next/og";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function formatShortName(fullName?: string): string {
  if (!fullName) return "Member Cavallery";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[1].charAt(0).toUpperCase() + ".";
  return `${first} ${lastInitial}`;
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const safeCode = (code || "").trim();

  const rows = await query<any[]>(
    "SELECT nama_lengkap, no_anggota, badge, public_card_enabled FROM anggota WHERE public_code = ? LIMIT 1",
    [safeCode]
  );

  const member = rows && rows.length > 0 ? rows[0] : null;

  const shortName = member && member.public_card_enabled ? formatShortName(member.nama_lengkap) : "Fanbase Member";
  const cardNo = member && member.public_card_enabled ? member.no_anggota || "CAVA-0001" : "CAVA-MEMBER";
  const badge = member && member.public_card_enabled ? (member.badge || "Squire").toUpperCase() : "VERIFIED";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0b09",
          backgroundImage: "radial-gradient(circle at 50% 30%, #1e1913 0%, #0a0907 80%)",
          color: "#f6e7bf",
          fontFamily: "serif",
          padding: 60,
          position: "relative",
        }}
      >
        {/* Outer border */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "2px solid rgba(212, 175, 55, 0.4)",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d4af37, #926a1b)",
              color: "#14100a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            ♞
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "0.15em",
                color: "#fff3d0",
              }}
            >
              KARTU TANDA ANGGOTA
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: "#d4af37",
                marginTop: 4,
              }}
            >
              FANBASE CAVALLERY • OFFICIAL ERINE JKT48
            </span>
          </div>
        </div>

        {/* Main Card Content Box */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(24, 21, 18, 0.8)",
            border: "1.5px solid rgba(212, 175, 55, 0.5)",
            borderRadius: 20,
            padding: "36px 60px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            maxWidth: 750,
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#fff3d0",
              letterSpacing: "0.05em",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {shortName}
          </span>

          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#f59e0b",
              letterSpacing: "0.12em",
              marginTop: 14,
            }}
          >
            {cardNo}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 24,
            }}
          >
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 50,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#5fe3a1",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              ● STATUS AKTIF
            </div>

            <div
              style={{
                padding: "8px 20px",
                borderRadius: 50,
                background: "rgba(212, 175, 55, 0.15)",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                color: "#d4af37",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              BADGE: {badge}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <span
          style={{
            fontSize: 15,
            color: "#a8997a",
            marginTop: 30,
            letterSpacing: "0.05em",
          }}
        >
          Diverifikasi Resmi oleh Sistem Keanggotaan Fanbase Cavallery
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
