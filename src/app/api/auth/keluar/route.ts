import { NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    status: true,
    message: "Berhasil keluar dari akun",
  });

  response.cookies.set({
    name: USER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
