import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { initCommand } from '../src/commands/init.js';

const logs: string[] = [];
const errors: string[] = [];
const exitCode: number[] = [];
const createdFiles: string[] = [];

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
  for (const f of createdFiles) {
    if (existsSync(f)) rmSync(f, { recursive: true });
  }
  createdFiles.length = 0;
});

function tmpFile(name: string): string {
  const path = `test/tmp/${name}`;
  createdFiles.push('test/tmp');
  return path;
}

describe('init command', () => {
  it('creates a product template', async () => {
    const file = tmpFile('product.mako.md');
    await initCommand(file, { type: 'product', entity: 'Test Product', lang: 'en' });

    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('type: product');
    expect(content).toContain('entity: "Test Product"');
    expect(content).toContain('language: en');
    expect(content).toContain('# Test Product');
    expect(content).toContain('add_to_cart');
    expect(logs.join('\n')).toContain('✓');
  });

  it('creates an article template', async () => {
    const file = tmpFile('article.mako.md');
    await initCommand(file, { type: 'article', entity: 'My Article', lang: 'es' });

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('type: article');
    expect(content).toContain('entity: "My Article"');
    expect(content).toContain('language: es');
    expect(content).toContain('freshness: weekly');
  });

  it('creates a docs template', async () => {
    const file = tmpFile('docs.mako.md');
    await initCommand(file, { type: 'docs', entity: 'API Guide', lang: 'en' });

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('type: docs');
    expect(content).toContain('audience: developers');
    expect(content).toContain('Getting Started');
  });

  it('uses default template for unknown type', async () => {
    const file = tmpFile('custom.mako.md');
    await initCommand(file, { type: 'landing', entity: 'My Landing', lang: 'en' });

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('type: landing');
    expect(content).toContain('entity: "My Landing"');
    expect(content).toContain('# My Landing');
  });

  it('uses defaults when no options provided', async () => {
    const file = tmpFile('default.mako.md');
    await initCommand(file, {});

    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('type: article');
    expect(content).toContain('entity: "Untitled"');
    expect(content).toContain('language: en');
  });

  it('refuses to overwrite existing file', async () => {
    const file = tmpFile('existing.mako.md');
    // Create the file first
    await initCommand(file, { type: 'article', entity: 'First' });

    // Try to overwrite
    try {
      await initCommand(file, { type: 'product', entity: 'Second' });
    } catch {}

    expect(errors.join('\n')).toContain('already exists');
    expect(exitCode).toContain(1);
    // Original content preserved
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('entity: "First"');
  });

  it('creates nested directories', async () => {
    const file = tmpFile('nested/deep/file.mako.md');
    await initCommand(file, { type: 'article', entity: 'Nested', lang: 'en' });

    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, 'utf-8');
    expect(content).toContain('entity: "Nested"');
  });

  it('includes current date in updated field', async () => {
    const file = tmpFile('dated.mako.md');
    await initCommand(file, { type: 'article', entity: 'Dated' });

    const content = readFileSync(file, 'utf-8');
    const today = new Date().toISOString().split('T')[0];
    expect(content).toContain(`updated: "${today}"`);
  });
});
