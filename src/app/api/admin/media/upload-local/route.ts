import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const VALLZY_UPLOAD_URL = "https://v5.jkt48connect.com/api/cavallery/media/upload?apikey=JKTCONNECT";
const MAPPING_FILE_PATH = path.join(process.cwd(), "src", "data", "video-cdn-mapping.json");

export async function GET() {
  const filesToUpload = [
    { key: "homepageTeaser", filename: "homepage-vt.mp4", relPath: "assets/homepage-vt.mp4" },
    { key: "splashLogo", filename: "keying-logo-center.mp4", relPath: "assets/keying-logo-center.mp4" },
    { key: "prologScene", filename: "prolog-scene.mp4", relPath: "assets/prolog-scene.mp4" },
    { key: "videotronRatplaz", filename: "videotron-ratplaz.mp4", relPath: "assets/Video Tron Ratplaz Erine.mp4" },
    { key: "videoLapak", filename: "video-lapak.mp4", relPath: "assets/video-lapak.mp4" },
    { key: "jikorineAudio", filename: "jikorine1.mp4", relPath: "audio/jikorine1.mp4" },
  ];

  let mapping: Record<string, string> = {};
  if (fs.existsSync(MAPPING_FILE_PATH)) {
    try {
      mapping = JSON.parse(fs.readFileSync(MAPPING_FILE_PATH, "utf-8"));
    } catch {}
  }

  const results: any[] = [];

  for (const item of filesToUpload) {
    // If already uploaded to images.jkt48connect.com, skip
    if (mapping[item.key] && mapping[item.key].includes("images.jkt48connect.com")) {
      results.push({
        key: item.key,
        status: "already_uploaded",
        public_url: mapping[item.key],
      });
      continue;
    }

    const fullPath = path.join(process.cwd(), "public", item.relPath);
    if (!fs.existsSync(fullPath)) {
      results.push({
        key: item.key,
        status: "local_file_not_found",
        path: item.relPath,
      });
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(fullPath);
      const blob = new Blob([fileBuffer], { type: "video/mp4" });
      const fd = new FormData();
      fd.append("file", blob, item.filename);
      fd.append("folder", "cavallery/videos");
      fd.append("alt_text", item.filename);

      const res = await fetch(VALLZY_UPLOAD_URL, {
        method: "POST",
        body: fd,
        signal: AbortSignal.timeout(30000), // 30s timeout for large video upload
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data && json.data.public_url) {
          mapping[item.key] = json.data.public_url;
          results.push({
            key: item.key,
            status: "success",
            public_url: json.data.public_url,
          });
        } else {
          results.push({
            key: item.key,
            status: "api_error",
            response: json,
          });
        }
      } else {
        results.push({
          key: item.key,
          status: "http_error",
          httpStatus: res.status,
        });
      }
    } catch (err: any) {
      results.push({
        key: item.key,
        status: "exception",
        error: err?.message || err,
      });
    }
  }

  // Save mapping to file
  try {
    fs.writeFileSync(MAPPING_FILE_PATH, JSON.stringify(mapping, null, 2), "utf-8");
  } catch (err: any) {
    console.error("Failed to write mapping file:", err?.message || err);
  }

  return NextResponse.json({
    success: true,
    message: "Proses upload video lokal ke server media Vallzy selesai",
    mapping,
    results,
  });
}
