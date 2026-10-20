import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getContactById, sendLineMessage, saveOutgoingMessage, clearContactReplyToken } from "@/lib/lineChat";

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

    // Cek apakah ada reply token yang masih berlaku (< 55 detik sejak pesan diterima)
    let usableReplyToken: string | null = null;
    if (contact.latest_reply_token && contact.latest_reply_token_at) {
      const tokenAgeMs = Date.now() - new Date(contact.latest_reply_token_at).getTime();
      if (tokenAgeMs < 55000) {
        usableReplyToken = contact.latest_reply_token;
      }
    }

    // Kirim pesan (otomatis prioritaskan Reply Token jika aktif, atau fallback Push)
    const sendResult = await sendLineMessage(targetRecipient, messageText.trim(), usableReplyToken);
    if (!sendResult.ok) {
      return NextResponse.json(
        { status: false, message: sendResult.error || "Gagal mengirim pesan ke LINE" },
        { status: 400 }
      );
    }

    // Jika berhasil terkirim via reply, kosongkan token agar tidak dipakai ulang
    if (usableReplyToken || sendResult.mode === "reply") {
      await clearContactReplyToken(contact.id);
    }

    // Simpan ke database sebagai pesan keluar (direction = 'out')
    await saveOutgoingMessage(
      contact.id,
      contact.line_user_id,
      contact.line_group_id,
      messageText.trim(),
      admin.username || "Admin"
    );

    const modeMsg = sendResult.mode === "reply"
      ? "Pesan berhasil dibalas GRATIS via Reply Token!"
      : "Pesan berhasil dikirim via Push!";

    return NextResponse.json({
      status: true,
      message: modeMsg,
      mode: sendResult.mode,
    });
  } catch (error: any) {
    console.error("POST /api/admin/line-chat/send error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
