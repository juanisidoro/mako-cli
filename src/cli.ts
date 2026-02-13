#!/usr/bin/env node

import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';
import { inspectCommand } from './commands/inspect.js';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('mako')
  .description('CLI tool for the MAKO protocol — validate, inspect, and scaffold MAKO files')
  .version('0.1.0');

program
  .command('validate')
  .description('Validate one or more .mako.md files against the spec')
  .argument('<pattern>', 'Glob pattern for .mako.md files (e.g., "content/**/*.mako.md")')
  .option('--strict', 'Fail on warnings too')
  .action(validateCommand);

program
  .command('inspect')
  .description('Display detailed info about a MAKO file')
  .argument('<file>', 'Path to a .mako.md file')
  .option('--json', 'Output as JSON')
  .action(inspectCommand);

program
  .command('init')
  .description('Generate a new .mako.md file interactively or from a template')
  .argument('<file>', 'Output file path (e.g., "content/product.mako.md")')
  .option('-t, --type <type>', 'Content type (product, article, docs, etc.)', 'article')
  .option('--entity <name>', 'Entity name')
  .option('--lang <code>', 'Language code', 'en')
  .action(initCommand);

program.parse();
