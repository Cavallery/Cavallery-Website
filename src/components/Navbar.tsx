"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";

interface NavChild {
  href: string;
  label: string;
  icon?: string;
  desc?: string;
}

interface NavNestedGroup {
  label: string;
  children: NavChild[];
  isHeader?: boolean;
}

interface NavSingle {
  href: string;
  label: string;
}

type NavLink = NavSingle | { label: string; children: (NavChild | NavNestedGroup)[] };

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  {
    label: "News",
    children: [
      { href: "/news",                    label: "News JKT48",      icon: "bx-news",               desc: "Berita terkini dari JKT48 & Erine" },
      { href: "/news/cavallery-statement", label: "News Cavallery",  icon: "fa-solid fa-chess-knight", desc: "Pernyataan & info resmi fanbase Cavallery" },
    ],
  },
  {
    label: "About",
    children: [
      { href: "/about/erine",    label: "About Erine",     icon: "bx-user-pin",          desc: "Profil & perjalanan Catherina Vallencia" },
      { href: "/about/cavallery",label: "About Cavallery", icon: "fa-solid fa-chess-knight", desc: "Sejarah & identitas fanbase Cavallery" },
      { href: "/gallery",        label: "Gallery Erine",   icon: "bx-image-alt",         desc: "Koleksi foto & momen spesial Erine" },
    ],
  },
  { href: "/schedule", label: "Schedule" },
  {
    label: "Community",
    children: [
      { href: "/join",    label: "Join Cavallery",   icon: "bx-group",             desc: "Daftarkan dirimu sebagai member resmi" },
      { href: "/esport",  label: "Cavallery Esport", icon: "bx-trophy",            desc: "Divisi gaming kompetitif Cavallery" },
      { href: "/#tickets",label: "Ticketing",        icon: "bx-message-square-edit", desc: "Kotak kritik, saran & aspirasi fanbase" },
      { href: "/journal", label: "Journal MemoRine", icon: "bx-book-heart",        desc: "Tulis pesan & dukungan untuk Erine" },
    ],
  },
  { href: "/merchandise", label: "Merchandise" },
  {
    label: "Project",
    children: [
      {
        label: "2026",
        children: [
          { href: "/2026/sts-19-erine", label: "#ErineTheWayfinder", icon: "bx-compass",  desc: "Seitansai Project 2026" },
          { href: "/request-hour-2026", label: "Request Hour 2026",  icon: "bx-music",    desc: "Vote lagu favorit Erine" },
          { href: "/erine100show",      label: "Erine 100 Show",     icon: "bx-star",     desc: "Perayaan 100 show theater Erine" },
        ],
      },
      {
        label: "2025",
        children: [
          { href: "/erine-in-etherland", label: "Erine in Etherland",    icon: "bx-planet", desc: "Proyek eksklusif 2025" },
          { href: "/kaleidoskop",         label: "Kaleidoskop Cavallery", icon: "bx-film",   desc: "Perjalanan setahun Cavallery" },
        ],
      },
      {
        label: "2024",
        children: [
          { href: "/ssk",          label: "SSK JKT48 2024", icon: "bx-crown", desc: "Campaign SSK bersama Cavallery" },
          { href: "/caterine17th", label: "#CatErine17th",  icon: "bx-cake",  desc: "Proyek ulang tahun Erine ke-17" },
        ],
      },
    ],
  },
  {
    label: "Corner",
    children: [
      { href: "/games", label: "GameRine", icon: "bx-joystick", desc: "Mini games seru bertema Erine" },
    ],
  },
];

