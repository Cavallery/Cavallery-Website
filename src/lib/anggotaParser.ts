import fs from "fs";
import path from "path";

export interface AnggotaRecord {
  id: number;
  batch: string;
  batchNumber: number;
  noAnggota: string; // Format: CAVA-0001 (4 digit)
  legacyNoAnggota?: string;
  nama: string;
  idLine: string;
  domisili: string;
  displayName: string;
  tunggakanKas: string;
  nominalKas: string;
  nominalKasNumber: number;
  terakhirBayar: string;
  status: "Aktif" | "Keluar";
  role: "Admin" | "Anggota" | "Keluar";
}

let cachedMembers: AnggotaRecord[] | null = null;

// Tentukan batch berdasarkan nomor anggota
export function getBatchFromNumber(num: number): { batch: string; batchNumber: number } {
  if (num <= 20) return { batch: "Batch 1", batchNumber: 1 };
  if (num <= 32) return { batch: "Batch 2", batchNumber: 2 };
  if (num <= 49) return { batch: "Batch 3", batchNumber: 3 };
  if (num <= 128) return { batch: "Batch 4", batchNumber: 4 };
  if (num <= 345) return { batch: "Batch 5", batchNumber: 5 };
  if (num <= 430) return { batch: "Batch 6", batchNumber: 6 };
  if (num <= 518) return { batch: "Batch 7", batchNumber: 7 };
  if (num <= 582) return { batch: "Batch 8", batchNumber: 8 };
  return { batch: "Batch 9", batchNumber: 9 };
}

export function formatNoAnggota4Digit(input: string | number): string {
  if (typeof input === "number") {
    return `CAVA-${String(input).padStart(4, "0")}`;
  }
  const clean = String(input).trim();
  const directMatch = clean.match(/^CAVA-(\d{1,5})$/i);
  if (directMatch) {
    return `CAVA-${String(parseInt(directMatch[1], 10)).padStart(4, "0")}`;
  }
  const numMatch = clean.match(/-(\d+)$/) || clean.match(/(\d+)$/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return `CAVA-${String(num).padStart(4, "0")}`;
  }
  return clean.toUpperCase();
}

// Daftar nomor anggota yang merupakan Admin Fanbase resmi
const KNOWN_ADMIN_NUMBERS = new Set([
  0,   // Catherina Vallencia Kurniawan
  1,   // Aditya Pratama Putra
  7,   // Ekal
  18,  // Farrel Awalya Susanto
  21,  // Aqil
  23,  // Rizqi Abdullah
  31,  // Dio Ramadhan
  38,  // Edu Agritama
]);

