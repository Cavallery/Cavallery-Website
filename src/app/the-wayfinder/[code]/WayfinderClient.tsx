"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./page.module.css";
import type { WayfinderConfig } from "@/data/wayfinder-fanbases";

const DEFAULT_CONFIG: WayfinderConfig = {
  bgImage: "/images/wayfinder-bg.png",
  eventDate: "2026-08-22T15:00:00+07:00",
  badgeText: "Seitansai Project 2026",
  eyebrow: "Catherina Vallencia",
  heroName: "Erine",
  heroTitle: "The Wayfinder",
  invitedLabel: "Mengundang",
  dateTitle: "Sabtu, 22 Agustus 2026",
  dateSub: "Pukul 15.00 — 20.30 WIB",
  locationTitle: "CGV FX Sudirman — Lantai F7",
  locationSub: "Jl. Jend. Sudirman, Pintu Satu Senayan, Jakarta Selatan",
  mapUrl: "https://maps.google.com/?q=CGV+FX+Sudirman",
  dressCodeTitle: "Dress Code: Birthday T-shirt Erine",
  dressCodeSub: "atau pakaian sopan & rapih",
  footerText: "Cavallery ©2026",
};

/* ============================================================
   Countdown Component
   ============================================================ */
function Countdown({ targetDate }: { targetDate: string }) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(targetDate || DEFAULT_CONFIG.eventDate).getTime();
    const tick = () => setDiff(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (diff === null) return null;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className={styles.countdown}>
      {[
        [d, "Hari"],
        [h, "Jam"],
        [m, "Menit"],
        [s, "Detik"],
      ].map(([val, label]) => (
        <div className={styles.cdCell} key={String(label)}>
          <div className={styles.cdNum}>{String(val).padStart(2, "0")}</div>
          <div className={styles.cdLabel}>{String(label)}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Download Card (Canvas Render)
   ============================================================ */
function DownloadCard({ fanbase, cfg }: { fanbase: string; cfg: WayfinderConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const W = 900;
  const H = 1200;

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Background Image
      const scale = Math.max(W / img.width, H / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const sx = (W - sw) / 2;
      const sy = (H - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);

      // Dark Overlay Gradient for high readability
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(10,15,12,0.60)");
      grad.addColorStop(0.28, "rgba(10,15,12,0.80)");
      grad.addColorStop(0.55, "rgba(10,15,12,0.94)");
      grad.addColorStop(0.85, "rgba(10,15,12,0.98)");
      grad.addColorStop(1, "rgba(10,15,12,1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Card Border
      ctx.strokeStyle = "rgba(240,190,83,0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, W - 20, H - 20);

      // Badge: SEITANSAI PROJECT
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.strokeStyle = "rgba(240,190,83,0.35)";
      ctx.lineWidth = 1.5;
      const badgeW = 300;
      const badgeH = 34;
      const badgeX = (W - badgeW) / 2;
      const badgeY = 60;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f0be53";
      ctx.font = "700 13px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((cfg.badgeText || "SEITANSAI PROJECT 2026").toUpperCase(), W / 2, badgeY + 22);

      // Eyebrow
      ctx.fillStyle = "#d6cebf";
      ctx.font = "600 15px Montserrat, sans-serif";
      ctx.fillText((cfg.eyebrow || "CATHERINA VALLENCIA").toUpperCase(), W / 2, 145);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 700 92px Playfair Display, Georgia, serif";
      ctx.fillText(cfg.heroName || "Erine", W / 2, 235);

      // Subtitle
      ctx.fillStyle = "#ffd778";
      ctx.font = "700 18px Montserrat, sans-serif";
      const spacedTitle = (cfg.heroTitle || "THE WAYFINDER").split("").join(" ").toUpperCase();
      ctx.fillText(spacedTitle, W / 2, 280);

      // Gold Divider Line
      ctx.strokeStyle = "#f0be53";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 40, 320);
      ctx.lineTo(W / 2 + 40, 320);
      ctx.stroke();

      // Mengundang Box
      const ibx = 120;
      const iby = 355;
      const ibw = W - 240;
      const ibh = 125;
      ctx.fillStyle = "rgba(240,190,83,0.09)";
      ctx.strokeStyle = "rgba(240,190,83,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(ibx, iby, ibw, ibh, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#d6cebf";
      ctx.font = "600 13px Montserrat, sans-serif";
      const spacedInvited = (cfg.invitedLabel || "MENGUNDANG").split("").join(" ").toUpperCase();
      ctx.fillText(spacedInvited, W / 2, iby + 35);

      ctx.fillStyle = "#ffd778";
      const fnSize = fanbase.length > 18 ? 38 : fanbase.length > 12 ? 46 : 54;
      ctx.font = `italic 700 ${fnSize}px Playfair Display, Georgia, serif`;
      ctx.fillText(fanbase, W / 2, iby + 92);

      // Event Details Box
      const bx = 80;
      const by = 525;
      const bw = W - 160;
      const bh = 480;

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 14);
      ctx.fill();
      ctx.stroke();

      // Details Header
      ctx.fillStyle = "#f0be53";
      ctx.font = "700 14px Montserrat, sans-serif";
      ctx.fillText("DETAIL ACARA", W / 2, by + 45);

      // Divider in Box
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 40, by + 65);
      ctx.lineTo(bx + bw - 40, by + 65);
      ctx.stroke();

      // Row 1: Tanggal & Waktu
      ctx.textAlign = "left";
      const contentX = bx + 60;

      ctx.fillStyle = "#ffd778";
      ctx.font = "700 24px Montserrat, sans-serif";
      ctx.fillText(cfg.dateTitle || "Sabtu, 22 Agustus 2026", contentX, by + 120);

      ctx.fillStyle = "#d6cebf";
      ctx.font = "500 17px Montserrat, sans-serif";
      ctx.fillText(cfg.dateSub || "Pukul 15.00 — 20.30 WIB", contentX, by + 155);

      // Separator
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.moveTo(bx + 40, by + 195);
      ctx.lineTo(bx + bw - 40, by + 195);
      ctx.stroke();

      // Row 2: Lokasi
      ctx.fillStyle = "#ffd778";
      ctx.font = "700 24px Montserrat, sans-serif";
      ctx.fillText(cfg.locationTitle || "CGV FX Sudirman — Lantai F7", contentX, by + 245);

      ctx.fillStyle = "#d6cebf";
      ctx.font = "500 17px Montserrat, sans-serif";
      const locSub = cfg.locationSub || "Jl. Jend. Sudirman, Pintu Satu Senayan, Jakarta Selatan";
      if (locSub.length > 38) {
        const parts = locSub.split(",");
        if (parts.length > 1) {
          ctx.fillText(parts.slice(0, parts.length - 1).join(","), contentX, by + 280);
          ctx.fillText(parts[parts.length - 1].trim(), contentX, by + 308);
        } else {
          ctx.fillText(locSub, contentX, by + 280);
        }
      } else {
        ctx.fillText(locSub, contentX, by + 280);
      }

      // Separator
      ctx.beginPath();
      ctx.moveTo(bx + 40, by + 345);
      ctx.lineTo(bx + bw - 40, by + 345);
      ctx.stroke();

      // Row 3: Dress Code
      ctx.fillStyle = "#ffd778";
      ctx.font = "700 20px Montserrat, sans-serif";
      ctx.fillText(cfg.dressCodeTitle || "Dress Code: Birthday T-shirt Erine", contentX, by + 395);

      ctx.fillStyle = "#d6cebf";
      ctx.font = "500 16px Montserrat, sans-serif";
      ctx.fillText(cfg.dressCodeSub || "atau pakaian sopan & rapih", contentX, by + 428);

      // Footer brand
      ctx.textAlign = "center";
      ctx.fillStyle = "#a09882";
      ctx.font = "600 13px Montserrat, sans-serif";
      ctx.fillText(cfg.footerText || "CAVALLERY ©2026", W / 2, H - 55);

      setReady(true);
    };

    img.onerror = () => {
      ctx.fillStyle = "#0d1410";
      ctx.fillRect(0, 0, W, H);
      setReady(true);
    };

    img.src = cfg.bgImage || DEFAULT_CONFIG.bgImage;
  }, [fanbase, cfg]);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `Undangan-${(cfg.heroTitle || "Wayfinder").replace(/\s+/g, "_")}-${fanbase.replace(/[\s.]+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={styles.downloadSection}>
      <canvas ref={canvasRef} className={styles.downloadCanvas} />
      {ready && (
        <button className={styles.downloadBtn} onClick={handleDownload}>
          <i className="bx bx-download" style={{ fontSize: 18 }} />
          Unduh Card Undangan
        </button>
      )}
    </div>
  );
}

/* ============================================================
   Wayfinder Client View
   ============================================================ */
export default function WayfinderClient({
  fanbase,
  config,
}: {
  fanbase?: string;
  config?: WayfinderConfig;
}) {
  const cfg = config || DEFAULT_CONFIG;

  if (!fanbase) {
    return (
      <div className={styles.wayfinderPage}>
        <div className={styles.notFound}>
          <h2 className={styles.notFoundTitle}>Undangan Tidak Ditemukan</h2>
          <p className={styles.notFoundSub}>Link undangan tidak terdaftar atau belum sesuai.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wayfinderPage}>
      {/* ---- Single Focus Invitation Card ---- */}
      <div className={styles.card}>
        <div
          className={styles.cardBg}
          style={{ backgroundImage: `url(${cfg.bgImage || DEFAULT_CONFIG.bgImage})` }}
        />
        <div className={styles.cardOverlay} />

        <div className={styles.cardContent}>
          {/* Top Badge */}
          <div className={styles.badgeHeader}>
            <span>{cfg.badgeText || "Seitansai Project 2026"}</span>
          </div>

          {/* Hero Identity */}
          <div className={styles.hero}>
            <span className={styles.eyebrow}>{cfg.eyebrow || "Catherina Vallencia"}</span>
            <h1 className={styles.heroName}>{cfg.heroName || "Erine"}</h1>
            <p className={styles.heroTitle}>{cfg.heroTitle || "The Wayfinder"}</p>
          </div>

          <div className={styles.divider} />

          {/* Invited Fanbase Box */}
          <div className={styles.invitedBox}>
            <span className={styles.invitedLabel}>{cfg.invitedLabel || "Mengundang"}</span>
            <h2 className={styles.invitedName}>{fanbase}</h2>
          </div>

          {/* Event Details */}
          <div className={styles.detailsBox}>
            <div className={styles.detailsHeader}>Detail Acara</div>

            <div className={styles.detailRow}>
              <div className={styles.detailIcon}>
                <i className="bx bx-calendar" />
              </div>
              <div className={styles.detailInfo}>
                <div className={styles.detailTitle}>{cfg.dateTitle || "Sabtu, 22 Agustus 2026"}</div>
                <div className={styles.detailSub}>{cfg.dateSub || "Pukul 15.00 — 20.30 WIB"}</div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailIcon}>
                <i className="bx bx-map-pin" />
              </div>
              <div className={styles.detailInfo}>
                <div className={styles.detailTitle}>{cfg.locationTitle || "CGV FX Sudirman — Lantai F7"}</div>
                <div className={styles.detailSub}>{cfg.locationSub || "Jl. Jend. Sudirman, Pintu Satu Senayan, Jakarta Selatan"}</div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailIcon}>
                <i className="bx bx-closet" />
              </div>
              <div className={styles.detailInfo}>
                <div className={styles.detailTitle}>{cfg.dressCodeTitle || "Dress Code: Birthday T-shirt Erine"}</div>
                <div className={styles.detailSub}>{cfg.dressCodeSub || "atau pakaian sopan & rapih"}</div>
              </div>
            </div>

            <Countdown targetDate={cfg.eventDate || DEFAULT_CONFIG.eventDate} />
          </div>

          {/* Map Action Button */}
          {cfg.mapUrl && (
            <div className={styles.actionArea}>
              <a
                className={styles.mapBtn}
                href={cfg.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bx-navigation" /> Buka Lokasi di Google Maps
              </a>
            </div>
          )}

          {/* Footer in Card */}
          <div className={styles.cardFooter}>
            <span className={styles.footerBrand}>{cfg.footerText || "Cavallery ©2026"}</span>
          </div>
        </div>
      </div>

      {/* ---- Download Card Button ---- */}
      <DownloadCard fanbase={fanbase} cfg={cfg} />
    </div>
  );
}
