const pool = require('../config/db');

const adminController = {
  getStats: async (req, res, next) => {
    try {
      const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
      const [tournamentCount] = await pool.execute('SELECT COUNT(*) as count FROM tournaments');
      const [submissionCount] = await pool.execute('SELECT COUNT(*) as count FROM submissions');
      const [revenue] = await pool.execute('SELECT SUM(amount) as total FROM payments WHERE status = "captured"');
      const [recentUsers] = await pool.execute('SELECT id, username, email, is_admin FROM users ORDER BY created_at DESC LIMIT 5');

      res.status(200).json({
        success: true,
        stats: {
          users: userCount[0].count,
          tournaments: tournamentCount[0].count,
          submissions: submissionCount[0].count,
          revenue: revenue[0].total || 0,
          recentUsers: recentUsers
        }
      });
    } catch (err) {
      next(err);
    }
  },

  getSubmissions: async (req, res, next) => {
    try {
      const [rows] = await pool.execute(`
        SELECT s.id, s.status, s.created_at, u.username, p.title as problem_title 
        FROM submissions s
        JOIN users u ON s.user_id = u.id
        JOIN problems p ON s.problem_id = p.id
        ORDER BY s.created_at DESC LIMIT 50
      `);
      res.status(200).json({ success: true, submissions: rows });
    } catch (err) {
      next(err);
    }
  },

  getUsers: async (req, res, next) => {
    try {
      const [rows] = await pool.execute('SELECT id, username, email, is_admin, created_at FROM users');
      res.status(200).json({ success: true, users: rows });
    } catch (err) {
      next(err);
    }
  },

  updateUserRole: async (req, res, next) => {
    try {
      const { is_admin } = req.body;
      const { userId } = req.params;
      await pool.execute('UPDATE users SET is_admin = ? WHERE id = ?', [is_admin ? 1 : 0, userId]);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = adminController;
