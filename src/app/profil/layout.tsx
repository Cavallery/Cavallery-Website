import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Anggota",
  description: "Profil Keanggotaan & Identitas Resmi Fanbase Cavallery",
};

export default function ProfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
