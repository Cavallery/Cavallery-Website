/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";
import KnightSvg from "./chess/KnightSvg";
import ThemeToggle from "./ThemeToggle";
import { SOCIAL_LINKS } from "./chess/SocialIcons";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useHeaderScroll } from "@/hooks/useHeaderScroll";

interface NavChild {
  href: string;
  label: string;
  desc?: string;
}

interface NavNestedGroup {
  label: string;
  children: NavChild[];
}

interface NavSingle {
  href: string;
  label: string;
}

interface NavParent {
  label: string;
  blurb: string;
  children: (NavChild | NavNestedGroup)[];
}

type NavLink = NavSingle | NavParent;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  {
    label: "News",
    blurb: "Kabar terkini JKT48 & pernyataan resmi fanbase Cavallery.",
    children: [
      { href: "/news", label: "News JKT48", desc: "Berita terkini dari JKT48 & Erine" },
      { href: "/news/cavallery-statement", label: "News Cavallery", desc: "Pernyataan & info resmi fanbase Cavallery" },
    ],
  },
  {
    label: "About",
    blurb: "Kenali Erine lebih dekat dan cerita di balik Cavallery.",
    children: [
      { href: "/about/erine", label: "About Erine", desc: "Profil & perjalanan Catherina Vallencia" },
      { href: "/about/cavallery", label: "About Cavallery", desc: "Sejarah & identitas fanbase Cavallery" },
      { href: "/gallery", label: "Gallery Erine", desc: "Koleksi foto & momen spesial Erine" },
    ],
  },
  { href: "/schedule", label: "Schedule" },
  {
    label: "Community",
    blurb: "Ruang bersama para Cavallery — kas, esport, mading & jurnal.",
    children: [
      { href: "/cavallery-kas", label: "Kas Cavallery", desc: "Portal kas, donasi & keanggotaan" },
      { href: "/join", label: "Join Cavallery", desc: "Daftarkan dirimu sebagai member resmi" },
      { href: "/esport", label: "Cavallery Esport", desc: "Divisi gaming kompetitif Cavallery" },
      { href: "/2s-with-erine", label: "2S with Erine", desc: "Koleksi foto 2-Shot & pesan manis untuk Erine" },
      { href: "/#tickets", label: "Ticketing", desc: "Kotak kritik, saran & aspirasi fanbase" },
      { href: "/journal", label: "Journal MemoRine", desc: "Tulis pesan & dukungan untuk Erine" },
    ],
  },
  { href: "/merchandise", label: "Merchandise" },
  {
    label: "Project",
    blurb: "Proyek fanbase dari tahun ke tahun — setiap langkah, satu kejutan.",
    children: [
      {
        label: "2026",
        children: [
          { href: "/2026/sts-19-erine", label: "#ErineTheWayfinder", desc: "Seitansai Project 2026" },
          { href: "/request-hour-2026", label: "Request Hour 2026", desc: "Vote lagu favorit Erine" },
          { href: "/erine100show", label: "Erine 100 Show", desc: "Perayaan 100 show theater Erine" },
        ],
      },
      {
        label: "2025",
        children: [
          { href: "/erine-in-etherland", label: "Erine in Etherland", desc: "Proyek eksklusif 2025" },
          { href: "/kaleidoskop", label: "Kaleidoskop Cavallery", desc: "Perjalanan setahun Cavallery" },
        ],
      },
      {
        label: "2024",
        children: [
          { href: "/ssk", label: "SSK JKT48 2024", desc: "Campaign SSK bersama Cavallery" },
          { href: "/caterine17th", label: "#CatErine17th", desc: "Proyek ulang tahun Erine ke-17" },
        ],
      },
    ],
  },
  {
    label: "Corner",
    blurb: "Sudut bermain & berkarya untuk Erine.",
    children: [
      { href: "/games", label: "GameRine", desc: "Mini games seru bertema Erine" },
      { href: "/fanart", label: "Fanart Erine", desc: "Sudut pameran ilustrasi & karya kreatif komunitas" },
      { href: "/dengerine", label: "Dengerine", desc: "Arsip lagu cover & orisinal karya komunitas untuk Erine" },
    ],
  },
];

