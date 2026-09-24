import type { Metadata } from "next";
import { ALL_SLUGS, getFanbaseByNameOrSlug, getWayfinderConfig } from "@/data/wayfinder-fanbases";
import UndanganClient from "./UndanganClient";
import { redirect } from "next/navigation";

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
    ? `Undangan ${config.badgeText || "Seitansai"}: ${config.heroName || "Erine"} untuk ${fanbase}`
    : `Undangan Fanbase — ${config.eyebrow || "Catherina Vallencia"} | ${config.footerText || "CAVALLERY"}`;

  return {
    title,
    description: fanbase
      ? `Undangan resmi ${config.badgeText || "Seitansai"} untuk ${fanbase} di ${config.locationTitle || "CGV FX Sudirman"} pada ${config.dateTitle || "22 Agustus 2026"}.`
      : `Undangan resmi by ${config.footerText || "CAVALLERY"}`,
    openGraph: {
      title,
      description: `Undangan resmi untuk ${fanbase || "Fanbase"}`,
      type: "website",
      images: [config.bgImage || "/images/wayfinder-bg.png"],
    },
  };
}

export default async function UndanganPage({ params }: Props) {
  const { code } = await params;
  const normalized = decodeURIComponent(code || "").trim().toLowerCase();

  if (normalized === "scan") {
    redirect("/undangan/scan");
  }

  if (normalized === "links") {
    redirect("/undangan/links");
  }

  const fanbase = getFanbaseByNameOrSlug(code);
  const config = getWayfinderConfig();

  return <UndanganClient fanbase={fanbase} config={config} slug={code} />;
}
