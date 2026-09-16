import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";
import Chatbot from "@/components/Chatbot/Chatbot";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import PassionFireBackground from "@/components/PassionFireBackground";
import MobileInstallPrompt from "@/components/MobileInstallPrompt";
import { cn } from "@/lib/utils";

export const viewport: Viewport = {
  themeColor: "#c9a84c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Cavallery",
  description:
    "Cavallery adalah fanbase resmi Erine JKT48. Temukan berita, jadwal show theater, live, games, dan proyek eksklusif.",
  keywords: ["Cavallery", "Erine JKT48", "Catherina Vallencia", "JKT48 fanbase"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cavallery",
  },
  icons: {
    icon: "/images/cava-logo-round.png",
    apple: "/images/cava-logo-round.png",
  },
  openGraph: {
    title: "Cavallery",
    description: "Fanbase resmi Erine JKT48",
    type: "website",
    images: ["/images/cava-logo-round.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="font-sans" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cavallery" />
        <link rel="apple-touch-icon" href="/images/cava-logo-round.png" />
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:wght@300..800&family=Caveat:wght@400..700&family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <div className="knight-watermark" />
        <div className="board-watermark" />
        <PassionFireBackground />
        <SplashScreen />
        <ScrollRevealProvider />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Chatbot />
        <MobileInstallPrompt />
      </body>
    </html>
  );
}
