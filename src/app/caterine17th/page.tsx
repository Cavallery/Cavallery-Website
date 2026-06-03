import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import SectionDivider from "@/components/SectionDivider";

export const metadata = {
  title: "#CatErine17th Project | Cavallery",
  description: "Perayaan STS Erine JKT48 yang ke-17. #CatErine17th Offline Project."
};

export default function CatErine17Page() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>#CatErine17th</h1>
          <p className={styles.subtitle}>Erine's 17th Birthday Project</p>
        </div>
      </section>

      <SectionDivider />

      {/* Intro Section */}
      <section className={styles.introSection}>
        <div className={styles.container}>
          <div className={styles.introBox}>
            <i className="bx bxs-quote-alt-left" />
            <p>
              Hashtag tersebut merupakan gabungan dari dua kata, yaitu <strong>"Cat"</strong> dan <strong>"Erine"</strong>. Kucing merupakan hewan favorit Erine, yang dikenal sebagai binatang lucu, menggemaskan, namun sesekali dapat menunjukkan sifat pemarah — karakteristik yang selaras dengan kepribadian <strong>@CErine_JKT48</strong>.
            </p>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Offline Project */}
      <section className={styles.projectSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>CatErine17th Offline Project</h2>
            <div className={styles.divider}></div>
          </div>
          
          <p className={styles.description}>
            Dalam rangka perayaan STS <strong>@CErine_JKT48</strong> di Theater hari ini, kami telah menyiapkan Display Project di depan Theater yang dapat kalian kunjungi. Selain itu, bagi kalian yang menyaksikan show "Aitakatta" pada pertunjukan hari ini, akan tersedia freebies khusus yang sudah diletakkan di bangku penonton.
          </p>

          <div className={styles.galleryGrid}>
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <Image 
                  src="/images/caterine17th-poster.jpg" 
                  alt="Princess CatErine Poster" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.image} 
                />
              </div>
              <h3>Princess CatErine Poster</h3>
            </div>
            
            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <Image 
                  src="/images/caterine17th-freebies.jpg" 
                  alt="Princess CatErine Freebies" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.image} 
                />
              </div>
              <h3>Princess CatErine Freebies</h3>
            </div>

            <div className={`glassCard ${styles.card}`}>
              <div className={styles.imageWrapper}>
                <Image 
                  src="/images/caterine17th-encore.png" 
                  alt="Princess CatErine Encore" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.image} 
                />
              </div>
              <h3>Princess CatErine Encore</h3>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Closing */}
      <section className={styles.closingSection}>
        <div className={styles.container}>
          <div className={styles.closingBox}>
            <h2>Selamat ulang tahun, Erine!</h2>
            <p>Semoga hari ini penuh tawa, doa baik, dan momen manis.</p>
            <div className={styles.cats}>
               <i className="bx bxs-cat" />
               <i className="bx bxs-cat" />
               <i className="bx bxs-cat" />
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
