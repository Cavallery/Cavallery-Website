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

  // Seed sample initial matches so the user immediately sees beautiful UI
  const [existing] = await conn.query('SELECT COUNT(*) AS total FROM esport_matches');
  if (existing[0].total === 0) {
    console.log('Seeding initial match data...');
    await conn.query(`
      INSERT INTO esport_matches 
      (division_id, tournament_name, opponent_name, match_date, status, score_cavallery, score_opponent, result, stream_url, notes)
      VALUES
      ('ml', 'JKT48 Fanbase Cup S2', 'Team Iris Esports', NOW() + INTERVAL 3 DAY, 'upcoming', 0, 0, 'pending', 'https://youtube.com', 'Babak Playoff - Best of 3'),
      ('valorant', 'Community Scrim Cup', 'Freyanation Squad', NOW() + INTERVAL 5 DAY, 'upcoming', 0, 0, 'pending', NULL, 'Friendly Match'),
      ('ml', 'MabaRine Open Season 1', 'Christyzer Esports', NOW() - INTERVAL 2 DAY, 'completed', 2, 1, 'win', 'https://youtube.com', 'Final Match - Cavallery Juara 1'),
      ('pubg', 'Fanbase Battle Royale', 'Olla The Miracle', NOW() - INTERVAL 6 DAY, 'completed', 1, 0, 'win', NULL, 'Matchday 4')
    `);
    console.log('Sample matches seeded.');
  }

  const [rows] = await conn.query('SELECT * FROM esport_matches ORDER BY match_date DESC');
  console.log('Current matches in DB:', rows.length);

  await conn.end();
}

initEsportMatches().catch(e => {
  console.error('Migration error:', e.message);
  process.exit(1);
});
