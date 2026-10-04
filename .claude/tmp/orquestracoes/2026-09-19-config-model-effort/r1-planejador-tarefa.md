# Tarefa — r1, planejador (opus, READ-ONLY)

Você planeja uma feature de ponta a ponta. **Você não edita nenhum arquivo do projeto**: outro agente
implementa lendo o seu plano, e antes disso um revisor independente vai tentar reprovar o seu plano.

## Leia primeiro (caminhos absolutos)
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md` — o contrato da task. Manda sobre tudo.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r0-mobile-settings.md` — recon do app mobile.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r0-backend-model.md` — recon do backend.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/openrouter-models.json` — catálogo OpenRouter já baixado (grande: consulte com `python3`/`jq`, não leia inteiro).

Os dois recons já mapearam arquivos e convenções. Não refaça esse mapeamento: **confirme pontualmente**
no código real só o que o seu plano depende (assinaturas, schema do banco, formato do trace).

## Skills obrigatórias
Carregue `code-get-coding-designs` **e** `code-get-project-context` para `project-backend` e para
`project-mobile` (a task cruza os dois apps) e siga cada conjunto dentro do seu app. Leia os subarquivos
referenciados pelos SKILL.md — eles têm o padrão de pasta/arquivo que o plano precisa respeitar.
Para as decisões visuais do sheet de Settings (que componente, hierarquia, estados), siga os documentos
de design do repo (`.claude/agents-docs/` e o que a skill de designs apontar). Você não pode chamar
subagentes, então o julgamento de design é seu, fundamentado nesses documentos.

## O que o plano precisa resolver
1. **Persistência por usuário no backend**: onde mora o estado hoje (entidade `User`, repositório, banco
   real — descubra se é Prisma/Drizzle/in-memory antes de escrever a etapa), qual migração é necessária,
   e quais endpoints expõem ler/gravar a preferência. Siga o padrão de rota por operação do backend.
2. **Registro de modelos e efforts**: a tabela estática (slug, rótulo, efforts suportados, effort default)
   como fonte única da verdade no backend, e como o mobile a conhece (endpoint que devolve o catálogo vs.
   espelho manual em `src/api/models/` — decida e justifique; o repo hoje espelha à mão).
3. **Modelo/effort por request**: hoje `BenAgentProviderService` recebe o `LanguageModel` no construtor e
   é instanciado module-scope em `routes/chat.ts` e `routes/tasks/create-task-message.ts`. Defina a nova
   forma (fábrica por request? parâmetro do método? porta `AgentService` alterada?) respeitando o design
   de adapters/services do backend, e cubra as duas rotas.
4. **O descasamento de tipos do effort `max`** descrito no briefing. Aponte a solução concreta, com o
   trecho de tipo que a justifica.
5. **Trace de input/output**: o usuário pediu explicitamente que modelo e effort apareçam na estrutura de
   input/output da mensagem. `AgentCallTrace`/`AgentCallStep` já carregam `modelId`. Defina o que falta
   (effort no trace, presenter, espelho do type no mobile, exibição no `message-trace-sheet`).
6. **UI do sheet de Settings**: seções novas, componente de cada controle (existe `SegmentedControl` em
   `src/layout/components/ui/`), comportamento ao trocar de modelo (effort inválido cai no default do novo),
   estados de loading/erro/salvando, e o risco de altura do sheet levantado no recon. Mantenha a separação
   container (`settings-view.tsx`) × apresentacional (`settings-sheet.tsx`).
7. **Ordem de execução**: etapas numeradas, cada uma com os arquivos que ela cria/edita (caminho absoluto)
   e o que ela deixa funcionando. O implementador é um sonnet que **não vai reprojetar nada** — se uma
   etapa depender de uma decisão que você não tomou, ela vira uma adivinhação dele.
8. **Como provar cada parte**: o que o browser-tester (Playwright, app na porta 8081, viewport de celular)
   vai clicar e ver para provar os itens 1 a 4 da Definição de Pronto. Inclua como subir backend e app, e
   o que fazer se faltar `OPENROUTER_API_KEY` no ambiente (o recon anterior indica que falta).

## Formato da entrega
Escreva em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r1-plano.md`:

- `## Decisões` — cada decisão de arquitetura com uma linha de porquê e a alternativa descartada.
- `## Etapas` — numeradas, na ordem de execução, com arquivos (caminho absoluto) e critério de pronto de cada uma.
- `## Contratos` — assinaturas/tipos/schemas novos, escritos como código, backend e mobile.
- `## Riscos e contingências` — o que pode quebrar e o que fazer nesse caso.
- `## Plano de teste` — passo a passo do browser-tester e os comandos de lint/tsc.
- `## Premissas` — toda ambiguidade que você travou sozinho.

## Regras
- Não sub-delegue (você não dispara subagentes). Não chame `AskUserQuestion`: toda ambiguidade vira
  premissa assumida e documentada no seu arquivo.
- Não edite arquivo do projeto, não rode comando que muda estado (sem `git`, sem instalar nada, sem migração).
- Escreva o arquivo **antes** de retornar. O retorno para o orquestrador tem no máximo 10 linhas:
  caminho do arquivo, veredito, e os pontos em que você mais espera resistência do revisor.
- **Teto de janela**: trabalhe dentro de ~140k tokens de contexto e no máximo 50 turns. Se chegar perto,
  escreva o que já tem e retorne dizendo o que ficou incompleto.