// Map domisili default yang sudah dipetakan dari data resmi Cavallery
export const DOMISILI_MAP: Record<string, string> = {
  "CAVA-0000": "Tangerang",
  "CAVA-0001": "Bekasi",
  "CAVA-0005": "Denpasar",
  "CAVA-0011": "Bogor",
  "CAVA-0014": "Tangerang Selatan",
  "CAVA-0016": "Jakarta",
  "CAVA-0018": "Bogor",
  "CAVA-0021": "Bekasi",
  "CAVA-0023": "Bandung",
  "CAVA-0031": "Jakarta",
  "CAVA-0038": "Lubuklinggau",
  "CAVA-0069": "Jombang",
  "CAVA-0081": "Pasuruan",
  "CAVA-0085": "Bekasi",
  "CAVA-0108": "Bandung",
  "CAVA-0110": "Depok",
  "CAVA-0119": "Jambi",
  "CAVA-0121": "Jambi",
  "CAVA-0125": "Bekasi",
  "CAVA-0132": "Bekasi",
  "CAVA-0140": "Karawang",
  "CAVA-0143": "Bekasi",
  "CAVA-0145": "Sragen",
  "CAVA-0157": "Padang",
  "CAVA-0165": "Bekasi",
  "CAVA-0171": "Kalimantan",
  "CAVA-0174": "Tangerang Selatan",
  "CAVA-0189": "Karawang",
  "CAVA-0196": "Depok",
  "CAVA-0205": "Jakarta Selatan",
  "CAVA-0215": "Bekasi",
  "CAVA-0220": "Bandung",
  "CAVA-0230": "Purwakarta",
  "CAVA-0240": "Bogor",
  "CAVA-0245": "Sulawesi Selatan",
  "CAVA-0250": "Palangka Raya",
  "CAVA-0254": "Bandung",
  "CAVA-0302": "Malang",
  "CAVA-0311": "Jakarta",
  "CAVA-0337": "Jakarta",
  "CAVA-0341": "Jakarta",
  "CAVA-0358": "Bekasi",
  "CAVA-0369": "Bandung",
  "CAVA-0372": "Sidoarjo",
  "CAVA-0387": "Jakarta Selatan",
  "CAVA-0395": "Depok",
  "CAVA-0396": "Surabaya",
  "CAVA-0408": "Semarang",
  "CAVA-0418": "Samarinda",
  "CAVA-0436": "Magelang",
  "CAVA-0450": "Jakarta",
  "CAVA-0451": "Jakarta",
  "CAVA-0458": "Bengkulu",
  "CAVA-0475": "Padang",
  "CAVA-0487": "Bekasi",
  "CAVA-0491": "Bekasi",
  "CAVA-0505": "DI Yogyakarta",
  "CAVA-0511": "Tangerang Selatan",
  "CAVA-0514": "Tangerang Selatan",
  "CAVA-0520": "Jakarta",
  "CAVA-0525": "Kuningan",
  "CAVA-0526": "Sukabumi",
  "CAVA-0527": "Semarang",
  "CAVA-0528": "Bandung",
  "CAVA-0532": "Bekasi",
  "CAVA-0536": "Tasikmalaya",
  "CAVA-0538": "Denpasar",
  "CAVA-0539": "Bandung",
  "CAVA-0540": "Tangerang",
  "CAVA-0546": "Lampung",
  "CAVA-0548": "Pekanbaru",
  "CAVA-0549": "Jakarta",
  "CAVA-0550": "DI Yogyakarta",
  "CAVA-0551": "Jakarta",
  "CAVA-0554": "Jakarta",
  "CAVA-0557": "Jakarta Barat",
  "CAVA-0561": "Kalimantan",
  "CAVA-0563": "Lampung",
  "CAVA-0567": "Kalimantan",
  "CAVA-0568": "Lampung",
  "CAVA-0569": "Jakarta Timur",
  "CAVA-0572": "Bandung",
  "CAVA-0573": "Surabaya",
  "CAVA-0575": "Tasikmalaya",
  "CAVA-0576": "Jakarta",
  "CAVA-0577": "Bekasi",
  "CAVA-0578": "Bengkulu",
  "CAVA-0580": "Bogor",
  "CAVA-0581": "Bogor",
  "CAVA-0583": "Bekasi",
  "CAVA-0584": "Tangerang",
  "CAVA-0585": "Bekasi",
  "CAVA-0586": "Bogor",
  "CAVA-0587": "Tangerang",
  "CAVA-0588": "Padang",
  "CAVA-0589": "Palembang",
  "CAVA-0592": "Purwokerto",
  "CAVA-0594": "Jakarta",
  "CAVA-0595": "Bekasi",
  "CAVA-0597": "Jakarta Utara",
  "CAVA-0599": "Bandung",
  "CAVA-0600": "Banyuwangi",
  "CAVA-0601": "Magelang",
  "CAVA-0603": "Surabaya",
  "CAVA-0604": "Lamongan",
  "CAVA-0606": "Sidoarjo",
  "CAVA-0607": "Jakarta",
  "CAVA-0609": "Depok",
  "CAVA-0612": "Surabaya",
  "CAVA-0614": "Surabaya",
  "CAVA-0617": "Lumajang",
  "CAVA-0618": "Gresik",
  "CAVA-0619": "Bogor",
  "CAVA-0620": "DI Yogyakarta",
  "CAVA-0621": "Palembang",
  "CAVA-0622": "Bekasi",
  "CAVA-0623": "Purwokerto",
  "CAVA-0624": "Jakarta",
  "CAVA-0625": "Palu",
  "CAVA-0627": "Surabaya",
  "CAVA-0628": "Samarinda",
  "CAVA-0630": "Jakarta",
  "CAVA-0631": "Jakarta",
  "CAVA-0632": "Kepulauan Seribu / Kelapa Gading",
  "CAVA-0635": "Jakarta",
  "CAVA-0636": "Sidoarjo",
  "CAVA-0637": "Bogor",
  "CAVA-0640": "Jakarta Barat",
  "CAVA-0641": "Bengkulu",
  "CAVA-0643": "Bekasi",
  "CAVA-0644": "Bekasi",
  "CAVA-0649": "Kuningan",
};

