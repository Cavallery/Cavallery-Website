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

// slug → display name lookup
export const SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  FANBASES.map((f) => [f.slug, f.name])
);

// All valid slugs (for generateStaticParams)
export const ALL_SLUGS = FANBASES.map((f) => f.slug);
