const pool = require('../../backend/config/db');

async function assignSampleProblems() {
  console.log('🚀 Assigning sample problems to all tournaments...');
  const conn = await pool.getConnection();
  try {
    // 1. Get all tournaments
    const [tournaments] = await conn.execute('SELECT id, title FROM tournaments');
    
    // Sample Problem Data
    const sampleProblem = {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nReturn the answer in any order.',
      constraints_text: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
      sample_input: '4\n2 7 11 15\n9',
      sample_output: '0 1',
      difficulty: 'easy',
      time_limit_ms: 1000,
      points: 100,
      testCases: [
        { input: '4\n2 7 11 15\n9', expected: '0 1', is_sample: true },
        { input: '3\n3 2 4\n6', expected: '1 2', is_sample: false },
        { input: '2\n3 3\n6', expected: '0 1', is_sample: false }
      ]
    };

    for (const t of tournaments) {
      // 2. Check if tournament already has problems
      const [existing] = await conn.execute('SELECT id FROM problems WHERE tournament_id = ?', [t.id]);
      
      if (existing.length === 0) {
        console.log(`📝 Adding Two Sum to: ${t.title}`);
        
        const [result] = await conn.execute(
          `INSERT INTO problems 
           (title, description, constraints_text, sample_input, sample_output, difficulty, time_limit_ms, points, tournament_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sampleProblem.title, 
            sampleProblem.description, 
            sampleProblem.constraints_text, 
            sampleProblem.sample_input, 
            sampleProblem.sample_output, 
            sampleProblem.difficulty, 
            sampleProblem.time_limit_ms, 
            sampleProblem.points,
            t.id
          ]
        );
        
        const problemId = result.insertId;
        
        for (const tc of sampleProblem.testCases) {
          await conn.execute(
            'INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES (?, ?, ?, ?)',
            [problemId, tc.input, tc.expected, tc.is_sample]
          );
        }
        console.log(`✅ Success for: ${t.title}`);
      } else {
        console.log(`⏭️  Skipping: ${t.title} (already has problems)`);
      }
    }
  } catch (err) {
    console.error('❌ Error assigning problems:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

assignSampleProblems();
