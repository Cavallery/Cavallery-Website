// ============================================================
// Cavallery redesign — automated preview capture (Playwright).
//
//   npm run dev                       # in one terminal
//   node scripts/capture-preview.mjs  # in another
//
// Env:
//   BASE_URL   default http://localhost:3000
//   OUT_DIR    default ./screenshots   (git-ignored, never part of the build)
//   ONLY       comma list to limit: desktop,mobile,videos
//   CHROMIUM   optional executablePath (e.g. /opt/pw-browsers/chromium)
//   HTTPS_PROXY  honoured for external fonts/media when set
// ============================================================
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.resolve(process.env.OUT_DIR || "screenshots");
const ONLY = (process.env.ONLY || "desktop,mobile,videos").split(",");
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};

const shots = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  return chromium.launch({
    executablePath: process.env.CHROMIUM || undefined,
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined,
  });
}

// Optional: serve the icon CDNs from a local mirror (for sandboxes where
// unpkg/cdnjs are blocked). Same package versions as layout.tsx.
//   CDN_MIRROR=/path  containing boxicons/package and fa/package (npm pack)
const MIRRORS = process.env.CDN_MIRROR
  ? [
      ["https://unpkg.com/boxicons@2.1.4/", path.join(process.env.CDN_MIRROR, "boxicons/package/")],
      ["https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/", path.join(process.env.CDN_MIRROR, "fa/package/")],
    ]
  : [];
const MIME = { ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".svg": "image/svg+xml", ".eot": "application/vnd.ms-fontobject" };

async function newContext(browser, kind, extra = {}) {
  const ctx = await browser.newContext({ ...VIEWPORTS[kind], deviceScaleFactor: 1, ...extra });
  for (const [prefix, dir] of MIRRORS) {
    await ctx.route(`${prefix}**`, (route) => {
      const rel = route.request().url().slice(prefix.length).split("?")[0].split("#")[0];
      const file = path.join(dir, rel);
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: "" });
      route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: MIME[path.extname(file)] || "application/octet-stream" });
    });
  }
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("splashShown", "1"); // capture the hero, not the intro video
      localStorage.setItem("cavallery_pwa_dismissed", String(Date.now()));
      localStorage.setItem("cavallery_loc_answered", String(Date.now()));
    } catch {}
  });
  return ctx;
}

/** Hide floating widgets that are not part of the redesign (chatbot, dev badge). */
async function tidy(page) {
  await page.addStyleTag({
    content: `[class*="chatContainer"], nextjs-portal { display: none !important; }`,
  });
}

async function open(page, url) {
  await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 120000 }).catch(() => {});
  await tidy(page);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await wait(2600);
}

async function scrollToY(page, y, settle = 1500) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), Math.max(0, Math.round(y)));
  await wait(settle);
}

/** Scroll so an element's top sits `offset` px below the viewport top. */
async function scrollToEl(page, selector, offset = 0, settle = 1500) {
  const y = await page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return el.getBoundingClientRect().top + window.scrollY - off;
    },
    [selector, offset]
  );
  if (y === null) return false;
  await scrollToY(page, y, settle);
  return true;
}

/** Walk the whole page so every once-only reveal has fired (for full-page shots). */
async function warmScroll(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  for (let y = 0; y < h; y += Math.round(vh * 0.6)) {
    await scrollToY(page, y, 220);
  }
  await scrollToY(page, h, 1600);
}

async function snap(page, name, note, opts = {}) {
  const file = `${name}.png`;
  await page.screenshot({ path: path.join(OUT, file), ...opts });
  shots.push({ file, note });
  console.log("  ✓", file);
}

