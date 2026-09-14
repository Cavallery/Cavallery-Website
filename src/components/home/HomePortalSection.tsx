"use client";

import React from "react";
import Link from "next/link";
import styles from "./HomePortalSection.module.css";

interface PortalItem {
  title: string;
  category: string;
  desc: string;
  href: string;
  icon: string;
  badge?: string;
  color: string;
}

const PORTAL_ITEMS: PortalItem[] = [
  // 1. Dengerine
  {
    title: "Dengerine",
    category: "Corner · Musik",
    desc: "Arsip lagu cover & orisinal karya komunitas fans untuk Erine dengan pemutar Spotify.",
    href: "/dengerine",
    icon: "bx-headphone",
    badge: "Baru",
    color: "#1db954",
  },
  // 2. 2S with Erine
  {
    title: "2S with Erine",
    category: "Community · Mading",
    desc: "Papan mading polaroid foto 2-Shot & pesan hangat kenangan bersama Erine.",
    href: "/2s-with-erine",
    icon: "bx-camera",
    badge: "Mading",
    color: "#e11d48",
  },
  // 3. Fanart Erine
  {
    title: "Fanart Erine",
    category: "Corner · Seni",
    desc: "Sudut pameran ilustrasi, gambar digital, dan karya seni kreatif komunitas.",
    href: "/fanart",
    icon: "bx-palette",
    color: "#ec4899",
  },
  // 4. GameRine
  {
    title: "GameRine",
    category: "Corner · Games",
    desc: "Koleksi mini game seru bertema Erine yang pernah dimainkan langsung oleh Erine.",
    href: "/games",
    icon: "bx-joystick",
    color: "#f59e0b",
  },
  // 5. Journal MemoRine
  {
    title: "Journal MemoRine",
    category: "Community · Dukungan",
    desc: "Tulis surat cinta, doa tulus, dan pesan semangat langsung untuk Erine.",
    href: "/journal",
    icon: "bx-book-heart",
    color: "#8b5cf6",
  },
  // 6. Milestone Perjalanan
  {
    title: "Milestone Erine",
    category: "About · Perjalanan",
    desc: "Jejak langkah perjalanan karir Erine dari Trainee Generasi 12 hingga Team Passion.",
    href: "/about/erine",
    icon: "bx-map-pin",
    badge: "2023 - 2026",
    color: "#b45309",
  },
  // 7. Gallery Erine
  {
    title: "Gallery Foto",
    category: "About · Foto",
    desc: "Koleksi foto berkualitas tinggi momen panggung, event, dan foto memukau Erine.",
    href: "/gallery",
    icon: "bx-image-alt",
    color: "#0ea5e9",
  },
  // 8. Kas & Donasi Cavallery
  {
    title: "Kas & Keanggotaan",
    category: "Community · Kas",
    desc: "Portal transparansi kas fanbase, pendaftaran anggota, dan donasi project.",
    href: "/cavallery-kas",
    icon: "bx-wallet",
    color: "#10b981",
  },
];

export default function HomePortalSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bx-compass" /> Jelajahi Cavallery
          </div>
          <h2 className={`sectionTitle textGold ${styles.title}`}>
            Eksplorasi Seluruh <span className="textGold">Sudut Cavallery</span>
          </h2>
          <div className="divider" style={{ margin: "14px auto 16px" }} />
          <p className={styles.subtitle}>
            Akses langsung ke seluruh ruang kreasi, arsip musik, game, pameran seni, mading 2-Shot, dan program fanbase Erine.
          </p>
        </div>

        <div className={styles.grid}>
          {PORTAL_ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`glassCard ${styles.card}`}
              style={{ "--accent-color": item.color } as React.CSSProperties}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap} style={{ background: `${item.color}15`, color: item.color }}>
                  <i className={`bx ${item.icon}`} />
                </div>
                {item.badge && (
                  <span className={styles.badge} style={{ background: `${item.color}20`, color: item.color, borderColor: `${item.color}40` }}>
                    {item.badge}
                  </span>
                )}
              </div>

              <div className={styles.cardCategory}>{item.category}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>

              <div className={styles.cardFooter}>
                <span className={styles.linkText}>
                  Buka Halaman <i className="bx bx-right-arrow-alt" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
