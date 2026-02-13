import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inspectCommand } from '../src/commands/inspect.js';

const logs: string[] = [];
const errors: string[] = [];
const exitCode: number[] = [];

beforeEach(() => {
  logs.length = 0;
  errors.length = 0;
  exitCode.length = 0;
  vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
    logs.push(args.join(' '));
  });
  vi.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    errors.push(args.join(' '));
  });
  vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
    exitCode.push(code ?? 0);
    throw new Error(`process.exit(${code})`);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('inspect command', () => {
  it('pretty prints a valid product file', async () => {
    await inspectCommand('test/fixtures/valid-product.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('Nike Air Max 90');
    expect(output).toContain('product');
    expect(output).toContain('280');
    expect(output).toContain('en');
    expect(output).toContain('✓');
  });

  it('shows actions in pretty print', async () => {
    await inspectCommand('test/fixtures/valid-product.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('Actions');
    expect(output).toContain('add_to_cart');
    expect(output).toContain('/api/cart/add');
  });

  it('shows links in pretty print', async () => {
    await inspectCommand('test/fixtures/valid-product.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('Links');
    expect(output).toContain('/category/running');
  });

  it('shows body stats', async () => {
    await inspectCommand('test/fixtures/valid-product.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('Body');
    expect(output).toContain('Lines');
    expect(output).toContain('Chars');
    expect(output).toContain('Headings');
  });

  it('outputs valid JSON with --json flag', async () => {
    await inspectCommand('test/fixtures/valid-product.mako.md', { json: true });
    const output = logs.join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.frontmatter.entity).toBe('Nike Air Max 90');
    expect(parsed.frontmatter.type).toBe('product');
    expect(parsed.frontmatter.tokens).toBe(280);
    expect(parsed.validation.valid).toBe(true);
    expect(parsed.bodyLines).toBeGreaterThan(0);
    expect(parsed.bodyLength).toBeGreaterThan(0);
  });

  it('JSON output includes actions and links', async () => {
    await inspectCommand('test/fixtures/valid-product.mako.md', { json: true });
    const parsed = JSON.parse(logs.join('\n'));
    expect(parsed.frontmatter.actions).toHaveLength(1);
    expect(parsed.frontmatter.actions[0].name).toBe('add_to_cart');
    expect(parsed.frontmatter.links.internal).toHaveLength(1);
    expect(parsed.frontmatter.links.external).toHaveLength(1);
  });

  it('exits with code 1 for missing file', async () => {
    try {
      await inspectCommand('test/fixtures/nonexistent.mako.md', {});
    } catch {}
    expect(errors.join('\n')).toContain('File not found');
    expect(exitCode).toContain(1);
  });

  it('shows validation errors for invalid file', async () => {
    await inspectCommand('test/fixtures/invalid-missing-fields.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('✗');
    expect(output).toContain('Invalid');
  });

  it('shows optional fields when present', async () => {
    await inspectCommand('test/fixtures/valid-article.mako.md', {});
    const output = logs.join('\n');
    expect(output).toContain('weekly');
    expect(output).toContain('Tags');
    expect(output).toContain('webassembly');
  });
});
