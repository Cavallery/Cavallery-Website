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

// Daftar nomor anggota yang merupakan Admin
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

    const numMatch = rawNo.match(/(\d+)$/);
    const num = numMatch ? parseInt(numMatch[1], 10) : i;

    const noAnggota = formatNoAnggota4Digit(num);
    const { batch, batchNumber } = getBatchFromNumber(num);

    // Deteksi status: jika ID LINE adalah placeholder 'line_cavaXXXX', status Keluar
    // Selain itu berstatus Aktif
    const isPlaceholderLine = idLine.toLowerCase().startsWith("line_cava");
    const status: "Aktif" | "Keluar" = isPlaceholderLine ? "Keluar" : "Aktif";

    // Deteksi role: Admin vs Anggota vs Keluar
    let role: "Admin" | "Anggota" | "Keluar" = "Anggota";
    if (KNOWN_ADMIN_NUMBERS.has(num)) {
      role = "Admin";
    } else if (status === "Keluar") {
      role = "Keluar";
    }

    // Display Name standar
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
      domisili: "-",
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

  // Prioritaskan official_members.tsv yang diberikan oleh user!
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

  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedMembers = parsed.map((item) => ({
          ...item,
          noAnggota: formatNoAnggota4Digit(item.noAnggota),
        }));
        return cachedMembers;
      }
    } catch (e) {
      console.error("[getAllMembers] Error reading anggota_list.json:", e);
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
    return true;
  } catch (e) {
    console.error("[saveAllMembers] Error saving to anggota_list.json:", e);
    return false;
  }
}
