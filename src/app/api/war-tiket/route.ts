import { NextRequest, NextResponse } from "next/server";
import { getActiveWarEvent, getMemberTicket, claimWarTicket, ensureWarTiketTables } from "@/lib/warTiket";
import { getMemberSessionFromReq } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await ensureWarTiketTables();
    const event = await getActiveWarEvent();

    if (!event) {
      return NextResponse.json({
        status: true,
        data: null,
        message: "Belum ada event war tiket yang aktif",
      });
    }

    // Cek session member
    let userTicket = null;
    const session = getMemberSessionFromReq(req);
    if (session && session.id) {
      userTicket = await getMemberTicket(event.id, session.id);
    }

    return NextResponse.json({
      status: true,
      data: {
        event: {
          id: event.id,
          judul: event.judul,
          deskripsi: event.deskripsi,
          kuota_total: Number(event.kuota_total),
          kuota_terisi: Number(event.kuota_terisi),
          sisa_kuota: Math.max(0, Number(event.kuota_total) - Number(event.kuota_terisi)),
          waktu_buka: event.waktu_buka,
          waktu_tutup: event.waktu_tutup,
          status: event.status,
          syarat_ketentuan: event.syarat_ketentuan,
          server_time: event.server_time,
        },
        userTicket,
      },
    });
  } catch (error: any) {
    console.error("GET /api/war-tiket error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat info war tiket" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getMemberSessionFromReq(req);
    if (!session || !session.id) {
      return NextResponse.json(
        { status: false, message: "Silakan login ke akun Cavallery terlebih dahulu untuk mengikuti war tiket" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const eventId = Number(body.eventId);

    if (!eventId) {
      return NextResponse.json({ status: false, message: "ID event wajib disertakan" }, { status: 400 });
    }

    const noAnggota = (session as any).noAnggota || (session as any).no_anggota || "-";
    const namaLengkap = (session as any).nama || (session as any).nama_lengkap || "Anggota Cavallery";

    const result = await claimWarTicket(
      eventId,
      session.id,
      noAnggota,
      namaLengkap
    );

    if (!result.success) {
      return NextResponse.json(
        { status: false, message: result.message, ticket: result.ticket },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: result.message,
      data: result.ticket,
    });
  } catch (error: any) {
    console.error("POST /api/war-tiket error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memproses klaim tiket" },
      { status: 500 }
    );
  }
}
