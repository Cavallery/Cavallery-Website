import { NextResponse } from "next/server";
import { query, isMySqlConfigured } from "@/lib/mysql";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get("event") || "Gathering Offline Cavallery 2026";

    let rows: any[] = [];

    if (isMySqlConfigured()) {
      const dbRows = await query<any[]>(
        `SELECT gp.*, a.foto_profil 
         FROM gathering_presensi gp
         LEFT JOIN anggota a ON gp.anggota_id = a.id OR gp.no_anggota = a.no_anggota
         WHERE gp.nama_event = ?
         ORDER BY gp.waktu_hadir ASC`,
        [eventName]
      );
      if (dbRows) rows = dbRows;
    } else {
      const jsonPath = path.join(process.cwd(), "src", "data", "gathering-presensi.json");
      if (fs.existsSync(jsonPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
          if (Array.isArray(parsed)) {
            rows = parsed.filter((r) => r.nama_event === eventName);
          }
        } catch {}
      }
    }

    // Buat format CSV dengan UTF-8 BOM untuk Microsoft Excel
    const headers = [
      "No",
      "No Anggota",
      "Nama Lengkap",
      "Domisili",
      "ID LINE",
      "Platform Kontak",
      "ID Kontak",
      "Badge",
      "Status Keanggotaan",
      "Nama Event",
      "Tanggal Presensi",
      "Waktu Check-In (WIB)",
      "Metode Presensi",
      "Catatan",
    ];

    const csvLines: string[] = [];
    csvLines.push(headers.map(escapeCsvCell).join(","));

    rows.forEach((r, idx) => {
      let tglStr = "-";
      let jamStr = "-";
      if (r.waktu_hadir) {
        try {
          const d = new Date(r.waktu_hadir);
          tglStr = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          jamStr = d.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        } catch {
          tglStr = String(r.waktu_hadir);
        }
      }

      const rowValues = [
        idx + 1,
        r.no_anggota || "-",
        r.nama_lengkap || "-",
        r.domisili || "-",
        r.id_line || "-",
        r.kontak_platform || "-",
        r.kontak_id || "-",
        (r.badge || "squire").toUpperCase(),
        (r.status_keanggotaan || "aktif").toUpperCase(),
        r.nama_event || eventName,
        tglStr,
        jamStr,
        r.metode_checkin === "manual" ? "Manual Input" : "Scan QR KTA",
        r.catatan || "-",
      ];

      csvLines.push(rowValues.map(escapeCsvCell).join(","));
    });

    // \uFEFF adalah UTF-8 Byte Order Mark (BOM) agar Microsoft Excel langsung membaca aksen & karakter secara benar
    const csvContent = "\uFEFF" + csvLines.join("\r\n");

    const cleanEventName = eventName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `Presensi_${cleanEventName}_${dateStamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Export presensi error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengunduh file Excel presensi" },
      { status: 500 }
    );
  }
}
