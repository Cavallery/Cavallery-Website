import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch("http://apps1.vynzzhost.com:25613/api/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 21082007",
    },
    body: JSON.stringify(body),
  });
  const data = await res.text();
  return new NextResponse(data, { status: res.status });
}