// ── HOME ────────────────────────────────────────────────────────────────
async function captureHome(browser, kind) {
  const p = kind;
  const ctx = await newContext(browser, kind);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message));
  await open(page, "/");

  await snap(page, `${p}-01-header-top`, "Header di posisi top (rank bar kosong, transparan)", {
    clip: { x: 0, y: 0, width: VIEWPORTS[kind].viewport.width, height: 150 },
  });
  await snap(page, `${p}-02-hero-initial`, "Hero state awal setelah intro (slide 01)");

  // Fire close-up: catch the burning chess-tile transition mid-flight.
  const frame = await page.evaluate(() => {
    const r = document.querySelector("[data-par-photo]")?.getBoundingClientRect();
    return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
  });
  const deadline = Date.now() + 12000;
  let caught = false;
  while (Date.now() < deadline) {
    const midway = await page.evaluate(() => {
      const tiles = Array.from(document.querySelectorAll("[data-tile]"));
      const vis = tiles.filter((t) => parseFloat(getComputedStyle(t).opacity) > 0.05).length;
      return vis > 4 && vis < tiles.length - 2;
    });
    if (midway) {
      caught = true;
      if (frame) {
        const pad = 40;
        await snap(page, `${p}-03-hero-fire-tiles-closeup`, "Close-up transisi slider: kotak papan catur ‘terbakar’ dari tepi lalu padam", {
          clip: {
            x: Math.max(0, frame.x - pad),
            y: Math.max(0, frame.y - pad),
            width: Math.min(VIEWPORTS[kind].viewport.width - Math.max(0, frame.x - pad), frame.w + pad * 2),
            height: frame.h + pad * 2,
          },
        });
      }
      break;
    }
    await wait(60);
  }
  if (!caught) console.log("  ! tile transition not caught");

  // Wait for slide 02 to settle.
  await page.waitForFunction(() => document.querySelector("[data-counter]")?.textContent?.startsWith("02"), null, { timeout: 15000 }).catch(() => {});
  await wait(1500);
  await snap(page, `${p}-04-hero-slide-2`, "Hero slide ke-2 setelah transisi tile");

  // Header while scrolled (compact) — scroll down, then a little up so it reappears.
  await scrollToY(page, 1600, 600);
  await snap(page, `${p}-05-header-hidden-scrolling-down`, "Header sembunyi saat scroll ke bawah; rank bar terisi bara", {
    clip: { x: 0, y: 0, width: VIEWPORTS[kind].viewport.width, height: 150 },
  });
  await page.mouse.wheel(0, -300);
  await wait(900);
  await snap(page, `${p}-06-header-scrolled`, "Header compact muncul lagi saat scroll ke atas (progress 8 kotak)");

  // Menus
  await scrollToY(page, 0, 900);
  if (kind === "desktop") {
    for (const label of ["Community", "Project", "About"]) {
      await page.locator(`header nav button:has-text("${label}")`).first().hover();
      await wait(900);
      await snap(page, `${p}-07-mega-${label.toLowerCase()}`, `Mega-menu ${label} terbuka (♞ lompat L ke item)`);
    }
    await page.mouse.move(700, 600);
    await wait(500);
  } else {
    await page.locator('button[aria-controls="cv-mobile-menu"]').click();
    await wait(1300);
    await snap(page, `${p}-07-menu-overlay`, "Menu overlay fullscreen (tipografi display, stagger)");
    await page.locator('#cv-mobile-menu button:has-text("Community")').click();
    await wait(600);
    await snap(page, `${p}-08-menu-overlay-expanded`, "Overlay dengan grup Community terbuka");
    await page.locator('button[aria-controls="cv-mobile-menu"]').click();
    await wait(700);
  }

  // Sections, one by one
  const sections = [
    ["#info-berita", "info-terkini", "f6 · Informasi Terkini — split asimetris, header sticky"],
    ["#eksplorasi", "eksplorasi", "d5 · Eksplorasi 8 sudut — panel papan catur"],
    ["#erine-moments", "erine-moments", "c3 · Erine Moments — media full-bleed"],
    ["#kalender", "kalender", "e2 · Kalender sebagai papan catur"],
    ["#tickets", "ticketing", "g3 · Ticketing — form score sheet"],
    ["#news-updates", "news", "h5 · News & Updates — editorial"],
    ["#featured-videos", "featured-videos", "g7 · Featured Videos — film strip"],
  ];
  let n = 10;
  for (const [sel, slug, note] of sections) {
    const ok = await scrollToEl(page, sel, kind === "desktop" ? 0 : 60, 1700);
    if (!ok) {
      console.log("  ! missing section", slug);
      continue;
    }
    await snap(page, `${p}-${n++}-${slug}`, note);
    if (slug === "eksplorasi") {
      // pinned horizontal progress (desktop) / swiped (mobile)
      if (kind === "desktop") {
        const dist = await page.evaluate(() => {
          const t = document.querySelector("[data-track]");
          return t ? t.scrollWidth - window.innerWidth : 0;
        });
        await page.evaluate((d) => window.scrollBy({ top: d * 0.55, behavior: "instant" }), dist);
        await wait(1500);
        await snap(page, `${p}-${n++}-eksplorasi-scrolled`, "Eksplorasi: horizontal scroll ter-pin ~55% (panel Team Passion)");
      } else {
        await page.evaluate(() => {
          const t = document.querySelector("[data-track]");
          if (t) t.scrollTo({ left: t.scrollWidth * 0.55, behavior: "instant" });
        });
        await wait(900);
        await snap(page, `${p}-${n++}-eksplorasi-swiped`, "Eksplorasi: swipe native + snap (mobile)");
      }
    }
  }

  // Footer
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await scrollToY(page, h, 2600);
  await snap(page, `${p}-30-footer`, "Footer endgame (viewport di akhir halaman) — ♞ tiba di h8, Checkmate! menyala");
  const footerFile = `${p}-30b-footer-full.png`;
  // the fixed header would otherwise be stamped mid-element while stitching
  await page.evaluate(() => document.querySelector("header")?.style.setProperty("visibility", "hidden"));
  await page.locator("footer").screenshot({ path: path.join(OUT, footerFile) });
  await page.evaluate(() => document.querySelector("header")?.style.removeProperty("visibility"));
  shots.push({ file: footerFile, note: "Footer penuh (seluruh elemen) dengan animasi sudah terungkap" });
  console.log("  ✓", footerFile);
  const mate = await page.evaluate(() => {
    const r = document.querySelector("[data-giant]")?.getBoundingClientRect();
    return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
  });
  if (mate) {
    await snap(page, `${p}-31-footer-fire-closeup`, "Close-up: ‘Checkmate!’ menyala seperti bara + ember", {
      clip: { x: 0, y: Math.max(0, mate.y - 30), width: VIEWPORTS[kind].viewport.width, height: Math.min(mate.h + 60, VIEWPORTS[kind].viewport.height) },
    });
  }
  if (kind === "mobile") {
    await page.locator('footer button:has-text("Project")').click().catch(() => {});
    await wait(500);
    const y = await page.evaluate(() => {
      const el = document.querySelector("footer nav");
      return el ? el.getBoundingClientRect().top + window.scrollY - 120 : 0;
    });
    await scrollToY(page, y, 900);
    await snap(page, `${p}-32-footer-accordion`, "Footer mobile: kolom link accordion (Project terbuka)");
  } else {
    // hover preview following the cursor
    const link = page.locator('footer a:has-text("Erine 100 Show")');
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + box.height / 2);
      await page.mouse.move(box.x + 40, box.y + box.height / 2, { steps: 6 });
      await wait(700);
      await snap(page, `${p}-32-footer-hover-preview`, "Footer desktop: preview gambar mengikuti cursor saat hover link");
    }
  }

  // Full page
  await scrollToY(page, 0, 500);
  await warmScroll(page);
  await scrollToY(page, 0, 1500);
  await snap(page, `${p}-40-home-fullpage`, "Full-page Home", { fullPage: true });

  await ctx.close();
}

