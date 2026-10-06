import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import { syncLocalUploadsToDb } from "@/lib/mysqlStorage";
import { appendPemasukanRow, deleteFromSheets } from "@/lib/googleSheets";

// Helper memastikan tabel pemasukan_kas ada dan memiliki data baseline jika kosong
export async function ensurePemasukanTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS pemasukan_kas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tanggal DATE NOT NULL,
        tahun INT NOT NULL,
        kategori VARCHAR(100) NOT NULL DEFAULT 'Pemasukan Eksternal',
        sumber VARCHAR(255) NOT NULL,
        nominal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        pj_nama VARCHAR(100) NOT NULL,
        bukti_nota_url TEXT NULL,
        catatan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tahun (tahun),
        INDEX idx_tanggal (tanggal)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Upgrade kolom ke TEXT jika tabel lama masih VARCHAR
    await query("ALTER TABLE pemasukan_kas MODIFY COLUMN bukti_nota_url TEXT NULL").catch(() => {});

    // Cek apakah tabel kosong, jika iya, masukkan data saldo awal pemasukan eksternal Rp 127.463.910
    const countRows = await query<any[]>("SELECT COUNT(*) AS cnt FROM pemasukan_kas");
    const count = Number(countRows?.[0]?.cnt || 0);
    if (count === 0) {
      await query(
        `INSERT INTO pemasukan_kas (tanggal, tahun, kategori, sumber, nominal, pj_nama, catatan)
         VALUES ('2026-01-01', 2026, 'Pemasukan Eksternal', 'Akumulasi Pemasukan Eksternal & Sponsorship Fanbase', 127463910.00, 'Bendahara Fanbase', 'Saldo awal akumulasi pemasukan eksternal fanbase')`
      );
    }
  } catch (e: any) {
    console.error("ensurePemasukanTable error:", e);
  }
}

// ── GET: Ambil data pemasukan kas ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensurePemasukanTable();
    syncLocalUploadsToDb().catch(() => {});

    const { searchParams } = new URL(req.url);
    const tahunParam = searchParams.get("tahun");

    let rows: any[] = [];
    if (tahunParam) {
      rows =
        (await query<any[]>(
          "SELECT * FROM pemasukan_kas WHERE tahun = ? ORDER BY tanggal DESC, id DESC",
          [parseInt(tahunParam, 10)]
        )) || [];
    } else {
      rows =
        (await query<any[]>(
          "SELECT * FROM pemasukan_kas ORDER BY tanggal DESC, id DESC"
        )) || [];
    }

    // Jika tabel kosong di memory / local, berikan data baseline Rp 127.463.910
    if (!rows || rows.length === 0) {
      rows = [
        {
          id: 1,
          tanggal: "2026-01-01",
          tahun: 2026,
          kategori: "Pemasukan Eksternal",
          sumber: "Akumulasi Pemasukan Eksternal & Sponsorship Fanbase",
          nominal: 127463910,
          pj_nama: "Bendahara Fanbase",
          bukti_nota_url: null,
          catatan: "Saldo awal akumulasi pemasukan eksternal fanbase",
        },
      ];
    }

    const totalPemasukan = rows.reduce(
      (acc, r) => acc + (Number(r.nominal) || 0),
      0
    );

    return NextResponse.json({
      status: true,
      data: rows,
      totalPemasukan,
    });
  } catch (error: any) {
    console.error("GET pemasukan error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat pemasukan" },
      { status: 500 }
    );
  }
}

