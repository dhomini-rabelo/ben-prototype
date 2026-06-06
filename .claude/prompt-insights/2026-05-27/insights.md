# Prompt Insights — 2026-05-27

- Total prompts: 3
- correction: 0
- skill: 1
- prompt-reference: 1
- nada: 1

## Slash-command tally

| Command | Count |
|---|---|
| /task-update-project-context | 1 |

## Entries

### 1779852743.md
- Summary: Add a User entity to the backend following the existing structure of another repo, copying only the auth-relevant fields from a reference project's `user.ts`, plus an in-memory repository.
- Category: skill
- Recommendation: create-new — `code-port-entity-from-reference`. Purpose: port a domain entity (and its in-memory repository) into the current backend by following the local domain structure while sourcing fields/shape from a named reference project. This is a recurring shape ("keep structure of X, bring entity/fields from Y"); should aggregate similar future entity-porting prompts. Could also be served by extending `code-get-coding-designs` + `domain-entity-declaration` pattern, but the cross-project porting workflow is distinct enough to warrant its own skill.
- Suggested destination: new skill `code-port-entity-from-reference` (alternatively note under `domain-entity-declaration` coding pattern).

### 1779853371.md
- Summary: Plan a full Google authentication system for both frontend and backend, grounded in a local doc (`@docs/google-auth.md`) and a reference SaaS project.
- Category: prompt-reference
- Recommendation: Keep as a reusable template `plan-feature-from-doc-and-reference`. Good reference because it cleanly combines a spec doc + a concrete reference implementation + an explicit "plan for frontend and backend" scope — a strong, repeatable structure for planning cross-layer features.
- Suggested destination: prompt-reference (template), e.g. under a prompts/references collection.

### 1779853177.md
- Summary: Pure invocation of `/task-update-project-context` with no extra instruction.
- Category: nada
- Recommendation: none (counted in slash-command tally).
- Suggested destination: n/a