// ── FIXTURE PREVIEW (layout only) ───────────────────────────────────────
// When the CMS/MySQL or external APIs are unreachable (local sandbox), News &
// Featured Videos only show their empty state. FIXTURES=1 intercepts those two
// API calls *in the browser* with clearly-labelled sample rows so the populated
// layout can be reviewed. The site code itself is untouched.
async function captureFixtures(browser, kind) {
  const p = kind;
  const ctx = await newContext(browser, kind);
  const sample = (i) => `[Contoh layout ${i}] Data fixture — bukan konten asli`;
  const imgs = ["/images/about/cava-group-3.jpeg", "/images/about/timeline-2024-4.jpeg", "/images/chapter.jpg", "/images/about/cava-group-12.jpeg"];
  await ctx.route("**/api/news?**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: {
          news: imgs.map((img, i) => ({
            id: `fx-${i}`,
            slug: `fx-${i}`,
            title: sample(i + 1),
            label: i === 0 ? "Statement" : "Pengumuman",
            description: "Teks contoh untuk melihat bagaimana deskripsi berita tampil pada layout editorial.",
            published_at: new Date(2026, 9, 12 - i * 3).toISOString(),
            link_url: "/news/cavallery-statement",
            image_url: img,
            is_internal: true,
            is_pinned: i === 0,
            is_active: true,
          })),
        },
      }),
    })
  );
  await ctx.route("**/api/youtube", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        status: true,
        data: {
          videos: [0, 1, 2, 3, 4].map((i) => ({
            id: `fx-${i}`,
            video_id: `fixture${i}`,
            title: sample(i + 1),
            url: "#",
            category: ["Vlog", "Show", "Behind", "Live", "Special"][i],
            sort_order: String(i),
            is_active: true,
          })),
        },
      }),
    })
  );
  // YouTube thumbnails → local stills (layout preview only).
  const stills = ["erine1.jpg", "about/timeline-2024-6.jpeg", "about/timeline-other-5.jpeg", "about/cava-group-5.jpeg", "about/timeline-2024-8.jpeg"];
  await ctx.route("https://img.youtube.com/vi/**", (route) => {
    const i = Number(route.request().url().match(/fixture(\d)/)?.[1] || 0);
    route.fulfill({ body: fs.readFileSync(path.resolve("public/images", stills[i] || stills[0])), contentType: "image/jpeg" });
  });
  const page = await ctx.newPage();
  await open(page, "/");
  await scrollToEl(page, "#news-updates", kind === "desktop" ? 0 : 60, 1800);
  await snap(page, `${p}-16b-news-fixture`, "News & Updates dengan DATA FIXTURE (contoh) — preview layout lead + daftar");
  await scrollToEl(page, "#featured-videos", kind === "desktop" ? 0 : 60, 1800);
  await snap(page, `${p}-17b-featured-videos-fixture`, "Featured Videos dengan DATA FIXTURE (contoh) — preview film strip");
  await ctx.close();
}

