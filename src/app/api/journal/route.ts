import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const JOURNAL_FILE_PATH = path.join(DATA_DIR, "journal.json");

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

function readJournalLocal(): any[] {
  ensureDataDirectory();
  try {
    if (fs.existsSync(JOURNAL_FILE_PATH)) {
      const fileContent = fs.readFileSync(JOURNAL_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading journal.json:", e);
  }
  return [];
}

function writeJournalLocal(data: any[]) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(JOURNAL_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write journal.json:", e);
  }
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `journal_messages` WHERE `is_approved`=1 ORDER BY `id` DESC");
      if (rows && Array.isArray(rows)) {
        const formatted = rows.map((r) => ({
          id: r.id,
          name: r.name,
          msg: r.msg,
          date: r.date_label || r.created_at,
        }));
        return NextResponse.json(formatted);
      }
    }
    return NextResponse.json(readJournalLocal());
  } catch (error: any) {
    return NextResponse.json(readJournalLocal());
  }
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

    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    let insertedId = Date.now();

    if (isMySqlConfigured()) {
      const res = await query<any>(
        "INSERT INTO `journal_messages` (`name`, `msg`, `date_label`, `is_approved`) VALUES (?, ?, ?, 1)",
        [name.trim(), msg.trim(), dateStr]
      );
      if (res && res.insertId) insertedId = res.insertId;
    }

    const data = readJournalLocal();
    const newEntry = {
      id: insertedId,
      name: name.trim(),
      msg: msg.trim(),
      date: new Date().toISOString(),
    };

    data.unshift(newEntry);
    writeJournalLocal(data);

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

    if (isMySqlConfigured()) {
      await query(
        "UPDATE `journal_messages` SET `name`=COALESCE(?, `name`), `msg`=COALESCE(?, `msg`) WHERE `id`=?",
        [name ? name.trim() : null, msg ? msg.trim() : null, id]
      );
    }

    const data = readJournalLocal();
    const index = data.findIndex((item: any) => item.id === Number(id));

    if (index !== -1) {
      if (name !== undefined) data[index].name = name.trim();
      if (msg !== undefined) data[index].msg = msg.trim();
      writeJournalLocal(data);
      return NextResponse.json({ status: true, data: data[index] });
    }

    return NextResponse.json({ status: true, message: "Updated" });
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

    if (isMySqlConfigured()) {
      await query("DELETE FROM `journal_messages` WHERE `id`=?", [id]);
    }

    const data = readJournalLocal();
    const filtered = data.filter((item: any) => item.id !== Number(id));
    writeJournalLocal(filtered);

    return NextResponse.json({ status: true, message: "Pesan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
