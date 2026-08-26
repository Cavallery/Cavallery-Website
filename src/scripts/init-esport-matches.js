const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function initEsportMatches() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to MySQL.');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS esport_matches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      division_id VARCHAR(50) NOT NULL,
      tournament_name VARCHAR(150) NOT NULL,
      opponent_name VARCHAR(150) NOT NULL,
      opponent_logo VARCHAR(500) NULL,
      match_date DATETIME NOT NULL,
      status ENUM('upcoming', 'live', 'completed') DEFAULT 'upcoming',
      score_cavallery INT DEFAULT 0,
      score_opponent INT DEFAULT 0,
      result ENUM('win', 'lose', 'draw', 'pending') DEFAULT 'pending',
      stream_url VARCHAR(500) NULL,
      notes VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_division (division_id),
      INDEX idx_status (status),
      INDEX idx_date (match_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Table esport_matches initialized successfully.');



  const [rows] = await conn.query('SELECT * FROM esport_matches ORDER BY match_date DESC');
  console.log('Current matches in DB:', rows.length);

  await conn.end();
}

initEsportMatches().catch(e => {
  console.error('Migration error:', e.message);
  process.exit(1);
});
