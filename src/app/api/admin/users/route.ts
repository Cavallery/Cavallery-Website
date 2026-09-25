import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, isMySqlConfigured } from "@/lib/mysql";
import { logActivity } from "@/lib/logger";

interface AdminUser {
  id: number | string;
  username: string;
  name: string;
  role: string;
  division?: string;
  created_at?: string;
  password_hash?: string;
}

// Fallback in-memory users if database is offline
const fallbackUsers: AdminUser[] = [
  { id: 1, username: "admin", name: "Admin Utama", role: "superadmin", division: "Project Leader", created_at: "2026-01-01 00:00:00" },
  { id: 2, username: "vallencia", name: "Vallencia", role: "superadmin", division: "Project Leader", created_at: "2026-01-01 00:00:00" },
  { id: 3, username: "aditya", name: "Aditya", role: "superadmin", division: "IT & Webmaster", created_at: "2026-09-24 18:00:00" },
  { id: 4, username: "dior", name: "Dior", role: "admin", division: "Bendahara", created_at: "2026-02-01 00:00:00" },
  { id: 5, username: "rf", name: "RF", role: "admin", division: "Humas & Event", created_at: "2026-02-01 00:00:00" },
];

let tablesInitialized = false;

async function ensureAdminTables() {
  if (!isMySqlConfigured() || tablesInitialized) return;
  try {
    // 1. Buat tabel admin_users jika belum ada
    await query(`
      CREATE TABLE IF NOT EXISTS \`admin_users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(100) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(150) DEFAULT 'Admin Cavallery',
        \`role\` VARCHAR(50) DEFAULT 'admin',
        \`division\` VARCHAR(100) DEFAULT 'Operasional',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_admin_username\` (\`username\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Tambah kolom ke kedua tabel jika belum ada
    try { await query("ALTER TABLE `admin_users` ADD COLUMN `division` VARCHAR(100) DEFAULT 'Operasional'"); } catch {}
    try { await query("ALTER TABLE `admin_users` ADD COLUMN `role` VARCHAR(50) DEFAULT 'admin'"); } catch {}
    try { await query("ALTER TABLE `admin` ADD COLUMN `division` VARCHAR(100) DEFAULT 'Operasional'"); } catch {}
    try { await query("ALTER TABLE `admin` ADD COLUMN `role` VARCHAR(50) DEFAULT 'admin'"); } catch {}

    // 3. Sinkronkan seluruh data akun dari tabel admin ke admin_users
    try {
      await query(`
        INSERT INTO \`admin_users\` (\`username\`, \`password_hash\`, \`name\`, \`role\`, \`division\`)
        SELECT \`username\`, \`password_hash\`, COALESCE(\`nama\`, \`username\`), 'admin', 'Operasional'
        FROM \`admin\`
        ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
      `);
    } catch {}

    // 4. Jika admin_users masih kosong (database baru), masukkan seed default
    const countRes = await query<any[]>("SELECT COUNT(*) AS c FROM \`admin_users\`");
    if (!countRes || countRes[0]?.c === 0) {
      await query(`
        INSERT INTO \`admin_users\` (\`username\`, \`password_hash\`, \`name\`, \`role\`, \`division\`)
        VALUES 
          ('admin', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Admin Utama', 'superadmin', 'Project Leader'),
          ('vallencia', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Vallencia', 'superadmin', 'Project Leader'),
          ('aditya', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Aditya Kurniawan', 'superadmin', 'IT & Webmaster'),
          ('dior', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Dior', 'admin', 'Bendahara'),
          ('rf', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'RF', 'admin', 'Humas & Event')
        ON DUPLICATE KEY UPDATE \`role\` = VALUES(\`role\`), \`division\` = VALUES(\`division\`);
      `);
    }

    tablesInitialized = true;
  } catch (err: any) {
    console.warn("[ensureAdminTables] notice:", err.message);
  }
}

