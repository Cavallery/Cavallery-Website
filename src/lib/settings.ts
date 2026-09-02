import { query } from "@/lib/mysql";

// In-memory fallback if MySQL is not configured yet or table not created
let memorySettings: Record<string, string> = {
  register_anggota_open: "1",
  register_donatur_open: "1",
};

export async function getSetting(key: string, defaultValue: string = "1"): Promise<string> {
  try {
    const rows = await query<any[]>(
      "SELECT nilai FROM pengaturan WHERE kunci = ? LIMIT 1",
      [key]
    );
    if (rows && rows.length > 0 && rows[0].nilai !== undefined && rows[0].nilai !== null) {
      return String(rows[0].nilai);
    }
  } catch (err: any) {
    // If table doesn't exist yet, try creating it automatically
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS pengaturan (
          kunci VARCHAR(100) PRIMARY KEY,
          nilai TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await query(
        "INSERT IGNORE INTO pengaturan (kunci, nilai) VALUES (?, ?)",
        [key, defaultValue]
      );
    } catch {}
  }

  return memorySettings[key] ?? defaultValue;
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  memorySettings[key] = value;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS pengaturan (
        kunci VARCHAR(100) PRIMARY KEY,
        nilai TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await query(
      `INSERT INTO pengaturan (kunci, nilai) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)`,
      [key, value]
    );
    return true;
  } catch (err: any) {
    console.error("[Settings Error]:", err.message);
    return true; // memory fallback worked
  }
}

export async function getAllRegistrationSettings() {
  const anggotaOpen = (await getSetting("register_anggota_open", "1")) === "1";
  const donaturOpen = (await getSetting("register_donatur_open", "1")) === "1";
  return {
    registerAnggotaOpen: anggotaOpen,
    registerDonaturOpen: donaturOpen,
  };
}

export interface MasterData {
  divisi: string[];
  tipeDonasi: string[];
  nominalKas: number[];
  nominalDonasi: number[];
  platforms: string[];
  defaultNominalKas: number;
  kategoriPengeluaran: string[];
  tahunKasAktif: number[];
  jabatanBebasKas: string[];
}

export const DEFAULT_MASTER_DATA: MasterData = {
  divisi: [
    "Ketua",
    "Wakil Ketua",
    "Sekretariat",
    "Bendahara",
    "Divisi Sosial Media",
    "Divisi Desain",
    "Divisi IT",
    "Divisi Kordinator Lapangan",
    "Divisi Esport",
    "Divisi Humas",
  ],
  tipeDonasi: [
    "General Support",
    "Birthday Project",
    "Event Fanbase",
    "Merchandise Fanbase",
    "Project Khusus",
  ],
  nominalKas: [10000, 15000, 20000, 50000, 100000],
  nominalDonasi: [10000, 25000, 50000, 100000, 250000, 500000],
  platforms: [
    "LINE",
    "X (Twitter)",
    "Instagram",
    "TikTok",
    "Discord",
    "WhatsApp",
  ],
  defaultNominalKas: 15000,
  kategoriPengeluaran: [
    "Operasional Fanbase",
    "Event / Project Show",
    "Konsumsi Tim",
    "Website & Server",
    "Produksi Merchandise",
    "Banner & Handbanner",
    "Dokumentasi & Media",
    "Lain-lain",
  ],
  tahunKasAktif: [2024, 2025, 2026, 2027, 2028, 2029],
  jabatanBebasKas: ["Admin Fanbase", "Pengurus Fanbase"],
};

export async function getMasterData(): Promise<MasterData> {
  try {
    const raw = await getSetting("master_data_json", "");
    if (raw && raw.trim()) {
      const parsed = JSON.parse(raw);
      return {
        divisi: Array.isArray(parsed.divisi) && parsed.divisi.length > 0 ? parsed.divisi : DEFAULT_MASTER_DATA.divisi,
        tipeDonasi: Array.isArray(parsed.tipeDonasi) && parsed.tipeDonasi.length > 0 ? parsed.tipeDonasi : DEFAULT_MASTER_DATA.tipeDonasi,
        nominalKas: Array.isArray(parsed.nominalKas) && parsed.nominalKas.length > 0 ? parsed.nominalKas : DEFAULT_MASTER_DATA.nominalKas,
        nominalDonasi: Array.isArray(parsed.nominalDonasi) && parsed.nominalDonasi.length > 0 ? parsed.nominalDonasi : DEFAULT_MASTER_DATA.nominalDonasi,
        platforms: Array.isArray(parsed.platforms) && parsed.platforms.length > 0 ? parsed.platforms : DEFAULT_MASTER_DATA.platforms,
        defaultNominalKas: typeof parsed.defaultNominalKas === "number" ? parsed.defaultNominalKas : DEFAULT_MASTER_DATA.defaultNominalKas,
        kategoriPengeluaran: Array.isArray(parsed.kategoriPengeluaran) && parsed.kategoriPengeluaran.length > 0 ? parsed.kategoriPengeluaran : DEFAULT_MASTER_DATA.kategoriPengeluaran,
        tahunKasAktif: Array.isArray(parsed.tahunKasAktif) && parsed.tahunKasAktif.length > 0 ? parsed.tahunKasAktif : DEFAULT_MASTER_DATA.tahunKasAktif,
        jabatanBebasKas: Array.isArray(parsed.jabatanBebasKas) && parsed.jabatanBebasKas.length > 0 ? parsed.jabatanBebasKas : DEFAULT_MASTER_DATA.jabatanBebasKas,
      };
    }
  } catch (err) {
    console.error("Error reading master data from db:", err);
  }
  return DEFAULT_MASTER_DATA;
}

export async function saveMasterData(data: Partial<MasterData>): Promise<MasterData> {
  const current = await getMasterData();
  const updated: MasterData = {
    ...current,
    ...data,
  };
  await setSetting("master_data_json", JSON.stringify(updated));
  return updated;
}

