# Implementer — theme-foundation (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — theme-foundation" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-theme-foundation-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-theme-foundation-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-theme-foundation.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.

Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract (app-wide look, mobile-ben)
1. Dependencies (packages/infra/mobile/ben/package.json, via `pnpm --filter @ben/mobile-ben add`): `phosphor-react-native` (react-native-svg 15.12.1 already present) and `@expo-google-fonts/instrument-sans`. Remove `@expo-google-fonts/hanken-grotesk`. Do NOT remove lucide yet (the finalize scope does).
2. app/_layout.tsx (1-30): load InstrumentSans 400/500/600/700 in place of Hanken. Keep JetBrains Mono.
3. tailwind.config.js:
   - fontFamily 19-42: sans/sans-medium/sans-semibold/sans-bold → InstrumentSans_400Regular/_500Medium/_600SemiBold/_700Bold. Keep the comment's intent; lint forbids comments only in TS.
   - colors 50-108: keep the names, set the v2 values (source docs/design/chat-v2/index.html:13-35). background/surface/surface-bright #f6f4f2; surface-container-lowest #ffffff; surface-container-low #f1f0ee; surface-container #ece9e6; surface-container-high #e6e3e0; surface-container-highest/surface-variant/outline-variant #e1dfdd; outline #908b87; on-surface/on-background #1d1814; on-surface-variant #605a54; primary #f9a12f; on-primary #1d1814; primary-container #f3dcbb; on-primary-container #754602; accent-active #1d1814.
   - New tokens: brand-deep #754602, brand-light #f3dcbb, brand-50 #fef0dd, bubble-user #f7e6c3, bubble-ben #f1e2d6, dog-ear #e9d5c1, wave #ab7b48, icon-note #067d51, icon-reminder #724aab, field-border #908b87, ink #1d1814.
   - Leave error/diff/other tokens unless they clash.
4. src/layout/utils/colors.ts: mirror every changed hex. Add exports for the new tokens used by icons (brandDeep, iconNote, iconReminder, wave, ink, surfaceLowest, fieldBorder, brandLight, dogEar). Update the onSurfaceVariantMuted value to a warm neutral (#9a948f).
5. src/layout/components/ui/typography.tsx: keep the variants; make sure no variant hardcodes Hanken.
6. Brand mark: src/layout/components/icons/ben-logo.tsx becomes the v2 folded speech-balloon SVG (index.html:96-102), drawn with react-native-svg. Use `variant: 'brand' | 'avatar'` with a `Record<BenLogoVariant, {body, fold, stroke, bars}>` color map (brand = index.html:144-148, avatar = 150-156) and a `size` prop. src/layout/components/brand-mark.tsx: logo 30 + "Ben" 23/700 in ink (it was text-primary).
7. `primary` is now amber, so ink text/icons must not use it. Fix `text-primary` in src/pages/login/page.tsx, src/layout/components/menu-detail/item-detail-reminder-meta.tsx, src/layout/components/chat-banner/chat-banner-action.tsx, brand-mark.tsx (→ text-on-surface or text-ink), and the `primary` hex import used as an ink icon color (grep `primary` imports from '@/layout/utils/colors'; 6 files): switch to `onSurface` where it is ink on a light surface. Leave capture-card-header.tsx alone (another scope deletes it). Leave `bg-primary` + `text-on-primary` pairs: they become amber with ink, as intended.

Patterns: designs mobile-app-structure.md; coding-patterns frontend/component-variant-maps.md, mobile/mobile-icon-colors.md, frontend/frontend-code-preferences.md, lint.md.
Owned: package.json (mobile-ben), pnpm-lock.yaml, app/_layout.tsx, tailwind.config.js, src/layout/utils/colors.ts, typography.tsx, icons/ben-logo.tsx, brand-mark.tsx, login/page.tsx, item-detail-reminder-meta.tsx, chat-banner-action.tsx, plus the `primary`-hex files you change (lines with the color only).
Parallel: yes, with backend-voice-duration. Every mobile scope waits for you.

## Acceptance
`pnpm --filter @ben/mobile-ben typecheck` clean. `grep -rn Hanken packages/infra/mobile/ben/{app,src,tailwind.config.js}` returns nothing. BenLogo exports both variants.
