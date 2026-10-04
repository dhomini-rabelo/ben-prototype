# Relatório final — configurar modelo e effort do agente Ben

## Veredito: entregue

## O pedido
Na aba de Settings do app, adicionar a escolha entre 3 modelos do agente Ben (`GPT-5.6 Luna`
atual, `DeepSeek V4.1 Flash`, `GLM 5.3 Flash`) e o controle de effort de raciocínio de cada
modelo, seguindo só os níveis que cada um suporta. Persistido por usuário no backend, valendo
para chat e para mensagens de task, e visível no trace de input/output de cada mensagem.

## O que mudou

**Backend** (`project-backend/src/`)
- `domain/entities/user.ts` — dois campos novos, `agentModelSlug`/`agentEffort`.
- `domain/utils/agent-models.ts` (novo) — catálogo estático dos 3 modelos e seus efforts
  suportados, com helpers de resolução e validação.
- `domain/use-cases/agent-preferences/` (novo) — casos de uso de leitura/atualização da
  preferência.
- `infra/http/routes/agent-preferences/` (novo) — `GET /agent-preferences/detail` e
  `POST /agent-preferences/update`, com rejeição de par (modelo, effort) inválido.
- `infra/services/ben-agent-provider/models.ts`, `index.ts`, `trace-builders.ts` — o modelo passa
  a ser resolvido por chamada (não mais module-scope) e o trace passa a carregar `modelSlug`/
  `effort` usados.
- `routes/chat.ts` e `use-cases/tasks/create-task-message.ts` — chat e mensagens de task passam a
  ler a preferência do usuário antes de chamar o modelo.

**Mobile** (`project-mobile/src/`)
- `api/models/agent-preferences.ts`, `api/requests/agent-preferences.ts`,
  `layout/hooks/api/use-agent-preferences-data.ts`, `layout/hooks/use-agent-preferences.ts` (todos
  novos) — leitura/escrita da preferência com estado local de rascunho, retry de erro de carga e
  de erro de save (reenviando o par que o usuário tentou, não o antigo).
- `layout/components/menu-settings/agent-*.tsx` (5 componentes novos) — seção "Ben's model" no
  bottom-sheet de Settings existente: 3 opções de modelo + chips de effort dinâmicos por modelo,
  estados de loading/erro/dados.
- `settings-sheet.tsx` / `settings-view.tsx` — sheet ficou rolável (a seção nova mais o perfil e o
  sign-out cabem via scroll).
- `api/models/message-trace.ts` e `message-trace-meta-strip.tsx` — o sheet de trace mostra o
  modelo e o effort usados na chamada; mensagens antigas sem esses campos caem no comportamento
  anterior (`trace.modelId`, sem pill de effort).

## Como foi provado
- `npm run lint:fix` e `npx tsc --noEmit` limpos (EXIT=0) nos dois projetos.
- Teste end-to-end no browser (porta 8081, viewport de celular), com o app rodando de verdade:
  troca de modelo com lista de effort mudando corretamente (inclusive GLM sem a opção "none", por
  ter reasoning obrigatório); persistência sobrevivendo a restart do backend e a fechar/reabrir o
  sheet sem reload; corpo da chamada ao OpenRouter (via log do backend, já que a chave do ambiente
  é falsa) mostrando o modelo e o effort corretos tanto no chat quanto numa mensagem de task
  semeada direto no banco; trace exibindo as duas pills; e os dois estados de erro da seção
  (carga e save) com retry funcionando, inclusive salvando o par que o usuário tentou depois de
  uma falha de save.
- 17 screenshots do roteiro, listados com legenda em
  `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r8-teste.md`.

## Commits (branch `feat/config-model-and-effort`, com push feito, sem PR)
- `8b94f08` — `feat(backend,mobile): adiciona configuracao de modelo e effort do agente Ben`
- `58c6981` — `docs: versiona a pasta da run que configura modelo e effort do agente Ben`

## Premissas assumidas (onde a task decidiu no lugar do usuário)
- Efforts por modelo vêm de tabela estática no backend (não de consulta em runtime ao OpenRouter).
- Sem preferência salva, o default é o comportamento de hoje: `openai/gpt-5.6-luna` no effort
  `medium`.
- Ao trocar de modelo, se o effort atual não existir no novo, cai no `default_effort` do novo
  modelo — mas se o effort atual **existir** no novo modelo, ele é mantido (por isso, ao trocar
  para GLM vindo de um effort `high` válido em ambos, o app manteve `high` em vez de forçar o
  `max` default do GLM; comportamento correto, e a única divergência que o teste encontrou foi a
  narração do roteiro esperando o contrário).
- O backend valida o par (modelo, effort) e rejeita combinação inválida.
- `retry()` depois de uma falha de save reenvia o par que o usuário tentou (`lastAttempt`), não o
  par antigo confirmado.
- Como não existe rota de criação de task nem chave real do OpenRouter no ambiente, a prova da
  metade "mensagem de task" e da chamada real ao modelo usou os caminhos substitutos que o próprio
  plano definiu (task semeada direto no SQLite, corpo da chamada lido do log do backend) — não é
  um teste com o provedor real, e o relatório do teste (`r8-teste.md`) deixa isso explícito.
- A pasta desta orquestração foi versionada no git (`git add -f`, commit `docs:` separado),
  seguindo o precedente das runs anteriores do repo.

## Fora do escopo (não tocado, de propósito)
Qualquer modelo além dos 3 listados, catálogo dinâmico do OpenRouter, transcrição/AssemblyAI, o
`geminiModel` morto em `models.ts`, i18n, e controle de temperature/topP.

## Cadeia de orquestração
O1 (opus): reconhecimento, gate com o usuário, 3 rodadas de plano/revisão (2 reprovações, 2
correções). O2 (sonnet, esta janela): revisão final das correções (r6, 1 reprovação com 2
bloqueantes reais introduzidos pela correção anterior), 1 correção final do planejador (sem
terceira revisão completa, por decisão registrada no handoff O1→O2), implementação (r7),
teste no browser (r8, sem necessidade de segunda volta), commit e push (r9).

Arquivos da run: `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/` (briefing, log,
handoff, planos, revisões, implementação, teste, este relatório).