export async function GET() {
  await ensureAdminTables();

  if (isMySqlConfigured()) {
    try {
      // Prioritaskan tabel admin_users
      let rows = await query<any[]>(
        "SELECT id, username, COALESCE(name, nama, username) AS name, COALESCE(role, 'admin') AS role, COALESCE(division, 'Operasional') AS division, created_at FROM `admin_users` ORDER BY id ASC"
      );

      // Fallback ke tabel admin jika admin_users kosong
      if (!rows || rows.length === 0) {
        rows = await query<any[]>(
          "SELECT id, username, COALESCE(nama, username) AS name, COALESCE(role, 'admin') AS role, COALESCE(division, 'Operasional') AS division, created_at FROM `admin` ORDER BY id ASC"
        );
      }

      if (rows && rows.length > 0) {
        const users = rows.map(r => ({
          id: r.id,
          username: r.username,
          name: r.name,
          role: r.role || "admin",
          division: r.division || "Operasional",
          created_at: r.created_at || null,
        }));
        return NextResponse.json({ success: true, data: users });
      }
    } catch (e: any) {
      console.error("Error fetching admin users from MySQL:", e.message);
    }
  }

  return NextResponse.json({ success: true, data: fallbackUsers });
}

export async function POST(req: NextRequest) {
  await ensureAdminTables();

  try {
    const body = await req.json();
    const { action } = body;

    // 1. CREATE USER
    if (action === "create") {
      const { username, name, password, role = "admin", division = "Operasional" } = body;
      if (!username || !password) {
        return NextResponse.json({ success: false, message: "Username dan password wajib diisi" }, { status: 400 });
      }

      const hash = await bcrypt.hash(password, 10);
      const cleanUsername = String(username).trim().toLowerCase();
      const cleanName = String(name || username).trim();
      const cleanDivision = String(division || "Operasional").trim();
      const cleanRole = String(role || "admin").trim().toLowerCase();

      if (isMySqlConfigured()) {
        try {
          // Insert ke admin_users
          await query(
            "INSERT INTO `admin_users` (`username`, `password_hash`, `role`, `name`, `division`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())",
            [cleanUsername, hash, cleanRole, cleanName, cleanDivision]
          );

          // Sync ke tabel admin
          try {
            await query(
              "INSERT INTO `admin` (`username`, `password_hash`, `nama`, `role`, `division`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`), `role`=VALUES(`role`), `division`=VALUES(`division`), `nama`=VALUES(`nama`)",
              [cleanUsername, hash, cleanName, cleanRole, cleanDivision]
            );
          } catch {
            try {
              await query(
                "INSERT INTO `admin` (`username`, `password_hash`, `nama`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`), `nama`=VALUES(`nama`)",
                [cleanUsername, hash, cleanName]
              );
            } catch {}
          }

          await logActivity({
            username: "admin",
            action: "Tambah Pengguna",
            module: "Manajemen Pengguna",
            details: `Menambahkan admin: ${cleanUsername} (Divisi: ${cleanDivision}, Role: ${cleanRole})`,
          });

          return NextResponse.json({ success: true, message: `Admin ${cleanUsername} berhasil ditambahkan` });
        } catch (dbErr: any) {
          if (dbErr.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ success: false, message: "Username sudah terdaftar" }, { status: 400 });
          }
          console.error("MySQL create user error:", dbErr.message);
        }
      }

      // Memory fallback
      fallbackUsers.push({
        id: Date.now(),
        username: cleanUsername,
        name: cleanName,
        role: cleanRole,
        division: cleanDivision,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: `Admin ${cleanUsername} berhasil disimpan` });
    }

    // 2. UPDATE USER
    if (action === "update") {
      const { id, username, name, password, role = "admin", division = "Operasional" } = body;
      if (!id && !username) {
        return NextResponse.json({ success: false, message: "ID atau username diperlukan" }, { status: 400 });
      }

      const cleanUsername = String(username || "").trim().toLowerCase();
      const cleanName = String(name || username).trim();
      const cleanDivision = String(division || "Operasional").trim();
      const cleanRole = String(role || "admin").trim().toLowerCase();

      let hash: string | null = null;
      if (password && password.trim()) {
        hash = await bcrypt.hash(password.trim(), 10);
      }

      if (isMySqlConfigured()) {
        try {
          // 1. Pastikan kolom division dan role ada di kedua tabel
          try { await query("ALTER TABLE `admin_users` ADD COLUMN `division` VARCHAR(100) DEFAULT 'Operasional'"); } catch {}
          try { await query("ALTER TABLE `admin_users` ADD COLUMN `role` VARCHAR(50) DEFAULT 'admin'"); } catch {}
          try { await query("ALTER TABLE `admin` ADD COLUMN `division` VARCHAR(100) DEFAULT 'Operasional'"); } catch {}
          try { await query("ALTER TABLE `admin` ADD COLUMN `role` VARCHAR(50) DEFAULT 'admin'"); } catch {}

          // 2. Update di admin_users
          let resUpdate: any;
          if (hash) {
            resUpdate = await query(
              "UPDATE `admin_users` SET `name` = ?, `role` = ?, `division` = ?, `password_hash` = ? WHERE `id` = ? OR `username` = ?",
              [cleanName, cleanRole, cleanDivision, hash, id, cleanUsername]
            );
          } else {
            resUpdate = await query(
              "UPDATE `admin_users` SET `name` = ?, `role` = ?, `division` = ? WHERE `id` = ? OR `username` = ?",
              [cleanName, cleanRole, cleanDivision, id, cleanUsername]
            );
          }

          // 3. Jika di admin_users belum ada row yang ter-update, lakukan INSERT
          if (!resUpdate || resUpdate.affectedRows === 0) {
            const defaultHash = hash || "$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO";
            await query(
              "INSERT INTO `admin_users` (`username`, `password_hash`, `name`, `role`, `division`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `role`=VALUES(`role`), `division`=VALUES(`division`)",
              [cleanUsername, defaultHash, cleanName, cleanRole, cleanDivision]
            );
          }

          // 4. Update juga tabel admin lama untuk sinkronisasi
          try {
            if (hash) {
              await query(
                "UPDATE `admin` SET `nama` = ?, `role` = ?, `division` = ?, `password_hash` = ? WHERE `id` = ? OR `username` = ?",
                [cleanName, cleanRole, cleanDivision, hash, id, cleanUsername]
              );
            } else {
              await query(
                "UPDATE `admin` SET `nama` = ?, `role` = ?, `division` = ? WHERE `id` = ? OR `username` = ?",
                [cleanName, cleanRole, cleanDivision, id, cleanUsername]
              );
            }
          } catch {
            try {
              await query(
                "UPDATE `admin` SET `nama` = ? WHERE `id` = ? OR `username` = ?",
                [cleanName, id, cleanUsername]
              );
            } catch {}
          }

          await logActivity({
            username: "admin",
            action: "Update Pengguna",
            module: "Manajemen Pengguna",
            details: `Memperbarui admin: ${cleanUsername} (Divisi: ${cleanDivision}, Role: ${cleanRole})`,
          });

          return NextResponse.json({
            success: true,
            message: `Data admin ${cleanUsername} berhasil diperbarui (Divisi: ${cleanDivision}, Role: ${cleanRole})`,
          });
        } catch (e: any) {
          console.error("MySQL update user error:", e.message);
          return NextResponse.json({ success: false, message: `Gagal database: ${e.message}` }, { status: 500 });
        }
      }

      // Memory fallback
      const found = fallbackUsers.find(u => u.id === id || u.username === cleanUsername);
      if (found) {
        if (cleanName) found.name = cleanName;
        if (cleanRole) found.role = cleanRole;
        if (cleanDivision) found.division = cleanDivision;
      }
      return NextResponse.json({
        success: true,
        message: `Data admin ${cleanUsername} berhasil diperbarui (Divisi: ${cleanDivision}, Role: ${cleanRole})`,
      });
    }

    // 3. DELETE USER
    if (action === "delete") {
      const { id, username } = body;
      const lower = String(username || "").trim().toLowerCase();
      if (lower === "admin" || lower === "vallencia" || lower === "aditya") {
        return NextResponse.json({ success: false, message: "Akun Super Admin utama tidak boleh dihapus!" }, { status: 403 });
      }

      if (isMySqlConfigured()) {
        try {
          await query("DELETE FROM `admin_users` WHERE `id` = ? OR `username` = ?", [id, lower]);
          try {
            await query("DELETE FROM `admin` WHERE `id` = ? OR `username` = ?", [id, lower]);
          } catch {}

          await logActivity({
            username: "admin",
            action: "Hapus Pengguna",
            module: "Manajemen Pengguna",
            details: `Menghapus admin: ${lower}`,
          });

          return NextResponse.json({ success: true, message: `Admin ${lower} berhasil dihapus` });
        } catch (e: any) {
          console.error("MySQL delete user error:", e.message);
        }
      }

      // Memory fallback
      const idx = fallbackUsers.findIndex(u => u.id === id || u.username.toLowerCase() === lower);
      if (idx !== -1) fallbackUsers.splice(idx, 1);

      return NextResponse.json({ success: true, message: `Admin ${lower} berhasil dihapus` });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenal" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
