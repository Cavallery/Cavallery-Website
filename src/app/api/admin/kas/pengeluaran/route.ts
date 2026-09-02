import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query, getNextAvailableId, resetAutoIncrement } from "@/lib/mysql";

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
        bukti_nota_url VARCHAR(500) NULL,
        catatan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tahun (tahun),
        INDEX idx_tanggal (tanggal)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
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
    const { searchParams } = new URL(req.url);
    const tahunParam = searchParams.get("tahun");

    let rows: any[] = [];
    if (tahunParam) {
      rows = (await query<any[]>(
        "SELECT * FROM pengeluaran_kas WHERE tahun = ? ORDER BY tanggal DESC, id DESC",
        [parseInt(tahunParam, 10)]
      )) || [];
    } else {
      rows = (await query<any[]>(
        "SELECT * FROM pengeluaran_kas ORDER BY tanggal DESC, id DESC"
      )) || [];
    }

    const totalPengeluaran = rows.reduce((acc, r) => acc + (Number(r.nominal) || 0), 0);

    return NextResponse.json({
      status: true,
      data: rows,
      totalPengeluaran,
    });
  } catch (error: any) {
    console.error("GET pengeluaran error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat pengeluaran" }, { status: 500 });
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
      return NextResponse.json({ status: false, message: "Tanggal, keperluan, dan nominal wajib diisi" }, { status: 400 });
    }

    const tDate = new Date(tanggal);
    const tahun = !isNaN(tDate.getFullYear()) ? tDate.getFullYear() : new Date().getFullYear();
    const cleanNominal = Number(nominal) || 0;

    // Cari ID terkecil yang belum terpakai (contoh: jika ID 1 kosong, gunakan ID 1)
    const nextId = await getNextAvailableId("pengeluaran_kas");

    await query(
      `INSERT INTO pengeluaran_kas (id, tanggal, tahun, kategori, keperluan, nominal, pj_nama, bukti_nota_url, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        tanggal,
        tahun,
        kategori || "Operasional",
        keperluan.trim(),
        cleanNominal,
        admin.nama || "Admin Fanbase",
        buktiNotaUrl || "",
        catatan || "",
      ]
    );

    // Sinkronkan AUTO_INCREMENT ke max(id) + 1
    await resetAutoIncrement("pengeluaran_kas");

    return NextResponse.json({
      status: true,
      message: "Pengeluaran kas berhasil dicatat",
      id: nextId,
    });
  } catch (error: any) {
    console.error("POST pengeluaran error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menyimpan pengeluaran" }, { status: 500 });
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
      return NextResponse.json({ status: false, message: "ID wajib disertakan" }, { status: 400 });
    }

    await query("DELETE FROM pengeluaran_kas WHERE id = ?", [id]);

    // Reset AUTO_INCREMENT agar data berikutnya tidak melompati ID yang dihapus
    await resetAutoIncrement("pengeluaran_kas");

    return NextResponse.json({ status: true, message: "Pengeluaran kas berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE pengeluaran error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus pengeluaran" }, { status: 500 });
  }
}
