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

        {/* Subtle Watermark in background ~6% opacity */}
        <div
          style={{
            position: "absolute",
            right: 50,
            bottom: 40,
            opacity: 0.06,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="220" height="220" viewBox="0 0 24 24" fill="#d4af37">
            <path d="M19.92 5.62c-.36-.88-.95-1.63-1.72-2.18l-1.39-.99c-.64-.46-1.46-.57-2.19-.31l-2.02.72c-.8.29-1.35 1.05-1.35 1.91v.42l-2.18 1.45c-.47.31-.76.84-.77 1.4v.77l-1.89 1.26c-.36.24-.59.64-.63 1.07l-.27 2.97c-.03.35.12.7.39.92l1.6 1.33c.3.25.7.36 1.08.31l1.52-.22c.28.66.75 1.21 1.36 1.58l.45.27c.43.26.93.39 1.44.39h5.18c.83 0 1.5-.67 1.5-1.5 0-.25-.06-.49-.18-.7l-1.4-2.45c-.21-.37-.59-.62-1.02-.67l-2.08-.26c-.44-.06-.86-.25-1.2-.56l-.8-.72v-1.12l1.45-.97c.48-.32.78-.86.78-1.44v-1.22l2.37-1.58c.62-.41.99-1.1.99-1.84 0-.44-.13-.88-.38-1.25z" />
          </svg>
        </div>

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
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#14100a">
              <path d="M19.92 5.62c-.36-.88-.95-1.63-1.72-2.18l-1.39-.99c-.64-.46-1.46-.57-2.19-.31l-2.02.72c-.8.29-1.35 1.05-1.35 1.91v.42l-2.18 1.45c-.47.31-.76.84-.77 1.4v.77l-1.89 1.26c-.36.24-.59.64-.63 1.07l-.27 2.97c-.03.35.12.7.39.92l1.6 1.33c.3.25.7.36 1.08.31l1.52-.22c.28.66.75 1.21 1.36 1.58l.45.27c.43.26.93.39 1.44.39h5.18c.83 0 1.5-.67 1.5-1.5 0-.25-.06-.49-.18-.7l-1.4-2.45c-.21-.37-.59-.62-1.02-.67l-2.08-.26c-.44-.06-.86-.25-1.2-.56l-.8-.72v-1.12l1.45-.97c.48-.32.78-.86.78-1.44v-1.22l2.37-1.58c.62-.41.99-1.1.99-1.84 0-.44-.13-.88-.38-1.25z" />
            </svg>
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
