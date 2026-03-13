const pool = require('../config/db');

const User = {
  create: async (username, email, passwordHash) => {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findByUsername: async (username) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT id, username, email, is_admin, rating, total_solved, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  updateRating: async (id, delta) => {
    await pool.execute('UPDATE users SET rating = rating + ?, total_solved = total_solved + 1 WHERE id = ?', [delta, id]);
  },

  promoteToAdmin: async (id) => {
    await pool.execute('UPDATE users SET is_admin = TRUE WHERE id = ?', [id]);
  }
};

module.exports = User;
