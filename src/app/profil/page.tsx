"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { getMemberBadge, MEMBER_BADGES } from "@/lib/badges";

interface UserProfile {
  type: "anggota" | "donatur";
  id: number;
  noAnggota?: string;
  namaLengkap?: string;
  nama?: string;
  idLine?: string;
  displayLine?: string;
  discord?: string;
  gender?: string;
  domisili?: string;
  kontakPlatform?: string;
  kontakId?: string;
  status: string;
  jabatan?: string;
  badge?: string;
  anggotaSejak?: string;
  createdAt: string;
  totalKasVerified?: number;
  totalDonasiVerified?: number;
  riwayatKas?: any[];
  riwayatDonasi?: any[];
}

function formatRupiah(amount?: number) {
  if (!amount) return "Rp 0";
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          router.push("/masuk");
          return;
        }
        const json = await res.json();
        if (json.status && json.user) {
          setProfile(json.user);
        } else {
          setErrorMsg(json.message || "Gagal memuat profil");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/keluar", { method: "POST" });
      router.push("/masuk");
      router.refresh();
    } catch {
      router.push("/masuk");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--gold)" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "2.5rem", marginBottom: "12px" }} />
            <p>Memuat profil anggota...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={`glassCard ${styles.idCard}`} style={{ textAlign: "center", padding: "40px 20px" }}>
            <i className="bx bx-error-circle" style={{ fontSize: "3rem", color: "#ef4444", marginBottom: "12px" }} />
            <h2 style={{ fontFamily: "var(--serif)", marginBottom: "8px" }}>Profil Tidak Ditemukan</h2>
            <p style={{ color: "var(--fg-muted)", marginBottom: "24px" }}>
              {errorMsg || "Sesi login Anda tidak valid atau telah berakhir."}
            </p>
            <Link href="/masuk" className={styles.actionBtn} style={{ maxWidth: 200, margin: "0 auto" }}>
              Masuk Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.namaLengkap || profile.nama || "Ksatria Cavallery";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedSejak = profile.anggotaSejak
    ? new Date(profile.anggotaSejak).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(profile.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Member Identity Card */}
        <div className={`glassCard ${styles.idCard}`}>
          <img
            src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
            alt="Watermark"
            className={styles.cardWatermark}
          />

          <div className={styles.idTop}>
            <div className={styles.brandBadge}>
              <img
                src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
                alt="Logo"
              />
              <span>Cavallery Fanbase</span>
            </div>

            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              {profile.status === "aktif" ? "Aktif" : profile.status}
            </div>
          </div>

          <div className={styles.idBody}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.infoWrap}>
              <h2 className={styles.userName}>{displayName}</h2>

              {profile.noAnggota ? (
                <div className={styles.noAnggotaBadge}>
                  <i className="bx bx-id-card" /> {profile.noAnggota}
                </div>
              ) : (
                <div className={styles.noAnggotaBadge}>
                  <i className="bx bx-donate-heart" /> Donatur Terdaftar
                </div>
              )}

              <div className={styles.userMeta}>
                {profile.domisili && (
                  <span>
                    <i className="bx bx-map-pin" /> {profile.domisili}
                  </span>
                )}
                {profile.idLine && (
                  <span>
                    <i className="bx bxl-line" /> LINE: {profile.idLine}
                  </span>
                )}
                {profile.jabatan && (
                  <span>
                    <i className="bx bx-shield-quarter" /> {profile.jabatan}
                  </span>
                )}
                {profile.type === "anggota" && (() => {
                  const bDef = getMemberBadge(profile.badge);
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        color: bDef.color,
                        fontWeight: 700,
                      }}
                    >
                      <i className={`bx ${bDef.icon}`} /> Badge: {bDef.name}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className={styles.idFooter}>
            <div className={styles.idFooterItem}>
              <span className={styles.idFooterLabel}>
                {profile.type === "anggota" ? "Anggota Sejak" : "Terdaftar Sejak"}
              </span>
              <span className={styles.idFooterVal}>{formattedSejak}</span>
            </div>

            <div className={styles.idFooterItem}>
              <span className={styles.idFooterLabel}>Kontak Terdaftar</span>
              <span className={styles.idFooterVal}>
                {profile.kontakPlatform ? `${profile.kontakPlatform}: ${profile.kontakId}` : "-"}
              </span>
            </div>

            {profile.discord && (
              <div className={styles.idFooterItem}>
                <span className={styles.idFooterLabel}>Discord</span>
                <span className={styles.idFooterVal}>{profile.discord}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (Kas & Donasi) */}
        <div className={styles.actionsRow}>
          {profile.type === "anggota" && (
            <Link href="/kas" className={`${styles.actionBtn} ${styles.kasBtn}`}>
              <div className={styles.btnContent}>
                <i className="bx bx-wallet" />
                <span>Pembayaran Kas</span>
              </div>
              <i className="bx bx-chevron-right" />
            </Link>
          )}

          <Link
            href="/donasi"
            className={`${styles.actionBtn} ${styles.donasiBtn}`}
            style={profile.type === "donatur" ? { gridColumn: "1 / -1" } : undefined}
          >
            <div className={styles.btnContent}>
              <i className="bx bx-heart-circle" />
              <span>Donasi & Proyek Erine</span>
            </div>
            <i className="bx bx-chevron-right" />
          </Link>
        </div>

        {/* Financial Summary Stats */}
        <div className={styles.statsGrid}>
          {profile.type === "anggota" && (
            <div className={`glassCard ${styles.statCard}`}>
              <div className={`${styles.statIcon} ${styles.statIconKas}`}>
                <i className="bx bx-wallet-alt" />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Kas Terverifikasi</span>
                <span className={styles.statVal}>{formatRupiah(profile.totalKasVerified)}</span>
              </div>
            </div>
          )}

          <div
            className={`glassCard ${styles.statCard}`}
            style={profile.type === "donatur" ? { gridColumn: "1 / -1" } : undefined}
          >
            <div className={`${styles.statIcon} ${styles.statIconDonasi}`}>
              <i className="bx bx-donate-heart" />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Donasi Terverifikasi</span>
              <span className={styles.statVal}>{formatRupiah(profile.totalDonasiVerified)}</span>
            </div>
          </div>
        </div>

        {/* Member Badge System Showcase */}
        {profile.type === "anggota" && (
          <div
            className="glassCard"
            style={{
              marginTop: 24,
              padding: "24px 20px",
              borderRadius: 20,
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="bx bx-award" style={{ fontSize: "1.4rem", color: "var(--gold)" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--fg)" }}>
                Tingkatan Badge Anggota Cavallery
              </h3>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginBottom: 18, lineHeight: 1.5 }}>
              Badge mencerminkan dedikasi, keaktifan, dan kontribusi Ksatria dalam mendukung Cavallery dan Erine JKT48.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {Object.values(MEMBER_BADGES).map((b) => {
                const isCurrentBadge = (profile.badge || "squire").toLowerCase() === b.id;
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: isCurrentBadge ? `2px solid ${b.color}` : `1px solid var(--border)`,
                      background: isCurrentBadge ? b.bgColor : "rgba(0,0,0,0.02)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      position: "relative",
                      boxShadow: isCurrentBadge ? `0 4px 16px ${b.bgColor}` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: b.bgColor,
                            border: `1px solid ${b.borderColor}`,
                            color: b.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.15rem",
                          }}
                        >
                          <i className={`bx ${b.icon}`} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: b.color }}>
                          {b.name}
                        </span>
                      </div>
                      {isCurrentBadge && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: 50,
                            background: b.color,
                            color: "#fff",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Badge Kamu
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: 1.45 }}>
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className={styles.logoutWrap}>
          <button onClick={handleLogout} disabled={loggingOut} className={styles.logoutBtn}>
            {loggingOut ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Keluar...
              </>
            ) : (
              <>
                <i className="bx bx-log-out" /> Keluar Akun
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
