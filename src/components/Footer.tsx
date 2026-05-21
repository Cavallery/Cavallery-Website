import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>CAVALLERY</span>
              <span className={styles.logoDot}>.</span>
            </Link>
            <p className={styles.tagline}>
              Official Fanbase of Catherina Vallencia Kurniawan (Erine) JKT48.
            </p>
            <div className={styles.socials}>
              <a href="https://x.com/CErine_JKT48" aria-label="X (Twitter)"><i className="bx bx-x" /></a>
              <a href="https://www.instagram.com/jkt48.erine/" aria-label="Instagram"><i className="bx bxl-instagram" /></a>
              <a href="https://www.tiktok.com/@jkt48.erine_" aria-label="TikTok"><i className="bx bxl-tiktok" /></a>
              <a href="https://whatsapp.com/channel/0029VbAQsPj35fLwVgznp12S" aria-label="WhatsApp Community"><i className="bx bxl-whatsapp" /></a>
              <a href="http://linktr.ee/cavallery" aria-label="Linktree"><i className="bx bx-link" /></a>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.col}>
              <h4 className={styles.title}>About</h4>
              <ul className={styles.links}>
                <li><Link href="/about/erine">About Erine</Link></li>
                <li><Link href="/about/cavallery">About Cavallery</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h4 className={styles.title}>Info</h4>
              <ul className={styles.links}>
                <li><Link href="/show-theater">Show Theater</Link></li>
                <li><Link href="/live">Live Status</Link></li>
                <li><Link href="/news">News & Updates</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h4 className={styles.title}>Project</h4>
              <ul className={styles.links}>
                <li><Link href="/caterine17th">#CatErine17th</Link></li>
                <li><Link href="/erine-in-etherland">Erine in Etherland</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h4 className={styles.title}>Corner</h4>
              <ul className={styles.links}>
                <li><Link href="/games/jumping-adventure">Game Bibir Yang Telah Dicuri</Link></li>
                <li><Link href="/games/zombie-escape">Game Erine In Etherland</Link></li>
                <li><Link href="/games/grasshopper-collector">Game Belalang Yang Membangkang</Link></li>
                <li><Link href="/games/love-erine-meter">Love Erine Meter</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {currentYear} Cavallery. All Rights Reserved. 
          </p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
