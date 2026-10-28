"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AdminPassionBackground from "@/components/admin/AdminPassionBackground";

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
        router.push("/internal/dashboard-admin-xv7r2q");
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
      {/* Background Passion Fire & Embers */}
      <AdminPassionBackground />

      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <img
            src="https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg"
            alt="Cavallery"
            className={styles.logoImg}
          />
        </div>

        <div className={styles.shieldBadge}>
          <i className="bx bxs-shield-alt-2" /> CAVALLERY PORTAL
        </div>

        <h1 className={styles.title}>Admin Cavallery</h1>
        <p className={styles.subtitle}>Gerbang Terproteksi &bull; Akses Terbatas</p>

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
              autoComplete="username"
              disabled={loading}
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
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <i className="bx bx-loader-alt bx-spin" /> Memeriksa Akses...
              </>
            ) : (
              <>
                <i className="bx bx-lock-alt" /> Masuk Dashboard
              </>
            )}
          </button>
        </form>

        <div className={styles.cardFooter}>
          <span>Team Passion &bull; Cavallery Administration</span>
        </div>
      </div>
    </div>
  );
}
