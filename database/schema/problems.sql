-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id   INT,
  title           VARCHAR(150)  NOT NULL,
  description     TEXT          NOT NULL,
  constraints_text TEXT,
  sample_input    TEXT,
  sample_output   TEXT,
  difficulty      ENUM('easy','medium','hard') DEFAULT 'medium',
  time_limit_ms   INT           DEFAULT 2000,
  memory_limit_kb INT           DEFAULT 262144,
  points          INT           DEFAULT 100,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL,
  INDEX idx_tournament (tournament_id),
  INDEX idx_difficulty (difficulty)
);

-- Test cases for each problem
CREATE TABLE IF NOT EXISTS test_cases (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  problem_id      INT  NOT NULL,
  input           TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample       BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  INDEX idx_problem (problem_id)
);
