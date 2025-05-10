const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const templates = require('./templates');
const { callAmazonQ } = require('./amazon-q');

/**
 * Read file contents
 * @param {string} filePath - Path to the file
 * @returns {string} - File contents
 */
const readFile = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(chalk.red('Error reading file ' + filePath + ': ' + error.message));
        process.exit(1);
    }
};

/**
 * Get directory contents
 * @param {string} dirPath - Path to the directory
 * @returns {Object} - Object with file paths as keys and contents as values
 */
const getDirectoryContents = (dirPath) => {
    try {
        // Ensure we have an absolute path
        const absoluteDirPath = path.resolve(dirPath);
        const files = glob.sync(`${absoluteDirPath}/**/*`, { nodir: true });
        const result = {};

        for (const file of files) {
            // Skip large files, binaries, etc.
            const stats = fs.statSync(file);
            if (stats.size > 100000 || path.basename(file).startsWith('.')) {
                result[file] = `[File too large or hidden: ${stats.size} bytes]`;
                continue;
            }

            try {
                result[file] = fs.readFileSync(file, 'utf8');
            } catch (error) {
                result[file] = `[Error reading file: ${error.message}]`;
            }
        }

        return result;
    } catch (error) {
        console.error(chalk.red('Error reading directory ' + dirPath + ': ' + error.message));
        process.exit(1);
    }
};

/**
 * Generate a README for a directory
 * @param {string} dirPath - Path to the directory
 * @param {string} outputPath - Optional custom output path for README.md
 */
const document = async (dirPath, outputPath) => {
    // Ensure we have absolute paths
    const absoluteDirPath = path.resolve(dirPath);
    const absoluteOutputPath = outputPath ? path.resolve(outputPath) : null;

    console.log(chalk.blue('Generating README for directory: ' + absoluteDirPath));
    if (absoluteOutputPath) {
        console.log(chalk.blue('Output will be saved to: ' + absoluteOutputPath));
    }

    const contents = getDirectoryContents(absoluteDirPath);
    const prompt = templates.document(absoluteDirPath, absoluteOutputPath) + '\n\nDirectory contents:\n' +
        JSON.stringify(contents, null, 2);

    const response = await callAmazonQ(prompt);

    // Display the raw response in the console
    console.log('\n' + response);

    // No need to save the file ourselves - Amazon Q does it for us
    console.log(chalk.green('\nAmazon Q has processed your request.'));
    console.log(chalk.yellow('If a README.md file was generated, it should be available at the specified location.'));
};

/**
 * Explain what a file does
 * @param {string} filePath - Path to the file
 */
const explain = async (filePath) => {
    // Ensure we have an absolute path
    const absoluteFilePath = path.resolve(filePath);
    console.log(chalk.blue('Explaining file: ' + absoluteFilePath));

    const fileContent = readFile(absoluteFilePath);
    const prompt = templates.explain(absoluteFilePath) + '\n\nFile content:\n' + fileContent;

    const response = await callAmazonQ(prompt);

    // Display the raw response in the console
    console.log('\n' + response);
};

/**
 * Suggest refactoring improvements for a file
 * @param {string} filePath - Path to the file
 */
const refactor = async (filePath) => {
    // Ensure we have an absolute path
    const absoluteFilePath = path.resolve(filePath);
    console.log(chalk.blue('Suggesting refactoring for file: ' + absoluteFilePath));

    const fileContent = readFile(absoluteFilePath);
    const prompt = templates.refactor(absoluteFilePath) + '\n\nFile content:\n' + fileContent;

    const response = await callAmazonQ(prompt);

    // Display the raw response in the console
    console.log('\n' + response);
};

/**
 * Generate test cases for a file
 * @param {string} filePath - Path to the file
 * @param {string} outputPath - Optional custom output path for test file
 */
const test = async (filePath, outputPath) => {
    // Ensure we have absolute paths
    const absoluteFilePath = path.resolve(filePath);
    const absoluteOutputPath = outputPath ? path.resolve(outputPath) : null;

    console.log(chalk.blue('Generating tests for file: ' + absoluteFilePath));
    if (absoluteOutputPath) {
        console.log(chalk.blue('Output will be saved to: ' + absoluteOutputPath));
    }

    const fileContent = readFile(absoluteFilePath);
    const prompt = templates.test(absoluteFilePath, absoluteOutputPath) + '\n\nFile content:\n' + fileContent;

    const response = await callAmazonQ(prompt);

    // Display the raw response in the console
    console.log('\n' + response);

    // No need to save the file ourselves - Amazon Q does it for us
    console.log(chalk.green('\nAmazon Q has processed your request.'));
    console.log(chalk.yellow('If a test file was generated, it should be available at the specified location.'));
};

/**
 * Adds docstrings to a code file
 * @param {string} filePath - Path to the file to document
 */
async function docstrings(filePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(chalk.red(`Error: File not found: ${filePath}`));
            return;
        }

        // Read the file
        const fileContent = readFile(filePath);

        // Get the prompt from the template function
        const prompt = templates.docstrings(filePath) + '\n\nFile content:\n' + fileContent;

        // Call Amazon Q
        const response = await callAmazonQ(prompt);

        // Extract the code from the response
        const codePattern = /```(?:\w+)?\s*([\s\S]*?)```/;
        const match = response.match(codePattern);

        if (match && match[1]) {
            const documentedCode = match[1].trim();

            // Create a backup of the original file
            const backupPath = `${filePath}.backup`;
            fs.copyFileSync(filePath, backupPath);
            console.log(chalk.yellow(`Original file backed up to: ${backupPath}`));

            // Write the documented code to the file
            fs.writeFileSync(filePath, documentedCode, 'utf8');
            console.log(chalk.green(`✓ Added docstrings to: ${filePath}`));
        } else {
            console.error(chalk.red('Error: Could not extract documented code from the response.'));
            console.log('Raw response:');
            console.log(response);
        }
    } catch (error) {
        console.error(chalk.red(`Error adding docstrings: ${error.message}`));
    }
}

module.exports = {
    document,
    explain,
    refactor,
    test,
    docstrings,
};
