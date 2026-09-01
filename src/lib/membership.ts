import { query } from "./mysql";

/**
 * Generate sequential membership ID like CAVA-0001, CAVA-0002, etc.
 */
export async function generateNextNoAnggota(): Promise<string> {
  try {
    const rows = await query<any[]>(
      "SELECT no_anggota FROM anggota WHERE no_anggota IS NOT NULL ORDER BY id DESC LIMIT 1"
    );

    if (rows && rows.length > 0 && rows[0].no_anggota) {
      const lastNo = rows[0].no_anggota; // e.g. "CAVA-0042"
      const match = lastNo.match(/CAVA-(\d+)/i);
      if (match && match[1]) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `CAVA-${String(nextNum).padStart(4, "0")}`;
      }
    }
  } catch (err) {
    console.error("Error calculating next noAnggota:", err);
  }

  return "CAVA-0001";
}
