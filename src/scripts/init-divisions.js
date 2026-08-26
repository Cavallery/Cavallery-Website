const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateDivisions() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to MySQL.');

  // 1. Buat tabel recruitment_divisions
  await conn.query(`
    CREATE TABLE IF NOT EXISTS recruitment_divisions (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Masukkan 7 divisi resmi Cavallery
  const divisions = [
    ['korlap', 'Koordinator Lapangan', 'Bertanggung jawab atas koordinasi kegiatan lapangan, gathering, dan ticketing offline.', 1],
    ['it', 'IT', 'Pengembangan dan pemeliharaan website, sistem bot, database, dan otomasi teknologi.', 2],
    ['humas', 'Humas', 'Hubungan masyarakat, media sosial, publikasi, dan komunikasi eksternal.', 3],
    ['desain', 'Desain', 'Pembuatan konten visual, grafis media sosial, banner proyek, dan aset merchandise.', 4],
    ['esport', 'Esport', 'Pengelolaan tim, turnamen, dan kegiatan gaming/e-sport komunitas Cavallery.', 5],
    ['keuangan', 'Finansial / Keuangan', 'Pengelolaan anggaran, pembukuan donasi proyek, dan keuangan merchandise.', 6],
    ['sekretariat', 'Sekretariat', 'Administrasi organisasi, pendataan anggota, arsip kegiatan, dan surat-menyurat.', 7],
  ];

  for (const [id, name, desc, order] of divisions) {
    await conn.query(`
      INSERT INTO recruitment_divisions (id, name, description, sort_order, is_active)
      VALUES (?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), sort_order=VALUES(sort_order);
    `, [id, name, desc, order]);
  }

  // 3. Update deskripsi peran admin di recruitment_roles
  await conn.query(`
    UPDATE recruitment_roles
    SET description = 'Perekrutan tim pengurus internal: Koordinator Lapangan, IT, Humas, Desain, Esport, Finansial/Keuangan, dan Sekretariat.'
    WHERE id = 'admin';
  `);

  const [rows] = await conn.query('SELECT * FROM recruitment_divisions ORDER BY sort_order ASC');
  console.log('Official Cavallery Divisions stored in MySQL:', rows);

  await conn.end();
}

updateDivisions().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
