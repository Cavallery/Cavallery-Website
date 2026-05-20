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
              <a href="#" aria-label="Twitter"><i className="bx bxl-twitter" /></a>
              <a href="#" aria-label="Instagram"><i className="bx bxl-instagram" /></a>
              <a href="#" aria-label="TikTok"><i className="bx bxl-tiktok" /></a>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.col}>
              <h4 className={styles.title}>About</h4>
              <ul className={styles.links}>
                <li><Link href="/about/erine">About Erine</Link></li>
                <li><Link href="/about/cavallery">About Cavallery</Link></li>
                <li><Link href="/erine-in-etherland">Erine in Etherland</Link></li>
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
              <h4 className={styles.title}>Games</h4>
              <ul className={styles.links}>
                <li><Link href="/games">Mini Games</Link></li>
                <li><Link href="/games">GameRine</Link></li>
                <li><Link href="/games">Love Meter</Link></li>
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
