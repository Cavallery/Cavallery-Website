"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  {
    label: "About",
    children: [
      { href: "/about/erine", label: "About Erine" },
      { href: "/about/cavallery", label: "About Cavallery" },
      { href: "/gallery", label: "Gallery Erine" },
    ],
  },
  { href: "/schedule", label: "Schedule" },
  { href: "/merchandise", label: "Merchandise" },
  {
    label: "Project",
    children: [
      { href: "/caterine17th", label: "#CatErine17th" },
      { href: "/erine-in-etherland", label: "Erine in Etherland" },
      { href: "/journal", label: "MemoRine (Journal)" },
    ],
  },
  {
    label: "Corner",
    children: [
      { href: "/games", label: "GameRine" },
      { href: "/news", label: "News & Updates" },
      { href: "/#tickets", label: "Ticketing" },
    ],
  },
];

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

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link 
          href="/" 
          className={styles.logo} 
          onClick={() => window.dispatchEvent(new Event("trigger-splash"))}
        >
          <img src="http://localhost:3001/images/cava-logo.jpg" alt="Cava Logo" className={styles.logoImg} />
          <div className={styles.logoInfo}>
            <span className={styles.logoText}>Cavallery.id</span>
            <span className={styles.logoSub}>Fanbase of Catherina Vallencia</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links}>
          {navLinks.map((link) =>
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
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={`${styles.dropdownLink} ${pathname === child.href ? styles.active : ""}`}
                        >
                          {child.label}
                        </Link>
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
          <ThemeToggle />
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
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label}>
                <div className={styles.mobileGroupLabel}>{link.label}</div>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`${styles.mobileLink} ${pathname === child.href ? styles.active : ""}`}
                  >
                    {child.label}
                  </Link>
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
        </div>
      )}
    </nav>
  );
}
