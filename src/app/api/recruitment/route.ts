import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

const DEFAULT_ROLES = [
  {
    id: "member",
    title: "Join Member",
    description: "Keanggotaan resmi Cavallery untuk berpartisipasi aktif dalam kegiatan harian, gathering, dan dukungan bersama Erine.",
    is_open: 0,
  },
  {
    id: "admin",
    title: "Join Admin",
    description: "Perekrutan tim pengurus internal (Data Archiver, Sosmed, Video Editor, Desain Grafis, E-Sport, & Merch).",
    is_open: 0,
  },
  {
    id: "volunteer",
    title: "Join Volunteer",
    description: "Bergabung sebagai relawan pelaksana untuk event kebersamaan, perayaan ulang tahun, dan proyek dukungan Erine.",
    is_open: 0,
  },
];

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT * FROM `recruitment_roles` ORDER BY FIELD(id, 'member', 'admin', 'volunteer')");
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, data: rows });
      }
    }
    return NextResponse.json({ success: true, data: DEFAULT_ROLES });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message, data: DEFAULT_ROLES }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, is_open, title, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Role ID is required" }, { status: 400 });
    }

    if (isMySqlConfigured()) {
      if (is_open !== undefined) {
        await query(
          "UPDATE `recruitment_roles` SET `is_open`=? WHERE `id`=?",
          [is_open ? 1 : 0, id]
        );
      }
      if (title || description) {
        await query(
          "UPDATE `recruitment_roles` SET `title`=COALESCE(?, `title`), `description`=COALESCE(?, `description`) WHERE `id`=?",
          [title || null, description || null, id]
        );
      }
      const updated = await query<any[]>("SELECT * FROM `recruitment_roles` WHERE `id`=?", [id]);
      return NextResponse.json({ success: true, data: updated?.[0] });
    }

    return NextResponse.json({ success: true, data: { id, is_open } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
