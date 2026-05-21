import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";
import Chatbot from "@/components/Chatbot/Chatbot";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Cavallery",
  description:
    "Cavallery adalah fanbase resmi Catherina Vallencia Kurniawan (Erine) JKT48. Temukan berita, jadwal show theater, live, games, dan proyek eksklusif.",
  keywords: ["Cavallery", "Erine JKT48", "Catherina Vallencia", "JKT48 fanbase"],
  icons: {
    icon: "/images/cava-logo.jpg",
    apple: "/images/cava-logo.jpg",
  },
  openGraph: {
    title: "Cavallery",
    description: "Fanbase resmi Erine JKT48",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <head>
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:wght@300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>

        <div className="knight-watermark" />
        <div className="board-watermark" />
        <SplashScreen />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
