const pool = require('../config/db');

const Reward = {
  create: async (data) => {
    const { tournament_id, user_id, rank, reward_amount } = data;
    const [result] = await pool.execute(
      'INSERT INTO rewards (tournament_id, user_id, `rank`, reward_amount) VALUES (?, ?, ?, ?)',
      [tournament_id, user_id, rank, reward_amount]
    );
    return result.insertId;
  },

  getByTournamentId: async (tournamentId) => {
    const [rows] = await pool.execute('SELECT * FROM rewards WHERE tournament_id = ?', [tournamentId]);
    return rows;
  },

  updatePaymentStatus: async (id, status) => {
    await pool.execute('UPDATE rewards SET payment_status = ? WHERE id = ?', [status, id]);
  }
};

module.exports = Reward;
