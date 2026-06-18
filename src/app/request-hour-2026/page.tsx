import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import SectionDivider from "@/components/SectionDivider";

export const metadata = {
  title: "Request Hour 2026 | Cavallery",
  description: "Peringkat lagu-lagu Erine di JKT48 Request Hour 2026."
};

export default function RequestHour2026Page() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Request Hour 2026</h1>
          <p className={styles.subtitle}>Peringkat Erine JKT48</p>
        </div>
      </section>

      <SectionDivider />

      {/* Project Content */}
      <section className={styles.projectSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Peringkat Lagu Erine</h2>
            <div className={styles.divider}></div>
          </div>
          
          <p className={styles.description}>
            Terima kasih atas semua dukungan kalian! Berikut adalah peringkat lagu-lagu yang dibawakan oleh Erine pada JKT48 Request Hour 2026.
          </p>

          <div className={styles.galleryGrid}>
            {/* Rank 33 */}
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.rankBadge}>33</div>
                {/* 
                  Ganti src di bawah ini dengan gambar asli nantinya. 
                  Pastikan menaruh gambar di folder public/images/
                */}
                <img 
                  src="https://pbs.twimg.com/media/HKxWODGa4AALMI2?format=jpg&name=large" 
                  alt="Kinjirareta Futari" 
                  className={styles.image} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h3>Kinjirareta Futari</h3>
              <div className={styles.votes}>Rank 33</div>
            </div>
            
            {/* Rank 12 */}
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.rankBadge}>12</div>
                {/* 
                  Ganti src di bawah ini dengan gambar asli nantinya. 
                  Pastikan menaruh gambar di folder public/images/
                */}
                <img 
                  src="https://pbs.twimg.com/media/HKxWFmfaMAA3ud1?format=jpg&name=large" 
                  alt="Bibir Yang Telah Dicuri" 
                  className={styles.image} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h3>Bibir yang telah dicuri</h3>
              <div className={styles.votes}>Rank 12</div>
            </div>

            {/* Rank 6 */}
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.rankBadge}>6</div>
                {/* 
                  Ganti src di bawah ini dengan gambar asli nantinya. 
                  Pastikan menaruh gambar di folder public/images/
                */}
                <img 
                  src="https://pbs.twimg.com/media/HKxWFmbawAEJ13P?format=jpg&name=large" 
                  alt="Blue Rose" 
                  className={styles.image} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h3>Blue Rose</h3>
              <div className={styles.votes}>Rank 6</div>
            </div>
          </div>
          
          <div className={styles.backBtnWrapper}>
            <Link href="/" className={styles.backBtn}>
              <i className="bx bx-left-arrow-alt" /> Kembali ke Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