// ── POST: Tambah pemasukan kas baru ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensurePemasukanTable();
    const body = await req.json();
    const { tanggal, sumber, kategori, nominal, buktiNotaUrl, catatan } = body;

    if (!tanggal || !sumber || !nominal) {
      return NextResponse.json(
        { status: false, message: "Tanggal, sumber pemasukan, dan nominal wajib diisi" },
        { status: 400 }
      );
    }

    const tDate = new Date(tanggal);
    const tahun = !isNaN(tDate.getFullYear())
      ? tDate.getFullYear()
      : new Date().getFullYear();
    const cleanNominal = Number(nominal) || 0;

    let finalBuktiNota = "";
    if (Array.isArray(buktiNotaUrl)) {
      finalBuktiNota = buktiNotaUrl.filter(Boolean).join(",");
    } else if (typeof buktiNotaUrl === "string") {
      finalBuktiNota = buktiNotaUrl.trim();
    }

    const insertRes = await query<any>(
      `INSERT INTO pemasukan_kas (tanggal, tahun, kategori, sumber, nominal, pj_nama, bukti_nota_url, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tanggal,
        tahun,
        kategori || "Pemasukan Eksternal",
        sumber.trim(),
        cleanNominal,
        admin.nama || "Bendahara Fanbase",
        finalBuktiNota,
        catatan || "",
      ]
    );
    const insertedId: number = insertRes?.insertId ?? Date.now();

    // Push baris baru ke Google Sheets di latar belakang
    appendPemasukanRow({
      id: insertedId,
      tanggal,
      tahun,
      kategori: kategori || "Pemasukan Eksternal",
      sumber: sumber.trim(),
      nominal: cleanNominal,
      pjNama: admin.nama || "Bendahara Fanbase",
      buktiNotaUrl: finalBuktiNota,
      catatan: catatan || "",
    }).catch((err) => console.warn("[Pemasukan] Sync to Google Sheets warn:", err));

    return NextResponse.json({
      status: true,
      message: "Pemasukan kas berhasil dicatat",
      id: insertedId,
    });
  } catch (error: any) {
    console.error("POST pemasukan error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menyimpan pemasukan" },
      { status: 500 }
    );
  }
}

// ── PUT: Perbarui pemasukan kas ──
export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensurePemasukanTable();
    const body = await req.json();
    const { id, tanggal, sumber, kategori, nominal, buktiNotaUrl, catatan } = body;

    if (!id || !tanggal || !sumber || !nominal) {
      return NextResponse.json(
        { status: false, message: "ID, tanggal, sumber, dan nominal wajib diisi" },
        { status: 400 }
      );
    }

    const tDate = new Date(tanggal);
    const tahun = !isNaN(tDate.getFullYear())
      ? tDate.getFullYear()
      : new Date().getFullYear();
    const cleanNominal = Number(nominal) || 0;

    let finalBuktiNota = "";
    if (Array.isArray(buktiNotaUrl)) {
      finalBuktiNota = buktiNotaUrl.filter(Boolean).join(",");
    } else if (typeof buktiNotaUrl === "string") {
      finalBuktiNota = buktiNotaUrl.trim();
    }

    await query(
      `UPDATE pemasukan_kas 
       SET tanggal = ?, tahun = ?, kategori = ?, sumber = ?, nominal = ?, bukti_nota_url = ?, catatan = ?
       WHERE id = ?`,
      [
        tanggal,
        tahun,
        kategori || "Pemasukan Eksternal",
        sumber.trim(),
        cleanNominal,
        finalBuktiNota,
        catatan || "",
        id,
      ]
    );

    return NextResponse.json({
      status: true,
      message: "Data pemasukan kas berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("PUT pemasukan error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui pemasukan" },
      { status: 500 }
    );
  }
}

// ── DELETE: Hapus pemasukan kas ──
export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensurePemasukanTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: false, message: "ID pemasukan wajib disertakan" },
        { status: 400 }
      );
    }

    await query("DELETE FROM pemasukan_kas WHERE id = ?", [id]);

    deleteFromSheets("Laporan Pemasukan", 2, `#${id}`).catch(() => {});

    return NextResponse.json({
      status: true,
      message: "Data pemasukan kas berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE pemasukan error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menghapus pemasukan" },
      { status: 500 }
    );
  }
}
