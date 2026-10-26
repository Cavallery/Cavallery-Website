import { NextRequest, NextResponse } from "next/server";
import { fetchAllAnggota, generateCsvData } from "@/lib/anggotaCavaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");
    const status = searchParams.get("status");

    let members = await fetchAllAnggota();

    if (batch && batch !== "all") {
      const bNum = parseInt(batch.replace(/[^\d]/g, ""), 10);
      if (!isNaN(bNum)) {
        members = members.filter((m) => m.batchNumber === bNum);
      }
    }

    if (status && status !== "all") {
      members = members.filter((m) => m.status === status);
    }

    const csvContent = generateCsvData(members);
    // Add UTF-8 BOM so Excel opens it with correct formatting
    const bom = "\uFEFF";
    const blobData = bom + csvContent;

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Data_Anggota_Cavallery_${dateStr}.csv`;

    return new NextResponse(blobData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[Export CSV Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export data" },
      { status: 500 }
    );
  }
}
