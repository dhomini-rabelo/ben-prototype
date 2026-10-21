## Mapa de arquivos
packages/adapters/src/ports/agent-provider.ts | union AgentModelSlug + AgentEffort + AgentModelSelection | 3-11
packages/domain/user/src/application/utils/agent-models.ts | catálogo AGENT_MODELS (slug,label,efforts,default) | 10-29 (default = AGENT_MODELS[0], l.31)
packages/domain/user/src/application/use-cases/agent-preferences/update-agent-preferences.ts | valida slug via findAgentModel (UNKNOWN_AGENT_MODEL) | 36-50
packages/domain/user/src/application/use-cases/agent-preferences/get-agent-preferences.ts | resolveAgentSelection (slug desconhecido -> default) | 17+
packages/domain/user/src/enterprise/entities/user.ts | props agentModelSlug: AgentModelSlug|null | 12
packages/infra/server-ben/src/routes/agent-preferences/update-agent-preferences.ts | zod: modelSlug/effort z.string() (sem enum) | 13-16
packages/infra/server-ben/src/presenters/agent-preferences-presenter.ts | devolve selection + models: AGENT_MODELS | 8-17
packages/infra/adapters/src/services/ben-agent-provider/models.ts | resolveOpenRouterModel(slug) via OpenRouter, reasoning.effort | 14-30
packages/infra/adapters/src/services/ben-agent-provider/index.ts | usa resolveOpenRouterModel (l.34, 130) | 34,130
packages/infra/adapters/src/services/ben-agent-provider/trace-builders.ts | grava modelSlug no trace | 171
packages/infra/mobile/ben/src/api/models/agent-preferences.ts | duplica union AgentModelSlug (mobile não importa domínio) | 1-2
packages/infra/mobile/ben/src/layout/components/menu-settings/agent-settings-controls.tsx | picker: lista models vindos da API | 37-48
packages/infra/mobile/ben/src/layout/hooks/use-agent-preferences.ts | seleção/otimista, ajusta effort ao modelo | 16-30, 83-90
packages/domain/user/src/application/use-cases/agent-preferences/__tests__/{get,update}-agent-preferences.test.ts | testes; usam 'openai/gpt-5.6-luna' como slug desconhecido-no-teste/valid | update:44-80

## Molde a espelhar
Os três modelos existentes em AGENT_MODELS (agent-models.ts:10-29). Adicionar entrada = mesmo shape:
  { slug: 'openai/gpt-5.6-luna', label: 'GPT-5.6 Luna', efforts: [none..max], defaultEffort: 'medium' }
mais o slug na union de agent-provider.ts:3-4 e na union do mobile agent-preferences.ts:1-2.

## Footprint
- Catálogo único no domínio (AGENT_MODELS); o mobile recebe a lista pela API (presenter:13) e renderiza label do servidor: nenhuma string i18n de modelo (grep em settings-strings.ts: nada de model/agent).
- Persistência: User.props é string JSON (schema.prisma:60-65); agentModelSlug dentro dele. Sem migration; sem coluna/enum.
- Provedor: slug vai direto ao OpenRouter (models.ts:20); slug = id OpenRouter. Sem env por modelo; só OPENROUTER_API_KEY (modules/env/src/env.ts:21).
- Slugs desconhecidos salvos caem no default (resolveAgentSelection, agent-models.ts:38-55).
- Trace exibe modelSlug cru no mobile (message-trace-meta-strip.tsx:22).
- Preço por modelo: NÃO EXISTE. grep por price/pricing/cost/usd em packages (ts/prisma/md): nada fora de textos de design. Nem custo no AgentCallTrace verificado (não aberto a fundo).

## Armadilhas
- Já existe "GPT-5.6 Luna" (openai/gpt-5.6-luna), que é o DEFAULT (índice 0). O pedido diz "GPT 6 Luna" e "GPT 6.1 Sol": substituir, ou adicionar ao lado? Ids OpenRouter de gpt-6*/sol não estão no repo.
- A union AgentModelSlug está duplicada (adapters port + mobile): mudar nos dois.
- Os testes update-agent-preferences.test.ts:44-80 usam 'openai/gpt-5.6-luna'; se o slug for removido/renomeado, quebram. Há comportamento em test na l.58 (UNKNOWN_AGENT_MODEL) que usa slug fora do catálogo.
- Remover um slug com usuários persistidos: cai no default via resolveAgentSelection (seguro).
- Rota zod aceita string livre; validação real é no use case.
- gasto-dolar depende de preço por modelo: o catálogo (AgentModelOption) é o lugar natural, mas hoje não tem campo de preço.

## Sinal de teste
Automatizado: get/update-agent-preferences.test.ts (domain/user) cobrem catálogo e validação. Sem teste para o provider OpenRouter nem mobile. UI: picker nas configurações (precisa stack rodando p/ ver novos itens); modo leve basta.

## Veredito de complexidade
1. Uma frente só? sim: catálogo no backend; mobile só tem a union de tipo e renderiza a lista da API.
2. Footprint <=6 arquivos? sim: agent-provider.ts, agent-models.ts, mobile agent-preferences.ts, +testes.
3. Molde claro? sim: entradas de AGENT_MODELS.
4. Zero decisão de produto em aberto? não: substituir vs adicionar; ids e efforts desconhecidos.
5. Zero lógica nova? sim.
veredito: complexa — item 4 (decisão de produto/ids de provedor em aberto)

## Sinal de partição
partição: não

## Lacunas que só o usuário responde
1. Slugs OpenRouter reais de "GPT 6 Luna" e "GPT 6.1 Sol": o repo só tem openai/gpt-5.6-luna. Leituras: derivar (openai/gpt-6-luna, openai/gpt-6.1-sol) ou usuário informa.
2. Adicionar ou substituir o GPT-5.6 Luna atual (default)? E qual passa a ser o default.
3. Efforts/defaultEffort dos novos modelos (hoje copiável do Luna: none..max, medium).
4. Preço por token (entrada/saída) por modelo, necessário ao gasto-dolar; hoje inexistente.
