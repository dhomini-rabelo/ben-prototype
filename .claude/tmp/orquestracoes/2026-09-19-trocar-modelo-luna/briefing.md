# Briefing — trocar o modelo do agente Ben para gpt-5.6-luna, mantendo o OpenRouter

## O pedido
"troque o modelo para

https://developers.openai.com/api/docs/models/gpt-5.6-luna

faça um loop agente opus planeja -> pedi p outro agente opus revisar logica e padrao de codigos, sem ser tendecioso a aprovar (se recusar, volta ao planejador) -> depois outro agente sonnet implementa -> depois um sonnet browser tester testa - no final commit e push // não overdo the task, a task é bem simples"

## Perguntas e respostas
- "Hoje o agente Ben usa OpenRouter com o modelo `openai/gpt-oss-120b` (models.ts:15). Como você quer rodar o gpt-5.6-luna?": "Seguir no OpenRouter, id `openai/gpt-5.6-luna` (recomendada)"

## Estado de partida (rodada 0 de reconhecimento)
- Entrega do recon de código: `.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r0-recon-codigo.md`
- Entrega do recon da doc do modelo: `.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r0-recon-doc.md`
- Resumo de uma linha: o único model id vivo do repo está em
  `project-backend/src/infra/services/ben-agent-provider/models.ts:15`, dentro de
  `openrouter('openai/gpt-oss-120b', { extraBody: { provider: { sort, ignore, require_parameters } } })`.

## Definição de pronto
1. O agente Ben chama `openai/gpt-5.6-luna` via OpenRouter — nenhum `gpt-oss-120b` restante no repo.
2. `cd project-backend && npm run lint:fix` sem erro e `npx tsc --noEmit` limpo.
3. Um plano aprovado por um revisor independente (opus) antes de qualquer edição.
4. Verificação no browser: o app mobile em `localhost:8081` conversa com o backend e o agente responde.
5. Commit e push na branch atual `feat/update-model-and-add-logs`.

## Fora do escopo
- Não adicionar logs, telemetria, nem o nome do modelo em log — apesar do nome da branch.
  O usuário pediu só a troca do modelo e disse explicitamente para não inflar a task.
- Não migrar para o provider OpenAI direto, não criar `OPENAI_API_KEY`.
- Não remover nem mexer no `geminiModel` (código morto), não criar testes automatizados,
  não transformar o model id em variável de ambiente.
- Não abrir PR.

## Autorizações
- Commit e push na branch `feat/update-model-and-add-logs`, pedidos explicitamente pelo usuário.
  Quem executa é um filho, não o orquestrador. Nenhuma outra ação externa está liberada.

## Premissas
- Manter o bloco `extraBody.provider` do OpenRouter como está (`sort: 'throughput'`,
  `ignore: ['cerebras']`, `require_parameters: true`): são preferências de roteamento, e mexer
  nelas é escopo que o usuário não pediu. Se o revisor apontar que `ignore: ['cerebras']` só fazia
  sentido para o gpt-oss, a decisão fica registrada no arquivo da rodada, não vira mudança calada.
- Não passar `reasoning_effort` nem qualquer parâmetro de geração novo: hoje o código não passa
  nenhum, e o default do modelo é `medium`.
- O loop de revisão tem teto de 2 rodadas. Se o revisor recusar duas vezes, o orquestrador decide
  e registra a decisão como premissa.
