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
  const [loading, setLoading] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Parsing Realtime Textarea
  const parsedMembers = useMemo(() => {
    if (!inputText.trim()) return [];
    const lines = inputText.trim().split(/\r?\n/);
    const result: ParsedMember[] = [];
    const seenKeys = new Set<string>();

    for (const line of lines) {
      if (!line.trim()) continue;

      // Lewati baris header jika ada
      const lower = line.toLowerCase();
      if (lower.includes("nama lengkap") || lower.includes("id line") || lower.includes("nomor anggota")) {
        continue;
      }

      // Pisahkan berdasarkan tab atau 2 spasi lebih
      const parts = line.split(/\t+| {2,}/).map((p) => p.trim());
      if (parts.length < 2) continue;

      let noAnggota = "";
      let nama = "";
      let idLine = "";
      let displayLine = "";
      let gender = "-";
      let domisili = "-";
      let kontakPlatform = "LINE";
      let kontakId = "-";
      let nominalKas = 30000;

      // POLA 1: Format Direktori Penuh Website (No | No Anggota | Nama | ID Line | Display Line | Gender | Domisili | Platform | ID Kontak)
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

      // Anti-duplikasi nama/LINE ID
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

    return result;
  }, [inputText]);

  if (!isOpen) return null;

  const handleCopyHeaderTemplate = () => {
    navigator.clipboard.writeText(SPREADSHEET_TEMPLATE_HEADER);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedMembers.length === 0) {
      setMsg({ type: "error", text: "Tidak ada data anggota valid yang terdeteksi. Silakan paste baris dari spreadsheet." });
      return;
    }

    setLoading(true);
    setMsg(null);

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
        setMsg({ type: "success", text: `Berhasil mengimport ${data.totalImported} anggota ke ${batchName}!` });
        if (onSuccess) onSuccess(data.totalImported);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMsg({ type: "error", text: data.message || "Gagal mengimport data" });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Terjadi kesalahan jaringan" });
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
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface, #1e1e1e)",
          color: "var(--fg, #fff)",
          border: "1px solid var(--border, #333)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border, #333)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8, color: "var(--gold, #c9a84c)" }}>
              <i className="bx bx-import" /> Import Anggota Batch dari Spreadsheet
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--fg-muted, #9ca3af)" }}>
              Salin baris langsung dari Google Sheets/Excel. Nomor anggota, domisili, kontak, dan akun kas otomatis diproses.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--fg-muted, #9ca3af)",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Feedback Alert */}
            {msg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  background: msg.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${msg.type === "success" ? "#10b981" : "#ef4444"}`,
                  color: msg.type === "success" ? "#10b981" : "#ef4444",
                }}
              >
                {msg.text}
              </div>
            )}

            {/* Batch Target & Salin Format Kolom */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-muted, #9ca3af)", display: "block", marginBottom: 4 }}>
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
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "var(--bg, #111)",
                    border: "1px solid var(--border, #333)",
                    color: "var(--fg, #fff)",
                    fontSize: "0.88rem",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleCopyHeaderTemplate}
                style={{
                  padding: "9px 14px",
                  borderRadius: "8px",
                  background: copiedTemplate ? "#10b981" : "rgba(255,255,255,0.08)",
                  border: "1px solid var(--border, #444)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
                title="Salin header nama-nama kolom untuk ditempel di baris 1 Google Sheets"
              >
                <i className={`bx ${copiedTemplate ? "bx-check" : "bx-copy"}`} />
                {copiedTemplate ? "Header Kolom Disalin!" : "Salin Format Header Kolom"}
              </button>
            </div>

            {/* Opsi Otomatisasi Kas & Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "8px",
              }}
            >
              <input
                type="checkbox"
                id="autoKasCheck"
                checked={autoKas}
                onChange={(e) => setAutoKas(e.target.checked)}
                style={{ cursor: "pointer", width: 16, height: 16 }}
              />
              <label htmlFor="autoKasCheck" style={{ fontSize: "0.84rem", cursor: "pointer", color: "var(--fg, #fff)" }}>
                <strong>Otomatis Aktifkan Akun &amp; Catat Kas Masuk (Lunas Rp 30.000)</strong> — Anggota langsung lunas kas dan langsung bisa login di cavallery.id/kas dengan No Anggota &amp; ID LINE.
              </label>
            </div>

            {/* Textarea Paste */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-muted, #9ca3af)" }}>
                  Paste Baris Data dari Google Sheets / Excel di sini:
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--gold, #c9a84c)", fontWeight: 700 }}>
                  Format: Nama | ID Line | Display Line | Gender | Domisili | Kontak Platform | Kontak ID
                </span>
              </div>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  "Nama Lengkap\tID LINE\tDisplay LINE\tGender\tDomisili\tKontak Platform\tKontak ID\n" +
                  "Kapi\tnathkasep\tKapi\tPerempuan\tBekasi\tX (Twitter)\t@CErine_JKT48\n" +
                  "Alpin\tm_alfian_11\tUcing Hibeur\tLaki-laki\tBogor\tX (Twitter)\t@alpin_09"
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "var(--bg, #111)",
                  border: "1px solid var(--border, #333)",
                  color: "var(--fg, #fff)",
                  fontSize: "0.82rem",
                  fontFamily: "monospace",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Live Preview Table */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--fg, #fff)" }}>
                  Pratinjau Data yang Terdeteksi:
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    background: parsedMembers.length > 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(156, 163, 175, 0.2)",
                    color: parsedMembers.length > 0 ? "#10b981" : "var(--fg-muted, #9ca3af)",
                  }}
                >
                  {parsedMembers.length} Anggota Siap Di-import
                </span>
              </div>

              {parsedMembers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    border: "1px dashed var(--border, #333)",
                    borderRadius: "8px",
                    color: "var(--fg-muted, #9ca3af)",
                    fontSize: "0.82rem",
                  }}
                >
                  Belum ada baris data. Salin baris dari Google Spreadsheet Anda dan paste pada kotak di atas.
                </div>
              ) : (
                <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid var(--border, #333)", borderRadius: "8px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--border, #333)", color: "var(--gold, #c9a84c)" }}>
                        <th style={{ padding: "6px 8px", width: 35 }}>#</th>
                        <th style={{ padding: "6px 8px" }}>Nama Lengkap</th>
                        <th style={{ padding: "6px 8px" }}>ID LINE</th>
                        <th style={{ padding: "6px 8px" }}>Display LINE</th>
                        <th style={{ padding: "6px 8px" }}>Gender</th>
                        <th style={{ padding: "6px 8px" }}>Domisili</th>
                        <th style={{ padding: "6px 8px" }}>Kontak</th>
                        <th style={{ padding: "6px 8px" }}>Kas Awal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedMembers.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "6px 8px", color: "var(--fg-muted, #9ca3af)" }}>{idx + 1}</td>
                          <td style={{ padding: "6px 8px", fontWeight: 700 }}>{m.nama}</td>
                          <td style={{ padding: "6px 8px", color: "#10b981" }}>{m.idLine}</td>
                          <td style={{ padding: "6px 8px" }}>{m.displayLine}</td>
                          <td style={{ padding: "6px 8px" }}>{m.gender}</td>
                          <td style={{ padding: "6px 8px", color: "var(--cv-orange, #f97316)" }}>{m.domisili}</td>
                          <td style={{ padding: "6px 8px", color: "#60a5fa" }}>
                            {m.kontakPlatform}: {m.kontakId}
                          </td>
                          <td style={{ padding: "6px 8px", color: "var(--gold, #c9a84c)" }}>
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

          {/* Footer Actions */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid var(--border, #333)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border, #333)",
                background: "transparent",
                color: "var(--fg, #fff)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || parsedMembers.length === 0}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: parsedMembers.length > 0 ? "linear-gradient(135deg, #10b981, #059669)" : "#374151",
                color: "#fff",
                cursor: parsedMembers.length > 0 && !loading ? "pointer" : "not-allowed",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {loading ? (
                <>
                  <i className="bx bx-loader-alt bx-spin" /> Memproses Import...
                </>
              ) : (
                <>
                  <i className="bx bx-check-circle" /> Import {parsedMembers.length} Anggota ke Database
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
