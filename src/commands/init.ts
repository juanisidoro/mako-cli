import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import chalk from 'chalk';

interface InitOptions {
  type?: string;
  entity?: string;
  lang?: string;
}

const templates: Record<string, (entity: string, lang: string) => string> = {
  product: (entity, lang) => `---
mako: "1.0"
type: product
entity: "${entity}"
tokens: 0
language: ${lang}
updated: "${new Date().toISOString().split('T')[0]}"

actions:
  - name: add_to_cart
    description: "Add this product to the shopping cart"
    endpoint: /api/cart/add
    method: POST
    params:
      - name: product_id
        type: string
        required: true
        description: "Product identifier"
      - name: quantity
        type: integer
        required: false
        description: "Number of items"

links:
  internal:
    - url: /category/example
      context: "Browse related products"
---

# ${entity}

Short description of the product.

## Key Facts
- Price: 0.00 EUR
- Rating: 0/5
- Availability: In stock
`,

  article: (entity, lang) => `---
mako: "1.0"
type: article
entity: "${entity}"
tokens: 0
language: ${lang}
updated: "${new Date().toISOString().split('T')[0]}"
freshness: weekly

links:
  internal:
    - url: /related-article
      context: "Related reading"
---

# ${entity}

Introduction paragraph.

## Section 1

Content here.

## Section 2

More content.
`,

  docs: (entity, lang) => `---
mako: "1.0"
type: docs
entity: "${entity}"
tokens: 0
language: ${lang}
updated: "${new Date().toISOString().split('T')[0]}"
audience: developers

links:
  api:
    - url: /api/reference
      context: "Full API reference"
---

# ${entity}

Overview of this documentation page.

## Getting Started

Step-by-step instructions.

## API Reference

Key methods and endpoints.
`,
};

const defaultTemplate = (type: string, entity: string, lang: string) => `---
mako: "1.0"
type: ${type}
entity: "${entity}"
tokens: 0
language: ${lang}
updated: "${new Date().toISOString().split('T')[0]}"
---

# ${entity}

Content here.
`;

export async function initCommand(file: string, options: InitOptions) {
  const type = options.type || 'article';
  const entity = options.entity || 'Untitled';
  const lang = options.lang || 'en';

  if (existsSync(file)) {
    console.error(chalk.red(`File already exists: ${file}`));
    process.exit(1);
  }

  const dir = dirname(file);
  if (dir && dir !== '.') {
    mkdirSync(dir, { recursive: true });
  }

  const templateFn = templates[type];
  const content = templateFn
    ? templateFn(entity, lang)
    : defaultTemplate(type, entity, lang);

  writeFileSync(file, content, 'utf-8');

  console.log(`${chalk.green('✓')} Created ${chalk.white(file)}`);
  console.log(`  ${chalk.gray('Type:')} ${type}`);
  console.log(`  ${chalk.gray('Entity:')} ${entity}`);
  console.log(`  ${chalk.gray('Language:')} ${lang}`);
  console.log();
  console.log(chalk.gray(`  Edit the file and run ${chalk.white('mako validate ' + file)} to check it.`));
}
