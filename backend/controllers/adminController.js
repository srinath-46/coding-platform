const pool = require('../config/db');

const adminController = {
  getStats: async (req, res, next) => {
    try {
      const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
      const [tournamentCount] = await pool.execute('SELECT COUNT(*) as count FROM tournaments');
      const [submissionCount] = await pool.execute('SELECT COUNT(*) as count FROM submissions');
      const [revenue] = await pool.execute('SELECT SUM(amount) as total FROM payments WHERE status = "captured"');

      res.status(200).json({
        success: true,
        stats: {
          users: userCount[0].count,
          tournaments: tournamentCount[0].count,
          submissions: submissionCount[0].count,
          revenue: revenue[0].total || 0
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = adminController;
