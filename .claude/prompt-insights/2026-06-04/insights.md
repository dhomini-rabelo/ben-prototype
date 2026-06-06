# Prompt Insights — 2026-06-04

Total prompts: 56
- nada: 41
- correction: 9
- skill: 4
- prompt-reference: 2

## Slash-command tally
- /task-multiple-plans-auto-approval → 1
- /task-archive-current-task → 1
- /task-add-prompt → 1
- /task-update-project-context → 2
- /utils-write-documentation → 2 (referenced inside prompts, not standalone invocations)

---

## Corrections

### 1780542571 — replace many boolean props with a single state param
- Source: `.claude/prompt-history/2026-06-04/1780542571.md`
- Summary: User asked to pass `state` as one param instead of many boolean props on a card root component.
- Category: correction
- Rule (wrong → right): Avoid passing many discrete boolean props (`isX`, `isY`, `isZ`) to a component; pass a single state/discriminated object instead.
- Suggested destination: coding-patterns `minimum-props-strategies` (already exists) — add the "collapse multiple booleans into one state param" guidance there.

### 1780582637 / 1780582906 / 1780582926 — do not build sub-UI through local `renderX()` functions
- Source: `.claude/prompt-history/2026-06-04/1780582637.md` (+ 1780582906, 1780582926)
- Summary: User questions why components are created via `renderBanner()` function calls and asks to inline the JSX directly.
- Category: correction
- Rule (wrong → right): Do not extract small JSX chunks into local `renderX()` helper functions inside a component; inline the JSX in the body, or promote it to a real component if reused.
- Suggested destination: coding-patterns `react-components` (already exists) or general-coding-practices.md.

### 1780584540 — same as above (renderContent with if-branches)
- Source: `.claude/prompt-history/2026-06-04/1780584540.md`
- Summary: User dislikes `renderContent()` with loading/error/empty/list branches; wants the code directly in the body.
- Category: correction
- Rule: Inline conditional render branches in the JSX body rather than wrapping them in a `renderContent()` function.
- Suggested destination: coding-patterns `react-components` (reinforces the renderX rule above).

### 1780584596 — do not extract trivial one-line handlers
- Source: `.claude/prompt-history/2026-06-04/1780584596.md`
- Summary: User dislikes tiny `handleOpen`/`handleClose` functions that only call a setter; wants inline functions instead.
- Category: correction
- Rule (wrong → right): Do not create named handler functions that only wrap a single setter call; use inline arrow functions at the call site.
- Suggested destination: general-coding-practices.md.

### 1780547069 — prefer useAtom over separate value/setter when both are needed
- Source: `.claude/prompt-history/2026-06-04/1780547069.md`
- Summary: User corrects code to use `useAtom(draftAtom)` instead of separate `useAtomValue` + setter.
- Category: correction
- Rule: When both reading and writing an atom in the same scope, use `useAtom(atom)` instead of pairing `useAtomValue` + a separate setter.
- Suggested destination: coding-patterns (jotai/state) or general-coding-practices.md.

### 1780590979 / 1780593474 — no duplicated exports; avoid index.ts + types.ts split for tiny folders
- Source: `.claude/prompt-history/2026-06-04/1780590979.md` (+ 1780593474)
- Summary: Remove duplicated exports/`useVoiceStore`; and don't create separate `index.ts`/`types.ts` when a store folder only has 2 files — keep it in a single file.
- Category: correction
- Rule (wrong → right): Do not over-split a small store into `index.ts` + `types.ts`; keep it in one file until size justifies splitting. No duplicated exports.
- Suggested destination: design `web-page-stores-structure` (when to split a store into a folder vs single file). Complements existing "no export-only files" memory.

### 1780591682 — share input/recording components via layout, no per-page *-design dupes
- Source: `.claude/prompt-history/2026-06-04/1780591682.md`
- Summary: When two pages share the same stores/hooks, move the shared components to `src/layout/components` instead of duplicating `*-design` variants per page.
- Category: correction
- Rule: Components shared by multiple pages (and backed by shared stores/hooks) belong in `layout/components`, not duplicated per page.
- Suggested destination: design `page-structure` or `web-feature-state-components-structure`.

### 1780592170 / 1780592608 — keep context minimal (only isDisabled), revert manually not via git
- Source: `.claude/prompt-history/2026-06-04/1780592170.md` (+ 1780592608)
- Summary: User wants the context to carry only `isDisabled` as before; later asks to revert manually (not using git) when states diverge.
- Category: correction
- Rule: Keep React context payload minimal — only put a value in context when it is genuinely shared/repeated; revert by editing code, not git, when asked.
- Suggested destination: coding-patterns `react-components` / `minimum-props-strategies`.

