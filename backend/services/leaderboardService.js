const pool = require('../config/db');

const leaderboardService = {
  getRoomLeaderboard: async (roomId) => {
    const [rows] = await pool.execute(
      `SELECT 
        u.id, 
        u.username, 
        rp.solved, 
        rp.score,
        (SELECT MAX(submitted_at) FROM submissions WHERE user_id = u.id AND room_id = ?) as last_submission
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = ?
       ORDER BY rp.solved DESC, rp.score DESC, last_submission ASC`,
      [roomId, roomId]
    );

    return rows.map((row, index) => ({
      rank: index + 1,
      ...row
    }));
  },

  getGlobalLeaderboard: async (limit = 50) => {
    const parsedLimit = parseInt(limit) || 50;
    const [rows] = await pool.query(
      'SELECT id, username, rating, total_solved FROM users ORDER BY rating DESC, total_solved DESC LIMIT ?',
      [parsedLimit]
    );
    return rows;
  }
};

module.exports = leaderboardService;
