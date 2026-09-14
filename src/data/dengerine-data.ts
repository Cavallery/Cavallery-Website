// ─── DENGERINE DATA ──────────────────────────────────────────────────────────
// Arsip lagu cover & orisinal karya komunitas fans untuk Erine (JKT48)
// Tambah lagu baru cukup dengan push object baru ke array DENGERINE_SONGS

export type SongType = "Cover" | "Original" | "Acoustic" | "Remix";

export interface DengerineSong {
  id: string;
  title: string;
  creator: string;
  creatorHandle?: string;        // @username atau link medsos
  creatorUrl?: string;           // URL ke profil kreator
  type: SongType;
  coverArt?: string;             // URL cover art
  description?: string;
  spotifyTrackId?: string;       // Spotify track ID (bukan URL lengkap)
  youtubeId?: string;            // YouTube video ID
  audioUrl?: string;             // Direct audio URL (mp3/ogg)
  duration?: string;             // "3:24"
  year?: number;
  tags?: string[];
}

export const DENGERINE_SONGS: DengerineSong[] = [
  {
    id: "dengerine-001",
    title: "Cavallery Love for Erine",
    creator: "Komunitas Cavallery",
    creatorHandle: "@cavallery_id",
    creatorUrl: "https://twitter.com/cavallery_id",
    type: "Cover",
    description:
      "Lagu spesial karya komunitas Cavallery yang dipersembahkan sepenuh hati untuk Catherina Vallencia (Erine). Dengerin sekarang di Spotify!",
    spotifyTrackId: "2hDAoL55QcEk1DuGkvuWDU",
    duration: "3:30",
    year: 2026,
    tags: ["Ballad", "Tribute", "Cavallery"],
  },
];

export default DENGERINE_SONGS;
