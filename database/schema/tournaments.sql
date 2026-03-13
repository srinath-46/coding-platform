-- Tournaments table
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
  INDEX idx_status (status),
  INDEX idx_start_time (start_time)
);
