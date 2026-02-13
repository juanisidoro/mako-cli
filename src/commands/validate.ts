import { readFileSync } from 'node:fs';
import { glob } from 'glob';
import chalk from 'chalk';
import { parseMakoFile, validateMakoFile } from '@mako-spec/js';

interface ValidateOptions {
  strict?: boolean;
}

export async function validateCommand(pattern: string, options: ValidateOptions) {
  const files = await glob(pattern, { nodir: true });

  if (files.length === 0) {
    console.log(chalk.yellow(`No files matched pattern: ${pattern}`));
    process.exit(1);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalValid = 0;

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const parsed = parseMakoFile(content);
      const result = validateMakoFile(parsed);

      const warnings = result.warnings || [];
      totalWarnings += warnings.length;

      if (result.valid && warnings.length === 0) {
        totalValid++;
        console.log(`${chalk.green('✓')} ${file}`);
      } else if (result.valid && warnings.length > 0) {
        totalValid++;
        console.log(`${chalk.yellow('⚠')} ${file}`);
        for (const warn of warnings) {
          console.log(`  ${chalk.yellow('→')} ${warn}`);
        }
      } else {
        totalErrors += result.errors.length;
        console.log(`${chalk.red('✗')} ${file}`);
        for (const err of result.errors) {
          console.log(`  ${chalk.red('→')} ${err}`);
        }
        for (const warn of warnings) {
          console.log(`  ${chalk.yellow('→')} ${warn}`);
        }
      }
    } catch (err: any) {
      totalErrors++;
      console.log(`${chalk.red('✗')} ${file}`);
      console.log(`  ${chalk.red('→')} Parse error: ${err.message}`);
    }
  }

  console.log();
  console.log(
    chalk.bold(
      `${files.length} file${files.length > 1 ? 's' : ''}: ` +
      `${chalk.green(`${totalValid} valid`)}` +
      (totalErrors > 0 ? `, ${chalk.red(`${totalErrors} error${totalErrors > 1 ? 's' : ''}`)}` : '') +
      (totalWarnings > 0 ? `, ${chalk.yellow(`${totalWarnings} warning${totalWarnings > 1 ? 's' : ''}`)}` : '')
    )
  );

  if (totalErrors > 0 || (options.strict && totalWarnings > 0)) {
    process.exit(1);
  }
}
