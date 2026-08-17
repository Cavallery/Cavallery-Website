import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Wayfinder — Catherina Vallencia Seitansai Project | CAVALLERY",
  description:
    "Undangan resmi Seitansai Project Catherina Vallencia (Erine) JKT48 — The Wayfinder by CAVALLERY ©2026",
  openGraph: {
    title: "ERINE — THE WAYFINDER | Seitansai Project",
    description: "Catherina Vallencia Seitansai Project by CAVALLERY ©2026",
    type: "website",
    images: [
      "https://images.jkt48connect.com/cavallery/images/2026/08/49a0f3cea7464b93.png",
    ],
  },
};

export default function WayfinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide main site chrome but keep the chess background */}
      <style>{`
        nav, footer,
        [class*="SplashScreen"], [class*="splashScreen"],
        [class*="Chatbot"], [class*="chatbot"] {
          display: none !important;
        }
        main {
          padding: 0 !important;
          margin: 0 !important;
          min-height: 100vh;
        }
      `}</style>
      {children}
    </>
  );
}
