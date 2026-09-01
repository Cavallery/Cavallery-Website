"use client";

import { useState } from "react";
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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

          <form onSubmit={handleSubmit} className={styles.form}>
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
                    className={styles.input}
                    placeholder="Contoh: CAVA-0001"
                    value={noAnggota}
                    onChange={(e) => setNoAnggota(e.target.value)}
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
                    placeholder="ID LINE terdaftar"
                    value={idLine}
                    onChange={(e) => setIdLine(e.target.value)}
                    required
                  />
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
                    placeholder="Nama yang didaftarkan"
                    value={namaDonatur}
                    onChange={(e) => setNamaDonatur(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>ID / Nomor Kontak</label>
                    <span className={styles.badgeWajib}>WAJIB</span>
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="ID / Nomor Kontak terdaftar"
                    value={kontakIdDonatur}
                    onChange={(e) => setKontakIdDonatur(e.target.value)}
                    required
                  />
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
