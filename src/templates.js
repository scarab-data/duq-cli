/**
 * Collection of prompt templates for different commands
 */

const templates = {
  document: (dirPath, outputPath) => {
    const readmePath = outputPath || `${dirPath}/README.md`;
    return `
Create a README.md for this project directory: ${dirPath}
Include: project name, description, installation, usage, structure, and dependencies.
Format as markdown.
Don't ask any follow-up questions.
Save the README.md file to: ${readmePath}
`;
  },

  explain: (filePath) => `
Explain this code file: ${filePath}
Include what it does, key functions, patterns used, and potential improvements.
Don't ask any follow-up questions.
`,

  refactor: (filePath) => `
Suggest refactoring improvements for: ${filePath}
Don't ask any follow-up questions.
Focus on code quality, performance, best practices, and potential bugs.
Provide specific code examples.
`,

  test: (filePath, outputPath) => {
    const fileExt = require('path').extname(filePath);
    const fileName = require('path').basename(filePath, fileExt);
    const defaultTestPath = require('path').join(require('path').dirname(filePath), `${fileName}.test${fileExt}`);
    const testFilePath = outputPath || defaultTestPath;

    return `
Generate test cases for: ${filePath}
Include unit tests, edge cases, mocks where needed, and follow best practices.
Provide complete test code ready to implement.
Don't ask any follow-up questions.
Save the test file to: ${testFilePath}
`;
  },

  docstrings: (filePath) => {
    const fileExt = require('path').extname(filePath);
    let language;

    switch (fileExt.toLowerCase()) {
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
        language = 'JavaScript/TypeScript';
        break;
      case '.py':
        language = 'Python';
        break;
      case '.java':
        language = 'Java';
        break;
      case '.rb':
        language = 'Ruby';
        break;
      case '.go':
        language = 'Go';
        break;
      case '.php':
        language = 'PHP';
        break;
      case '.c':
      case '.cpp':
      case '.h':
      case '.hpp':
        language = 'C/C++';
        break;
      case '.cs':
        language = 'C#';
        break;
      case '.swift':
        language = 'Swift';
        break;
      case '.rs':
        language = 'Rust';
        break;
      default:
        language = 'Unknown';
    }

    return `
Add appropriate docstrings/comments to this code file: ${filePath}
Don't ask any follow-up questions.
Language: ${language}
Guidelines:
1. Use the standard documentation format for the language (JSDoc for JavaScript, docstrings for Python, etc.)
2. Document parameters, return values, and exceptions/errors
3. Include a brief description of what each function/class/method does
4. Don't modify the actual implementation code
5. Preserve existing documentation if it's already present
6. Return the complete file with added documentation
`;
  },

  security: (targetPath, isDirectory) => {
    return `
Perform a comprehensive security analysis of ${isDirectory ? 'the codebase in directory' : 'the file'}: ${targetPath}
Don't ask any follow-up questions.
Focus on identifying:
1. Potential security vulnerabilities (OWASP Top 10 for web applications)
2. Insecure coding patterns
3. Input validation issues
4. Authentication/authorization flaws
5. Data exposure risks
6. Injection vulnerabilities (SQL, NoSQL, command, etc.)
7. Cross-site scripting (XSS) possibilities
8. Hardcoded secrets or credentials
9. Insecure dependencies or configurations
10. Cryptographic issues

For each finding:
- Describe the vulnerability
- Rate its severity (Critical, High, Medium, Low)
- Explain the potential impact
- Provide a code example showing how to fix it
- Include references to security best practices

Format the output as markdown with clear sections and code blocks.
`;
  }
};

module.exports = templates;
