import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role_id, full_name, nickname, city, whatsapp, social_media, division, reason } = body;

    if (!role_id || !full_name || !city || !whatsapp) {
      return NextResponse.json(
        { success: false, message: "Nama lengkap, kota domisili, dan nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    if (isMySqlConfigured()) {
      // Check if role is currently open
      const roles = await query<any[]>("SELECT `is_open` FROM `recruitment_roles` WHERE `id`=?", [role_id]);
      if (roles && roles.length > 0 && !roles[0].is_open) {
        return NextResponse.json(
          { success: false, message: "Pendaftaran untuk peran ini sedang ditutup." },
          { status: 400 }
        );
      }

      const result: any = await query(
        `INSERT INTO \`recruitment_submissions\` 
          (\`role_id\`, \`full_name\`, \`nickname\`, \`city\`, \`whatsapp\`, \`social_media\`, \`division\`, \`reason\`, \`status\`) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          role_id,
          full_name.trim(),
          nickname ? nickname.trim() : null,
          city.trim(),
          whatsapp.trim(),
          social_media ? social_media.trim() : null,
          division ? division.trim() : null,
          reason ? reason.trim() : null,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Pendaftaran berhasil dikirim! Tim Cavallery akan segera menghubungi kamu.",
        id: result.insertId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dikirim!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
