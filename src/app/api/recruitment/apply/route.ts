import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let columnsEnsured = false;
async function ensureColumns() {
  if (columnsEnsured) return;
  const colsToAdd = [
    { name: "email", type: "VARCHAR(150) NULL" },
    { name: "info_source", type: "VARCHAR(100) NULL" },
    { name: "gender", type: "VARCHAR(50) NULL" },
    { name: "line_id", type: "VARCHAR(100) NULL" },
    { name: "line_display_name", type: "VARCHAR(150) NULL" },
    { name: "hobby", type: "TEXT NULL" },
    { name: "username_x", type: "VARCHAR(100) NULL" },
    { name: "username_ig", type: "VARCHAR(100) NULL" },
    { name: "username_tiktok", type: "VARCHAR(100) NULL" },
    { name: "support_type", type: "TEXT NULL" },
    { name: "activity_suggestion", type: "TEXT NULL" },
    { name: "fee_agreed", type: "TINYINT(1) DEFAULT 1" },
    { name: "extra_data", type: "LONGTEXT NULL" },
  ];

  for (const col of colsToAdd) {
    try {
      await query(`ALTER TABLE \`recruitment_submissions\` ADD COLUMN \`${col.name}\` ${col.type}`);
    } catch {
      // Column already exists or table not ready
    }
  }
  columnsEnsured = true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      role_id,
      full_name,
      nickname,
      email,
      city,
      whatsapp,
      line_id,
      line_display_name,
      info_source,
      gender,
      hobby,
      username_x,
      username_ig,
      username_tiktok,
      social_media,
      division,
      reason,
      support_type,
      activity_suggestion,
      fee_agreed,
    } = body;

    if (!role_id || !full_name || !city) {
      return NextResponse.json(
        { success: false, message: "Nama lengkap dan kota domisili wajib diisi." },
        { status: 400 }
      );
    }

    if (role_id === "member") {
      if (!email || !email.trim()) {
        return NextResponse.json(
          { success: false, message: "Email wajib diisi." },
          { status: 400 }
        );
      }
      if (!line_id || !line_id.trim()) {
        return NextResponse.json(
          { success: false, message: "ID Line wajib diisi." },
          { status: 400 }
        );
      }
      if (!fee_agreed) {
        return NextResponse.json(
          { success: false, message: "Anda wajib menyetujui ketentuan iuran untuk melanjutkan." },
          { status: 400 }
        );
      }
    } else {
      if (!whatsapp || !whatsapp.trim()) {
        return NextResponse.json(
          { success: false, message: "Nomor WhatsApp wajib diisi." },
          { status: 400 }
        );
      }
    }

    if (isMySqlConfigured()) {
      await ensureColumns();

      // Check if role is currently open
      const roles = await query<any[]>("SELECT `is_open` FROM `recruitment_roles` WHERE `id`=?", [role_id]);
      if (roles && roles.length > 0 && !roles[0].is_open) {
        return NextResponse.json(
          { success: false, message: "Pendaftaran untuk peran ini sedang ditutup." },
          { status: 400 }
        );
      }

      const formattedHobby = Array.isArray(hobby) ? hobby.join(", ") : (hobby || null);
      const formattedSupport = Array.isArray(support_type) ? support_type.join(", ") : (support_type || null);
      const contactWhatsApp = whatsapp ? whatsapp.trim() : (line_id ? line_id.trim() : "-");

      const extraJson = JSON.stringify({
        email,
        info_source,
        gender,
        line_id,
        line_display_name,
        hobby: formattedHobby,
        username_x,
        username_ig,
        username_tiktok,
        support_type: formattedSupport,
        activity_suggestion: activity_suggestion ? activity_suggestion.trim() : null,
        fee_agreed: fee_agreed ? 1 : 0,
      });

      let insertId: any = null;
      try {
        const result: any = await query(
          `INSERT INTO \`recruitment_submissions\` 
            (\`role_id\`, \`full_name\`, \`nickname\`, \`email\`, \`city\`, \`whatsapp\`, \`line_id\`, \`line_display_name\`, \`info_source\`, \`gender\`, \`hobby\`, \`username_x\`, \`username_ig\`, \`username_tiktok\`, \`social_media\`, \`division\`, \`reason\`, \`support_type\`, \`activity_suggestion\`, \`fee_agreed\`, \`extra_data\`, \`status\`) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            role_id,
            full_name.trim(),
            nickname ? nickname.trim() : null,
            email ? email.trim() : null,
            city.trim(),
            contactWhatsApp,
            line_id ? line_id.trim() : null,
            line_display_name ? line_display_name.trim() : null,
            info_source ? info_source.trim() : null,
            gender ? gender.trim() : null,
            formattedHobby,
            username_x ? username_x.trim() : null,
            username_ig ? username_ig.trim() : null,
            username_tiktok ? username_tiktok.trim() : null,
            social_media ? social_media.trim() : null,
            division ? division.trim() : null,
            reason ? reason.trim() : null,
            formattedSupport,
            activity_suggestion ? activity_suggestion.trim() : null,
            fee_agreed ? 1 : 0,
            extraJson,
          ]
        );
        insertId = result?.insertId;
      } catch (insertError: any) {
        // Fallback to basic columns if needed
        const result: any = await query(
          `INSERT INTO \`recruitment_submissions\` 
            (\`role_id\`, \`full_name\`, \`nickname\`, \`city\`, \`whatsapp\`, \`social_media\`, \`division\`, \`reason\`, \`status\`) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            role_id,
            full_name.trim(),
            nickname ? nickname.trim() : null,
            city.trim(),
            contactWhatsApp,
            social_media ? social_media.trim() : (username_x || username_ig || username_tiktok || null),
            division ? division.trim() : null,
            reason ? reason.trim() : (formattedSupport || null),
          ]
        );
        insertId = result?.insertId;
      }

      return NextResponse.json({
        success: true,
        message: "Pendaftaran berhasil dikirim! Tim screening Cavallery akan segera memeriksa data kamu.",
        id: insertId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dikirim!",
    });
  } catch (error: any) {
    console.error("Apply error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
