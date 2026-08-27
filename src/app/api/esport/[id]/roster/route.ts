import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const ROSTERS_FILE = path.join(DATA_DIR, "esport-rosters.json");
const DIVISIONS_FILE = path.join(DATA_DIR, "esport-divisions.json");

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ensureDataDirectory() {
  const dir = path.dirname(ROSTERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readRostersLocal(): any[] {
  ensureDataDirectory();
  if (fs.existsSync(ROSTERS_FILE)) {
    try {
      const content = fs.readFileSync(ROSTERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error reading esport-rosters.json:", e);
    }
  }
  return [];
}

function writeRostersLocal(data: any[]) {
  ensureDataDirectory();
  fs.writeFileSync(ROSTERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function syncDivisionRosterCount(divisionId: string) {
  try {
    if (fs.existsSync(DIVISIONS_FILE)) {
      const content = fs.readFileSync(DIVISIONS_FILE, "utf-8");
      const divisions = JSON.parse(content);
      const rosters = readRostersLocal();
      if (Array.isArray(divisions)) {
        const count = rosters.filter((r) => r.division_id === divisionId).length;
        const updated = divisions.map((d) => (d.id === divisionId ? { ...d, roster_count: count } : d));
        fs.writeFileSync(DIVISIONS_FILE, JSON.stringify(updated, null, 2), "utf-8");
      }
    }
  } catch (e) {
    console.error("Error syncing division roster count:", e);
  }
}

// GET /api/esport/[id]/roster
export async function GET(_req: NextRequest, { params }: Params) {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  try {
    const { id } = await params;
    if (isMySqlConfigured()) {
      try {
        const rows = await query<any[]>(
          "SELECT * FROM `esport_rosters` WHERE `division_id` = ? ORDER BY `is_captain` DESC, `sort_order` ASC, `id` ASC",
          [id]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          // Sync to local
          const local = readRostersLocal().filter((r) => r.division_id !== id);
          writeRostersLocal([...local, ...rows]);
          syncDivisionRosterCount(id);
          return NextResponse.json({ success: true, data: rows }, { headers });
        }
      } catch (err: any) {
        console.warn("MySQL GET roster error, fallback to local:", err.message);
      }
    }

    const localRosters = readRostersLocal().filter((r) => r.division_id === id);
    return NextResponse.json({ success: true, data: localRosters }, { headers });
  } catch (e: any) {
    console.error("GET Roster error:", e.message);
    return NextResponse.json({ success: false, message: e.message, data: [] }, { status: 500 });
  }
}

// POST /api/esport/[id]/roster — tambah player
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { player_name, game_id, role, avatar_url, is_captain, sort_order } = body;

    if (!player_name || !String(player_name).trim()) {
      return NextResponse.json({ success: false, message: "Nama player wajib diisi" }, { status: 400 });
    }

    let insertedId = Date.now();

    if (isMySqlConfigured()) {
      try {
        const res: any = await query(
          `INSERT INTO \`esport_rosters\` (\`division_id\`, \`player_name\`, \`game_id\`, \`role\`, \`avatar_url\`, \`is_captain\`, \`sort_order\`)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            String(player_name).trim(),
            game_id ? String(game_id).trim() : null,
            role ? String(role).trim() : null,
            avatar_url ? String(avatar_url).trim() : null,
            is_captain ? 1 : 0,
            Number(sort_order) || 0,
          ]
        );
        if (res?.insertId) insertedId = res.insertId;
      } catch (err: any) {
        console.warn("MySQL POST roster error:", err.message);
      }
    }

    // Always update local JSON
    const rosters = readRostersLocal();
    const newPlayer = {
      id: insertedId,
      division_id: id,
      player_name: String(player_name).trim(),
      game_id: game_id ? String(game_id).trim() : null,
      role: role ? String(role).trim() : null,
      avatar_url: avatar_url ? String(avatar_url).trim() : null,
      is_captain: is_captain ? 1 : 0,
      sort_order: Number(sort_order) || 0,
      created_at: new Date().toISOString(),
    };
    rosters.push(newPlayer);
    writeRostersLocal(rosters);
    syncDivisionRosterCount(id);

    return NextResponse.json({ success: true, id: insertedId, data: newPlayer });
  } catch (e: any) {
    console.error("POST Roster error:", e.message);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

// PATCH /api/esport/[id]/roster — edit player
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: divisionId } = await params;
    const body = await req.json();
    const { id, player_name, game_id, role, avatar_url, is_captain, sort_order } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID roster wajib diisi" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      try {
        await query(
          `UPDATE \`esport_rosters\` SET 
            \`player_name\` = COALESCE(?, \`player_name\`),
            \`game_id\`     = ?,
            \`role\`        = ?,
            \`avatar_url\`  = ?,
            \`is_captain\`  = COALESCE(?, \`is_captain\`),
            \`sort_order\`  = COALESCE(?, \`sort_order\`)
           WHERE \`id\` = ? AND \`division_id\` = ?`,
          [
            player_name ? String(player_name).trim() : null,
            game_id !== undefined ? (game_id ? String(game_id).trim() : null) : null,
            role !== undefined ? (role ? String(role).trim() : null) : null,
            avatar_url !== undefined ? (avatar_url ? String(avatar_url).trim() : null) : null,
            is_captain !== undefined ? (is_captain ? 1 : 0) : null,
            sort_order !== undefined ? Number(sort_order) : null,
            id,
            divisionId,
          ]
        );
      } catch (err: any) {
        console.warn("MySQL PATCH roster error:", err.message);
      }
    }

    // Always update local JSON
    const rosters = readRostersLocal();
    const idx = rosters.findIndex((r) => Number(r.id) === Number(id));
    if (idx !== -1) {
      rosters[idx] = {
        ...rosters[idx],
        player_name: player_name !== undefined ? String(player_name).trim() : rosters[idx].player_name,
        game_id: game_id !== undefined ? (game_id ? String(game_id).trim() : null) : rosters[idx].game_id,
        role: role !== undefined ? (role ? String(role).trim() : null) : rosters[idx].role,
        avatar_url: avatar_url !== undefined ? (avatar_url ? String(avatar_url).trim() : null) : rosters[idx].avatar_url,
        is_captain: is_captain !== undefined ? (is_captain ? 1 : 0) : rosters[idx].is_captain,
        sort_order: sort_order !== undefined ? Number(sort_order) : rosters[idx].sort_order,
      };
      writeRostersLocal(rosters);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("PATCH Roster error:", e.message);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

// DELETE /api/esport/[id]/roster?rid=xxx
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: divisionId } = await params;
    const rid = new URL(req.url).searchParams.get("rid");
    if (!rid) {
      return NextResponse.json({ success: false, message: "rid wajib diisi" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      try {
        await query("DELETE FROM `esport_rosters` WHERE `id` = ? AND `division_id` = ?", [rid, divisionId]);
      } catch (err: any) {
        console.warn("MySQL DELETE roster error:", err.message);
      }
    }

    // Always delete from local JSON
    const rosters = readRostersLocal();
    const filtered = rosters.filter((r) => String(r.id) !== String(rid));
    writeRostersLocal(filtered);
    syncDivisionRosterCount(divisionId);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE Roster error:", e.message);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
