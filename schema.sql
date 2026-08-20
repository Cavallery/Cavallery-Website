-- ============================================================
-- CAVALLERY WEBSITE & ADMIN DASHBOARD - FULL MYSQL SCHEMA & SEED DATA
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (Hostinger phpMyAdmin)
-- Character Set: utf8mb4 (Full Emoji & Special Character Support)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. TABEL ADMIN & AUTH (admin_users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `name` VARCHAR(150) DEFAULT 'Admin Cavallery',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `role`, `name`) 
VALUES 
(1, 'Vallencia', 'C4TH3R!N4', 'superadmin', 'Vallencia'),
(2, 'admin', 'C4TH3R!N4', 'superadmin', 'Admin Cavallery')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`), `password_hash`=VALUES(`password_hash`);

-- ------------------------------------------------------------
-- 2. TABEL BERITA (news)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `summary` TEXT DEFAULT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `author` VARCHAR(100) DEFAULT 'Cavallery Team',
  `category` VARCHAR(100) DEFAULT 'General',
  `tags` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_news_slug` (`slug`),
  INDEX `idx_news_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. TABEL TIMELINE & PERJALANAN (timeline)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `timeline` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `year` VARCHAR(20) NOT NULL,
  `date_label` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `badge` VARCHAR(100) DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. TABEL GALERI FOTO PUBLIK (gallery)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `date_label` VARCHAR(100) DEFAULT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `tags` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gallery_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. TABEL MEDIA / FILE CLOUD STORAGE (media)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `original_name` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `folder` VARCHAR(150) DEFAULT 'cavallery/images',
  `type` ENUM('image', 'video', 'document') DEFAULT 'image',
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `file_size` BIGINT DEFAULT 0,
  `public_url` VARCHAR(500) NOT NULL,
  `r2_key` VARCHAR(255) DEFAULT NULL,
  `is_published` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_media_folder` (`folder`),
  INDEX `idx_media_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. TABEL SETLISTS (setlists)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `setlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Aktif',
  `release_date` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `song_count` INT DEFAULT 0,
  `songs_json` LONGTEXT DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. TABEL KABESHA (kabesha)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kabesha` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `era` VARCHAR(100) DEFAULT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_current` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. TABEL FUN FACTS (funfacts)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `funfacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fact` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Trivia',
  `icon` VARCHAR(100) DEFAULT 'bx-star',
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. TABEL STATISTIK WEBSITE & ERINE (stats)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `stat_key` VARCHAR(100) NOT NULL UNIQUE,
  `label` VARCHAR(150) NOT NULL,
  `value` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(100) DEFAULT 'bx-bar-chart',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. TABEL YOUTUBE (youtube)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `youtube` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `video_id` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `thumbnail` VARCHAR(500) DEFAULT NULL,
  `published_at` VARCHAR(100) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. TABEL MERCHANDISE (merch)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `merch` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(12,2) DEFAULT NULL,
  `discount_percent` INT DEFAULT 0,
  `description` LONGTEXT DEFAULT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `gallery_json` LONGTEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'Apparel',
  `status` VARCHAR(50) DEFAULT 'Available',
  `shopee_url` VARCHAR(500) DEFAULT NULL,
  `tokopedia_url` VARCHAR(500) DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. TABEL UNDANGAN THE WAYFINDER (wayfinder_invitations)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wayfinder_invitations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fanbase_name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_wf_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED 78 FANBASE INVITATIONS
