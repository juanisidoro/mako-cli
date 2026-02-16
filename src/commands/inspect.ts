import { readFileSync } from 'node:fs';
import chalk from 'chalk';
import { parseMakoFile, validateMakoFile } from '@mako-spec/js';

interface InspectOptions {
  json?: boolean;
}

export async function inspectCommand(file: string, options: InspectOptions) {
  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    console.error(chalk.red(`File not found: ${file}`));
    process.exit(1);
  }

  try {
    const parsed = parseMakoFile(content);
    const validation = validateMakoFile(parsed);

    if (options.json) {
      console.log(JSON.stringify({
        file,
        frontmatter: parsed.frontmatter,
        bodyLength: parsed.body.length,
        bodyLines: parsed.body.split('\n').length,
        validation: {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      }, null, 2));
      return;
    }

    // Pretty print
    const fm = parsed.frontmatter as Record<string, any>;
    console.log();
    console.log(chalk.bold.white(`  ${file}`));
    console.log(chalk.dim('  ─'.repeat(30)));
    console.log();

    console.log(`  ${chalk.gray('Version')}      ${chalk.white(fm.mako)}`);
    console.log(`  ${chalk.gray('Type')}         ${chalk.cyan(fm.type)}`);
    console.log(`  ${chalk.gray('Entity')}       ${chalk.white(fm.entity)}`);
    console.log(`  ${chalk.gray('Language')}     ${chalk.white(fm.language)}`);
    console.log(`  ${chalk.gray('Tokens')}       ${chalk.yellow(String(fm.tokens))}`);
    console.log(`  ${chalk.gray('Updated')}      ${chalk.white(fm.updated)}`);

    if (fm.summary) {
      console.log(`  ${chalk.gray('Summary')}      ${chalk.white(fm.summary)}`);
    }
    if (fm.freshness) {
      console.log(`  ${chalk.gray('Freshness')}    ${chalk.white(fm.freshness)}`);
    }
    if (fm.audience) {
      console.log(`  ${chalk.gray('Audience')}     ${chalk.white(fm.audience)}`);
    }
    if (fm.tags && fm.tags.length > 0) {
      console.log(`  ${chalk.gray('Tags')}         ${chalk.white(fm.tags.join(', '))}`);
    }
    if (fm.canonical) {
      console.log(`  ${chalk.gray('Canonical')}    ${chalk.blue(fm.canonical)}`);
    }
    if (fm['embedding-model']) {
      console.log(`  ${chalk.gray('Emb. Model')}   ${chalk.white(fm['embedding-model'])}`);
    }

    // Media
    if (fm.media) {
      console.log();
      console.log(`  ${chalk.bold.white('Media')}`);
      if (fm.media.cover) {
        console.log(`    ${chalk.gray('Cover')}      ${chalk.blue(fm.media.cover.url)}`);
        if (fm.media.cover.alt) {
          console.log(`    ${chalk.gray('Alt')}        ${chalk.white(fm.media.cover.alt)}`);
        }
      }
      const counts = ['images', 'video', 'audio', 'interactive', 'downloads'] as const;
      for (const key of counts) {
        const val = (fm.media as Record<string, unknown>)[key];
        if (val) {
          console.log(`    ${chalk.gray(key.charAt(0).toUpperCase() + key.slice(1))}${' '.repeat(Math.max(1, 11 - key.length))}${chalk.yellow(String(val))}`);
        }
      }
    }

    // Related
    if (fm.related && fm.related.length > 0) {
      console.log();
      console.log(`  ${chalk.bold.white('Related')} (${fm.related.length})`);
      for (const path of fm.related) {
        console.log(`    ${chalk.blue(path)}`);
      }
    }

    // Actions
    if (fm.actions && fm.actions.length > 0) {
      console.log();
      console.log(`  ${chalk.bold.white('Actions')} (${fm.actions.length})`);
      for (const action of fm.actions) {
        console.log(`    ${chalk.green('→')} ${chalk.white(action.name)} — ${chalk.gray(action.endpoint)} [${chalk.gray(action.method || 'POST')}]`);
        if (action.params && action.params.length > 0) {
          for (const param of action.params) {
            const req = param.required ? chalk.red('*') : '';
            console.log(`      ${chalk.gray(param.name)}${req}: ${chalk.gray(param.type)}`);
          }
        }
      }
    }

    // Links
    if (fm.links) {
      const linkTypes = ['internal', 'external'] as const;
      const totalLinks = linkTypes.reduce((sum, type) => sum + (fm.links?.[type]?.length || 0), 0);
      if (totalLinks > 0) {
        console.log();
        console.log(`  ${chalk.bold.white('Links')} (${totalLinks})`);
        for (const type of linkTypes) {
          const links = fm.links[type];
          if (links && links.length > 0) {
            console.log(`    ${chalk.gray(type)}:`);
            for (const link of links) {
              const typeTag = link.type ? ` ${chalk.dim(`[${link.type}]`)}` : '';
              console.log(`      ${chalk.blue(link.url)} — ${chalk.gray(link.context)}${typeTag}`);
            }
          }
        }
      }
    }

    // Body stats
    const bodyLines = parsed.body.split('\n');
    const headings = bodyLines.filter(l => l.startsWith('#'));
    console.log();
    console.log(`  ${chalk.bold.white('Body')}`);
    console.log(`    ${chalk.gray('Lines')}      ${bodyLines.length}`);
    console.log(`    ${chalk.gray('Chars')}      ${parsed.body.length}`);
    console.log(`    ${chalk.gray('Headings')}   ${headings.length}`);

    // Validation
    console.log();
    if (validation.valid) {
      console.log(`  ${chalk.green('✓')} Valid`);
      if (validation.warnings.length > 0) {
        for (const warn of validation.warnings) {
          console.log(`    ${chalk.yellow('→')} ${warn}`);
        }
      }
    } else {
      console.log(`  ${chalk.red('✗')} Invalid`);
      for (const err of validation.errors) {
        console.log(`    ${chalk.red('→')} ${err}`);
      }
    }
    console.log();
  } catch (err: any) {
    console.error(chalk.red(`Parse error: ${err.message}`));
    process.exit(1);
  }
}
