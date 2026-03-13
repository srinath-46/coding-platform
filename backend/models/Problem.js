const pool = require('../config/db');

const Problem = {
  getById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM problems WHERE id = ?', [id]);
    return rows[0];
  },

  getByTournamentId: async (tournamentId) => {
    const [rows] = await pool.execute('SELECT * FROM problems WHERE tournament_id = ?', [tournamentId]);
    return rows;
  },

  getTestCases: async (problemId, includeSecret = false) => {
    const query = includeSecret 
      ? 'SELECT * FROM test_cases WHERE problem_id = ?'
      : 'SELECT id, problem_id, input, expected_output, is_sample FROM test_cases WHERE problem_id = ? AND is_sample = 1';
    const [rows] = await pool.execute(query, [problemId]);
    return rows;
  },

  create: async (data) => {
    const { tournament_id, title, description, constraints_text, sample_input, sample_output, difficulty, time_limit_ms, memory_limit_kb, points } = data;
    const [result] = await pool.execute(
      `INSERT INTO problems (tournament_id, title, description, constraints_text, sample_input, sample_output, difficulty, time_limit_ms, memory_limit_kb, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tournament_id, title, description, constraints_text, sample_input, sample_output, difficulty, time_limit_ms, memory_limit_kb, points]
    );
    return result.insertId;
  },

  addTestCase: async (problemId, input, expectedOutput, isSample = false) => {
    await pool.execute(
      'INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES (?, ?, ?, ?)',
      [problemId, input, expectedOutput, isSample]
    );
  }
};

module.exports = Problem;
