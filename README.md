# Duq CLI

A command-line interface tool for interacting with Amazon Q using different prompt templates.

## Features

- Generate README files for project directories
- Get detailed explanations of code files
- Receive refactoring suggestions for your code
- Generate test cases for your code

## Prerequisites

Before using Duq CLI, you need to:

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

### Standalone Executables

Download the appropriate executable for your platform from the [releases page](https://github.com/yourusername/duq-cli/releases).

## Usage

### Generate a README for a Directory

```bash
duq document ./my-project
```

This will:
1. Analyze all files in the directory
2. Generate a comprehensive README.md
3. Save it to the specified directory

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

This will generate comprehensive test cases for your code and save them to a test file.

## Examples

```bash
# Generate a README for a React project
duq document ./my-react-app

# Explain a complex algorithm
duq explain ./algorithms/quicksort.js

# Get refactoring suggestions for a utility file
duq refactor ./utils/data-processing.js

# Generate tests for an API endpoint
duq test ./api/users.js
```

## How It Works

Duq CLI works by:

1. Reading your code files or directories
2. Formatting the content with specialized prompts
3. Sending the prompts to Amazon Q through the official CLI
4. Processing and displaying the responses
5. Saving the output to files when appropriate

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

## Requirements

- Node.js 14 or higher (for npm installation)
- Amazon Q CLI
- Amazon Builder ID

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

## Creating the LICENSE file

```text:LICENSE
MIT License

Copyright (c) 2023 [Your Name or Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Final Project Structure

Your complete project structure should now look like this:

```
duq-cli/
├── LICENSE
├── README.md
├── package.json
└── src/
    ├── amazon-q.js
    ├── commands.js
    ├── index.js
    └── templates.js
```

## Publishing to npm

To publish your package to npm:

```bash
# Make the script executable
chmod +x src/index.js

# Login to npm (if you haven't already)
npm login

# Publish to npm
npm publish
```

## Building Standalone Executables

To build standalone executables:

```bash
# Install pkg globally
npm install -g pkg

# Build the executables
npm run build
