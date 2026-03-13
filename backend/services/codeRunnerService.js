const Problem = require('../models/Problem');
const { executeCode } = require('../utils/codeExecutor');
const Submission = require('../models/Submission');

const codeRunnerService = {
  processSubmission: async (submissionId) => {
    const submission = await Submission.getById(submissionId);
    if (!submission) return;

    const testCases = await Problem.getTestCases(submission.problem_id, true);
    if (!testCases || testCases.length === 0) {
      await Submission.update(submissionId, { status: 'internal_error' });
      return;
    }

    let passedCount = 0;
    let totalScore = 0;
    let maxTime = 0;
    let maxMemory = 0;
    let finalStatus = 'accepted';

    for (const testCase of testCases) {
      try {
        const result = await executeCode(submission.source_code, submission.language, testCase.input);
        
        // Normalize output for comparison
        const actual = (result.stdout || '').trim();
        const expected = (testCase.expected_output || '').trim();

        if (result.statusId !== 3) { // 3 is 'Accepted' in Judge0
          finalStatus = result.status.toLowerCase().replace(/ /g, '_');
          break;
        }

        if (actual === expected) {
          passedCount++;
        } else {
          finalStatus = 'wrong_answer';
          break;
        }

        maxTime = Math.max(maxTime, result.time || 0);
        maxMemory = Math.max(maxMemory, result.memory || 0);
      } catch (err) {
        finalStatus = 'internal_error';
        break;
      }
    }

    // Problem points calculation
    const problem = await Problem.getById(submission.problem_id);
    if (finalStatus === 'accepted') {
      totalScore = problem.points;
    } else {
      totalScore = Math.floor((passedCount / testCases.length) * problem.points * 0.1); // Partial credit? Or 0. Let's do 0 for competitive symmetry.
      totalScore = 0; // Standard competitive coding: all or nothing per problem usually.
    }

    const updateData = {
      status: finalStatus,
      score: totalScore,
      passed_cases: passedCount,
      total_cases: testCases.length,
      execution_time_ms: Math.floor(maxTime * 1000),
      memory_used_kb: maxMemory,
      judge0_token: null // Handled synchronously in this basic version
    };

    await Submission.update(submissionId, updateData);
    return { ...updateData, submissionId };
  }
};

module.exports = codeRunnerService;
