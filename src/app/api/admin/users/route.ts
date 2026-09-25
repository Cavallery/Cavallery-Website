import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, isMySqlConfigured } from "@/lib/mysql";
import { logActivity } from "@/lib/logger";

interface AdminUser {
  id: number | string;
  username: string;
  name: string;
  role: string;
  created_at?: string;
  password_hash?: string;
}

// Fallback in-memory users if database is offline
const fallbackUsers: AdminUser[] = [
  { id: 1, username: "admin", name: "Admin Utama", role: "superadmin", created_at: "2026-01-01 00:00:00" },
  { id: 2, username: "vallencia", name: "Vallencia", role: "superadmin", created_at: "2026-01-01 00:00:00" },
  { id: 3, username: "aditya", name: "Aditya", role: "superadmin", created_at: "2026-09-24 18:00:00" },
  { id: 4, username: "dior", name: "Dior", role: "admin", created_at: "2026-02-01 00:00:00" },
  { id: 5, username: "rf", name: "RF", role: "admin", created_at: "2026-02-01 00:00:00" },
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
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_admin_username\` (\`username\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Tambah kolom role ke tabel admin jika tabel admin sudah ada
    try {
      await query("ALTER TABLE `admin` ADD COLUMN `role` VARCHAR(50) DEFAULT 'admin'");
    } catch {}

    // 3. Sinkronkan default akun (aditya, vallencia, admin -> superadmin | dior, rf -> admin)
    const countRes = await query<any[]>("SELECT COUNT(*) AS c FROM `admin_users`");
    if (!countRes || countRes[0]?.c === 0) {
      // Migrasikan data dari tabel admin lama jika ada
      try {
        await query(`
          INSERT INTO \`admin_users\` (\`username\`, \`password_hash\`, \`name\`, \`role\`)
          SELECT \`username\`, \`password_hash\`, COALESCE(\`nama\`, \`username\`), 'admin' FROM \`admin\`
          ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
        `);
      } catch {}

      // Masukkan akun-akun utama dengan role yang sesuai
      await query(`
        INSERT INTO \`admin_users\` (\`username\`, \`password_hash\`, \`name\`, \`role\`)
        VALUES 
          ('admin', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Admin Utama', 'superadmin'),
          ('vallencia', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Vallencia', 'superadmin'),
          ('aditya', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Aditya Kurniawan', 'superadmin'),
          ('dior', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'Dior', 'admin'),
          ('rf', '$2b$10$wmkgC7X9waNv7/p1NSdml.QvdwFRnZhHNj3ydOTVj0oXSWlqgcPNO', 'RF', 'admin')
        ON DUPLICATE KEY UPDATE \`role\` = VALUES(\`role\`);
      `);
    } else {
      // Pastikan RBAC: aditya, vallencia, admin superadmin, dior & rf admin
      try {
        await query("UPDATE `admin_users` SET `role` = 'superadmin' WHERE `username` IN ('aditya', 'vallencia', 'admin') AND (`role` IS NULL OR `role` = 'admin')");
        await query("UPDATE `admin_users` SET `role` = 'admin' WHERE `username` IN ('dior', 'rf') AND (`role` IS NULL OR `role` = '')");
      } catch {}
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
        "SELECT id, username, COALESCE(name, nama, username) AS name, COALESCE(role, 'admin') AS role, created_at FROM `admin_users` ORDER BY id ASC"
      );

      if (!rows || rows.length === 0) {
        rows = await query<any[]>(
          "SELECT id, username, COALESCE(nama, username) AS name, COALESCE(role, 'admin') AS role, created_at FROM `admin` ORDER BY id ASC"
        );
      }

      if (rows && rows.length > 0) {
        const users = rows.map(r => ({
          id: r.id,
          username: r.username,
          name: r.name,
          role: r.role || (["admin", "vallencia", "aditya"].includes(r.username.toLowerCase()) ? "superadmin" : "admin"),
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
      const { username, name, password, role = "admin" } = body;
      if (!username || !password) {
        return NextResponse.json({ success: false, message: "Username dan password wajib diisi" }, { status: 400 });
      }

      const hash = await bcrypt.hash(password, 10);
      const cleanUsername = username.trim().toLowerCase();
      const cleanName = (name || username).trim();

      if (isMySqlConfigured()) {
        try {
          // Insert ke admin_users
          await query(
            "INSERT INTO `admin_users` (`username`, `password_hash`, `role`, `name`, `created_at`) VALUES (?, ?, ?, ?, NOW())",
            [cleanUsername, hash, role, cleanName]
          );

          // Coba sync ke tabel admin jika ada
          try {
            await query(
              "INSERT INTO `admin` (`username`, `password_hash`, `nama`, `role`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`), `role`=VALUES(`role`)",
              [cleanUsername, hash, cleanName, role]
            );
          } catch {
            try {
              await query(
                "INSERT INTO `admin` (`username`, `password_hash`, `nama`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`)",
                [cleanUsername, hash, cleanName]
              );
            } catch {}
          }

          await logActivity({
            username: "admin",
            action: "Tambah Pengguna",
            module: "Manajemen Pengguna",
            details: `Menambahkan admin baru: ${cleanUsername} (${role})`,
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
        role,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: `Admin ${cleanUsername} berhasil disimpan` });
    }

    // 2. UPDATE USER
    if (action === "update") {
      const { id, username, name, password, role = "admin" } = body;
      if (!id && !username) {
        return NextResponse.json({ success: false, message: "ID atau username diperlukan" }, { status: 400 });
      }

      const cleanName = (name || username).trim();
      let hash: string | null = null;
      if (password && password.trim()) {
        hash = await bcrypt.hash(password.trim(), 10);
      }

      if (isMySqlConfigured()) {
        try {
          if (hash) {
            await query(
              "UPDATE `admin_users` SET `name` = ?, `role` = ?, `password_hash` = ? WHERE `id` = ? OR `username` = ?",
              [cleanName, role, hash, id, username]
            );
            try {
              await query(
                "UPDATE `admin` SET `nama` = ?, `role` = ?, `password_hash` = ? WHERE `id` = ? OR `username` = ?",
                [cleanName, role, hash, id, username]
              );
            } catch {
              try {
                await query(
                  "UPDATE `admin` SET `nama` = ?, `password_hash` = ? WHERE `id` = ? OR `username` = ?",
                  [cleanName, hash, id, username]
                );
              } catch {}
            }
          } else {
            await query(
              "UPDATE `admin_users` SET `name` = ?, `role` = ? WHERE `id` = ? OR `username` = ?",
              [cleanName, role, id, username]
            );
            try {
              await query(
                "UPDATE `admin` SET `nama` = ?, `role` = ? WHERE `id` = ? OR `username` = ?",
                [cleanName, role, id, username]
              );
            } catch {
              try {
                await query(
                  "UPDATE `admin` SET `nama` = ? WHERE `id` = ? OR `username` = ?",
                  [cleanName, id, username]
                );
              } catch {}
            }
          }

          await logActivity({
            username: "admin",
            action: "Update Pengguna",
            module: "Manajemen Pengguna",
            details: `Memperbarui profil admin: ${username} (Role: ${role})`,
          });

          return NextResponse.json({ success: true, message: `Data admin ${username} berhasil diperbarui (Role: ${role})` });
        } catch (e: any) {
          console.error("MySQL update user error:", e.message);
        }
      }

      // Memory fallback
      const found = fallbackUsers.find(u => u.id === id || u.username === username);
      if (found) {
        if (cleanName) found.name = cleanName;
        if (role) found.role = role;
      }
      return NextResponse.json({ success: true, message: `Data admin ${username} berhasil diperbarui (Role: ${role})` });
    }

    // 3. DELETE USER
    if (action === "delete") {
      const { id, username } = body;
      const lower = (username || "").toLowerCase();
      if (lower === "admin" || lower === "vallencia" || lower === "aditya") {
        return NextResponse.json({ success: false, message: "Akun superadmin utama tidak boleh dihapus!" }, { status: 403 });
      }

      if (isMySqlConfigured()) {
        try {
          await query("DELETE FROM `admin_users` WHERE `id` = ? OR `username` = ?", [id, username]);
          try {
            await query("DELETE FROM `admin` WHERE `id` = ? OR `username` = ?", [id, username]);
          } catch {}

          await logActivity({
            username: "admin",
            action: "Hapus Pengguna",
            module: "Manajemen Pengguna",
            details: `Menghapus admin: ${username}`,
          });

          return NextResponse.json({ success: true, message: `Admin ${username} berhasil dihapus` });
        } catch (e: any) {
          console.error("MySQL delete user error:", e.message);
        }
      }

      // Memory fallback
      const idx = fallbackUsers.findIndex(u => u.id === id || u.username === username);
      if (idx !== -1) fallbackUsers.splice(idx, 1);

      return NextResponse.json({ success: true, message: `Admin ${username} berhasil dihapus` });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenal" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
