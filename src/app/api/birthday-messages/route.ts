import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const MESSAGES_FILE_PATH = path.join(DATA_DIR, "birthday-messages.json");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz00qZ_yw_AgKUpHVIxRzENqFvgYHntwMgjlA2MvvgoORZQFm2MQwb2IlV2JVNmST95/exec";

function ensureDataDirectory() {
  try {
    const dir = path.dirname(MESSAGES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not ensure data directory:", e);
  }
}

function parseGoogleData(rawData: any): any[] {
  if (!Array.isArray(rawData)) return [];
  const list: any[] = [];

  rawData.forEach((row: any, index: number) => {
    if (!row) return;

    if (Array.isArray(row)) {
      const col0 = String(row[0] || "").toLowerCase();
      const col1 = String(row[1] || "").toLowerCase();
      if (col0.includes("timestamp") || col1.includes("nama") || col1 === "name") {
        return; // skip header row
      }

      const name = String(row[1] || row[0] || "").trim();
      const msg = String(row[2] || "").trim();
      const date = row[0] && !col0.includes("timestamp") ? row[0] : (row[3] || new Date().toISOString());

      if (name && msg) {
        list.push({
          id: index + 1,
          name,
          msg,
          date: String(date),
        });
      }
    } else if (typeof row === "object") {
      const name = String(row.Nama || row.nama || row.name || "").trim();
      const msg = String(row.pesan || row.Pesan || row.msg || row.message || "").trim();
      const date = row.Timestamp || row.timestamp || row.date || row.Date || new Date().toISOString();

      if (name && msg) {
        list.push({
          id: index + 1,
          name,
          msg,
          date: String(date),
        });
      }
    }
  });

  return list;
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const rawData = await res.json();
      const parsed = parseGoogleData(rawData);

      // Save exact mirror to local json
      ensureDataDirectory();
      try {
        fs.writeFileSync(MESSAGES_FILE_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      } catch {}

      return NextResponse.json(parsed, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }
  } catch (err) {
    console.error("Fetch from Google Apps Script failed, reading local mirror:", err);
  }

  // Fallback to local mirror
  try {
    ensureDataDirectory();
    if (fs.existsSync(MESSAGES_FILE_PATH)) {
      const content = fs.readFileSync(MESSAGES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return NextResponse.json(parsed);
      }
    }
  } catch {}

  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    let name = "";
    let msg = "";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("form-data")) {
      const formData = await request.formData();
      name = (formData.get("Nama") as string) || (formData.get("name") as string) || "Anonim";
      msg = (formData.get("pesan") as string) || (formData.get("msg") as string) || "";
    } else {
      const json = await request.json();
      name = json.name || json.Nama || "Anonim";
      msg = json.msg || json.pesan || "";
    }

    if (!msg.trim()) {
      return NextResponse.json({ status: false, message: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const newEntry = {
      id: Date.now(),
      name: name.trim(),
      msg: msg.trim(),
      date: new Date().toISOString(),
    };

    // Forward to Google Script
    try {
      const googleFormData = new FormData();
      googleFormData.append("Nama", newEntry.name);
      googleFormData.append("pesan", newEntry.msg);

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: googleFormData,
        redirect: "follow",
      }).catch((err) => console.error("Google sheet sync failed:", err));
    } catch (e) {
      console.error("Google sheet sync background setup error:", e);
    }

    return NextResponse.json({ status: true, data: newEntry });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
