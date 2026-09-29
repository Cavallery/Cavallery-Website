"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "./LiveNowCard.module.css";

export type LivePlatform = "idn" | "showroom";

export interface LiveStreamDetail {
  platform: LivePlatform;
  url: string;
  viewers?: number | string;
  startedAt?: string | number | Date;
}

export interface LiveNowCardProps {
  name: string;
  nickname?: string;
  avatarUrl?: string;
  lives: LiveStreamDetail[];
}

export interface LiveOfflineCardProps {
  name?: string;
  nickname?: string;
  avatarUrl?: string;
  idnUrl?: string;
  showroomUrl?: string;
  notice?: string;
}

/**
 * Format timestamp / ISO date to elapsed duration:
 * "Baru saja dimulai", "Sudah 45 menit", "Sudah 1 jam 12 menit"
 */
function formatLiveDuration(startedAt?: string | number | Date, nowMs: number = Date.now()): string | null {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  if (isNaN(start) || start <= 0) return null;

  const diffMs = Math.max(0, nowMs - start);
  const totalMinutes = Math.floor(diffMs / 60000);

  if (totalMinutes < 1) {
    return "Baru saja dimulai";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `Sudah ${minutes} menit`;
  }

  if (minutes === 0) {
    return `Sudah ${hours} jam`;
  }

  return `Sudah ${hours} jam ${minutes} menit`;
}

/**
 * Format viewer count to Indonesian locale string (e.g. 1770 -> 1.770)
 */
function formatViewerCount(viewers?: number | string): string | null {
  if (viewers === undefined || viewers === null || viewers === "") return null;
  const num = typeof viewers === "number" ? viewers : parseInt(String(viewers).replace(/\D/g, ""), 10);
  if (isNaN(num) || num <= 0) return null;
  return num.toLocaleString("id-ID");
}

/**
 * LiveNowCard Component (Desktop & Mobile Redesign)
 */
