import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Portal Manajemen & Administrasi Fanbase Cavallery",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