INSERT INTO `wayfinder_invitations` (`id`, `fanbase_name`, `slug`, `is_active`) VALUES
(1, 'Fenidelity', 'Fenidelity', 1),
(2, 'Gitroops', 'Gitroops', 1),
(3, 'Christyzer', 'Christyzer', 1),
(4, 'Freyanation', 'Freyanation', 1),
(5, 'Helismiley', 'Helismiley', 1),
(6, 'Jessination', 'Jessination', 1),
(7, 'MUFFIN', 'MUFFIN', 1),
(8, 'Olla The Miracle', 'Olla-The-Miracle', 1),
(9, 'Lunarian', 'Lunarian', 1),
(10, 'Onielity', 'Onielity', 1),
(11, 'Symfiony', 'Symfiony', 1),
(12, 'Interindah', 'Interindah', 1),
(13, 'Kath. Inc', 'Kath-Inc', 1),
(14, 'MarshaOshi', 'MarshaOshi', 1),
(15, 'Ellatheria', 'Ellatheria', 1),
(16, 'Liamelior', 'Liamelior', 1),
(17, 'Lynear', 'Lynear', 1),
(18, 'Raishanrise', 'Raishanrise', 1),
(19, 'Alamanda', 'Alamanda', 1),
(20, 'Aninimous', 'Aninimous', 1),
(21, 'Cellineyours', 'Cellineyours', 1),
(22, 'Chelsealand', 'Chelsealand', 1),
(23, 'Cynthiaction', 'Cynthiaction', 1),
(24, 'Daisyne', 'Daisyne', 1),
(25, 'DEGREES', 'DEGREES', 1),
(26, 'Denalize', 'Denalize', 1),
(27, 'Gracieluv', 'Gracieluv', 1),
(28, 'Michiban', 'Michiban', 1),
(29, 'Wargavi48', 'Wargavi48', 1),
(30, 'Nayrakuen', 'Nayrakuen', 1),
(31, 'Aranika', 'Aranika', 1),
(32, 'Hillaryours', 'Hillaryours', 1),
(33, 'Delynessence', 'Delynessence', 1),
(34, 'Olinara', 'Olinara', 1),
(35, 'TACT', 'TACT', 1),
(36, 'Nalania', 'Nalania', 1),
(37, 'RIBCALLS', 'RIBCALLS', 1),
(38, 'Lanautica', 'Lanautica', 1),
(39, 'YokiNachia', 'YokiNachia', 1),
(40, 'Fritzy Force', 'Fritzy-Force', 1),
(41, 'Le Viosa', 'Le-Viosa', 1),
(42, 'Cavallery', 'Cavallery', 1),
(43, 'GROVY', 'GROVY', 1),
(44, 'Jevolante', 'Jevolante', 1),
(45, 'Humainiora', 'Humainiora', 1),
(46, 'Iris', 'Iris', 1),
(47, 'Aprillivels', 'Aprillivels', 1),
(48, 'AuLavana', 'AuLavana', 1),
(49, 'BerbahaGIA.ID', 'BerbahaGIAID', 1),
(50, 'Elineation', 'Elineation', 1),
(51, 'Erland', 'Erland', 1),
(52, 'Fritzycious', 'Fritzycious', 1),
(53, 'Gempitacall', 'Gempitacall', 1),
(54, 'Gita Republic', 'Gita-Republic', 1),
(55, 'Gritzy', 'Gritzy', 1),
(56, 'Karismax', 'Karismax', 1),
(57, 'Kavallerie', 'Kavallerie', 1),
(58, 'Kimberlyers', 'Kimberlyers', 1),
(59, 'Lalafamily', 'Lalafamily', 1),
(60, 'Lianeverse', 'Lianeverse', 1),
(61, 'Marvellous', 'Marvellous', 1),
(62, 'Natsurise', 'Natsurise', 1),
(63, 'Nayralova', 'Nayralova', 1),
(64, 'Nethavengers', 'Nethavengers', 1),
(65, 'Olineation', 'Olineation', 1),
(66, 'Regians', 'Regians', 1),
(67, 'Ribkanism', 'Ribkanism', 1),
(68, 'Shaniation', 'Shaniation', 1),
(69, 'Trishines', 'Trishines', 1),
(70, 'Zeevolution', 'Zeevolution', 1),
(71, 'Adelineation', 'Adelineation', 1),
(72, 'Bebekers', 'Bebekers', 1),
(73, 'Claritastic', 'Claritastic', 1),
(74, 'DazzleRine', 'DazzleRine', 1),
(75, 'ErineNation', 'ErineNation', 1),
(76, 'FeliciArt', 'FeliciArt', 1),
(77, 'GleefulErine', 'GleefulErine', 1),
(78, 'HelionX', 'HelionX', 1)
ON DUPLICATE KEY UPDATE `fanbase_name`=VALUES(`fanbase_name`), `slug`=VALUES(`slug`);

-- ------------------------------------------------------------
-- 13. TABEL DESAIN & TEKS KARTU WAYFINDER (wayfinder_config)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wayfinder_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `wayfinder_config` (`config_key`, `config_value`) VALUES
('bgImage', '/images/wayfinder-bg.png'),
('eventDate', '2026-08-22T15:00:00+07:00'),
('badgeText', 'Seitansai Project 2026'),
('eyebrow', 'Catherina Vallencia'),
('heroName', 'Erine'),
('heroTitle', 'The Wayfinder'),
('invitedLabel', 'Mengundang'),
('dateTitle', 'Sabtu, 22 Agustus 2026'),
('dateSub', 'Pukul 15.00 — 20.30 WIB'),
('locationTitle', 'CGV FX Sudirman — Lantai F7'),
('locationSub', 'Jl. Jend. Sudirman, Pintu Satu Senayan, Jakarta Selatan'),
('mapUrl', 'https://maps.google.com/?q=CGV+FX+Sudirman'),
('dressCodeTitle', 'Dress Code: Birthday T-shirt Erine'),
('dressCodeSub', 'atau pakaian sopan & rapih'),
('footerText', 'Cavallery ©2026')
ON DUPLICATE KEY UPDATE `config_value`=VALUES(`config_value`);

