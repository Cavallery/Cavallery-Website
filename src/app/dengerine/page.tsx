"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music2, ExternalLink, X, Heart, Search, Headphones } from "lucide-react";
import styles from "./page.module.css";
import { DENGERINE_SONGS, type DengerineSong, type SongType } from "@/data/dengerine-data";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<SongType, string> = {
  Cover:    "#1db954",
  Original: "#b45309",
  Acoustic: "#60a5fa",
  Remix:    "#a78bfa",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function durationToSeconds(d?: string) {
  if (!d) return 0;
  const [m, s] = d.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

// ─── SPOTIFY EMBED ────────────────────────────────────────────────────────────
function SpotifyPlayer({ trackId, compact = false }: { trackId: string; compact?: boolean }) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
      width="100%"
      height={compact ? "80" : "152"}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      style={{ borderRadius: compact ? 8 : 12, display: "block" }}
      title="Spotify Player"
    />
  );
}

// ─── SONG ROW (Spotify list style) ───────────────────────────────────────────
interface SongRowProps {
  song: DengerineSong;
  index: number;
  isActive: boolean;
  onSelect: (song: DengerineSong) => void;
  liked: boolean;
  onLike: (id: string) => void;
}

function SongRow({ song, index, isActive, onSelect, liked, onLike }: SongRowProps) {
  const color = TYPE_COLORS[song.type];

  return (
    <motion.div
      className={`${styles.songRow} ${isActive ? styles.songRowActive : ""}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onClick={() => onSelect(song)}
    >
      {/* Index / Play indicator */}
      <div className={styles.rowIndex}>
        {isActive ? (
          <motion.div
            className={styles.equalizerBars}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <span style={{ background: color }} />
            <span style={{ background: color }} />
            <span style={{ background: color }} />
          </motion.div>
        ) : (
          <span className={styles.indexNum}>{index + 1}</span>
        )}
        <div className={styles.rowPlayBtn} style={{ background: color }}>
          {isActive ? <Pause size={14} fill="white" color="white" /> : <Play size={14} fill="white" color="white" />}
        </div>
      </div>

      {/* Cover art */}
      <div className={styles.rowCover}>
        {song.coverArt ? (
          <img src={song.coverArt} alt={song.title} />
        ) : (
          <div className={styles.rowCoverPlaceholder} style={{ background: `${color}20` }}>
            <Music2 size={18} color={color} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.rowInfo}>
        <div className={styles.rowTitle} style={isActive ? { color } : undefined}>{song.title}</div>
        <div className={styles.rowCreator}>
          <span className={styles.fanChip}>Fan-made</span>
          {song.creator}
          {song.creatorHandle && (
            <a
              href={song.creatorUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className={styles.rowHandle}
              onClick={e => e.stopPropagation()}
            >
              {song.creatorHandle} <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Type badge */}
      <div className={styles.rowType}>
        <span className={styles.typePill} style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
          {song.type}
        </span>
      </div>

      {/* Tags (hidden on small) */}
      <div className={styles.rowTags}>
        {song.tags?.slice(0, 2).map(t => (
          <span key={t} className={styles.tag}>{t}</span>
        ))}
      </div>

      {/* Duration */}
      <div className={styles.rowDuration}>{song.duration || "—"}</div>

      {/* Like */}
      <button
        className={`${styles.rowLike} ${liked ? styles.rowLikeActive : ""}`}
        onClick={e => { e.stopPropagation(); onLike(song.id); }}
        aria-label="Suka"
      >
        <Heart size={15} fill={liked ? "#e11d48" : "none"} color={liked ? "#e11d48" : "currentColor"} />
      </button>
    </motion.div>
  );
}

// ─── SKELETON ROW ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonBox} style={{ width: 32, height: 32, borderRadius: 6 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className={styles.skeletonBox} style={{ width: "40%", height: 13 }} />
        <div className={styles.skeletonBox} style={{ width: "60%", height: 10 }} />
      </div>
      <div className={styles.skeletonBox} style={{ width: 60, height: 13 }} />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const ALL_TYPES: (SongType | "All")[] = ["All", "Cover", "Original", "Acoustic", "Remix"];

export default function DengerinePage() {
  const [loading, setLoading]           = useState(true);
  const [songs, setSongs]               = useState<DengerineSong[]>([]);
  const [activeSong, setActiveSong]     = useState<DengerineSong | null>(null);
  const [likedIds, setLikedIds]         = useState<Set<string>>(new Set());
  const [search, setSearch]             = useState("");
  const [activeType, setActiveType]     = useState<SongType | "All">("All");

  useEffect(() => {
    async function loadSongs() {
      try {
        const res = await fetch("/api/dengerine");
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setSongs(json.data);
          setActiveSong(json.data[0]); // auto-select first song
        } else {
          setSongs(DENGERINE_SONGS);
          if (DENGERINE_SONGS.length > 0) setActiveSong(DENGERINE_SONGS[0]);
        }
      } catch {
        setSongs(DENGERINE_SONGS);
        if (DENGERINE_SONGS.length > 0) setActiveSong(DENGERINE_SONGS[0]);
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, []);

  const toggleLike = (id: string) =>
    setLikedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = songs.filter(s => {
    const matchType = activeType === "All" || s.type === activeType;
    const q = search.toLowerCase();
    return matchType && (!q || s.title.toLowerCase().includes(q) || s.creator.toLowerCase().includes(q) || (s.tags||[]).some(t => t.toLowerCase().includes(q)));
  });

  return (
    <div className={styles.page}>

      {/* ─── HERO / HEADER ─── */}
      <div className={styles.heroWrap}>
        <div className={styles.heroBg} />
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Playlist art */}
          <div className={styles.heroArt}>
            <div className={styles.heroArtInner}>
              <Music2 size={64} color="#1db954" strokeWidth={1.2} />
              <motion.div
                className={styles.heroArtRing}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Meta */}
          <div className={styles.heroMeta}>
            <div className={styles.heroType}>Playlist Komunitas · Fan-made</div>
            <h1 className={styles.heroTitle}>dengerine</h1>
            <p className={styles.heroDesc}>
              Arsip lagu cover &amp; orisinal dari komunitas fans untuk Erine.
            </p>
            <div className={styles.heroStats}>
              <span><strong>{loading ? "—" : songs.length}</strong> lagu</span>
              <span>•</span>
              <span><strong>{loading ? "—" : new Set(songs.map(s => s.creator)).size}</strong> kreator</span>
              <span>•</span>
              <span>100% fan-made</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── STICKY PLAYER (shows active song) ─── */}
      <AnimatePresence>
        {activeSong && (
          <motion.div
            className={styles.stickyPlayer}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.stickyPlayerInner}>
              {/* Now playing info */}
              <div className={styles.nowPlayingInfo}>
                <div className={styles.nowPlayingDot} />
                <div>
                  <div className={styles.nowPlayingTitle}>{activeSong.title}</div>
                  <div className={styles.nowPlayingCreator}>{activeSong.creator}</div>
                </div>
                <button className={styles.closePlayerBtn} onClick={() => setActiveSong(null)}>
                  <X size={16} />
                </button>
              </div>

              {/* Spotify embed */}
              <div className={styles.stickyEmbed}>
                {activeSong.spotifyTrackId ? (
                  <SpotifyPlayer trackId={activeSong.spotifyTrackId} compact />
                ) : activeSong.audioUrl ? (
                  <audio controls src={activeSong.audioUrl} style={{ width: "100%", height: 40 }} />
                ) : (
                  <div className={styles.noPlayerSmall}>
                    <Headphones size={16} />
                    <span>Player belum tersedia</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CONTENT ─── */}
      <div className={styles.content}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Cari lagu atau kreator..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterRow}>
            {ALL_TYPES.map(t => (
              <button
                key={t}
                className={`${styles.filterBtn} ${activeType === t ? styles.filterActive : ""}`}
                onClick={() => setActiveType(t)}
                style={
                  activeType === t && t !== "All"
                    ? { color: TYPE_COLORS[t as SongType], borderColor: `${TYPE_COLORS[t as SongType]}60`, background: `${TYPE_COLORS[t as SongType]}14` }
                    : undefined
                }
              >
                {t === "All" ? "Semua" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Song list header */}
        <div className={styles.listHeader}>
          <span className={styles.listHeaderNum}>#</span>
          <span />
          <span>Judul</span>
          <span>Tipe</span>
          <span className={styles.hideMobile}>Genre</span>
          <span>Durasi</span>
          <span />
        </div>

        <div className={styles.listDivider} />

        {/* Song rows */}
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          : filtered.length === 0
          ? (
            <div className={styles.empty}>
              <Music2 size={40} color="var(--fg-dim)" strokeWidth={1.2} />
              <p>Tidak ada lagu ditemukan.</p>
            </div>
          )
          : filtered.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              isActive={activeSong?.id === song.id}
              onSelect={setActiveSong}
              liked={likedIds.has(song.id)}
              onLike={toggleLike}
            />
          ))
        }

        {/* Full Spotify embed for active song (below list) */}
        <AnimatePresence mode="wait">
          {activeSong?.spotifyTrackId && (
            <motion.div
              key={activeSong.id}
              className={styles.fullEmbed}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.fullEmbedHeader}>
                <Music2 size={16} color="#1db954" />
                <span>Dengarkan di Spotify</span>
              </div>
              <SpotifyPlayer trackId={activeSong.spotifyTrackId} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          className={styles.ctaBox}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <i className="bx bxs-music" style={{ fontSize: "2rem", color: "#1db954" }} />
          <h3 className={styles.ctaTitle}>Punya lagu untuk Erine?</h3>
          <p className={styles.ctaSub}>Kirimkan karya cover atau lagu orisinalmu ke admin Cavallery untuk ditampilkan di sini.</p>
          <a href="https://twitter.com/cavallery_id" target="_blank" rel="noreferrer" className={styles.ctaBtn}>
            <i className="bx bxl-twitter" /> Hubungi Admin Cavallery
          </a>
        </motion.div>
      </div>
    </div>
  );
}
