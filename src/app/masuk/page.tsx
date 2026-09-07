"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function MasukPage() {
  const router = useRouter();
  const [tipe, setTipe] = useState<"anggota" | "donatur">("anggota");

  // Form Anggota
  const [noAnggota, setNoAnggota] = useState("");
  const [idLine, setIdLine] = useState("");

  // Form Donatur
  const [namaDonatur, setNamaDonatur] = useState("");
  const [kontakIdDonatur, setKontakIdDonatur] = useState("");

  // Show/Hide Password State
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setNoAnggota((prev) => (prev.toUpperCase() === "VALLENCIA" || prev.toLowerCase() === "admin" ? "" : prev));
      setIdLine((prev) => (prev === "kurn!@wan" ? "" : prev));
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setNoAnggota("");
    setIdLine("");
    setNamaDonatur("");
    setKontakIdDonatur("");
  }, [tipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      let payload: any = { tipe };

      if (tipe === "anggota") {
        if (!noAnggota.trim() || !idLine.trim()) {
          setErrorMsg("Nomor Anggota dan ID LINE wajib diisi");
          setLoading(false);
          return;
        }
        payload = {
          ...payload,
          noAnggota: noAnggota.trim(),
          idLine: idLine.trim(),
        };
      } else {
        if (!namaDonatur.trim() || !kontakIdDonatur.trim()) {
          setErrorMsg("Nama dan ID / Nomor Kontak wajib diisi");
          setLoading(false);
          return;
        }
        payload = {
          ...payload,
          nama: namaDonatur.trim(),
          kontakId: kontakIdDonatur.trim(),
        };
      }

      const res = await fetch("/api/auth/masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        setErrorMsg(json.message || "Gagal masuk. Periksa kembali data Anda.");
      } else {
        // Redirect to profile
        router.push("/profil");
        router.refresh();
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
            <span className={styles.subtitleText}>Masuk</span>
            <div className={styles.subtitleLine} />
          </div>

          <p className={styles.instruction}>
            Pilih masuk sebagai anggota atau donatur terlebih dahulu.
          </p>

          {/* Toggle Pill */}
          <div className={styles.togglePill}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${tipe === "anggota" ? styles.toggleBtnActive : ""}`}
              onClick={() => {
                setTipe("anggota");
                setErrorMsg("");
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
              }}
            >
              <i className="bx bx-donate-heart" /> Donatur
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            {/* Dummy anti-autofill to trick browser password manager */}
            <input type="text" name="fake_user" style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <input type="password" name="fake_pass" style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }} tabIndex={-1} aria-hidden="true" autoComplete="new-password" />

            {errorMsg && (
              <div className={styles.errorBox}>
                <i className="bx bx-error-circle" /> {errorMsg}
              </div>
            )}

            {tipe === "anggota" ? (
              <>
                {/* Nomor Anggota */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Nomor Anggota</label>
                    <span className={styles.badgeWajib}>WAJIB</span>
                  </div>
                  <input
                    type="text"
                    name="cava_masuk_no_anggota"
                    id="cava_masuk_no_anggota"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    className={styles.input}
                    placeholder="Contoh: CAVA-0001"
                    value={noAnggota}
                    onChange={(e) => setNoAnggota(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                {/* ID Line (Sandi Anggota) */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>ID LINE (Kata Sandi)</label>
                    <span className={styles.badgeWajib}>WAJIB</span>
                  </div>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="cava_masuk_id_line"
                      id="cava_masuk_id_line"
                      autoComplete="new-password"
                      autoCorrect="off"
                      spellCheck="false"
                      className={styles.input}
                      placeholder="ID LINE terdaftar"
                      value={idLine}
                      onChange={(e) => setIdLine(e.target.value)}
                      style={{ paddingRight: 44 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--fg-muted)",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 4,
                      }}
                      title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      <i className={`bx ${showPassword ? "bx-show" : "bx-hide"}`} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Form Donatur / Kontributor */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Nama Kontributor / Alias</label>
                    <span className={styles.badgeWajib}>WAJIB</span>
                  </div>
                  <input
                    type="text"
                    name="cava_masuk_donatur_nama"
                    id="cava_masuk_donatur_nama"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className={styles.input}
                    placeholder="Nama yang didaftarkan"
                    value={namaDonatur}
                    onChange={(e) => setNamaDonatur(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>ID Kontak (Kata Sandi)</label>
                    <span className={styles.badgeWajib}>WAJIB</span>
                  </div>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="cava_masuk_donatur_kontak"
                      id="cava_masuk_donatur_kontak"
                      autoComplete="new-password"
                      autoCorrect="off"
                      spellCheck="false"
                      className={styles.input}
                      placeholder="ID / Nomor Kontak terdaftar"
                      value={kontakIdDonatur}
                      onChange={(e) => setKontakIdDonatur(e.target.value)}
                      style={{ paddingRight: 44 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--fg-muted)",
                        fontSize: "1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 4,
                      }}
                      title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      <i className={`bx ${showPassword ? "bx-show" : "bx-hide"}`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <i className="bx bx-loader-alt bx-spin" /> Memeriksa...
                </>
              ) : (
                <>
                  <i className="bx bx-log-in" /> Masuk
                </>
              )}
            </button>
          </form>

          {/* Footer Link to /daftar */}
          <div className={styles.footerLinks}>
            Belum mendaftar sebelumnya?{" "}
            <Link href="/daftar" className={styles.link}>
              Daftar di sini
            </Link>
          </div>

          <div className={styles.helpText}>
            Jika terjadi kendala, kehilangan, perubahan atau ketidaksesuaian data, dapat menghubungi admin.
          </div>
        </div>
      </div>
    </div>
  );
}
