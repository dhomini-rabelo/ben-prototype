# Implementação (rodada 5) — troca do modelo Ben para `openai/gpt-5.6-luna`

## O que mudou
- `project-backend/src/infra/services/ben-agent-provider/models.ts:15`
  - antes: `export const openRouterModel = openrouter('openai/gpt-oss-120b', {`
  - depois: `export const openRouterModel = openrouter('openai/gpt-5.6-luna', {`
- Nenhum outro arquivo tocado (seguido à risca; não houve necessidade de parar por edição de um
  segundo arquivo).

## `git diff --stat` (saída literal)
```
 project-backend/src/infra/services/ben-agent-provider/models.ts | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

`git status --short`: só `M project-backend/src/infra/services/ben-agent-provider/models.ts`.
Nenhum `node_modules`, nenhum `.env` no status.

## Portões (seção 5 do plano)
- Preparo do ambiente: `npm ci` em `project-backend` → **exit=0** (rodou `prisma generate` no
  postinstall, como esperado; `node_modules` não existia antes, confirmado com `ls -d node_modules`
  → "No such file or directory").
- Sanidade do `tsc`: `npx tsc --version` → `Version 5.9.3` (o do projeto, não um fallback).
- `npm run lint:fix` → **lint exit=0**.
- `npx tsc --noEmit` → **tsc exit=0**.
- Varredura da seção 8 (`git grep -n -i -e 'gpt-oss' -e '120b' -- . ':!*.claude/tmp/*'`): nenhuma
  saída (grep exit=1, ou seja, zero ocorrências) — confirma que não sobrou nenhum resíduo de
  `gpt-oss-120b` no repositório versionado.

## Contingência de `strict` (seção 4)
**Não acionada.** Esta rodada não incluiu chamada real ao agente (o teste de browser da seção 7 é
de outro filho, fora do escopo desta tarefa), então o gatilho de 4.3 (erro 400 de esquema do
OpenRouter/OpenAI) nunca teve chance de aparecer. `structuredOutputs: { strict: false }` **não foi
aplicado** — o diff ficou mínimo, como a seção 4.2 manda por padrão.

## O que ficou bloqueado
- Nada bloqueado dentro do escopo desta tarefa (preparar ambiente, aplicar diff, lint, typecheck —
  todos concluídos com sucesso observado).
- Fora do escopo desta rodada, por instrução explícita da tarefa: teste de browser (seção 7),
  verificação da contingência de `strict` em runtime, commit e push (seção 10). Ficam para o
  próximo filho, depois do teste de browser.
- Árvore de trabalho deixada suja, intencionalmente, apenas com `models.ts` modificado.
