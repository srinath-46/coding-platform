-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT         NOT NULL,
  problem_id      INT         NOT NULL,
  room_id         VARCHAR(36),
  language        VARCHAR(30) NOT NULL,
  source_code     LONGTEXT    NOT NULL,
  status          ENUM('pending','accepted','wrong_answer','runtime_error',
                       'time_limit_exceeded','memory_limit_exceeded',
                       'compile_error','internal_error') DEFAULT 'pending',
  score           INT         DEFAULT 0,
  passed_cases    INT         DEFAULT 0,
  total_cases     INT         DEFAULT 0,
  execution_time_ms INT,
  memory_used_kb  INT,
  judge0_token    VARCHAR(100),
  submitted_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id)    REFERENCES rooms(id)    ON DELETE SET NULL,
  INDEX idx_user    (user_id),
  INDEX idx_problem (problem_id),
  INDEX idx_room    (room_id),
  INDEX idx_status  (status)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT         NOT NULL,
  tournament_id   INT         NOT NULL,
  order_id        VARCHAR(100) UNIQUE NOT NULL,
  payment_id      VARCHAR(100),
  signature       VARCHAR(255),
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(10)   DEFAULT 'INR',
  status          ENUM('created','captured','failed') DEFAULT 'created',
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_user_tournament (user_id, tournament_id)
);
