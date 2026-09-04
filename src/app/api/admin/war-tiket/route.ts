import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mysql";
import { ensureWarTiketTables } from "@/lib/warTiket";
import { getAdminSessionFromReq } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensureWarTiketTables();

    // 1. Ambil event aktif
    const events = (await query<any[]>(
      "SELECT *, NOW() AS server_time FROM war_tiket_events ORDER BY id DESC LIMIT 10"
    )) || [];

    const activeEvent = events[0] || null;
    let pesertaList: any[] = [];

    if (activeEvent) {
      pesertaList = (await query<any[]>(
        `SELECT 
           p.*,
           a.jabatan,
           a.divisi,
           a.id_line,
           a.kontak_platform,
           a.kontak_id
         FROM war_tiket_peserta p
         LEFT JOIN anggota a ON p.anggota_id = a.id
         WHERE p.event_id = ?
         ORDER BY p.id ASC`,
        [activeEvent.id]
      )) || [];
    }

    return NextResponse.json({
      status: true,
      data: {
        event: activeEvent,
        events,
        peserta: pesertaList,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/war-tiket error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat data admin war tiket" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensureWarTiketTables();
    const {
      id,
      judul,
      kodeTiket,
      subjudul,
      lokasiEvent,
      tanggalEvent,
      kategoriTiket,
      deskripsi,
      kuotaTotal,
      waktuBuka,
      waktuTutup,
      status,
      syaratKetentuan,
    } = body;

    if (!judul || !waktuBuka || !waktuTutup) {
      return NextResponse.json({ status: false, message: "Judul, waktu buka, dan waktu tutup wajib diisi" }, { status: 400 });
    }

    const kuota = Math.max(1, Number(kuotaTotal) || 50);
    const prefix = (kodeTiket || "STS19").trim().toUpperCase();

    if (id) {
      // Update event yang ada
      await query(
        `UPDATE war_tiket_events 
         SET judul = ?, kode_tiket = ?, subjudul = ?, lokasi_event = ?, tanggal_event = ?, kategori_tiket = ?, deskripsi = ?, kuota_total = ?, waktu_buka = ?, waktu_tutup = ?, status = ?, syarat_ketentuan = ?
         WHERE id = ?`,
        [
          judul,
          prefix,
          subjudul || "Cavallery • Official Fanbase Erine JKT48",
          lokasiEvent || "Theater JKT48, fX Sudirman Lt. 4",
          tanggalEvent || "Sabtu, 26 September 2026 • 19.00 WIB",
          kategoriTiket || "OFFICIAL VIP PASS • TEAM PASSION",
          deskripsi || "",
          kuota,
          waktuBuka,
          waktuTutup,
          status || "buka",
          syaratKetentuan || "",
          id,
        ]
      );
    } else {
      // Buat event baru
      await query(
        `INSERT INTO war_tiket_events 
         (judul, kode_tiket, subjudul, lokasi_event, tanggal_event, kategori_tiket, deskripsi, kuota_total, kuota_terisi, waktu_buka, waktu_tutup, status, syarat_ketentuan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [
          judul,
          prefix,
          subjudul || "Cavallery • Official Fanbase Erine JKT48",
          lokasiEvent || "Theater JKT48, fX Sudirman Lt. 4",
          tanggalEvent || "Sabtu, 26 September 2026 • 19.00 WIB",
          kategoriTiket || "OFFICIAL VIP PASS • TEAM PASSION",
          deskripsi || "",
          kuota,
          waktuBuka,
          waktuTutup,
          status || "buka",
          syaratKetentuan || "",
        ]
      );
    }

    return NextResponse.json({
      status: true,
      message: "Pengaturan War Tiket berhasil disimpan!",
    });
  } catch (error: any) {
    console.error("POST /api/admin/war-tiket error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menyimpan event war tiket" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pesertaId = searchParams.get("pesertaId");

    if (pesertaId) {
      // Ambil event_id dari peserta sebelum dihapus untuk mengurangi kuota_terisi
      const p = await query<any[]>("SELECT event_id FROM war_tiket_peserta WHERE id = ? LIMIT 1", [pesertaId]);
      if (p && p.length > 0) {
        const eventId = p[0].event_id;
        await query("DELETE FROM war_tiket_peserta WHERE id = ?", [pesertaId]);
        // Kurangi kuota_terisi
        await query(
          "UPDATE war_tiket_events SET kuota_terisi = GREATEST(0, kuota_terisi - 1) WHERE id = ?",
          [eventId]
        );
      }
      return NextResponse.json({ status: true, message: "Tiket peserta berhasil dicabut" });
    }

    return NextResponse.json({ status: false, message: "Parameter tidak valid" }, { status: 400 });
  } catch (error: any) {
    console.error("DELETE /api/admin/war-tiket error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memproses pembatalan tiket" },
      { status: 500 }
    );
  }
}
