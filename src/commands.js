const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const templates = require('./templates');
const backupManager = require('./backup-manager');
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
const docstrings = async (filePath) => {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(chalk.red(`Error: File not found: ${filePath}`));
            return;
        }

        // Read the file
        const fileContent = readFile(filePath);

        // Create a backup before modifying
        const backupId = backupManager.createBackup(filePath, 'docstrings');
        if (backupId) {
            console.log(chalk.yellow(`Created backup of original file`));
        }

        // Get the prompt from the template function
        const prompt = templates.docstrings(filePath) + '\n\nFile content:\n' + fileContent;

        // Call Amazon Q
        const response = await callAmazonQ(prompt);

        // Extract the code from the response
        const codePattern = /```(?:\w+)?\s*([\s\S]*?)```/;
        const match = response.match(codePattern);

        if (match && match[1]) {
            const documentedCode = match[1].trim();

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
};

/**
 * Perform security analysis on a file or directory
 * @param {string} targetPath - Path to the file or directory to analyze
 * @param {Object} options - Command options
 */
const security = async (targetPath, options = {}) => {
    try {
        // Ensure we have an absolute path
        const absolutePath = path.resolve(targetPath);

        // Check if path exists
        if (!fs.existsSync(absolutePath)) {
            console.error(chalk.red(`Error: Path not found: ${absolutePath}`));
            return;
        }

        const isDirectory = fs.lstatSync(absolutePath).isDirectory();

        console.log(chalk.blue(`Performing security analysis on ${isDirectory ? 'directory' : 'file'}: ${absolutePath}`));

        let prompt = templates.security(absolutePath, isDirectory);

        if (isDirectory) {
            // For directories, we'll analyze key files
            const contents = getDirectoryContents(absolutePath);
            prompt += '\n\nDirectory contents:\n' + JSON.stringify(contents, null, 2);
        } else {
            // For a single file
            const fileContent = readFile(absolutePath);
            prompt += '\n\nFile content:\n' + fileContent;
        }

        // Call Amazon Q
        const response = await callAmazonQ(prompt);

        // Display the response
        console.log('\n' + response);

        // Save the report if output option is provided
        if (options.output) {
            const outputPath = path.resolve(options.output);

            // Extract the markdown content from the response if it's in a code block
            let reportContent = response;
            const mdPattern = /```(?:markdown)?\s*([\s\S]*?)```/;
            const mdMatch = response.match(mdPattern);
            if (mdMatch && mdMatch[1]) {
                reportContent = mdMatch[1].trim();
            }

            fs.writeFileSync(outputPath, reportContent, 'utf8');
            console.log(chalk.green(`✓ Security report saved to: ${outputPath}`));
        }
    } catch (error) {
        console.error(chalk.red(`Error performing security analysis: ${error.message}`));
    }
};

/**
 * Chain multiple commands together
 * @param {string} targetPath - Path to the file or directory
 * @param {string} steps - Comma-separated list of commands to run
 * @param {Object} options - Command options
 */
