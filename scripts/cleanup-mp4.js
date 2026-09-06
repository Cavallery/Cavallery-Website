const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = [
  "public/assets/homepage-vt.mp4",
  "public/assets/keying-logo-center.mp4",
  "public/assets/logo-center-portrait.mp4",
  "public/assets/prolog-scene.mp4",
  "public/assets/Video Tron Ratplaz Erine.mp4",
  "public/assets/video-1.mp4",
  "public/assets/video-2.mp4",
  "public/assets/video-4.mp4",
  "public/assets/video-lapak.mp4",
  "public/assets/video-sts.mp4",
  "public/audio/jikorine1.mp4",
  "public/audio/jikorine2.mp4",
];

let deletedCount = 0;
let freedBytes = 0;

for (const rel of files) {
  const full = path.join(root, rel);
  if (fs.existsSync(full)) {
    try {
      const stats = fs.statSync(full);
      freedBytes += stats.size;
      fs.unlinkSync(full);
      console.log(`[DELETED] ${rel} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      deletedCount++;
    } catch (e) {
      console.error(`[ERROR] Gagal hapus ${rel}:`, e.message);
    }
  } else {
    console.log(`[NOT FOUND] ${rel}`);
  }
}

console.log(`\nSelesai! Berhasil menghapus ${deletedCount} file MP4. Menghemat ${(freedBytes / 1024 / 1024).toFixed(2)} MB.`);