// ── ABOUT / ERINE ───────────────────────────────────────────────────────
async function captureAbout(browser, kind) {
  const p = kind;
  const ctx = await newContext(browser, kind);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message));
  await open(page, "/about/erine");

  const sections = [
    ["[class*='profileContainer']", "about-profil", "a1 · Profil, jikoshoukai & sosial"],
    ["[class*='ewIntro']", "about-intro-hashtags", "b3 · Introduction, bio & hashtags"],
    ["[class*='ewFf']", "about-trivia", "c5 · Trivia game (logic tetap)"],
    ["[class*='videoDebut']", "about-video-debut", "d7 · Video debut"],
    ["[class*='kabeshaBoardWrapper']", "about-kabesha", "e5 · Kabesha Journey — garis tergambar, Team Passion klimaks"],
    ["[class*='electionSection']", "about-sousenkyo", "f3 · Sousenkyo"],
    ["[class*='journalWrapper']", "about-setlist-stats", "g5 · Setlist & statistik"],
    ["[class*='pmStatsSection']", "about-pm", "h3 · Statistik PM mingguan"],
    ["[class*='embedsSection']", "about-latest-updates", "f4 · Latest Updates"],
  ];
  let n = 50;
  for (const [sel, slug, note] of sections) {
    const ok = await scrollToEl(page, sel, kind === "desktop" ? 90 : 80, 1700);
    if (!ok) {
      console.log("  ! missing", slug);
      continue;
    }
    await snap(page, `${p}-${n++}-${slug}`, note);
    if (slug === "about-kabesha") {
      const card = await page.evaluate(() => {
        const el = document.querySelector("[data-kabesha-step][data-passion='true'] [class*='kabeshaPinnedCard']");
        if (!el) return null;
        el.scrollIntoView({ block: "center", behavior: "instant" });
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      });
      await wait(1600);
      if (card) {
        await snap(page, `${p}-${n++}-about-kabesha-passion-closeup`, "Close-up: tahap Team Passion (glow api terkuat + ember)", {
          clip: { x: Math.max(0, card.x - 20), y: Math.max(0, card.y - 20), width: Math.min(card.w + 40, VIEWPORTS[kind].viewport.width), height: Math.min(card.h + 40, VIEWPORTS[kind].viewport.height) },
        });
      }
    }
  }

  // Milestone — Knight's Path progress points
  const geo = await page.evaluate(() => {
    const board = document.querySelector("[data-kp-svg]")?.parentElement;
    if (!board) return null;
    const r = board.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const vh = window.innerHeight;
    const nodes = Array.from(document.querySelectorAll("[data-kp-node]"));
    const fire = nodes.find((n) => Number(n.getAttribute("data-year")) >= 2025);
    const fireY = fire ? fire.getBoundingClientRect().top + window.scrollY : null;
    return { top, height: board.scrollHeight, vh, fireY };
  });
  if (geo) {
    const start = geo.top - geo.vh * 0.7;
    await scrollToEl(page, "#milestone", 70, 1500);
    await snap(page, `${p}-60-milestone-head`, "c7 · Milestone header + rail tahun");
    for (const [pct, label] of [[0.002, "00"], [0.35, "35"], [0.7, "70"], [1, "100"]]) {
      await scrollToY(page, start + geo.height * pct, 2200);
      await snap(page, `${p}-${61 + ["00", "35", "70", "100"].indexOf(label)}-milestone-${label}`, `Knight's Path progress ${label}%`);
    }
    if (geo.fireY) {
      await scrollToY(page, geo.fireY - geo.vh * 0.7 - 260, 2200);
      await snap(page, `${p}-65-milestone-before-passion`, "Jalur sebelum era Team Passion (aksen dingin 2023–2024)");
      await scrollToY(page, geo.fireY - geo.vh * 0.7 + 420, 2400);
      await snap(page, `${p}-66-milestone-after-passion`, "Jalur setelah masuk era Team Passion (jalur menyala 2025–2026)");
      const passion = await page.evaluate(() => {
        const el = document.querySelector("[data-kp-item][data-passion='true'][data-state='visited'] [data-kp-card]");
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return r.top > 0 && r.bottom < window.innerHeight ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
      });
      if (passion) {
        await snap(page, `${p}-67-milestone-passion-closeup`, "Close-up: milestone Passion dengan highlight api", {
          clip: { x: Math.max(0, passion.x - 100), y: Math.max(0, passion.y - 30), width: Math.min(passion.w + 200, VIEWPORTS[kind].viewport.width - Math.max(0, passion.x - 100)), height: passion.h + 60 },
        });
      }
    }
  }

  await scrollToY(page, 0, 500);
  await warmScroll(page);
  await scrollToY(page, 0, 1500);
  await snap(page, `${p}-70-about-fullpage`, "Full-page /about/erine", { fullPage: true });
  await ctx.close();
}

