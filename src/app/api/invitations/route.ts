import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const INVITATIONS_PATH = path.join(DATA_DIR, "wayfinder-invitations.json");
const ORIGINAL_DATA_PATH = path.join(process.cwd(), "src", "data", "wayfinder-invitations.json");

const CONFIG_PATH = path.join(DATA_DIR, "wayfinder-config.json");
const ORIGINAL_CONFIG_PATH = path.join(process.cwd(), "src", "data", "wayfinder-config.json");

export interface InvitationItem {
  id: string;
  name: string;
  slug: string;
}

export interface WayfinderConfig {
  bgImage: string;
  eventDate: string;
  badgeText: string;
  eyebrow: string;
  heroName: string;
  heroTitle: string;
  invitedLabel: string;
  dateTitle: string;
  dateSub: string;
  locationTitle: string;
  locationSub: string;
  mapUrl: string;
  dressCodeTitle: string;
  dressCodeSub: string;
  footerText: string;
}

export const DEFAULT_WAYFINDER_CONFIG: WayfinderConfig = {
  bgImage: "/images/wayfinder-bg.png",
  eventDate: "2026-08-22T15:00:00+07:00",
  badgeText: "Seitansai Project 2026",
  eyebrow: "Catherina Vallencia",
  heroName: "Erine",
  heroTitle: "The Wayfinder",
  invitedLabel: "Mengundang",
  dateTitle: "Sabtu, 22 Agustus 2026",
  dateSub: "Pukul 15.00 — 20.30 WIB",
  locationTitle: "CGV FX Sudirman — Lantai F7",
  locationSub: "Jl. Jend. Sudirman, Pintu Satu Senayan, Jakarta Selatan",
  mapUrl: "https://maps.google.com/?q=CGV+FX+Sudirman",
  dressCodeTitle: "Dress Code: Birthday T-shirt Erine",
  dressCodeSub: "atau pakaian sopan & rapih",
  footerText: "Cavallery ©2026",
};

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

export function readConfig(): WayfinderConfig {
  ensureDataDirectory();

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const content = fs.readFileSync(CONFIG_PATH, "utf-8");
      return { ...DEFAULT_WAYFINDER_CONFIG, ...JSON.parse(content) };
    } catch (e) {
      console.error("Error reading wayfinder-config.json:", e);
    }
  }

  if (fs.existsSync(ORIGINAL_CONFIG_PATH)) {
    try {
      const content = fs.readFileSync(ORIGINAL_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (isVercel) {
        fs.writeFileSync(CONFIG_PATH, content, "utf-8");
      }
      return { ...DEFAULT_WAYFINDER_CONFIG, ...parsed };
    } catch (e) {
      console.error("Error reading original wayfinder-config.json:", e);
    }
  }

  return DEFAULT_WAYFINDER_CONFIG;
}

export function writeConfig(config: WayfinderConfig) {
  ensureDataDirectory();
  const formatted = JSON.stringify(config, null, 2);
  fs.writeFileSync(CONFIG_PATH, formatted, "utf-8");
  if (!isVercel && ORIGINAL_CONFIG_PATH !== CONFIG_PATH) {
    try {
      fs.writeFileSync(ORIGINAL_CONFIG_PATH, formatted, "utf-8");
    } catch {}
  }
}

export async function GET() {
  let data = readInvitations();
  let config = readConfig();

  // If MySQL is configured, fetch live data from MySQL
  if (isMySqlConfigured()) {
    try {
      const rows = await query<any[]>("SELECT id, fanbase_name, slug FROM wayfinder_invitations WHERE is_active = 1 ORDER BY id ASC");
      if (rows && rows.length > 0) {
        data = rows.map((r) => ({
          id: String(r.id),
          name: r.fanbase_name,
          slug: r.slug,
        }));
      }

      const cfgRows = await query<any[]>("SELECT config_key, config_value FROM wayfinder_config");
      if (cfgRows && cfgRows.length > 0) {
        const loadedCfg: any = {};
        for (const row of cfgRows) {
          loadedCfg[row.config_key] = row.config_value;
        }
        config = { ...DEFAULT_WAYFINDER_CONFIG, ...loadedCfg };
      }
    } catch (err: any) {
      console.error("MySQL fetch error in invitations:", err.message);
    }
  }

  return NextResponse.json({ success: true, data, config });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      writeInvitations(body);
      return NextResponse.json({ success: true, data: body });
    }

    if (body.action === "updateConfig") {
      const current = readConfig();
      const updated = { ...current, ...(body.config || {}) };
      writeConfig(updated);

      if (isMySqlConfigured()) {
        for (const [k, v] of Object.entries(updated)) {
          await query(
            "INSERT INTO wayfinder_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?",
            [k, String(v), String(v)]
          );
        }
      }

      return NextResponse.json({ success: true, config: updated });
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

      if (isMySqlConfigured()) {
        await query(
          "INSERT INTO wayfinder_invitations (fanbase_name, slug, is_active) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE fanbase_name = VALUES(fanbase_name)",
          [name, slug]
        );
      }

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

        if (isMySqlConfigured()) {
          await query(
            "UPDATE wayfinder_invitations SET fanbase_name = ?, slug = ? WHERE id = ? OR slug = ?",
            [name, slug, body.id, body.id]
          );
        }

        return NextResponse.json({ success: true, data, item: data[index] });
      }
      return NextResponse.json({ success: false, message: "Item tidak ditemukan" }, { status: 404 });
    }

    if (body.action === "delete") {
      let data = readInvitations();
      const targetId = body.id;
      data = data.filter((item) => item.id !== targetId && item.slug !== targetId && item.name !== targetId);
      writeInvitations(data);

      // Execute SQL DELETE directly on Hostinger MySQL
      if (isMySqlConfigured()) {
        await query(
          "DELETE FROM wayfinder_invitations WHERE id = ? OR slug = ? OR fanbase_name = ?",
          [targetId, targetId, targetId]
        );
      }

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
