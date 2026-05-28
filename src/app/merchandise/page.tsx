import React from "react";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Merchandise Cavallery",
  description:
    "Merchandise resmi kavaleri JKT48 Catherina Vallencia (Erine) edisi terbatas bertema HESITATE. Menampilkan Oversized T-Shirt, Lanyard, Keychain, Sticker, dan Ziplock Packaging premium.",
  keywords: ["Erine JKT48", "Cavallery Merchandise", "Hesitate Bundle Pack", "JKT48 merch"],
};

export default function MerchandisePage() {
  const includeItems = [
    {
      title: "Oversized T-Shirt",
      desc: "Premium heavyweight cotton featuring exclusive chess knight & gate custom front & back graphics.",
    },
    {
      title: "Exclusive Lanyard",
      desc: "High-density satin lanyard with classic double-sided Hesitate & Cavallery prints.",
    },
    {
      title: "Acrylic Keychain",
      desc: "Sturdy custom clear acrylic keychain with dual-sided premium logo engraving.",
    },
    {
      title: "Special Sticker Pack",
      desc: "Die-cut waterproof vinyl sticker series tailored to the Hesitate campaign theme.",
    },
    {
      title: "Ziplock Packaging",
      desc: "Reusable clear premium frosted zipper packaging carrying official fanbase shield embossing.",
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className="badge">
          <i className="bx bxs-store" /> Official Store
        </div>
        <h1 className={styles.heroTitle}>Official Fanbase Shop</h1>
        <p className={styles.heroSub}>
          Koleksi merchandise kavaleri terkurasi dari Cavallery. Dibuat dengan dedikasi penuh 
          sebagai bentuk dukungan tak terbatas bagi Catherina Vallencia (Erine) JKT48.
        </p>
      </header>

      <section className={styles.showcase}>
        {/* Left Section: Image Showcase */}
        <div className={styles.imageCard}>
          <div className={styles.badgeSoldOut}>
            <i className="bx bxs-lock-alt" /> Sold Out
          </div>
          <img
            src="/images/hesitate-bundle.jpg"
            alt="Hesitate Bundle Pack 2025"
            className={styles.bundleImg}
          />
        </div>

        {/* Right Section: Info Details */}
        <div className={styles.infoCard}>
          <div className={styles.tagline}>
            <i className="bx bxs-chess" /> Limited Release Campaign
          </div>
          <h2 className={styles.title}>HESITATE BUNDLE PACK 2025</h2>
          
          <div className={styles.priceSection}>
            <span className={styles.price}>Rp 218.000</span>
            <span className={styles.originalPrice}>Rp 249.000</span>
          </div>

          <p className={styles.desc}>
            Didesain khusus untuk merayakan ulang tahun erine ke-18 <i>#ErineInEtherland</i>, Bundle Pack "HESITATE" 
            merupakan merchandise eksklusif edisi terbatas dari Jenderal Cavallery. 
            Setiap item membawa pesan keteguhan hati (<b>No Hesitation</b>) untuk selalu 
            menjadi garda terdepan pelindung Erine.
          </p>

          <div className={styles.includesSection}>
            <h3>Apa Saja Yang Didapat?</h3>
            <div className={styles.includesList}>
              {includeItems.map((item, index) => (
                <div key={index} className={styles.includeItem}>
                  <span className={styles.includeTitle}>
                    <i className="bx bx-check-circle" style={{ color: "var(--gold)", marginRight: "8px" }} />
                    {item.title}
                  </span>
                  <span className={styles.includeDesc}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.soldOutOverlay}>
            <i className="bx bxs-error-circle" />
            <div>
              <strong>Pre-Order Ditutup</strong>
              <br />
              Seluruh slot kuota bundle edisi rilis perdana ini telah terpenuhi dan tidak akan diproduksi ulang. Terima kasih atas loyalitas luar biasa teman-teman Cavallery!
            </div>
          </div>

          <button className={styles.actionBtn} disabled>
            <i className="bx bxs-shopping-bag-alt" /> Stok Habis
          </button>
        </div>
      </section>
    </div>
  );
}