function renderNavIcon(icon?: string) {
  if (!icon) return null;
  if (icon.startsWith("fa-") || icon.includes("fa-")) {
    return <i className={icon} />;
  }
  if (icon.startsWith("bx-") || icon.startsWith("bxs-") || icon.startsWith("bxl-")) {
    return <i className={`bx ${icon}`} />;
  }
  return <i className={icon} />;
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const isDarkBgPage = ["/kaleidoskop"].includes(pathname);
  const isForceLightText = isDarkBgPage && !scrolled;

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""} ${isForceLightText ? styles.forceLightText : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link
          href="/"
          className={styles.logo}
          onClick={() => window.dispatchEvent(new Event("trigger-splash"))}
        >
          <img src="/images/cava-logo.jpg" alt="Cava Logo" className={styles.logoImg} />
          <div className={styles.logoInfo}>
            <span className={styles.logoText}>Cavallery.id</span>
            <span className={styles.logoSub}>Fanbase of Catherina Vallencia</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links}>
          {navLinks.map((link: any) =>
            link.children ? (
              <li
                key={link.label}
                className={styles.dropdownItem}
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className={styles.dropdownToggle}>
                  {link.label}
                  <i className="bx bx-chevron-down" />
                </button>
                {openDropdown === link.label && (
                  <ul className={styles.dropdown}>
                    {link.children.map((child: any) => (
                      <li key={child.label || child.href} className={child.children ? styles.nestedDropdownItem : ""}>
                        {child.children ? (
                          <>
                            <div className={styles.nestedToggle}>
                              {child.label} <i className="bx bx-chevron-right" />
                            </div>
                            <ul className={styles.nestedDropdown}>
                              {child.children.map((sub: any) => (
                                <li key={sub.href}>
                                  {sub.icon ? (
                                    <Link
                                      href={sub.href}
                                      className={`${styles.dropdownLinkRich} ${pathname === sub.href ? styles.active : ""}`}
                                    >
                                      <span className={styles.richIcon}>
                                        {renderNavIcon(sub.icon)}
                                      </span>
                                      <span className={styles.richText}>
                                        <span className={styles.richLabel}>{sub.label}</span>
                                        {sub.desc && <span className={styles.richDesc}>{sub.desc}</span>}
                                      </span>
                                    </Link>
                                  ) : (
                                    <Link
                                      href={sub.href}
                                      className={`${styles.dropdownLink} ${pathname === sub.href ? styles.active : ""}`}
                                    >
                                      {sub.label}
                                    </Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : child.isHeader ? (
                          <div className={styles.dropdownHeader}>{child.label}</div>
                        ) : child.icon ? (
                          <Link
                            href={child.href}
                            className={`${styles.dropdownLinkRich} ${pathname === child.href ? styles.active : ""}`}
                          >
                            <span className={styles.richIcon}>
                              {renderNavIcon(child.icon)}
                            </span>
                            <span className={styles.richText}>
                              <span className={styles.richLabel}>{child.label}</span>
                              {child.desc && <span className={styles.richDesc}>{child.desc}</span>}
                            </span>
                          </Link>
                        ) : (
                          <Link
                            href={child.href}
                            className={`${styles.dropdownLink} ${pathname === child.href ? styles.active : ""}`}
                          >
                            {child.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={link.href}>
                <Link
                  href={link.href!}
                  className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
                  onClick={link.href === "/" ? () => window.dispatchEvent(new Event("trigger-splash")) : undefined}
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
          <li>
            <ThemeToggle />
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className={styles.burger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <i className={`bx ${menuOpen ? "bx-x" : "bx-menu"}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link: any) =>
            link.children ? (
              <div key={link.label}>
                <div className={styles.mobileGroupLabel}>{link.label}</div>
                {link.children.map((child: any) => (
                  child.children ? (
                    <div key={child.label}>
                      <div className={styles.mobileSubHeader}>{child.label}</div>
                      {child.children.map((sub: any) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`${styles.mobileLink} ${styles.mobileNestedLink} ${pathname === sub.href ? styles.active : ""}`}
                        >
                          {sub.icon && <span style={{ marginRight: 8 }}>{renderNavIcon(sub.icon)}</span>}
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  ) : child.isHeader ? (
                    <div key={child.href || child.label} className={styles.mobileSubHeader}>{child.label}</div>
                  ) : (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`${styles.mobileLink} ${pathname === child.href ? styles.active : ""}`}
                    >
                      {child.icon && <span style={{ marginRight: 8 }}>{renderNavIcon(child.icon)}</span>}
                      {child.label}
                    </Link>
                  )
                ))}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ""}`}
                onClick={link.href === "/" ? () => window.dispatchEvent(new Event("trigger-splash")) : undefined}
              >
                {link.label}
              </Link>
            )
          )}
          <div style={{ padding: "16px", display: "flex", justifyContent: "center", borderTop: "1px dashed var(--border)" }}>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
