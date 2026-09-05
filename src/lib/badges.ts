// ============================================================
// CAVALLERY MEMBER BADGE SYSTEM (Boxicons Ready, No Emoji)
// ============================================================

export interface MemberBadgeDef {
  id: string;
  name: string;
  icon: string; // Boxicons class
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const MEMBER_BADGES: Record<string, MemberBadgeDef> = {
  squire: {
    id: "squire",
    name: "Squire",
    icon: "bx-shield",
    description: "Bergabung dengan komunitas Cavallery di LINE atau Discord.",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  rider: {
    id: "rider",
    name: "Rider",
    icon: "bx-run", // Alternatif equestrian / horse boxicon
    description: "Aktif berinteraksi dan mengobrol di komunitas LINE & Discord Cavallery.",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.12)",
    borderColor: "rgba(59, 130, 246, 0.35)",
  },
  knight: {
    id: "knight",
    name: "Knight",
    icon: "bx-cross", // Icon swords / cross knight
    description: "Aktif dan rutin mengikuti kegiatan, event, serta gathering Cavallery.",
    color: "#c9a84c",
    bgColor: "rgba(201, 168, 76, 0.15)",
    borderColor: "rgba(201, 168, 76, 0.4)",
  },
  royal_guard: {
    id: "royal_guard",
    name: "Royal Guard",
    icon: "bx-building-house", // Icon castle / fortress
    description: "Aktif berkontribusi dalam project Cavallery serta aktif di Discord & komunitas.",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.14)",
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  royal_knight: {
    id: "royal_knight",
    name: "Royal Knight",
    icon: "bx-crown", // Icon crown
    description: "Member yang sangat aktif, loyal, dan banyak berkontribusi dalam project Cavallery.",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
};

export const BADGE_OPTIONS = [
  { value: "squire", label: "Squire", icon: "bx-shield" },
  { value: "rider", label: "Rider", icon: "bx-run" },
  { value: "knight", label: "Knight", icon: "bx-cross" },
  { value: "royal_guard", label: "Royal Guard", icon: "bx-building-house" },
  { value: "royal_knight", label: "Royal Knight", icon: "bx-crown" },
];

export function getMemberBadge(badgeKey?: string | null): MemberBadgeDef {
  if (!badgeKey) return MEMBER_BADGES.squire;
  const key = badgeKey.toLowerCase().trim().replace(/[\s-]+/g, "_");
  return MEMBER_BADGES[key] || MEMBER_BADGES.squire;
}
