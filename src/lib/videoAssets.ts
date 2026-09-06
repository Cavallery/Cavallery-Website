// ============================================================
// CAVALLERY VIDEO & MEDIA ASSETS
// Uses remote CDN URLs (cava.jkt48connect.com)
// All local MP4 assets removed to prevent 504 Gateway Timeout
// ============================================================
import cdnMapping from "@/data/video-cdn-mapping.json";

const mapping = (cdnMapping || {}) as Record<string, string>;

export const VIDEO_URLS = {
  homepageTeaser:
    process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_URL ||
    mapping.homepageTeaser ||
    "https://cava.jkt48connect.com/homepage-vt.mp4",

  splashLogo:
    process.env.NEXT_PUBLIC_SPLASH_VIDEO_URL ||
    mapping.splashLogo ||
    "https://cava.jkt48connect.com/keying-logo-center.mp4",

  erineGame:
    process.env.NEXT_PUBLIC_GAME_VIDEO_URL ||
    mapping.erineGame ||
    "https://cava.jkt48connect.com/erine-game.mp4",

  prologScene:
    mapping.prologScene ||
    "https://cava.jkt48connect.com/prolog-scene.mp4",

  videotronRatplaz:
    mapping.videotronRatplaz ||
    "https://cava.jkt48connect.com/videotron-ratplaz.mp4",

  videoLapak:
    mapping.videoLapak ||
    "https://cava.jkt48connect.com/video-lapak.mp4",

  jikorineAudio:
    mapping.jikorineAudio ||
    "https://cava.jkt48connect.com/audio/jikorine1.mp4",
};