export function parseOfficialTsv(tsvText: string): AnggotaRecord[] {
  const lines = tsvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: AnggotaRecord[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("No. Anggota") || line.startsWith("No\t")) continue;

    const parts = line.split("\t").map((p) => p.trim());
    if (parts.length < 2) continue;

    const rawNo = parts[0];
    const nama = parts[1] || "-";
    const idLine = parts[2] || "-";
    const rawDomisili = parts[3] && parts[3] !== "-" ? parts[3] : "";
    const rawStatus = parts[4] || "";
    const rawRole = parts[5] || "";

    const numMatch = rawNo.match(/(\d+)$/);
    const num = numMatch ? parseInt(numMatch[1], 10) : i;

    const noAnggota = formatNoAnggota4Digit(num);
    const { batch, batchNumber } = getBatchFromNumber(num);

    // Ambil domisili dari TSV kolom 4 atau DOMISILI_MAP
    const domisili = rawDomisili || DOMISILI_MAP[noAnggota] || "-";

    // Deteksi status: jika ID LINE adalah placeholder 'line_cavaXXXX', status Keluar
    // Selain itu berstatus Aktif (atau sesuai kolom TSV jika ada)
    const isPlaceholderLine = idLine.toLowerCase().startsWith("line_cava");
    let status: "Aktif" | "Keluar" = "Aktif";
    if (rawStatus === "Keluar" || (isPlaceholderLine && rawStatus !== "Aktif")) {
      status = "Keluar";
    }

    // Deteksi role: Admin vs Anggota vs Keluar
    let role: "Admin" | "Anggota" | "Keluar" = "Anggota";
    if (rawRole === "Admin" || KNOWN_ADMIN_NUMBERS.has(num)) {
      role = "Admin";
    } else if (status === "Keluar" || rawRole === "Keluar") {
      role = "Keluar";
    }

    // Display Name standar LINE
    const shortNo = String(num).padStart(3, "0");
    const displayName = `CAVA ${shortNo} ${nama}`;

    results.push({
      id: num + 1,
      batch,
      batchNumber,
      noAnggota,
      legacyNoAnggota: rawNo,
      nama,
      idLine,
      domisili,
      displayName,
      tunggakanKas: "-",
      nominalKas: "-",
      nominalKasNumber: 0,
      terakhirBayar: "-",
      status,
      role,
    });
  }

  return results;
}

export function getAllMembers(): AnggotaRecord[] {
  if (cachedMembers && cachedMembers.length > 0) {
    return cachedMembers;
  }

  const jsonPath = path.join(process.cwd(), "src", "data", "anggota_list.json");
  const tsvPath = path.join(process.cwd(), "src", "data", "official_members.tsv");

  // 1. Cek JSON jika ada dan lengkap (> 100 record)
  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 100) {
        cachedMembers = parsed.map((item) => ({
          ...item,
          noAnggota: formatNoAnggota4Digit(item.noAnggota),
          domisili: item.domisili && item.domisili !== "-" ? item.domisili : (DOMISILI_MAP[formatNoAnggota4Digit(item.noAnggota)] || "-"),
        }));
        return cachedMembers;
      }
    } catch (e) {
      console.error("[getAllMembers] Error reading anggota_list.json:", e);
    }
  }

  // 2. Parse official_members.tsv
  if (fs.existsSync(tsvPath)) {
    try {
      const rawTsv = fs.readFileSync(tsvPath, "utf-8");
      const parsed = parseOfficialTsv(rawTsv);
      if (parsed.length > 0) {
        cachedMembers = parsed;
        try {
          fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), "utf-8");
        } catch (_) {}
        return cachedMembers;
      }
    } catch (e) {
      console.error("[getAllMembers] Error parsing official_members.tsv:", e);
    }
  }

  return [];
}

export function saveAllMembers(list: AnggotaRecord[]): boolean {
  try {
    const formattedList = list.map((item) => ({
      ...item,
      noAnggota: formatNoAnggota4Digit(item.noAnggota),
    }));
    cachedMembers = formattedList;

    const jsonPath = path.join(process.cwd(), "src", "data", "anggota_list.json");
    fs.writeFileSync(jsonPath, JSON.stringify(formattedList, null, 2), "utf-8");

    // Simpan juga ke TSV agar data tetap konsisten
    try {
      const tsvPath = path.join(process.cwd(), "src", "data", "official_members.tsv");
      const lines = ["No. Anggota\tNama Lengkap\tID LINE\tDomisili\tStatus\tRole"];
      for (const m of formattedList) {
        lines.push(`${m.noAnggota}\t${m.nama}\t${m.idLine}\t${m.domisili || "-"}\t${m.status}\t${m.role}`);
      }
      fs.writeFileSync(tsvPath, lines.join("\n"), "utf-8");
    } catch (err) {
      console.warn("[saveAllMembers] Could not rewrite TSV:", err);
    }

    return true;
  } catch (e) {
    console.error("[saveAllMembers] Error saving to anggota_list.json:", e);
    return false;
  }
}
