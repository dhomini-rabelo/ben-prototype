# Plano — modelos-gpt6

Pedido (briefing, task 1): GPT 6 Luna (`openai/gpt-6-luna`, padrão) e GPT 6.1 Sol (`openai/gpt-6.1-sol`) no catálogo; GPT-5.6 Luna removido; usuário com slug salvo desconhecido cai no padrão; efforts conforme "Fatos verificados" do briefing (`.claude/tmp/orquestracoes/2026-10-21-modelos-gasto-historico/briefing.md`).

Gate de perguntas: sem dúvidas (decisões já tomadas no briefing).

## Premissas assumidas

1. Ids: `openai/gpt-6-luna` e `openai/gpt-6.1-sol` (vinculante, briefing).
2. Labels: `GPT-6 Luna` e `GPT-6.1 Sol`, no mesmo formato do label atual `GPT-5.6 Luna` e dos nomes do OpenRouter ("OpenAI: GPT-6 Luna"). O mobile renderiza o label que vem da API; não há string i18n de modelo.
3. Efforts: Luna `none, low, medium, high, xhigh, max`, padrão `medium`; Sol `low, medium, high, xhigh, max` (sem `none`, reasoning obrigatório), padrão `medium`.
4. Ordem do catálogo (ordem do picker): GPT-6 Luna, GPT-6.1 Sol, DeepSeek V4.1 Flash, GLM 5.3 Flash. DeepSeek e GLM ficam como estão.
5. Padrão: `openai/gpt-6-luna`, declarado pelo slug (não mais por posição `AGENT_MODELS[0]`).
6. Fallback: comportamento atual de `resolveAgentSelection` (`packages/domain/user/src/application/utils/agent-models.ts:38-52`) já cumpre a premissa do briefing: slug fora do catálogo (inclusive o legado `openai/gpt-5.6-luna`) cai no padrão; o effort salvo é mantido se o padrão o suporta, senão vira o `defaultEffort` do padrão. Chat e turns de tarefa leem a seleção por `GetAgentPreferencesUseCase` (`server-ben/src/routes/chat.ts:41`, `routes/tasks/create-task-message.ts:14`), então o fallback vale para a chamada ao agente também. Sem migration: `agentModelSlug` vive no JSON de `User.props`; nenhum dado é reescrito, só a leitura cai no padrão.
7. `POST /agent-preferences/update` com `openai/gpt-5.6-luna` passa a responder `UNKNOWN_AGENT_MODEL` (comportamento atual para slug fora do catálogo). Esperado.
8. Mobile: o tipo `AgentModelSlug` do mobile vira `string` (alias mantido). O mobile não importa `@ben/adapters` (sem dependência `@ben/*` no `package.json`) e não usa nenhum literal de slug; a lista vem da API. Assim some a segunda cópia da união.
9. Preço por modelo fica fora: a task gasto-dolar usa `usage.cost` do OpenRouter (briefing).

## Convenções aplicáveis

- `.claude/skills/code-get-coding-designs/designs/backend-adapters-and-services-structure.md` (porta em `packages/adapters/src/ports/`).
- `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md` (utils de aplicação no domínio `user`).
- `.claude/skills/code-write-code/general-coding-practices.md`
- `.claude/skills/code-write-code/coding-patterns/general-code-preferences.md` (propagar a mudança a todas as camadas; sincronizar o cliente mobile).
- `.claude/skills/code-write-code/coding-patterns/automated-testing.md` (um teste por variação do contrato).

## Escopo único — catálogo de modelos

Arquivos (o implementer é dono deles):

