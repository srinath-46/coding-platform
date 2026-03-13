const Problem = require('../models/Problem');

const problemController = {
  createProblem: async (req, res, next) => {
    try {
      const { tournament_id, title, description, constraints_text, sample_input, sample_output, difficulty, time_limit_ms, memory_limit_kb, points, test_cases } = req.body;
      
      const problemId = await Problem.create({
        tournament_id,
        title,
        description,
        constraints_text: constraints_text || null,
        sample_input: sample_input || null,
        sample_output: sample_output || null,
        difficulty: difficulty || 'medium',
        time_limit_ms: time_limit_ms || 2000,
        memory_limit_kb: memory_limit_kb || 262144,
        points: points || 100
      });

      if (test_cases && Array.isArray(test_cases)) {
        for (const tc of test_cases) {
          await Problem.addTestCase(problemId, tc.input, tc.expected_output, tc.is_sample);
        }
      }

      res.status(201).json({ success: true, problemId });
    } catch (err) {
      next(err);
    }
  },

  addTestCase: async (req, res, next) => {
    try {
      const { problem_id, input, expected_output, is_sample } = req.body;
      await Problem.addTestCase(problem_id, input, expected_output, is_sample);
      res.status(201).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = problemController;
