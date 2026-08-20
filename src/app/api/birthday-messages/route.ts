import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

export const dynamic = "force-dynamic";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const MESSAGES_FILE_PATH = path.join(DATA_DIR, "birthday-messages.json");

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

function readBirthdayLocal(): any[] {
  ensureDataDirectory();
  try {
    if (fs.existsSync(MESSAGES_FILE_PATH)) {
      const content = fs.readFileSync(MESSAGES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading birthday-messages.json:", e);
  }
  return [];
}

function writeBirthdayLocal(data: any[]) {
  ensureDataDirectory();
  try {
    fs.writeFileSync(MESSAGES_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write birthday-messages.json:", e);
  }
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `birthday_messages` WHERE `is_approved`=1 ORDER BY `id` DESC");
      if (rows && Array.isArray(rows)) {
        const formatted = rows.map((r) => ({
          id: r.id,
          name: r.name,
          msg: r.msg,
          date: r.date_label || r.created_at,
        }));
        return NextResponse.json(formatted, {
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      }
    }
    return NextResponse.json(readBirthdayLocal());
  } catch (e) {
    console.error("Error fetching birthday messages:", e);
    return NextResponse.json(readBirthdayLocal());
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

    const now = new Date().toISOString();
    const dateLabel = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    let insertedId = Date.now();

    if (isMySqlConfigured()) {
      const res = await query<any>(
        "INSERT INTO `birthday_messages` (`name`, `msg`, `date_label`, `is_approved`) VALUES (?, ?, ?, 1)",
        [name.trim(), msg.trim(), dateLabel]
      );
      if (res && res.insertId) insertedId = res.insertId;
    }

    const newEntry = {
      id: insertedId,
      name: name.trim(),
      msg: msg.trim(),
      date: now,
    };

    const data = readBirthdayLocal();
    data.unshift(newEntry);
    writeBirthdayLocal(data);

    return NextResponse.json({ status: true, data: newEntry });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ status: false, message: "ID required" }, { status: 400 });

    if (isMySqlConfigured()) {
      await query("DELETE FROM `birthday_messages` WHERE `id`=?", [id]);
    }

    const data = readBirthdayLocal();
    const filtered = data.filter((item: any) => item.id !== Number(id));
    writeBirthdayLocal(filtered);

    return NextResponse.json({ status: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
