const { execSync } = require('child_process');
const chalk = require('chalk');

// Collection of fun developer facts to display while waiting
const funFacts = [
  "Did you know? The first computer bug was an actual bug - a moth found in the Harvard Mark II computer in 1947.",
  "Fun fact: The average programmer writes 10-12 lines of code per day that remain in the final product.",
  "Coding tidbit: JavaScript was created in just 10 days by Brendan Eich in 1995.",
  "AI fact: The term 'Artificial Intelligence' was first coined in 1956 at the Dartmouth Conference.",
  "Developer humor: Why do programmers prefer dark mode? Because light attracts bugs!",
  "Code history: The first programming language was called Fortran, developed in 1957.",
  "Did you know? The first website is still online at info.cern.ch.",
  "Fun fact: There are over 700 programming languages in existence.",
  "Coding wisdom: The best code is no code at all. Every line you write is a line you'll have to maintain.",
  "Developer life: Approximately 70% of coding is debugging.",
  "AI milestone: In 2016, AlphaGo defeated the world champion Go player, a feat previously thought to be decades away.",
  "Git fact: Linus Torvalds created Git in just 10 days in 2005.",
  "Did you know? The term 'bug' to describe a defect predates computers and was used by engineers in the 1800s.",
  "Fun fact: The first computer programmer was Ada Lovelace, who wrote algorithms for Charles Babbage's Analytical Engine in the 1840s.",
  "Coding history: The first high-level programming language was Plankalkül, designed by Konrad Zuse between 1942 and 1945.",
  "AI fact: The Turing Test, proposed in 1950, tests a machine's ability to exhibit intelligent behavior equivalent to a human.",
  "Did you know? The QWERTY keyboard layout was designed in the 1870s to prevent typewriter jams, not for typing efficiency.",
  "Fun fact: The first emoji was created in 1999 by Shigetaka Kurita in Japan.",
  "Developer humor: Why do Java developers wear glasses? Because they don't C#!",
  "Code fact: Python was named after Monty Python, not the snake.",
  "Did you know? The first computer mouse was made of wood in 1964 by Doug Engelbart.",
  "Fun fact: The world's first computer programmer, Ada Lovelace, was Lord Byron's daughter.",
  "AI milestone: ChatGPT reached 100 million users in just 2 months, making it the fastest-growing consumer application in history.",
  "Git humor: It's not a bug - it's an undocumented feature!",
  "Did you know? The first domain name ever registered was symbolics.com on March 15, 1985."
];

// Duck ASCII art
const duckArt = `
     _          _          _          _          _
   >(')____,  >(')____,  >(')____,  >(')____,  >(') ___,
     (\` =~~/    (\` =~~/    (\` =~~/    (\` =~~/    (\` =~~/
  ~^~^\`---'~^~^~^\`---'~^~^~^\`---'~^~^~^\`---'~^~^~^\`---'~^~^
`;

/**
 * Wraps text at specified width, breaking at spaces
 * @param {string} text - The text to wrap
 * @param {number} maxWidth - Maximum width of each line
 * @param {boolean} center - Whether to center the text
 * @returns {string} - The wrapped text
 */
function wrapText(text, maxWidth = 60, center = true) {
  if (text.length <= maxWidth) {
    return center ? centerText(text, maxWidth) : text;
  }
  
  const lines = [];
  let line = '';
  const words = text.split(' ');
  
  for (const word of words) {
    if ((line + word).length <= maxWidth) {
      line += (line ? ' ' : '') + word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  
  if (line) {
    lines.push(line);
  }
  
  if (center) {
    return lines.map(l => centerText(l, maxWidth)).join('\n');
  }
  
  return lines.join('\n');
}

/**
 * Centers text within a specified width
 * @param {string} text - The text to center
 * @param {number} width - The width to center within
 * @returns {string} - The centered text
 */
function centerText(text, width) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

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
 * @returns {string} - The response from Amazon Q
 */
function callAmazonQ(prompt) {
  // First check if Q CLI is installed
  if (!checkQCliInstalled()) {
    console.error(chalk.red('Error: Amazon Q CLI is not installed.'));
    console.error(chalk.yellow('Please install it by following the instructions at:'));
    console.error(chalk.yellow('https://docs.aws.amazon.com/amazonq/latest/qdevcg/setting-up-q-cli.html'));
    process.exit(1);
  }

  // Display a random fact and the duck art with a random color
  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
  const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  console.clear();
  console.log(chalk.cyan('╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║                      DUQ CLI ASSISTANT                    ║'));
  console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════╝'));
  
  console.log(chalk[randomColor](duckArt));
  console.log(`\n${chalk.white(wrapText(randomFact, 60, true))}\n`);
  
  console.log(chalk.cyan('╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║                        Please wait...                     ║'));
  console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════╝'));
  
  try {
    // Truncate the prompt to a reasonable length for command line
    const truncatedPrompt = prompt.substring(0, 500).replace(/"/g, '\\"').replace(/\n/g, ' ');
    
    // Call Amazon Q CLI with the correct syntax and trust all tools
    const output = execSync(`q chat --no-interactive --trust-all-tools "${truncatedPrompt}..."`, { 
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large responses
    });
    
    console.clear(); // Clear the console
    console.log(chalk.green('✓ Response generated successfully! Amazon Q Output:'));
    
    // Return the raw output
    return output;
  } catch (error) {
    console.clear(); // Clear the console
    console.log(chalk.red('✗ Failed to generate response'));
    console.error(chalk.red('Error calling Amazon Q: ' + error.message));
    
    // Return a helpful error message
    return `Error: Unable to get a response from Amazon Q.\n\nPlease try:\n1. Running 'q login' to ensure you're authenticated\n2. Running 'q chat' directly to test Amazon Q CLI\n3. Running 'q doctor' to diagnose issues\n4. Checking your internet connection`;
  }
}

module.exports = {
  callAmazonQ,
  checkQCliInstalled
};
