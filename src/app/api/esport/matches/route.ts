import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/esport/matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get("division_id");
    const status = searchParams.get("status");

    if (isMySqlConfigured()) {
      const conditions: string[] = ["1=1"];
      const params: any[] = [];

      if (divisionId && divisionId !== "all") {
        conditions.push("m.division_id = ?");
        params.push(divisionId);
      }
      if (status && status !== "all") {
        conditions.push("m.status = ?");
        params.push(status);
      }

      const sql = `
        SELECT 
          m.*,
          d.name AS division_name,
          d.cover_url AS division_cover
        FROM esport_matches m
        LEFT JOIN esport_divisions d ON d.id COLLATE utf8mb4_unicode_ci = m.division_id COLLATE utf8mb4_unicode_ci
        WHERE ${conditions.join(" AND ")}
        ORDER BY 
          CASE WHEN m.status = 'live' THEN 1 WHEN m.status = 'upcoming' THEN 2 ELSE 3 END,
          m.match_date DESC
      `;

      const rows = await query<any[]>(sql, params);
      return NextResponse.json({ success: true, data: rows || [] });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (e: any) {
    console.error("GET Matches Error:", e.message);
    return NextResponse.json({ success: false, message: e.message, data: [] }, { status: 500 });
  }
}

// POST /api/esport/matches — input jadwal baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      division_id,
      tournament_name,
      opponent_name,
      opponent_logo,
      match_date,
      status,
      score_cavallery,
      score_opponent,
      result,
      stream_url,
      notes,
    } = body;

    if (!division_id || !tournament_name || !opponent_name || !match_date) {
      return NextResponse.json(
        { success: false, message: "Divisi, Turnamen, Lawan, dan Tanggal wajib diisi" },
        { status: 400 }
      );
    }

    if (isMySqlConfigured()) {
      const res: any = await query(
        `INSERT INTO esport_matches 
         (division_id, tournament_name, opponent_name, opponent_logo, match_date, status, score_cavallery, score_opponent, result, stream_url, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          division_id,
          String(tournament_name).trim(),
          String(opponent_name).trim(),
          opponent_logo ? String(opponent_logo).trim() : null,
          match_date,
          status || "upcoming",
          Number(score_cavallery) || 0,
          Number(score_opponent) || 0,
          result || "pending",
          stream_url ? String(stream_url).trim() : null,
          notes ? String(notes).trim() : null,
        ]
      );
      return NextResponse.json({ success: true, id: res?.insertId });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("POST Match Error:", e.message);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

// PATCH /api/esport/matches — update jadwal atau skor / hasil
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      division_id,
      tournament_name,
      opponent_name,
      opponent_logo,
      match_date,
      status,
      score_cavallery,
      score_opponent,
      result,
      stream_url,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID match wajib diisi" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query(
        `UPDATE esport_matches SET
          division_id     = COALESCE(?, division_id),
          tournament_name = COALESCE(?, tournament_name),
          opponent_name   = COALESCE(?, opponent_name),
          opponent_logo   = ?,
          match_date      = COALESCE(?, match_date),
          status          = COALESCE(?, status),
          score_cavallery = COALESCE(?, score_cavallery),
          score_opponent  = COALESCE(?, score_opponent),
          result          = COALESCE(?, result),
          stream_url      = ?,
          notes           = ?
         WHERE id = ?`,
        [
          division_id || null,
          tournament_name ? String(tournament_name).trim() : null,
          opponent_name ? String(opponent_name).trim() : null,
          opponent_logo !== undefined ? (opponent_logo ? String(opponent_logo).trim() : null) : null,
          match_date || null,
          status || null,
          score_cavallery !== undefined ? Number(score_cavallery) : null,
          score_opponent !== undefined ? Number(score_opponent) : null,
          result || null,
          stream_url !== undefined ? (stream_url ? String(stream_url).trim() : null) : null,
          notes !== undefined ? (notes ? String(notes).trim() : null) : null,
          id,
        ]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("PATCH Match Error:", e.message);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

// DELETE /api/esport/matches?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID match wajib diisi" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query("DELETE FROM esport_matches WHERE id = ?", [id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE Match Error:", e.message);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
