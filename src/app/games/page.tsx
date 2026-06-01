import type { Metadata } from "next";
import styles from "./page.module.css";
import GamesVideoTeaser from "@/components/games/GamesVideoTeaser";

export const metadata: Metadata = {
  title: "Games Cavallery",
  description: "Koleksi mini games eksklusif yang pernah dimainkan oleh Erine JKT48. Play now!",
};

const games = [
  {
    title: "Game DressUp Erine",
    desc: "Ayo dress up Erine sesukamu! Ganti baju, pilih wajah, dan tentukan lokasinya. Ciptakan look favoritmu dan bagikan ke semua orang!",
    href: "/games/dress-up-erine",
    icon: "bx-closet",
    tag: "Fashion",
    color: "#e879f9",
    longDesc:
      "Jadilah stylist pribadi Erine! Pilih busana dari berbagai koleksi kostum, atur ekspresi wajahnya, dan tentukan lokasi pemotretan impianmu. Setiap kombinasi menghasilkan tampilan unik — simpan hasilnya dan tunjukkan ke seluruh Cavallery siapa yang paling kreatif!",
  },
  {
    title: "Game Erine In Etherland",
    desc: "Lari dari para zombie dan selamatkan diri! Bisakah kamu bertahan hidup?",
    href: "/games/zombie-escape",
    icon: "bx-run",
    tag: "Survival",
    color: "#f87171",
    longDesc:
      "Game survival menegangkan di mana kamu harus menghindari zombie yang terus mengejar. Seberapa jauh kamu bisa berlari? Buktikan kemampuanmu!",
  },
  {
    title: "Game Belalang Yang Membangkang",
    desc: "Kumpulkan belalang sebanyak mungkin sebelum waktu habis! Game pertama dari seri GameRine.",
    href: "/games/grasshopper-collector",
    icon: "bx-bug",
    tag: "Arcade",
    color: "#4ade80",
    longDesc:
      "Tantang dirimu mengumpulkan sebanyak mungkin belalang dalam waktu terbatas. Gerakkan karakter ke kiri dan kanan, hindari rintangan, dan raih skor tertinggi!",
  },
  {
    title: "Jumping Adventure",
    desc: "Lompati rintangan dan raih skor tertinggi dalam petualangan seru ini.",
    href: "/games/jumping-adventure",
    icon: "bx-up-arrow-circle",
    tag: "Adventure",
    color: "#60a5fa",
    longDesc:
      "Petualangan tanpa akhir yang mengujji refleks dan ketangkasanmu. Lompati semua rintangan dan jadilah yang terbaik di papan skor Cavallery!",
  },
  {
    title: "Love Erine Meter",
    desc: "Seberapa besar cintamu untuk Erine? Ukur sekarang dan bagikan hasilnya!",
    href: "/games/love-erine-meter",
    icon: "bxs-heart",
    tag: "Fun",
    color: "#f472b6",
    longDesc:
      "Game spesial untuk seluruh Cavallery! Masukkan namamu dan ukur seberapa besar cintamu untuk Erine. Bagikan hasilnya dan tag @cavallery.id!",
  },
];

import Link from "next/link";

export default function GamesPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-joystick" /> #GameRine</div>
          <h1 className={styles.heroTitle}>
            Mini Games <span className="textGold">Cavallery</span>
          </h1>
          <p className={styles.heroSub}>
            Game-game eksklusif yang dibuat oleh tim Cavallery dan pernah dimainkan langsung oleh Erine!
          </p>
        </div>
      </div>

      {/* Game video teaser */}
      <GamesVideoTeaser />

      {/* Games Grid */}
      <div className={styles.grid}>
        {games.map((g) => (
          <div
            key={g.title}
            className={`glassCard ${styles.card}`}
            style={{ "--card-color": g.color } as React.CSSProperties}
          >
            <div className={styles.cardTop}>
              <div className={styles.cardTag}>{g.tag}</div>
              <div className={styles.cardIcon}><i className={`bx ${g.icon}`} /></div>
            </div>
            <h2 className={styles.cardTitle}>{g.title}</h2>
            <p className={styles.cardDesc}>{g.longDesc}</p>
            <Link
              href={g.href}
              className={styles.playBtn}
            >
              <i className="bx bxs-joystick" /> Play Now
              <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
