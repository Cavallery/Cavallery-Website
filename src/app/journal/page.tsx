import type { Metadata } from "next";
import styles from "./page.module.css";
import JournalSection from "@/components/journal/JournalSection";

export const metadata: Metadata = {
  title: "MemoRine — Erine's Journal",
  description: "Kirim pesan dan dukung Erine melalui #MemoRine. Jurnal digital interaktif dari Cavallery.",
};

export default function JournalPage() {
  return (
    <div className={styles.page}>
      <JournalSection />
    </div>
  );
}
