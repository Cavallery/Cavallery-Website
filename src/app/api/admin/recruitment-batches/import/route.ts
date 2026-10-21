import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import { ensureBatchTables, getBatchByName, createBatch } from "@/lib/recruitmentBatch";
import { ensurePinColumn } from "@/lib/membership";
import { syncKasToMatrix } from "@/lib/kasMatrix";
import { appendAnggotaRow } from "@/lib/googleSheets";

interface ImportMemberItem {
  noAnggota?: string;
  nama: string;
  idLine: string;
  displayLine?: string;
  gender?: string;
  domisili?: string;
  kontakPlatform?: string;
  kontakId?: string;
  nominalKas?: number;
  tanggalJoin?: string;
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak. Silakan login sebagai admin." }, { status: 401 });
    }

    await ensureBatchTables();
    await ensurePinColumn();

    const body = await req.json();
    const { batchName, members, autoCreateKas, startMonth, year } = body;

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ status: false, message: "Daftar anggota yang akan diimport kosong" }, { status: 400 });
    }

    const currentYear = Number(year) || new Date().getFullYear();
    const currentMonth = Number(startMonth) || new Date().getMonth() + 1; // 1-12

    // 1. Dapatkan atau buat batch
    const targetBatchName = (batchName || "Batch 9").trim();
    let batch = await getBatchByName(targetBatchName);
    let batchId: number;

    if (!batch) {
      batchId = await createBatch({
        name: targetBatchName,
        year: currentYear,
        description: `Rekrutmen Resmi ${targetBatchName} (${currentYear})`,
        status: "open",
      });
    } else {
      batchId = batch.id;
    }

    // 2. Dapatkan nomor urut anggota terakhir yang ada di database
    const allMembers = await query<any[]>(
      "SELECT no_anggota FROM anggota WHERE no_anggota IS NOT NULL AND no_anggota != ''"
    );

    let highestNum = 0;
    (allMembers || []).forEach((row) => {
      const match = (row.no_anggota || "").match(/CAVA-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > highestNum) highestNum = num;
      }
    });

    const results: any[] = [];
    const errors: string[] = [];

    // 3. Iterasi dan proses setiap anggota
    for (let i = 0; i < members.length; i++) {
      const m: ImportMemberItem = members[i];
      const nama = (m.nama || "").trim();
      if (!nama) continue;

      let idLine = (m.idLine || "").trim();
      const displayLine = (m.displayLine || nama).trim();
      const rawGender = (m.gender || "").toLowerCase();
      let gender = "-";
      if (rawGender.includes("perempuan") || rawGender === "p" || rawGender === "f") {
        gender = "Perempuan";
      } else if (rawGender.includes("laki") || rawGender === "l" || rawGender === "m") {
        gender = "Laki-laki";
      }

      const domisili = (m.domisili || "-").trim();
      const kontakPlatform = (m.kontakPlatform || "LINE").trim();
      const kontakId = (m.kontakId || idLine || "-").trim();

      // Jika ID Line kosong, buat fallback unik
      if (!idLine) {
        idLine = `line_${nama.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now().toString().slice(-4)}`;
      }

      // Tentukan nomor anggota
      let noAnggota = m.noAnggota?.trim();
      if (!noAnggota || !noAnggota.startsWith("CAVA-")) {
        highestNum++;
        noAnggota = `CAVA-${String(highestNum).padStart(4, "0")}`;
      } else {
        // Update highestNum jika noAnggota kustom lebih tinggi
        const match = noAnggota.match(/CAVA-(\d+)/i);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > highestNum) highestNum = num;
        }
      }

      // Cek apakah no_anggota atau id_line sudah ada di database
      const existing = await query<any[]>(
        "SELECT id, no_anggota, nama_lengkap FROM anggota WHERE no_anggota = ? OR (id_line = ? AND id_line NOT LIKE 'line_cava%') LIMIT 1",
        [noAnggota, idLine]
      );

      let memberId: number;

      if (existing && existing.length > 0) {
        memberId = existing[0].id;
        // Update batch dan status
        await query(
          "UPDATE anggota SET batch_id = ?, status = 'aktif', nama_lengkap = ?, display_line = ?, gender = ?, domisili = ?, kontak_platform = ?, kontak_id = ? WHERE id = ?",
          [batchId, nama, displayLine, gender, domisili, kontakPlatform, kontakId, memberId]
        );
      } else {
        // Insert Anggota Baru
        const insertRes = await query<any>(
          `INSERT INTO anggota (
            no_anggota, nama_lengkap, id_line, display_line, gender, domisili,
            kontak_platform, kontak_id, status, jabatan, badge, batch_id,
            anggota_sejak, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aktif', 'Anggota', 'squire', ?, NOW(), NOW())`,
          [noAnggota, nama, idLine, displayLine, gender, domisili, kontakPlatform, kontakId, batchId]
        );
        memberId = insertRes.insertId;
      }

      // 4. Catat Kas Pembayaran Rp 30.000 jika opsi aktif
      const nominal = Number(m.nominalKas) || 30000;
      if (autoCreateKas !== false && nominal > 0) {
        try {
          const MONTH_NAMES = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ];
          const periodName = `${MONTH_NAMES[currentMonth - 1] || "Bulan " + currentMonth} ${currentYear}`;

          // Insert ke konfirmasi_kas
          const kasRes = await query<any>(
            `INSERT INTO konfirmasi_kas (
              anggota_id, periode, nominal, bukti_bayar_url, status,
              verified_at, verified_by, created_at
            ) VALUES (?, ?, ?, 'PEMBAYARAN_REKRUTMEN_BATCH', 'diverifikasi', NOW(), ?, NOW())`,
            [memberId, periodName, nominal, admin.username || "Admin"]
          );
          const konfirmasiKasId = kasRes.insertId;

          // Catat ke matriks iuran_kas_bulanan (Rp 30.000 = 2 bulan @ Rp 15.000)
          // Bulan 1: bulan bergabung (currentMonth)
          await syncKasToMatrix({
            konfirmasiKasId,
            anggotaId: memberId,
            noAnggota,
            periodeStr: periodName,
            nominalTotal: 15000,
            verifiedBy: admin.username || "Admin",
          });

          // Bulan 2: bulan berikutnya jika nominal >= 30.000
          if (nominal >= 30000) {
            let nextM = currentMonth + 1;
            let nextY = currentYear;
            if (nextM > 12) {
              nextM = 1;
              nextY++;
            }
            const nextPeriodName = `${MONTH_NAMES[nextM - 1]} ${nextY}`;
            await syncKasToMatrix({
              konfirmasiKasId,
              anggotaId: memberId,
              noAnggota,
              periodeStr: nextPeriodName,
              nominalTotal: 15000,
              verifiedBy: admin.username || "Admin",
            });
          }
        } catch (kasErr: any) {
          console.error(`Gagal mencatat kas untuk ${noAnggota}:`, kasErr?.message);
        }
      }

      // 5. Cadangkan ke Google Spreadsheet Apps Script (background, non-blocking)
      try {
        appendAnggotaRow({
          noAnggota,
          namaLengkap: nama,
          idLine,
          displayLine,
          gender,
          domisili,
          kontak: `${kontakPlatform}: ${kontakId}`,
          status: "aktif",
          jabatan: "Anggota",
        }).catch(() => {});
      } catch {}

      results.push({
        noAnggota,
        nama,
        idLine,
        gender,
        nominal,
        status: "aktif",
      });
    }

    return NextResponse.json({
      status: true,
      message: `Berhasil mengimport ${results.length} anggota ke ${targetBatchName}!`,
      totalImported: results.length,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("POST import batch error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal mengimport data batch" },
      { status: 500 }
    );
  }
}
