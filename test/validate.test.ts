import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateCommand } from '../src/commands/validate.js';

const logs: string[] = [];
const exitCode: number[] = [];

beforeEach(() => {
  logs.length = 0;
  exitCode.length = 0;
  vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
    logs.push(args.join(' '));
  });
  vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
    exitCode.push(code ?? 0);
    throw new Error(`process.exit(${code})`);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('validate command', () => {
  it('validates a correct product file', async () => {
    await validateCommand('test/fixtures/valid-product.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('✓');
    expect(output).toContain('valid-product.mako.md');
    expect(exitCode).toHaveLength(0);
  });

  it('validates multiple files with glob pattern', async () => {
    await validateCommand('test/fixtures/valid-*.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('valid-product.mako.md');
    expect(output).toContain('valid-article.mako.md');
    expect(output).toContain('2 valid');
  });

  it('reports errors for file with missing required fields', async () => {
    try {
      await validateCommand('test/fixtures/invalid-missing-fields.mako.md', {});
    } catch {}
    const output = logs.join('\n');
    expect(output).toContain('✗');
    expect(exitCode).toContain(1);
  });

  it('reports parse errors for invalid YAML', async () => {
    try {
      await validateCommand('test/fixtures/invalid-yaml.mako.md', {});
    } catch {}
    const output = logs.join('\n');
    expect(output).toContain('✗');
    expect(exitCode).toContain(1);
  });

  it('exits with code 1 when no files match pattern', async () => {
    try {
      await validateCommand('test/fixtures/nonexistent-*.mako.md', {});
    } catch {}
    const output = logs.join('\n');
    expect(output).toContain('No files matched');
    expect(exitCode).toContain(1);
  });

  it('passes with warnings in non-strict mode', async () => {
    await validateCommand('test/fixtures/warning-high-tokens.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('warning-high-tokens.mako.md');
    expect(exitCode).toHaveLength(0);
  });

  it('fails with warnings in strict mode', async () => {
    try {
      await validateCommand('test/fixtures/warning-high-tokens.mako.md', { strict: true });
    } catch {}
    expect(exitCode).toContain(1);
  });
});
