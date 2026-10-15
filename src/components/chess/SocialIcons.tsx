import type { ReactNode } from "react";

export interface SocialLink {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
}

const svgProps = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  "aria-hidden": true,
  focusable: "false" as const,
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: "x",
    label: "X (Twitter)",
    href: "https://x.com/CErine_JKT48",
    icon: (
      <svg {...svgProps} viewBox="0 0 16 16">
        <path
          fill="currentColor"
          d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"
        />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/jkt48.erine/",
    icon: (
      <svg {...svgProps} fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@jkt48.erine_",
    icon: (
      <svg {...svgProps}>
        <path
          fill="currentColor"
          d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
        />
      </svg>
    ),
  },
  {
    key: "whatsapp",
    label: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029VbAQsPj35fLwVgznp12S",
    icon: (
      <svg {...svgProps} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
        <path d="M3.6 20.4l1.25-4.1A8.6 8.6 0 1 1 8 19.4z" />
        <path
          fill="currentColor"
          stroke="none"
          d="M9.1 7.6c.25-.02.5.03.62.33l.62 1.5c.08.2.04.44-.1.6l-.5.6c-.12.15-.13.36-.02.52.66 1.02 1.52 1.83 2.6 2.4.17.09.38.05.5-.1l.58-.7c.15-.18.4-.24.62-.14l1.5.68c.27.12.4.42.33.7-.22.92-1.05 1.6-2 1.55-3.05-.17-5.62-2.66-5.9-5.7-.08-.98.6-1.86 1.55-2.04z"
        />
      </svg>
    ),
  },
  {
    key: "linktree",
    label: "Linktree",
    href: "http://linktr.ee/cavallery",
    icon: (
      <svg {...svgProps}>
        <path
          fill="currentColor"
          d="M13.74 5.85l4-4.12 2.33 2.38-4.2 4h5.9v3.31h-5.93l4.22 4.1-2.32 2.34-5.74-5.77-5.74 5.77-2.33-2.33 4.23-4.1H2.23V8.12h5.9l-4.2-4 2.33-2.39 4 4.12V0h3.48zm-3.47 10.3h3.47V24h-3.47z"
        />
      </svg>
    ),
  },
];
