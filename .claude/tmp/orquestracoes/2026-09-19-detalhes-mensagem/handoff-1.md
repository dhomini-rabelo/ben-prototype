# Handoff O1 → O2

Briefing: .claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md
Ledger: .claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/log.md

O planejamento acabou e passou pela revisão. **O que falta é execução pura**: implementar, testar no
browser e commitar. Não replaneje, não reabra design, não peça nada ao usuário.

## Próxima rodada

Dispare **um filho `sonnet`**, `description: r8-implementacao`, agente `general-purpose`, com esta ordem de serviço:

> Implemente a feature seguindo o plano, passo a passo, sem improvisar.
> Leia nesta ordem: `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md`, `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r2-plano.md` (o plano, 40 passos, já corrigido nas rodadas 2 e 3 — as seções "Correções da revisão" no fim dele fazem parte do plano), `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r1-design.md` (o design, fechado).
> Carregue, pela tool `Skill`: `code-get-coding-designs` e `code-write-code`, antes de editar.
> Execute os 40 passos na ordem. Cada passo traz como verificar que funcionou — verifique.
> Onde o plano for ambíguo, siga o precedente do repo e registre a decisão; **não invente um jeito novo tendo um precedente**.
> Ao terminar, rode nos dois projetos: `cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix && npx tsc --noEmit` e `cd /root/so/repos/ben-prototype/project-mobile && npm run lint:fix && npx tsc --noEmit`. Os quatro têm que passar; conserte o que quebrar.
> Não commite e não faça push. Não crie arquivo `.md` de documentação no projeto.
> Escreva a entrega em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r8-implementacao.md`: passos feitos, passos pulados e por quê, arquivos criados/alterados com caminho absoluto, saída dos quatro comandos, e o que ficou de fora.
> Não sub-delegue (não use a tool `Agent`). Não chame `AskUserQuestion`: ambiguidade vira premissa assumida e documentada.
> Teto de janela: rode `bash /root/so/repos/ben-prototype/.claude/skills/sem-nivel-0/scripts/medir-janela.sh "r8-implementacao"` a cada ~15 turns; em `status=handoff` ou `preso`, pare, escreva o arquivo com o estado real e retorne.
> Retorne no máximo 10 linhas.

Se ele voltar sem terminar os 40 passos, dispare um segundo `sonnet` que continua de onde parou lendo
o `r8-implementacao.md` e o plano. Não recomece do zero.

## Pendências, em ordem

1. **Implementar** os 40 passos do `r2-plano.md` (rodada acima).
2. **Testar no browser.** Filho `sonnet`, agente `browser-mobile-tester`, `description: r9-teste`.
   Ele lê `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r4-ambiente.md` (como entrar no app: o app já está no ar na 8081, e o arquivo traz o
   one-liner `localStorage.setItem('ben.jwttoken', TOKEN); location.reload()` e o comando de seed),
   `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md` (a definição de pronto, itens 1 a 4) e a §A e §B do `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r1-design.md` (como
   deve parecer). Viewport 390x844. Ele prova, com screenshot: long-press numa mensagem do bot abre o
   menu com os dois itens; cada item abre o sheet; o sheet mostra os dados e dá para navegar;
   long-press na mensagem do usuário **não** abre menu. Entrega em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r9-teste.md` com o caminho
   dos screenshots e um veredito por item. Se achar bug, descreve o bug, não conserta.
3. **Consertar o que o teste achar**, se achar: um `sonnet` que lê `r9-teste.md` e o plano, conserta,
   roda lint e tsc de novo. Depois o `r9-teste` reconfere só o que quebrou.
4. **Commit e push.** Filho `sonnet`, `description: r10-commit`. Ordem de serviço:
   - Branch `feat/update-model-and-add-logs`. **Nunca a `main`**: há CI que faz deploy na VPS a cada push na main.
   - Rode `git status` antes. Commite **só** os arquivos da feature. **Não** commite `.env` de nenhum projeto,
     nem o banco sqlite, nem nada de `.claude/tmp/` (que é gitignored). Se um `.env` aparecer como não rastreado, confirme que o `.gitignore` o cobre.
   - Mensagem de commit em português, no padrão do repo (veja `git log --oneline -5`), terminando com estas duas linhas exatas:

     Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
     Claude-Session: https://claude.ai/code/session_013HgDnz5GjgrHB8BFWeK6Pf
   - Entrega em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r10-commit.md`: hash, branch, arquivos no commit, saída do push.
5. **Relatório final** em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/relatorio-final.md`, no formato de `.claude/skills/sem-nivel-0/formats/arquivos-da-run.md`, e `bloco: fim`.

