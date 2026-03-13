const pool = require('../config/db');

const Room = {
  create: async (id, tournamentId, maxPlayers = 10) => {
    await pool.execute(
      'INSERT INTO rooms (id, tournament_id, max_players) VALUES (?, ?, ?)',
      [id, tournamentId, maxPlayers]
    );
    return id;
  },

  getById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [id]);
    return rows[0];
  },

  updateStatus: async (id, status) => {
    const timestampField = status === 'active' ? 'started_at' : (status === 'finished' ? 'finished_at' : null);
    if (timestampField) {
      await pool.execute(`UPDATE rooms SET status = ?, ${timestampField} = NOW() WHERE id = ?`, [status, id]);
    } else {
      await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
    }
  },

  addParticipant: async (roomId, userId) => {
    await pool.execute(
      'INSERT IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)',
      [roomId, userId]
    );
  },

  getParticipants: async (roomId) => {
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.rating, rp.score, rp.solved, rp.joined_at
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = ?
       ORDER BY rp.score DESC, rp.solved DESC`,
      [roomId]
    );
    return rows;
  },

  updateParticipantScore: async (roomId, userId, scoreDelta, solvedDelta) => {
    await pool.execute(
      'UPDATE room_participants SET score = score + ?, solved = solved + ? WHERE room_id = ? AND user_id = ?',
      [scoreDelta, solvedDelta, roomId, userId]
    );
  }
};

module.exports = Room;
