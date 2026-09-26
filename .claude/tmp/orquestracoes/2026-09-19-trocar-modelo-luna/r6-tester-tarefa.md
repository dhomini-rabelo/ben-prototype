# Tarefa — browser tester (rodada 6)

Você é um filho de uma orquestração no repo `/root/so/repos/ben-prototype`.
A mudança **já está aplicada** na árvore de trabalho, não commitada. Seu papel é **verificar**,
não implementar. **Não edite código do projeto.** O seu único `Write` é a sua entrega.

## Contexto mínimo
- Leia: `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r5-implementacao.md`
- A mudança é de uma linha: o agente Ben passou a usar, via OpenRouter, o modelo
  `openai/gpt-5.6-luna` no lugar de `openai/gpt-oss-120b`, em
  `project-backend/src/infra/services/ben-agent-provider/models.ts:15`.
- O que se quer provar: o chat do app continua funcionando de ponta a ponta e o Ben responde.

## O que tentar, nesta ordem
1. Subir o backend: `project-backend`, `npm run dev`. As dependências já foram instaladas.
2. Subir o app mobile em `localhost:8081` (Expo web), e abrir a tela de chat.
3. Enviar uma mensagem e confirmar que a resposta do Ben chega, sem erro no `POST /chat`.
4. Screenshot da conversa.

## O bloqueio que já é conhecido — leia antes de começar
Não existe `.env` em `project-backend`, só `.env.example`, e **não há `OPENROUTER_API_KEY`
nenhuma nesta máquina**. O `env.ts` valida com Zod e derruba o processo se faltar. É muito
provável que você não consiga passar do passo 1.

Diante disso:
- **Não invente chave**, não crie `.env` com valor falso, não desligue o `authMiddleware`, não
  crie rota sem auth, não faça mock do provider. Um teste que passa por contorno prova nada e é
  pior que nenhum teste.
- Se travar, **reporte o bloqueio com a mensagem de erro literal** e siga para a verificação
  degradada abaixo. Travar por falta de credencial é um resultado legítimo desta rodada.
- Não gaste a rodada tentando furar o bloqueio. Uma tentativa limpa por passo, e segue.

## Verificação degradada, se o caminho feliz não abrir
Prove o máximo que o ambiente permite, e diga com todas as letras onde a prova para:
- O app carrega em `localhost:8081`? Screenshot da tela que aparecer.
- O backend falha exatamente por validação de env (e não por erro introduzido pela mudança)?
  Mostre a mensagem.
- Confirme, lendo o arquivo, que a linha 15 de `models.ts` contém `openai/gpt-5.6-luna`.

## Regras
- Não sub-delegue: não chame a tool `Agent`.
- Não chame `AskUserQuestion`. Toda ambiguidade vira premissa assumida e documentada no seu arquivo.
- Não commite, não dê push.
- Não relate como verificado o que você não viu na tela. Distinga sempre "verificado",
  "bloqueado" e "não testado".
- Ao terminar, **derrube tudo que você subiu** e diga na entrega o que ficou de pé, se ficou.

## Entrega
Escreva em:
`/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r6-teste.md`
Comece com uma linha `RESULTADO: verificado | parcial | bloqueado`, depois o que você viu em cada
passo, os caminhos dos screenshots, e o erro literal de qualquer bloqueio.
Escreva o arquivo **antes** de retornar. Retorne no máximo 10 linhas.

## Teto de janela
Se chegar perto do limite, pare, escreva no arquivo o que verificou e o que ficou de pé no
ambiente, e retorne. Nunca termine sem ter escrito o arquivo.
