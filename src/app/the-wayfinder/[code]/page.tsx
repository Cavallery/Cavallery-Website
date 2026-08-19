import type { Metadata } from "next";
import { ALL_SLUGS, getFanbaseByNameOrSlug } from "@/data/wayfinder-fanbases";
import WayfinderClient from "./WayfinderClient";

type Props = {
  params: Promise<{ code: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return ALL_SLUGS.map((code) => ({ code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const fanbase = getFanbaseByNameOrSlug(code);

  const title = fanbase
    ? `Undangan Seitansai: Erine — The Wayfinder untuk ${fanbase}`
    : "The Wayfinder — Catherina Vallencia Seitansai Project | CAVALLERY";

  return {
    title,
    description: fanbase
      ? `Undangan resmi Seitansai Erine ke-18 untuk ${fanbase} di CGV FX Sudirman F7 pada 22 Agustus 2026.`
      : "Undangan resmi Seitansai Project Catherina Vallencia (Erine) JKT48 — The Wayfinder by CAVALLERY ©2026",
    openGraph: {
      title,
      description: "Catherina Vallencia Seitansai Project by CAVALLERY ©2026",
      type: "website",
      images: ["/images/wayfinder-bg.png"],
    },
  };
}

export default async function WayfinderPage({ params }: Props) {
  const { code } = await params;
  const fanbase = getFanbaseByNameOrSlug(code);

  return <WayfinderClient fanbase={fanbase} />;
}
