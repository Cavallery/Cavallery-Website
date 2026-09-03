import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromReq } from "@/lib/auth";
import { getYearlyKasMatrix, getKasDebtsTracker } from "@/lib/kasMatrix";
import { query } from "@/lib/mysql";

function formatRupiah(num: number) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminSessionFromReq(req);
    if (!admin) {
      return new NextResponse("Akses ditolak. Silakan login sebagai admin.", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "matriks";
    const tahun = parseInt(searchParams.get("tahun") || `${new Date().getFullYear()}`, 10);

    let htmlTable = "";
    let filename = `Cavallery_${type}_${tahun}.xls`;

    // ── 1. EXPORT MATRIKS KAS BULANAN ──
    if (type === "matriks") {
      filename = `Matriks_Kas_Cavallery_${tahun}.xls`;
      const matrix = await getYearlyKasMatrix(tahun);
      const rows = matrix?.matrixRows || [];

      htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 11pt; }
            th { background-color: #1155cc; color: #ffffff; border: 1px solid #0b3c94; padding: 8px; text-align: center; font-weight: bold; }
            td { border: 1px solid #cccccc; padding: 6px; }
            .lunas { background-color: #d1fae5; color: #065f46; text-align: center; font-weight: bold; }
            .belum { background-color: #fef2f2; color: #991b1b; text-align: center; }
            .bebas { background-color: #f3f4f6; color: #6b7280; text-align: center; }
            .center { text-align: center; }
            .right { text-align: right; }
            .title { font-size: 16pt; font-weight: bold; color: #1155cc; text-align: center; margin-bottom: 10px; }
            .summary { font-size: 12pt; font-weight: bold; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="title">MATRIKS IURAN KAS BULANAN CAVALLERY TAHUN ${tahun}</div>
          <div class="summary">
            Total Pemasukan Kas ${tahun}: <strong>${formatRupiah(matrix?.grandTotalPemasukan || 0)}</strong> | 
            Total Anggota Terdata: <strong>${matrix?.totalAnggota || 0}</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nomor Anggota</th>
                <th>Nama Anggota</th>
                <th>Jabatan</th>
                <th>Total Kas</th>
                <th>Bulan Mulai</th>
                <th>Jan</th>
                <th>Feb</th>
                <th>Mar</th>
                <th>Apr</th>
                <th>Mei</th>
                <th>Jun</th>
                <th>Jul</th>
                <th>Agu</th>
                <th>Sep</th>
                <th>Okt</th>
                <th>Nov</th>
                <th>Des</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r, idx) => `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td>${r.noAnggota}</td>
                  <td>${r.nama}</td>
                  <td>${r.jabatan || "Anggota"}${r.isAdminRole ? " (Bebas Kas)" : ""}</td>
                  <td class="right">${formatRupiah(r.totalKas)}</td>
                  <td class="center">${r.bulanMulai}</td>
                  ${Array.from({ length: 12 }, (_, i) => i + 1)
                    .map((m) => {
                      const st = r.months?.[m];
                      if (st === true) return `<td class="lunas">Lunas</td>`;
                      if (st === "not_joined") return `<td class="bebas">-</td>`;
                      return `<td class="belum">Belum</td>`;
                    })
                    .join("")}
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
    }

    // ── 2. EXPORT LAPORAN PENGELUARAN KAS ──
    else if (type === "pengeluaran") {
      filename = `Laporan_Pengeluaran_Kas_Cavallery_${tahun}.xls`;
      const pengeluaran =
        (await query<any[]>(
          "SELECT * FROM pengeluaran_kas WHERE tahun = ? ORDER BY tanggal DESC, id DESC",
          [tahun]
        )) || [];

      const totalNominal = pengeluaran.reduce((acc, p) => acc + Number(p.nominal || 0), 0);

      htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 11pt; }
            th { background-color: #e11d48; color: #ffffff; border: 1px solid #9f1239; padding: 8px; text-align: center; font-weight: bold; }
            td { border: 1px solid #cccccc; padding: 6px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .title { font-size: 16pt; font-weight: bold; color: #e11d48; text-align: center; margin-bottom: 10px; }
            .summary { font-size: 12pt; font-weight: bold; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="title">LAPORAN OPERASIONAL & PENGELUARAN KAS CAVALLERY TAHUN ${tahun}</div>
          <div class="summary">
            Total Pengeluaran: <strong>${formatRupiah(totalNominal)}</strong> | 
            Jumlah Transaksi: <strong>${pengeluaran.length}</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Keperluan / Deskripsi</th>
                <th>Nominal</th>
                <th>Penanggung Jawab</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${pengeluaran
                .map(
                  (p, idx) => `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td class="center">#${p.id}</td>
                  <td class="center">${new Date(p.tanggal).toLocaleDateString("id-ID")}</td>
                  <td>${p.kategori}</td>
                  <td>${p.keperluan}</td>
                  <td class="right">${formatRupiah(p.nominal)}</td>
                  <td>${p.pj_nama}</td>
                  <td>${p.catatan || "-"}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
    }

    // ── 3. EXPORT PELACAK TAGIHAN KAS ──
    else if (type === "tagihan") {
      filename = `Pelacak_Tagihan_Kas_Cavallery_${tahun}.xls`;
      const tagihan = await getKasDebtsTracker(tahun);
      const totalTagihan = tagihan.reduce((acc, t) => acc + Number(t.tagihanKas || 0), 0);

      htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 11pt; }
            th { background-color: #dc2626; color: #ffffff; border: 1px solid #991b1b; padding: 8px; text-align: center; font-weight: bold; }
            td { border: 1px solid #cccccc; padding: 6px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .title { font-size: 16pt; font-weight: bold; color: #dc2626; text-align: center; margin-bottom: 10px; }
            .summary { font-size: 12pt; font-weight: bold; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="title">PELACAK TAGIHAN & KEWAJIBAN KAS ANGGOTA TAHUN ${tahun}</div>
          <div class="summary">
            Total Estimasi Tunggakan Kas: <strong>${formatRupiah(totalTagihan)}</strong> | 
            Jumlah Anggota Menunggak: <strong>${tagihan.length} Anggota</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nomor Anggota</th>
                <th>Nama Anggota</th>
                <th>Jabatan</th>
                <th>Tagihan Kas</th>
                <th>Kewajiban Kas</th>
                <th>Bulan Mulai</th>
              </tr>
            </thead>
            <tbody>
              ${tagihan
                .map(
                  (t, idx) => `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td>${t.noAnggota}</td>
                  <td>${t.nama}</td>
                  <td>${t.jabatan || "Anggota"}</td>
                  <td class="right">${formatRupiah(t.tagihanKas)}</td>
                  <td>${t.kewajibanText}</td>
                  <td class="center">${t.bulanMulai}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
    }

    // ── 4. EXPORT KUPON REWARD KAS ──
    else if (type === "kupon") {
      filename = `Data_Kupon_Reward_Kas_Cavallery.xls`;
      const kupons =
        (await query<any[]>(`
        SELECT 
          k.*,
          COUNT(ka.id) AS total_penerima,
          COUNT(CASE WHEN ka.status = 'digunakan' THEN 1 END) AS total_digunakan
        FROM kupon k
        LEFT JOIN kupon_anggota ka ON ka.kupon_id = k.id
        GROUP BY k.id
        ORDER BY k.created_at DESC
      `)) || [];

      htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 11pt; }
            th { background-color: #8b5cf6; color: #ffffff; border: 1px solid #6d28d9; padding: 8px; text-align: center; font-weight: bold; }
            td { border: 1px solid #cccccc; padding: 6px; }
            .center { text-align: center; }
            .title { font-size: 16pt; font-weight: bold; color: #8b5cf6; text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="title">DATA KUPON REWARD KAS CAVALLERY</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Kupon</th>
                <th>Judul Reward</th>
                <th>Tipe Reward</th>
                <th>Nilai Hadiah</th>
                <th>Syarat Minimal Lunas Kas</th>
                <th>Tahun Evaluasi</th>
                <th>Total Penerima Berhak</th>
                <th>Sudah Digunakan</th>
                <th>Kadaluarsa</th>
              </tr>
            </thead>
            <tbody>
              ${kupons
                .map(
                  (k, idx) => `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td><strong>${k.kode_kupon}</strong></td>
                  <td>${k.judul}</td>
                  <td>${k.tipe_reward}</td>
                  <td>${k.nilai_reward}</td>
                  <td class="center">Minimal ${k.min_bulan_kas} Bulan Kas</td>
                  <td class="center">${k.tahun_kas}</td>
                  <td class="center">${k.total_penerima || 0}</td>
                  <td class="center">${k.total_digunakan || 0}</td>
                  <td class="center">${k.kadaluarsa_pada ? new Date(k.kadaluarsa_pada).toLocaleDateString("id-ID") : "Tanpa Batas"}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
    }

    // ── 5. EXPORT SELURUH DIREKTORI ANGGOTA ──
    else if (type === "anggota") {
      filename = `Direktori_Anggota_Cavallery.xls`;
      const anggota =
        (await query<any[]>(
          "SELECT * FROM anggota WHERE status != 'pending' ORDER BY no_anggota ASC"
        )) || [];

      htmlTable = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 11pt; }
            th { background-color: #2563eb; color: #ffffff; border: 1px solid #1d4ed8; padding: 8px; text-align: center; font-weight: bold; }
            td { border: 1px solid #cccccc; padding: 6px; }
            .center { text-align: center; }
            .title { font-size: 16pt; font-weight: bold; color: #2563eb; text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="title">DIREKTORI ANGGOTA RESMI CAVALLERY</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nomor Anggota</th>
                <th>Nama Lengkap</th>
                <th>Status</th>
                <th>Jabatan</th>
                <th>Divisi</th>
                <th>ID LINE</th>
                <th>Kontak Platform</th>
                <th>ID Kontak</th>
                <th>Domisili</th>
                <th>Tanggal Bergabung</th>
              </tr>
            </thead>
            <tbody>
              ${anggota
                .map(
                  (a, idx) => `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td>${a.no_anggota || "-"}</td>
                  <td>${a.nama_lengkap}</td>
                  <td class="center">${a.status}</td>
                  <td>${a.jabatan || "Anggota"}</td>
                  <td>${a.divisi || "-"}</td>
                  <td>${a.id_line || "-"}</td>
                  <td>${a.kontak_platform || "-"}</td>
                  <td>${a.kontak_id || "-"}</td>
                  <td>${a.domisili || "-"}</td>
                  <td class="center">${a.anggota_sejak ? new Date(a.anggota_sejak).toLocaleDateString("id-ID") : "-"}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
    }

    return new NextResponse(htmlTable, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Export Excel error:", err);
    return new NextResponse("Gagal membuat file Excel: " + err?.message, { status: 500 });
  }
}
