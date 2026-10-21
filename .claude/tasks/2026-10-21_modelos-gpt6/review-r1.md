APPROVED

# Review r1 — modelos-gpt6 (commit 45a2065, base 6e11538)

## Completude vs contrato e aceite
- Contrato 1 (`packages/adapters/src/ports/agent-provider.ts:3-10`): `AGENT_MODEL_SLUGS` `as const` na ordem Luna, Sol, DeepSeek, GLM; `AgentModelSlug` derivado; `AgentEffort`/`AgentModelSelection` intactos. OK.
- Contrato 2 (`packages/domain/user/src/application/utils/agent-models.ts:15-49`): `AGENT_MODEL_DETAILS: Record<AgentModelSlug, Omit<AgentModelOption,'slug'>>` privado; `AGENT_MODELS` derivado de `AGENT_MODEL_SLUGS.map`; `DEFAULT_AGENT_MODEL_SLUG = 'openai/gpt-6-luna'` declarado e `DEFAULT_AGENT_MODEL` montado dele, sem `[0]`, cast ou `!`. Efforts/padrões de Luna e Sol batem com as decisões; DeepSeek e GLM sem alteração no diff. `findAgentModel`/`resolveAgentSelection` inalterados. OK.
- Contrato 3 (mobile `agent-preferences.ts:1`): `AgentModelSlug = string`; consumidores só usam o tipo, sem literais de slug. OK.
- Contrato 4/5 (testes): padrões trocados nas linhas pedidas; teste novo de slug legado no get (`get-agent-preferences.test.ts:74-85`); três testes novos no update (Sol+xhigh grava; Sol+none rejeita `effort`/`UNSUPPORTED_AGENT_EFFORT` com usuário inalterado; slug legado rejeita `modelSlug`/`UNKNOWN_AGENT_MODEL`); `create-task-message.test.ts:15` trocado. OK.
- Aceite 2: fallback de slug desconhecido usa `DEFAULT_AGENT_MODEL` (Luna) e mantém o effort se suportado, senão `medium` (default de Luna). OK.
- Aceite 4: `grep gpt-5.6` em packages (qualquer extensão, sem node_modules) só acha os dois testes do slug legado. OK.
- Arquivos proibidos (presenter, rota zod, `infra/adapters/.../models.ts`, Prisma, contexto do projeto) não foram tocados. A rota zod aceita `z.string()` e `resolveOpenRouterModel` repassa o slug, então nada mais precisa mudar.

## Segurança estrutural
`Record<AgentModelSlug, …>` obriga detalhe para cada slug do tuple e rejeita chave extra (excess property check em literal); padrão declarado por slug. Atende.

## Correção
Sem cenário de falha encontrado. Lint/typecheck/test reportados com exit 0 pelo implementer (não reexecutados, conforme instrução).

## Observações não bloqueantes (não são ressalvas)
- `get-agent-preferences.test.ts:9`: o import de `@ben/adapters` ficou depois dos imports internos de `@ben/domain-user`; posição estética, lint passou.

## Premissas
- Valores atuais de DeepSeek/GLM conferidos pela ausência de linhas `efforts`/`defaultEffort` alteradas no diff desses dois blocos.
