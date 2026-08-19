import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const INVITATIONS_PATH = path.join(DATA_DIR, "wayfinder-invitations.json");
const ORIGINAL_DATA_PATH = path.join(process.cwd(), "src", "data", "wayfinder-invitations.json");

export interface InvitationItem {
  id: string;
  name: string;
  slug: string;
}

export function toSlug(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\./g, "")
    .replace(/[^a-zA-Z0-9\-]/g, "");
}

function ensureDataDirectory() {
  const dir = path.dirname(INVITATIONS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readInvitations(): InvitationItem[] {
  ensureDataDirectory();

  // Try reading from runtime path
  if (fs.existsSync(INVITATIONS_PATH)) {
    try {
      const content = fs.readFileSync(INVITATIONS_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("Error reading wayfinder-invitations.json:", e);
    }
  }

  // Fallback to original static data if in Vercel /tmp is empty
  if (isVercel && fs.existsSync(ORIGINAL_DATA_PATH)) {
    try {
      const content = fs.readFileSync(ORIGINAL_DATA_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        fs.writeFileSync(INVITATIONS_PATH, content, "utf-8");
        return parsed;
      }
    } catch (e) {
      console.error("Error reading original wayfinder-invitations.json:", e);
    }
  }

  return [];
}

export function writeInvitations(data: InvitationItem[]) {
  ensureDataDirectory();
  const formatted = JSON.stringify(data, null, 2);
  fs.writeFileSync(INVITATIONS_PATH, formatted, "utf-8");
  if (!isVercel && ORIGINAL_DATA_PATH !== INVITATIONS_PATH) {
    try {
      fs.writeFileSync(ORIGINAL_DATA_PATH, formatted, "utf-8");
    } catch {}
  }
}

export async function GET() {
  const data = readInvitations();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      writeInvitations(body);
      return NextResponse.json({ success: true, data: body });
    }

    if (body.action === "add") {
      const name = String(body.name || "").trim();
      if (!name) {
        return NextResponse.json({ success: false, message: "Nama undangan wajib diisi" }, { status: 400 });
      }

      let slug = body.slug ? toSlug(body.slug) : toSlug(name);
      if (!slug) slug = "undangan-" + Date.now();

      const data = readInvitations();
      const newItem: InvitationItem = {
        id: body.id || Date.now().toString(),
        name,
        slug,
      };

      data.push(newItem);
      writeInvitations(data);
      return NextResponse.json({ success: true, data, item: newItem });
    }

    if (body.action === "update") {
      const data = readInvitations();
      const index = data.findIndex((item) => item.id === body.id);
      if (index !== -1) {
        const name = body.item?.name !== undefined ? String(body.item.name).trim() : data[index].name;
        let slug = body.item?.slug !== undefined ? toSlug(body.item.slug) : data[index].slug;
        if (!slug && name) slug = toSlug(name);

        data[index] = {
          ...data[index],
          name,
          slug,
        };
        writeInvitations(data);
        return NextResponse.json({ success: true, data, item: data[index] });
      }
      return NextResponse.json({ success: false, message: "Item tidak ditemukan" }, { status: 404 });
    }

    if (body.action === "delete") {
      let data = readInvitations();
      data = data.filter((item) => item.id !== body.id && item.slug !== body.id);
      writeInvitations(data);
      return NextResponse.json({ success: true, data });
    }

    if (body.action === "saveAll") {
      const payload = Array.isArray(body.data) ? body.data : [];
      writeInvitations(payload);
      return NextResponse.json({ success: true, data: payload });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
