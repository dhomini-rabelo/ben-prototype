# Ben

**Um assistente pessoal por voz.** "Your busy-day brain: say it, Ben files it." Você fala, o Ben transcreve, entende e organiza a fala em tarefas, tópicos e conversas.

Este repositório é o workspace v1 de prototipação do app: serve para desenhar, iterar e validar as telas e as interações do Ben antes do produto real. Não é um código de produção.

## Estrutura

Monorepo **pnpm**. Os pacotes têm escopo `@ben/<camada>-<nome>` e vivem em `packages/`.

| Parte | Pacote / caminho | Tecnologia |
| --- | --- | --- |
| API | `@ben/server-ben` (`packages/infra/server-ben`) | Node 24, TypeScript, Express 5, Zod, `tsup` |
| App mobile | `@ben/mobile-ben` (`packages/infra/mobile/ben`) | Expo, React Native, NativeWind, Jotai |
| Design | `@ben/mobile-design` (`packages/infra/mobile/design`) | Vite, React, Tailwind v4 |
| Domínio | `@ben/domain-*` (`packages/domain/*`) | `base`, `user`, `task`, `chat`, `topic`, `transcription`: entidades, contratos de repositório, use cases e testes (Vitest) |
| Portos externos | `@ben/adapters` (`packages/adapters`) | contratos de JWT, auth, agente e transcrição |
| Banco | `@ben/infra-db` (`packages/infra/db`) | SQLite com Prisma: schema, migrations e repositórios |
| Serviços externos | `@ben/infra-adapters` (`packages/infra/adapters`) | Firebase Admin, AI SDK (Google e OpenRouter), AssemblyAI |
| Compartilhados | `@ben/modules-{utils,env,tests}` (`packages/modules/*`) | helpers, leitura de env e dublês de adapters para testes |

Direção das dependências: `infra` depende de `domain` e `adapters`; `domain` depende de `domain/base` e `adapters`; `domain/base` e `adapters` não dependem de módulos de feature nem de infra. O mobile não importa use cases nem pacotes de domínio: consome a API por HTTP. O dono de cada contrato entre módulos de domínio está em [packages/domain/ownerships.md](packages/domain/ownerships.md).

## Como rodar

Requisitos: Node 24 ou superior e pnpm 11 (campo `packageManager` do `package.json`).

```bash
pnpm install
cp packages/infra/server-ben/.env.example packages/infra/server-ben/.env.development   # preencha as chaves
cp packages/infra/mobile/ben/.env.example packages/infra/mobile/ben/.env   # preencha as chaves
pnpm db:migrate     # aplica as migrations do Prisma (só com PERSISTENCE_DRIVER=sqlite)
pnpm dev            # API e app mobile juntos
```

`pnpm dev` sobe o `@ben/server-ben` na porta de `API_PORT` (3333 em `packages/infra/server-ben/.env.development`) e o `@ben/mobile-ben` em `http://localhost:8081` (Expo web). A API lê `.env.development` (`NODE_ENV=development`) e o Expo lê `.env`; as variáveis estão documentadas nos dois `.env.example`. `PERSISTENCE_DRIVER` aceita `in-memory` (padrão) ou `sqlite`.

Scripts da raiz:

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | API e mobile em paralelo. |
| `pnpm dev:mobile` | Só o app mobile (Expo web, `:8081`). |
| `pnpm dev:design` | Só a galeria de design (Vite, `:3002`). |
| `pnpm test` | Testes unitários (Vitest) dos pacotes de domínio. |
| `pnpm typecheck` | `tsc` em cada pacote que declara `typecheck`. |
| `pnpm lint` / `pnpm lint:fix` | ESLint (com Prettier) no repositório inteiro. |
| `pnpm build` | Build dos pacotes que declaram `build` (API com `tsup`, galeria de design com Vite). |
| `pnpm db:migrate` | `prisma migrate deploy` no `@ben/infra-db`. |

Para um pacote só: `pnpm --filter @ben/<pacote> <script>`. O app Android sai por `pnpm --filter @ben/mobile-ben apk`.

## Organização do .claude

| Pasta | Conteúdo |
| --- | --- |
| `.claude/skills/` | Skills do projeto: contexto (`code-get-project-context`), convenções de código (`code-get-coding-designs`, `code-write-code`), tarefas (`task-*`), memória (`save-memory`) e medição de janela e turns (`medir-janela-e-turns`). |
| `.claude/memory/` | Memória durável por categoria (ambiente, regras de negócio, decisões, regras de trabalho, preferências, lições, vocabulário). O índice é o [README da memória](.claude/memory/README.md). |
| `.claude/agents/` e `.claude/agents-docs/` | Agentes especializados (teste do app no navegador, consultoria de design) e os documentos que eles leem. |
| `.claude/settings.json` | Configuração compartilhada do Claude Code. `settings.local.json` e `.claude/tmp/` ficam fora do git. |

As regras de trabalho do agente (commits, perguntas, lint e typecheck) estão em [CLAUDE.md](CLAUDE.md).
