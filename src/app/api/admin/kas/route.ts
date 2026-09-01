import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

// ── GET: Ambil daftar seluruh konfirmasi kas ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    const rows = (await query<any[]>(`
      SELECT 
        k.id,
        k.periode,
        k.nominal,
        k.bukti_bayar_url,
        k.status,
        k.created_at,
        k.verified_at,
        k.verified_by,
        COALESCE(a.id, k.anggota_id) AS anggota_id,
        COALESCE(a.no_anggota, '-') AS no_anggota,
        COALESCE(a.nama_lengkap, 'Member Cavallery') AS nama_lengkap,
        COALESCE(a.id_line, '-') AS id_line,
        COALESCE(a.domisili, '-') AS domisili
      FROM konfirmasi_kas k
      LEFT JOIN anggota a ON k.anggota_id = a.id
      ORDER BY k.id DESC
    `)) || [];

    // Map columns to match frontend expectations perfectly
    const formatted = rows.map((r: any) => ({
      id: r.id,
      periode: r.periode,
      nominal: r.nominal,
      buktiBayarUrl: r.bukti_bayar_url,
      status: r.status,
      createdAt: r.created_at,
      verifiedAt: r.verified_at,
      verifiedBy: r.verified_by,
      namaLengkap: r.nama_lengkap,
      noAnggota: r.no_anggota,
      anggota: {
        id: r.anggota_id,
        noAnggota: r.no_anggota,
        namaLengkap: r.nama_lengkap,
        idLine: r.id_line,
        domisili: r.domisili,
      },
    }));

    return NextResponse.json({
      status: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Get admin kas error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat data kas" }, { status: 500 });
  }
}

// ── POST: Verifikasi / Tolak / Tambah Kas Manual ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    const body = await req.json();
    const { id, action, anggotaId, periode, nominal, buktiBayarUrl } = body;

    // CREATE KAS MANUAL
    if (action === "create") {
      if (!anggotaId || !periode || !nominal) {
        return NextResponse.json({ status: false, message: "Anggota, Periode, dan Nominal wajib diisi" }, { status: 400 });
      }

      await query(
        `INSERT INTO konfirmasi_kas (anggota_id, periode, nominal, bukti_bayar_url, status, verified_at, verified_by) 
         VALUES (?, ?, ?, ?, 'diverifikasi', NOW(), ?)`,
        [anggotaId, periode, Number(nominal), buktiBayarUrl || "", admin.nama]
      );

      return NextResponse.json({
        status: true,
        message: "Data kas berhasil ditambahkan secara manual oleh admin.",
      });
    }

    if (!id || !action) {
      return NextResponse.json({ status: false, message: "Parameter id dan action wajib dikirim" }, { status: 400 });
    }

    const newStatus = action === "verifikasi" ? "diverifikasi" : "ditolak";
    const now = new Date();

    await query(
      `UPDATE konfirmasi_kas 
       SET status = ?, verified_at = ?, verified_by = ? 
       WHERE id = ?`,
      [newStatus, now, admin.nama, id]
    );

    return NextResponse.json({
      status: true,
      message: `Pembayaran kas #${id} berhasil di-${newStatus}.`,
    });
  } catch (error: any) {
    console.error("Action kas error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memproses aksi kas" }, { status: 500 });
  }
}

// ── PUT: Edit Data Kas ──
export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { id, periode, nominal, status } = await req.json();

    if (!id || !periode || !nominal) {
      return NextResponse.json({ status: false, message: "ID, Periode, dan Nominal wajib diisi" }, { status: 400 });
    }

    await query(
      `UPDATE konfirmasi_kas 
       SET periode = ?, nominal = ?, status = ? 
       WHERE id = ?`,
      [periode.trim(), Number(nominal), status || "diverifikasi", id]
    );

    return NextResponse.json({
      status: true,
      message: `Data pembayaran kas #${id} berhasil diperbarui!`,
    });
  } catch (error: any) {
    console.error("Edit kas error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal mengedit data kas" }, { status: 500 });
  }
}

// ── DELETE: Hapus Data Kas ──
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

    await query("DELETE FROM konfirmasi_kas WHERE id = ?", [id]);

    return NextResponse.json({
      status: true,
      message: `Data kas #${id} berhasil dihapus dari database.`,
    });
  } catch (error: any) {
    console.error("Delete kas error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus data kas" }, { status: 500 });
  }
}
