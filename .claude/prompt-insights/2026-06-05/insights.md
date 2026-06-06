# Prompt Insights — 2026-06-05

- Total prompts: 1
- correction: 1
- skill: 0
- prompt-reference: 0
- nada: 0

## Slash-command tally

(none)

## Entries

### 1. Enforce alias imports across all projects

- Source: `.claude/prompt-history/2026-06-05/1780668892.md`
- Summary: User asked to make sure alias imports are used across all projects and to take the needed actions for the best/cleanest approach.
- Category: correction
- Generic rule:
  - Wrong way: use relative imports (e.g. `../../`/`./`) for cross-module paths.
  - Correct way: use the configured path alias for imports across all sub-projects; avoid deep relative import chains.
- Suggested destination: `general-coding-practices.md` (add an "always use path-alias imports, not deep relative paths" rule). Optionally reflect in tsconfig/eslint import settings as a project convention.
