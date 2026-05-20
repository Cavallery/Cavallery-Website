import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

const gameData: Record<string, { title: string; url: string; description: string }> = {
  "grasshopper-collector": {
    title: "Grasshopper Collector",
    url: "/play/grasshopper-collector.html",
    description: "Kumpulkan belalang sebanyak mungkin sebelum waktu habis!",
  },
  "zombie-escape": {
    title: "Zombie Escape",
    url: "/play/zombie-escape.html",
    description: "Lari dari para zombie dan selamatkan diri!",
  },
  "jumping-adventure": {
    title: "Jumping Adventure",
    url: "/play/jumping-adventure.html",
    description: "Lompati rintangan dan raih skor tertinggi.",
  },
  "love-erine-meter": {
    title: "Love Erine Meter",
    url: "/play/love-tester.html",
    description: "Ukur seberapa besar cintamu untuk Erine!",
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(gameData).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const game = gameData[resolvedParams.slug];
  if (!game) return { title: "Game Not Found" };

  return {
    title: `${game.title} — GameRine | Cavallery`,
    description: game.description,
  };
}

export default async function GamePlayPage({ params }: Props) {
  const resolvedParams = await params;
  const game = gameData[resolvedParams.slug];

  if (!game) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/games" className={styles.backBtn}>
            <i className="bx bx-left-arrow-alt" /> Kembali
          </Link>
          <h1 className={styles.title}>{game.title}</h1>
        </div>
      </div>
      <div className={styles.frameWrapper}>
        <iframe
          src={game.url}
          className={styles.iframe}
          title={game.title}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
