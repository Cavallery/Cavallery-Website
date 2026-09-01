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
