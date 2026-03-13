-- =============================================================
-- Coding Battle Platform – Full Database Initialisation Script
-- Run: mysql -u root -p coding_platform < initDatabase.sql
-- =============================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS coding_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coding_platform;

-- ── 1. Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin      BOOLEAN      DEFAULT FALSE,
  rating        INT          DEFAULT 1000,
  total_solved  INT          DEFAULT 0,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email    (email),
  INDEX idx_username (username)
);

-- ── 2. Tournaments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(150) NOT NULL,
  description      TEXT,
  entry_fee        DECIMAL(10,2) DEFAULT 0.00,
  prize_pool       DECIMAL(10,2) DEFAULT 0.00,
  start_time       DATETIME     NOT NULL,
  end_time         DATETIME     NOT NULL,
  max_participants INT          DEFAULT 100,
  status           ENUM('upcoming','active','completed') DEFAULT 'upcoming',
  created_by       INT,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status     (status),
  INDEX idx_start_time (start_time)
);

-- ── 3. Rooms ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id            VARCHAR(36) PRIMARY KEY,
  tournament_id INT         NOT NULL,
  max_players   INT         DEFAULT 10,
  status        ENUM('waiting','active','finished') DEFAULT 'waiting',
  started_at    DATETIME,
  finished_at   DATETIME,
  created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_tournament (tournament_id),
  INDEX idx_status     (status)
);

CREATE TABLE IF NOT EXISTS room_participants (
  room_id   VARCHAR(36) NOT NULL,
  user_id   INT         NOT NULL,
  score     INT         DEFAULT 0,
  solved    INT         DEFAULT 0,
  joined_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- ── 4. Problems ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS problems (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id    INT,
  title            VARCHAR(150)  NOT NULL,
  description      TEXT          NOT NULL,
  constraints_text TEXT,
  sample_input     TEXT,
  sample_output    TEXT,
  difficulty       ENUM('easy','medium','hard') DEFAULT 'medium',
  time_limit_ms    INT           DEFAULT 2000,
  memory_limit_kb  INT           DEFAULT 262144,
  points           INT           DEFAULT 100,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL,
  INDEX idx_tournament (tournament_id),
  INDEX idx_difficulty (difficulty)
);

CREATE TABLE IF NOT EXISTS test_cases (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  problem_id      INT  NOT NULL,
  input           TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample       BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  INDEX idx_problem (problem_id)
);

-- ── 5. Submissions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT         NOT NULL,
  problem_id        INT         NOT NULL,
  room_id           VARCHAR(36),
  language          VARCHAR(30) NOT NULL,
  source_code       LONGTEXT    NOT NULL,
  status            ENUM('pending','accepted','wrong_answer','runtime_error',
                         'time_limit_exceeded','memory_limit_exceeded',
                         'compile_error','internal_error') DEFAULT 'pending',
  score             INT         DEFAULT 0,
  passed_cases      INT         DEFAULT 0,
  total_cases       INT         DEFAULT 0,
  execution_time_ms INT,
  memory_used_kb    INT,
  judge0_token      VARCHAR(100),
  submitted_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id)    REFERENCES rooms(id)    ON DELETE SET NULL,
  INDEX idx_user    (user_id),
  INDEX idx_problem (problem_id),
  INDEX idx_room    (room_id),
  INDEX idx_status  (status)
);

-- ── 6. Payments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL,
  tournament_id INT          NOT NULL,
  order_id      VARCHAR(100) UNIQUE NOT NULL,
  payment_id    VARCHAR(100),
  signature     VARCHAR(255),
  amount        DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(10)   DEFAULT 'INR',
  status        ENUM('created','captured','failed') DEFAULT 'created',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_user_tournament (user_id, tournament_id)
);
