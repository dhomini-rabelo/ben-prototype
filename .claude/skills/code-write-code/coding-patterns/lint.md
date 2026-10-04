# Lint

ESLint 9 flat config lives in `eslint.config.mjs` at the repository root and covers every workspace. Run the lint script (`{package-manager} lint`) from the root.

## Rules enforced

- No comments: a local `no-comments` rule reports every comment (line, block, JSX) except a shebang. Directives such as `eslint-disable` are comments too, so fix the code instead of silencing the rule.
- No abbreviated names: `id-length` (minimum 2, `_` allowed) plus `id-denylist` for common abbreviations (`e`, `err`, `cb`, `req`, `res`, `ctx`, `idx`, `i`, `tmp`, `val`, `obj`, `arr`, `fn`, `msg`, `cfg` and similar, plus any project-specific shorthand).
- `typescript-eslint` recommended rules (`no-explicit-any`, `no-unused-vars` with a `_` prefix for intentionally unused names, `no-unused-expressions`).
- `react-hooks` recommended rules in React workspaces (`rules-of-hooks`, `exhaustive-deps`, `set-state-in-effect`, `refs`).

Ignored: `node_modules`, `dist`, `build`, `coverage`, test-runner output, generated code, local data folders, `.claude`.

## Naming without abbreviations

```ts
// Wrong way
const ws = await workspaces.find(id)
items.map((e) => e.name)

// Correct way
const workspace = await workspaces.find(id)
items.map((item) => item.name)
```

## Adding an abbreviation to the denylist

Add it to the `abbreviatedNames` list in `eslint.config.mjs`. Keep an abbreviation allowed only when it is a universal term (`db`, `id`, `ids`, `src`, `doc`, `ref`, `args`, `auth`, `info`) by listing it in `allowedAbbreviations`.

## Unused values

```ts
// Wrong way
const { password, ...rest } = user

// Correct way
const { password: _password, ...rest } = user
```

Prefer a typed `Omit` or a mapper when the value is dropped on purpose.
