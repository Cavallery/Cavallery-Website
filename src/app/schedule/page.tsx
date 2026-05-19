import type { Metadata } from "next";
import styles from "./page.module.css";
import { TheaterSection, LiveSection, VideoCallSection } from "@/components/schedule/ScheduleSections";

export const metadata: Metadata = {
  title: "Schedule — Cavallery",
  description: "Jadwal lengkap Erine JKT48: Theater, Live, dan Video Call dalam satu halaman.",
};

export default function SchedulePage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className="badge"><i className="bx bx-time-five" /> #ErineSchedule</div>
          <h1 className={styles.heroTitle}>Erine <span className="textGold">Schedule</span></h1>
          <p className={styles.heroSub}>
            Semua jadwal kegiatan Erine JKT48 dalam satu tempat. 
            Mulai dari show theater, jadwal live, hingga sesi video call terbaru.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Live Section (Priority if active) */}
        <LiveSection />

        {/* Video Call Section */}
        <VideoCallSection />

        {/* Theater Section */}
        <TheaterSection />
      </div>
    </div>
  );
}
