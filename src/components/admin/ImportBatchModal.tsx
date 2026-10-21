"use client";

import React, { useState, useMemo } from "react";

interface ImportBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (total: number) => void;
  defaultBatchName?: string;
}

interface ParsedMember {
  nama: string;
  idLine: string;
  displayLine: string;
  gender: string;
  nominalKas: number;
  domisili: string;
  noAnggota?: string;
}

const PRESET_BATCH_9_DATA = `20/10/2026 21:25:35\tKapi\tnathkasep\tKapi\tPerempuan\t30.000
20/10/2026 21:26:48\tAlpin\tm_alfian_11\tUcing Hibeur\tLaki Laki\t30.000
20/10/2026 21:27:00\tSapit\tsafit14\tSapit\tPerempuan\t30.000
20/10/2026 21:27:24\tYusroh Taqiyya\tkia2108\tta\tPerempuan\t30.000
20/10/2026 21:28:20\tFarhan Hari\tfarhase\tAAN\tLaki Laki\t30.000
20/10/2026 21:29:15\tSyifa Nurzakiy\tCuplis0205\tCuplis0205\tLaki Laki\t30.000
20/10/2026 21:29:40\tFauzan Fadilla\tfauzanf_\tFauzanF\tLaki Laki\t30.000
20/10/2026 21:29:53\tRenaldi Mahardika Sispranata\trenaldimahardika\tRenaldi Mahardika S\tLaki Laki\t30.000
20/10/2026 21:30:25\tMuhammad Rifat Hakim\tmrfha2402\tRifat\tLaki Laki\t30.000
20/10/2026 21:30:41\tRamo Victoria\trmovvictoria\tRamo Victoria\tLaki Laki\t30.000
20/10/2026 21:30:57\tCyraa\t2607112104\tcyraacy\tPerempuan\t30.000
20/10/2026 21:31:34\tPanji Nasution\titsmenjii\tNjii Nasution\tLaki Laki\t30.000
20/10/2026 21:31:38\tCynde Aprillia Wulandari\tchop13er\tCynde Aprillia\tPerempuan\t30.000
20/10/2026 21:31:52\tCalvin Adrian\tnot__found909\tCalvin\tLaki Laki\t30.000
20/10/2026 21:32:35\tAura Anjannie\tayeyoura\tAuyaaay :/\tPerempuan\t30.000
20/10/2026 21:32:47\tDanistra Refazuan\tdanis_arp\tDanish\tLaki Laki\t30.000
20/10/2026 21:33:21\tmadaniatuzzahra\toyineee\teyinn\tPerempuan\t30.000
20/10/2026 21:33:26\tKirana Zaskia Putri Ardianti\tkiiranaa._\tKiiranAa.\tPerempuan\t30.000
20/10/2026 21:34:14\tNabila Adelia\t@lokeysen\tNabil\tPerempuan\t30.000
20/10/2026 21:36:43\tNurnia\tniaanya06\tniea anya\tPerempuan\t30.000
20/10/2026 21:40:13\tMirza Rabbani M\tm1rza182\tm1rzz\tLaki Laki\t30.000
20/10/2026 21:40:30\tEky septian\t3kyy53p\tEky Septian\tLaki Laki\t30.000
20/10/2026 21:41:10\tmuhammad faatihah risqi\tfaatihah_risqi\tMuhammad Faatihah\tLaki Laki\t30.000
20/10/2026 21:43:02\tmirkhamyusuf@gmail.com\t085228224376\tYusuf\tLaki Laki\t30.000
20/10/2026 21:45:40\tSyams Al Din Muhammad Channur\thollowearth\tQuantum\tLaki Laki\t30.000
20/10/2026 21:47:14\tMohammad Rasyid Arya Saputra (Botem)\tbotemmn\thai tem💫\tLaki Laki\t30.000
20/10/2026 21:53:17\tDzakwan Ghonim Fath'han Mubina\tdzghfm\tDzakwan Ghonim F.M.\tLaki Laki\t30.000
20/10/2026 22:05:40\tchyvii\talethrachyvii.\tcipii\tPerempuan\t30.000
20/10/2026 22:12:16\tAzumi\tellysiouss\tZoom.\tPerempuan\t30.000
20/10/2026 22:23:05\tGilang Adi Pratama\tarataa_gap\tArataa\tLaki Laki\t30.000
20/10/2026 22:38:29\tnatalia bening\tnatskii.\tnata\tPerempuan\t30.000
20/10/2026 22:40:28\tGebin Siregar\tgebscn2\tGebin Siregar\tLaki Laki\t30.000
20/10/2026 23:01:38\tTiara Adisty\ttiaraad00\tbek\tPerempuan\t30.000
20/10/2026 23:08:01\tAudriq Aliffio Athariq\t1445566788\tDriqqq\tLaki Laki\t30.000
21/10/2026 0:08:13\tAde bayu setiawan\tbayukimmyoshi\tAdeBayuSetiawan\tLaki Laki\t30.000
21/10/2026 2:17:49\tSANDI NAYOHAN ARDIANSYAH\tsannatz\tsannatz\tLaki Laki\t30.000
21/10/2026 5:44:19\tRahman\tmalinetzy\tRahman|Keith々\tLaki Laki\t30.000
21/10/2026 6:02:58\tAinayya Fathiyyaturahma\tna_yaa\tAinayya.F\tPerempuan\t30.000
21/10/2026 7:17:13\tBrahmasena/Sena\t1594876134221\tSenn\tLaki Laki\t30.000
21/10/2026 7:52:23\tNaufal\tdnaufal29\tNaufal💤\tLaki Laki\t30.000
21/10/2026 10:33:34\tAleecia Azka Zhavira\taleecilove\tcilok\tPerempuan\t30.000
21/10/2026 11:07:34\tRizky Adhitya\triztiya_\tAdit\tLaki Laki\t30.000
21/10/2026 11:24:26\tSalsabila Kalila Damayanti\tsaka_lla2103\tKalla\tPerempuan\t30.000
21/10/2026 11:43:14\tAndi Septian Nugroho\tviscabarca56\tDoue 969\tLaki Laki\t30.000
21/10/2026 12:42:50\tMuhammad Daffa Alfitrah\tdappe1403\tDappe\tLaki Laki\t30.000
21/10/2026 15:27:16\triaditta14@gmail.com\t8643738863985\tDitatat\tPerempuan\t30.000
21/10/2026 18:24:23\tkhanza alfathir\thumjapja\tjajahumaiir\tPerempuan\t30.000
21/10/2026 18:38:56\tZulfa Adriani Pulungan\tchick_arn\tArn\tPerempuan\t30.000
21/10/2026 19:47:23\tflorina\t1650512318510\toyinn\tPerempuan\t30.000
21/10/2026 21:23:44\tfell\tcntrylaa\tfell\tPerempuan\t30.000`;

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
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Parsing Textarea secara Realtime
  const parsedMembers = useMemo(() => {
    if (!inputText.trim()) return [];
    const lines = inputText.trim().split(/\r?\n/);
    const result: ParsedMember[] = [];
    const seenLineIds = new Set<string>();

    for (const line of lines) {
      if (!line.trim()) continue;
      // Skip header baris
      if (line.toLowerCase().includes("nama lengkap") || line.toLowerCase().includes("id line")) continue;

      const parts = line.split(/\t+| {2,}/).map((p) => p.trim()).filter(Boolean);
      if (parts.length < 2) continue;

      let nama = "";
      let idLine = "";
      let displayLine = "";
      let gender = "-";
      let nominalKas = 30000;
      let noAnggota = "";
      let domisili = "-";

      // Format dengan Timestamp di kolom pertama
      if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(parts[0])) {
        nama = parts[1] || "";
        idLine = parts[2] || "";
        displayLine = parts[3] || nama;
        gender = parts[4] || "-";
        const nomStr = (parts[5] || "30000").replace(/[^0-9]/g, "");
        nominalKas = parseInt(nomStr, 10) || 30000;
      } else if (parts[0].startsWith("CAVA-") || (parts[1] && parts[1].startsWith("CAVA-"))) {
        const idx = parts[0].startsWith("CAVA-") ? 0 : 1;
        noAnggota = parts[idx];
        nama = parts[idx + 1] || "";
        idLine = parts[idx + 2] || "";
        displayLine = parts[idx + 3] || nama;
        gender = parts[idx + 4] || "-";
        domisili = parts[idx + 5] || "-";
      } else {
        nama = parts[0] || "";
        idLine = parts[1] || "";
        displayLine = parts[2] || nama;
        gender = parts[3] || "-";
        if (parts[4]) {
          const nomStr = parts[4].replace(/[^0-9]/g, "");
          if (nomStr) nominalKas = parseInt(nomStr, 10);
        }
      }

      if (!nama) continue;

      // Anti-duplikasi (misal nama pengirim transfer yang muncul berulang)
      const dedupKey = idLine ? idLine.toLowerCase() : nama.toLowerCase();
      if (seenLineIds.has(dedupKey)) continue;
      seenLineIds.add(dedupKey);

      result.push({
        noAnggota,
        nama,
        idLine,
        displayLine,
        gender,
        nominalKas,
        domisili,
      });
    }

    return result;
  }, [inputText]);

  if (!isOpen) return null;

  const handleLoadPreset = () => {
    setInputText(PRESET_BATCH_9_DATA);
    setMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedMembers.length === 0) {
      setMsg({ type: "error", text: "Tidak ada data anggota valid yang terdeteksi dari teks yang dimasukkan." });
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
          maxWidth: "880px",
          maxHeight: "90vh",
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
              <i className="bx bx-import" /> Import Anggota Batch (Copy-Paste dari Spreadsheet)
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--fg-muted, #9ca3af)" }}>
              Salin baris langsung dari Google Sheets/Excel. Nomor anggota dan akun kas otomatis dibuatkan secara langsung.
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

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Alert Message */}
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

            {/* Pengaturan Batch */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
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

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-muted, #9ca3af)", display: "block", marginBottom: 4 }}>
                  Preset Cepat
                </label>
                <button
                  type="button"
                  onClick={handleLoadPreset}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <i className="bx bxs-zap" /> Muat 50 Pendaftar Batch 9 (Lunas Rp 30.000)
                </button>
              </div>
            </div>

            {/* Opsi Otomatisasi */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px" }}>
              <input
                type="checkbox"
                id="autoKasCheck"
                checked={autoKas}
                onChange={(e) => setAutoKas(e.target.checked)}
                style={{ cursor: "pointer", width: 16, height: 16 }}
              />
              <label htmlFor="autoKasCheck" style={{ fontSize: "0.84rem", cursor: "pointer", color: "var(--fg, #fff)" }}>
                <strong>Otomatis Aktifkan Akun &amp; Catat Kas Rp 30.000 (Lunas)</strong> — Anggota langsung lunas iuran kas dan langsung bisa login di cavallery.id/kas tanpa daftar ulang.
              </label>
            </div>

            {/* Textarea Paste */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--fg-muted, #9ca3af)" }}>
                  Paste Data dari Excel / Google Spreadsheet di sini:
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--gold, #c9a84c)", fontWeight: 700 }}>
                  Format fleksibel (Timestamp, Nama, ID LINE, Display Name, Gender, Nominal)
                </span>
              </div>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={"Contoh:\n20/10/2026 21:25:35\tKapi\tnathkasep\tKapi\tPerempuan\t30.000\n20/10/2026 21:26:48\tAlpin\tm_alfian_11\tUcing Hibeur\tLaki Laki\t30.000"}
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
                <div style={{ textAlign: "center", padding: "20px", border: "1px dashed var(--border, #333)", borderRadius: "8px", color: "var(--fg-muted, #9ca3af)", fontSize: "0.82rem" }}>
                  Belum ada data. Paste data dari spreadsheet Anda atau klik tombol "Muat 50 Pendaftar Batch 9" di atas.
                </div>
              ) : (
                <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border, #333)", borderRadius: "8px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--border, #333)", color: "var(--gold, #c9a84c)" }}>
                        <th style={{ padding: "6px 10px", width: 40 }}>#</th>
                        <th style={{ padding: "6px 10px" }}>Nama Lengkap</th>
                        <th style={{ padding: "6px 10px" }}>ID LINE</th>
                        <th style={{ padding: "6px 10px" }}>Display LINE</th>
                        <th style={{ padding: "6px 10px" }}>Gender</th>
                        <th style={{ padding: "6px 10px" }}>Kas Awal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedMembers.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "6px 10px", color: "var(--fg-muted, #9ca3af)" }}>{idx + 1}</td>
                          <td style={{ padding: "6px 10px", fontWeight: 700 }}>{m.nama}</td>
                          <td style={{ padding: "6px 10px", color: "#10b981" }}>{m.idLine}</td>
                          <td style={{ padding: "6px 10px" }}>{m.displayLine}</td>
                          <td style={{ padding: "6px 10px" }}>{m.gender}</td>
                          <td style={{ padding: "6px 10px", color: "var(--gold, #c9a84c)" }}>
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