// ── VIDEOS ──────────────────────────────────────────────────────────────
async function captureVideos(browser) {
  for (const [kind, url, name, script] of [
    ["desktop", "/", "desktop-hero-motion", async (page) => {
      await wait(9000);
      for (let i = 0; i < 12; i++) {
        await page.mouse.wheel(0, 110);
        await wait(140);
      }
      await wait(1200);
    }],
    ["desktop", "/about/erine", "desktop-milestone-scroll", async (page) => {
      await page.evaluate(() => {
        const el = document.querySelector("#milestone");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "instant" });
      });
      await wait(1200);
      for (let i = 0; i < 120; i++) {
        await page.mouse.wheel(0, 70);
        await wait(70);
      }
      await wait(800);
      for (let i = 0; i < 30; i++) {
        await page.mouse.wheel(0, -90);
        await wait(60);
      }
      await wait(1200);
    }],
    ["mobile", "/about/erine", "mobile-milestone-scroll", async (page) => {
      await page.evaluate(() => {
        const el = document.querySelector("#milestone");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: "instant" });
      });
      await wait(1000);
      for (let i = 0; i < 110; i++) {
        await page.evaluate(() => window.scrollBy(0, 60));
        await wait(70);
      }
      await wait(1000);
    }],
  ]) {
    const dir = path.join(OUT, "_video_tmp");
    const ctx = await newContext(browser, kind, { recordVideo: { dir, size: VIEWPORTS[kind].viewport } });
    const page = await ctx.newPage();
    await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 120000 }).catch(() => {});
    await tidy(page);
    await wait(800);
    await script(page);
    const video = page.video();
    await ctx.close();
    if (video) {
      const src = await video.path();
      fs.renameSync(src, path.join(OUT, `${name}.webm`));
      shots.push({ file: `${name}.webm`, note: "Rekaman motion" });
      console.log("  ✓", `${name}.webm`);
    }
  }
  fs.rmSync(path.join(OUT, "_video_tmp"), { recursive: true, force: true });
}

const browser = await launch();
try {
  for (const kind of ["desktop", "mobile"]) {
    if (!ONLY.includes(kind)) continue;
    console.log(`\n▶ ${kind}: home`);
    await captureHome(browser, kind);
    if (process.env.FIXTURES) {
      console.log(`▶ ${kind}: fixture layout previews`);
      await captureFixtures(browser, kind);
    }
    console.log(`▶ ${kind}: /about/erine`);
    await captureAbout(browser, kind);
  }
  if (ONLY.includes("videos")) {
    console.log("\n▶ videos");
    try {
      await captureVideos(browser);
    } catch (e) {
      console.log("  ! video capture skipped:", e.message.split("\n")[0]);
    }
  }
} finally {
  await browser.close();
  writeIndex();
}

/** INDEX.md is merged, so partial runs (ONLY=…) keep earlier entries. */
function writeIndex() {
  const file = path.join(OUT, "INDEX.md");
  const entries = new Map();
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^- `([^`]+)` — (.*)$/);
      if (m && fs.existsSync(path.join(OUT, m[1]))) entries.set(m[1], m[2]);
    }
  }
  for (const s of shots) entries.set(s.file, s.note);
  const lines = [...entries.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([f, n]) => `- \`${f}\` — ${n}`);
  fs.writeFileSync(file, ["# Cavallery redesign — preview", "", ...lines, ""].join("\n"));
  console.log(`\nDone → ${OUT} (${shots.length} new, ${entries.size} indexed)`);
}
