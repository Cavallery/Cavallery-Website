import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

// ── GET: Ambil daftar seluruh konfirmasi donasi ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    const rows = (await query<any[]>(`
      SELECT 
        d.id,
        d.tipe_donasi,
        d.nominal,
        d.bukti_bayar_url,
        d.status,
        d.created_at,
        d.verified_at,
        d.verified_by,
        a.id AS anggota_id,
        a.no_anggota,
        a.nama_lengkap AS anggota_nama,
        a.kontak_platform AS anggota_platform,
        a.kontak_id AS anggota_kontak,
        don.id AS donatur_id,
        don.nama AS donatur_nama,
        don.kontak_platform AS donatur_platform,
        don.kontak_id AS donatur_kontak
      FROM konfirmasi_donasi d
      LEFT JOIN anggota a ON d.anggota_id = a.id
      LEFT JOIN donatur don ON d.donatur_id = don.id
      ORDER BY d.id DESC
    `)) || [];

    const formatted = rows.map((r: any) => ({
      id: r.id,
      tipeDonasi: r.tipe_donasi,
      nominal: r.nominal,
      buktiBayarUrl: r.bukti_bayar_url,
      status: r.status,
      createdAt: r.created_at,
      verifiedAt: r.verified_at,
      verifiedBy: r.verified_by,
      namaDonatur: r.anggota_nama || r.donatur_nama || "Donatur",
      tipeUser: r.anggota_id ? "Anggota" : "Donatur",
      anggota: r.anggota_id
        ? {
            id: r.anggota_id,
            noAnggota: r.no_anggota,
            namaLengkap: r.anggota_nama,
            kontakPlatform: r.anggota_platform,
            kontakId: r.anggota_kontak,
          }
        : null,
      donatur: r.donatur_id
        ? {
            id: r.donatur_id,
            nama: r.donatur_nama,
            kontakPlatform: r.donatur_platform,
            kontakId: r.donatur_kontak,
          }
        : null,
    }));

    return NextResponse.json({
      status: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Get admin donasi error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat data donasi" }, { status: 500 });
  }
}

// ── POST: Verifikasi / Tolak / Tambah Donasi Manual ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    const body = await req.json();
    const { id, action, tipeDonasi, nominal, buktiBayarUrl, anggotaId, donaturId } = body;

    // CREATE DONASI MANUAL
    if (action === "create") {
      if (!nominal || !tipeDonasi) {
        return NextResponse.json({ status: false, message: "Nominal dan Tipe Donasi wajib diisi" }, { status: 400 });
      }

      await query(
        `INSERT INTO konfirmasi_donasi (anggota_id, donatur_id, tipe_donasi, nominal, bukti_bayar_url, status, verified_at, verified_by) 
         VALUES (?, ?, ?, ?, ?, 'diverifikasi', NOW(), ?)`,
        [anggotaId || null, donaturId || null, tipeDonasi, Number(nominal), buktiBayarUrl || "", admin.nama]
      );

      return NextResponse.json({
        status: true,
        message: "Data donasi berhasil ditambahkan secara manual oleh admin.",
      });
    }

    if (!id || !action) {
      return NextResponse.json({ status: false, message: "Parameter id dan action wajib dikirim" }, { status: 400 });
    }

    const newStatus = action === "verifikasi" ? "diverifikasi" : "ditolak";
    const now = new Date();

    await query(
      `UPDATE konfirmasi_donasi 
       SET status = ?, verified_at = ?, verified_by = ? 
       WHERE id = ?`,
      [newStatus, now, admin.nama, id]
    );

    return NextResponse.json({
      status: true,
      message: `Konfirmasi donasi #${id} berhasil di-${newStatus}.`,
    });
  } catch (error: any) {
    console.error("Action donasi error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memproses aksi donasi" }, { status: 500 });
  }
}

// ── PUT: Edit Data Donasi ──
export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { id, tipeDonasi, nominal, status } = await req.json();

    if (!id || !nominal) {
      return NextResponse.json({ status: false, message: "ID dan Nominal wajib diisi" }, { status: 400 });
    }

    await query(
      `UPDATE konfirmasi_donasi 
       SET tipe_donasi = ?, nominal = ?, status = ? 
       WHERE id = ?`,
      [tipeDonasi || "General Support", Number(nominal), status || "diverifikasi", id]
    );

    return NextResponse.json({
      status: true,
      message: `Data donasi #${id} berhasil diperbarui!`,
    });
  } catch (error: any) {
    console.error("Edit donasi error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal mengedit data donasi" }, { status: 500 });
  }
}

// ── DELETE: Hapus Data Donasi ──
export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: false, message: "Parameter id wajib dikirim" }, { status: 400 });
    }

    await query("DELETE FROM konfirmasi_donasi WHERE id = ?", [id]);

    return NextResponse.json({
      status: true,
      message: `Data donasi #${id} berhasil dihapus dari database.`,
    });
  } catch (error: any) {
    console.error("Delete donasi error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus data donasi" }, { status: 500 });
  }
}
