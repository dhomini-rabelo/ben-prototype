# Cartão do projeto — ben-prototype

docs de contexto: /home/fael/so/repos/ben-prototype/CLAUDE.md · /home/fael/so/repos/ben-prototype/.claude/skills/code-get-project-context/mobile/ben/description.md (com project-structure.md e technology-stack.md na mesma pasta)
unidades do projeto: packages/domain/* (@ben/domain-*, domínio e use cases) · packages/adapters (portos de serviços externos) · packages/modules/{utils,env,tests} (capacidades compartilhadas) · packages/infra/db (Prisma + SQLite) · packages/infra/adapters (portos reais) · packages/infra/server-ben (API Express 5 + Zod, :3333) · packages/infra/mobile/ben (@ben/mobile-ben, app Expo + React Native, web :8081) · packages/infra/mobile/design (@ben/mobile-design, sandbox Vite, :3002)
unidade afetada: packages/infra/mobile/ben (@ben/mobile-ben)
comando de teste: `pnpm test` na raiz (= `pnpm -r --if-present test:unit`); só o app: `pnpm --filter @ben/mobile-ben test:unit` (Vitest, `vitest.config.ts` com `include: src/**/*.test.ts`); um arquivo: `pnpm --filter @ben/mobile-ben exec vitest run <arquivo>`
comando de verificação: `pnpm lint:fix` · `pnpm typecheck` · `pnpm test` (sempre na raiz, nessa ordem)
comando de ambiente: `pnpm dev` na raiz (server-ben :3333 + app web :8081, roda `pnpm icons` antes); só o app: `pnpm dev:mobile` (web `http://localhost:8081`); sandbox: `pnpm dev:design` (`http://localhost:3002`)
pré-requisito de ambiente: para o app falar com a API, `pnpm db:migrate` (SQLite) e `packages/infra/mobile/ben/.env.development`; a tela de login e o favicon não dependem do backend
mecanismo de fixtures: nenhum
convenção de teste: Vitest ao lado do código em `__tests__/` (ex.: `src/services/__tests__/notifications-service.test.ts`); use cases de domínio em `application/use-cases/__tests__/`
skills de contexto: code-get-project-context (mobile/ben), code-get-coding-designs (mobile-app-structure.md), code-write-code (lint.md, general-code-preferences.md, frontend-code-preferences.md); medir-janela-e-turns para orquestração
memória do projeto: /home/fael/so/repos/ben-prototype/.claude/memory/README.md (categorias environment, decisions, rules, dev-preferences, fails-and-lessons, vocabulary vazias; business-rules só com razao-de-negocio-e-casos-de-uso-v1.md, não pertinente)
fluxo de dados persistentes: nenhum para esta unidade (Prisma fica em packages/infra/db; `pnpm db:migrate`)
convenções que o plano tem que respeitar: ESLint zera comentários e nomes abreviados (`id-length`, denylist; vale para `scripts/**` do app) · `layout/utils/` tem um assunto por arquivo e o app importa `@/` (script Node não resolve esse alias) · `tailwind.config.js` e `src/layout/utils/colors.ts` andam em lockstep nos hexes
