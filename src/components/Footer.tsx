"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      {/* Decorative wave divider */}
      <div className={styles.waveWrap} aria-hidden="true">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className={styles.waveSvg}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className={styles.container}>
        {/* ── TOP ROW ───────────────────────────────── */}
        <div className={styles.top}>
          {/* Brand col */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>cavallery</span>
              <span className={styles.logoDot}>.id</span>
            </Link>

            <p className={styles.tagline}>
              Fanbase resmi Catherina Vallencia Kurniawan. Hadir untuk mendukung, merayakan, dan berbagi setiap langkah perjalanan Erine bersama Cavallery.
            </p>

            <p className={styles.quote}>"Hadir dengan seribu kejutan, Checkmate!"</p>

            <div className={styles.socials}>
              <a
                href="https://x.com/CErine_JKT48"
                aria-label="X (Twitter)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bx-x" />
              </a>

              <a
                href="https://www.instagram.com/jkt48.erine/"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-instagram" />
              </a>

              <a
                href="https://www.tiktok.com/@jkt48.erine_"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-tiktok" />
              </a>

              <a
                href="https://whatsapp.com/channel/0029VbAQsPj35fLwVgznp12S"
                aria-label="WhatsApp Community"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bxl-whatsapp" />
              </a>

              <a
                href="http://linktr.ee/cavallery"
                aria-label="Linktree"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bx bx-link" />
              </a>
            </div>
          </div>

          {/* Links cols */}
          <div className={styles.grid}>
            <div className={styles.col}>
              <h4 className={styles.title}>About</h4>
              <ul className={styles.links}>
                <li>
                  <Link href="/about/erine">About Erine</Link>
                </li>
                <li>
                  <Link href="/about/cavallery">About Cavallery</Link>
                </li>
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.title}>Info</h4>
              <ul className={styles.links}>
                <li>
                  <Link href="/show-theater">Show Theater</Link>
                </li>
                <li>
                  <a
                    href="https://www.showroom-live.com/r/JKT48_Erine"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Status
                  </a>
                </li>
                <li>
                  <Link href="/news">News JKT48</Link>
                </li>
                <li>
                  <Link href="/news/cavallery-statement">News Cavallery</Link>
                </li>
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.title}>Project</h4>
              <ul className={styles.links}>
                <li>
                  <Link href="/request-hour-2026">Request Hour 2026</Link>
                </li>
                <li>
                  <Link href="/caterine17th">#CatErine17th</Link>
                </li>
                <li>
                  <Link href="/erine-in-etherland">Erine in Etherland</Link>
                </li>
                <li>
                  <Link href="/erine100show">Erine 100 Show</Link>
                </li>
                <li>
                  <Link href="/ssk">SSK JKT48 2024</Link>
                </li>
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.title}>#GameRine</h4>
              <ul className={styles.links}>
                <li>
                  <Link href="/games/jumping-adventure">
                    Game Bibir Yang Telah Dicuri
                  </Link>
                </li>
                <li>
                  <Link href="/games/zombie-escape">
                    Game Erine In Etherland
                  </Link>
                </li>
                <li>
                  <Link href="/games/grasshopper-collector">
                    Game Belalang Yang Membangkang
                  </Link>
                </li>
                <li>
                  <Link href="/games/love-erine-meter">Love Erine Meter</Link>
                </li>
                <li>
                  <Link href="/games/dress-up">Dressup Erine</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW ────────────────────────────── */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {currentYear} Cavallery. All Rights Reserved.
          </p>

          <p className={styles.madeBy}>
            Made with <span className={styles.heart}>♡</span> by Cavallery
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
