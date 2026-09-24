import { redirect } from "next/navigation";
import { ALL_SLUGS } from "@/data/wayfinder-fanbases";

type Props = {
  params: Promise<{ code: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return ALL_SLUGS.map((code) => ({ code }));
}

export default async function WayfinderPage({ params }: Props) {
  const { code } = await params;
  const normalized = decodeURIComponent(code || "").trim().toLowerCase();
  if (normalized === "scan") {
    redirect("/undangan/scan");
  }
  if (normalized === "links") {
    redirect("/undangan/links");
  }
  redirect(`/undangan/${code}`);
}
