"use client";

import { useEffect, useState } from "react";
import styles from "./YoutubeSection.module.css";

interface YtVideo {
  id: string;
  video_id: string;
  title: string;
  url: string;
  category: string;
  sort_order: string;
  is_active: boolean;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    total: number;
    limit: number;
    offset: number;
    categories: string[];
    videos: YtVideo[];
  };
}

const API_URL = "/api/youtube";

export default function YoutubeSection() {
  const [videos, setVideos] = useState<YtVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        let videoList: YtVideo[] = [];

        try {
          const res = await fetch(API_URL);
          if (res.ok) {
            const json = await res.json();
            const list = json.data?.videos || (Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
            if (Array.isArray(list) && list.length > 0) {
              videoList = list;
            }
          }
        } catch {}

        if (videoList.length === 0) {
          const extRes = await fetch("https://v5.jkt48connect.com/api/cavallery/youtube?apikey=JKTCONNECT");
          if (extRes.ok) {
            const extJson: ApiResponse = await extRes.json();
            if (extJson.status && extJson.data?.videos) {
              videoList = extJson.data.videos;
            }
          }
        }

        const activeVideos = videoList
          .filter((v) => v.is_active !== false && (v.is_active as any) !== 0)
          .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

        setVideos(activeVideos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className="badge">
            <i className="bx bxl-youtube" style={{ color: "#ff0000" }} /> YouTube JKT48
          </div>
          <h2 className={`sectionTitle textGold ${styles.title}`}>
            Featured Videos
          </h2>
          <p className={styles.subtitle}>
            Ikuti keseruan, vlog, show practice, serta momen terbaik Erine JKT48.
          </p>
        </div>

        <div className={styles.container}>
          {/* Loading state */}
          {loading && (
            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonThumb} />
                  <div className={styles.skeletonBody} />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className={styles.stateWrapper}>
              <i className="bx bx-error-circle" style={{ fontSize: 32, color: "#ff4444" }} />
              <p className={styles.stateText}>{error}</p>
              <button
                className={styles.retryBtn}
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Video Grid */}
          {!loading && !error && videos.length > 0 && (
            <div className={styles.grid}>
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`glassCard ${styles.card}`}
                >
                  <div className={styles.thumbnailWrapper}>
                    <img
                      src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                      alt={video.title}
                      className={styles.thumbnail}
                      loading="lazy"
                    />
                    <div className={styles.playOverlay}>
                      <div className={styles.playBtnCircle}>
                        <i className="bx bx-play" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.badge}>{video.category || "Video"}</span>
                      <span className={styles.ytTag}>
                        <i className="bx bxl-youtube" /> YouTube
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{video.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && videos.length === 0 && (
            <div className={styles.stateWrapper}>
              <i className="bx bx-video-off" style={{ fontSize: 32 }} />
              <p className={styles.stateText}>Tidak ada video tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
