import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk Akun",
  description: "Masuk ke Portal Anggota & Donatur Fanbase Cavallery",
};

export default function MasukLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
