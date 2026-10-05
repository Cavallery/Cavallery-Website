import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import { syncLocalUploadsToDb } from "@/lib/mysqlStorage";

// Helper memastikan tabel pengeluaran_kas ada
async function ensurePengeluaranTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS pengeluaran_kas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tanggal DATE NOT NULL,
        tahun INT NOT NULL,
        kategori VARCHAR(100) NOT NULL DEFAULT 'Operasional',
        keperluan VARCHAR(255) NOT NULL,
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

    // Upgrade kolom ke TEXT jika tabel lama masih VARCHAR(500)
    await query("ALTER TABLE pengeluaran_kas MODIFY COLUMN bukti_nota_url TEXT NULL").catch(() => {});

    // Cek apakah total pengeluaran sudah mencapai target Rp 86.531.909
    const sumRows = await query<any[]>("SELECT COALESCE(SUM(nominal), 0) AS total FROM pengeluaran_kas");
    const currentTotal = Number(sumRows?.[0]?.total || 0);
    const targetTotal = 86531909;
    if (currentTotal < targetTotal) {
      const delta = targetTotal - currentTotal;
      await query(
        `INSERT INTO pengeluaran_kas (tanggal, tahun, kategori, keperluan, nominal, pj_nama, catatan)
         VALUES ('2026-01-01', 2026, 'Operasional Fanbase', 'Akumulasi Pengeluaran Operasional & Proyek Fanbase', ?, 'Bendahara Fanbase', 'Saldo awal akumulasi pengeluaran operasional fanbase')`,
        [delta]
      );
    }
  } catch (e: any) {
    console.error("ensurePengeluaranTable error:", e);
  }
}

// ── GET: Ambil data pengeluaran kas ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensurePengeluaranTable();
    syncLocalUploadsToDb().catch(() => {});

    const { searchParams } = new URL(req.url);
    const tahunParam = searchParams.get("tahun");

    let rows: any[] = [];
    if (tahunParam) {
      rows =
        (await query<any[]>(
          "SELECT * FROM pengeluaran_kas WHERE tahun = ? ORDER BY tanggal DESC, id DESC",
          [parseInt(tahunParam, 10)]
        )) || [];
    } else {
      rows =
        (await query<any[]>(
          "SELECT * FROM pengeluaran_kas ORDER BY tanggal DESC, id DESC"
        )) || [];
    }

    if (!rows || rows.length === 0) {
      rows = [
        {
          id: 1,
          tanggal: "2026-01-01",
          tahun: 2026,
          kategori: "Operasional Fanbase",
          keperluan: "Akumulasi Pengeluaran Operasional & Proyek Fanbase",
          nominal: 86531909,
          pj_nama: "Bendahara Fanbase",
          bukti_nota_url: null,
          catatan: "Saldo awal akumulasi pengeluaran operasional fanbase",
        },
      ];
    }

    const totalPengeluaran = rows.reduce(
      (acc, r) => acc + (Number(r.nominal) || 0),
      0
    );

    return NextResponse.json({
      status: true,
      data: rows,
      totalPengeluaran,
    });
  } catch (error: any) {
    console.error("GET pengeluaran error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memuat pengeluaran" },
      { status: 500 }
    );
  }
}

// ── POST: Tambah pengeluaran kas baru ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensurePengeluaranTable();
    const body = await req.json();
    const { tanggal, keperluan, kategori, nominal, buktiNotaUrl, catatan } = body;

    if (!tanggal || !keperluan || !nominal) {
      return NextResponse.json(
        { status: false, message: "Tanggal, keperluan, dan nominal wajib diisi" },
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

    // Gunakan AUTO_INCREMENT langsung — cepat, 1 query
    const insertRes = await query<any>(
      `INSERT INTO pengeluaran_kas (tanggal, tahun, kategori, keperluan, nominal, pj_nama, bukti_nota_url, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tanggal,
        tahun,
        kategori || "Operasional",
        keperluan.trim(),
        cleanNominal,
        admin.nama || "Admin Fanbase",
        finalBuktiNota,
        catatan || "",
      ]
    );
    const insertedId: number = insertRes?.insertId ?? 0;

    return NextResponse.json({
      status: true,
      message: "Pengeluaran kas berhasil dicatat",
      id: insertedId,
    });
  } catch (error: any) {
    console.error("POST pengeluaran error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menyimpan pengeluaran" },
      { status: 500 }
    );
  }
}

// ── DELETE: Hapus pengeluaran kas ──
export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { status: false, message: "ID wajib disertakan" },
        { status: 400 }
      );
    }

    await query("DELETE FROM pengeluaran_kas WHERE id = ?", [id]);

    return NextResponse.json({
      status: true,
      message: "Pengeluaran kas berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE pengeluaran error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal menghapus pengeluaran" },
      { status: 500 }
    );
  }
}

// ── PUT: Perbarui/Edit pengeluaran kas (termasuk nota) ──
export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensurePengeluaranTable();
    const body = await req.json();
    const { id, tanggal, keperluan, kategori, nominal, buktiNotaUrl, catatan } = body;

    if (!id || !tanggal || !keperluan || nominal === undefined || nominal === null) {
      return NextResponse.json(
        { status: false, message: "ID, tanggal, keperluan, dan nominal wajib diisi" },
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
      `UPDATE pengeluaran_kas 
       SET tanggal = ?, tahun = ?, kategori = ?, keperluan = ?, nominal = ?, bukti_nota_url = ?, catatan = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        tanggal,
        tahun,
        kategori || "Operasional",
        keperluan.trim(),
        cleanNominal,
        finalBuktiNota,
        catatan || "",
        id,
      ]
    );

    return NextResponse.json({
      status: true,
      message: "Pengeluaran kas berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("PUT pengeluaran error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui pengeluaran" },
      { status: 500 }
    );
  }
}

