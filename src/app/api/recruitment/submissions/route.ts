import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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
        sql += " AND (`full_name` LIKE ? OR `city` LIKE ? OR `whatsapp` LIKE ? OR `division` LIKE ?)";
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern, pattern);
      }

      sql += " ORDER BY `created_at` DESC, `id` DESC";

      const rows = await query<any[]>(sql, params);
      return NextResponse.json({ success: true, data: rows || [] });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
      return NextResponse.json({ success: true, message: "Status pendaftar berhasil diperbarui" });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      await query("DELETE FROM `recruitment_submissions` WHERE `id`=?", [id]);
      return NextResponse.json({ success: true, message: "Pendaftar berhasil dihapus" });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