/** Mega-menu thumbnails — existing assets in /public/images only. */
const THUMBS: Record<string, string> = {
  "/news": "/images/about/timeline-2024-3.jpeg",
  "/news/cavallery-statement": "/images/about/filosofi-emblem.jpg",
  "/about/erine": "/images/erine2.jpg",
  "/about/cavallery": "/images/about/cava-group-1.jpeg",
  "/gallery": "/images/gallery/erine-gallery-1.jpg",
  "/cavallery-kas": "/images/about/cava-group-4.jpeg",
  "/join": "/images/about/cava-group-2.jpeg",
  "/esport": "/images/about/cava-group-6.jpeg",
  "/2s-with-erine": "/images/about/timeline-2024-5.jpeg",
  "/#tickets": "/images/about/cava-group-8.jpeg",
  "/journal": "/images/about/timeline-other-3.jpeg",
  "/2026/sts-19-erine": "/images/about/timeline-other-7.jpeg",
  "/request-hour-2026": "/images/rkj.jpg",
  "/erine100show": "/images/passion.jpg",
  "/erine-in-etherland": "/images/about/timeline-other-6.jpeg",
  "/kaleidoskop": "/images/about/timeline-other-8.jpeg",
  "/ssk": "/images/chapter.jpg",
  "/caterine17th": "/images/caterine17th-poster.jpg",
  "/games": "/images/about/timeline-other-4.jpeg",
  "/fanart": "/images/cerine%202.jpg",
  "/dengerine": "/images/hesitate-bundle.jpg",
};

const isParent = (l: NavLink): l is NavParent => "children" in l;
const isGroup = (c: NavChild | NavNestedGroup): c is NavNestedGroup => "children" in c;

