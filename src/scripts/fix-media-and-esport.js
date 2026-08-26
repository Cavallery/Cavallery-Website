const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixMediaTable() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to MySQL.');

  // Check columns in media table
  const [columns] = await conn.query('SHOW COLUMNS FROM media');
  console.log('Current media columns:', columns.map(c => c.Field));

  const hasAltText = columns.some(c => c.Field === 'alt_text');
  if (!hasAltText) {
    console.log('Adding alt_text column to media table...');
    await conn.query('ALTER TABLE media ADD COLUMN alt_text VARCHAR(255) NULL AFTER public_url');
    console.log('alt_text column added successfully.');
  }

  // Also seed 6 esport divisions in database if empty or missing
  console.log('Ensuring esport_divisions and esport_rosters tables exist & populated...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS esport_divisions (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      cover_url VARCHAR(500) NOT NULL,
      is_active TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS esport_rosters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      division_id VARCHAR(50) NOT NULL,
      player_name VARCHAR(100) NOT NULL,
      game_id VARCHAR(100) NULL,
      role VARCHAR(100) NULL,
      avatar_url VARCHAR(500) NULL,
      is_captain TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_division (division_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const divisions = [
    ['ml', 'Mobile Legends', 'https://seagm-media.seagmcdn.com/item_480/1045.png', 1, 1],
    ['efootball', 'eFootball', 'https://m.media-amazon.com/images/M/MV5BZjAzYjBiM2YtNTM4Zi00MmIzLWFhNDktZWNiNmY4N2YzYjFiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 0, 2],
    ['coc', 'Clash of Clans', 'https://m.media-amazon.com/images/M/MV5BZTEyNjE0OGEtYmIwNS00NjQ4LTgzNTEtYWVmMzBkMmYxMGI0XkEyXkFqcGc@._V1_.jpg', 0, 3],
    ['pubg', 'PUBG Mobile', 'https://screenscore.digitalmama.id/wp-content/uploads/2024/05/IMG_0880.jpeg', 0, 4],
    ['ff', 'Free Fire', 'https://cdn.wildflamestudio.com/common/web_event/official2.ff.garena.all/20266/f3ff01eefc0b3d7186b553edcd16debf.jpg', 0, 5],
    ['valorant', 'Valorant', 'https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/valo2.png', 0, 6],
  ];

  for (const [id, name, cover, isActive, sortOrder] of divisions) {
    await conn.query(`
      INSERT INTO esport_divisions (id, name, cover_url, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name), cover_url=VALUES(cover_url), sort_order=VALUES(sort_order);
    `, [id, name, cover, isActive, sortOrder]);
  }

  const [esportRows] = await conn.query('SELECT * FROM esport_divisions ORDER BY sort_order ASC');
  console.log('Esport divisions in DB:', esportRows);

  await conn.end();
}

fixMediaTable().catch(e => {
  console.error('Migration error:', e.message);
  process.exit(1);
});
