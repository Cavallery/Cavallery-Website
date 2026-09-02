"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../keanggotaan/page.module.css";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminSpreadsheetPage() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [sheetIdInput, setSheetIdInput] = useState("");
  const [activeSheetId, setActiveSheetId] = useState("");

  const fetchInfo = async () => {
    try {
      const res = await fetch("/api/admin/spreadsheet");
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const json = await res.json();
      if (json.status && json.data) {
        setInfo(json.data);
        if (json.data.sheetId) {
          setActiveSheetId(json.data.sheetId);
        } else {
          const saved = localStorage.getItem("cavallery_sheet_id");
          if (saved) setActiveSheetId(saved);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleSetSheetId = (e: React.FormEvent) => {
    e.preventDefault();
    let val = sheetIdInput.trim();
    // Extract ID if user pasted full URL
    const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      val = match[1];
    }
    if (val) {
      setActiveSheetId(val);
      localStorage.setItem("cavallery_sheet_id", val);
      setSheetIdInput("");
    }
  };

  const handleFullSync = async () => {
    if (
      !confirm(
        "Jalankan Full Sync Database ke Google Sheets sekarang? Semua data anggota aktif, kas, dan donasi akan di-backup ke spreadsheet."
      )
    ) {
      return;
    }

    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/admin/spreadsheet", { method: "POST" });
      const json = await res.json();
      if (json.status) {
        setSyncMsg(json.message);
      } else {
        alert(json.message || "Gagal melakukan sync");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat sync");
    } finally {
      setSyncing(false);
    }
  };

  const directSheetUrl = activeSheetId
    ? `https://docs.google.com/spreadsheets/d/${activeSheetId}/edit`
    : null;

  const embedUrl = activeSheetId
    ? `https://docs.google.com/spreadsheets/d/${activeSheetId}/htmlembed?widget=true&headers=false`
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topHeader}>
          <div>
            <Link href="/admin" className={styles.backBtn}>
              <i className="bx bx-arrow-back" /> Dashboard Utama
            </Link>
            <h1 className={styles.pageTitle} style={{ marginTop: 12 }}>
              <i className="bx bx-table" style={{ color: "#10b981", marginRight: 8 }} />
              Live Google Spreadsheet & Backup
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/admin/keanggotaan" className={styles.backBtn}>
              <i className="bx bx-group" /> Keanggotaan
            </Link>
            <Link href="/admin/kontributor" className={styles.backBtn}>
              <i className="bx bx-heart-circle" /> Kontributor
            </Link>
            <Link href="/admin/kas" className={styles.backBtn}>
              <i className="bx bx-wallet" /> Kas
            </Link>
            <Link href="/admin/donasi" className={styles.backBtn}>
              <i className="bx bx-donate-heart" /> Donasi
            </Link>
            <Link href="/admin/master-data" className={styles.backBtn} style={{ color: "#8b5cf6", borderColor: "rgba(139,92,246,0.4)" }}>
              <i className="bx bx-slider-alt" /> Master Data
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Sync Controls & Info Card */}
        <div className={styles.sectionCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 6px", fontFamily: "var(--serif)", color: "var(--primary)" }}>
                Status Koneksi Google Sheets & Apps Script
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--fg-muted)" }}>
                <span style={{ color: "#10b981", fontWeight: 700 }}>
                  <i className="bx bx-check-circle" /> Terhubung ke Google Apps Script Web App
                </span>
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="https://docs.google.com/spreadsheets/d/1t9PlUNLN2rdskLq-ZpellJI0umclokLm7G-DI-VnFXg/edit?gid=1846326647#gid=1846326647"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.backBtn}
                style={{ background: "#10b981", color: "#fff", border: "none", fontWeight: 800 }}
              >
                <i className="bx bx-link-external" /> Buka Spreadsheet di Tab Baru
              </a>
              <button
                type="button"
                className={styles.btnCreate}
                onClick={handleFullSync}
                disabled={syncing}
                style={{ padding: "10px 20px" }}
              >
                {syncing ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" /> Sedang Backup...
                  </>
                ) : (
                  <>
                    <i className="bx bx-cloud-upload" /> Sync / Backup Semua Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Input Spreadsheet ID / URL agar live preview langsung tampil */}
          <form
            onSubmit={handleSetSheetId}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginTop: 12,
              paddingTop: 14,
              borderTop: "1px dashed var(--border)",
              flexWrap: "wrap",
            }}
          >
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fg)" }}>
              URL / ID Google Spreadsheet:
            </label>
            <input
              type="text"
              className={styles.modalInput}
              style={{ flex: 1, minWidth: 280 }}
              placeholder="Paste URL Spreadsheet (https://docs.google.com/spreadsheets/d/.../edit)"
              value={sheetIdInput}
              onChange={(e) => setSheetIdInput(e.target.value)}
            />
            <button type="submit" className={styles.btnActionActivate} style={{ padding: "9px 18px" }}>
              <i className="bx bx-show" /> Tampilkan Spreadsheet
            </button>
          </form>

          {syncMsg && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 18px",
                borderRadius: 12,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              <i className="bx bx-check-circle" /> {syncMsg}
            </div>
          )}
        </div>

        {/* Live Embedded Spreadsheet */}
        <div className={styles.sectionCard} style={{ padding: 16 }}>
          <div className={styles.sectionHeader} style={{ padding: "8px 8px 16px" }}>
            <h2 className={styles.sectionTitle}>
              <i className="bx bx-spreadsheet" style={{ color: "var(--gold)" }} />
              Tampilan Live Spreadsheet
            </h2>
            {directSheetUrl && (
              <a
                href={directSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnCreate}
                style={{ fontSize: "0.82rem", padding: "8px 16px", textDecoration: "none" }}
              >
                <i className="bx bx-link-external" /> Buka Google Sheets Penuh
              </a>
            )}
          </div>

          {loading ? (
            <div className={styles.emptyBox}>
              <i className="bx bx-loader-alt bx-spin" />
              <p>Memuat spreadsheet...</p>
            </div>
          ) : embedUrl ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  width: "100%",
                  height: "720px",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1.5px solid var(--border)",
                  background: "#ffffff",
                }}
              >
                <iframe
                  src={embedUrl}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Cavallery Live Spreadsheet"
                />
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--gold-dim)",
                  borderRadius: 12,
                  fontSize: "0.82rem",
                  color: "var(--primary)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span>
                  💡 <strong>Catatan Google Drive:</strong> Jika frame di atas menampilkan pesan <em>"tidak dapat membuka file"</em> karena pembatasan cookies browser Google Drive, Anda dapat langsung mengklik tombol <strong>Buka Google Sheets Penuh</strong> di kanan atas untuk membuka dan mengedit tabel secara langsung.
                </span>
                {directSheetUrl && (
                  <a
                    href={directSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 800, color: "var(--gold)", textDecoration: "underline" }}
                  >
                    Buka di Tab Baru &rarr;
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyBox} style={{ padding: 36 }}>
              <i className="bx bx-table" style={{ fontSize: "2.8rem", color: "var(--gold)" }} />
              <p style={{ marginTop: 8, fontWeight: 800, fontSize: "1.05rem" }}>
                Backup otomatis via Google Apps Script sudah <strong>Aktif</strong>!
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--fg-dim)", maxWidth: 520, lineHeight: 1.6 }}>
                Masukkan URL / ID Spreadsheet Google Anda di kolom input di atas lalu klik <strong>Tampilkan Spreadsheet</strong> untuk menghubungkan viewer langsung.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
