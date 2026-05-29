import React from "react";
import styles from "./page.module.css";
import SectionDivider from "@/components/SectionDivider";

export const metadata = {
  title: "SSK JKT48 2024 | Cavallery",
  description: "Hasil Pemilihan Member Single ke-26 JKT48."
};


export default function SSKPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>SSK JKT48 2024</h1>
        <p className={styles.subtitle}>Pemilihan Member Single ke-26 JKT48</p>
      </section>

      <SectionDivider />

      <section className={styles.container}>
        {/* Erine's SSK Journey Card */}
        <div className={styles.erineCard}>
          <div className={styles.erineCardHeader}>
            <h2>Perjalanan Erine di SSK 2024</h2>
          </div>
          <div className={styles.erineCardBody}>
            
            {/* Tahap 1 */}
            <div className={styles.stageBox}>
              <h3>Tahap 1</h3>
              <div className={styles.stageRank}>
                <span className={styles.rankNum}>#20</span>
              </div>
              <div className={styles.stageVotes}>5.592 Suara</div>
            </div>
            
            <div className={styles.stageArrow}>
              <i className="bx bx-chevron-right" />
            </div>

            {/* Tahap 2 */}
            <div className={styles.stageBox}>
              <h3>Tahap 2</h3>
              <div className={styles.stageRank}>
                <span className={styles.rankNum}>#18</span>
                <span className={styles.trendUp}><i className="bx bx-trending-up" /> Kenaikan 2</span>
              </div>
              <div className={styles.stageVotes}>16.830 Suara</div>
            </div>

            <div className={styles.stageArrow}>
              <i className="bx bx-chevron-right" />
            </div>

            {/* Tahap Akhir */}
            <div className={styles.stageBox}>
              <h3>Tahap Akhir</h3>
              <div className={styles.stageRank}>
                <span className={styles.rankNum}>#18</span>
                <span className={styles.trendSteady}><i className="bx bx-minus" /> Steady</span>
              </div>
              <div className={styles.stageVotes}>37.957 Suara</div>
            </div>
            
          </div>
        </div>

        <div className={styles.btnWrapper}>
          <a 
            href="https://docs.google.com/spreadsheets/d/12EG3BqfCYy7PEYwH4rCNZvyhPixi7A1br_sysjmdu5A/edit?gid=1124054790#gid=1124054790" 
            target="_blank" 
            rel="noreferrer" 
            className={styles.actionBtn}
          >
            <i className="bx bx-bar-chart-alt-2" /> Lihat Total Donasi & Vote
          </a>
        </div>

        <div className={styles.videoSection}>
          <div className={styles.videoCard}>
            <h3 className={styles.videoTitle}>Kampanye SSK Erine</h3>
            <div className={styles.videoWrapper}>
              <iframe 
                src="https://www.youtube.com/embed/XbAqE7iBJAw" 
                title="Kampanye SSK Erine" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
              />
            </div>
            <p className={styles.videoTags}>#Dongeng #Chapter</p>
          </div>

          <div className={styles.videoCard}>
            <h3 className={styles.videoTitle}>Pengumuman Hasil SSK JKT48 2024</h3>
            <div className={styles.videoWrapper}>
              <iframe 
                src="https://www.youtube.com/embed/zu90LdwO6Kg" 
                title="Pengumuman Hasil SSK JKT48" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
