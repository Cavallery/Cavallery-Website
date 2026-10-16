/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import styles from "./HomePortalSection.module.css";
import SectionHead from "@/components/chess/SectionHead";
import { gsap, useGSAP, MQ, refreshOnImages } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";

interface PortalItem {
  title: string;
  category: string;
  desc: string;
  href: string;
  icon: string;
  badge?: string;
  image: string;
  passion?: boolean;
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
    image: "/images/hesitate-bundle.jpg",
  },
  // 2. 2S with Erine
  {
    title: "2S with Erine",
    category: "Community · Mading",
    desc: "Papan mading polaroid foto 2-Shot & pesan hangat kenangan bersama Erine.",
    href: "/2s-with-erine",
    icon: "bx-camera",
    badge: "Mading",
    image: "/images/about/timeline-2024-5.jpeg",
  },
  // 3. Fanart Erine
  {
    title: "Fanart Erine",
    category: "Corner · Seni",
    desc: "Sudut pameran ilustrasi, gambar digital, dan karya seni kreatif komunitas.",
    href: "/fanart",
    icon: "bx-palette",
    image: "/images/cerine%202.jpg",
  },
  // 4. GameRine
  {
    title: "GameRine",
    category: "Corner · Games",
    desc: "Koleksi mini game seru bertema Erine yang pernah dimainkan langsung oleh Erine.",
    href: "/games",
    icon: "bx-joystick",
    image: "/images/about/timeline-other-4.jpeg",
  },
  // 5. Journal MemoRine
  {
    title: "Journal MemoRine",
    category: "Community · Dukungan",
    desc: "Tulis surat cinta, doa tulus, dan pesan semangat langsung untuk Erine.",
    href: "/journal",
    icon: "bx-book-heart",
    image: "/images/about/timeline-other-3.jpeg",
  },
  // 6. Milestone Perjalanan
  {
    title: "Milestone Erine",
    category: "About · Perjalanan",
    desc: "Jejak langkah perjalanan karir Erine dari Trainee Generasi 12 hingga Team Passion.",
    href: "/about/erine",
    icon: "bx-map-pin",
    badge: "2023 - 2026",
    image: "/images/about/timeline-passion.jpg",
    passion: true,
  },
  // 7. Gallery Erine
  {
    title: "Gallery Foto",
    category: "About · Foto",
    desc: "Koleksi foto berkualitas tinggi momen panggung, event, dan foto memukau Erine.",
    href: "/gallery",
    icon: "bx-image-alt",
    image: "/images/gallery/erine-gallery-2.jpg",
  },
  // 8. Kas & Donasi Cavallery
  {
    title: "Kas & Keanggotaan",
    category: "Community · Kas",
    desc: "Portal transparansi kas fanbase, pendaftaran anggota, dan donasi project.",
    href: "/cavallery-kas",
    icon: "bx-wallet",
    image: "/images/about/cava-group-4.jpeg",
  },
];

export default function HomePortalSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  useReveal(rootRef);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const pin = root.querySelector<HTMLElement>("[data-pin]");
      const track = root.querySelector<HTMLElement>("[data-track]");
      const marks = Array.from(root.querySelectorAll<HTMLElement>("[data-mark]"));
      if (!pin || !track) return;

      const mm = gsap.matchMedia();

      // Desktop: pinned horizontal scroll (vertical scroll → track translateX)
      mm.add(MQ.desktop, () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const active = Math.min(marks.length - 1, Math.floor(self.progress * marks.length));
              marks.forEach((m, i) => (m.dataset.on = i <= active && self.progress > 0.01 ? "true" : "false"));
            },
          },
        });
      });

      const off = refreshOnImages(root);
      return () => {
        off();
        mm.revert();
      };
    },
    { scope: rootRef }
  );

  // Mobile: indicator follows native horizontal scroll
  const onTrackScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (window.matchMedia(MQ.desktop).matches) return;
    const p = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth);
    const marks = rootRef.current?.querySelectorAll<HTMLElement>("[data-mark]") || [];
    const active = Math.round(p * (marks.length - 1));
    marks.forEach((m, i) => (m.dataset.on = i <= active ? "true" : "false"));
  };

  return (
    <section ref={rootRef} className={styles.section} id="eksplorasi" data-motion aria-labelledby="eksplorasi-title">
      <div className={styles.pin} data-pin>
        <div className={styles.track} data-track onScroll={onTrackScroll}>
          <div className={styles.intro}>
            <div id="eksplorasi-title">
              <SectionHead
                square="d5"
                eyebrow="Jelajahi Cavallery"
                title="Eksplorasi Seluruh"
                accent="Sudut Cavallery"
                subtitle="Akses langsung ke seluruh ruang kreasi, arsip musik, game, pameran seni, mading 2-Shot, dan program fanbase Erine."
              />
            </div>
            <p className={styles.hint} aria-hidden="true">
              <span className={styles.hintLine} />
              <span className={styles.hintDesktop}>Gulir untuk menjelajah 8 sudut</span>
              <span className={styles.hintMobile}>Geser untuk menjelajah 8 sudut</span>
            </p>
          </div>

          {PORTAL_ITEMS.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className={`${styles.panel} ${i % 2 === 0 ? styles.dark : styles.light} ${item.passion ? `${styles.passion} cv-dark` : ""} cv-flame-hover`}
            >
              <span className={styles.panelTop}>
                <span className={styles.category}>{item.category}</span>
                {item.badge && <span className={styles.badge}>{item.badge}</span>}
              </span>

              <span className={styles.media}>
                <img src={item.image} alt="" loading="lazy" decoding="async" />
                <span className={styles.mediaHeat} aria-hidden="true" />
                <span className={styles.icon} aria-hidden="true">
                  <i className={`bx ${item.icon}`} />
                </span>
              </span>

              <span className={styles.panelBottom}>
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.desc}>{item.desc}</span>
                <span className={styles.cta}>
                  Buka Halaman
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
              </span>
            </Link>
          ))}
          <span className={styles.trackEnd} aria-hidden="true" />
        </div>

        <div className={styles.marks} aria-hidden="true">
          {PORTAL_ITEMS.map((item) => (
            <span key={item.title} className={styles.mark} data-mark data-on="false" />
          ))}
        </div>
      </div>
    </section>
  );
}
