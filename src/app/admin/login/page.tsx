"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        setErrorMsg(json.message || "Username atau password salah.");
      } else {
        router.push("/admin");
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
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <img
            src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
            alt="Cavallery"
            className={styles.logoImg}
          />
        </div>

        <h1 className={styles.title}>Admin Cavallery</h1>
        <p className={styles.subtitle}>Masuk untuk mengelola keanggotaan & sistem website</p>

        <form onSubmit={handleLogin} className={styles.form}>
          {errorMsg && (
            <div className={styles.errorBox}>
              <i className="bx bx-error-circle" /> {errorMsg}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Username admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Memeriksa...
              </>
            ) : (
              <>
                <i className="bx bx-lock-alt" /> Masuk Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
