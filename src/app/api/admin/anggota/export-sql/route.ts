import { NextRequest, NextResponse } from "next/server";
import { fetchAllAnggota } from "@/lib/anggotaCavaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const members = await fetchAllAnggota();

    let sql = `-- ============================================================
-- CAVALLERY FANBASE: DATA ANGGOTA (BATCH 1 - 9)
-- Database: Hostinger MySQL / u410588002_Cavallery
-- Total Data: ${members.length} Anggota
-- Generated: ${new Date().toISOString()}
-- ============================================================

CREATE TABLE IF NOT EXISTS \`anggota_cava\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`batch\` VARCHAR(50) NOT NULL,
  \`batch_number\` INT NOT NULL DEFAULT 1,
  \`no_anggota\` VARCHAR(50) NOT NULL UNIQUE,
  \`nama\` VARCHAR(191) NOT NULL,
  \`id_line\` VARCHAR(191) DEFAULT '-',
  \`domisili\` VARCHAR(191) DEFAULT '-',
  \`display_name\` VARCHAR(191) DEFAULT '-',
  \`status\` ENUM('Aktif', 'Keluar') NOT NULL DEFAULT 'Aktif',
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'Anggota',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_batch\` (\`batch_number\`),
  INDEX \`idx_no_anggota\` (\`no_anggota\`),
  INDEX \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT DATA ANGGOTA FORMAT 4 DIGIT (CAVA-XXXX)
-- ============================================================
INSERT INTO \`anggota_cava\` 
(\`batch\`, \`batch_number\`, \`no_anggota\`, \`nama\`, \`id_line\`, \`domisili\`, \`display_name\`, \`status\`, \`role\`)
VALUES
`;

    const escapeSql = (str: any) => {
      if (str === null || str === undefined) return "''";
      return `'${String(str).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
    };

    const valueRows = members.map((m) => {
      return `(${escapeSql(m.batch)}, ${m.batchNumber}, ${escapeSql(m.noAnggota)}, ${escapeSql(m.nama)}, ${escapeSql(m.idLine)}, ${escapeSql(m.domisili)}, ${escapeSql(m.displayName)}, ${escapeSql(m.status)}, ${escapeSql(m.role)})`;
    });

    sql += valueRows.join(",\n") + "\n";
    sql += `ON DUPLICATE KEY UPDATE
  \`batch\` = VALUES(\`batch\`),
  \`batch_number\` = VALUES(\`batch_number\`),
  \`nama\` = VALUES(\`nama\`),
  \`id_line\` = VALUES(\`id_line\`),
  \`domisili\` = VALUES(\`domisili\`),
  \`display_name\` = VALUES(\`display_name\`),
  \`status\` = VALUES(\`status\`),
  \`role\` = VALUES(\`role\`);
`;

    return new NextResponse(sql, {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": 'attachment; filename="anggota_cava_hostinger.sql"',
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[Export SQL Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export SQL" },
      { status: 500 }
    );
  }
}
