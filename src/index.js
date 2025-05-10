#!/usr/bin/env node

const { program } = require('commander');
const { document, explain, refactor, test } = require('./commands');
const chalk = require('chalk');
const path = require('path');

program
    .name('duq')
    .description('Developer Utility with Q - CLI tool for Amazon Q')
    .version('1.0.1');

program
    .command('document')
    .description('Generate a README for a directory')
    .argument('<directory>', 'Directory to document')
    .option('-o, --output <path>', 'Custom output path for the README.md file')
    .action((directory, options) => {
        document(directory, options.output);
    });

program
    .command('explain')
    .description('Explain what a file does')
    .argument('<file>', 'File to explain')
    .action((file) => {
        explain(file);
    });

program
    .command('refactor')
    .description('Suggest refactoring improvements for a file')
    .argument('<file>', 'File to refactor')
    .action((file) => {
        refactor(file);
    });

program
    .command('test')
    .description('Generate test cases for a file')
    .argument('<file>', 'File to test')
    .option('-o, --output <path>', 'Custom output path for the test file')
    .action((file, options) => {
        test(file, options.output);
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
