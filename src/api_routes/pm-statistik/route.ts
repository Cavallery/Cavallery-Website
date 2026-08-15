import { NextResponse } from "next/server";

const API_KEY = "JKTCONNECT";
const BASE = "https://v5.jkt48connect.com/api/shop";

export async function GET() {
  try {
    const res = await fetch(
      `${BASE}/pm-shop/members?apikey=${API_KEY}`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
        },
        next: { revalidate: 300 }
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch PM members: ${res.statusText}`);
    }

    const json = await res.json();

    const members: any[] = Array.isArray(json) ? json : (json.data ?? []);

    const erine = members.find(
      (m) =>
        m.identifier?.toLowerCase() === "erine" ||
        m.member_name?.toLowerCase().includes("erine") ||
        m.idol_id === "JKT48-97"
    );

    if (!erine) {
      return NextResponse.json(
        { success: false, message: "Member Erine tidak ditemukan", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: erine });

  } catch (error) {
    console.error("PM Shop API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
