import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Bersihkan & Validasi Title (max 256 karakter sesuai Discord embed limit)
    const title = String(body.title || "").trim().slice(0, 256);
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Judul pengumuman wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Bersihkan & Validasi Deskripsi (max 1800 karakter agar tidak melebihi batas 2000 karakter Discord bot message)
    let rawDesc = String(body.description || "").trim();
    if (!rawDesc) {
      return NextResponse.json(
        { success: false, message: "Deskripsi pengumuman wajib diisi." },
        { status: 400 }
      );
    }

    if (rawDesc.length > 1800) {
      rawDesc = rawDesc.slice(0, 1797) + "...";
    }

    // 3. Validasi URL
    const rawUrl = String(body.url || body.link || "").trim();
    let validUrl = "https://cavallery.id";
    if (rawUrl) {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        validUrl = rawUrl;
      } else {
        validUrl = `https://${rawUrl}`;
      }
    }

    // 4. Validasi Gambar (PENTING: Jangan kirim string kosong ke Discord!)
    const rawImage = String(
      body.image || body.image_url || body.imageUrl || ""
    ).trim();
    let validImage: string | null = null;
    if (rawImage) {
      if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
        validImage = rawImage;
      } else if (rawImage.startsWith("/")) {
        validImage = `https://cavallery.id${rawImage}`;
      }
    }

    // 5. Validasi Mention
    const rawMention = String(body.mention || "").trim();

    // 6. Bangun Payload Bersih
    const payload: Record<string, any> = {
      title,
      description: rawDesc,
      url: validUrl,
      link: validUrl,
    };

    if (rawMention && rawMention !== "Tanpa Mention" && rawMention !== "—") {
      payload.mention = rawMention;
      payload.content = rawMention;
    }

    if (validImage) {
      payload.image = validImage;
      payload.image_url = validImage;
      payload.imageUrl = validImage;
    }

    // 7. Kirim ke bot server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("http://apps1.vynzzhost.com:25613/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 21082007",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await res.text();
    let responseData: any = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (res.ok && responseData.success !== false) {
      return NextResponse.json({
        success: true,
        message: "Berhasil dikirim ke Discord!",
        data: responseData,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          responseData.message ||
          responseData.error ||
          `Bot Discord mengembalikan status ${res.status}`,
        detail: responseData,
      },
      { status: res.status >= 400 && res.status < 600 ? res.status : 500 }
    );
  } catch (err: any) {
    console.error("[Discord API Route Error]:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal terhubung ke server Discord bot.",
        error: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
