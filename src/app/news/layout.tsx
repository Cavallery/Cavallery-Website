import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita & Pengumuman",
  description: "Berita terbaru seputar Erine dan JKT48.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
