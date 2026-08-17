// Fanbase list with slug → display name mapping
// URL format: /the-wayfinder/[slug]

export interface FanbaseEntry {
  slug: string;
  name: string;
}

const RAW_FANBASES = [
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
  "Cathleenexus",
  "Cellineyours",
  "Chelsealand",
  "Cynthiaction",
  "Daisyne",
  "DEGREES",
  "Denalize",
  "Gracieluv",
  "Michiban",
  "Sahabat Gendis",
  "Wargavi48",
  "Nayrakuen",
  "Arariel",
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
  "Intanium",
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
];

function toSlug(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/\./g, "")
    .replace(/[^a-zA-Z0-9\-]/g, "");
}

export const FANBASES: FanbaseEntry[] = RAW_FANBASES.map((name) => ({
  slug: toSlug(name),
  name,
}));

// Helper to resolve fanbase flexibly (handles case-insensitivity, spaces, dashes, dots, and encoding)
export function getFanbaseByNameOrSlug(rawInput: string): string | undefined {
  if (!rawInput) return undefined;
  
  let decoded = rawInput;
  try {
    decoded = decodeURIComponent(rawInput).trim();
  } catch {
    decoded = rawInput.trim();
  }

  // 1. Direct slug match
  if (SLUG_TO_NAME[decoded]) {
    return SLUG_TO_NAME[decoded];
  }

  // 2. Direct name match (e.g. /the-wayfinder/Olla The Miracle)
  const directNameMatch = FANBASES.find(
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

  const flexibleMatch = FANBASES.find(
    (f) =>
      normalize(f.slug) === targetNorm || normalize(f.name) === targetNorm
  );

  return flexibleMatch?.name;
}

// All valid slugs (for generateStaticParams)
export const ALL_SLUGS = FANBASES.map((f) => f.slug);
