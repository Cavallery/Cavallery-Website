import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Undangan Fanbase — Seitansai Project | CAVALLERY",
  description: "Undangan resmi Seitansai Project Erine JKT48 by CAVALLERY",
  openGraph: {
    title: "Undangan Fanbase | CAVALLERY",
    description: "Seitansai Project by CAVALLERY",
    type: "website",
  },
};

export default function UndanganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      />
      {/* Hide main site chrome but keep background */}
      <style>{`
        nav, footer,
        [class*="SplashScreen"], [class*="splashScreen"],
        [class*="Chatbot"], [class*="chatbot"] {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