-- ------------------------------------------------------------
-- 14. TABEL JADWAL VC (vcschedule)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vcschedule` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_name` VARCHAR(150) NOT NULL,
  `date_label` VARCHAR(100) NOT NULL,
  `time_label` VARCHAR(100) NOT NULL,
  `quota` VARCHAR(100) DEFAULT 'Tersedia',
  `link_url` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `vcschedule` (`id`, `session_name`, `date_label`, `time_label`, `link_url`, `is_active`) VALUES
(1, 'Sesi 1', 'Rabu, 11 Maret 2026', '16.30 – 17.30 WIB', 'https://cavallery.id/wp-content/uploads/2026/04/VC_Maret.jpg', 1),
(2, 'Sesi 2', 'Rabu, 11 Maret 2026', '17.00 – 18.00 WIB', 'https://cavallery.id/wp-content/uploads/2026/04/VC_Maret.jpg', 1),
(3, 'Sesi 3', 'Rabu, 11 Maret 2026', '19.30 – 20.30 WIB', 'https://cavallery.id/wp-content/uploads/2026/04/VC_Maret.jpg', 1)
ON DUPLICATE KEY UPDATE `session_name`=VALUES(`session_name`);

-- ------------------------------------------------------------
-- 15. TABEL TIKET & KRITIK SARAN (tickets)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date_label` VARCHAR(100) DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `no_anggota` VARCHAR(50) DEFAULT '-',
  `kategori` VARCHAR(150) DEFAULT 'Saran Program',
  `pesan` TEXT NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tickets` (`id`, `date_label`, `name`, `no_anggota`, `kategori`, `pesan`) VALUES
(1, '23/03/2026', 'Than syg erine ', '21', 'Saran Program (Mabar, dll)', 'Next mabaRine main PUBG 😜'),
(2, '23/03/2026', 'Anonymous', '-', 'Lainnya', 'kapan open member minnn'),
(3, '22/04/2026', 'SEAN', '576', 'Saran Program (Mabar, dll)', 'Tolong bikin acara bukberine bareng sama anak ² yatim dan piatu , karena di bulan puasa,kalau kita melakukan hal hal yang bikin orang bahagia makna pahalanya besar dan ,pengen banget bikin mereka senang dengan kedatangan kita semua '),
(4, '30/04/2026', 'Hisyam', '210', 'Saran Program (Mabar, dll)', 'Min mabarine Roblox game nya zoo or oof ,game petak umpet '),
(5, '14/05/2026', 'Anonymous', '-', 'Kritik Fanbase', 'Semoga Cavallery semakin solid dan terus aktif mempromosikan project-project untuk mendukung Erine!')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- ------------------------------------------------------------
-- 16. TABEL PESAN JURNAL #MEMORINE (journal_messages)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `journal_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `msg` TEXT NOT NULL,
  `date_label` VARCHAR(100) DEFAULT NULL,
  `is_approved` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `journal_messages` (`id`, `name`, `msg`, `date_label`) VALUES
(1, 'lalallalalala', 'haloo ci erinee sayangg!! tauu gaa kehidupan aku jadi lebih berwarna saat ada ci erineee, ci erine tu uda aku anggap seperti kaka kandung tauuu ya walaupun ci erine gatau aku hidup huhuhu soalnya belum bisa vc in another day akuu vc ya ci tunggu akuu!!!, bertahan lebih lama di jkt48 ya ci!! aku adalah salah satu orang yang bangga smaa ciciii, HARUS SELALU PERCAYA DIRI YA CII OKAIIII, aku tau banyak yang selalu dukung ciciii, I LOVE U CATHERINA VALLENCIA KETUA BEBEK KUUUU🐣🤍', '09/03/2026'),
(2, 'Dinda duyoung ', 'Hai ci erine semangat terus yaa kegiatannya jaga kesehatannya jugaa apalagi sekarang kamu lagi sibuk\"nya latihan buat shonici setlist baru dan mv baru juga yaa semangat yaa, minum air putih yang cukup sehat\" cerine 🤍🍀. Cinta kamu banget 🫶🏻 jujur kangen 🥹', '12/03/2026'),
(3, 'faiz mahmud', 'hai erine! bagaimana kabarmu? semoga kamu sehat selalu ya. jangan jaga kesehatan, istirahat yang cukup, dan bersemangat dalam menjalani hari yang penuh dengan seribu kejutan. udah deh itu aja o ya sebelum itu aku punya kata-kata untuk erine agar semangat dalam menjalani hari. kata-kata hari ini= jalani hidupmu dengan sungguh-sungguh agar hati mu tetap teguh', '15/03/2026'),
(4, 'vernx ', 'Hai ci Erine semangat terus ya, jaga kesehatan selalu pokoknya apapun kegiatannya tetap semangat. Aku yakin kamu pasti bisa dan mampu untuk melakukannya dengan terbaik. Aku akan terus menemani perjalananmu sampai akhir, ci Erine kamu itu hebat, keren, luar biasa jadi jangan pernah merasa bahwa dirimu itu tidak layak ataupun tidak cocok untuk mendapatkan dukungan dan kebahagiaan yang dirasakan di JKT48. Ci Erine oshi kesayanganku yang tidak pernah tergantikan aku cuma mau bilang, tolong bertahan lebih lama di JKT48 kita sama-sama berjuang bikin chapter yang indah dan raih mimpi-mimpi besarmu. I love Ci Erine 🫶🏻💌', '19/03/2026'),
(5, 'dhafinnn', 'semangat yaa dalam menjalani semuanya, you are stronger than you think. you dont have to carry it all alone, we\'ve got your back. sehat sehat terus yaaaa 🤍', '19/03/2026')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- ------------------------------------------------------------
-- 17. TABEL UCAPAN ULANG TAHUN #ERINETHEWAYFINDER (birthday_messages)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `birthday_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `msg` TEXT NOT NULL,
  `date_label` VARCHAR(100) DEFAULT NULL,
  `is_approved` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 18. TABEL SEBARAN DOMISILI ANGGOTA (anggota_kota)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `anggota_kota` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `province` VARCHAR(150) DEFAULT 'Indonesia',
  `city` VARCHAR(150) NOT NULL UNIQUE,
  `member_count` INT DEFAULT 1,
  `coordinator` VARCHAR(150) DEFAULT NULL,
  `contact` VARCHAR(150) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `anggota_kota` (`city`, `member_count`) VALUES
