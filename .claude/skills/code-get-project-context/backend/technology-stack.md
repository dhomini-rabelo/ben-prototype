# Backend Ben: stack

Node.js · TypeScript · pnpm workspace · Express 5 · Zod · Prisma + SQLite (`better-sqlite3`) · Firebase Admin (auth) · JWT · AssemblyAI (transcrição de áudio) · API de push do Expo (`https://exp.host/--/api/v2/push/send`, via `fetch`, lotes de 100) · Vercel AI SDK + OpenRouter / Google Gemini (agente Ben) · multer (upload) · `tsx` (dev do `server-ben`, scripts do `infra-db`) · `tsup` (build do `server-ben`) · Vitest (testes unitários) · ESLint 9 + Prettier.

Versões exatas ficam nos `package.json` dos packages e da raiz.

## Comandos (na raiz do repositório)

| Comando | O que faz |
|---|---|
| `pnpm dev` | sobe o `server-ben` e o app Ben juntos (`concurrently`) |
| `pnpm --filter @ben/server-ben dev` | sobe só a API |
| `pnpm test` | roda `test:unit` em todos os packages que têm |
| `pnpm typecheck` | `tsc` em todos os packages |
| `pnpm lint` / `pnpm lint:fix` | ESLint na raiz |
| `pnpm build` | build dos packages que têm |
| `pnpm db:migrate` | `migrate deploy` do Prisma em `@ben/infra-db` |

## Persistência

`PERSISTENCE_DRIVER` (em `@ben/modules-env`) escolhe `in-memory` (padrão) ou `sqlite`. Em desenvolvimento o padrão é in-memory: o banco só é usado com `PERSISTENCE_DRIVER=sqlite`.

## Deploy

O backend roda em Docker. O `Dockerfile` (Node 24, pnpm) instala as dependências, gera o Prisma, compila o `server-ben` e, ao subir, roda `migrate:deploy` antes de `node dist/server.js`, com `PERSISTENCE_DRIVER=sqlite` e o banco em `/data/ben.db` (volume). Todo push na `main` dispara `.github/workflows/deploy.yml`, que abre um SSH na VPS e executa `deploy/deploy-ben.sh` (build da imagem, troca do container, healthcheck); o Caddy (`deploy/ben.caddy`) expõe o container em `ben.df07.site`. As variáveis de runtime estão em `deploy/ben.env.example`; `EXPO_ACCESS_TOKEN` é opcional e, quando presente, vai como `Authorization: Bearer` na API de push do Expo.
