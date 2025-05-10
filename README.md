# duq CLI

A command-line interface tool for interacting with Amazon Q using different prompt templates.

## Features

- Generate README files for project directories
- Get detailed explanations of code files
- Receive refactoring suggestions for your code
- Generate test cases for your code
- Generate documentation for your code
- Run a security analysis on your code
- Command chaining

## Prerequisites

Before using duq CLI, you will need to:

1. Install the Amazon Q CLI
2. Authenticate with your Amazon Builder ID

### Installing Amazon Q CLI

Follow the official instructions at [Amazon Q Developer Guide](https://docs.aws.amazon.com/amazonq/latest/qdevcg/setting-up-q-cli.html).

In short:

```bash
# For npm users
npm install -g @aws/amazon-q-cli

# For macOS users with Homebrew
brew install amazon-q-cli
```

### Authenticating with Amazon Builder ID

After installing the Amazon Q CLI, authenticate with:

```bash
q login
```

This will open a browser window where you can sign in with your Amazon Builder ID.

## Installation

### Global Installation (Recommended)

```bash
npm install -g duq-cli
```

### Local Installation

```bash
npm install duq-cli
```

## Usage

### Generate a README for a Directory

```bash
duq document ./my-project
```

With custom output location:

```bash
duq document ./my-project -o ./custom-location/README.md
```

This will:
1. Analyze all files in the directory
2. Generate a comprehensive README.md
3. Save it to the specified directory or custom location

### Explain a Code File

```bash
duq explain ./my-project/src/index.js
```

This will provide a detailed explanation of what the code does, its key functions, patterns used, and potential improvements.

### Get Refactoring Suggestions

```bash
duq refactor ./my-project/src/complex-function.js
```

This will analyze your code and suggest improvements for code quality, performance, and best practices.

### Generate Tests for a File

```bash
duq test ./my-project/src/utils.js
```

With custom output location:

```bash
duq test ./my-project/src/utils.js -o ./custom-tests/utils.test.js
```

This will generate comprehensive test cases for your code and save them to a test file at the default or specified location.

### Add Docstrings to Code

Automatically add documentation comments to functions and classes:

```bash
duq docstrings ./my-project/src/utils.js
```

This will:
1. Analyze the code file
2. Generate appropriate docstrings for all functions, classes, and methods
3. Insert the docstrings while preserving the existing code
4. Create a backup of the original file

## Security Analysis

Scan your code for security vulnerabilities:

```bash
duq security ./my-project
```

This will:
1. Analyze your code for potential security issues
2. Identify vulnerabilities like injection risks, hardcoded secrets, etc.
3. Provide severity ratings and remediation suggestions
4. Optionally save a detailed report

You can also analyze a single file:

```bash
duq security ./my-project/server.js --output security-report.md
```

## Command Chaining

Run multiple commands in sequence:

```bash
duq chain ./my-project/src/utils.js "refactor,test,docstrings"
```

This will:
1. First refactor the code for better quality
2. Then generate tests for the refactored code
3. Finally add docstrings to all functions

You can use the `--continue-on-error` flag to ensure all steps are attempted even if some fail:

```bash
duq chain ./my-project/src/api.js "refactor,test,docstrings" --continue-on-error
```

Chain commands work with both files and directories (though some commands like `document` only work with directories, and others like `docstrings` only work with files).

## Examples

```bash
# Generate a README for a React project
duq document ./my-react-app

# Generate a README and save it to a specific location
duq document ./my-react-app -o ./docs/README.md

# Explain a complex algorithm
duq explain ./algorithms/quicksort.js

# Get refactoring suggestions for a utility file
duq refactor ./utils/data-processing.js

# Generate tests for an API endpoint
duq test ./api/users.js

# Generate tests and save them to a specific location
duq test ./api/users.js -o ./tests/api/users.test.js
```

## How It Works

duq CLI works by:

1. Reading your code files or directories
2. Formatting the content with specialized prompts
3. Sending the prompts to Amazon Q through the official CLI
4. Processing and displaying the responses
5. Amazon Q saves the output to files at the specified locations

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

```bash
# Re-authenticate with Amazon Q
q login
```

### Command Not Found

If the `duq` command is not found:

```bash
# Check if the package is installed globally
npm list -g duq-cli

# If not, install it globally
npm install -g duq-cli
```

### Amazon Q CLI Not Found

If you get an error about Amazon Q CLI not being installed:

```bash
# Install Amazon Q CLI
npm install -g @aws/amazon-q-cli

# Then authenticate
q login
```

### Verify Amazon Q Installation

To verify that Amazon Q CLI is properly installed:

```bash
# Check the installed version
q --version
```

### Diagnose Amazon Q Issues

If you're experiencing problems with Amazon Q:

```bash
# Run the built-in diagnostics
q doctor
```

This will check your installation, authentication, and connectivity.

## Requirements

- Node.js 14 or higher (for npm installation)
- Amazon Q CLI
- Amazon Builder ID
