"use client";

interface GameFrameProps {
  src: string;
  title: string;
}

export default function GameFrame({ src, title }: GameFrameProps) {
  return (
    <iframe
      src={src}
      title={title}
      allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      onLoad={(e) => {
        const iframe = e.currentTarget;
        // Tunggu konten game selesai render
        setTimeout(() => {
          try {
            const body = iframe.contentWindow?.document.body;
            const html = iframe.contentWindow?.document.documentElement;
            if (body && html) {
              const height = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.scrollHeight,
                html.offsetHeight
              );
              if (height > window.innerHeight) {
                iframe.style.height = height + "px";
              }
            }
          } catch {
            // cross-origin fallback
          }
        }, 500);
      }}
    />
  );
}
