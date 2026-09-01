import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminToken, setAdminSessionCookie } from "@/lib/auth";
import { query } from "@/lib/mysql";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { status: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Check if admin table is empty; if so, create default admin
    const countRows = await query<any[]>("SELECT COUNT(*) as count FROM admin");
    const adminCount = countRows && countRows[0] ? Number(countRows[0].count) : 0;

    if (adminCount === 0) {
      const defaultHash = await bcrypt.hash("Cavallery2026!", 10);
      await query(
        "INSERT INTO admin (username, password_hash, nama) VALUES (?, ?, ?)",
        ["admin", defaultHash, "Administrator Cavallery"]
      );
    }

    // 2. Find admin user
    const rows = await query<any[]>(
      "SELECT * FROM admin WHERE username = ? LIMIT 1",
      [username.trim()]
    );

    const admin = rows && rows.length > 0 ? rows[0] : null;

    if (!admin) {
      return NextResponse.json(
        { status: false, message: "Kredensial admin tidak valid" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { status: false, message: "Password admin salah" },
        { status: 401 }
      );
    }

    // Sign admin session token
    const token = signAdminToken({
      id: admin.id,
      username: admin.username,
      nama: admin.nama,
    });

    const res = NextResponse.json({
      status: true,
      message: `Selamat datang, ${admin.nama}!`,
      admin: {
        id: admin.id,
        username: admin.username,
        nama: admin.nama,
      },
    });

    setAdminSessionCookie(res, token);
    return res;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Terjadi kesalahan server saat login admin" },
      { status: 500 }
    );
  }
}
