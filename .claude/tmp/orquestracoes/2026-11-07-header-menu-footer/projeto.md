# Cartão do projeto — ben-prototype

docs de contexto: CLAUDE.md · .claude/skills/code-get-project-context/mobile/ben/{description,project-structure}.md e .claude/skills/code-get-project-context/mobile/design/{description,project-structure,design-rules,gallery-workflows}.md
unidades do projeto: monorepo pnpm —
  - `@ben/domain-{base,user,task,chat,topic,transcription,notification}` (packages/domain/*): regras de negócio por módulo;
  - `@ben/adapters` (packages/adapters): portos de serviços externos;
  - `@ben/modules-{utils,env,tests}` (packages/modules/*): código compartilhado;
  - `@ben/infra-db`, `@ben/infra-adapters`, `@ben/server-ben` (packages/infra/*): persistência Prisma+SQLite, serviços externos, API Express 5 em :3333;
  - `@ben/mobile-ben` (packages/infra/mobile/ben): app Expo + React Native, web em :8081;
  - `@ben/mobile-design` (packages/infra/mobile/design): sandbox/galeria Vite + React + Tailwind v4 em :3002.
unidade afetada: mais de uma — `@ben/mobile-ben` (app) e `@ben/mobile-design` (galeria), mais documentação em `.claude/agents-docs/project-context/ux-philosophy.md`
comando de teste: `pnpm test` na raiz (= `pnpm -r --if-present test:unit`); um pacote só: `pnpm --filter @ben/mobile-ben test:unit` (Vitest, `src/**/*.test.ts`, ambiente node). Hoje o app só tem `src/services/__tests__/notifications-service.test.ts`; não há teste de UI.
comando de verificação: na raiz, nesta ordem: `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`. Pacote só: `pnpm --filter @ben/mobile-ben typecheck`, `pnpm --filter @ben/mobile-design typecheck` (o do design é `tsc -b`).
comando de ambiente: app (:8081) `pnpm dev:mobile` (= `expo start --web --port 8081`; Expo web já está de pé nesta máquina); galeria (:3002) `pnpm dev:design`. App com backend real (chat, contagens, tarefas): `pnpm dev` na raiz (server :3333 + mobile) com `BACKEND_URL=http://localhost:3333` no `.env.development` do app (hoje aponta para um túnel ngrok, e :3333 está fora do ar).
pré-requisito de ambiente: para telas do app que falam com a API, o `@ben/server-ben` de pé (`pnpm --filter @ben/server-ben dev`, SQLite em `packages/infra/db/prisma/dev.db`; migrations com `pnpm db:migrate`). Telas de protótipo (`/prototipo/...`) e a galeria não precisam de backend.
mecanismo de fixtures: nenhum (não há seed nem fixtures; o único estado "de mentira" é o da galeria, que é HTML estático por rota)
convenção de teste: Vitest `*.test.ts` ao lado da unidade, em pasta `__tests__/` (ex.: `src/services/__tests__/`; use cases em `application/use-cases/__tests__/`); `n/a` para UI
skills de contexto: code-get-project-context (mobile/ben e mobile/design), code-get-coding-designs (mobile-app-structure, page-structure, feature-state-components-structure), code-write-code (frontend e mobile: mobile-bottom-sheet-overlay, mobile-icon-colors, keyboard-aware-absolute-footer, react-components, component-variant-maps, lint). Skill de implementação: implementar-e-validar. Agentes: browser-mobile-tester (Playwright MCP :8931), design-advisor.
memória do projeto: .claude/memory/README.md (índice; só business-rules tem entrada, `razao-de-negocio-e-casos-de-uso-v1.md`, não pertinente; as outras categorias dizem "Nenhuma entrada ainda")
fluxo de dados persistentes: nenhum nesta task (schema em packages/infra/db/prisma/schema.prisma; migração `pnpm db:migrate`)
convenções que o plano tem que respeitar:
  - Sem comentários no código, código em inglês, sem abreviações (ESLint `lint.md`); strings novas em `en` e `pt-BR` via `Localized<T>`/`useStrings`; ícones com `color`/`size` explícitos vindos de `@/layout/utils/colors`.
  - Sandbox é o passo anterior ao app: estado de tela novo = pasta `pages/<page>-<state>` + rota em `core/routes.tsx` + entrada em `PAGES` (`core/screens.ts`); componente novo = `ui/` ou `common/` + `<nome>-preview` + `COMPONENTS`; viewport 390x844; primitivas sem `w-full`/`max-w`.
  - O mobile só fala com o backend por HTTP; protótipos em `app/prototipo/` e `src/prototipo/` são removidos no último passo.
