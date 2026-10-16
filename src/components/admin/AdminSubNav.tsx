"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminSubNavProps {
  activeKey: "dashboard" | "keanggotaan" | "kontributor" | "kas" | "donasi" | "master-data" | "gathering" | "struktur";
  title?: string;
  subtitle?: string;
}

const NAV_ITEMS = [
  { key: "dashboard", href: "/internal/dashboard-admin-xv7r2q", label: "Dashboard Utama", icon: "bx-grid-alt" },
  { key: "keanggotaan", href: "/internal/dashboard-admin-xv7r2q/keanggotaan", label: "Keanggotaan", icon: "bx-user-check" },
  { key: "gathering", href: "/internal/dashboard-admin-xv7r2q/gathering", label: "Presensi Gathering", icon: "bx-qr-scan" },
  { key: "kas", href: "/internal/dashboard-admin-xv7r2q/kas", label: "Verifikasi Kas", icon: "bx-wallet" },
  { key: "donasi", href: "/internal/dashboard-admin-xv7r2q/donasi", label: "Donasi", icon: "bx-donate-heart" },
  { key: "kontributor", href: "/internal/dashboard-admin-xv7r2q/kontributor", label: "Kontributor", icon: "bx-heart-circle" },
  { key: "master-data", href: "/internal/dashboard-admin-xv7r2q/master-data", label: "Master Data", icon: "bx-slider-alt" },
  { key: "struktur", href: "/internal/dashboard-admin-xv7r2q/struktur", label: "Struktur Admin", icon: "bx-sitemap" },
];

export default function AdminSubNav({ activeKey, title, subtitle }: AdminSubNavProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: "1px solid var(--adm-border, var(--cv-line))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          {title && (
            <h1
              style={{
                fontSize: "1.45rem",
                fontWeight: 800,
                color: "var(--fg)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: 0,
              }}
            >
              <i className="bx bxs-shield-alt-2" style={{ color: "var(--gold)" }} />
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "var(--fg-dim)" }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <Link
            href="/internal/dashboard-admin-xv7r2q"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.8rem",
              padding: "6px 12px",
              borderRadius: 8,
              background: "color-mix(in srgb, var(--cv-bone) 5%, transparent)",
              color: "var(--fg-dim)",
              border: "1px solid var(--cv-line)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <i className="bx bx-arrow-back" /> Dashboard Utama
          </Link>
        </div>
      </div>

      {/* HORIZONTAL PILLS SUB-NAVBAR */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <Link
              key={item.key}
              href={item.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: "0.82rem",
                fontWeight: isActive ? 700 : 500,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                background: isActive
                  ? "color-mix(in srgb, var(--cv-orange) 25%, transparent)"
                  : "color-mix(in srgb, var(--cv-bone) 4%, transparent)",
                color: isActive ? "var(--cv-orange-hi)" : "var(--fg-dim)",
                border: isActive
                  ? "1px solid color-mix(in srgb, var(--cv-orange) 50%, transparent)"
                  : "1px solid var(--cv-line)",
                boxShadow: isActive ? "0 2px 8px color-mix(in srgb, var(--cv-orange) 20%, transparent)" : "none",
              }}
            >
              <i className={`bx ${item.icon}`} style={{ fontSize: "1rem" }} />
              <span>{item.label}</span>
              {isActive && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    display: "inline-block",
                  }}
                />
              )}
            </Link>
          );
        })}

        <a
          href="https://docs.google.com/spreadsheets/d/1t9PlUNLN2rdskLq-ZpellJI0umclokLm7G-DI-VnFXg/edit"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 20,
            fontSize: "0.82rem",
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <i className="bx bx-table" style={{ fontSize: "1rem" }} />
          <span>Live Spreadsheet</span>
          <i className="bx bx-link-external" style={{ fontSize: "0.75rem", opacity: 0.7 }} />
        </a>
      </div>
    </div>
  );
}
