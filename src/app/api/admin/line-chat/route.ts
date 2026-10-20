import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import {
  getContacts,
  getMessages,
  markContactRead,
  getContactById,
  deleteMessage,
  clearContactMessages,
  deleteContact,
} from "@/lib/lineChat";

// GET: Ambil daftar kontak (atau riwayat pesan jika ada contactId query)
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");
    const search = searchParams.get("search") || undefined;

    // Jika diminta detail percakapan per kontak
    if (contactId) {
      const cId = parseInt(contactId, 10);
      if (isNaN(cId)) {
        return NextResponse.json({ status: false, message: "contactId tidak valid" }, { status: 400 });
      }

      const contact = await getContactById(cId);
      if (!contact) {
        return NextResponse.json({ status: false, message: "Kontak tidak ditemukan" }, { status: 404 });
      }

      const messages = await getMessages(cId, 100);
      // Tandai sudah dibaca
      await markContactRead(cId);

      return NextResponse.json({
        status: true,
        contact,
        messages,
      });
    }

    // Ambil semua kontak
    const contacts = await getContacts(search);
    return NextResponse.json({
      status: true,
      contacts,
    });
  } catch (error: any) {
    console.error("GET /api/admin/line-chat error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal mengambil data chat" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus pesan individual, bersihkan seluruh chat, atau hapus kontak
export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");
    const contactId = searchParams.get("contactId");
    const action = searchParams.get("action"); // "clear_chat" | "delete_contact"

    // 1. Hapus 1 pesan tertentu
    if (messageId) {
      await deleteMessage(Number(messageId));
      return NextResponse.json({
        status: true,
        message: "Pesan berhasil dihapus dari database",
      });
    }

    // 2. Bersihkan seluruh pesan kontak (Clear Chat)
    if (contactId && action === "clear_chat") {
      await clearContactMessages(Number(contactId));
      return NextResponse.json({
        status: true,
        message: "Seluruh pesan percakapan berhasil dibersihkan",
      });
    }

    // 3. Hapus kontak beserta pesannya
    if (contactId && action === "delete_contact") {
      await deleteContact(Number(contactId));
      return NextResponse.json({
        status: true,
        message: "Kontak beserta seluruh riwayat pesannya berhasil dihapus",
      });
    }

    return NextResponse.json(
      { status: false, message: "Parameter penghapusan tidak valid" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/line-chat error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menghapus pesan" },
      { status: 500 }
    );
  }
}

