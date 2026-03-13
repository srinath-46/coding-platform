const pool = require('../config/db');

const Submission = {
  create: async (data) => {
    const { user_id, problem_id, room_id, language, source_code } = data;
    const [result] = await pool.execute(
      `INSERT INTO submissions (user_id, problem_id, room_id, language, source_code, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, problem_id, room_id, language, source_code]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { status, score, passed_cases, total_cases, execution_time_ms, memory_used_kb, judge0_token } = data;
    await pool.execute(
      `UPDATE submissions 
       SET status = ?, score = ?, passed_cases = ?, total_cases = ?, 
           execution_time_ms = ?, memory_used_kb = ?, judge0_token = ?
       WHERE id = ?`,
      [status, score, passed_cases, total_cases, execution_time_ms, memory_used_kb, judge0_token, id]
    );
  },

  getById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM submissions WHERE id = ?', [id]);
    return rows[0];
  },

  getByUserAndRoom: async (userId, roomId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM submissions WHERE user_id = ? AND room_id = ? ORDER BY submitted_at DESC',
      [userId, roomId]
    );
    return rows;
  },

  getLatestForUserInRoom: async (userId, roomId, problemId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM submissions WHERE user_id = ? AND room_id = ? AND problem_id = ? ORDER BY submitted_at DESC LIMIT 1',
      [userId, roomId, problemId]
    );
    return rows[0];
  }
};

module.exports = Submission;
