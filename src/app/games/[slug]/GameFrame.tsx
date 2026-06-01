"use client";

import { useRef, useState } from "react";

interface GameFrameProps {
  src: string;
  title: string;
  showMusicToggle?: boolean;
}

export default function GameFrame({ src, title, showMusicToggle }: GameFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [musicOn, setMusicOn] = useState(true);

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
      // fallback postMessage
      iframe.contentWindow?.postMessage({ type: "TOGGLE_MUSIC" }, "*");
      setMusicOn(!musicOn);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}
