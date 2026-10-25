import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { generateNextNoAnggota, ensurePinColumn } from "@/lib/membership";
import { appendAnggotaRow, deleteAnggotaRow, updateAnggotaJabatanInSheet, updateAnggotaStatusInSheet } from "@/lib/googleSheets";
import { query } from "@/lib/mysql";
import { ensureBatchTables } from "@/lib/recruitmentBatch";

let _badgeColEnsured = false;
async function ensureBadgeColumn() {
  if (_badgeColEnsured) return;
  try {
    const colCheck = await query<any[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'anggota' AND COLUMN_NAME = 'badge' LIMIT 1`
    );
    if (!colCheck || colCheck.length === 0) {
      await query("ALTER TABLE anggota ADD COLUMN badge VARCHAR(50) NOT NULL DEFAULT 'squire'");
    }
    _badgeColEnsured = true;
  } catch {
    _badgeColEnsured = true;
  }
}

function formatAnggotaRow(r: any) {
  return {
    id: r.id,
    noAnggota: r.no_anggota || "-",
    no_anggota: r.no_anggota || "-",
    namaLengkap: r.nama_lengkap || "",
    nama_lengkap: r.nama_lengkap || "",
    idLine: r.id_line || "",
    id_line: r.id_line || "",
    pin: r.pin || "",
    displayLine: r.display_line || "",
    display_line: r.display_line || "",
    discord: r.discord || "",
    gender: r.gender || "-",
    domisili: r.domisili || "-",
    kontakPlatform: r.kontak_platform || "-",
    kontak_platform: r.kontak_platform || "-",
    kontakId: r.kontak_id || "-",
    kontak_id: r.kontak_id || "-",
    status: r.status || "pending",
    jabatan: r.jabatan || "Anggota",
    divisi: r.divisi || null,
    badge: r.badge || "squire",
    batchId: r.batch_id || null,
    batch_id: r.batch_id || null,
    batchName: r.batch_name || null,
    batch_name: r.batch_name || null,
    batchYear: r.batch_year || null,
    fotoProfil: r.foto_profil || null,
    foto_profil: r.foto_profil || null,
    anggotaSejak: r.anggota_sejak,
    createdAt: r.created_at,
  };
}

// ── GET: Ambil daftar antrean pendaftar & direktori anggota ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureBadgeColumn();
    await ensurePinColumn();
    await ensureBatchTables();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const batchFilter = searchParams.get("batchId") || "";

    // 1. Antrean Pendaftar (Pending)
    let antreanSql = `
      SELECT a.*, b.name as batch_name, b.year as batch_year 
      FROM anggota a
      LEFT JOIN recruitment_batches b ON a.batch_id = b.id
      WHERE a.status = 'pending'
    `;
    const antreanParams: any[] = [];
    if (batchFilter && batchFilter !== "semua") {
      if (batchFilter === "none") {
        antreanSql += " AND a.batch_id IS NULL";
      } else {
        antreanSql += " AND a.batch_id = ?";
        antreanParams.push(Number(batchFilter));
      }
    }
    antreanSql += " ORDER BY a.id ASC";
    const antreanRaw = (await query<any[]>(antreanSql, antreanParams)) || [];

    // 2. Direktori Anggota Resmi (Aktif / Nonaktif / Admin)
    let direktoriSql = `
      SELECT a.*, b.name as batch_name, b.year as batch_year 
      FROM anggota a
      LEFT JOIN recruitment_batches b ON a.batch_id = b.id
      WHERE a.status != 'pending'
    `;
    const params: any[] = [];

    if (batchFilter && batchFilter !== "semua") {
      if (batchFilter === "none") {
        direktoriSql += " AND a.batch_id IS NULL";
      } else {
        direktoriSql += " AND a.batch_id = ?";
        params.push(Number(batchFilter));
      }
    }

    if (search) {
      direktoriSql += " AND (LOWER(a.nama_lengkap) LIKE ? OR LOWER(a.no_anggota) LIKE ? OR LOWER(a.domisili) LIKE ? OR LOWER(a.id_line) LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    direktoriSql += " ORDER BY CASE WHEN a.no_anggota IS NULL OR a.no_anggota = '' OR a.no_anggota = '-' THEN 1 ELSE 0 END, a.no_anggota ASC, a.id ASC";

    const direktoriRaw = (await query<any[]>(direktoriSql, params)) || [];

    return NextResponse.json({
      status: true,
      data: {
        antrean: antreanRaw.map(formatAnggotaRow),
        direktori: direktoriRaw.map(formatAnggotaRow),
      },
    });
  } catch (error: any) {
    console.error("GET keanggotaan error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal mengambil data keanggotaan" }, { status: 500 });
  }
}

// ── POST: Aksi Cepat (Terima, Tolak, Ubah Status, Ubah Jabatan, Ubah Badge, Hapus, Tambah Manual) ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureBadgeColumn();
    await ensurePinColumn();

    const body = await req.json();
    const { id, action, status, jabatan } = body;

    // ── CREATE / TAMBAH ANGGOTA MANUAL OLEH ADMIN ──
    if (action === "create") {
      const {
        noAnggota,
        namaLengkap,
        idLine,
        pin,
        displayLine,
        discord,
        gender,
        domisili,
        kontakPlatform,
        kontakId,
        jabatanBaru,
        divisi,
        badge,
        fotoProfil,
      } = body;

      if (!namaLengkap || !idLine) {
        return NextResponse.json({ status: false, message: "Nama Lengkap dan ID LINE wajib diisi" }, { status: 400 });
      }

      let finalNo = noAnggota?.trim().toUpperCase();
      if (!finalNo) {
        finalNo = await generateNextNoAnggota();
      }

      const now = new Date();
      try {
        await query(
          `INSERT INTO anggota 
           (no_anggota, nama_lengkap, id_line, pin, display_line, discord, gender, domisili, kontak_platform, kontak_id, status, jabatan, divisi, badge, foto_profil, anggota_sejak) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?, ?, ?, ?)`,
          [
            finalNo,
            namaLengkap.trim(),
            idLine.trim(),
            pin?.trim() || null,
            displayLine?.trim() || null,
            discord?.trim() || null,
            gender || "Laki-laki",
            domisili?.trim() || "-",
            kontakPlatform || "X (Twitter)",
            kontakId?.trim() || idLine.trim(),
            jabatanBaru || "Anggota",
            divisi?.trim() || null,
            badge || "squire",
            fotoProfil?.trim() || null,
            now,
          ]
        );
      } catch {
        // Fallback without badge/divisi column if not created yet
        await query(
          `INSERT INTO anggota 
           (no_anggota, nama_lengkap, id_line, pin, display_line, discord, gender, domisili, kontak_platform, kontak_id, status, jabatan, foto_profil, anggota_sejak) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?, ?, ?)`,
          [
            finalNo,
            namaLengkap.trim(),
            idLine.trim(),
            pin?.trim() || null,
            displayLine?.trim() || null,
            discord?.trim() || null,
            gender || "Laki-laki",
            domisili?.trim() || "-",
            kontakPlatform || "X (Twitter)",
            kontakId?.trim() || idLine.trim(),
            jabatanBaru || "Anggota",
            fotoProfil?.trim() || null,
            now,
          ]
        );
      }

      // Realtime auto-push ke Google Sheets
      appendAnggotaRow({
        noAnggota: finalNo,
        namaLengkap: namaLengkap.trim(),
        idLine: idLine.trim(),
        displayLine: displayLine?.trim() || "-",
        discord: discord?.trim() || "-",
        gender: gender || "Laki-laki",
        domisili: domisili?.trim() || "-",
        kontakPlatform: kontakPlatform || "X (Twitter)",
        kontakId: kontakId?.trim() || idLine.trim(),
        status: "aktif",
        jabatan: jabatanBaru || "Anggota",
        batch: body.batch || "-",
        anggotaSejak: now,
        createdAt: now,
      }).catch((err) => console.error("Realtime push anggota manual ke Sheets error:", err));

      return NextResponse.json({
        status: true,
        message: `Anggota ${namaLengkap} (${finalNo}) berhasil ditambahkan!`,
      });
    }

    // ── BULK / MULTI-SELEKSI ACTIONS (STATUS & DELETE) ──
    if (action === "bulk_update_status") {
      const { ids, status: newStatus } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ status: false, message: "Daftar ID anggota tidak boleh kosong" }, { status: 400 });
      }
      if (!newStatus || !["aktif", "nonaktif", "pending"].includes(newStatus)) {
        return NextResponse.json({ status: false, message: "Status yang dipilih tidak valid" }, { status: 400 });
      }

      const placeholders = ids.map(() => "?").join(",");
      await query(`UPDATE anggota SET status = ? WHERE id IN (${placeholders})`, [newStatus, ...ids]);

      // Ambil no_anggota untuk sinkronisasi Google Sheets (non-blocking)
      try {
        const affected = await query<any[]>(`SELECT no_anggota FROM anggota WHERE id IN (${placeholders})`, ids);
        (affected || []).forEach((row) => {
          if (row.no_anggota && row.no_anggota !== "-") {
            updateAnggotaStatusInSheet(row.no_anggota, newStatus).catch(() => {});
          }
        });
      } catch {}

      return NextResponse.json({
        status: true,
        message: `Berhasil mengubah status ${ids.length} anggota menjadi "${newStatus}"!`,
        totalUpdated: ids.length,
      });
    }

    if (action === "bulk_delete") {
      const { ids } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ status: false, message: "Daftar ID anggota tidak boleh kosong" }, { status: 400 });
      }

      const placeholders = ids.map(() => "?").join(",");
      const angRows = await query<any[]>(`SELECT id, no_anggota FROM anggota WHERE id IN (${placeholders})`, ids);
      const noAnggotaList = (angRows || [])
        .map((r) => r.no_anggota)
        .filter((no) => no && no !== "-");

      // Cascade delete relasi agar bersih
      await query(`DELETE FROM konfirmasi_kas WHERE anggota_id IN (${placeholders})`, ids);
      await query(`DELETE FROM kupon_anggota WHERE anggota_id IN (${placeholders})`, ids);
      await query(`DELETE FROM war_tiket_peserta WHERE anggota_id IN (${placeholders})`, ids);

      if (noAnggotaList.length > 0) {
        const noPlaceholders = noAnggotaList.map(() => "?").join(",");
        await query(
          `DELETE FROM iuran_kas_bulanan WHERE anggota_id IN (${placeholders}) OR no_anggota IN (${noPlaceholders})`,
          [...ids, ...noAnggotaList]
        );
        noAnggotaList.forEach((no) => {
          deleteAnggotaRow(no).catch(() => {});
        });
      } else {
        await query(`DELETE FROM iuran_kas_bulanan WHERE anggota_id IN (${placeholders})`, ids);
      }

      await query(`DELETE FROM anggota WHERE id IN (${placeholders})`, ids);

      return NextResponse.json({
        status: true,
        message: `Berhasil menghapus ${ids.length} anggota secara permanen dari database & riwayatnya!`,
        totalDeleted: ids.length,
      });
    }

    if (!id || !action) {
      return NextResponse.json({ status: false, message: "Parameter id dan action wajib dikirim" }, { status: 400 });
    }

    const rows = await query<any[]>(
      `SELECT a.*, b.name AS batch_name 
       FROM anggota a 
       LEFT JOIN recruitment_batches b ON a.batch_id = b.id 
       WHERE a.id = ? LIMIT 1`,
      [id]
    );
    const anggota = rows && rows.length > 0 ? rows[0] : null;

    if (!anggota) {
      return NextResponse.json({ status: false, message: "Data anggota tidak ditemukan" }, { status: 404 });
    }

    // 1. TERIMA PENDAFTAR
    if (action === "terima") {
      let noAnggota = anggota.no_anggota;
      if (!noAnggota || noAnggota.trim() === "" || noAnggota === "-") {
        noAnggota = await generateNextNoAnggota();
      }

      const now = new Date();
      await query(
        `UPDATE anggota 
         SET no_anggota = ?, status = 'aktif', anggota_sejak = ? 
         WHERE id = ?`,
        [noAnggota, now, id]
      );

      // Fire-and-forget push ke Google Sheets Tab "Anggota"
      const batchLabel = anggota.batch_name || (anggota.batch_id ? `Batch ${anggota.batch_id}` : "-");
      appendAnggotaRow({
        noAnggota,
        namaLengkap: anggota.nama_lengkap,
        idLine: anggota.id_line,
        displayLine: anggota.display_line || "-",
        discord: anggota.discord || "-",
        gender: anggota.gender,
        domisili: anggota.domisili,
        kontakPlatform: anggota.kontak_platform,
        kontakId: anggota.kontak_id,
        status: "aktif",
        jabatan: anggota.jabatan || "Anggota",
        batch: batchLabel,
        anggotaSejak: now,
        createdAt: now,
      }).catch((err) => console.error("Background Google Sheet Anggota error:", err));

      return NextResponse.json({
        status: true,
        message: `Pendaftar ${anggota.nama_lengkap} berhasil diterima dengan Nomor Anggota ${noAnggota}!`,
        noAnggota,
      });
    }

    // 2. TOLAK PENDAFTAR
    if (action === "tolak") {
      await query("UPDATE anggota SET status = 'ditolak' WHERE id = ?", [id]);
      return NextResponse.json({
        status: true,
        message: `Pendaftaran ${anggota.nama_lengkap} telah ditolak.`,
      });
    }

    // 3. UBAH STATUS (aktif / nonaktif)
    if (action === "update_status" && status) {
      await query("UPDATE anggota SET status = ? WHERE id = ?", [status, id]);
      if (anggota && anggota.no_anggota) {
        updateAnggotaStatusInSheet(anggota.no_anggota, status).catch((e) =>
          console.error("Update status anggota in sheets error:", e)
        );
      }
      return NextResponse.json({
        status: true,
        message: `Status anggota ${anggota.nama_lengkap} berhasil diubah menjadi ${status}.`,
      });
    }

    // 4. UBAH JABATAN (Jadikan Admin Fanbase / Pengurus / Anggota)
    if (action === "update_jabatan" && jabatan) {
      const { divisi } = body;
      try {
        if (jabatan === "Admin Fanbase" && divisi) {
          await query("UPDATE anggota SET jabatan = ?, divisi = ? WHERE id = ?", [jabatan, divisi, id]);
        } else if (jabatan === "Anggota") {
          await query("UPDATE anggota SET jabatan = ?, divisi = NULL WHERE id = ?", [jabatan, id]);
        } else {
          await query("UPDATE anggota SET jabatan = ? WHERE id = ?", [jabatan, id]);
        }
      } catch {
        await query("UPDATE anggota SET jabatan = ? WHERE id = ?", [jabatan, id]);
      }

      const fullJabatan = jabatan === "Admin Fanbase" && divisi
        ? `Admin Fanbase (${divisi})`
        : jabatan;

      if (anggota && anggota.no_anggota) {
        updateAnggotaJabatanInSheet(anggota.no_anggota, fullJabatan).catch((e) =>
          console.error("Update jabatan anggota in sheets error:", e)
        );
      }

      return NextResponse.json({
        status: true,
        message: `Jabatan anggota ${anggota.nama_lengkap} berhasil diubah menjadi "${fullJabatan}".`,
      });
    }

    // 5. UBAH BADGE ANGGOTA
    if (action === "update_badge") {
      const { badge } = body;
      const targetBadge = badge || "squire";
      try {
        await query("UPDATE anggota SET badge = ? WHERE id = ?", [targetBadge, id]);
      } catch {
        await ensureBadgeColumn();
        await query("UPDATE anggota SET badge = ? WHERE id = ?", [targetBadge, id]);
      }
      return NextResponse.json({
        status: true,
        message: `Badge anggota ${anggota.nama_lengkap} berhasil diubah menjadi "${targetBadge}".`,
      });
    }

    // 6. HAPUS ANGGOTA
    if (action === "delete") {
      await query("DELETE FROM anggota WHERE id = ?", [id]);
      if (anggota && anggota.no_anggota) {
        deleteAnggotaRow(anggota.no_anggota).catch((e) => console.error("Delete anggota in sheets error:", e));
      }
      return NextResponse.json({
        status: true,
        message: `Data anggota ${anggota.nama_lengkap} (${anggota.no_anggota || "-"}) berhasil dihapus dari sistem & spreadsheet.`,
      });
    }

    return NextResponse.json({ status: false, message: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error: any) {
    console.error("Action keanggotaan error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memproses aksi keanggotaan" }, { status: 500 });
  }
}

// ── PUT: EDIT DATA LENGKAP ANGGOTA (UPDATE) ──
export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensureBadgeColumn();
    await ensurePinColumn();

    const body = await req.json();
    const {
      id,
      noAnggota,
      namaLengkap,
      idLine,
      pin,
      displayLine,
      discord,
      gender,
      domisili,
      kontakPlatform,
      kontakId,
      status,
      jabatan,
      divisi,
      badge,
      batchId,
      fotoProfil,
      anggotaSejak,
    } = body;

    const cleanNama = (namaLengkap || "").trim();
    const cleanIdLine = (idLine || kontakId || "-").trim();

    if (!id || !cleanNama) {
      return NextResponse.json({ status: false, message: "ID dan Nama Lengkap wajib diisi" }, { status: 400 });
    }

    let joinDate: Date = new Date();
    if (anggotaSejak) {
      const parsedDate = new Date(anggotaSejak);
      if (!isNaN(parsedDate.getTime())) {
        joinDate = parsedDate;
      }
    }

    const cleanNoAnggota = noAnggota && noAnggota !== "-" ? noAnggota.trim().toUpperCase() : null;

    let updateRes = await query(
      `UPDATE anggota 
       SET no_anggota = ?, nama_lengkap = ?, id_line = ?, pin = ?, display_line = ?, discord = ?, gender = ?, domisili = ?, kontak_platform = ?, kontak_id = ?, status = ?, jabatan = ?, divisi = ?, badge = ?, batch_id = ?, foto_profil = ?, anggota_sejak = ? 
       WHERE id = ?`,
      [
        cleanNoAnggota,
        cleanNama,
        cleanIdLine,
        pin !== undefined ? (pin?.trim() || null) : null,
        displayLine?.trim() || null,
        discord?.trim() || null,
        gender || "Laki-laki",
        domisili?.trim() || "-",
        kontakPlatform || "X (Twitter)",
        kontakId?.trim() || cleanIdLine,
        status || "aktif",
        jabatan || "Anggota",
        divisi?.trim() || null,
        badge || "squire",
        batchId !== undefined ? (batchId ? Number(batchId) : null) : null,
        fotoProfil !== undefined ? (fotoProfil?.trim() || null) : null,
        joinDate,
        id,
      ]
    );

    if (!updateRes) {
      // Coba fallback tanpa kolom divisi / badge jika skema lama
      updateRes = await query(
        `UPDATE anggota 
         SET no_anggota = ?, nama_lengkap = ?, id_line = ?, pin = ?, display_line = ?, discord = ?, gender = ?, domisili = ?, kontak_platform = ?, kontak_id = ?, status = ?, jabatan = ?, foto_profil = ?, anggota_sejak = ? 
         WHERE id = ?`,
        [
          cleanNoAnggota,
          cleanNama,
          cleanIdLine,
          pin !== undefined ? (pin?.trim() || null) : null,
          displayLine?.trim() || null,
          discord?.trim() || null,
          gender || "Laki-laki",
          domisili?.trim() || "-",
          kontakPlatform || "X (Twitter)",
          kontakId?.trim() || cleanIdLine,
          status || "aktif",
          jabatan || "Anggota",
          fotoProfil !== undefined ? (fotoProfil?.trim() || null) : null,
          joinDate,
          id,
        ]
      );
    }

    if (!updateRes) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Gagal menyimpan ke database. Pastikan Nomor Anggota atau ID LINE tidak duplikat dengan anggota lain.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: `Data anggota ${cleanNama} berhasil diperbarui!`,
    });
  } catch (error: any) {
    console.error("Edit anggota error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal mengedit data anggota" }, { status: 500 });
  }
}

// ── DELETE: HAPUS ANGGOTA SECARA PERMANEN (DELETE) ──
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

    // Cascade delete relasi terkait anggota agar tidak meninggalkan data yatim di SQL
    const angRows = await query<any[]>("SELECT no_anggota FROM anggota WHERE id = ?", [id]);
    const noAnggota = angRows && angRows.length > 0 ? angRows[0].no_anggota : null;

    await query("DELETE FROM konfirmasi_kas WHERE anggota_id = ?", [id]);
    if (noAnggota) {
      await query("DELETE FROM iuran_kas_bulanan WHERE anggota_id = ? OR no_anggota = ?", [id, noAnggota]);
    } else {
      await query("DELETE FROM iuran_kas_bulanan WHERE anggota_id = ?", [id]);
    }
    await query("DELETE FROM kupon_anggota WHERE anggota_id = ?", [id]);
    await query("DELETE FROM war_tiket_peserta WHERE anggota_id = ?", [id]);
    await query("DELETE FROM anggota WHERE id = ?", [id]);

    return NextResponse.json({
      status: true,
      message: `Anggota #${id} beserta seluruh data riwayatnya berhasil dihapus dari database.`,
    });
  } catch (error: any) {
    console.error("Delete anggota error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus anggota" }, { status: 500 });
  }
}