('Jakarta', 92), ('Bekasi', 64), ('Tangerang', 58), ('Bogor', 52), ('Depok', 28),
('Bandung', 26), ('Surabaya', 24), ('Semarang', 20), ('Yogyakarta', 18), ('Malang', 17),
('Lampung', 12), ('Medan', 11), ('Padang', 9), ('Balikpapan', 8), ('Samarinda', 10),
('Pekalongan', 7), ('Banyumas', 6), ('Kediri', 7), ('Jember', 5), ('Sidoarjo', 7),
('Magelang', 5), ('Kebumen', 5), ('Kudus', 5), ('Palembang', 5), ('Makassar', 5),
('Bengkulu', 6), ('Denpasar', 2), ('Banjar', 2), ('Ponorogo', 3), ('Nganjuk', 2),
('Batam', 2), ('Solo', 3), ('Purwakarta', 2), ('Pontianak', 2), ('Pemalang', 3),
('Pasuruan', 2), ('Tasikmalaya', 2), ('Sragen', 2), ('Binjai', 2), ('Jambi', 2),
('Indramayu', 2), ('Tegal', 3), ('Purworejo', 2), ('Cilegon', 2), ('Sukabumi', 3),
('Blitar', 2), ('Boyolali', 2), ('Karawang', 3), ('Mojokerto', 2), ('Pangkal Pinang', 2),
('Palu', 2), ('Kuningan', 3), ('Manado', 3), ('Probolinggo', 2), ('Tuban', 2),
('Kendari', 2), ('Wonosobo', 2), ('Garut', 2), ('Majalengka', 2)
ON DUPLICATE KEY UPDATE `member_count`=VALUES(`member_count`);

-- ------------------------------------------------------------
-- 19. TABEL PEMBARUAN & LOG UPDATE (updates)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `updates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `platform` VARCHAR(50) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `updates` (`id`, `platform`, `url`, `is_active`) VALUES
(1, 'twitter', 'https://x.com/CErine_JKT48/status/2080953550021308492', 1),
(2, 'tiktok', 'https://www.tiktok.com/@jkt48.erine_/video/7646420621764627719', 1),
(3, 'instagram', 'https://www.tiktok.com/@jkt48.erine_/video/7663816612352396552?q=erine&t=1785000002666', 1),
(4, 'threads', 'https://www.threads.net/@jkt48.erine/post/DXt1wb4EjK2', 1)
ON DUPLICATE KEY UPDATE `url`=VALUES(`url`);

-- ------------------------------------------------------------
-- 20. TABEL PROFIL & BIODATA ERINE (about_erine)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `about_erine` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `content_json` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `about_erine` (`section_key`, `title`, `content_json`) VALUES
('hero_gallery', 'Hero Gallery Photos', '["https://pbs.twimg.com/media/HOEIOQbaYAA44IQ?format=jpg&name=large","https://pbs.twimg.com/media/HMcKFbHboAEdwxl?format=jpg&name=large","https://pbs.twimg.com/media/HJpGaCTaAAAZoVt?format=jpg&name=large"]')
ON DUPLICATE KEY UPDATE `content_json`=VALUES(`content_json`);

SET FOREIGN_KEY_CHECKS = 1;
