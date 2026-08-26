const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupMedia() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS media (
      id VARCHAR(100) PRIMARY KEY,
      original_name VARCHAR(255) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      folder VARCHAR(150) DEFAULT 'cavallery/images',
      type ENUM('image', 'video', 'document') DEFAULT 'image',
      mime_type VARCHAR(100) DEFAULT NULL,
      file_size BIGINT DEFAULT 0,
      public_url VARCHAR(500) NOT NULL,
      r2_key VARCHAR(255) DEFAULT NULL,
      alt_text VARCHAR(255) DEFAULT NULL,
      is_published TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_media_folder (folder),
      INDEX idx_media_type (type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const [rows] = await conn.query('SELECT COUNT(*) AS total FROM media');
  console.log('Media table ready in MySQL, total rows:', rows[0].total);

  await conn.end();
}

setupMedia().catch(e => {
  console.error('Setup media error:', e.message);
  process.exit(1);
});
