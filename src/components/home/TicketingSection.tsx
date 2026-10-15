"use client";
import { useRef, useState } from "react";
import styles from "./TicketingSection.module.css";
import SectionHead from "@/components/chess/SectionHead";
import KnightSvg from "@/components/chess/KnightSvg";
import { useReveal } from "@/hooks/useReveal";

export default function TicketingSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [identityType, setIdentityType] = useState<"named" | "anonymous">("named");
  const rootRef = useRef<HTMLElement | null>(null);
  useReveal(rootRef);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const scriptURL = "https://script.google.com/macros/s/AKfycby3B6MCdryHfKxNf8TKFq_Rtu7_PX9QIPy8ecfnG4Il8sgOoIh-Vqno9KWncgf9QXWg7g/exec";

    try {
      await fetch(scriptURL, { method: "POST", body: formData });
      setStatus("success");
    } catch (error) {
      console.error("Error!", error);
      setStatus("error");
    }
  };

  let move = 0;
  const nextMove = () => `${++move}.`;

  return (
    <section ref={rootRef} className={styles.section} id="tickets" data-motion>
      <div className={styles.layout}>
        <div className={styles.aside}>
          <SectionHead
            square="g3"
            eyebrow="Form Aspirasi"
            title="Ticketing"
            accent="Fanbase"
            subtitle="Sampaikan kritik, saran, atau aspirasi program fanbase Anda langsung ke admin Cavallery."
          />
          <ul className={styles.notes} data-reveal="stagger">
            <li>
              <span>01</span>Pilih pakai nama atau kirim secara anonim.
            </li>
            <li>
              <span>02</span>Tulis ide program, kritik, atau saran dengan jelas.
            </li>
            <li>
              <span>03</span>Admin Cavallery akan meninjau setiap tiket yang masuk.
            </li>
          </ul>
        </div>

        <div className={styles.sheet} data-reveal="up">
          <div className={styles.sheetHead} aria-hidden="true">
            <span>Score Sheet</span>
            <span>Cavallery · Tiket</span>
          </div>

          {status === "success" ? (
            <div className={styles.statusMessage} role="status">
              <KnightSvg size={44} className={styles.statusKnight} />
              <p className={styles.statusTitle}>Tiket diterima!</p>
              <p>Terima kasih! Tiket Anda telah tercatat. Kami akan segera meninjau aspirasi Anda.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.identityToggle} role="radiogroup" aria-label="Identitas pengirim">
                <label
                  className={`${styles.toggleLabel} ${identityType === "named" ? styles.active : ""}`}
                  onClick={() => setIdentityType("named")}
                >
                  <input type="radio" name="identity_type" value="named" defaultChecked hidden />
                  <span>Pakai Nama</span>
                </label>
                <label
                  className={`${styles.toggleLabel} ${identityType === "anonymous" ? styles.active : ""}`}
                  onClick={() => setIdentityType("anonymous")}
                >
                  <input type="radio" name="identity_type" value="anonymous" hidden />
                  <span>Anonim</span>
                </label>
              </div>

              <div className={styles.grid}>
                {identityType === "named" ? (
                  <>
                    <div className={styles.field}>
                      <span className={styles.moveNo}>{nextMove()}</span>
                      <label htmlFor="tk-nama">Nama Lengkap</label>
                      <input id="tk-nama" type="text" name="Nama" required placeholder="Contoh: Catherina Vallencia" />
                    </div>
                    <div className={styles.field}>
                      <span className={styles.moveNo}>{nextMove()}</span>
                      <label htmlFor="tk-no">Nomor Anggota</label>
                      <input id="tk-no" type="text" name="no_anggota" required placeholder="Contoh: 18" />
                    </div>
                  </>
                ) : (
                  <>
                    <input type="hidden" name="Nama" value="Anonymous" />
                    <input type="hidden" name="no_anggota" value="-" />
                  </>
                )}

                <div className={styles.field}>
                  <span className={styles.moveNo}>{nextMove()}</span>
                  <label htmlFor="tk-kategori">Kategori</label>
                  <select id="tk-kategori" name="kategori">
                    <option value="Saran Program">Saran Program (MabaRine, BukbeRine dll)</option>
                    <option value="Kritik Fanbase">Kritik Fanbase</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <span className={styles.moveNo}>{nextMove()}</span>
                  <label htmlFor="tk-pesan">Pesan / Ide</label>
                  <textarea id="tk-pesan" name="pesan" rows={4} required placeholder="Tuliskan ide atau pesanmu di sini..."></textarea>
                </div>
              </div>

              <div className={styles.btnWrapper}>
                <button type="submit" className={styles.submit} disabled={status === "loading"}>
                  <span className={styles.submitFill} aria-hidden="true" />
                  <span className={styles.submitLabel}>{status === "loading" ? "Mengirim..." : "Kirim Tiket"}</span>
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                    <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              </div>

              {status === "error" && <p className={styles.error}>Gagal mengirim. Periksa koneksi Anda.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
