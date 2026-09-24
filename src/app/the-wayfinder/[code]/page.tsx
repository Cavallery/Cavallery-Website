import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
