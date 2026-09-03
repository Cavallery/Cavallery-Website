import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query, getNextAvailableId, resetAutoIncrement } from "@/lib/mysql";

export async function ensureKuponTables() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS kupon (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode_kupon VARCHAR(50) NOT NULL UNIQUE,
        judul VARCHAR(150) NOT NULL,
        deskripsi TEXT NULL,
        tipe_reward VARCHAR(50) NOT NULL DEFAULT 'Diskon Merch',
        nilai_reward VARCHAR(100) NOT NULL DEFAULT '10%',
        min_bulan_kas INT NOT NULL DEFAULT 1,
        tahun_kas INT NOT NULL DEFAULT 2026,
        kadaluarsa_pada DATE NULL,
        dibuat_oleh VARCHAR(100) NOT NULL DEFAULT 'Admin Fanbase',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_kode (kode_kupon),
        INDEX idx_tahun (tahun_kas)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS kupon_anggota (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kupon_id INT NOT NULL,
        anggota_id INT NOT NULL,
        no_anggota VARCHAR(50) NOT NULL,
        bulan_terbayar INT NOT NULL DEFAULT 0,
        status ENUM('aktif', 'digunakan', 'kadaluarsa') NOT NULL DEFAULT 'aktif',
        digunakan_pada DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_kupon_anggota (kupon_id, anggota_id),
        INDEX idx_kupon (kupon_id),
        INDEX idx_anggota (anggota_id),
        INDEX idx_no_anggota (no_anggota)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err: any) {
    console.error("[Kupon] ensureKuponTables error:", err?.message);
  }
}

// ── GET: Ambil daftar seluruh kupon & penerimanya ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensureKuponTables();
    const { searchParams } = new URL(req.url);
    const tahunParam = searchParams.get("tahun");

    let sql = `
      SELECT 
        k.*,
        COUNT(ka.id) AS total_penerima,
        COUNT(CASE WHEN ka.status = 'digunakan' THEN 1 END) AS total_digunakan
      FROM kupon k
      LEFT JOIN kupon_anggota ka ON ka.kupon_id = k.id
    `;
    const params: any[] = [];
    if (tahunParam) {
      sql += ` WHERE k.tahun_kas = ?`;
      params.push(parseInt(tahunParam, 10));
    }
    sql += ` GROUP BY k.id ORDER BY k.created_at DESC, k.id DESC`;

    const kuponList = (await query<any[]>(sql, params)) || [];

    return NextResponse.json({
      status: true,
      data: kuponList,
    });
  } catch (error: any) {
    console.error("GET kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat data kupon" }, { status: 500 });
  }
}

// ── POST: Buat Kupon Baru & Bagikan ke Anggota yang Lunas Kas ──
export async function POST(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensureKuponTables();
    const body = await req.json();
    const {
      kodeKupon,
      judul,
      deskripsi,
      tipeReward,
      nilaiReward,
      minBulanKas,
      tahunKas,
      kadaluarsaPada,
    } = body;

    if (!kodeKupon || !judul) {
      return NextResponse.json({ status: false, message: "Kode kupon dan judul hadiah wajib diisi" }, { status: 400 });
    }

    const cleanKode = kodeKupon.trim().toUpperCase();
    const minBulan = Number(minBulanKas) || 1;
    const tahun = Number(tahunKas) || new Date().getFullYear();

    // 1. Cek apakah kode kupon sudah ada
    const existing = await query<any[]>("SELECT id FROM kupon WHERE kode_kupon = ? LIMIT 1", [cleanKode]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ status: false, message: `Kode kupon "${cleanKode}" sudah pernah dibuat` }, { status: 400 });
    }

    // 2. Simpan Master Kupon
    const nextId = await getNextAvailableId("kupon");
    await query(
      `INSERT INTO kupon (id, kode_kupon, judul, deskripsi, tipe_reward, nilai_reward, min_bulan_kas, tahun_kas, kadaluarsa_pada, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        cleanKode,
        judul.trim(),
        deskripsi || "",
        tipeReward || "Diskon Merch",
        nilaiReward || "10%",
        minBulan,
        tahun,
        kadaluarsaPada || null,
        admin.nama || "Admin Fanbase",
      ]
    );
    await resetAutoIncrement("kupon");
    const kuponId = nextId;

    // 3. Distribusikan ke Anggota yang memenuhi syarat (Rajin Bayar Kas)
    // Ambil seluruh anggota aktif
    const anggotaList = (await query<any[]>(
      "SELECT id, no_anggota, nama_lengkap, jabatan FROM anggota WHERE status = 'aktif'"
    )) || [];

    // Ambil data pembayaran kas per anggota pada tahun tersebut
    const payments = (await query<any[]>(
      `SELECT no_anggota, COUNT(DISTINCT bulan) AS total_bulan 
       FROM iuran_kas_bulanan 
       WHERE tahun = ? AND status = 'diverifikasi' 
       GROUP BY no_anggota`,
      [tahun]
    )) || [];

    const paymentMap: Record<string, number> = {};
    payments.forEach((p) => {
      paymentMap[p.no_anggota] = Number(p.total_bulan || 0);
    });

    let qualifiedCount = 0;
    let unqualifiedCount = 0;

    for (const a of anggotaList) {
      const noAnggota = a.no_anggota;
      if (!noAnggota || noAnggota === "-") continue;

      const bulanLunas = paymentMap[noAnggota] || 0;
      const isAdminRole = (a.jabatan || "") !== "Anggota";

      // Syarat: Anggota harus lunas kas minimal minBulan (atau pengurus fanbase)
      if (isAdminRole || bulanLunas >= minBulan) {
        await query(
          `INSERT IGNORE INTO kupon_anggota (kupon_id, anggota_id, no_anggota, bulan_terbayar, status)
           VALUES (?, ?, ?, ?, 'aktif')`,
          [kuponId, a.id, noAnggota, bulanLunas]
        );
        qualifiedCount++;
      } else {
        // Jarang bayar kas -> tidak dapat kupon
        unqualifiedCount++;
      }
    }

    return NextResponse.json({
      status: true,
      message: `Kupon "${cleanKode}" berhasil dibuat dan otomatis dibagikan kepada ${qualifiedCount} anggota yang memenuhi syarat kas! (${unqualifiedCount} anggota yang jarang bayar kas tidak menerima kupon).`,
      kuponId,
      qualifiedCount,
      unqualifiedCount,
    });
  } catch (error: any) {
    console.error("POST kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal membuat kupon" }, { status: 500 });
  }
}

// ── DELETE: Hapus Kupon ──
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

    await query("DELETE FROM kupon_anggota WHERE kupon_id = ?", [id]);
    await query("DELETE FROM kupon WHERE id = ?", [id]);
    await resetAutoIncrement("kupon");

    return NextResponse.json({ status: true, message: "Kupon dan data penerima berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus kupon" }, { status: 500 });
  }
}
