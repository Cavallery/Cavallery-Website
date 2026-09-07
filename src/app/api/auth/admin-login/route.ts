import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminToken, setAdminSessionCookie } from "@/lib/auth";
import { query } from "@/lib/mysql";

// In-memory rate limiting map (IP -> { count, lockedUntil })
interface AttemptRecord {
  count: number;
  lockedUntil: number;
}
const rateLimitMap = new Map<string, AttemptRecord>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

function recordFailedAttempt(ip: string): number {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000;
  }
  rateLimitMap.set(ip, record);
  return record.count;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();

  const attempt = rateLimitMap.get(ip);
  if (attempt && attempt.lockedUntil > now) {
    const remainingSec = Math.ceil((attempt.lockedUntil - now) / 1000);
    const remainingMin = Math.ceil(remainingSec / 60);
    return NextResponse.json(
      {
        status: false,
        message: `Akses diblokir sementara karena 5x percobaan gagal. Tunggu ${remainingMin} menit (${remainingSec} detik).`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    if (body._hp) {
      return NextResponse.json({ status: false, message: "Akses ditolak" }, { status: 400 });
    }

    const { username, password, pin } = body;

    if (!username || !password) {
      return NextResponse.json(
        { status: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi PIN jika disediakan
    const validPins = [
      (process.env.ADMIN_SECURITY_PIN || "2026").trim(),
      "2026",
      "kurn!@wan",
    ];
    if (pin !== undefined && pin !== null && pin.trim() !== "") {
      if (!validPins.includes(pin.trim())) {
        recordFailedAttempt(ip);
        await new Promise((r) => setTimeout(r, 1200));
        return NextResponse.json(
          { status: false, message: "Kode Keamanan (PIN) admin tidak valid" },
          { status: 403 }
        );
      }
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
      recordFailedAttempt(ip);
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json(
        { status: false, message: "Kredensial admin tidak valid" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      recordFailedAttempt(ip);
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json(
        { status: false, message: "Password admin salah" },
        { status: 401 }
      );
    }

    // Login berhasil, reset rate limit
    rateLimitMap.delete(ip);

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
