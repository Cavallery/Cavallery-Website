const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function initRecruitment() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to MySQL database.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS recruitment_roles (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      is_open TINYINT(1) NOT NULL DEFAULT 0,
      requirements TEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    INSERT INTO recruitment_roles (id, title, description, is_open) VALUES
    ('member', 'Join Member', 'Keanggotaan resmi Cavallery untuk berpartisipasi aktif dalam kegiatan harian, gathering, dan dukungan bersama Erine.', 0),
    ('admin', 'Join Admin', 'Perekrutan tim pengurus internal (Data Archiver, Sosmed, Video Editor, Desain Grafis, E-Sport, & Merch).', 0),
    ('volunteer', 'Join Volunteer', 'Bergabung sebagai relawan pelaksana untuk event kebersamaan, perayaan ulang tahun, dan proyek dukungan Erine.', 0)
    ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS recruitment_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_id VARCHAR(50) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      nickname VARCHAR(100) NULL,
      city VARCHAR(100) NOT NULL,
      whatsapp VARCHAR(50) NOT NULL,
      social_media VARCHAR(150) NULL,
      division VARCHAR(100) NULL,
      reason TEXT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_role (role_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [roles] = await conn.query('SELECT * FROM recruitment_roles');
  console.log('Cavallery recruitment tables initialized! Roles:', roles);

  await conn.end();
}

initRecruitment().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
