import styles from "./page.module.css";
import HeroSection from "@/components/home/HeroSection";
import BlueRoseCountdown from "@/components/home/BlueRoseCountdown";
import TicketingSection from "@/components/home/TicketingSection";
import NewsPreview from "@/components/home/NewsPreview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cavallery — Official Erine JKT48 Fanbase",
  description:
    "Cavallery adalah komunitas resmi penggemar Erine (Catherina Vallencia) JKT48. Jadwal, berita, games, dan proyek eksklusif.",
};

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <BlueRoseCountdown />
      <TicketingSection />
      <NewsPreview />
    </div>
  );
}
