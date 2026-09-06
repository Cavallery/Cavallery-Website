"use client";
import { useState } from "react";
import styles from "./BiodataSection.module.css";
import { VIDEO_URLS } from "@/lib/videoAssets";

export default function BiodataSection() {
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URLS.homepageTeaser);
  const [videoError, setVideoError] = useState(false);
  return (
    <section className={styles.section} id="meet-erine">
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Video Side */}
          <div className={styles.videoSide}>
            <div className={styles.videoFrame}>
              {!videoError ? (
                <video 
                  src={videoSrc} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  preload="metadata"
                  className={styles.video}
                  onError={() => setVideoError(true)}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "inherit",
                  }}
                >
                  <img
                    src="/images/cava-logo-round.png"
                    alt="Cavallery"
                    style={{ width: 80, height: 80, objectFit: "contain", opacity: 0.7 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card Side */}
          <div className={styles.cardSide}>
            <div className={styles.profileCard}>
              <div className={styles.header}>
                <h2 className={styles.title}>Erine's Biodata</h2>
                <div className={styles.divider} />
              </div>

              <ul className={styles.bioList}>
                <li className={styles.bioItem}>
                  <i className="bx bx-user" /> <span>Catherina Vallencia</span>
                </li>
                <li className={styles.bioItem}>
                  <i className="bx bx-message-rounded-dots" /> <span>Erine</span>
                </li>
                <li className={styles.bioItem}>
                  <i className="bx bx-cake" /> <span>21 Agustus 2007</span>
                </li>
                <li className={styles.bioItem}>
                  <i className="bx bx-map-pin" /> <span>Bekasi</span>
                </li>
                <li className={styles.bioItem}>
                  <i className="bx bx-droplet" /> <span>Golongan B</span>
                </li>
                <li className={styles.bioItem}>
                  <i className="bx bx-ruler" /> <span>163 cm</span>
                </li>
                <li className={styles.bioItem}>
                  <i className="bx bx-star" /> <span>Leo</span>
                </li>
                <li className={styles.bioItem}>
                  <i className="bx bx-id-card" /> <span>Jikoshoukai</span>
                </li>
              </ul>

              <p className={styles.quote}>
                "Hadir dengan seribu kejutan, <span className={styles.checkmate}>Checkmate!</span> Siap memenangkan hatimu."
              </p>

              <a href="/about/erine" className={styles.btnErine}>Tentang Erine</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
