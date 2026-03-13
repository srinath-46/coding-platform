const axios = require('axios');
require('dotenv').config();

// Judge0 Language IDs
const LANGUAGE_MAP = {
  'cpp': 54,        // C++ (GCC 9.2.0)
  'java': 62,       // Java (OpenJDK 13.0.1)
  'python': 71,     // Python (3.8.1)
  'javascript': 63  // Node.js (12.14.0)
};

const executeCode = async (sourceCode, language, stdin) => {
  const languageId = LANGUAGE_MAP[language.toLowerCase()];
  
  if (!languageId) {
    throw new Error(`Language ${language} is not supported`);
  }

  const options = {
    method: 'POST',
    url: `${process.env.JUDGE0_API_URL}/submissions`,
    params: { base64_encoded: 'false', wait: 'true' },
    headers: {
      'content-type': 'application/json',
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
      'X-RapidAPI-Host': process.env.JUDGE0_API_HOST
    },
    data: {
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin
    }
  };

  try {
    const response = await axios.request(options);
    const { status, stdout, stderr, compile_output, time, memory } = response.data;
    
    return {
      status: status.description,
      statusId: status.id,
      stdout: stdout,
      stderr: stderr,
      compile_output: compile_output,
      time: parseFloat(time),
      memory: parseInt(memory)
    };
  } catch (error) {
    console.error('Judge0 Error:', error.response ? error.response.data : error.message);
    throw new Error('Code execution failed');
  }
};

module.exports = { executeCode, LANGUAGE_MAP };