## Já fechado

- r0 reconhecimento (3 filhos): `r0-mobile-chat.md`, `r0-backend-dados.md`, `r0-design-memoria.md`. O achado que definiu a task: o backend **não guardava** nada do input/output do modelo.
- Gate com o usuário: 4 perguntas, todas respondidas. Estão no `briefing.md`.
- r1 design (opus): `r1-design.md`. Sheet único com abas Input/Output, não dois sheets.
- r2 plano (opus): `r2-plano.md`, 40 passos.
- r3 revisão (opus): `r3-review.md`. RECUSADO, 3 bloqueantes.
- r5 correção (opus): `r5-plano-v2.md`. Os 3 fecharam; a captura passou a usar `result.steps` + `prepareStep`.
- r6 revisão 2 (opus): `r6-review-v2.md`. RECUSADO, 1 bloqueante de uma linha, provado com `tsc`.
- r7 correção (sonnet): `r7-plano-v3.md`. O bloqueante e 5 dos 6 não bloqueantes aplicados no `r2-plano.md`.
- r4 ambiente (sonnet): `r4-ambiente.md`. O app está no ar.

## Armadilhas

- **Não dispare outra rodada de revisão do plano.** Ele passou por duas, e a segunda deixou só um
  achado de uma linha, já aplicado. Uma terceira é a cadeia girando em falso.
- O `r2-plano.md` é a **única** fonte do implementador. `r5-plano-v2.md` e `r7-plano-v3.md` são
  changelogs da revisão, não planos. Não mande o implementador executar por eles.
- O aviso do planejador de que "falta `.env` e o item 6 está bloqueado" **está vencido**: o r4 montou o
  ambiente depois disso. Ignore.
- A definição de agente `browser-mobile-tester` tem caminhos de outra máquina (`/home/fael`, `T-GAMER`).
  Aqui o repo é `/root/so/repos/ben-prototype`. Mande o tester salvar screenshot em caminho desta máquina
  e reportar o caminho real; se o save falhar, que descreva o que viu em texto em vez de travar.
- Duas working dirs, `/root/so/repos/ben-prototype` e `/home/dev/so/repos/ben-prototype`, são **o mesmo
  repo** por symlink. Use sempre a primeira para não confundir os filhos.

## Premissas

- Commit e push na branch `feat/update-model-and-add-logs`, nunca na `main`: push na main dispara deploy na VPS.
- "Modal" do pedido = bottom sheet quase full-screen, confirmado pelo usuário no gate.
- Mensagens antigas ficam sem trace: estado vazio explícito, sem backfill.
- O repo não tinha `.env`, banco nem servidor no ar. Em vez de pedir segredos, montei ambiente local com
  credenciais fictícias e uma mensagem de bot semeada no sqlite. Nenhuma chave real, nenhuma chamada externa.
  Sem chave de LLM não há resposta real do modelo: o teste usa a mensagem semeada.
- A correção do bloqueante da rodada 2 foi aplicada por um `sonnet`, não pelo planejador `opus`, e não
  houve terceira revisão. O achado era uma linha (`return undefined`), com remédio escrito e já
  recompilado pelo próprio revisor. Um desvio consciente do loop que o usuário desenhou, para não pagar
  duas rodadas `opus` por uma linha.

## Estado do mundo

- **Backend no ar** em `http://localhost:3333` (`npm run dev` em `project-backend`, em background).
- **Expo web no ar** em `http://localhost:8081`, é o alvo do browser tester.
- `project-backend/.env` e `project-mobile/.env` **criados por esta run**, com valores fictícios. Não vão para o commit.
- Banco sqlite local criado e semeado: existe um usuário e uma mensagem de bot. Script de seed em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/`, fora dos projetos.
- Nenhum arquivo de `src/` foi alterado ainda. `git status` estava limpo no início da run.
- Branch atual: `feat/update-model-and-add-logs`. Nada commitado por esta run.
- Como verificar tudo de uma vez: `curl -s -o /dev/null -w '%{http_code}' http://localhost:8081`.

## Janela

janela=110926 teto=140000 pct=79 turns=42 teto_turns=50 taxa=1414 proj=146276 proxima=67 status=handoff fonte=exato desc="orq-detalhes-mensagem-o1"
