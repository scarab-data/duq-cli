#!/usr/bin/env node

/**
 * Main entry point for the duq CLI tool.
 * This file sets up the command-line interface using Commander.js and
 * registers all available commands with their respective handlers.
 * 
 * @module index
 */

const { program } = require('commander');
const { document, explain, refactor, test, docstrings } = require('./commands');
const chalk = require('chalk');
const path = require('path');

/**
 * Initialize the main CLI program with name, description, and version
 */
program
    .name('duq')
    .description('Developer Utility with Q - CLI tool for Amazon Q')
    .version('1.0.1');

/**
 * Command: document
 * Generates a README file for a specified directory
 * 
 * @param {string} directory - The directory to analyze and document
 * @param {Object} options - Command options
 * @param {string} [options.output] - Custom output path for the README.md file
 */
program
    .command('document')
    .description('Generate a README for a directory')
    .argument('<directory>', 'Directory to document')
    .option('-o, --output <path>', 'Custom output path for the README.md file')
    .action((directory, options) => {
        document(directory, options.output);
    });

/**
 * Command: explain
 * Provides a detailed explanation of what a file does
 * 
 * @param {string} file - The file to explain
 */
program
    .command('explain')
    .description('Explain what a file does')
    .argument('<file>', 'File to explain')
    .action((file) => {
        explain(file);
    });

/**
 * Command: refactor
 * Analyzes a file and suggests refactoring improvements
 * 
 * @param {string} file - The file to analyze for refactoring suggestions
 */
program
    .command('refactor')
    .description('Suggest refactoring improvements for a file')
    .argument('<file>', 'File to refactor')
    .action((file) => {
        refactor(file);
    });

/**
 * Command: test
 * Generates test cases for a specified file
 * 
 * @param {string} file - The file to generate tests for
 * @param {Object} options - Command options
 * @param {string} [options.output] - Custom output path for the test file
 */
program
    .command('test')
    .description('Generate test cases for a file')
    .argument('<file>', 'File to test')
    .option('-o, --output <path>', 'Custom output path for the test file')
    .action((file, options) => {
        test(file, options.output);
    });

/**
 * Command: docstrings
 * Adds documentation comments to functions and classes in a file
 * 
 * @param {string} file - The file to add docstrings to
 */
program
    .command('docstrings')
    .description('Add docstrings to functions and classes in a file')
    .argument('<file>', 'File to add docstrings to')
    .action((file) => {
        docstrings(file);
    });

// Parse command line arguments
program.parse(process.argv);

/**
 * Display help information if no arguments are provided
 */
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
