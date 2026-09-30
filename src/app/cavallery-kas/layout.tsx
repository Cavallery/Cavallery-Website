import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kas & Donasi",
  description: "Portal Iuran Kas Komunitas & Donasi Project Fanbase Cavallery",
};

export default function CavalleryKasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
