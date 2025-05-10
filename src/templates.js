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
Save the README.md file to: ${readmePath}
`;
  },

  explain: (filePath) => `
Explain this code file: ${filePath}
Include what it does, key functions, patterns used, and potential improvements.
`,

  refactor: (filePath) => `
Suggest refactoring improvements for: ${filePath}
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
Save the test file to: ${testFilePath}
`;
  }
};

module.exports = templates;
