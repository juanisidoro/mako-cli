# @mako-spec/cli

Command-line tool for the [MAKO protocol](https://github.com/juanisidoro/mako-spec) — validate, inspect, and scaffold `.mako.md` files.

## Install

```bash
npm install -g @mako-spec/cli
```

Or use with npx:

```bash
npx @mako-spec/cli validate "content/**/*.mako.md"
```

## Commands

### `mako validate <pattern>`

Validate one or more MAKO files against the spec.

```bash
mako validate "content/**/*.mako.md"
mako validate product.mako.md --strict
```

### `mako inspect <file>`

Display detailed info about a MAKO file — frontmatter, actions, links, body stats, and validation status.

```bash
mako inspect content/product.mako.md
mako inspect content/product.mako.md --json
```

### `mako init <file>`

Generate a new `.mako.md` file from a template.

```bash
mako init content/product.mako.md --type product --entity "Nike Air Max 90" --lang en
mako init content/article.mako.md --type article --entity "Getting Started with MAKO"
```

## Links

- [MAKO Spec](https://github.com/juanisidoro/mako-spec)
- [@mako-spec/js](https://www.npmjs.com/package/@mako-spec/js)
