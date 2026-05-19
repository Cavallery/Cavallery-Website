import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects — Cavallery",
  description: "Proyek-proyek kreatif yang dibuat oleh Cavallery untuk mendukung Erine JKT48.",
};

const projects = [
  {
    title: "Erine in Etherland",
    desc: "Sebuah proyek visual novel dan video cinematic yang menceritakan petualangan Erine di dunia fantasi bernama Etherland. Kolaborasi antara tim kreatif Cavallery dengan berbagai kontributor.",
    tags: ["Visual Story", "Creative Project", "2025"],
    href: "/erine-in-etherland",
    icon: "bx-movie-play",
    color: "#a78bfa",
    internal: true,
  },
  {
    title: "Mini Games GameRine",
    desc: "Seri mini games eksklusif yang dibuat untuk Erine. Dimulai dari Grasshopper Collector, Zombie Escape, Jumping Adventure, hingga Love Erine Meter — semuanya pernah dimainkan langsung oleh Erine!",
    tags: ["Game Dev", "4 Games", "2025"],
    href: "/games",
    icon: "bx-joystick",
    color: "#4ade80",
    internal: true,
  },
  {
    title: "Cavallery Website v2",
    desc: "Rebuild total website Cavallery menggunakan Next.js dengan desain premium, animasi smooth, dan fitur lengkap termasuk integrasi API JKT48Connect untuk jadwal, live, dan berita.",
    tags: ["Next.js", "Web Dev", "2025"],
    href: "#",
    icon: "bx-code-block",
    color: "#60a5fa",
    internal: false,
  },
  {
    title: "Top Contributor — ErineInEtherland",
    desc: "Program apresiasi untuk para kontributor top yang telah berkontribusi besar dalam proyek Erine in Etherland. Nama-nama terbaik diabadikan di Wall of Fame.",
    tags: ["Community", "Appreciation", "2025"],
    href: "/erine-in-etherland#contributors",
    icon: "bx-trophy",
    color: "#fbbf24",
    internal: true,
  },
];

export default function ProjectsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-rocket" /> Proyek Kreatif</div>
          <h1 className={styles.heroTitle}>
            Projects <span className="textGold">Cavallery</span>
          </h1>
          <p className={styles.heroSub}>
            Karya-karya kreatif yang lahir dari cinta dan dedikasi Cavallery untuk Erine JKT48.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {projects.map((p) => (
          <div
            key={p.title}
            className={`glassCard ${styles.card}`}
            style={{ "--card-color": p.color } as React.CSSProperties}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}><i className={`bx ${p.icon}`} /></div>
              <div className={styles.tags}>
                {p.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
            <h2 className={styles.cardTitle}>{p.title}</h2>
            <p className={styles.cardDesc}>{p.desc}</p>
            {p.internal ? (
              <Link href={p.href} className={styles.cardBtn}>
                <i className="bx bx-link-external" /> Lihat Project
              </Link>
            ) : (
              <span className={styles.cardBtnDisabled}>
                <i className="bx bx-check-circle" /> Current Project
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
