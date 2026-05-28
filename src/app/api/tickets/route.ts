import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw62qxU5a7zGuNSpOHfVwX6mPb3DWNo94GvLSMNsitkx-YJJIQG_5QcDhhrfaXHHeMGnA/exec";

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { 
      cache: "no-store",
      headers: {
        "Pragma": "no-cache"
      }
    });
    if (!res.ok) return NextResponse.json([]);
    
    const text = await res.text();
    if (text.startsWith("<")) return NextResponse.json([]);
    
    const rawData = JSON.parse(text);
    
    // Berdasarkan Apps Script: [0] nextNumber, [1] Nama, [2] no_anggota, [3] kategori, [4] pesan, [5] Date, [6] Divisi, [7] Status
    const formatted = rawData.map((row: any, index: number) => {
      if (index === 0 && (row[1] === "Nama" || typeof row[0] === "string")) return null;
      
      return {
        id: parseInt(row[0]) || index + 1,
        date: row[5] || new Date().toISOString(),
        name: row[1] || "Anonymous",
        no_anggota: row[2] || "-",
        kategori: row[3] || "Lainnya",
        pesan: row[4] || "",
        divisi: row[6] || "-",
        status: row[7] || "Pending"
      };
    }).filter(Boolean);
    
    return NextResponse.json(formatted);
  } catch (e) {
    console.error("Error fetching tickets from Google Sheet:", e);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    let name = "";
    let no_anggota = "";
    let kategori = "";
    let pesan = "";
    
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("form-data") || contentType.includes("multipart")) {
      const formData = await request.formData();
      name = (formData.get("Nama") as string) || "Anonymous";
      no_anggota = (formData.get("no_anggota") as string) || "-";
      kategori = (formData.get("kategori") as string) || "Lainnya";
      pesan = (formData.get("pesan") as string) || "";
    } else {
      const json = await request.json();
      name = json.Nama || json.name || "Anonymous";
      no_anggota = json.no_anggota || "-";
      kategori = json.kategori || "Lainnya";
      pesan = json.pesan || "";
    }

    if (!pesan.trim()) {
      return NextResponse.json({ status: false, message: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // Gunakan URLSearchParams agar lebih mudah diterima oleh Google Apps Script doPost(e.parameter)
    const params = new URLSearchParams();
    params.append("action", "create");
    params.append("Nama", name.trim());
    params.append("no_anggota", no_anggota.trim());
    params.append("kategori", kategori.trim());
    params.append("pesan", pesan.trim());
    
    const googleRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!googleRes.ok) {
      throw new Error("Failed to post to Google Sheets");
    }

    return NextResponse.json({ status: true, message: "Ticket sent to Google Sheets" });
  } catch (error: any) {
    console.error("POST Ticket Error:", error);
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const { id, divisi, status } = json;
    
    if (!id) return NextResponse.json({ status: false, message: "ID required" }, { status: 400 });

    const params = new URLSearchParams();
    params.append("action", "update");
    params.append("id", id.toString());
    if (divisi) params.append("divisi", divisi);
    if (status) params.append("status", status);
    
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    
    return NextResponse.json({ status: true, message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ status: false, message: "ID required" }, { status: 400 });

    const params = new URLSearchParams();
    params.append("action", "delete");
    params.append("id", id);
    
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    
    return NextResponse.json({ status: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
