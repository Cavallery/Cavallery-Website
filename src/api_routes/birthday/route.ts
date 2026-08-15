import { NextResponse } from "next/server";

export async function GET() {
  try {
   
    const erineBirthday = [
      {
        name: "Catherina Vallencia (Erine)",
        date: "2006-08-21",
        generation: "JKT48 Gen 12",
        is_today: false,
        days_until: 0
      }
    ];

    return NextResponse.json({ success: true, data: erineBirthday });
  } catch (error) {
    console.error("Birthday Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