function matches(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isParentActive(link: NavLink, pathname: string): boolean {
  if (!isParent(link)) return matches(link.href, pathname);
  return link.children.some((c) =>
    isGroup(c) ? c.children.some((s) => matches(s.href, pathname)) : matches(c.href, pathname)
  );
}

function flatChildren(link: NavParent): NavChild[] {
  return link.children.flatMap((c) => (isGroup(c) ? c.children : [c]));
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/internal/dashboard-admin-xv7r2q");

  const headerRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const knightRef = useRef<HTMLSpanElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knightIndex = useRef(-1);

  const [mega, setMega] = useState<string | null>(null);
  const [lastMega, setLastMega] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const activeIndex = navLinks.findIndex((l) => isParentActive(l, pathname));

  useEffect(() => {
    lockRef.current = Boolean(mega) || menuOpen;
    if (lockRef.current && headerRef.current) headerRef.current.dataset.hidden = "false";
  }, [mega, menuOpen]);

  useHeaderScroll(headerRef, { lockRef, dependencies: [pathname] });

  // Close every menu on navigation (adjust state during render, no effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setMega(null);
    setOpenGroup(null);
  }

  // Lock page scroll behind the mobile overlay
  useEffect(() => {
    const el = document.documentElement;
    if (menuOpen) el.style.overflow = "hidden";
    else el.style.overflow = "";
    return () => {
      el.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── ♞ hover indicator: L-shaped jump (up → across → down) ──────────
  const { contextSafe } = useGSAP({ scope: navRef });

  const jumpTo = useCallback(
    (index: number, instant = false) => {
      const knight = knightRef.current;
      const nav = navRef.current;
      if (!knight || !nav) return;
      if (index < 0) {
        gsap.to(knight, { autoAlpha: 0, duration: 0.2 });
        knightIndex.current = -1;
        return;
      }
      const item = nav.querySelector<HTMLElement>(`[data-nav-index="${index}"]`);
      if (!item) return;
      const navRect = nav.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      const x = r.left + r.width / 2 - navRect.left - knight.offsetWidth / 2;
      const wasHidden = knightIndex.current < 0;
      knightIndex.current = index;
      gsap.killTweensOf(knight);
      if (instant || wasHidden || prefersReducedMotion()) {
        gsap.set(knight, { x, y: 0 });
        gsap.to(knight, { autoAlpha: 1, duration: 0.2 });
        return;
      }
      gsap
        .timeline()
        .to(knight, { autoAlpha: 1, y: -12, duration: 0.12, ease: "power2.out" })
        .to(knight, { x, duration: 0.26, ease: "power3.inOut" })
        .to(knight, { y: 0, duration: 0.16, ease: "power2.in" });
    },
    []
  );

  // Wrap in contextSafe at call time (event handlers), never during render.
  const safeJump = (index: number) => (contextSafe ? contextSafe(jumpTo)(index) : jumpTo(index));

  useEffect(() => {
    if (isAdmin) return;
    const id = requestAnimationFrame(() => jumpTo(activeIndex, true));
    const onResize = () => jumpTo(knightIndex.current >= 0 ? knightIndex.current : activeIndex, true);
    window.addEventListener("resize", onResize);
    // Re-measure once fonts are ready (label widths change)
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => jumpTo(activeIndex, true)).catch(() => {});
    }
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
    };
  }, [activeIndex, isAdmin, jumpTo]);

  // ── Mega-menu hover intent ─────────────────────────────────────────
  const openMega = (label: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(label);
    if (label) setLastMega(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 180);
  };

  // ── Mobile overlay stagger ─────────────────────────────────────────
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay || !menuOpen) return;
      const rows = overlay.querySelectorAll("[data-ov-row]");
      const foot = overlay.querySelectorAll("[data-ov-foot]");
      if (prefersReducedMotion()) return;
      gsap.fromTo(rows, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.045, delay: 0.12 });
      gsap.fromTo(foot, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.45 });
    },
    { scope: overlayRef, dependencies: [menuOpen], revertOnUpdate: true }
  );

  if (isAdmin) return null;

  const megaLink = navLinks.find((l) => isParent(l) && l.label === (mega || lastMega)) as NavParent | undefined;

  const triggerSplash = () => window.dispatchEvent(new Event("trigger-splash"));

  return (
    <>
      <header
        ref={headerRef}
        className={styles.header}
        data-motion
        data-compact="false"
        data-hidden="false"
        data-mega={mega ? "true" : "false"}
        data-menu={menuOpen ? "true" : "false"}
        onMouseLeave={scheduleClose}
      >
        {/* 8-square rank bar = page scroll progress (fills with embers) */}
        <div className={styles.rank} aria-hidden="true">
          {FILES.map((f, i) => (
            <span key={f} className={styles.sq} data-dark={i % 2 === 0 ? "true" : "false"}>
              <span className={styles.sqFill} data-rank-fill />
            </span>
          ))}
        </div>

        <div className={styles.bar}>
          <Link href="/" className={styles.brand} onClick={triggerSplash} aria-label="Cavallery — Beranda">
            <img src="/images/cava-logo-round.png" alt="" width={40} height={40} className={styles.logo} />
            <span className={styles.brandRule} aria-hidden="true" />
            <span className={styles.brandText}>
              <span className={styles.brandName}>Cavallery</span>
              <span className={styles.brandSub}>Fanbase Catherina Vallencia</span>
            </span>
          </Link>

          <nav className={styles.nav} ref={navRef} aria-label="Navigasi utama">
            <ul className={styles.list} onMouseLeave={() => safeJump(activeIndex)}>
              {navLinks.map((link, i) => {
                const active = i === activeIndex;
                return (
                  <li key={link.label} className={styles.item} data-nav-index={i}>
                    {isParent(link) ? (
                      <button
                        type="button"
                        className={`${styles.link} ${active ? styles.active : ""}`}
                        aria-expanded={mega === link.label}
                        aria-controls="cv-mega"
                        onMouseEnter={() => {
                          safeJump(i);
                          openMega(link.label);
                        }}
                        onFocus={() => safeJump(i)}
                        onClick={() => openMega(mega === link.label ? null : link.label)}
                      >
                        <span>{link.label}</span>
                        <svg className={styles.chev} viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
                          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`${styles.link} ${active ? styles.active : ""}`}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => {
                          safeJump(i);
                          openMega(null);
                        }}
                        onFocus={() => safeJump(i)}
                        onClick={link.href === "/" ? triggerSplash : undefined}
                      >
                        <span>{link.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <span ref={knightRef} className={styles.knight} aria-hidden="true">
              <KnightSvg size={16} />
            </span>
          </nav>

          <div className={styles.tools}>
            <ThemeToggle />

            {/* Custom mobile toggle: a 2×2 board that turns into a cross */}
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={menuOpen}
              aria-controls="cv-mobile-menu"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={styles.toggleLabel}>{menuOpen ? "Tutup" : "Menu"}</span>
              <span className={styles.toggleBoard} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>

        {/* Mega menu panel */}
        <div
          id="cv-mega"
          className={styles.mega}
          data-open={mega ? "true" : "false"}
          onMouseEnter={() => openMega(mega || lastMega)}
          onMouseLeave={scheduleClose}
          aria-hidden={mega ? undefined : true}
        >
          {megaLink && (
            <div className={styles.megaInner} key={megaLink.label}>
              <div className={styles.megaIntro}>
                <span className="cv-eyebrow">
                  <span className="cv-eyebrow__dash" />
                  <span>{flatChildren(megaLink).length} tautan</span>
                </span>
                <p className={`cv-display ${styles.megaTitle}`}>{megaLink.label}</p>
                <p className={styles.megaBlurb}>{megaLink.blurb}</p>
              </div>

              {megaLink.children.some(isGroup) ? (
                <div className={styles.megaRanks}>
                  {megaLink.children.filter(isGroup).map((group) => (
                    <div key={group.label} className={styles.megaRank}>
                      <span className={styles.megaRankLabel}>{group.label}</span>
                      <ul className={styles.megaRankList}>
                        {group.children.map((child, ci) => (
                          <li key={child.href} style={{ "--i": ci } as React.CSSProperties}>
                            <Link href={child.href} className={styles.megaRow} tabIndex={mega ? 0 : -1}>
                              <span className={styles.megaRowThumb}>
                                {THUMBS[child.href] && <img src={THUMBS[child.href]} alt="" loading="lazy" decoding="async" />}
                              </span>
                              <span className={styles.megaRowText}>
                                <span className={styles.megaTileLabel}>{child.label}</span>
                                <span className={styles.megaTileDesc}>{child.desc}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className={styles.megaGrid} data-count={flatChildren(megaLink).length}>
                  {flatChildren(megaLink).map((child, ci) => (
                    <li key={child.href} style={{ "--i": ci } as React.CSSProperties}>
                      <Link href={child.href} className={styles.megaTile} tabIndex={mega ? 0 : -1}>
                        <span className={styles.megaThumb}>
                          {THUMBS[child.href] && <img src={THUMBS[child.href]} alt="" loading="lazy" decoding="async" />}
                        </span>
                        <span className={styles.megaTileLabel}>{child.label}</span>
                        <span className={styles.megaTileDesc}>{child.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div
        id="cv-mobile-menu"
        ref={overlayRef}
        className={`${styles.overlay} cv-board`}
        data-open={menuOpen ? "true" : "false"}
        aria-hidden={menuOpen ? undefined : true}
        data-motion
      >
        <nav className={styles.ovNav} aria-label="Menu seluler">
          <ul className={styles.ovList}>
            {navLinks.map((link, i) => {
              const active = i === activeIndex;
              const expanded = openGroup === link.label;
              return (
                <li key={link.label} className={styles.ovItem}>
                  <div className={styles.ovMask}>
                    {isParent(link) ? (
                      <button
                        type="button"
                        className={`${styles.ovLink} ${active ? styles.ovActive : ""}`}
                        data-ov-row
                        aria-expanded={expanded}
                        tabIndex={menuOpen ? 0 : -1}
                        onClick={() => setOpenGroup(expanded ? null : link.label)}
                      >
                        <span className={styles.ovLabel}>{link.label}</span>
                        <span className={styles.ovPlus} data-open={expanded ? "true" : "false"} aria-hidden="true" />
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`${styles.ovLink} ${active ? styles.ovActive : ""}`}
                        data-ov-row
                        tabIndex={menuOpen ? 0 : -1}
                        onClick={link.href === "/" ? triggerSplash : undefined}
                      >
                        <span className={styles.ovLabel}>{link.label}</span>
                      </Link>
                    )}
                  </div>
                  {isParent(link) && (
                    <div className={styles.ovSub} data-open={expanded ? "true" : "false"}>
                      <div className={styles.ovSubInner}>
                        {link.children.map((c) =>
                          isGroup(c) ? (
                            <div key={c.label} className={styles.ovSubGroup}>
                              <span className={styles.ovSubRank}>{c.label}</span>
                              {c.children.map((s) => (
                                <Link key={s.href} href={s.href} className={styles.ovSubLink} tabIndex={expanded ? 0 : -1}>
                                  {s.label}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <Link key={c.href} href={c.href} className={styles.ovSubLink} tabIndex={expanded ? 0 : -1}>
                              {c.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.ovFoot} data-ov-foot>
          <div className={styles.ovSocials}>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} tabIndex={menuOpen ? 0 : -1}>
                {s.icon}
              </a>
            ))}
          </div>
          <p className={styles.ovQuote}>
            Hadir dengan seribu kejutan, <span className="cv-fire-text">Checkmate!</span>
          </p>
        </div>
      </div>
    </>
  );
}
