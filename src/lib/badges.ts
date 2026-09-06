// ============================================================
// CAVALLERY MEMBER BADGE SYSTEM (Boxicons Ready, No Emoji)
// ============================================================

export interface MemberBadgeDef {
  id: string;
  name: string;
  level: number;
  icon: string; // Boxicons class
  description: string;
  criteria: string;
  nextBadge?: string;
  howToUpgrade: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const MEMBER_BADGES: Record<string, MemberBadgeDef> = {
  squire: {
    id: "squire",
    name: "Squire",
    level: 1,
    icon: "bx-shield",
    description: "Tingkat pemula. Anggota yang baru bergabung dengan komunitas Cavallery.",
    criteria: "Telah resmi terdaftar dan bergabung di grup komunitas LINE atau Discord Cavallery.",
    nextBadge: "Rider",
    howToUpgrade: "Aktif memperkenalkan diri, ikut mengobrol ramah di grup LINE/Discord Cavallery secara berkala minimal selama 1 bulan.",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  rider: {
    id: "rider",
    name: "Rider",
    level: 2,
    icon: "bx-compass",
    description: "Pengelana aktif. Anggota yang rutin berbaur dan aktif di percakapan komunitas.",
    criteria: "Aktif berinteraksi, berdiskusi santun, dan meramaikan obrolan di komunitas LINE & Discord.",
    nextBadge: "Knight",
    howToUpgrade: "Rutin mengikuti kegiatan komunitas (gathering, nobar show Erine, project dukungan) dan tertib membayar kas bulanan fanbase.",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.12)",
    borderColor: "rgba(59, 130, 246, 0.35)",
  },
  knight: {
    id: "knight",
    name: "Knight",
    level: 3,
    icon: "bx-cross",
    description: "Ksatria berdedikasi. Anggota yang rutin hadir dan mendukung kegiatan resmi fanbase.",
    criteria: "Rutin hadir dalam event/gathering, aktif mendukung Erine JKT48, dan berpartisipasi dalam program fanbase.",
    nextBadge: "Royal Guard",
    howToUpgrade: "Berperan aktif membantu kepanitiaan project fanbase, aktif membantu koordinasi event di Discord/LINE, atau berkontribusi dalam donasi/merchandise project.",
    color: "#c9a84c",
    bgColor: "rgba(201, 168, 76, 0.15)",
    borderColor: "rgba(201, 168, 76, 0.4)",
  },
  royal_guard: {
    id: "royal_guard",
    name: "Royal Guard",
    level: 4,
    icon: "bxs-shield", // Tameng baja kokoh pengawal kerajaan (BUKAN bangunan/rumah)
    description: "Pengawal setia kerajaan. Berkontribusi nyata dalam proyek besar dan menjaga keharmonisan fanbase.",
    criteria: "Sangat loyal, aktif berkontribusi dalam project besar Cavallery (Seitansai, videotron, event offair Erine), serta dipercaya menjaga ketertiban komunitas.",
    nextBadge: "Royal Knight",
    howToUpgrade: "Menunjukkan kepemimpinan teladan, dedikasi jangka panjang tanpa henti, serta kontribusi besar luar biasa yang berdampak bagi seluruh fanbase Cavallery.",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.14)",
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  royal_knight: {
    id: "royal_knight",
    name: "Royal Knight",
    level: 5,
    icon: "bx-crown",
    description: "Gelar kehormatan ksatria tertinggi bagi pilar utama dan pendukung paling berdedikasi.",
    criteria: "Gelar kehormatan tertinggi Cavallery. Diberikan kepada ksatria paling loyal, konsisten, dan menjadi teladan bagi seluruh anggota.",
    nextBadge: undefined,
    howToUpgrade: "Puncak gelar kehormatan ksatria tertinggi di Cavallery Fanbase.",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.45)",
  },
};

export const BADGE_OPTIONS = [
  { value: "squire", label: "Squire (Level 1)", icon: "bx-shield" },
  { value: "rider", label: "Rider (Level 2)", icon: "bx-compass" },
  { value: "knight", label: "Knight (Level 3)", icon: "bx-cross" },
  { value: "royal_guard", label: "Royal Guard (Level 4)", icon: "bxs-shield" },
  { value: "royal_knight", label: "Royal Knight (Level 5)", icon: "bx-crown" },
];

export function getMemberBadge(badgeKey?: string | null): MemberBadgeDef {
  if (!badgeKey) return MEMBER_BADGES.squire;
  const key = badgeKey.toLowerCase().trim().replace(/[\s-]+/g, "_");
  return MEMBER_BADGES[key] || MEMBER_BADGES.squire;
}
