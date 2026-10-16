import AboutErineSection from "@/components/home/AboutErineSection";
import TimelineSection from "@/components/home/TimelineSection";
import YoutubeSection from "@/components/home/YoutubeSection";
import SectionDivider from "@/components/SectionDivider";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Tentang Erine",
  description:
    "Profil lengkap Catherina Vallencia Kurniawan (Erine), anggota JKT48 Team Passion.",
};

/*
 * Section notation continues one knight's journey:
 * a1 → b3 → c5 → d7 → e5 → f3 → g5 → h3 → f4 → e6 (videos) → c7 (Knight's Path).
 */
export default function AboutErinePage() {
  return (
    <div className={styles.page}>
      <AboutErineSection />
      <SectionDivider />
      <YoutubeSection square="e6" />
      <SectionDivider />
      <TimelineSection />
    </div>
  );
}
