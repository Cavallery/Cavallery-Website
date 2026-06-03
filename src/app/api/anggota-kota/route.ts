import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "data");
const ANGGOTA_KOTA_PATH = path.join(DATA_DIR, "anggota-kota.json");

function ensureDataDirectory() {
  const dir = path.dirname(ANGGOTA_KOTA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readAnggotaKota() {
  ensureDataDirectory();
  if (fs.existsSync(ANGGOTA_KOTA_PATH)) {
    try {
      const content = fs.readFileSync(ANGGOTA_KOTA_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading anggota-kota.json:", e);
    }
  }

  // Default CityData
  const defaultData = {
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

function writeAnggotaKota(data: Record<string, number>) {
  ensureDataDirectory();
  fs.writeFileSync(ANGGOTA_KOTA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = readAnggotaKota();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      writeAnggotaKota(body);
      return NextResponse.json({ success: true, data: body });
    }
    return NextResponse.json({ success: false, message: "Invalid payload, object expected" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
