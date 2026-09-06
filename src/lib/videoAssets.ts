// ============================================================
// CAVALLERY VIDEO & MEDIA ASSETS
// Uses Vallzy media server URLs (images.jkt48connect.com)
// with safe local fallbacks to ensure videos ALWAYS play
// ============================================================
import cdnMapping from "@/data/video-cdn-mapping.json";

const mapping = (cdnMapping || {}) as Record<string, string>;

export const VIDEO_URLS = {
  homepageTeaser:
    process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_URL ||
    (mapping.homepageTeaser && mapping.homepageTeaser.length > 0 ? mapping.homepageTeaser : "/assets/homepage-vt.mp4"),

  splashLogo:
    process.env.NEXT_PUBLIC_SPLASH_VIDEO_URL ||
    (mapping.splashLogo && mapping.splashLogo.length > 0 ? mapping.splashLogo : "/assets/keying-logo-center.mp4"),

  erineGame:
    process.env.NEXT_PUBLIC_GAME_VIDEO_URL ||
    (mapping.erineGame && mapping.erineGame.length > 0 ? mapping.erineGame : "https://cava.jkt48connect.com/erine-game.mp4"),

  prologScene:
    mapping.prologScene && mapping.prologScene.length > 0 ? mapping.prologScene : "/assets/prolog-scene.mp4",

  videotronRatplaz:
    mapping.videotronRatplaz && mapping.videotronRatplaz.length > 0 ? mapping.videotronRatplaz : "/assets/Video Tron Ratplaz Erine.mp4",

  videoLapak:
    mapping.videoLapak && mapping.videoLapak.length > 0 ? mapping.videoLapak : "/assets/video-lapak.mp4",

  jikorineAudio:
    mapping.jikorineAudio && mapping.jikorineAudio.length > 0 ? mapping.jikorineAudio : "/audio/jikorine1.mp4",
};
