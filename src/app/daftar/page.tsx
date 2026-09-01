"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const PLATFORMS = [
  "X (Twitter)",
  "Instagram",
  "WhatsApp",
  "Telegram",
  "Discord",
  "TikTok",
  "Lainnya",
];

const GENDERS = ["Laki-laki", "Perempuan"];

export default function DaftarPage() {
  const [tipe, setTipe] = useState<"anggota" | "donatur">("anggota");

  // Form Anggota State
  const [namaLengkap, setNamaLengkap] = useState("");
  const [idLine, setIdLine] = useState("");
  const [displayLine, setDisplayLine] = useState("");
  const [discord, setDiscord] = useState("");
  const [gender, setGender] = useState("Laki-laki");
  const [domisili, setDomisili] = useState("");
  const [kontakPlatform, setKontakPlatform] = useState("X (Twitter)");
  const [kontakId, setKontakId] = useState("");

  // Form Donatur State
  const [namaDonatur, setNamaDonatur] = useState("");
  const [kontakPlatformDonatur, setKontakPlatformDonatur] = useState("X (Twitter)");
  const [kontakIdDonatur, setKontakIdDonatur] = useState("");
  const [discordDonatur, setDiscordDonatur] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{ message: string; tipe: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      let payload: any = { tipe };

      if (tipe === "anggota") {
        if (!namaLengkap.trim() || !idLine.trim() || !domisili.trim() || !kontakId.trim()) {
          setErrorMsg("Mohon lengkapi seluruh field wajib bertanda WAJIB");
          setLoading(false);
          return;
        }
        payload = {
          ...payload,
          namaLengkap,
          idLine,
          displayLine,
          discord,
          gender,
          domisili,
          kontakPlatform,
          kontakId,
        };
      } else {
        if (!namaDonatur.trim() || !kontakIdDonatur.trim()) {
          setErrorMsg("Mohon lengkapi Nama dan Kontak bertanda WAJIB");
          setLoading(false);
          return;
        }
        payload = {
          ...payload,
          nama: namaDonatur,
          kontakPlatform: kontakPlatformDonatur,
          kontakId: kontakIdDonatur,
          discord: discordDonatur,
        };
      }

      const res = await fetch("/api/auth/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        setErrorMsg(json.message || "Gagal melakukan pendaftaran.");
      } else {
        setSuccessData({ message: json.message, tipe });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={`glassCard ${styles.card}`}>
          {/* Logo Brand Header */}
          <div className={styles.logoWrap}>
            <img
              src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
              alt="Cavallery Logo"
              className={styles.logoImg}
            />
          </div>

          <h1 className={styles.brandTitle}>Cavallery</h1>

          <div className={styles.subtitleRow}>
            <div className={styles.subtitleLine} />
            <span className={styles.subtitleText}>Daftar</span>
            <div className={styles.subtitleLine} />
          </div>

          <p className={styles.instruction}>
            Pilih daftar sebagai anggota atau donatur terlebih dahulu.
          </p>

          {/* Toggle Pill (Anggota | Donatur) */}
          <div className={styles.togglePill}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${tipe === "anggota" ? styles.toggleBtnActive : ""}`}
              onClick={() => {
                setTipe("anggota");
                setErrorMsg("");
                setSuccessData(null);
              }}
            >
              <i className="bx bx-user" /> Anggota
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${tipe === "donatur" ? styles.toggleBtnActive : ""}`}
              onClick={() => {
                setTipe("donatur");
                setErrorMsg("");
                setSuccessData(null);
              }}
            >
              <i className="bx bx-donate-heart" /> Donatur
            </button>
          </div>

          {/* Success Dialog */}
          {successData ? (
            <div className={styles.successBox}>
              <i className={`bx bx-check-circle ${styles.successIcon}`} />
              <h3 className={styles.successTitle}>Pendaftaran Diterima</h3>
              <p className={styles.successDesc}>{successData.message}</p>
              <Link href="/masuk" className={styles.submitBtn} style={{ textDecoration: "none", marginTop: 8 }}>
                <i className="bx bx-log-in" /> Lanjut ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {errorMsg && (
                <div className={styles.errorBox}>
                  <i className="bx bx-error-circle" /> {errorMsg}
                </div>
              )}

              {tipe === "anggota" ? (
                <>
                  {/* Nama Lengkap */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Nama Lengkap</label>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Nama lengkap atau alias"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      required
                    />
                  </div>

                  {/* ID Line */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>ID LINE</label>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="ID LINE aktif Anda"
                      value={idLine}
                      onChange={(e) => setIdLine(e.target.value)}
                      required
                    />
                  </div>

                  {/* Display Line */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Display Name LINE</label>
                      <span className={styles.badgeOpsional}>OPSIONAL</span>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Nama tampilan di aplikasi LINE"
                      value={displayLine}
                      onChange={(e) => setDisplayLine(e.target.value)}
                    />
                  </div>

                  {/* ID / Display Discord */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>ID / Nama Tampilan Discord</label>
                      <span className={styles.badgeOpsional}>OPSIONAL</span>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Contoh: cavallery#0001 atau username"
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                    />
                    <span className={styles.hint}>Kosongkan jika tidak mempunyai akun Discord.</span>
                  </div>

                  {/* Jenis Kelamin */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Jenis Kelamin</label>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </div>
                    <select
                      className={styles.select}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Domisili */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Kota Domisili</label>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Contoh: Jakarta, Surabaya, Bandung"
                      value={domisili}
                      onChange={(e) => setDomisili(e.target.value)}
                      required
                    />
                  </div>

                  {/* Kontak Utama (Platform + ID) */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Kontak</label>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </div>
                    <div className={styles.inputGroup}>
                      <select
                        className={styles.select}
                        value={kontakPlatform}
                        onChange={(e) => setKontakPlatform(e.target.value)}
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="ID / Nomor Kontak (cth: @cavallery)"
                        value={kontakId}
                        onChange={(e) => setKontakId(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Form Donatur */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Nama / Alias</label>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Nama lengkap atau alias donatur"
                      value={namaDonatur}
                      onChange={(e) => setNamaDonatur(e.target.value)}
                      required
                    />
                  </div>

                  {/* Kontak Donatur */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Kontak</label>
                      <span className={styles.badgeWajib}>WAJIB</span>
                    </div>
                    <div className={styles.inputGroup}>
                      <select
                        className={styles.select}
                        value={kontakPlatformDonatur}
                        onChange={(e) => setKontakPlatformDonatur(e.target.value)}
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="ID / Nomor Kontak (cth: @username)"
                        value={kontakIdDonatur}
                        onChange={(e) => setKontakIdDonatur(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Discord Donatur */}
                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>ID / Nama Tampilan Discord</label>
                      <span className={styles.badgeOpsional}>OPSIONAL</span>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Contoh: user#1234 atau username"
                      value={discordDonatur}
                      onChange={(e) => setDiscordDonatur(e.target.value)}
                    />
                    <span className={styles.hint}>Kosongkan jika tidak mempunyai akun Discord.</span>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <i className="bx bx-user-plus" /> Daftar {tipe === "anggota" ? "Anggota" : "Donatur"}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link to /masuk */}
          <div className={styles.footerLinks}>
            Sudah mendaftar sebelumnya?{" "}
            <Link href="/masuk" className={styles.link}>
              Masuk di sini
            </Link>
          </div>

          <div className={styles.helpText}>
            Jika terjadi kendala, kehilangan, perubahan atau ketidaksesuaian data, dapat menghubungi admin Cavallery.
          </div>
        </div>
      </div>
    </div>
  );
}
