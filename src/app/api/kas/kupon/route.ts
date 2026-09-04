import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import { syncCouponsForMember, getAnggotaBulanLunas, parseVoucherDiscount } from "@/lib/kuponHelper";

export async function GET(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json({ status: false, message: "Hanya anggota resmi yang dapat melihat kupon kas" }, { status: 401 });
    }

    // 1. AUTO-CLAIM & SINKRONISASI REALTIME:
    // Jika anggota sudah bayar kas (terverifikasi), pastikan semua kupon aktif otomatis diberikan
    await syncCouponsForMember(session.id);

    // Ambil seluruh kupon yang dibagikan ke anggota ini
    const kupons = (await query<any[]>(`
      SELECT 
        ka.id AS kupon_anggota_id,
        ka.status AS status_kupon,
        ka.bulan_terbayar,
        ka.digunakan_pada,
        k.id AS kupon_id,
        COALESCE(ka.kode_kupon_unik, k.kode_kupon) AS kode_kupon,
        k.kode_kupon AS base_kode_kupon,
        k.judul,
        k.deskripsi,
        k.tipe_reward,
        k.nilai_reward,
        k.min_bulan_kas,
        k.tahun_kas,
        k.kadaluarsa_pada,
        k.created_at
      FROM kupon_anggota ka
      JOIN kupon k ON ka.kupon_id = k.id
      WHERE ka.anggota_id = ?
      ORDER BY ka.created_at DESC
    `, [session.id])) || [];

    // Ambil info pembayaran kas akurat tahun ini untuk user
    const currentYear = new Date().getFullYear();
    const { bulanLunas } = await getAnggotaBulanLunas(session.id, currentYear);

    return NextResponse.json({
      status: true,
      data: kupons,
      totalLunasTahunIni: bulanLunas,
      currentYear,
    });
  } catch (error: any) {
    console.error("GET user kupon error:", error);
    return NextResponse.json({ status: false, message: error?.message || "Gagal memuat kupon" }, { status: 500 });
  }
}

// ── POST: Validasi / Cek Kode Voucher untuk Pembayaran Kas ──
export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Hanya anggota resmi yang dapat menggunakan voucher kas" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawCode = (body.code || body.kodeVoucher || "").trim();
    if (!rawCode) {
      return NextResponse.json(
        { status: false, message: "Silakan masukkan kode voucher terlebih dahulu" },
        { status: 400 }
      );
    }

    const cleanCode = rawCode.toUpperCase();

    // 1. Cari di kupon_anggota milik user ini
    const rows = (await query<any[]>(`
      SELECT 
        ka.id AS kupon_anggota_id,
        ka.status AS status_kupon,
        ka.digunakan_pada,
        k.id AS kupon_id,
        COALESCE(ka.kode_kupon_unik, k.kode_kupon) AS kode_kupon,
        k.kode_kupon AS base_kode_kupon,
        k.judul,
        k.deskripsi,
        k.tipe_reward,
        k.nilai_reward,
        k.kadaluarsa_pada
      FROM kupon_anggota ka
      JOIN kupon k ON ka.kupon_id = k.id
      WHERE ka.anggota_id = ? 
        AND (UPPER(ka.kode_kupon_unik) = ? OR UPPER(k.kode_kupon) = ?)
      LIMIT 1
    `, [session.id, cleanCode, cleanCode])) || [];

    let kuponItem = rows.length > 0 ? rows[0] : null;

    // 2. Jika belum ada di kupon_anggota, cek apakah ini master kupon publik aktif
    if (!kuponItem) {
      const masterRows = (await query<any[]>(`
        SELECT * FROM kupon 
        WHERE UPPER(kode_kupon) = ?
          AND (kadaluarsa_pada IS NULL OR kadaluarsa_pada >= CURDATE())
        LIMIT 1
      `, [cleanCode])) || [];

      if (masterRows.length > 0) {
        const mk = masterRows[0];
        // Cek apakah anggota sudah pernah klaim
        const existingClaim = (await query<any[]>(`
          SELECT * FROM kupon_anggota WHERE kupon_id = ? AND anggota_id = ? LIMIT 1
        `, [mk.id, session.id])) || [];

        if (existingClaim.length > 0) {
          kuponItem = {
            kupon_anggota_id: existingClaim[0].id,
            status_kupon: existingClaim[0].status,
            digunakan_pada: existingClaim[0].digunakan_pada,
            kupon_id: mk.id,
            kode_kupon: existingClaim[0].kode_kupon_unik || mk.kode_kupon,
            base_kode_kupon: mk.kode_kupon,
            judul: mk.judul,
            deskripsi: mk.deskripsi,
            tipe_reward: mk.tipe_reward,
            nilai_reward: mk.nilai_reward,
            kadaluarsa_pada: mk.kadaluarsa_pada,
          };
        } else {
          // Auto assign ke anggota
          const noAnggota = session.noAnggota || "-";
          const resInsert: any = await query(`
            INSERT INTO kupon_anggota (kupon_id, anggota_id, no_anggota, kode_kupon_unik, bulan_terbayar, status)
            VALUES (?, ?, ?, ?, 0, 'aktif')
          `, [mk.id, session.id, noAnggota, cleanCode]);

          kuponItem = {
            kupon_anggota_id: resInsert?.insertId || 0,
            status_kupon: "aktif",
            digunakan_pada: null,
            kupon_id: mk.id,
            kode_kupon: cleanCode,
            base_kode_kupon: mk.kode_kupon,
            judul: mk.judul,
            deskripsi: mk.deskripsi,
            tipe_reward: mk.tipe_reward,
            nilai_reward: mk.nilai_reward,
            kadaluarsa_pada: mk.kadaluarsa_pada,
          };
        }
      }
    }

    if (!kuponItem) {
      return NextResponse.json(
        { status: false, message: `Kode voucher "${rawCode}" tidak ditemukan atau tidak tersedia untuk akun Anda.` },
        { status: 404 }
      );
    }

    // Cek Status Penggunaan
    if (kuponItem.status_kupon === "digunakan") {
      return NextResponse.json(
        { status: false, message: `Voucher "${kuponItem.judul}" sudah pernah digunakan.` },
        { status: 400 }
      );
    }

    // Cek Kadaluarsa
    if (kuponItem.kadaluarsa_pada) {
      const expDate = new Date(kuponItem.kadaluarsa_pada);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expDate < today) {
        return NextResponse.json(
          { status: false, message: `Voucher "${kuponItem.judul}" sudah kadaluarsa.` },
          { status: 400 }
        );
      }
    }

    // Hitung Potongan Kupon
    const { nominalPotongan, bulanGratis, label } = parseVoucherDiscount(
      kuponItem.tipe_reward,
      kuponItem.nilai_reward
    );

    return NextResponse.json({
      status: true,
      message: `Voucher "${kuponItem.judul}" berhasil diterapkan! ${label}`,
      data: {
        kuponAnggotaId: kuponItem.kupon_anggota_id,
        kodeKupon: kuponItem.kode_kupon,
        judul: kuponItem.judul,
        deskripsi: kuponItem.deskripsi,
        tipeReward: kuponItem.tipe_reward,
        nilaiReward: kuponItem.nilai_reward,
        nominalPotongan,
        bulanGratis,
        label,
      },
    });
  } catch (error: any) {
    console.error("POST validate kupon error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memverifikasi voucher" },
      { status: 500 }
    );
  }
}
