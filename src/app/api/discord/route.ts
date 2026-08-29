import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Bersihkan dan batasi panjang field sesuai limit Discord
    const title = String(body.title || "").slice(0, 256);
    const rawDesc = String(body.description || "").slice(0, 4096);
    const url = String(body.url || body.link || "").trim();
    const mention = String(body.mention || "").trim();
    const imageUrl = String(body.image || body.image_url || body.imageUrl || "").trim();

    // Validasi URL gambar harus https
    const validImage = imageUrl.startsWith("https://") ? imageUrl : "";

    // Validasi URL embed harus diawali https
    const validUrl = url.startsWith("https://") || url.startsWith("http://") ? url : "";

    // Build payload sesuai format yang diterima bot server
    const payload: Record<string, any> = {
      title,
      description: rawDesc,
    };

    if (validUrl) payload.url = validUrl;
    if (mention) payload.mention = mention;
    if (validImage) {
      payload.image = validImage;
      payload.image_url = validImage;
    }

    const res = await fetch("http://apps1.vynzzhost.com:25613/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 21082007",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.text();

    // Jika bot server berhasil, kembalikan sukses
    if (res.ok) {
      return NextResponse.json({ success: true, message: "Berhasil dikirim ke Discord!" }, { status: 200 });
    }

    // Jika bot gagal, kembalikan pesan asli untuk debug
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal.", error: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
