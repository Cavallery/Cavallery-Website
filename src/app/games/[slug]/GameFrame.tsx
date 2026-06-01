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
      style={{ width: "100%", border: "none", display: "block" }}
      onLoad={(e) => {
        const iframe = e.currentTarget;
        try {
          const height = iframe.contentWindow?.document.body.scrollHeight;
          if (height && height > 0) {
            iframe.style.height = height + "px";
          } else {
            iframe.style.height = "100vh";
          }
        } catch {
          iframe.style.height = "100vh";
        }
      }}
    />
  );
}
