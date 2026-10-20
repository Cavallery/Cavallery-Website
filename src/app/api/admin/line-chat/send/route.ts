import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getContactById, sendLineMessage, saveOutgoingMessage } from "@/lib/lineChat";

// POST: Admin mengirim pesan chat ke pengguna/grup LINE
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { contactId, messageText } = body;

    if (!contactId || !messageText || !messageText.trim()) {
      return NextResponse.json(
        { status: false, message: "contactId dan messageText wajib diisi" },
        { status: 400 }
      );
    }

    const contact = await getContactById(Number(contactId));
    if (!contact) {
      return NextResponse.json(
        { status: false, message: "Kontak tidak ditemukan" },
        { status: 404 }
      );
    }

    // Tentukan target pengiriman (grup jika ada, atau user)
    const targetRecipient = contact.line_group_id || contact.line_user_id;

    // Kirim via LINE Push Message API
    const sendResult = await sendLineMessage(targetRecipient, messageText.trim());
    if (!sendResult.ok) {
      return NextResponse.json(
        { status: false, message: sendResult.error || "Gagal mengirim pesan ke LINE" },
        { status: 502 }
      );
    }

    // Simpan ke database sebagai pesan keluar (direction = 'out')
    await saveOutgoingMessage(
      contact.id,
      contact.line_user_id,
      contact.line_group_id,
      messageText.trim(),
      admin.username || "Admin"
    );

    return NextResponse.json({
      status: true,
      message: "Pesan berhasil dikirim ke pengguna/grup LINE!",
    });
  } catch (error: any) {
    console.error("POST /api/admin/line-chat/send error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
