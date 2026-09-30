import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pendaftaran Anggota",
  description: "Formulir Pendaftaran Anggota Resmi Fanbase Cavallery",
};

export default function DaftarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
