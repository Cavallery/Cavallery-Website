import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query, isMySqlConfigured } from "@/lib/mysql";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const ANGGOTA_KOTA_PATH = path.join(DATA_DIR, "anggota-kota.json");

function ensureDataDirectory() {
  const dir = path.dirname(ANGGOTA_KOTA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readAnggotaKotaLocal(): Record<string, number> {
  ensureDataDirectory();
  if (fs.existsSync(ANGGOTA_KOTA_PATH)) {
    try {
      const content = fs.readFileSync(ANGGOTA_KOTA_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading anggota-kota.json:", e);
    }
  }

  const defaultData: Record<string, number> = {
    Jakarta: 92, Bekasi: 64, Tangerang: 58, Bogor: 52, Depok: 28,
    Bandung: 26, Surabaya: 24, Semarang: 20, Yogyakarta: 18, Malang: 17,
    Lampung: 12, Medan: 11, Padang: 9, Balikpapan: 8, Samarinda: 10,
    Pekalongan: 7, Banyumas: 6, Kediri: 7, Jember: 5, Sidoarjo: 7,
    Magelang: 5, Kebumen: 5, Kudus: 5, Palembang: 5, Makassar: 5,
    Bengkulu: 6, Denpasar: 2, Banjar: 2, Ponorogo: 3, Nganjuk: 2,
    Batam: 2, Solo: 3, Purwakarta: 2, Pontianak: 2, Pemalang: 3,
    Pasuruan: 2, Tasikmalaya: 2, Sragen: 2, Binjai: 2, Jambi: 2,
    Indramayu: 2, Tegal: 3, Purworejo: 2, Cilegon: 2, Sukabumi: 3,
    Blitar: 2, Boyolali: 2, Karawang: 3, Mojokerto: 2, "Pangkal Pinang": 2,
    Palu: 2, Kuningan: 3, Manado: 3, Probolinggo: 2, Tuban: 2,
    Kendari: 2, Wonosobo: 2, Garut: 2, Majalengka: 2, Lumajang: 2,
    Serang: 2, Pandeglang: 2, Lubuklinggau: 1,
  };
  fs.writeFileSync(ANGGOTA_KOTA_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
  return defaultData;
}

function writeAnggotaKotaLocal(data: Record<string, number>) {
  ensureDataDirectory();
  fs.writeFileSync(ANGGOTA_KOTA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    if (isMySqlConfigured()) {
      const rows = await query<any[]>("SELECT `city`, `member_count` FROM `anggota_kota` ORDER BY `member_count` DESC");
      if (rows && rows.length > 0) {
        const result: Record<string, number> = {};
        rows.forEach((r) => {
          result[r.city] = Number(r.member_count) || 0;
        });
        return NextResponse.json({ success: true, data: result });
      }
    }
    const data = readAnggotaKotaLocal();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: true, data: readAnggotaKotaLocal() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body === "object" && body !== null && !Array.isArray(body)) {
      if (isMySqlConfigured()) {
        for (const [city, count] of Object.entries(body)) {
          await query(
            "INSERT INTO `anggota_kota` (`city`, `member_count`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `member_count`=VALUES(`member_count`)",
            [city, Number(count) || 0]
          );
        }
      }
      writeAnggotaKotaLocal(body);
      return NextResponse.json({ success: true, data: body });
    }
    return NextResponse.json({ success: false, message: "Invalid payload, object expected" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
