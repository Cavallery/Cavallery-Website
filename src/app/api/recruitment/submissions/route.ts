import { NextRequest, NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("q");

    if (isMySqlConfigured()) {
      let sql = "SELECT * FROM `recruitment_submissions` WHERE 1=1";
      const params: any[] = [];

      if (role && role !== "all") {
        sql += " AND `role_id` = ?";
        params.push(role);
      }
      if (status && status !== "all") {
        sql += " AND `status` = ?";
        params.push(status);
      }
      if (search) {
        sql += " AND (`full_name` LIKE ? OR `city` LIKE ? OR `whatsapp` LIKE ? OR `division` LIKE ? OR `line_id` LIKE ? OR `email` LIKE ?)";
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern, pattern, pattern, pattern);
      }

      sql += " ORDER BY `created_at` DESC, `id` DESC";

      const rows = await query<any[]>(sql, params);
      return NextResponse.json({ success: true, data: rows || [] }, { headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true, data: [] }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Recruitment GET error:", error);
    return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500, headers: noCacheHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      role_id,
      full_name,
      nickname,
      city,
      whatsapp,
      line_id,
      line_display_name,
      gender,
      division,
      reason,
      status = "pending",
      notes,
    } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ success: false, message: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      const res: any = await query(
        `INSERT INTO \`recruitment_submissions\` 
          (\`role_id\`, \`full_name\`, \`nickname\`, \`city\`, \`whatsapp\`, \`line_id\`, \`line_display_name\`, \`gender\`, \`division\`, \`reason\`, \`status\`, \`notes\`, \`created_at\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          role_id || "member",
          full_name.trim(),
          nickname?.trim() || null,
          city?.trim() || "-",
          whatsapp?.trim() || "-",
          line_id?.trim() || null,
          line_display_name?.trim() || null,
          gender?.trim() || "-",
          division?.trim() || null,
          reason?.trim() || null,
          status || "pending",
          notes?.trim() || null,
        ]
      );
      return NextResponse.json({ success: true, message: "Pendaftar baru berhasil ditambahkan!", id: res?.insertId }, { headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true, message: "Data tersimpan" }, { headers: noCacheHeaders });
  } catch (err: any) {
    console.error("Recruitment POST error:", err);
    return NextResponse.json({ success: false, message: err?.message || "Gagal menambahkan pendaftar" }, { status: 500, headers: noCacheHeaders });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      role_id,
      full_name,
      nickname,
      city,
      whatsapp,
      line_id,
      line_display_name,
      gender,
      division,
      reason,
      status,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      const fields: string[] = [];
      const params: any[] = [];

      if (role_id !== undefined) { fields.push("`role_id` = ?"); params.push(role_id); }
      if (full_name !== undefined) { fields.push("`full_name` = ?"); params.push(full_name.trim()); }
      if (nickname !== undefined) { fields.push("`nickname` = ?"); params.push(nickname ? nickname.trim() : null); }
      if (city !== undefined) { fields.push("`city` = ?"); params.push(city.trim()); }
      if (whatsapp !== undefined) { fields.push("`whatsapp` = ?"); params.push(whatsapp.trim()); }
      if (line_id !== undefined) { fields.push("`line_id` = ?"); params.push(line_id ? line_id.trim() : null); }
      if (line_display_name !== undefined) { fields.push("`line_display_name` = ?"); params.push(line_display_name ? line_display_name.trim() : null); }
      if (gender !== undefined) { fields.push("`gender` = ?"); params.push(gender); }
      if (division !== undefined) { fields.push("`division` = ?"); params.push(division ? division.trim() : null); }
      if (reason !== undefined) { fields.push("`reason` = ?"); params.push(reason ? reason.trim() : null); }
      if (status !== undefined) { fields.push("`status` = ?"); params.push(status); }
      if (notes !== undefined) { fields.push("`notes` = ?"); params.push(notes ? notes.trim() : null); }

      if (fields.length > 0) {
        params.push(id);
        await query(`UPDATE \`recruitment_submissions\` SET ${fields.join(", ")} WHERE \`id\` = ?`, params);
      }

      return NextResponse.json({ success: true, message: "Data pendaftar berhasil diperbarui" }, { headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Recruitment PATCH error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let id: any = request.nextUrl.searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // Body may not be JSON
      }
    }

    if (!id) {
      try {
        const parsedUrl = new URL(request.url, "http://localhost");
        id = parsedUrl.searchParams.get("id");
      } catch {
        // ignore
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "ID pendaftar wajib disertakan." }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query("DELETE FROM `recruitment_submissions` WHERE `id`=?", [id]);
      return NextResponse.json({ success: true, message: "Pendaftar berhasil dihapus" }, { headers: noCacheHeaders });
    }

    return NextResponse.json({ success: true, message: "Pendaftar berhasil dihapus" }, { headers: noCacheHeaders });
  } catch (error: any) {
    console.error("Recruitment DELETE error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

