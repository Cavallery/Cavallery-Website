import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const JOURNAL_FILE_PATH = path.join(DATA_DIR, "journal.json");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiiUkBqWpRrYSDkC-6RKZ_mFxPAWB2uydW_hxaYWL0tr-o_GwrJ6b4zt_Goj9gFeen/exec";

// Ensure data folder exists
function ensureDataDirectory() {
  const dir = path.dirname(JOURNAL_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read from JSON file, initializing from Google Sheet if empty/non-existent
async function readJournalData() {
  ensureDataDirectory();
  if (fs.existsSync(JOURNAL_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(JOURNAL_FILE_PATH, "utf-8");
      return JSON.parse(fileContent);
    } catch (e) {
      console.error("Error reading journal.json:", e);
    }
  }

  // Fallback to fetch from Google Sheet and populate
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    const rawData = await res.json();
    const formatted = rawData.map((row: any, index: number) => ({
      id: index + 1,
      name: row[1] || "Anonim",
      msg: row[2] || "",
      date: row[3] || new Date().toISOString()
    }));
    fs.writeFileSync(JOURNAL_FILE_PATH, JSON.stringify(formatted, null, 2), "utf-8");
    return formatted;
  } catch (e) {
    console.error("Error initializing journal data from Google Sheet:", e);
    return [];
  }
}

// Write to JSON file
function writeJournalData(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(JOURNAL_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = await readJournalData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    let name = "";
    let msg = "";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("form-data")) {
      const formData = await request.formData();
      name = (formData.get("Nama") as string) || "Anonim";
      msg = (formData.get("pesan") as string) || "";
    } else {
      const json = await request.json();
      name = json.name || json.Nama || "Anonim";
      msg = json.msg || json.pesan || "";
    }

    if (!msg.trim()) {
      return NextResponse.json({ status: false, message: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const data = await readJournalData();
    const newId = data.length > 0 ? Math.max(...data.map((d: any) => d.id)) + 1 : 1;
    const newEntry = {
      id: newId,
      name: name.trim(),
      msg: msg.trim(),
      date: new Date().toISOString()
    };

    data.push(newEntry);
    writeJournalData(data);

    // Sync in background to Google Sheet if possible
    try {
      const googleFormData = new FormData();
      googleFormData.append("Nama", newEntry.name);
      googleFormData.append("pesan", newEntry.msg);
      
      // Fire-and-forget sync
      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: googleFormData
      }).catch(err => console.error("Google sheet sync failed:", err));
    } catch (e) {
      console.error("Google sheet sync background setup error:", e);
    }

    return NextResponse.json({ status: true, data: newEntry });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, msg } = await request.json();
    if (!id) {
      return NextResponse.json({ status: false, message: "ID wajib disertakan" }, { status: 400 });
    }

    const data = await readJournalData();
    const index = data.findIndex((item: any) => item.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ status: false, message: "Pesan tidak ditemukan" }, { status: 404 });
    }

    if (name !== undefined) data[index].name = name.trim();
    if (msg !== undefined) data[index].msg = msg.trim();

    writeJournalData(data);
    return NextResponse.json({ status: true, data: data[index] });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: false, message: "ID wajib disertakan" }, { status: 400 });
    }

    const data = await readJournalData();
    const filtered = data.filter((item: any) => item.id !== Number(id));

    if (filtered.length === data.length) {
      return NextResponse.json({ status: false, message: "Pesan tidak ditemukan" }, { status: 404 });
    }

    writeJournalData(filtered);
    return NextResponse.json({ status: true, message: "Pesan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
