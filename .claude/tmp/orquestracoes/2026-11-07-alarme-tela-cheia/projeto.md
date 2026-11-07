# Cartão do projeto — ben-prototype

docs de contexto: /CLAUDE.md · .claude/skills/code-get-project-context/mobile/ben/description.md (app) e .claude/skills/code-get-project-context/backend/description.md (servidor)
unidades do projeto: domain/{base,user,task,chat,topic,transcription} — regras de negócio e contratos de repositório · adapters — portas de serviços externos · modules/{utils,env,tests} — compartilhados · infra/db — Prisma + SQLite (props em JSON) · infra/adapters — implementações das portas · infra/server-ben — API Express 5 + Zod · infra/mobile/ben — app Expo/React Native (web :8081) · infra/mobile/design — sandbox Vite de design
unidade afetada: mais de uma — packages/infra/mobile/ben (principal) e packages/domain/chat + packages/infra/server-ben (RT-009: registro da ação)
comando de teste: `pnpm test` na raiz (roda `test:unit` de cada pacote); um pacote: `pnpm --filter @ben/mobile-ben test:unit` ou `pnpm --filter @ben/domain-chat test:unit`; um arquivo: `pnpm --filter <pacote> exec vitest run <caminho>`
comando de verificação: `pnpm lint:fix` → `pnpm typecheck` → `pnpm test` (sempre na raiz)
comando de ambiente: `pnpm dev` na raiz (API em :3333 + Expo web em http://localhost:8081); só o app: `pnpm dev:mobile`. APK: `source packages/infra/mobile/ben/scripts/android-env.sh` e `pnpm --filter @ben/mobile-ben apk` (prebuild + gradle)
pré-requisito de ambiente: SQLite do servidor migrado (`pnpm db:migrate`) e `.env` com BACKEND_URL/Firebase/DEV_ACCESS_TOKEN (login automático no web por `use-dev-auth.ts`); sem serviço externo além disso
mecanismo de fixtures: nenhum (há factories de teste em packages/domain/chat/src/application/__tests__/factories/reminder.ts, só para suítes; não há comando que fabrique estado para o app)
convenção de teste: domínio em `packages/domain/<modulo>/src/application/use-cases/**/__tests__/<caso>.test.ts`; app em `packages/infra/mobile/ben/src/**/__tests__/*.test.ts` (vitest, ambiente node, só `.ts`, sem teste de componente .tsx)
skills de contexto: code-get-project-context, code-get-coding-designs, code-write-code; skills do fluxo: decidir-especificar-e-planejar, implementar-e-validar
memória do projeto: .claude/memory/README.md (categorias environment, decisions, rules, fails-and-lessons, dev-preferences e vocabulary vazias; business-rules tem uma entrada, razao-de-negocio-e-casos-de-uso-v1.md, desatualizada para lembretes)
fluxo de dados persistentes: packages/infra/db/prisma/schema.prisma (`Reminder` guarda `props` e `types` como texto JSON) · migração `pnpm db:migrate`; campo novo em props de lembrete não exige migration
convenções que o plano tem que respeitar: mobile não importa domínio, fala com o backend só por HTTP · pasta `android/` é gerada e ignorada pelo git: tudo nativo entra por config plugin (`plugins/`) ou módulo Expo versionado · todo texto de tela vive em dicionário `Localized` (en e pt-BR) e `app-versions.ts` ganha entrada a cada release testável
