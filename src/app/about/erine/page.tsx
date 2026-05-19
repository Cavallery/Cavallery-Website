import AboutErineSection from "@/components/home/AboutErineSection";
import TimelineSection from "@/components/home/TimelineSection";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About Erine — Cavallery",
  description:
    "Profil lengkap Catherina Vallencia Kurniawan (Erine), anggota JKT48 Team Passion.",
};

export default function AboutErinePage() {
  return (
    <div className={styles.page}>
      <div style={{ paddingTop: 80 }}>
        <AboutErineSection />
        <TimelineSection />
      </div>
    </div>
  );
}