### 1780546961 / 1780547011 / 1780547131 — extend hook return + use context for repeated prop
- Source: `.claude/prompt-history/2026-06-04/1780547131.md`
- Summary: Move a prop (`isDisabled`) that is threaded through too many components into context.
- Category: correction
- Rule: When a prop is passed down through many composition children, lift it into the component's context instead of prop-drilling.
- Suggested destination: coding-patterns `component-variant-maps` / `react-components` (composition + context guidance).

---

## Skills

### 1780607005 / 1780607044 / 1780607268 — "generate a report markdown via utils-write-documentation"
- Source: `.claude/prompt-history/2026-06-04/1780607268.md` (+ 1780607005, 1780607044)
- Summary: User repeatedly asked to produce a markdown report at project root using `/utils-write-documentation`, then explicitly asked `/task-add-prompt` to turn this into a skill.
- Category: skill
- Recommendation: create-new `task-create-status-report` — generate a root-level markdown report (features available to test, components/screens done vs pending) by scanning the project design specs and code, via `utils-write-documentation`. Aggregates this SET of 3 prompts. (User already requested this via /task-add-prompt.)

### 1780608481 — keep RELATORIO-*.md in sync when updating project context
- Source: `.claude/prompt-history/2026-06-04/1780608481.md`
- Summary: Update `code-get-project-context` SKILL.md so refreshing project context also refreshes `RELATORIO-FUNCIONALIDADES.md` and `RELATORIO-STATUS-COMPONENTES-E-TELAS.md`.
- Category: skill
- Recommendation: update-existing — already realized in `task-update-project-context` skill (which now updates both reports). No new action needed; noted for traceability.

### 1780544004 / 1780591936 / 1780587809 — page refactor: remove aggregator hook/context, use stores/hooks/actions directly
- Source: `.claude/prompt-history/2026-06-04/1780544004.md` (+ 1780591936, 1780587809)
- Summary: Recurring multi-step refactor: drop the controller/aggregator hook + actions context, consume stores/hooks/actions directly in components, mirror the chat page structure; "create a long step-by-step plan".
- Category: skill
- Recommendation: create-new `task-flatten-page-store-architecture` — a planned refactor workflow that removes per-page aggregator hooks/contexts and wires components directly to shared stores/hooks/actions, aligning page structure across pages.

### 1780585723 / 1780585891 / 1780586337 / 1780584688 / 1780592949 / 1780593014 — "does this store/hook have single responsibility? split it"
- Source: `.claude/prompt-history/2026-06-04/1780592949.md` (+ 1780585723, 1780585891, 1780586337, 1780584688, 1780542168, 1780546109)
- Summary: Highly repetitive pattern — user asks whether a store/hook/component has single responsibility and to split it / apply composition.
- Category: skill
- Recommendation: create-new `task-assess-single-responsibility` — evaluate a store/hook/component against single-responsibility + the project's composition patterns, then propose/apply a split. Aggregates this large SET of prompts.

---

## Prompt references

### 1780587809 — deep page-optimization analysis + long plan
- Source: `.claude/prompt-history/2026-06-04/1780587809.md`
- Summary: Well-structured prompt: "deep analysis of how to optimize `task-workspace/` using project patterns + general React patterns + how we optimized `chat/`, then a long step-by-step plan that doesn't break the app."
- Category: prompt-reference
- Why: Strong reusable template for cross-page refactor planning (reference prior page as the gold standard, constrain to non-breaking).

### 1780606821 — two-agent output formatting redesign
- Source: `.claude/prompt-history/2026-06-04/1780606821.md`
- Summary: Clear instruction to redesign a two-agent flow: state the expected output schema in the first agent's prompt, and have a second agent with a dedicated system prompt format only the first agent's final output (not the whole conversation).
- Category: prompt-reference
- Why: Good template for structured multi-agent / LLM output-formatting design decisions.

---

## Notes
- 1780605837 (Gemini `Function calling with a response mime type: 'application/json' is unsupported`) and 1780606130 (frontend not persisting message / no API response) are one-off debugging prompts → `nada`. Tied to provider-specific (Google Gemini / @ai-sdk) behavior; not reusable as an asset.
- Many prompts are pure clarifying questions ("what does this code do?", "shell naming meaning?", "don't you think the code got cleaner?") or trivial confirmations ("vamos seguir sua sugestão", "padronize", "add it") → `nada`.
