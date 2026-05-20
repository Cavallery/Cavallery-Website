import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Pernyataan Resmi Cavallery",
  description: "Pernyataan resmi Cavallery terkait keamanan dan ancaman terhadap Erine — 19 Mei 2026",
};

export default function CavalleryStatementPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-shield-quarter" /> Pernyataan Resmi</div>
          <h1 className={styles.heroTitle}>
            Pernyataan Resmi <span className="textGold">Cavallery</span>
          </h1>
          <p className={styles.heroDate}>
            <i className="bx bx-calendar" /> 19 Mei 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <article className={styles.content}>
        <div className={styles.statementCard}>
          <div className={styles.statementHeader}>
            <i className="bx bxs-shield-alt-2" style={{ fontSize: "1.4rem", color: "var(--gold)" }} />
            <h2 className={styles.statementTitle}>Pernyataan Resmi Cavallery</h2>
          </div>

          <div className={styles.statementBody}>
            <p>
              Cavallery menyadari bahwa dalam beberapa hari terakhir telah beredar sejumlah unggahan bernada ancaman dan pembahasan yang mengarah pada ancaman secara langsung terhadap Erine.
            </p>
            <p>
              Perlu kami sampaikan bahwa persoalan ini sebenarnya telah kami tindak lanjuti sejak 7 Mei. Bukti terkait ancaman tersebut juga telah kami sampaikan kepada pihak manajemen sebagai bentuk kewaspadaan dan pencegahan.
            </p>
            <p>
              Sejak awal, kami memilih untuk menyikapi persoalan ini melalui jalur yang lebih kondusif dan tidak langsung membawanya ke ruang publik, mengingat isu yang dibahas sudah menyangkut keamanan dan kenyamanan member. Namun, melihat situasi yang kini semakin meluas dan menjadi perhatian banyak pihak, kami merasa penting untuk menyampaikan posisi kami secara terbuka.
            </p>
            <p>
              Bagi kami, pembahasan yang sudah menyentuh ancaman fisik, lingkungan kampus, aktivitas pribadi, hingga keluarga bukan lagi sesuatu yang dapat dianggap sebagai candaan ataupun dinamika fandom biasa. Situasi seperti ini seharusnya tidak perlu menunggu perhatian publik terlebih dahulu untuk dapat ditanggapi secara serius.
            </p>
            <p>
              Kami percaya bahwa setiap member berhak memiliki ruang yang aman dan terlindungi dari segala bentuk intimidasi maupun tindakan yang mengarah pada kehidupan pribadi mereka di luar aktivitas sebagai idola. Karena itu, kami berharap isu keamanan member dapat benar-benar diprioritaskan, bukan hanya ketika situasi telah meluas, tetapi juga sebagai bentuk perlindungan yang konsisten bagi member di balik panggung.
            </p>
            <p>
              Kami berharap keamanan member tidak hanya menjadi respons terhadap situasi terkini, tetapi juga menjadi komitmen yang dijaga secara nyata dan berkelanjutan. Pada akhirnya, kami hanya ingin memastikan bahwa idola yang kami dukung dapat tetap merasa aman, dihargai, dan memiliki ruang yang sehat untuk menjalani aktivitas serta mengejar mimpinya.
            </p>
            <p className={styles.signature}>
              Cavallery
            </p>
          </div>
        </div>

        {/* Evidence */}
        <div className={styles.evidenceSection}>
          <h3 className={styles.evidenceTitle}>
            <i className="bx bx-image-alt" /> Bukti Dokumentasi
          </h3>
          <div className={styles.evidenceGrid}>
            <div className={styles.evidenceFrame}>
              <Image src="/images/bukti-1.jpg" alt="Bukti dokumentasi 1" width={800} height={600} style={{ width: "100%", height: "auto" }} />
            </div>
            <div className={styles.evidenceFrame}>
              <Image src="/images/bukti-2.jpg" alt="Bukti dokumentasi 2" width={800} height={600} style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
        </div>

        {/* Back */}
        <div className={styles.backWrap}>
          <Link href="/news" className={styles.backLink}>
            <i className="bx bx-arrow-back" /> Kembali ke Berita
          </Link>
        </div>
      </article>
    </div>
  );
}
