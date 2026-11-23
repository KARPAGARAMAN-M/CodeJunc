/* ============================================================
   CodeJunc — runner.js
   Production Code Execution Client.
   Communicates directly with the CodeJunc Spring Boot backend:
   POST /api/execute -> Judge0 Sandbox Engine.
   Handles:
   - Source code submission
   - Custom stdin (single-line, multiline, numbers, strings)
   - Real-time execution results: stdout, stderr, compile errors,
     runtime errors, timeouts, memory limits.
   ============================================================ */

/**
 * Execute user code through the CodeJunc Spring Boot backend API.
 *
 * @param {Object} options
 * @param {string} options.language - Programming language (c, cpp, java, python, javascript)
 * @param {string} options.code - User source code from Monaco Editor
 * @param {string} [options.stdin] - Custom input from the Input tab
 * @param {Function} [options.onOutput] - Streaming output callback (optional)
 * @returns {Promise<{output: string, error: string, status: string, executionTimeMs?: number, notes?: string[]}>}
 */
export async function runCode({ language, code, stdin = '', onOutput }) {
  // 1. Language validation
  if (!language || typeof language !== 'string') {
    return {
      output: '',
      error: 'Please select a programming language before running.',
      status: 'error',
    };
  }

  // 2. Source code validation
  if (!code || !code.trim()) {
    return {
      output: '',
      error: 'Source code cannot be empty. Please write some code in the editor.',
      status: 'error',
    };
  }

  // 3. Dispatch execution request to Spring Boot backend
  try {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        language: language.trim().toLowerCase(),
        sourceCode: code,
        stdin: stdin != null ? stdin : '',
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      data = null;
    }

    // Handle HTTP error responses from backend
    if (!response.ok) {
      const errMsg =
        data?.compileOutput ||
        data?.stderr ||
        data?.message ||
        `Backend execution failed with HTTP ${response.status} (${response.statusText})`;

      return {
        output: data?.stdout || '',
        error: errMsg,
        status: 'error',
      };
    }

    if (!data) {
      return {
        output: '',
        error: 'Execution service returned an empty response.',
        status: 'error',
      };
    }

    // Calculate execution time in ms if available from Judge0
    let executionTimeMs = null;
    if (data.time != null && !isNaN(parseFloat(data.time))) {
      executionTimeMs = Math.round(parseFloat(data.time) * 1000);
    }

    const statusDesc = data.status || 'Accepted';
    const isAccepted = statusDesc === 'Accepted';

    // 4. Successful execution (Accepted)
    if (isAccepted) {
      if (onOutput && data.stdout) {
        onOutput(data.stdout);
      }

      const notes = [];
      if (data.memory != null) {
        notes.push(`Memory: ${data.memory} KB`);
      }

      return {
        output: data.stdout || '',
        error: data.stderr || '',
        status: 'success',
        executionTimeMs,
        notes,
      };
    }

    // 5. Compilation error
    if (statusDesc === 'Compilation Error' || data.compileOutput) {
      return {
        output: data.stdout || '',
        error: data.compileOutput || data.stderr || data.message || 'Compilation Error',
        status: 'error',
        executionTimeMs,
      };
    }

    // 6. Time limit exceeded
    if (statusDesc.toLowerCase().includes('time limit')) {
      return {
        output: data.stdout || '',
        error: 'Time Limit Exceeded: The program took longer to run than the allowed execution time limit.',
        status: 'error',
        executionTimeMs,
      };
    }

    // 7. Memory limit exceeded
    if (statusDesc.toLowerCase().includes('memory limit')) {
      return {
        output: data.stdout || '',
        error: 'Memory Limit Exceeded: The program exceeded the allowed execution memory limit.',
        status: 'error',
        executionTimeMs,
      };
    }

    // 8. Runtime error or other execution failures
    return {
      output: data.stdout || '',
      error: data.stderr || data.message || statusDesc,
      status: 'error',
      executionTimeMs,
    };
  } catch (netErr) {
    return {
      output: '',
      error: `Execution Service Error: Could not reach backend at /api/execute.\nDetails: ${netErr.message}.\nPlease ensure the Spring Boot backend is started on port 8080.`,
      status: 'error',
    };
  }
}
