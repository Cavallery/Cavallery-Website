"use client";

import { useRef, useState, useEffect } from "react";

interface GameFrameProps {
  src: string;
  title: string;
  slug?: string;
  showMusicToggle?: boolean;
}

export default function GameFrame({ src, title, slug, showMusicToggle }: GameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const getAvailableHeight = () => {
    if (wrapperRef.current) {
      return wrapperRef.current.getBoundingClientRect().height;
    }
    return window.innerHeight;
  };

  const toggleMusic = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const bgm = iframe.contentWindow?.document.getElementById("bgm") as HTMLAudioElement | null;
      if (bgm) {
        musicOn ? bgm.pause() : bgm.play();
        setMusicOn(!musicOn);
      }
    } catch {
      iframe.contentWindow?.postMessage({ type: "TOGGLE_MUSIC" }, "*");
      setMusicOn(!musicOn);
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data) return;
      const { type, score, playerName, username, gameId } = event.data;

      if (type === "GAME_OVER" || type === "GAME_SCORE_SUBMIT" || type === "SUBMIT_SCORE") {
        const finalName = playerName || username || "Pemain";
        const finalScore = Number(score);
        const targetSlug = slug || gameId || "grasshopper-collector";

        if (!isNaN(finalScore)) {
          try {
            const res = await fetch(`/api/games/${targetSlug}/leaderboard`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: finalName, score: finalScore }),
            });
            const result = await res.json();
            if (result.status) {
              setSavedToast(`✨ Skor ${finalScore} (${finalName}) tersimpan ke database!`);
              setTimeout(() => setSavedToast(null), 4000);
            }
          } catch (err) {
            console.error("Gagal simpan skor via GameFrame:", err);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [slug]);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%", minHeight: "600px" }}>
      {showMusicToggle && (
        <button
          onClick={toggleMusic}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 100,
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            fontSize: "13px",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <i className={`bx ${musicOn ? "bx-volume-full" : "bx-volume-mute"}`} style={{ fontSize: "16px" }} />
          {musicOn ? "Music On" : "Music Off"}
        </button>
      )}

      {savedToast && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            background: "linear-gradient(135deg, #ca8a04, #eab308)",
            color: "#000",
            fontWeight: 700,
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "0.88rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <i className="bx bxs-check-circle" style={{ fontSize: "18px" }} />
          {savedToast}
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        onLoad={(e) => {
          const iframe = e.currentTarget;
          const resize = () => {
            try {
              const body = iframe.contentWindow?.document.body;
              const html = iframe.contentWindow?.document.documentElement;
              if (body && html) {
                const contentHeight = Math.max(
                  body.scrollHeight,
                  body.offsetHeight,
                  html.scrollHeight,
                  html.offsetHeight
                );
                const available = getAvailableHeight();
                iframe.style.height = Math.max(contentHeight, available) + "px";
              }
            } catch {}
          };
          setTimeout(resize, 300);
          setTimeout(resize, 800);
          setTimeout(resize, 1500);
          setTimeout(resize, 3000);
        }}
      />
    </div>
  );
}
