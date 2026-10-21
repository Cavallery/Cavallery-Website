import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";
import { getKasDebtsTracker, MONTH_NAMES_ID } from "@/lib/kasMatrix";

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan login sebagai admin." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "all").toLowerCase();

    // 1. Query anggota
    let sql = `
      SELECT a.*, b.name as batch_name, b.year as batch_year
      FROM anggota a
      LEFT JOIN recruitment_batches b ON a.batch_id = b.id
      WHERE a.status != 'pending'
    `;
    const params: any[] = [];

    if (filter === "aktif") {
      sql += " AND a.status = 'aktif'";
    } else if (filter === "nonaktif") {
      sql += " AND a.status = 'nonaktif'";
    }

    sql += " ORDER BY CASE WHEN a.no_anggota IS NULL OR a.no_anggota = '' OR a.no_anggota = '-' THEN 1 ELSE 0 END, a.no_anggota ASC, a.id ASC";

    const members = (await query<any[]>(sql, params)) || [];

    // 2. Query riwayat pembayaran kas terakhir tiap anggota dari iuran_kas_bulanan
    const latestPayments = (await query<any[]>(`
      SELECT 
        no_anggota,
        tahun,
        bulan,
        nominal,
        verified_at,
        created_at
      FROM iuran_kas_bulanan
      WHERE status = 'diverifikasi'
      ORDER BY tahun DESC, bulan DESC, id DESC
    `)) || [];

    const latestPaymentMap: Record<string, { tahun: number; bulan: number; nominal: number; date: any }> = {};
    latestPayments.forEach((p) => {
      const no = (p.no_anggota || "").trim();
      if (no && !latestPaymentMap[no]) {
        latestPaymentMap[no] = {
          tahun: p.tahun,
          bulan: p.bulan,
          nominal: Number(p.nominal || 15000),
          date: p.verified_at || p.created_at,
        };
      }
    });

    // 3. Query sisa tagihan kas anggota aktif (tahun berjalan)
    const currentYear = new Date().getFullYear();
    let debtMap: Record<string, any> = {};
    try {
      const debts = await getKasDebtsTracker(currentYear);
      debts.forEach((d: any) => {
        if (d.noAnggota) {
          debtMap[d.noAnggota.trim()] = d;
        }
      });
    } catch (e) {
      console.error("Error fetching debts tracker in export:", e);
    }

    // 4. Susun Header & Baris CSV
    const headers = [
      "No",
      "No Anggota",
      "Nama Lengkap",
      "ID Line",
      "Display Line",
      "Discord",
      "Gender",
      "Domisili",
      "Kontak Platform",
      "Kontak ID",
      "Status",
      "Jabatan",
      "Divisi",
      "Badge",
      "Batch",
      "Terakhir Bayar Kas",
      "Sisa Tagihan Kas",
      "Anggota Sejak",
      "Tanggal Daftar",
    ];

    const rows = members.map((m, idx) => {
      const noAnggota = (m.no_anggota || "").trim();

      // Terakhir Bayar Kas
      let lastPayText = "Belum pernah bayar";
      if (noAnggota && latestPaymentMap[noAnggota]) {
        const lp = latestPaymentMap[noAnggota];
        const monthName = MONTH_NAMES_ID[lp.bulan - 1] || `Bulan ${lp.bulan}`;
        lastPayText = `${monthName} ${lp.tahun}`;
        if (lp.date) {
          const d = new Date(lp.date);
          if (!isNaN(d.getTime())) {
            lastPayText += ` (${d.toLocaleDateString("id-ID")})`;
          }
        }
      }

      // Sisa Tagihan Kas
      let debtText = "Lunas (Rp 0)";
      const isExempt = (m.jabatan || "") !== "Anggota";
      if (isExempt) {
        debtText = "Bebas Iuran (Pengurus)";
      } else if (noAnggota && debtMap[noAnggota]) {
        const d = debtMap[noAnggota];
        debtText = `Rp ${Number(d.tagihanKas || 0).toLocaleString("id-ID")} (${d.kewajibanText || `${d.unpaidCount} Bulan`})`;
      } else if (m.status === "nonaktif") {
        debtText = "Nonaktif";
      }

      return [
        idx + 1,
        escapeCsvField(m.no_anggota || "-"),
        escapeCsvField(m.nama_lengkap || "-"),
        escapeCsvField(m.id_line || "-"),
        escapeCsvField(m.display_line || "-"),
        escapeCsvField(m.discord || "-"),
        escapeCsvField(m.gender || "-"),
        escapeCsvField(m.domisili || "-"),
        escapeCsvField(m.kontak_platform || "-"),
        escapeCsvField(m.kontak_id || "-"),
        escapeCsvField(m.status === "aktif" ? "Aktif" : m.status === "nonaktif" ? "Non Aktif" : m.status),
        escapeCsvField(m.jabatan || "Anggota"),
        escapeCsvField(m.divisi || "-"),
        escapeCsvField(m.badge || "-"),
        escapeCsvField(m.batch_name ? `${m.batch_name} (${m.batch_year || ""})`.trim() : "-"),
        escapeCsvField(lastPayText),
        escapeCsvField(debtText),
        escapeCsvField(m.anggota_sejak ? new Date(m.anggota_sejak).toLocaleDateString("id-ID") : "-"),
        escapeCsvField(m.created_at ? new Date(m.created_at).toLocaleDateString("id-ID") : "-"),
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const filterName = filter === "aktif" ? "Aktif" : filter === "nonaktif" ? "NonAktif" : "Semua";
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Data_Anggota_Cavallery_${filterName}_${dateStr}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("GET export keanggotaan error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal mengexport data keanggotaan" },
      { status: 500 }
    );
  }
}