| Arquivo | Mudança |
| --- | --- |
| `packages/adapters/src/ports/agent-provider.ts:3-4` | Trocar a união literal por `export const AGENT_MODEL_SLUGS = ['openai/gpt-6-luna', 'openai/gpt-6.1-sol', 'deepseek/deepseek-v4.1-flash', 'z-ai/glm-5.3-flash'] as const` e `export type AgentModelSlug = (typeof AGENT_MODEL_SLUGS)[number]`. `AgentEffort` e `AgentModelSelection` intactos. |
| `packages/domain/user/src/application/utils/agent-models.ts:10-32` | Detalhes por modelo num `Record<AgentModelSlug, Omit<AgentModelOption, 'slug'>>` (privado ao arquivo); `AGENT_MODELS: AgentModelOption[]` derivado de `AGENT_MODEL_SLUGS.map(...)` (ordem do tuple); `DEFAULT_AGENT_MODEL_SLUG: AgentModelSlug = 'openai/gpt-6-luna'` e `DEFAULT_AGENT_MODEL` montado a partir dele. `findAgentModel` e `resolveAgentSelection` sem mudança de comportamento. Exports públicos mantidos (`AgentModelOption`, `AGENT_MODELS`, `DEFAULT_AGENT_MODEL`, `DEFAULT_AGENT_MODEL_SLUG`, `findAgentModel`, `resolveAgentSelection`). |
| `packages/infra/mobile/ben/src/api/models/agent-preferences.ts:1-2` | `export type AgentModelSlug = string`. |
| `packages/domain/user/src/application/use-cases/agent-preferences/__tests__/get-agent-preferences.test.ts` | Padrão esperado vira `openai/gpt-6-luna` (l.44, l.70). Novo teste: usuário com o slug legado `'openai/gpt-5.6-luna' as AgentModelSlug` e effort `high` recebe `{ modelSlug: 'openai/gpt-6-luna', effort: 'high' }`. |
| `packages/domain/user/src/application/use-cases/agent-preferences/__tests__/update-agent-preferences.test.ts` | Slug armazenado `openai/gpt-5.6-luna` (l.44, 59, 65, 80) vira `openai/gpt-6-luna`. Novos testes: grava `openai/gpt-6.1-sol` + `xhigh`; rejeita `openai/gpt-6.1-sol` + `none` com `UNSUPPORTED_AGENT_EFFORT`; rejeita o slug removido `openai/gpt-5.6-luna` com `UNKNOWN_AGENT_MODEL`. |
| `packages/domain/task/src/application/use-cases/tasks/__tests__/create-task-message.test.ts:15` | `openai/gpt-5.6-luna` vira `openai/gpt-6-luna` (a união literal faria o typecheck falhar). |

Sem mudança: presenter (`server-ben/src/presenters/agent-preferences-presenter.ts`, devolve `AGENT_MODELS`), rota zod (string livre), `resolveOpenRouterModel` (`infra/adapters/src/services/ben-agent-provider/models.ts:17-30`, passa slug e effort direto), hooks e componentes do mobile (usam o alias).

## Melhorias estruturais

- Uma única lista de slugs no backend (`AGENT_MODEL_SLUGS` na porta), com o tipo derivado dela. O catálogo do domínio é um `Record<AgentModelSlug, …>`: incluir um slug na lista sem detalhes no catálogo, ou deixar detalhes de um slug removido, vira erro de tipo. Hoje união e catálogo são duas listas que podem divergir em silêncio.
- Padrão declarado pelo slug, não pela posição no array: reordenar o picker não troca o padrão sem querer.
- Mobile deixa de duplicar a união; o servidor é a única fonte do catálogo.

## Melhorias estruturais sugeridas (fora do escopo)

- A rota `POST /agent-preferences/update` poderia validar `modelSlug` com `z.enum(AGENT_MODEL_SLUGS)` para devolver 400 de schema em vez de `UNKNOWN_AGENT_MODEL` do use case; hoje a validação no use case é suficiente e testada.

## Critérios de aceite

1. `GET /agent-preferences/detail` lista, nesta ordem, GPT-6 Luna, GPT-6.1 Sol, DeepSeek V4.1 Flash, GLM 5.3 Flash; nenhum GPT-5.6 Luna.
2. Usuário sem preferência recebe `openai/gpt-6-luna` + `medium`.
3. Usuário com `openai/gpt-5.6-luna` (ou outro slug fora do catálogo) salvo recebe `openai/gpt-6-luna`, effort salvo se suportado, senão `medium`.
4. GPT-6.1 Sol não aceita `none`.
5. `grep -rn "gpt-5.6" packages --include=*.ts --include=*.tsx` só encontra os testes de fallback/rejeição do slug legado.
6. `pnpm lint:fix`, `pnpm typecheck` e `pnpm test` passam na raiz.

## Fora do escopo

Preço por modelo, mudanças no provider OpenRouter, migration, i18n, picker do mobile (layout), atualização do contexto do projeto.

## Teste de sistema

Modo leve: subir a stack, abrir Configurações no mobile (`:8081`) e ver os dois modelos novos no picker, GPT-6 Luna selecionado para usuário sem preferência; selecionar GPT-6.1 Sol e conferir que `none` não aparece. O fallback de slug legado fica coberto pelos testes de use case.
