# Cartão do projeto — ben-prototype

docs de contexto: CLAUDE.md · .claude/skills/code-get-project-context/backend/*.md, .claude/skills/code-get-project-context/mobile/ben/{description,project-structure}.md e .claude/skills/code-get-project-context/mobile/design/{description,project-structure,design-rules,gallery-workflows}.md
unidades do projeto: monorepo pnpm —
  - `@ben/domain-{base,user,task,chat,topic,transcription,notification}` (packages/domain/*): regras de negócio por módulo;
  - `@ben/adapters` (packages/adapters): portos de serviços externos;
  - `@ben/modules-{utils,env,tests}` (packages/modules/*): código compartilhado;
  - `@ben/infra-db`, `@ben/infra-adapters`, `@ben/server-ben` (packages/infra/*): persistência Prisma+SQLite, serviços externos, API Express 5 em :3333;
  - `@ben/mobile-ben` (packages/infra/mobile/ben): app Expo + React Native, web em :8081;
  - `@ben/mobile-design` (packages/infra/mobile/design): sandbox/galeria Vite + React + Tailwind v4 em :3002.
unidade afetada: mais de uma — `@ben/domain-chat` (CaptureView, resolve-capture, persist-captures), `@ben/server-ben` (presenters do chat e das mensagens) e `@ben/mobile-ben` (card, lista, detalhe, menu-store); a galeria `@ben/mobile-design` é dúvida do plano (ver reconhecimento.md)
comando de teste: `pnpm test` na raiz (= `pnpm -r --if-present test:unit`); um pacote só: `pnpm --filter @ben/domain-chat test:unit` ou `pnpm --filter @ben/mobile-ben test:unit` (Vitest, `src/**/*.test.ts`, ambiente node; arquivo só: `pnpm --filter <pacote> exec vitest run <caminho>`). Hoje o app mobile só tem `src/services/__tests__/notifications-service.test.ts`; não há teste de componente.
comando de verificação: na raiz, nesta ordem: `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`. Pacote só: `pnpm --filter @ben/mobile-ben typecheck`, `pnpm --filter @ben/server-ben typecheck`, `pnpm --filter @ben/domain-chat typecheck`.
comando de ambiente: app com backend real, `pnpm dev` na raiz (server :3333 + Expo web :8081). `pnpm dev:mobile` sozinho = só o app (`expo start --web --port 8081`; Expo web já está de pé nesta máquina). Galeria: `pnpm dev:design` (:3002). `BACKEND_URL` mora em `packages/infra/mobile/ben/.env.development` e hoje aponta para um túnel ngrok; a linha `http://localhost:3333` está comentada; :3333 está fora do ar.
pré-requisito de ambiente: para telas do app que falam com a API, o `@ben/server-ben` de pé (`pnpm --filter @ben/server-ben dev`, SQLite em `packages/infra/db/prisma/dev.db`; migrations com `pnpm db:migrate`). Telas de protótipo (`/prototipo/...`) e a galeria não precisam de backend.
mecanismo de fixtures: nenhum (não há seed nem fixtures; o único estado "de mentira" é o da galeria, que é HTML estático por rota)
convenção de teste: Vitest `*.test.ts` ao lado da unidade, em pasta `__tests__/` (ex.: `packages/domain/chat/src/application/use-cases/captures/__tests__/*.test.ts`; app: `src/services/__tests__/`); o `vitest.config.ts` do app só inclui `src/**/*.test.ts` (nenhum `.test.tsx`, ambiente node)
skills de contexto: code-get-project-context (backend, mobile/ben e mobile/design), code-get-coding-designs, code-write-code (frontend e mobile). Skill de implementação: implementar-e-validar. Agentes: browser-mobile-tester (Playwright MCP :8931), design-advisor.
memória do projeto: .claude/memory/README.md (índice; só business-rules tem entrada, `razao-de-negocio-e-casos-de-uso-v1.md`, desatualizada quanto a lembrete recorrente; as outras categorias dizem "Nenhuma entrada ainda")
fluxo de dados persistentes: nenhum nesta task (props do Reminder são JSON, sem coluna; schema em packages/infra/db/prisma/schema.prisma; migração `pnpm db:migrate`)
convenções que o plano tem que respeitar:
  - Sem comentários no código, código em inglês, sem abreviações (ESLint `lint.md`); strings novas em `en` e `pt-BR` via `Localized<T>`/`useStrings`; ícones com `color`/`size` explícitos vindos de `@/layout/utils/colors`.
  - Mudar domínio exige teste de comportamento ao lado (`application/use-cases/__tests__/`); o mobile só fala com o backend por HTTP, nunca importa domínio.
  - Protótipos em `app/prototipo/` e `src/prototipo/` são removidos no último passo (só a pasta `lembrete-criado-abrir-tela`); a galeria só segue o fluxo `pages/<page>-<state>` + `core/routes.tsx` + `core/screens.ts` se o plano a incluir.
