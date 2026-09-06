"use client";
import { useState } from "react";
import styles from "./BiodataSection.module.css";
import { VIDEO_URLS } from "@/lib/videoAssets";

export default function BiodataSection() {
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URLS.homepageTeaser);

  return (
    <section className={styles.section} id="meet-erine">
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Video Side */}
          <div className={styles.videoSide}>
            <div className={styles.videoFrame}>
              <video 
                src={videoSrc} 
                autoPlay 
                muted 
                loop 
                playsInline 
                preload="metadata"
                className={styles.video}
                onError={() => {
                  if (videoSrc !== "/assets/homepage-vt.mp4") {
                    setVideoSrc("/assets/homepage-vt.mp4");
                  }
                }}
              />
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
