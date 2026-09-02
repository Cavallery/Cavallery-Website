import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { appendKontributorRow, deleteKontributorRow } from "@/lib/googleSheets";
import { query } from "@/lib/mysql";

// ── GET: Ambil daftar seluruh kontributor beserta statistik donasinya ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    let sql = `
      SELECT 
        d.id,
        d.nama,
        d.kontak_platform,
        d.kontak_id,
        d.discord,
        d.status,
        d.created_at,
        COALESCE(SUM(CASE WHEN kd.status = 'diverifikasi' THEN kd.nominal ELSE 0 END), 0) AS total_kontribusi,
        COUNT(CASE WHEN kd.status = 'diverifikasi' THEN kd.id ELSE NULL END) AS frekuensi_kontribusi,
        MAX(kd.created_at) AS terakhir_kontribusi
      FROM donatur d
      LEFT JOIN konfirmasi_donasi kd ON kd.donatur_id = d.id
    `;

    const params: any[] = [];
    if (search) {
      sql += " WHERE LOWER(d.nama) LIKE ? OR LOWER(d.kontak_id) LIKE ? OR LOWER(d.discord) LIKE ? OR LOWER(d.kontak_platform) LIKE ?";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += " GROUP BY d.id ORDER BY d.id DESC";

    const rows = (await query<any[]>(sql, params)) || [];

    const formatted = rows.map((r: any) => ({
      id: r.id,
      nama: r.nama,
      kontakPlatform: r.kontak_platform || "X (Twitter)",
      kontakId: r.kontak_id,
      discord: r.discord || "-",
      status: r.status || "aktif",
      createdAt: r.created_at,
      totalKontribusi: Number(r.total_kontribusi || 0),
      frekuensiKontribusi: Number(r.frekuensi_kontribusi || 0),
      terakhirKontribusi: r.terakhir_kontribusi,
    }));

    return NextResponse.json({
      status: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Get admin kontributor error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat data kontributor" },
      { status: 500 }
    );
  }
}

// ── POST: Tambah Kontributor Manual / Aksi Status / Hapus ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { action, id, nama, kontakPlatform, kontakId, discord, status } = body;

    // 1. TAMBAH KONTRIBUTOR MANUAL
    if (action === "create") {
      if (!nama || !kontakPlatform || !kontakId) {
        return NextResponse.json(
          { status: false, message: "Nama, Platform Kontak, dan ID Kontak wajib diisi" },
          { status: 400 }
        );
      }

      const res = await query<any>(
        `INSERT INTO donatur (nama, kontak_platform, kontak_id, discord, status) 
         VALUES (?, ?, ?, ?, 'aktif')`,
        [nama.trim(), kontakPlatform, kontakId.trim(), discord?.trim() || null]
      );

      const insertedId = res?.insertId || Date.now();

      // Realtime push ke Google Sheets
      appendKontributorRow({
        id: insertedId,
        nama: nama.trim(),
        kontakPlatform,
        kontakId: kontakId.trim(),
        discord: discord?.trim() || null,
        status: "aktif",
        totalKontribusi: 0,
        createdAt: new Date(),
      }).catch((err) => console.error("Realtime push kontributor manual ke Sheets error:", err));

      return NextResponse.json({
        status: true,
        message: `Kontributor ${nama} berhasil ditambahkan!`,
      });
    }

    // 2. UBAH STATUS (aktif / nonaktif)
    if (action === "update_status" && id && status) {
      await query("UPDATE donatur SET status = ? WHERE id = ?", [status, id]);
      return NextResponse.json({
        status: true,
        message: `Status kontributor berhasil diubah menjadi ${status}.`,
      });
    }

    // 3. HAPUS KONTRIBUTOR
    if (action === "delete" && id) {
      await query("DELETE FROM donatur WHERE id = ?", [id]);
      deleteKontributorRow(id).catch((e) => console.error("Delete kontributor in sheets error:", e));
      return NextResponse.json({
        status: true,
        message: "Data kontributor berhasil dihapus dari sistem & spreadsheet.",
      });
    }

    return NextResponse.json({ status: false, message: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    console.error("Action kontributor error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memproses aksi kontributor" },
      { status: 500 }
    );
  }
}

// ── PUT: Edit Data Kontributor ──
export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { id, nama, kontakPlatform, kontakId, discord, status } = await req.json();

    if (!id || !nama || !kontakPlatform || !kontakId) {
      return NextResponse.json(
        { status: false, message: "ID, Nama, Platform Kontak, dan ID Kontak wajib diisi" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE donatur 
       SET nama = ?, kontak_platform = ?, kontak_id = ?, discord = ?, status = ? 
       WHERE id = ?`,
      [nama.trim(), kontakPlatform, kontakId.trim(), discord?.trim() || null, status || "aktif", id]
    );

    return NextResponse.json({
      status: true,
      message: `Data kontributor ${nama} berhasil diperbarui!`,
    });
  } catch (error: any) {
    console.error("Update kontributor error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui data kontributor" },
      { status: 500 }
    );
  }
}
