"use client";

import React, { useState, useMemo } from "react";

interface ImportBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (total: number) => void;
  defaultBatchName?: string;
}

interface ParsedMember {
  noAnggota?: string;
  nama: string;
  idLine: string;
  displayLine: string;
  gender: string;
  domisili: string;
  kontakPlatform: string;
  kontakId: string;
  nominalKas: number;
}

// Format template standar spreadsheet
export const SPREADSHEET_TEMPLATE_HEADER =
  "Nama Lengkap\tID LINE\tDisplay LINE\tGender\tDomisili\tKontak Platform\tKontak ID\tNominal Kas";

export default function ImportBatchModal({
  isOpen,
  onClose,
  onSuccess,
  defaultBatchName = "Batch 9",
}: ImportBatchModalProps) {
  const [batchName, setBatchName] = useState(defaultBatchName);
  const [inputText, setInputText] = useState("");
  const [autoKas, setAutoKas] = useState(true);
  const [sortAlphabet, setSortAlphabet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Parsing Realtime Textarea dengan Pemisah Cerdas (Tab, Pipe |, CSV Koma, Titik Koma, Spasi)
  const parsedMembers = useMemo(() => {
    if (!inputText.trim()) return [];
    const lines = inputText.trim().split(/\r?\n/);
    const result: ParsedMember[] = [];
    const seenKeys = new Set<string>();

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Lewati baris header jika ada
      const lower = line.toLowerCase();
      if (
        lower.includes("nama lengkap") ||
        lower.includes("id line") ||
        lower.includes("nomor anggota") ||
        lower.includes("timestamp") ||
        (lower.includes("nama") && lower.includes("gender"))
      ) {
        continue;
      }

      // Deteksi separator cerdas
      let parts: string[] = [];
      if (line.includes("\t")) {
        parts = line.split("\t").map((p) => p.trim());
      } else if (line.includes("|")) {
        parts = line
          .split("|")
          .map((p) => p.trim())
          .filter((p, idx, arr) => {
            if ((idx === 0 || idx === arr.length - 1) && p === "") return false;
            return true;
          });
      } else if (line.includes(";")) {
        parts = line.split(";").map((p) => p.trim());
      } else if (line.includes(",")) {
        parts = line.split(",").map((p) => p.trim());
      } else {
        parts = line.split(/ {2,}/).map((p) => p.trim());
      }

      if (parts.length < 2) continue;

      // Bersihkan nomor urut awalan jika ada (contoh: "1. Ahmad", "2) Budi", "#3 Citra")
      if (parts[0]) {
        parts[0] = parts[0].replace(/^(?:#|\d+[\.\)]\s*)/, "").trim();
      }

      let noAnggota = "";
      let nama = "";
      let idLine = "";
      let displayLine = "";
      let gender = "-";
      let domisili = "-";
      let kontakPlatform = "LINE";
      let kontakId = "-";
      let nominalKas = 30000;

      // POLA 1: Format Direktori Lengkap (No | No Anggota | Nama | ID Line | Display Line | Gender | Domisili | Platform | ID Kontak)
      if (parts[0].toUpperCase().startsWith("CAVA-") || (parts[1] && parts[1].toUpperCase().startsWith("CAVA-"))) {
        const idx = parts[0].toUpperCase().startsWith("CAVA-") ? 0 : 1;
        noAnggota = parts[idx];
        nama = parts[idx + 1] || "";
        idLine = parts[idx + 2] || "";
        displayLine = parts[idx + 3] || nama;
        gender = parts[idx + 4] || "-";
        domisili = parts[idx + 5] || "-";
        kontakPlatform = parts[idx + 6] || "LINE";
        kontakId = parts[idx + 7] || idLine || "-";
        if (parts[idx + 8]) {
          const nom = parts[idx + 8].replace(/[^0-9]/g, "");
          if (nom) nominalKas = parseInt(nom, 10);
        }
      }
      // POLA 2: Format Data Pembayaran Transfer (Timestamp | Nama | ID Line | Display | Gender | Nominal | Domisili | Platform | Kontak ID)
      else if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(parts[0])) {
        nama = parts[1] || "";
        idLine = parts[2] || "";
        displayLine = parts[3] || nama;
        gender = parts[4] || "-";
        const nom = (parts[5] || "30000").replace(/[^0-9]/g, "");
        nominalKas = parseInt(nom, 10) || 30000;
        domisili = parts[6] || "-";
        kontakPlatform = parts[7] || "LINE";
        kontakId = parts[8] || idLine || "-";
      }
      // POLA 3: Format Spreadsheet Rekomendasi (Nama | ID Line | Display Line | Gender | Domisili | Kontak Platform | Kontak ID | [Nominal])
      else {
        nama = parts[0] || "";
        idLine = parts[1] || "";
        displayLine = parts[2] || nama;
        gender = parts[3] || "-";
        domisili = parts[4] || "-";
        kontakPlatform = parts[5] || "LINE";
        kontakId = parts[6] || idLine || "-";
        if (parts[7]) {
          const nom = parts[7].replace(/[^0-9]/g, "");
          if (nom) nominalKas = parseInt(nom, 10);
        }
      }

      if (!nama) continue;

      // Normalisasi gender
      const gLower = gender.toLowerCase();
      if (gLower.includes("perempuan") || gLower === "p" || gLower === "f") gender = "Perempuan";
      else if (gLower.includes("laki") || gLower === "l" || gLower === "m") gender = "Laki-laki";

      // Anti-duplikasi lokal
      const dedupKey = (idLine || nama).toLowerCase();
      if (seenKeys.has(dedupKey)) continue;
      seenKeys.add(dedupKey);

      result.push({
        noAnggota,
        nama,
        idLine,
        displayLine,
        gender,
        domisili,
        kontakPlatform,
        kontakId,
        nominalKas,
      });
    }

    // Urutkan otomatis sesuai abjad nama lengkap jika diinginkan
    if (sortAlphabet) {
      result.sort((a, b) => {
        if (a.noAnggota && b.noAnggota) return 0;
        if (a.noAnggota) return -1;
        if (b.noAnggota) return 1;
        return a.nama.localeCompare(b.nama, "id", { sensitivity: "base" });
      });
    }

    return result;
  }, [inputText, sortAlphabet]);

  if (!isOpen) return null;

  const handleCopyHeaderTemplate = () => {
    navigator.clipboard.writeText(SPREADSHEET_TEMPLATE_HEADER);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedMembers.length === 0) {
      setMsg({
        type: "error",
        text: "Belum ada data anggota yang terdeteksi. Silakan tempelkan data nama & ID LINE ke kotak di bawah terlebih dahulu.",
      });
      return;
    }

    setLoading(true);
    setMsg({ type: "info", text: `Sedang memproses dan menyimpan ${parsedMembers.length} anggota ke database...` });

    try {
      const res = await fetch("/api/admin/recruitment-batches/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName,
          members: parsedMembers,
          autoCreateKas: autoKas,
          year: new Date().getFullYear(),
          startMonth: new Date().getMonth() + 1,
        }),
      });

      const data = await res.json();

      if (data.status) {
        setMsg({
          type: "success",
          text: `Berhasil! ${data.totalImported} anggota telah resmi masuk ke ${batchName} dengan nomor urut sesuai abjad!`,
        });
        if (onSuccess) onSuccess(data.totalImported);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setMsg({ type: "error", text: data.message || "Gagal mengimport data anggota." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Terjadi kendala jaringan saat menghubungkan ke server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          color: "#f8fafc",
          border: "1px solid #334155",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bersih & Variatif */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid #1e293b",
            background: "linear-gradient(to right, #1e293b, #0f172a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 10, color: "#38bdf8", fontWeight: 800 }}>
              <i className="bx bx-import" style={{ fontSize: "1.35rem" }} /> Import Anggota Batch ke Database
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>
              Salin data dari Google Sheets / Excel / Form. Nomor urut otomatis disusun rapi sesuai abjad nama (A-Z).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.6rem",
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
            }}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Feedback Alert Atas */}
            {msg && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background:
                    msg.type === "success"
                      ? "rgba(16, 185, 129, 0.15)"
                      : msg.type === "info"
                      ? "rgba(56, 189, 248, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${
                    msg.type === "success"
                      ? "#10b981"
                      : msg.type === "info"
                      ? "#38bdf8"
                      : "#ef4444"
                  }`,
                  color:
                    msg.type === "success"
                      ? "#34d399"
                      : msg.type === "info"
                      ? "#38bdf8"
                      : "#f87171",
                }}
              >
                <i
                  className={`bx ${
                    msg.type === "success"
                      ? "bx-check-circle"
                      : msg.type === "info"
                      ? "bx-loader-alt bx-spin"
                      : "bx-error-circle"
                  }`}
                  style={{ fontSize: "1.2rem" }}
                />
                <div>{msg.text}</div>
              </div>
            )}

            {/* Kontrol Batch & Template */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: 5 }}>
                  Nama Batch Target *
                </label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Contoh: Batch 9"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleCopyHeaderTemplate}
                style={{
                  padding: "9px 14px",
                  borderRadius: "8px",
                  background: copiedTemplate ? "rgba(16, 185, 129, 0.2)" : "#1e293b",
                  border: `1px solid ${copiedTemplate ? "#10b981" : "#334155"}`,
                  color: copiedTemplate ? "#34d399" : "#e2e8f0",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
                title="Salin judul kolom untuk ditempel di baris 1 spreadsheet"
              >
                <i className={`bx ${copiedTemplate ? "bx-check" : "bx-copy"}`} />
                {copiedTemplate ? "Header Disalin!" : "Salin Format Kolom"}
              </button>
            </div>

            {/* Opsi Checkbox: Otomatisasi Kas & Abjad */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
              {/* Checkbox Abjad */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="sortAbjadCheck"
                  checked={sortAlphabet}
                  onChange={(e) => setSortAlphabet(e.target.checked)}
                  style={{ cursor: "pointer", width: 17, height: 17, accentColor: "#3b82f6" }}
                />
                <label htmlFor="sortAbjadCheck" style={{ fontSize: "0.82rem", cursor: "pointer", color: "#e2e8f0", lineHeight: 1.4 }}>
                  <strong style={{ color: "#60a5fa" }}>Urutkan Abjad Nama (A - Z)</strong>
                  <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>Nomor anggota baru diurutkan alfabetis otomatis.</div>
                </label>
              </div>

              {/* Checkbox Kas */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="autoKasCheck"
                  checked={autoKas}
                  onChange={(e) => setAutoKas(e.target.checked)}
                  style={{ cursor: "pointer", width: 17, height: 17, accentColor: "#10b981" }}
                />
                <label htmlFor="autoKasCheck" style={{ fontSize: "0.82rem", cursor: "pointer", color: "#e2e8f0", lineHeight: 1.4 }}>
                  <strong style={{ color: "#34d399" }}>Otomatis Catat Kas Masuk (Rp 30.000)</strong>
                  <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>Akun langsung aktif &amp; lunas 2 bulan kas pertama.</div>
                </label>
              </div>
            </div>

            {/* Kotak Input Paste */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1" }}>
                  Tempelkan (Paste) Baris Tabel dari Google Sheets / Excel di sini:
                </label>
                <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  Mendukung pemisah Tab, Koma (CSV), Garis Tegak (|), atau Titik Koma
                </span>
              </div>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  "Nama Lengkap\tID LINE\tDisplay LINE\tGender\tDomisili\tKontak Platform\tKontak ID\n" +
                  "Ahmad Pratama\tahmad_cava9\tAhmad P\tLaki-laki\tJakarta\tX (Twitter)\t@ahmad_pratama\n" +
                  "Bunga Lestari\tbunga_cava9\tBunga L\tPerempuan\tBandung\tInstagram\t@bungalestari"
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#090d16",
                  border: "1px solid #334155",
                  color: "#f8fafc",
                  fontSize: "0.83rem",
                  fontFamily: "ui-monospace, monospace",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            {/* Pratinjau Tabel Realtime */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#f8fafc" }}>
                  Pratinjau Data Anggota:
                </div>
                <span
                  style={{
                    fontSize: "0.76rem",
                    padding: "3px 12px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    background: parsedMembers.length > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(100, 116, 139, 0.2)",
                    color: parsedMembers.length > 0 ? "#34d399" : "#94a3b8",
                    border: `1px solid ${parsedMembers.length > 0 ? "rgba(16, 185, 129, 0.3)" : "transparent"}`,
                  }}
                >
                  {parsedMembers.length} Anggota Terdeteksi {sortAlphabet && "(A - Z)"}
                </span>
              </div>

              {parsedMembers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "26px 16px",
                    border: "1px dashed #334155",
                    borderRadius: "10px",
                    color: "#94a3b8",
                    fontSize: "0.84rem",
                    background: "rgba(15, 23, 42, 0.4)",
                  }}
                >
                  <i className="bx bx-paste" style={{ fontSize: "1.8rem", color: "#64748b", display: "block", marginBottom: 6 }} />
                  Belum ada data. Salin baris dari Google Sheets atau Excel, lalu tempel (Ctrl + V) di kotak atas.
                </div>
              ) : (
                <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #334155", borderRadius: "10px", background: "#090d16" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#1e293b", borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                        <th style={{ padding: "8px 10px", width: 40, textAlign: "center" }}>#</th>
                        <th style={{ padding: "8px 10px" }}>Nama Lengkap</th>
                        <th style={{ padding: "8px 10px" }}>ID LINE</th>
                        <th style={{ padding: "8px 10px" }}>Display LINE</th>
                        <th style={{ padding: "8px 10px" }}>Gender</th>
                        <th style={{ padding: "8px 10px" }}>Domisili</th>
                        <th style={{ padding: "8px 10px" }}>Kontak</th>
                        <th style={{ padding: "8px 10px" }}>Kas Awal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedMembers.map((m, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
                            background: idx % 2 === 1 ? "rgba(30, 41, 59, 0.25)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "7px 10px", textAlign: "center", color: "#64748b" }}>{idx + 1}</td>
                          <td style={{ padding: "7px 10px", fontWeight: 700, color: "#f8fafc" }}>{m.nama}</td>
                          <td style={{ padding: "7px 10px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(16, 185, 129, 0.12)", color: "#34d399", fontWeight: 600 }}>
                              {m.idLine}
                            </span>
                          </td>
                          <td style={{ padding: "7px 10px", color: "#cbd5e1" }}>{m.displayLine}</td>
                          <td style={{ padding: "7px 10px", color: "#94a3b8" }}>{m.gender}</td>
                          <td style={{ padding: "7px 10px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", fontWeight: 600 }}>
                              {m.domisili}
                            </span>
                          </td>
                          <td style={{ padding: "7px 10px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(129, 140, 248, 0.12)", color: "#818cf8" }}>
                              {m.kontakPlatform}: {m.kontakId}
                            </span>
                          </td>
                          <td style={{ padding: "7px 10px", color: "#fbbf24", fontWeight: 700 }}>
                            Rp {m.nominalKas.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer Sticky dengan Status & Tombol Eksekusi */}
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid #1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: "#0b1120",
            }}
          >
            <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              {parsedMembers.length > 0 ? (
                <span style={{ color: "#34d399", fontWeight: 600 }}>
                  <i className="bx bx-check-circle" /> {parsedMembers.length} anggota siap dimasukkan ke database
                </span>
              ) : (
                <span>Silakan tempel data terlebih dahulu</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                }}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "9px 22px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    parsedMembers.length > 0
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#334155",
                  color: "#fff",
                  cursor: loading ? "wait" : "pointer",
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow:
                    parsedMembers.length > 0
                      ? "0 4px 14px rgba(16, 185, 129, 0.35)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "1.1rem" }} /> Menyimpan ke Database...
                  </>
                ) : (
                  <>
                    <i className="bx bx-check-double" style={{ fontSize: "1.1rem" }} />
                    {parsedMembers.length > 0
                      ? `Import ${parsedMembers.length} Anggota ke Database`
                      : "Import ke Database"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