const chain = async (targetPath, steps, options = {}) => {
    try {
        // Ensure we have an absolute path
        const absolutePath = path.resolve(targetPath);

        // Check if path exists
        if (!fs.existsSync(absolutePath)) {
            console.error(chalk.red(`Error: Path not found: ${absolutePath}`));
            return;
        }

        // Parse the steps
        const commandSequence = steps.split(',').map(step => step.trim());

        console.log(chalk.blue(`Chaining commands on ${absolutePath}:`));
        console.log(chalk.cyan(`Sequence: ${commandSequence.join(' → ')}`));

        // Track if the target is a file or directory
        const isDirectory = fs.lstatSync(absolutePath).isDirectory();

        // Execute each command in sequence
        for (let i = 0; i < commandSequence.length; i++) {
            const command = commandSequence[i];
            console.log(chalk.yellow(`\n[${i + 1}/${commandSequence.length}] Running command: ${command}`));

            // Check if the command is valid
            if (!['document', 'explain', 'refactor', 'test', 'docstrings', 'security'].includes(command)) {
                console.error(chalk.red(`Error: Unknown command '${command}'`));
                if (options.continueOnError) {
                    console.log(chalk.yellow(`Skipping unknown command and continuing...`));
                    continue;
                } else {
                    console.error(chalk.red(`Chain execution stopped. Use --continue-on-error to ignore failed steps.`));
                    return;
                }
            }

            // Check if the command is compatible with the target type
            if (isDirectory && !['document', 'security'].includes(command)) {
                console.error(chalk.red(`Error: Command '${command}' cannot be used on directories`));
                if (options.continueOnError) {
                    console.log(chalk.yellow(`Skipping incompatible command and continuing...`));
                    continue;
                } else {
                    console.error(chalk.red(`Chain execution stopped. Use --continue-on-error to ignore failed steps.`));
                    return;
                }
            }

            // Execute the command
            try {
                switch (command) {
                    case 'document':
                        if (isDirectory) {
                            await document(absolutePath, options.output);
                        } else {
                            console.error(chalk.red(`Error: 'document' command requires a directory`));
                            if (!options.continueOnError) return;
                        }
                        break;
                    case 'explain':
                        await explain(absolutePath);
                        break;
                    case 'refactor':
                        await refactor(absolutePath);
                        break;
                    case 'test':
                        await test(absolutePath, options.output);
                        break;
                    case 'docstrings':
                        await docstrings(absolutePath);
                        break;
                    case 'security':
                        await security(absolutePath, { output: options.output });
                        break;
                }
                console.log(chalk.green(`✓ Command '${command}' completed successfully`));
            } catch (error) {
                console.error(chalk.red(`Error executing command '${command}': ${error.message}`));
                if (!options.continueOnError) {
                    console.error(chalk.red(`Chain execution stopped. Use --continue-on-error to ignore failed steps.`));
                    return;
                }
            }
        }

        console.log(chalk.green(`\n✓ Chain execution completed`));
    } catch (error) {
        console.error(chalk.red(`Error in chain execution: ${error.message}`));
    }
};

/**
 * Revert a file to its previous state
 * @param {string} filePath - Optional path to the file to revert
 * @param {Object} options - Command options
 */
const revert = async (filePath = null, options = {}) => {
    try {
        // If a specific backup ID is provided
        const backupId = options.id || null;

        // Attempt to restore the backup
        const result = backupManager.restoreBackup(filePath, backupId);

        if (result) {
            console.log(chalk.green(`✓ Successfully reverted ${result.filePath}`));
            console.log(chalk.yellow(`Restored from backup created on ${new Date(result.timestamp).toLocaleString()}`));
            console.log(chalk.yellow(`Original operation: ${result.operation}`));
        } else {
            console.error(chalk.red(`Failed to revert${filePath ? ' ' + filePath : ''}`));
        }
    } catch (error) {
        console.error(chalk.red(`Error reverting file: ${error.message}`));
    }
};

/**
 * List available backups
 * @param {string} filePath - Optional path to list backups for a specific file
 */
const listBackups = async (filePath = null) => {
    try {
        const backups = backupManager.listBackups(filePath);

        if (backups.length === 0) {
            console.log(chalk.yellow(`No backups found${filePath ? ' for ' + filePath : ''}`));
            return;
        }

        console.log(chalk.cyan(`Available backups${filePath ? ' for ' + filePath : ''}:`));

        backups.forEach((backup, index) => {
            const date = new Date(backup.timestamp).toLocaleString();
            if (filePath) {
                console.log(chalk.white(`${index + 1}. [${date}] Operation: ${backup.operation} (ID: ${backup.id})`));
            } else {
                console.log(chalk.white(`${index + 1}. [${date}] File: ${backup.filePath} Operation: ${backup.operation} (ID: ${backup.id})`));
            }
        });
    } catch (error) {
        console.error(chalk.red(`Error listing backups: ${error.message}`));
    }
};

module.exports = {
    document,
    explain,
    refactor,
    test,
    docstrings,
    security,
    chain,
    revert,
    listBackups
};
