import styles from "./page.module.css";
import HeroSection from "@/components/home/HeroSection";
import HomeInfoSection from "@/components/home/HomeInfoSection";
import HomePortalSection from "@/components/home/HomePortalSection";
import CalendarSection from "@/components/home/CalendarSection";
import TicketingSection from "@/components/home/TicketingSection";
import NewsPreview from "@/components/home/NewsPreview";
import VideoSection from "@/components/home/VideoSection";
import YoutubeSection from "@/components/home/YoutubeSection";
import SectionDivider from "@/components/SectionDivider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Cavallery.id",
  },
  description:
    "Cavallery adalah komunitas resmi penggemar Erine JKT48. Jadwal, berita, games, dan proyek eksklusif.",
};

export const revalidate = 60; // Cache homepage for 60 seconds

/*
 * Section notation follows one legal knight's journey down the page:
 * e4 (hero) → f6 → d5 → c3 → e2 → g3 → h5 → g7 → endgame board in the footer.
 */
export default function HomePage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <HomeInfoSection />
      <SectionDivider rank={6} />
      <HomePortalSection />
      <VideoSection />
      <CalendarSection />
      <SectionDivider rank={3} />
      <TicketingSection />
      <SectionDivider rank={5} />
      <NewsPreview />
      <SectionDivider rank={7} />
      <YoutubeSection />
    </div>
  );
}
