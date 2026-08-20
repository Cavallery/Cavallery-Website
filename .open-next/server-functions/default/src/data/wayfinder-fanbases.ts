// Fanbase list with slug → display name mapping
// URL format: /the-wayfinder/[slug]
import fs from "fs";
import path from "path";

export interface FanbaseEntry {
  id?: string;
  slug: string;
  name: string;
}

export interface WayfinderConfig {
  bgImage: string;
  eventDate: string;
  badgeText: string;
  eyebrow: string;
  heroName: string;
  heroTitle: string;
  invitedLabel: string;
  dateTitle: string;
  dateSub: string;
  locationTitle: string;
  locationSub: string;
  mapUrl: string;
  dressCodeTitle: string;
  dressCodeSub: string;
  footerText: string;
}

export const DEFAULT_WAYFINDER_CONFIG: WayfinderConfig = {
  bgImage: "/images/wayfinder-bg.png",
  eventDate: "2026-08-22T15:00:00+07:00",
  badgeText: "Seitansai Project 2026",
  eyebrow: "Catherina Vallencia",
  heroName: "Erine",
  heroTitle: "The Wayfinder",
  invitedLabel: "Mengundang",
  dateTitle: "Sabtu, 22 Agustus 2026",
  dateSub: "Pukul 15.00 — 20.30 WIB",
  locationTitle: "CGV FX Sudirman — Lantai F7",
  locationSub: "Jl. Jend. Sudirman, Pintu Satu Senayan, Jakarta Selatan",
  mapUrl: "https://maps.google.com/?q=CGV+FX+Sudirman",
  dressCodeTitle: "Dress Code: Birthday T-shirt Erine",
  dressCodeSub: "atau pakaian sopan & rapih",
  footerText: "Cavallery ©2026",
};

export const RAW_FANBASES = [
  "Fenidelity",
  "Gitroops",
  "Christyzer",
  "Freyanation",
  "Helismiley",
  "Jessination",
  "MUFFIN",
  "Olla The Miracle",
  "Lunarian",
  "Onielity",
  "Symfiony",
  "Interindah",
  "Kath. Inc",
  "MarshaOshi",
  "Ellatheria",
  "Liamelior",
  "Lynear",
  "Raishanrise",
  "Alamanda",
  "Aninimous",
  "Cellineyours",
  "Chelsealand",
  "Cynthiaction",
  "Daisyne",
  "DEGREES",
  "Denalize",
  "Gracieluv",
  "Michiban",
  "Wargavi48",
  "Nayrakuen",
  "Aranika",
  "Hillaryours",
  "Delynessence",
  "Olinara",
  "TACT",
  "Nalania",
  "RIBCALLS",
  "Lanautica",
  "YokiNachia",
  "Fritzy Force",
  "Le Viosa",
  "Cavallery",
  "GROVY",
  "Jevolante",
  "Humainiora",
  "Iris",
  "Aprillivels",
  "AuLavana",
  "BerbahaGIA.ID",
  "CINEMIKA",
  "EKINAIR",
  "ASTRALUX",
  "Carissera",
  "Heippy",
  "HIRAKIRA",
  "JazLune",
  "Jogo Bonita",
  "Maxineiu",
  "Ralvandra",
  "RaraLand",
  "TerpeSona",
  "TheaFeria",
  "Cipuyyy",
  "William Santoso",
  "Angga",
  "RFDorable",
  "Vend.",
  "Lucky Arasyah",
  "Indyraaa",
  "Roni Eriyanto",
  "Rifqi Annafi",
  "ForLovelist",
  "Expose Right Noise",
  "Tumpul Vallencia",
  "Point Of View",
  "Nabil Rasyaaa",
  "Ashlii Palsu",
  "Isnia",
];

export function toSlug(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\./g, "")
    .replace(/[^a-zA-Z0-9\-]/g, "");
}

export const DEFAULT_FANBASES: FanbaseEntry[] = RAW_FANBASES.map((name, i) => ({
  id: String(i + 1),
  slug: toSlug(name),
  name,
}));

export function getFanbases(): FanbaseEntry[] {
  try {
    const isVercel = process.env.VERCEL === "1";
    const dataDir = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
    const jsonPath = path.join(dataDir, "wayfinder-invitations.json");
    const staticPath = path.join(process.cwd(), "src", "data", "wayfinder-invitations.json");

    const targetPath = fs.existsSync(jsonPath) ? jsonPath : (fs.existsSync(staticPath) ? staticPath : null);
    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, i: number) => ({
          id: item.id || String(i + 1),
          name: item.name,
          slug: item.slug || toSlug(item.name),
        }));
      }
    }
  } catch {}

  return DEFAULT_FANBASES;
}

export function getWayfinderConfig(): WayfinderConfig {
  try {
    const isVercel = process.env.VERCEL === "1";
    const dataDir = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
    const jsonPath = path.join(dataDir, "wayfinder-config.json");
    const staticPath = path.join(process.cwd(), "src", "data", "wayfinder-config.json");

    const targetPath = fs.existsSync(jsonPath) ? jsonPath : (fs.existsSync(staticPath) ? staticPath : null);
    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8");
      const parsed = JSON.parse(content);
      return { ...DEFAULT_WAYFINDER_CONFIG, ...parsed };
    }
  } catch {}

  return DEFAULT_WAYFINDER_CONFIG;
}

export const FANBASES: FanbaseEntry[] = DEFAULT_FANBASES;

// slug -> name lookup
export const SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  FANBASES.map((f) => [f.slug, f.name])
);

// Helper to resolve fanbase flexibly (handles case-insensitivity, spaces, dashes, dots, and encoding)
export function getFanbaseByNameOrSlug(rawInput: string): string | undefined {
  if (!rawInput) return undefined;

  let decoded = rawInput;
  try {
    decoded = decodeURIComponent(rawInput).trim();
  } catch {
    decoded = rawInput.trim();
  }

  const allEntries = getFanbases();

  // 1. Direct slug match
  const slugMatch = allEntries.find((f) => f.slug === decoded);
  if (slugMatch) return slugMatch.name;

  // 2. Direct name match (case-insensitive)
  const directNameMatch = allEntries.find(
    (f) => f.name.toLowerCase() === decoded.toLowerCase()
  );
  if (directNameMatch) {
    return directNameMatch.name;
  }

  // 3. Flexible normalized match (removes spaces, dashes, dots, underscores, case)
  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const targetNorm = normalize(decoded);
  if (!targetNorm) return undefined;

  const flexibleMatch = allEntries.find(
    (f) =>
      normalize(f.slug) === targetNorm || normalize(f.name) === targetNorm
  );

  return flexibleMatch?.name;
}

// All valid slugs (for generateStaticParams)
export const ALL_SLUGS = DEFAULT_FANBASES.map((f) => f.slug);
