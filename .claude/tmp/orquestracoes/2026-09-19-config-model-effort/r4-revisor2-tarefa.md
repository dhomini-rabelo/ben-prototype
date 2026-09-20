# Tarefa — r4, revisor do plano v2 (opus, READ-ONLY)

Segunda rodada de revisão. O plano v1 foi reprovado por um revisor independente com 3 bloqueantes; o
planejador reescreveu. Você revisa a versão nova. **Você não tem interesse em aprovar.** Aprovar um plano
defeituoso custa uma rodada inteira de implementação errada; reprovar com motivo concreto custa uma rodada
de replanejamento. E o inverso também é verdade: reprovar por preferência pessoal de estilo, sem defeito
real, trava a cadeia de graça.

## Leia
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md` — o contrato. Manda sobre o plano.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r3-plano-v2.md` — o que você revisa (865 linhas). É autossuficiente: **não leia o r1-plano.md**, ele está morto.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r2-revisao.md` — a revisão da v1. A seção "O que verifiquei e está correto" já foi conferida contra o código por outro agente: **não refaça** esses pontos, a menos que a v2 os tenha mudado.
- O código real do repo `/root/so/repos/ben-prototype` (branch `feat/config-model-and-effort`) sempre que o
  plano afirmar algo sobre arquivo, assinatura, schema ou comportamento existente. **Confira, não acredite.**

## Skills obrigatórias
`code-get-coding-designs` e `code-get-project-context` para `project-backend` e `project-mobile`, com os
subarquivos que os SKILL.md referenciam. Divergência de padrão documentado, sem justificativa explícita no
plano, é achado.

## Foco desta rodada
1. **Os 3 bloqueantes da r2 foram realmente fechados?** (a) `smoke-sqlite.ts` e todos os outros criadores de
   `UserProps` cobertos, com o baseline `tsc --noEmit` EXIT=0 preservado nos dois projetos; (b) existe caminho
   de tipos `string` → slug/effort válidos que compila sem `as` nem predicate inventado pelo implementador;
   (c) os componentes de estado seguem `feature-state-components-structure.md`.
2. **A correção não quebrou outra coisa.** Mudança de contrato no meio do plano costuma deixar uma etapa
   posterior falando do tipo antigo. Cheque a coerência entre Etapas, Contratos e Plano de teste.
3. **Contrato do briefing**, de novo e por inteiro: os 6 itens da Definição de Pronto, as 4 respostas do
   usuário (persistência no backend por usuário **e** modelo/effort no input/output da mensagem; deepseek fixo
   em V4.1 Flash; só os efforts suportados por modelo; chat **e** mensagens de task), e nada de contrabando
   fora do escopo.
4. **Executabilidade por um sonnet**: etapa que exija decisão não tomada é achado.
5. **Plano de teste**: com a chave do OpenRouter sendo falsa (`fake-openrouter-key-…`, confirmado na r2), o
   roteiro prova mesmo o que diz provar? Dá para executá-lo lendo só o plano?

## Formato da entrega
Escreva em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r4-revisao-v2.md`:

```md
# Revisão do r3-plano-v2.md

## Veredito
APROVADO | REPROVADO
{uma linha de motivo}

## Bloqueantes
1. {o defeito, onde no plano, a evidência no código real (arquivo:linha), e o que precisa mudar}

## Não bloqueantes
- {melhoria que não impede a implementação}

## Os 3 bloqueantes da r2
- {um por um: fechado | não fechado, com evidência}
```

**REPROVADO se existir ao menos um bloqueante.** Bloqueante é o que faz a implementação sair errada,
incompleta, fora do contrato ou fora do padrão documentado do repo — não é discordância de estilo. Se
aprovar, `## Bloqueantes` recebe `nenhum`, e você está afirmando que um sonnet implementa esse plano sem
adivinhar nada.

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`: ambiguidade vira premissa assumida e documentada no arquivo.
- Não edite arquivo do projeto, não rode comando que muda estado, não implemente nada. `git log`/`git show` e
  ler `node_modules` são permitidos.
- Escreva o arquivo **antes** de retornar. Retorno de no máximo 10 linhas: caminho, veredito, bloqueantes em
  uma linha cada.
- **Teto**: ~140k de janela e 50 turns. Perto do teto, escreva o que tem e retorne.
