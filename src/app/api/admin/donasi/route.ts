import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { appendDonasiRow, updateDonasiStatusInSheet, deleteDonasiRow } from "@/lib/googleSheets";
import { query } from "@/lib/mysql";

// ── GET: Ambil daftar seluruh konfirmasi donasi ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    // Auto-fix: Jika ID 1 kosong dan donasi pertama tercatat sebagai ID 2, ubah ke ID 1
    try {
      const checkOne = await query<any[]>("SELECT id FROM konfirmasi_donasi WHERE id = 1 LIMIT 1");
      if (!checkOne || checkOne.length === 0) {
        const checkTwo = await query<any[]>("SELECT id FROM konfirmasi_donasi WHERE id = 2 LIMIT 1");
        if (checkTwo && checkTwo.length > 0) {
          await query("UPDATE konfirmasi_donasi SET id = 1 WHERE id = 2");
          await query("ALTER TABLE konfirmasi_donasi AUTO_INCREMENT = 2");
        }
      }
    } catch (err: any) {
      console.warn("Donasi renumber check warning:", err?.message);
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

      const res = await query<any>(
        `INSERT INTO konfirmasi_donasi (anggota_id, donatur_id, tipe_donasi, nominal, bukti_bayar_url, status, verified_at, verified_by) 
         VALUES (?, ?, ?, ?, ?, 'diverifikasi', NOW(), ?)`,
        [anggotaId || null, donaturId || null, tipeDonasi, Number(nominal), buktiBayarUrl || "", admin.nama]
      );

      const insertedId = res?.insertId || Date.now();

      // Realtime push ke Google Sheets
      let donorName = "Kontributor";
      let donorIdentitas = "-";
      let donorKontak = "-";
      let donorType: "Anggota" | "Donatur" = "Donatur";

      if (anggotaId) {
        const angRows = await query<any[]>("SELECT no_anggota, nama_lengkap, kontak_id, id_line FROM anggota WHERE id = ? LIMIT 1", [anggotaId]);
        if (angRows && angRows.length > 0) {
          donorName = angRows[0].nama_lengkap;
          donorIdentitas = angRows[0].no_anggota || "-";
          donorKontak = angRows[0].kontak_id || angRows[0].id_line;
          donorType = "Anggota";
        }
      } else if (donaturId) {
        const donRows = await query<any[]>("SELECT nama, kontak_id FROM donatur WHERE id = ? LIMIT 1", [donaturId]);
        if (donRows && donRows.length > 0) {
          donorName = donRows[0].nama;
          donorIdentitas = donRows[0].kontak_id;
          donorKontak = donRows[0].kontak_id;
        }
      }

      appendDonasiRow({
        id: insertedId,
        tipeDonatur: donorType,
        identitas: donorIdentitas,
        nama: donorName,
        kontak: donorKontak,
        tipeDonasi,
        nominal: Number(nominal),
        status: "diverifikasi",
        buktiBayarUrl: buktiBayarUrl || "",
        createdAt: new Date(),
      }).catch((err) => console.error("Realtime push donasi manual ke Sheets error:", err));

      return NextResponse.json({
        status: true,
        message: "Data donasi berhasil ditambahkan secara manual oleh admin.",
      });
    }

    // DELETE DONASI
    if (action === "delete") {
      await query("DELETE FROM konfirmasi_donasi WHERE id = ?", [id]);
      deleteDonasiRow(id).catch((e) => console.error("Delete donasi from sheets error:", e));
      return NextResponse.json({
        status: true,
        message: `Data donasi / kontribusi #${id} berhasil dihapus dari sistem & spreadsheet.`,
      });
    }

    if (action === "update_id") {
      const { oldId, newId } = body;
      if (oldId && newId) {
        await query("UPDATE konfirmasi_donasi SET id = ? WHERE id = ?", [newId, oldId]);
        return NextResponse.json({ status: true, message: `ID donasi #${oldId} berhasil diubah menjadi #${newId}` });
      }
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
      `UPDATE konfirmasi_donasi 
       SET status = ?, verified_at = ?, verified_by = ? 
       WHERE id = ?`,
      [targetStatus, targetStatus === "diverifikasi" ? now : null, targetStatus === "diverifikasi" ? admin.nama : null, id]
    );

    // Update status baris di Google Sheets tanpa duplikasi baris
    const donDetail = await query<any[]>(`
      SELECT d.*, 
        COALESCE(a.nama_lengkap, don.nama, 'Kontributor') AS donor_name,
        COALESCE(a.no_anggota, don.kontak_id, '-') AS donor_identitas,
        COALESCE(a.kontak_id, don.kontak_id, '-') AS donor_kontak,
        CASE WHEN a.id IS NOT NULL THEN 'Anggota' ELSE 'Donatur' END AS donor_type
      FROM konfirmasi_donasi d
      LEFT JOIN anggota a ON d.anggota_id = a.id
      LEFT JOIN donatur don ON d.donatur_id = don.id
      WHERE d.id = ? LIMIT 1
    `, [id]);

    if (donDetail && donDetail.length > 0) {
      const d = donDetail[0];
      updateDonasiStatusInSheet(id, targetStatus, {
        tipeDonatur: d.donor_type,
        identitas: d.donor_identitas,
        nama: d.donor_name,
        kontak: d.donor_kontak,
        tipeDonasi: d.tipe_donasi,
        nominal: d.nominal,
        buktiBayarUrl: d.bukti_bayar_url,
        createdAt: d.created_at,
      }).catch((err) =>
        console.error("Realtime update status donasi di Sheets error:", err)
      );
    }

    return NextResponse.json({
      status: true,
      message: `Status donasi #${id} berhasil diubah menjadi "${targetStatus}".`,
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
    deleteDonasiRow(id).catch((e) => console.error("Delete donasi row in sheets error:", e));

    return NextResponse.json({
      status: true,
      message: `Data donasi #${id} berhasil dihapus dari database & spreadsheet.`,
    });
  } catch (error: any) {
    console.error("Delete donasi error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus data donasi" }, { status: 500 });
  }
}
