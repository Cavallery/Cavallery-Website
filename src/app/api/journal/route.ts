import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const JOURNAL_FILE_PATH = path.join(DATA_DIR, "journal.json");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiiUkBqWpRrYSDkC-6RKZ_mFxPAWB2uydW_hxaYWL0tr-o_GwrJ6b4zt_Goj9gFeen/exec";

let inMemoryJournalData: any[] | null = null;

const DEFAULT_JOURNAL_FALLBACK = [
  {
    id: 1,
    name: "lalallalalala",
    msg: "haloo ci erinee sayangg!! tauu gaa kehidupan aku jadi lebih berwarna saat ada ci erineee, ci erine tu uda aku anggap seperti kaka kandung tauuu ya walaupun ci erine gatau aku hidup huhuhu soalnya belum bisa vc in another day akuu vc ya ci tunggu akuu!!!, bertahan lebih lama di jkt48 ya ci!! aku adalah salah satu orang yang bangga smaa ciciii, HARUS SELALU PERCAYA DIRI YA CII OKAIIII, aku tau banyak yang selalu dukung ciciii, I LOVE U CATHERINA VALLENCIA KETUA BEBEK KUUUU🐣🤍",
    date: "2026-03-09T12:50:42.000Z"
  },
  {
    id: 2,
    name: "Dinda duyoung ",
    msg: "Hai ci erine semangat terus yaa kegiatannya jaga kesehatannya jugaa apalagi sekarang kamu lagi sibuk\"nya latihan buat shonici setlist baru dan mv baru juga yaa semangat yaa, minum air putih yang cukup sehat\" cerine 🤍🍀. Cinta kamu banget 🫶🏻 jujur kangen 🥹",
    date: "2026-03-12T14:25:54.000Z"
  },
  {
    id: 3,
    name: "faiz mahmud",
    msg: "hai erine! bagaimana kabarmu? semoga kamu sehat selalu ya. jangan jaga kesehatan, istirahat yang cukup, dan bersemangat dalam menjalani hari yang penuh dengan seribu kejutan. udah deh itu aja o ya sebelum itu aku punya  kata-kata untuk erine agar semangat dalam menjalani hari. kata-kata hari ini= jalani hidupmu dengan sungguh-sungguh agar hati mu tetap teguh",
    date: "2026-03-15T13:48:05.000Z"
  },
  {
    id: 4,
    name: "vernx ",
    msg: "Hai ci Erine semangat terus ya, jaga kesehatan selalu pokoknya apapun kegiatannya tetap semangat. Aku yakin kamu pasti bisa dan mampu untuk melakukannya dengan terbaik. Aku akan terus menemani perjalananmu sampai akhir, ci Erine kamu itu hebat, keren, luar biasa jadi jangan pernah merasa bahwa dirimu itu tidak layak ataupun tidak cocok untuk mendapatkan dukungan dan kebahagiaan yang dirasakan di JKT48. Ci Erine oshi kesayanganku yang tidak pernah tergantikan aku cuma mau bilang, tolong bertahan lebih lama di JKT48 kita sama-sama berjuang bikin chapter yang indah dan raih mimpi-mimpi besarmu. I love Ci Erine 🫶🏻💌",
    date: "2026-03-19T02:55:07.000Z"
  },
  {
    id: 5,
    name: "dhafinnn",
    msg: "semangat yaa dalam menjalani semuanya, you are stronger than you think. you dont have to carry it all alone, we've got your back. sehat sehat terus yaaaa 🤍",
    date: "2026-03-19T16:52:14.000Z"
  }
];

// Ensure data folder exists
function ensureDataDirectory() {
  try {
    const dir = path.dirname(JOURNAL_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not ensure data directory for journal:", e);
  }
}

// Read from JSON file, initializing from Google Sheet if empty/non-existent
async function readJournalData() {
  if (inMemoryJournalData && inMemoryJournalData.length > 0) {
    return inMemoryJournalData;
  }

  ensureDataDirectory();
  try {
    if (fs.existsSync(JOURNAL_FILE_PATH)) {
      const fileContent = fs.readFileSync(JOURNAL_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryJournalData = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading journal.json:", e);
  }

  // Fallback to fetch from Google Sheet and populate
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { signal: AbortSignal.timeout(4000) });
    const rawData = await res.json();
    if (Array.isArray(rawData)) {
      const formatted = rawData.map((row: any, index: number) => ({
        id: index + 1,
        name: row[1] || "Anonim",
        msg: row[2] || "",
        date: row[3] || new Date().toISOString()
      }));
      try {
        fs.writeFileSync(JOURNAL_FILE_PATH, JSON.stringify(formatted, null, 2), "utf-8");
      } catch {}
      inMemoryJournalData = formatted;
      return formatted;
    }
  } catch (e) {
    console.error("Error initializing journal data from Google Sheet:", e);
  }

  inMemoryJournalData = DEFAULT_JOURNAL_FALLBACK;
  return inMemoryJournalData;
}

// Write to JSON file
function writeJournalData(data: any[]) {
  inMemoryJournalData = data;
  ensureDataDirectory();
  try {
    fs.writeFileSync(JOURNAL_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write journal.json:", e);
  }
}

export async function GET() {
  try {
    const data = await readJournalData();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(DEFAULT_JOURNAL_FALLBACK);
  }
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
