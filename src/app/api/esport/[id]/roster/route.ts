import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      const rows = await query<any[]>(
        "SELECT * FROM `esport_rosters` WHERE `division_id` = ? ORDER BY `is_captain` DESC, `sort_order` ASC, `id` ASC",
        [id]
      );
      return NextResponse.json({ success: true, data: rows || [] }, { headers });
    }
    return NextResponse.json({ success: true, data: [] }, { headers });
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

    if (isMySqlConfigured()) {
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
      return NextResponse.json({ success: true, id: res?.insertId });
    }

    return NextResponse.json({ success: true, message: "MySQL not configured" });
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
      return NextResponse.json({ success: true });
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
      await query("DELETE FROM `esport_rosters` WHERE `id` = ? AND `division_id` = ?", [rid, divisionId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE Roster error:", e.message);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
