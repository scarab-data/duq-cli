const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');

/**
 * Check if Amazon Q CLI is installed
 * @returns {boolean} - Whether Amazon Q CLI is installed
 */
function checkQCliInstalled() {
    try {
        execSync('q --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Call Amazon Q CLI with a prompt
 * @param {string} prompt - The prompt to send to Amazon Q
 * @returns {Promise<string>} - The response from Amazon Q
 */
async function callAmazonQ(prompt) {
    // First check if Q CLI is installed
    if (!checkQCliInstalled()) {
        console.error(chalk.red('Error: Amazon Q CLI is not installed.'));
        console.error(chalk.yellow('Please install it by following the instructions at:'));
        console.error(chalk.yellow('https://docs.aws.amazon.com/amazonq/latest/qdevcg/setting-up-q-cli.html'));
        process.exit(1);
    }

    const spinner = ora('Generating response with Amazon Q...').start();

    try {
        // Truncate the prompt to a reasonable length for command line
        const truncatedPrompt = prompt.substring(0, 500).replace(/"/g, '\\"').replace(/\n/g, ' ');

        // Call Amazon Q CLI with the correct syntax and trust all tools
        const output = execSync(`q chat --no-interactive --trust-all-tools "${truncatedPrompt}..."`, {
            encoding: 'utf8',
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large responses
        });

        spinner.succeed('Response generated');

        // Return the raw output
        return output;
    } catch (error) {
        spinner.fail('Failed to generate response');
        console.error(chalk.red('Error calling Amazon Q: ' + error.message));

        // Return a helpful error message
        return `Error: Unable to get a response from Amazon Q.\n\nPlease try:\n1. Running 'q login' to ensure you're authenticated\n2. Running 'q chat' directly to test Amazon Q CLI\n3. Checking your internet connection`;
    }
}

module.exports = {
    callAmazonQ,
    checkQCliInstalled
};
