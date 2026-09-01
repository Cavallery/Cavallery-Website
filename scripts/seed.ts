import bcrypt from "bcryptjs";
import { query } from "../src/lib/mysql";

async function main() {
  const passwordHash = await bcrypt.hash("Cavallery2026!", 10);

  const existing = await query<any[]>("SELECT id FROM admin WHERE username = 'admin' LIMIT 1");
  if (!existing || existing.length === 0) {
    await query(
      "INSERT INTO admin (username, password_hash, nama) VALUES (?, ?, ?)",
      ["admin", passwordHash, "Admin Cavallery"]
    );
    console.log("Admin created: admin / Cavallery2026!");
  } else {
    console.log("Admin already exists.");
  }
}

main().catch(console.error);
