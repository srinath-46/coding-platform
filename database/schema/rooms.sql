-- Rooms table (one tournament can have multiple rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id             VARCHAR(36) PRIMARY KEY,   -- UUID v4
  tournament_id  INT          NOT NULL,
  max_players    INT          DEFAULT 10,
  status         ENUM('waiting','active','finished') DEFAULT 'waiting',
  started_at     DATETIME,
  finished_at    DATETIME,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_tournament (tournament_id),
  INDEX idx_status (status)
);

-- Room participants (many-to-many: rooms ↔ users)
CREATE TABLE IF NOT EXISTS room_participants (
  room_id    VARCHAR(36) NOT NULL,
  user_id    INT         NOT NULL,
  score      INT         DEFAULT 0,
  solved     INT         DEFAULT 0,
  joined_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
