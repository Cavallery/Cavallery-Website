import { query } from "@/lib/mysql";

function generatePersonalCouponCode(baseCode: string, noAnggota: string): string {
  const cleanNo = (noAnggota || "").replace(/[^A-Za-z0-9]/g, "").slice(-4) || "MBR";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${baseCode}-${cleanNo}-${rand}`;
}

/**
 * Menghitung total bulan lunas kas seorang anggota secara akurat
 * Menggabungkan data dari iuran_kas_bulanan dan konfirmasi_kas yang diverifikasi
 */
export async function getAnggotaBulanLunas(anggotaId: number, tahun?: number): Promise<{
  bulanLunas: number;
  noAnggota: string;
  namaLengkap: string;
  isAdminRole: boolean;
}> {
  const currentYear = tahun || new Date().getFullYear();

  // 1. Ambil data anggota
  const anggotaRows = await query<any[]>(
    "SELECT id, no_anggota, nama_lengkap, jabatan FROM anggota WHERE id = ? LIMIT 1",
    [anggotaId]
  );
  if (!anggotaRows || anggotaRows.length === 0) {
    return { bulanLunas: 0, noAnggota: "-", namaLengkap: "", isAdminRole: false };
  }
  const a = anggotaRows[0];
  const noAnggota = a.no_anggota || "-";
  const isAdminRole = (a.jabatan || "") !== "Anggota";

  // 2. Hitung dari iuran_kas_bulanan
  const matrixRows = await query<any[]>(
    `SELECT COUNT(DISTINCT bulan) AS total_bulan 
     FROM iuran_kas_bulanan 
     WHERE (anggota_id = ? OR (no_anggota = ? AND no_anggota != '-'))
       AND status = 'diverifikasi'
       AND tahun = ?`,
    [anggotaId, noAnggota, currentYear]
  );
  const bulanMatriks = Number(matrixRows?.[0]?.total_bulan || 0);

  // 3. Hitung dari konfirmasi_kas (verifikasi pembayaran via web/qris)
  const konfirmasiRows = await query<any[]>(
    `SELECT COUNT(*) AS total_transaksi, COALESCE(SUM(nominal), 0) AS total_nominal
     FROM konfirmasi_kas 
     WHERE anggota_id = ? 
       AND status = 'diverifikasi'`,
    [anggotaId]
  );
  const totalTransaksi = Number(konfirmasiRows?.[0]?.total_transaksi || 0);
  const totalNominal = Number(konfirmasiRows?.[0]?.total_nominal || 0);
  const bulanDariNominal = totalNominal >= 15000 ? Math.floor(totalNominal / 15000) : 0;

  // Ambil angka terbesar yang paling akurat
  const bulanLunas = Math.max(bulanMatriks, totalTransaksi, bulanDariNominal);

  return {
    bulanLunas,
    noAnggota,
    namaLengkap: a.nama_lengkap,
    isAdminRole,
  };
}

/**
 * Sinkronisasi kupon untuk satu anggota secara otomatis.
 * Jika anggota memenuhi syarat minimal kas, sistem akan langsung meng-assign kupon
 * dan men-generate KODE UNIK personal untuk anggota tersebut jika belum punya.
 */
export async function syncCouponsForMember(anggotaId: number): Promise<number> {
  try {
    const { bulanLunas, noAnggota, isAdminRole } = await getAnggotaBulanLunas(anggotaId);
    if (!noAnggota || noAnggota === "-") return 0;

    // Kupon reward kas KHUSUS anggota biasa yang bayar kas. Admin/Pengurus bebas kas tidak menerima kupon.
    if (isAdminRole) return 0;

    // Ambil semua kupon yang aktif / belum kadaluarsa
    const kupons = await query<any[]>(`
      SELECT * FROM kupon 
      WHERE (kadaluarsa_pada IS NULL OR kadaluarsa_pada >= CURDATE())
    `);
    if (!kupons || kupons.length === 0) return 0;

    let assignedCount = 0;

    for (const k of kupons) {
      const minBulan = Number(k.min_bulan_kas || 1);

      // Anggota berhak jika bulanLunas >= minBulan (khusus anggota biasa)
      if (bulanLunas >= minBulan) {
        // Cek apakah sudah pernah menerima kupon ini
        const existing = await query<any[]>(
          "SELECT id, kode_kupon_unik FROM kupon_anggota WHERE kupon_id = ? AND anggota_id = ? LIMIT 1",
          [k.id, anggotaId]
        );

        if (!existing || existing.length === 0) {
          // Buat kode kupon unik baru khusus untuk anggota ini
          const cleanKode = (k.kode_kupon || "KUPON").toUpperCase().replace(/[^A-Z0-9]/g, "");
          const uniqueCode = generatePersonalCouponCode(cleanKode, noAnggota);

          await query(
            `INSERT INTO kupon_anggota (kupon_id, anggota_id, no_anggota, kode_kupon_unik, bulan_terbayar, status)
             VALUES (?, ?, ?, ?, ?, 'aktif')`,
            [k.id, anggotaId, noAnggota, uniqueCode, bulanLunas]
          );
          assignedCount++;
        } else if (!existing[0].kode_kupon_unik) {
          // Jika kode uniknya masih kosong, lengkapi
          const cleanKode = (k.kode_kupon || "KUPON").toUpperCase().replace(/[^A-Z0-9]/g, "");
          const uniqueCode = generatePersonalCouponCode(cleanKode, noAnggota);
          await query(
            "UPDATE kupon_anggota SET kode_kupon_unik = ?, bulan_terbayar = ? WHERE id = ?",
            [uniqueCode, bulanLunas, existing[0].id]
          );
        }
      }
    }

    return assignedCount;
  } catch (err: any) {
    console.error("[syncCouponsForMember Error]:", err?.message);
    return 0;
  }
}
