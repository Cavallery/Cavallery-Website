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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      if (status !== undefined) {
        await query("UPDATE `recruitment_submissions` SET `status`=? WHERE `id`=?", [status, id]);
      }
      if (notes !== undefined) {
        await query("UPDATE `recruitment_submissions` SET `notes`=? WHERE `id`=?", [notes, id]);
      }
      return NextResponse.json({ success: true, message: "Status pendaftar berhasil diperbarui" }, { headers: noCacheHeaders });
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

