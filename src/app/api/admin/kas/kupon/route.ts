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
        kode_kupon_unik VARCHAR(100) NULL,
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

    // Pastikan kolom kode_kupon_unik ada jika tabel lama sudah ada
    try {
      await query(`
        ALTER TABLE kupon_anggota ADD COLUMN IF NOT EXISTS kode_kupon_unik VARCHAR(100) NULL AFTER no_anggota
      `);
    } catch {}
  } catch (err: any) {
    console.error("[Kupon] ensureKuponTables error:", err?.message);
  }
}

// Helper generate kode kupon unik per orang
function generatePersonalCouponCode(baseCode: string, noAnggota: string): string {
  // Ambil angka atau suffix no anggota, misal CAVA-0001 -> 0001
  const cleanNo = (noAnggota || "").replace(/[^A-Za-z0-9]/g, "").slice(-4) || "MBR";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${baseCode}-${cleanNo}-${rand}`;
}

// ── GET: Ambil daftar seluruh kupon ATAU detail penerima kupon tertentu ──
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    await ensureKuponTables();
    const { searchParams } = new URL(req.url);
    const detailId = searchParams.get("detailId");

    // Jika meminta detail penerima dari 1 kupon
    if (detailId) {
      const kuponInfo = await query<any[]>("SELECT * FROM kupon WHERE id = ? LIMIT 1", [detailId]);
      if (!kuponInfo || kuponInfo.length === 0) {
        return NextResponse.json({ status: false, message: "Kupon tidak ditemukan" }, { status: 404 });
      }

      const penerima = (await query<any[]>(`
        SELECT 
          ka.id AS kupon_anggota_id,
          ka.kupon_id,
          ka.anggota_id,
          ka.no_anggota,
          COALESCE(ka.kode_kupon_unik, CONCAT(k.kode_kupon, '-', ka.id)) AS kode_kupon_unik,
          ka.bulan_terbayar,
          ka.status AS status_kupon,
          ka.digunakan_pada,
          ka.created_at AS tanggal_diterima,
          a.nama_lengkap,
          a.jabatan,
          a.divisi,
          a.id_line,
          a.kontak_platform,
          a.kontak_id
        FROM kupon_anggota ka
        JOIN kupon k ON ka.kupon_id = k.id
        LEFT JOIN anggota a ON ka.anggota_id = a.id
        WHERE ka.kupon_id = ?
        ORDER BY a.nama_lengkap ASC, ka.id ASC
      `, [detailId])) || [];

      return NextResponse.json({
        status: true,
        kupon: kuponInfo[0],
        data: penerima,
      });
    }

    // Default: Ambil daftar seluruh master kupon
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

// ── POST: Buat Kupon Baru & Generate Kode Kupon Unik Beda-Beda Per Orang ──
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

    const cleanKode = kodeKupon.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
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
        tipeReward || "Diskon Merchandise",
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
        // GENERATE KODE KUPON UNIK KHUSUS ORANG INI (BEDA-BEDA SETIAP ORANG)
        const uniqueCode = generatePersonalCouponCode(cleanKode, noAnggota);

        await query(
          `INSERT INTO kupon_anggota (kupon_id, anggota_id, no_anggota, kode_kupon_unik, bulan_terbayar, status)
           VALUES (?, ?, ?, ?, ?, 'aktif')
           ON DUPLICATE KEY UPDATE kode_kupon_unik = VALUES(kode_kupon_unik), bulan_terbayar = VALUES(bulan_terbayar)`,
          [kuponId, a.id, noAnggota, uniqueCode, bulanLunas]
        );
        qualifiedCount++;
      } else {
        // Jarang bayar kas -> tidak dapat kupon
        unqualifiedCount++;
      }
    }

    return NextResponse.json({
      status: true,
      message: `Kupon "${cleanKode}" berhasil dibuat! Sistem otomatis meng-generate KODE UNIK BERBEDA untuk ${qualifiedCount} anggota yang rajin bayar kas (${unqualifiedCount} anggota yang jarang bayar kas tidak menerima kupon).`,
      kuponId,
      qualifiedCount,
      unqualifiedCount,
    });
  } catch (error: any) {
    console.error("POST kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal membuat kupon" }, { status: 500 });
  }
}

// ── DELETE: Hapus Seluruh Kupon ATAU Cabut Kupon dari Anggota Tertentu ──
export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kuponAnggotaId = searchParams.get("kuponAnggotaId");
    const kuponId = searchParams.get("id");

    // 1. HAPUS / CABUT KUPON DARI SATU ANGGOTA SAJA
    if (kuponAnggotaId) {
      const deleted = await query("DELETE FROM kupon_anggota WHERE id = ?", [kuponAnggotaId]);
      await resetAutoIncrement("kupon_anggota");
      return NextResponse.json({
        status: true,
        message: "Kupon untuk anggota ini berhasil dicabut / dihapus.",
      });
    }

    // 2. HAPUS SELURUH KUPON (MASTER KUPON BESERTA SEMUA PENERIMANYA)
    if (!kuponId) {
      return NextResponse.json({ status: false, message: "ID kupon wajib disertakan" }, { status: 400 });
    }

    await query("DELETE FROM kupon_anggota WHERE kupon_id = ?", [kuponId]);
    await query("DELETE FROM kupon WHERE id = ?", [kuponId]);
    await resetAutoIncrement("kupon");
    await resetAutoIncrement("kupon_anggota");

    return NextResponse.json({
      status: true,
      message: "Master kupon dan seluruh voucher yang dibagikan ke anggota berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("DELETE kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal menghapus kupon" }, { status: 500 });
  }
}
