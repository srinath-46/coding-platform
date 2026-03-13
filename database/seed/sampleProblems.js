/**
 * Seed script – inserts sample problems + test cases into the DB
 * Usage: npm run seed
 */
const pool = require('../../backend/config/db');

const problems = [
  {
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\nReturn the answer in any order.',
    constraints_text: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    sample_input: '4\n2 7 11 15\n9',
    sample_output: '0 1',
    difficulty: 'easy',
    time_limit_ms: 1000,
    points: 100,
    testCases: [
      { input: '4\n2 7 11 15\n9',  expected: '0 1',  is_sample: true },
      { input: '3\n3 2 4\n6',       expected: '1 2',  is_sample: false },
      { input: '2\n3 3\n6',         expected: '0 1',  is_sample: false },
    ],
  },
  {
    title: 'FizzBuzz',
    description:
      'Given an integer n, print numbers from 1 to n.\nFor multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz".',
    constraints_text: '1 <= n <= 100',
    sample_input: '15',
    sample_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
    difficulty: 'easy',
    time_limit_ms: 1000,
    points: 80,
    testCases: [
      { input: '15', expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', is_sample: true },
      { input: '5',  expected: '1\n2\nFizz\n4\nBuzz',                                                       is_sample: false },
    ],
  },
  {
    title: 'Palindrome Check',
    description:
      'Given a string s, determine if it is a palindrome.\nA palindrome reads the same forward and backward.\nOutput "YES" if palindrome, "NO" otherwise.',
    constraints_text: '1 <= s.length <= 10^5\ns consists only of lowercase English letters.',
    sample_input: 'racecar',
    sample_output: 'YES',
    difficulty: 'easy',
    time_limit_ms: 1000,
    points: 80,
    testCases: [
      { input: 'racecar',  expected: 'YES', is_sample: true },
      { input: 'hello',    expected: 'NO',  is_sample: false },
      { input: 'abcba',    expected: 'YES', is_sample: false },
    ],
  },
  {
    title: 'Fibonacci Number',
    description:
      'Given n, compute the nth Fibonacci number.\nF(0)=0, F(1)=1, F(n) = F(n-1) + F(n-2).',
    constraints_text: '0 <= n <= 30',
    sample_input: '10',
    sample_output: '55',
    difficulty: 'medium',
    time_limit_ms: 2000,
    points: 150,
    testCases: [
      { input: '10', expected: '55',      is_sample: true },
      { input: '0',  expected: '0',       is_sample: false },
      { input: '1',  expected: '1',       is_sample: false },
      { input: '20', expected: '6765',    is_sample: false },
    ],
  },
  {
    title: 'Prime Check',
    description:
      'Given an integer n, determine if it is a prime number.\nOutput "PRIME" if it is prime, "NOT PRIME" otherwise.',
    constraints_text: '2 <= n <= 10^9',
    sample_input: '17',
    sample_output: 'PRIME',
    difficulty: 'medium',
    time_limit_ms: 2000,
    points: 150,
    testCases: [
      { input: '17',  expected: 'PRIME',     is_sample: true },
      { input: '4',   expected: 'NOT PRIME', is_sample: false },
      { input: '2',   expected: 'PRIME',     is_sample: false },
      { input: '100', expected: 'NOT PRIME', is_sample: false },
    ],
  },
];

async function seed() {
  console.log('🌱  Seeding sample problems…');
  const conn = await pool.getConnection();
  try {
    for (const p of problems) {
      const [result] = await conn.execute(
        `INSERT IGNORE INTO problems
         (title, description, constraints_text, sample_input, sample_output,
          difficulty, time_limit_ms, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.title, p.description, p.constraints_text,
         p.sample_input, p.sample_output, p.difficulty, p.time_limit_ms, p.points]
      );
      const problemId = result.insertId;
      if (!problemId) { console.log(`⚠️   Skipped (already exists): ${p.title}`); continue; }

      for (const tc of p.testCases) {
        await conn.execute(
          `INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
           VALUES (?, ?, ?, ?)`,
          [problemId, tc.input, tc.expected, tc.is_sample]
        );
      }
      console.log(`✅  Seeded: ${p.title} (${p.testCases.length} test cases)`);
    }
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