export function LiveNowCard({ name, nickname, avatarUrl, lives }: LiveNowCardProps) {
  // Return null if lives is empty
  if (!lives || lives.length === 0) {
    return null;
  }

  // Update live duration every 30 seconds
  const [nowMs, setNowMs] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute total viewers across active streams for this member
  const totalViewers = useMemo(() => {
    let total = 0;
    let hasAny = false;
    for (const l of lives) {
      if (l.viewers !== undefined && l.viewers !== null && l.viewers !== "") {
        const num = typeof l.viewers === "number" ? l.viewers : parseInt(String(l.viewers).replace(/\D/g, ""), 10);
        if (!isNaN(num) && num > 0) {
          total += num;
          hasAny = true;
        }
      }
    }
    return hasAny ? total : null;
  }, [lives]);

  const defaultAvatar = "/images/cava-logo.jpg";
  const displayAvatar = avatarUrl || defaultAvatar;

  return (
    <article
      className={styles.liveCard}
      aria-label={`Siaran langsung ${name}${nickname ? ` (${nickname})` : ""}`}
    >
      <div className={styles.cardGlowAmbient} aria-hidden="true" />

      {/* ── BARIS ATAS: AVATAR & INFO MEMBER ── */}
      <div className={styles.topRow}>
        {/* Avatar Bulat 76px dengan Badge LIVE Merah */}
        <div className={styles.avatarContainer}>
          <img
            src={displayAvatar}
            alt={`Foto profil ${name}`}
            className={styles.avatarImg}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultAvatar;
            }}
          />
          <span className={styles.liveBadge} aria-label="Status siaran langsung">
            LIVE
          </span>
        </div>

        {/* Info Member & Platform */}
        <div className={styles.memberInfo}>
          <div className={styles.memberNameRow}>
            <h3 className={styles.memberName}>
              {name}
              {nickname && (
                <>{" "}<span className={styles.nickname}>({nickname})</span></>
              )}
            </h3>
          </div>

          <div className={styles.metaRow}>
            {/* Chips Platform Aktif */}
            <div className={styles.platformChipsGroup}>
              {lives.map((l, idx) => {
                const isIdn = l.platform === "idn";
                return (
                  <span
                    key={`${l.platform}-${idx}`}
                    className={`${styles.platformChip} ${
                      isIdn ? styles.platformChipIdn : styles.platformChipShowroom
                    }`}
                  >
                    <span className={styles.redDotPulse} aria-hidden="true" />
                    {isIdn ? "IDN Live" : "Showroom"}
                  </span>
                );
              })}
            </div>

            {/* Total Penonton */}
            {totalViewers !== null && (
              <span className={styles.totalViewersText}>
                <i className="bx bx-user" aria-hidden="true" />
                {totalViewers.toLocaleString("id-ID")} orang menonton sekarang
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── BARIS BAWAH: TOMBOL AKSI PER PLATFORM ── */}
      <div
        className={`${styles.actionButtonsRow} ${
          lives.length > 1 ? styles.actionButtonsDual : styles.actionButtonsSingle
        }`}
      >
        {lives.map((l, idx) => {
          const isIdn = l.platform === "idn";
          const platformLabel = isIdn ? "IDN Live" : "Showroom";
          const formattedViewers = formatViewerCount(l.viewers);
          const formattedDuration = formatLiveDuration(l.startedAt, nowMs);

          return (
            <a
              key={`${l.platform}-${idx}`}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.liveActionBtn} ${
                isIdn ? styles.btnIdn : styles.btnShowroom
              }`}
              aria-label={`Tonton siaran di ${platformLabel}`}
            >
              <div className={styles.btnLeftInfo}>
                <div className={styles.btnLabelRow}>
                  <i
                    className={`bx ${
                      isIdn ? "bx-video " + styles.btnIconIdn : "bx-broadcast " + styles.btnIconShowroom
                    }`}
                    aria-hidden="true"
                  />
                  <span>Tonton di {platformLabel}</span>
                </div>

                {(formattedViewers || formattedDuration) && (
                  <div className={styles.btnMetaRow}>
                    {formattedViewers && (
                      <span>{formattedViewers} penonton</span>
                    )}
                    {formattedViewers && formattedDuration && (
                      <span className={styles.btnMetaDot} aria-hidden="true">&bull;</span>
                    )}
                    {formattedDuration && (
                      <span>{formattedDuration}</span>
                    )}
                  </div>
                )}
              </div>

              <i className={`bx bx-right-arrow-alt ${styles.btnArrow}`} aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </article>
  );
}

/**
 * LiveNowList: Menampilkan daftar member yang sedang live
 */
export function LiveNowList({ members }: { members: LiveNowCardProps[] }) {
  if (!members || members.length === 0) {
    return null;
  }

  return (
    <div className={styles.liveCardWrapper}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {members.map((member, i) => (
          <LiveNowCard key={`${member.name}-${i}`} {...member} />
        ))}
      </div>
    </div>
  );
}

/**
 * LiveOfflineCard: Tampilan saat Erine / member sedang tidak siaran langsung
 */
export function LiveOfflineCard({
  name = "Catherina Vallencia",
  nickname = "Erine",
  avatarUrl = "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg",
  idnUrl = "https://www.idn.app/jkt48_erine",
  showroomUrl = "https://www.showroom-live.com/r/JKT48_Erine",
  notice = "Saat ini Erine belum melangsungkan siaran langsung. Kamu bisa mengikuti dan menyalakan lonceng notifikasi di kanal resmi berikut agar tidak tertinggal saat siaran dimulai:",
}: LiveOfflineCardProps) {
  const defaultAvatar = "/images/cava-logo.jpg";

  return (
    <article
      className={styles.offlineCard}
      aria-label={`${name} sedang offline`}
    >
      <div className={styles.cardGlowAmbient} aria-hidden="true" />

      <div className={styles.topRow}>
        <div className={styles.avatarContainer}>
          <img
            src={avatarUrl || defaultAvatar}
            alt={`Foto profil ${name}`}
            className={styles.avatarImg}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultAvatar;
            }}
          />
          <span className={styles.liveBadgeOffline}>OFFLINE</span>
        </div>

        <div className={styles.memberInfo}>
          <div className={styles.memberNameRow}>
            <h3 className={styles.memberName}>
              {name}
              {nickname && (
                <>{" "}<span className={styles.nickname}>({nickname})</span></>
              )}
            </h3>
          </div>

          <div className={styles.offlineStatusPill}>
            <span className={styles.offlineDot} aria-hidden="true" />
            <span>Sedang tidak siaran langsung</span>
          </div>
        </div>
      </div>

      <p className={styles.offlineNotice}>{notice}</p>

      <div className={styles.offlineChannelsGrid}>
        <a
          href={idnUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.offlineChannelBtn}
          aria-label="Kunjungi kanal resmi IDN Live Erine"
        >
          <i className={`bx bx-video ${styles.offlineChannelIcon}`} aria-hidden="true" />
          <div>
            <h4 className={styles.offlineChannelTitle}>IDN Live Erine</h4>
            <p className={styles.offlineChannelSub}>@jkt48_erine &bull; Live interaktif rutin</p>
          </div>
        </a>

        <a
          href={showroomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.offlineChannelBtn}
          aria-label="Kunjungi ruang siaran resmi Showroom Erine"
        >
          <i className={`bx bx-broadcast ${styles.offlineChannelIcon}`} style={{ color: "var(--live-teal)" }} aria-hidden="true" />
          <div>
            <h4 className={styles.offlineChannelTitle}>Showroom Erine</h4>
            <p className={styles.offlineChannelSub}>JKT48_Erine &bull; Ruang siaran resmi SHOWROOM</p>
          </div>
        </a>
      </div>
    </article>
  );
}

/**
 * Mapper helper:
 * Mengubah respons API JKT48 (/api/live atau JKT48 Connect) ke format props LiveNowCardProps[]
 * Mendukung grouping jika 1 member live di 2 platform sekaligus (IDN + Showroom)!
 */
export function mapApiToLiveCardProps(apiItems: any[]): LiveNowCardProps[] {
  if (!Array.isArray(apiItems) || apiItems.length === 0) {
    return [];
  }

  const memberMap = new Map<string, LiveNowCardProps>();

  for (const item of apiItems) {
    if (!item) continue;

    // Detect member name and nickname
    const rawName: string =
      item.name ??
      item.member_name ??
      item.member?.name ??
      item.username ??
      "Catherina Vallencia (Erine)";

    let name = rawName;
    let nickname = item.nickname ?? item.member?.nickname ?? "";

    // Parse "Name (Nickname)" pattern if nickname not separated
    const match = rawName.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      name = match[1].trim();
      if (!nickname) nickname = match[2].trim();
    } else if (!nickname && (rawName.toLowerCase().includes("erine") || item.is_erine)) {
      nickname = "Erine";
    }

    // Normalized member key for grouping IDN + Showroom
    const memberKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Detect platform
    const rawType = (
      item.type ??
      item.platform ??
      ""
    ).toLowerCase();
    const platform: LivePlatform = rawType.includes("showroom") ? "showroom" : "idn";

    // Detect image URL
    const avatarUrl =
      item.img ??
      item.image ??
      item.avatar ??
      item.member?.img ??
      item.member?.image ??
      "https://images.jkt48connect.com/cavallery/images/2026/09/cf207d2f32384a39.jpg";

    // Detect direct URL
    const username = item.url_key ?? item.idn?.username ?? "jkt48_erine";
    const slug = item.slug ?? item.idn?.slug ?? "";
    const directUrl =
      item.url && item.url !== "#" && item.url.includes("/live/")
        ? item.url
        : platform === "showroom"
          ? (item.url_key ? `https://www.showroom-live.com/r/${item.url_key}` : "https://www.showroom-live.com/r/JKT48_Erine")
          : slug
            ? `https://www.idn.app/${username}/live/${slug}`
            : item.url || `https://www.idn.app/${username}`;

    // Detect viewers
    const viewers =
      item.viewers ??
      item.viewer ??
      item.viewers_count ??
      item.live_info?.viewers?.num ??
      item.users ??
      undefined;

    // Detect startedAt
    const startedAt =
      item.started_at ??
      item.live_at ??
      item.live_info?.date?.start ??
      undefined;

    const streamDetail: LiveStreamDetail = {
      platform,
      url: directUrl,
      viewers,
      startedAt,
    };

    if (memberMap.has(memberKey)) {
      const existing = memberMap.get(memberKey)!;
      // Prevent duplicate platform entries
      if (!existing.lives.some((l) => l.platform === platform)) {
        existing.lives.push(streamDetail);
      }
    } else {
      memberMap.set(memberKey, {
        name,
        nickname: nickname || undefined,
        avatarUrl,
        lives: [streamDetail],
      });
    }
  }

  return Array.from(memberMap.values());
}

export default LiveNowCard;
