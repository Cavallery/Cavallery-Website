"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { getMemberBadge } from "@/lib/badges";

export default function AdminGatheringPage() {
  const [eventName, setEventName] = useState("Gathering Offline Cavallery 2026");
  const [attendees, setAttendees] = useState<any[]>([]);
  const [memberDirectory, setMemberDirectory] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalHadir: number; totalAnggota: number; perBadge: Record<string, number> }>({
    totalHadir: 0,
    totalAnggota: 0,
    perBadge: {},
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBadge, setFilterBadge] = useState<string>("semua");

  // Modal Manual Check-in
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [manualCatatan, setManualCatatan] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gathering?event=${encodeURIComponent(eventName)}`);
      const json = await res.json();
      if (json.success) {
        setAttendees(json.data || []);
        setStats(json.stats || { totalHadir: 0, totalAnggota: 0, perBadge: {} });
        if (json.members) setMemberDirectory(json.members);
      }
    } catch (e: any) {
      console.error(e);
      setMsg("Gagal memuat data presensi.");
    } finally {
      setLoading(false);
    }
  }, [eventName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Manual Check-in
  const handleCheckinMember = async (member: any) => {
    setSubmittingManual(true);
    try {
      const res = await fetch("/api/gathering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_checkin",
          memberId: member.id,
          noAnggotaInput: member.no_anggota,
          namaLengkapInput: member.nama_lengkap,
          eventName,
          catatan: manualCatatan || "Presensi manual admin",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg(`✓ ${member.nama_lengkap} (${member.no_anggota}) berhasil dicatat hadir.`);
        setShowManualModal(false);
        setManualSearch("");
        setManualCatatan("");
        fetchData();
      } else {
        alert(json.message || "Gagal mencatat presensi");
      }
    } catch (e: any) {
      alert(e.message || "Terjadi kesalahan");
    } finally {
      setSubmittingManual(false);
    }
  };

  // Handle Delete Record
  const handleDelete = async (id: number | string, nama: string) => {
    if (!confirm(`Hapus catatan kehadiran untuk ${nama}?`)) return;
    try {
      const res = await fetch("/api/gathering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg(`Presensi ${nama} telah dihapus.`);
        fetchData();
      }
    } catch (e: any) {
      alert(e.message || "Gagal menghapus");
    }
  };

  // Filtered Attendees
  const filtered = attendees.filter((a) => {
    const matchSearch =
      !search.trim() ||
      (a.nama_lengkap && a.nama_lengkap.toLowerCase().includes(search.toLowerCase())) ||
      (a.no_anggota && a.no_anggota.toLowerCase().includes(search.toLowerCase())) ||
      (a.domisili && a.domisili.toLowerCase().includes(search.toLowerCase())) ||
      (a.id_line && a.id_line.toLowerCase().includes(search.toLowerCase()));

    const matchBadge = filterBadge === "semua" || (a.badge || "").toLowerCase() === filterBadge.toLowerCase();

    return matchSearch && matchBadge;
  });

  // Filter for manual checkin modal search
  const modalFilteredMembers = manualSearch.trim()
    ? memberDirectory.filter((m) => {
        const q = manualSearch.toLowerCase();
        return (
          (m.nama_lengkap && m.nama_lengkap.toLowerCase().includes(q)) ||
          (m.no_anggota && m.no_anggota.toLowerCase().includes(q)) ||
          (m.id_line && m.id_line.toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : [];

  const pct = stats.totalAnggota > 0 ? Math.round((stats.totalHadir / stats.totalAnggota) * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg, #0d0e12)",
        color: "var(--fg, #e5e7eb)",
        fontFamily: "var(--font-jakarta, sans-serif)",
        padding: "24px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Navigation Sub Navbar */}
        <AdminSubNav
          activeKey="gathering"
          title="Presensi Gathering Offline"
          subtitle="Scan QR KTA anggota, verifikasi kehadiran fisik, & export data ke Microsoft Excel"
        />

        {/* Toast / Alert Message */}
        {msg && (
          <div
            style={{
              padding: "12px 18px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#34d399",
              borderRadius: 12,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <span>{msg}</span>
            <button
              onClick={() => setMsg("")}
              style={{ background: "transparent", border: "none", color: "#34d399", cursor: "pointer", fontSize: 18 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── TOP ACTION BAR ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: "16px 20px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.74rem", color: "var(--fg-dim, #888)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Event Terpilih
            </span>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--gold, #c9a84c)", marginTop: 2 }}>
              {eventName}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Link buka scanner kamera */}
            <Link
              href="/gathering/scan"
              target="_blank"
              style={{
                background: "linear-gradient(135deg, #c9a84c 0%, #a8842e 100%)",
                color: "#0a0f0c",
                padding: "10px 18px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(201, 168, 76, 0.3)",
              }}
            >
              <i className="bx bx-camera" style={{ fontSize: 18 }} />
              <span>Buka Scanner Kamera (Mobile)</span>
            </Link>

            {/* Tombol Export Excel */}
            <a
              href={`/api/gathering/export?event=${encodeURIComponent(eventName)}`}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                padding: "10px 18px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
              }}
            >
              <i className="bx bx-download" style={{ fontSize: 18 }} />
              <span>Unduh Excel (.csv)</span>
            </a>

            {/* Tombol Input Manual */}
            <button
              onClick={() => setShowManualModal(true)}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "var(--fg, #e5e7eb)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i className="bx bx-user-plus" style={{ fontSize: 18 }} />
              <span>Input Manual</span>
            </button>

            {/* Tombol Refresh */}
            <button
              onClick={fetchData}
              style={{
                background: "transparent",
                color: "var(--fg-dim, #888)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "10px 14px",
                borderRadius: 10,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
              title="Refresh"
            >
              <i className="bx bx-refresh" style={{ fontSize: 20 }} />
            </button>
          </div>
        </div>

        {/* ── METRIC STATS CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Total Hadir */}
          <div
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: 16,
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(16, 185, 129, 0.2)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              <i className="bx bx-user-check" />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--fg-dim, #888)", textTransform: "uppercase", fontWeight: 700 }}>
                Anggota Hadir
              </span>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981", lineHeight: 1.1 }}>
                {stats.totalHadir}{" "}
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--fg-dim, #888)" }}>
                  / {stats.totalAnggota}
                </span>
              </div>
            </div>
          </div>

          {/* Persentase Kehadiran */}
          <div
            style={{
              background: "rgba(201, 168, 76, 0.08)",
              border: "1px solid rgba(201, 168, 76, 0.25)",
              borderRadius: 16,
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(201, 168, 76, 0.2)",
                color: "#c9a84c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              <i className="bx bx-pie-chart-alt-2" />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--fg-dim, #888)", textTransform: "uppercase", fontWeight: 700 }}>
                Tingkat Kehadiran
              </span>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffd778", lineHeight: 1.1 }}>
                {pct}%
              </div>
            </div>
          </div>

          {/* Breakdown Badge */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 16,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--fg-dim, #888)", textTransform: "uppercase", fontWeight: 700 }}>
              Distribusi Badge Hadir
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
              {Object.entries(stats.perBadge).length > 0 ? (
                Object.entries(stats.perBadge).map(([badgeId, count]) => {
                  const b = getMemberBadge(badgeId);
                  return (
                    <span
                      key={badgeId}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: b.bgColor,
                        color: b.color,
                        border: `1px solid ${b.borderColor}`,
                      }}
                    >
                      {b.name}: {count}
                    </span>
                  );
                })
              ) : (
                <span style={{ fontSize: 12, color: "var(--fg-dim, #888)" }}>Belum ada data</span>
              )}
            </div>
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 260 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <i
                className="bx bx-search"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--fg-dim, #888)",
                  fontSize: 18,
                }}
              />
              <input
                type="text"
                placeholder="Cari nama, No Anggota, Domisili, atau LINE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#fff",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <select
              value={filterBadge}
              onChange={(e) => setFilterBadge(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <option value="semua">Semua Badge</option>
              <option value="squire">Squire</option>
              <option value="cavalier">Cavalier</option>
              <option value="knight">Knight</option>
              <option value="paladin">Paladin</option>
              <option value="templar">Templar</option>
            </select>
          </div>

          <div style={{ fontSize: 13, color: "var(--fg-dim, #888)", fontWeight: 600 }}>
            Menampilkan {filtered.length} dari {attendees.length} kehadiran
          </div>
        </div>

        {/* ── ATTENDEES TABLE ── */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--gold, #c9a84c)" }}>
              <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32, marginBottom: 10, display: "block" }} />
              <span>Memuat data kehadiran gathering...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--fg-dim, #888)" }}>
              <i className="bx bx-user-x" style={{ fontSize: 42, marginBottom: 10, display: "block", opacity: 0.5 }} />
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Belum ada data presensi</div>
              <p style={{ fontSize: 13, margin: 0 }}>
                Gunakan scanner kamera atau input manual untuk mencatat kehadiran anggota di lokasi event.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "var(--fg-dim, #aaa)",
                    }}
                  >
                    <th style={{ padding: "14px 16px", width: 50 }}>#</th>
                    <th style={{ padding: "14px 16px" }}>Anggota</th>
                    <th style={{ padding: "14px 16px" }}>No Anggota</th>
                    <th style={{ padding: "14px 16px" }}>Domisili</th>
                    <th style={{ padding: "14px 16px" }}>Kontak</th>
                    <th style={{ padding: "14px 16px" }}>Badge</th>
                    <th style={{ padding: "14px 16px" }}>Waktu Check-In</th>
                    <th style={{ padding: "14px 16px" }}>Metode</th>
                    <th style={{ padding: "14px 16px", textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, idx) => {
                    const b = getMemberBadge(a.badge);
                    const timeStr = a.waktu_hadir
                      ? new Date(a.waktu_hadir).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-";

                    return (
                      <tr
                        key={a.id || idx}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.02)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 16px", color: "var(--fg-dim, #777)", fontFamily: "monospace" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: "#1a1e24",
                                border: "1px solid #c9a84c",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={
                                  a.foto_profil ||
                                  "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
                                }
                                alt="Avatar"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                            <div style={{ fontWeight: 700, color: "var(--fg, #f0f0f0)" }}>
                              {a.nama_lengkap}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "var(--gold, #c9a84c)" }}>
                          {a.no_anggota}
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--fg-dim, #aaa)" }}>
                          {a.domisili || "-"}
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--fg-dim, #aaa)" }}>
                          {a.id_line ? `LINE: ${a.id_line}` : a.kontak_id || "-"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 50,
                              background: b.bgColor,
                              color: b.color,
                              border: `1px solid ${b.borderColor}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {b.name}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#10b981", fontWeight: 600 }}>
                          {timeStr} WIB
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontSize: 10,
                              textTransform: "uppercase",
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: a.metode_checkin === "manual" ? "rgba(148, 163, 184, 0.15)" : "rgba(16, 185, 129, 0.15)",
                              color: a.metode_checkin === "manual" ? "#94a3b8" : "#34d399",
                            }}
                          >
                            {a.metode_checkin === "manual" ? "Manual" : "QR Scan"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id, a.nama_lengkap)}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              borderRadius: 6,
                              padding: "5px 10px",
                              fontSize: 12,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            title="Hapus Presensi"
                          >
                            <i className="bx bx-trash" /> Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL INPUT MANUAL PRESENSI ── */}
      {showManualModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 9999,
          }}
          onClick={() => setShowManualModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#161b22",
              border: "1px solid rgba(201, 168, 76, 0.4)",
              borderRadius: 20,
              padding: "24px 26px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className="bx bx-user-plus" style={{ fontSize: 24, color: "var(--gold, #c9a84c)" }} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff3d0" }}>
                  Catat Kehadiran Manual
                </h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                style={{ background: "transparent", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#a0a8a3", marginBottom: 16, lineHeight: 1.5 }}>
              Cari anggota dari database fanbase jika anggota tidak dapat menampilkan kartu KTA Digital.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", display: "block", marginBottom: 6 }}>
                Cari Anggota (Nama / No Anggota)
              </label>
              <input
                type="text"
                placeholder="Ketik nama anggota..."
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#0d1117",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* List Hasil Pencarian */}
            {modalFilteredMembers.length > 0 && (
              <div
                style={{
                  maxHeight: 220,
                  overflowY: "auto",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 10,
                  background: "#0d1117",
                  marginBottom: 16,
                }}
              >
                {modalFilteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleCheckinMember(m)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(201, 168, 76, 0.15)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#fff3d0" }}>{m.nama_lengkap}</div>
                      <div style={{ fontSize: 11, color: "var(--gold, #c9a84c)", fontFamily: "monospace" }}>
                        {m.no_anggota} {m.domisili ? `• ${m.domisili}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={submittingManual}
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Pilih ✓
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-dim, #aaa)", display: "block", marginBottom: 6 }}>
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Mengambil merchandise duluan"
                value={manualCatatan}
                onChange={(e) => setManualCatatan(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#0d1117",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#fff",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                style={{
                  background: "transparent",
                  color: "#aaa",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
