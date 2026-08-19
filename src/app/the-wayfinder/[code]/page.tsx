import type { Metadata } from "next";
import { ALL_SLUGS, getFanbaseByNameOrSlug, getWayfinderConfig } from "@/data/wayfinder-fanbases";
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
  const config = getWayfinderConfig();

  const title = fanbase
    ? `Undangan ${config.badgeText || "Seitansai"}: ${config.heroName || "Erine"} — ${config.heroTitle || "The Wayfinder"} untuk ${fanbase}`
    : `${config.heroTitle || "The Wayfinder"} — ${config.eyebrow || "Catherina Vallencia"} | ${config.footerText || "CAVALLERY"}`;

  return {
    title,
    description: fanbase
      ? `Undangan resmi ${config.badgeText || "Seitansai"} untuk ${fanbase} di ${config.locationTitle || "CGV FX Sudirman"} pada ${config.dateTitle || "22 Agustus 2026"}.`
      : `Undangan resmi ${config.heroName || "Erine"} — ${config.heroTitle || "The Wayfinder"} by ${config.footerText || "CAVALLERY"}`,
    openGraph: {
      title,
      description: `Undangan resmi ${config.heroName || "Erine"} — ${config.heroTitle || "The Wayfinder"}`,
      type: "website",
      images: [config.bgImage || "/images/wayfinder-bg.png"],
    },
  };
}

export default async function WayfinderPage({ params }: Props) {
  const { code } = await params;
  const fanbase = getFanbaseByNameOrSlug(code);
  const config = getWayfinderConfig();

  return <WayfinderClient fanbase={fanbase} config={config} />;
}
