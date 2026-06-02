import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import GameFrame from "./GameFrame";

const gameData: Record<string, { title: string; url: string; description: string }> = {
  "grasshopper-collector": {
    title: "Game Belalang Yang Membangkang",
    url: "/play/grasshopper-collector.html",
    description: "Kumpulkan belalang sebanyak mungkin sebelum waktu habis!",
  },
  "zombie-escape": {
    title: "Game Erine In Etherland",
    url: "/play/zombie-escape.html",
    description: "Bantu Ratu Erine Menuju Istana Cavallery!",
  },
  "jumping-adventure": {
    title: "Game Bibir Yang Telah Dicuri",
    url: "/play/jumping-adventure.html",
    description: "Lompati rintangan dan raih skor tertinggi.",
  },
  "love-erine-meter": {
    title: "Love Erine Meter",
    url: "/play/love-tester.html",
    description: "Ukur seberapa besar cintamu untuk Erine!",
  },
  "dress-up-erine": {
    title: "Dress Up Erine Outfit",
    url: "/play/dressuperine.html",
    description: "Ayo dress up Erine sesukamu! Ganti baju, pilih wajah, dan tentukan lokasinya.",
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(gameData).map((slug) => ({ slug }));
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
  if (!game) notFound();

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
  <GameFrame
    src={game.url}
    title={game.title}
  />
</div>
    </div>
  );
}
