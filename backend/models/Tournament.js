const pool = require('../config/db');

const Tournament = {
  create: async (data) => {
    const { title, description, entry_fee, prize_pool, start_time, end_time, max_participants, created_by } = data;
    const [result] = await pool.execute(
      `INSERT INTO tournaments (title, description, entry_fee, prize_pool, start_time, end_time, max_participants, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, entry_fee, prize_pool, start_time, end_time, max_participants, created_by]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await pool.execute('SELECT * FROM tournaments ORDER BY start_time ASC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM tournaments WHERE id = ?', [id]);
    return rows[0];
  },

  updateStatus: async (id, status) => {
    await pool.execute('UPDATE tournaments SET status = ? WHERE id = ?', [status, id]);
  },

  getProblems: async (tournamentId) => {
    const [rows] = await pool.execute('SELECT * FROM problems WHERE tournament_id = ?', [tournamentId]);
    return rows;
  }
};

module.exports = Tournament;
