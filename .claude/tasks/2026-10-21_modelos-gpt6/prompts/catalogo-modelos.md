# Escopo — catálogo de modelos (task modelos-gpt6)

Git: branch `feat/improve-ben`, commit-base `86cf204`. Esta é a primeira task do lote (modelos-gpt6 -> preferencias-servidor -> gasto-dolar -> historico-agente); se o código já tiver mudanças de outra task, integre, não reverta. Há pastas de outras tasks não rastreadas em `.claude/tasks/`: não as commite.

## Contrato

1. `packages/adapters/src/ports/agent-provider.ts:3-4`: troque a união literal por
   `export const AGENT_MODEL_SLUGS = ['openai/gpt-6-luna', 'openai/gpt-6.1-sol', 'deepseek/deepseek-v4.1-flash', 'z-ai/glm-5.3-flash'] as const`
   e `export type AgentModelSlug = (typeof AGENT_MODEL_SLUGS)[number]`. `AgentEffort` e `AgentModelSelection` intactos. O `index.ts` do pacote já reexporta a porta inteira.
2. `packages/domain/user/src/application/utils/agent-models.ts:10-32`: detalhes por modelo num `Record<AgentModelSlug, Omit<AgentModelOption, 'slug'>>` privado ao arquivo; `AGENT_MODELS: AgentModelOption[]` derivado de `AGENT_MODEL_SLUGS.map(...)` (a ordem do tuple é a ordem do picker); `DEFAULT_AGENT_MODEL_SLUG: AgentModelSlug = 'openai/gpt-6-luna'` e `DEFAULT_AGENT_MODEL` montado a partir dele (sem `AGENT_MODELS[0]`, sem cast, sem `!`). Mantenha os exports públicos e o comportamento de `findAgentModel` e `resolveAgentSelection` (l.34-52).
   - `openai/gpt-6-luna`: label `GPT-6 Luna`, efforts `none, low, medium, high, xhigh, max`, padrão `medium`.
   - `openai/gpt-6.1-sol`: label `GPT-6.1 Sol`, efforts `low, medium, high, xhigh, max`, padrão `medium`.
   - DeepSeek V4.1 Flash e GLM 5.3 Flash: copie os valores atuais (l.17-28).
   - GPT-5.6 Luna sai.
3. `packages/infra/mobile/ben/src/api/models/agent-preferences.ts:1-2`: `export type AgentModelSlug = string` (o mobile não importa `@ben/*` e recebe o catálogo pela API; consumidores em `layout/hooks/use-agent-preferences.ts` e `layout/components/menu-settings/agent-settings-controls.tsx` seguem compilando sem mudança).
4. Testes (domain/user, `application/use-cases/agent-preferences/__tests__/`):
   - `get-agent-preferences.test.ts`: padrão esperado `openai/gpt-6-luna` (l.44, l.70). Novo teste: slug legado `'openai/gpt-5.6-luna' as AgentModelSlug` + effort `high` devolve `{ modelSlug: 'openai/gpt-6-luna', effort: 'high' }`.
   - `update-agent-preferences.test.ts`: slug armazenado `openai/gpt-5.6-luna` (l.44, 59, 65, 80) vira `openai/gpt-6-luna`. Novos testes, um por variação: grava `openai/gpt-6.1-sol` + `xhigh`; rejeita `openai/gpt-6.1-sol` + `none` (`effort`, `UNSUPPORTED_AGENT_EFFORT`, usuário inalterado); rejeita `openai/gpt-5.6-luna` (`modelSlug`, `UNKNOWN_AGENT_MODEL`).
5. `packages/domain/task/src/application/use-cases/tasks/__tests__/create-task-message.test.ts:15`: `openai/gpt-5.6-luna` vira `openai/gpt-6-luna`.

Não mexa em: presenter `server-ben/src/presenters/agent-preferences-presenter.ts`, rota zod `server-ben/src/routes/agent-preferences/update-agent-preferences.ts`, `infra/adapters/src/services/ben-agent-provider/models.ts`, schema Prisma, contexto do projeto (`.claude/skills/code-get-project-context`).

## Segurança estrutural (parte do contrato)

Uma lista de slugs (`AGENT_MODEL_SLUGS`) com o tipo derivado, e o catálogo como `Record<AgentModelSlug, …>`: slug sem detalhes, ou detalhes de slug removido, tem que dar erro de tipo. Padrão declarado por slug.

## Convenções (siga)

- `.claude/skills/code-get-coding-designs/designs/backend-adapters-and-services-structure.md`
- `.claude/skills/code-write-code/general-coding-practices.md`
- `.claude/skills/code-write-code/coding-patterns/general-code-preferences.md`
- `.claude/skills/code-write-code/coding-patterns/automated-testing.md`

## Aceite

1. `AGENT_MODELS` em ordem: GPT-6 Luna, GPT-6.1 Sol, DeepSeek V4.1 Flash, GLM 5.3 Flash.
2. Sem preferência: `openai/gpt-6-luna` + `medium`. Slug fora do catálogo salvo: `openai/gpt-6-luna`, effort salvo se suportado, senão `medium`.
3. Sol rejeita `none`.
4. `grep -rn "gpt-5.6" packages --include=*.ts --include=*.tsx` só acha os testes do slug legado.
5. Na raiz, nesta ordem, saídas em arquivo: `pnpm lint:fix > .claude/tmp/modelos-gpt6/lint.txt 2>&1`, `pnpm typecheck > .claude/tmp/modelos-gpt6/typecheck.txt 2>&1`, `pnpm test > .claude/tmp/modelos-gpt6/test.txt 2>&1`. Os três passam.

## Commit

Ao terminar, commite só os arquivos acima mais `.claude/tasks/2026-10-21_modelos-gpt6/`, com a mensagem `simple-loop(modelos-gpt6): implement — catálogo GPT-6 Luna/GPT-6.1 Sol, slugs de uma fonte`. Sem push.

## Arquivos de que você é dono

- `packages/adapters/src/ports/agent-provider.ts`
- `packages/domain/user/src/application/utils/agent-models.ts`
- `packages/infra/mobile/ben/src/api/models/agent-preferences.ts`
- `packages/domain/user/src/application/use-cases/agent-preferences/__tests__/get-agent-preferences.test.ts`
- `packages/domain/user/src/application/use-cases/agent-preferences/__tests__/update-agent-preferences.test.ts`
- `packages/domain/task/src/application/use-cases/tasks/__tests__/create-task-message.test.ts`
