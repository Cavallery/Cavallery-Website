import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { appendKasRow, updateKasStatusInSheet, deleteKasRow } from "@/lib/googleSheets";
import { syncKasToMatrix } from "@/lib/kasMatrix";
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

      const res = await query<any>(
        `INSERT INTO konfirmasi_kas (anggota_id, periode, nominal, bukti_bayar_url, status, verified_at, verified_by) 
         VALUES (?, ?, ?, ?, 'diverifikasi', NOW(), ?)`,
        [anggotaId, periode, Number(nominal), buktiBayarUrl || "", admin.nama]
      );

      const insertedId = res?.insertId || Date.now();

      // Realtime push ke Google Sheets
      const angRows = await query<any[]>("SELECT no_anggota, nama_lengkap, id_line FROM anggota WHERE id = ? LIMIT 1", [anggotaId]);
      if (angRows && angRows.length > 0) {
        const a = angRows[0];
        appendKasRow({
          id: insertedId,
          noAnggota: a.no_anggota || "-",
          namaAnggota: a.nama_lengkap,
          idLine: a.id_line,
          periode,
          nominal: Number(nominal),
          status: "diverifikasi",
          buktiBayarUrl: buktiBayarUrl || "",
          createdAt: new Date(),
        }).catch((err) => console.error("Realtime push kas manual ke Sheets error:", err));

        // Auto sync ke matriks iuran bulanan
        syncKasToMatrix({
          konfirmasiKasId: insertedId,
          anggotaId: Number(anggotaId),
          noAnggota: a.no_anggota || "-",
          periode,
          nominal: Number(nominal),
          status: "diverifikasi",
          verifiedBy: admin.nama || "Admin",
        }).catch((err) => console.error("Sync kas manual to matrix error:", err));
      }

      return NextResponse.json({
        status: true,
        message: "Data kas berhasil ditambahkan secara manual oleh admin.",
      });
    }

    // DELETE KAS
    if (action === "delete") {
      await query("DELETE FROM konfirmasi_kas WHERE id = ?", [id]);
      deleteKasRow(id).catch((e) => console.error("Delete kas from sheets error:", e));
      return NextResponse.json({
        status: true,
        message: `Data kas #${id} berhasil dihapus dari sistem & spreadsheet.`,
      });
    }

    if (!id || !action) {
      return NextResponse.json({ status: false, message: "Parameter id dan action wajib dikirim" }, { status: 400 });
    }

    let targetStatus = "diverifikasi";
    if (action === "update_status") {
      targetStatus = body.status || "diverifikasi";
    } else if (action === "tolak") {
      targetStatus = "ditolak";
    } else if (action === "pending") {
      targetStatus = "pending";
    }

    const now = new Date();

    await query(
      `UPDATE konfirmasi_kas 
       SET status = ?, verified_at = ?, verified_by = ? 
       WHERE id = ?`,
      [targetStatus, targetStatus === "diverifikasi" ? now : null, targetStatus === "diverifikasi" ? admin.nama : null, id]
    );

    // Update status baris di Google Sheets tanpa duplikasi baris
    const kasDetail = await query<any[]>(`
      SELECT k.*, a.no_anggota, a.nama_lengkap, a.id_line 
      FROM konfirmasi_kas k
      JOIN anggota a ON k.anggota_id = a.id
      WHERE k.id = ? LIMIT 1
    `, [id]);

    if (kasDetail && kasDetail.length > 0) {
      const k = kasDetail[0];
      updateKasStatusInSheet(id, targetStatus, k).catch((err) =>
        console.error("Realtime update status kas di Sheets error:", err)
      );

      // Auto sync ke matriks iuran bulanan
      syncKasToMatrix({
        konfirmasiKasId: k.id,
        anggotaId: k.anggota_id,
        noAnggota: k.no_anggota || "-",
        periode: k.periode,
        nominal: k.nominal,
        status: targetStatus,
        verifiedBy: admin.nama || "Admin",
      }).catch((err) => console.error("Sync kas to matrix error:", err));
    }

    return NextResponse.json({
      status: true,
      message: `Status kas #${id} berhasil diubah menjadi "${targetStatus}".`,
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
    deleteKasRow(id).catch((e) => console.error("Delete kas row in sheets error:", e));

    return NextResponse.json({
      status: true,
      message: `Data kas #${id} berhasil dihapus dari database & spreadsheet.`,
    });
  } catch (error: any) {
    console.error("Delete kas error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus data kas" }, { status: 500 });
  }
}
