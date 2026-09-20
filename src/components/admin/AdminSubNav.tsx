"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminSubNavProps {
  activeKey: "dashboard" | "keanggotaan" | "kontributor" | "kas" | "donasi" | "master-data";
  title?: string;
  subtitle?: string;
}

const NAV_ITEMS = [
  { key: "dashboard", href: "/internal/dashboard-admin-xv7r2q", label: "Dashboard Utama", icon: "bx-grid-alt" },
  { key: "keanggotaan", href: "/internal/dashboard-admin-xv7r2q/keanggotaan", label: "Keanggotaan", icon: "bx-user-check" },
  { key: "kas", href: "/internal/dashboard-admin-xv7r2q/kas", label: "Verifikasi Kas", icon: "bx-wallet" },
  { key: "donasi", href: "/internal/dashboard-admin-xv7r2q/donasi", label: "Donasi", icon: "bx-donate-heart" },
  { key: "kontributor", href: "/internal/dashboard-admin-xv7r2q/kontributor", label: "Kontributor", icon: "bx-heart-circle" },
  { key: "master-data", href: "/internal/dashboard-admin-xv7r2q/master-data", label: "Master Data", icon: "bx-slider-alt" },
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
        borderBottom: "1px solid var(--adm-border, rgba(255,255,255,0.08))",
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
                color: "var(--fg, #f0f0f0)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: 0,
              }}
            >
              <i className="bx bxs-shield-alt-2" style={{ color: "var(--gold, #c9a84c)" }} />
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "var(--fg-dim, #888)" }}>
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
              background: "rgba(255,255,255,0.05)",
              color: "var(--fg-dim, #aaa)",
              border: "1px solid rgba(255,255,255,0.1)",
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
                  ? "linear-gradient(135deg, rgba(201, 168, 76, 0.25) 0%, rgba(201, 168, 76, 0.1) 100%)"
                  : "rgba(255, 255, 255, 0.04)",
                color: isActive ? "#ffd778" : "var(--fg-dim, #aaa)",
                border: isActive
                  ? "1px solid rgba(201, 168, 76, 0.5)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: isActive ? "0 2px 8px rgba(201, 168, 76, 0.2)" : "none",
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
                    background: "var(--gold, #c9a84c)",
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
