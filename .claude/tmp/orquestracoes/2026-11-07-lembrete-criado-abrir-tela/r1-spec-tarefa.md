# Tarefa r1-spec — escrever a spec (Etapa 2 da skill decidir-especificar-e-planejar)

Pasta da run (P): /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/

## Leia
1. P/briefing.md (contrato: respostas do usuário, premissas)
2. P/decisao.md (veredito vai, aprovado; brief e menor versão)
3. P/r0-mobile.md e P/r0-backend.md (reconhecimento com caminho:linha; não refaça a investigação, só confira pontos específicos no código se precisar)
4. A skill: /home/fael/.claude/projects/-home-fael-so-repos-ben-prototype/d261e7e9-d397-4ebb-bd3c-2728604f5839/tool-results/bup7lxvhj.txt (cópia de .claude/skills/decidir-especificar-e-planejar/SKILL.md). Leia a seção "## Etapa 2 — especificar" inteira (linhas ~303-632): cabeçalho, [Specs], [Requisitos técnicos], [Casos de borda], [Prova], [Visual], o gate da Etapa 2 e "Design óbvio". Siga as regras de cada parte à risca.
5. Para o vocabulário e o design: .claude/skills/code-get-project-context/SKILL.md (só regras de tela/mobile) — idiomas en e pt-BR.

## Escreva
- P/spec.md — a spec completa, SEM o bloco `## Gate` (o gate é do usuário). Cubra exatamente a menor versão + respostas do briefing:
  - card de lembrete inteiro tocável no chat (qualquer card de lembrete do histórico) → tela de lembretes com o detalhe daquele lembrete aberto; fechar o detalhe deixa a lista; voltar da lista leva ao chat para quem veio do chat; quem abre o menu pelo caminho normal continua como hoje.
  - "Único" (alarme, ou goal sem repetição) vs padrão de repetição ("Todo dia", "Dias úteis"; en: decida) no card, na lista e no detalhe, mesmo vocabulário. Decida e marque (agente) o rótulo do conditional ("Quando acontecer"), se aplicável.
  - `Continua como hoje` obrigatória (o botão das tasks no card, o long press da bolha, a abertura normal do menu, o editor de recorrência etc.).
  - Bordas: lembrete concluído, lembrete que não existe mais, falha/sem conexão ao abrir o detalhe, mensagens antigas, só a primeira capture vira card, etc. — o que o usuário vê e o que faz em seguida.
  - [Prova]: vídeo/foto/teste conforme a regra; inclui a verificação de ponta a ponta (geral). O app roda no web (Expo, :8081) e há um agente de teste em navegador, então captura é possível.
  - [Visual]: decida se o design é óbvio ou não, pela regra "Design óbvio". Se não for óbvio, escreva [Visual] (Telas, Plataforma mobile 390x844, Destaque, Referências, Manter, Livre, Dados).
- P/r1-spec.md — curto, para o orquestrador montar o gate: (a) resumo da spec em até 10 linhas (ACs principais, n.º de RT/CB/PR); (b) perguntas da regra 7 de [Requisitos técnicos], se houver, com opções e a recomendada; (c) design óbvio (com o motivo de uma linha) OU recomendação sobre protótipo; (d) quebra em partes, se você a propõe (leia "A quebra em partes" na Etapa 4, linhas ~823-868 do arquivo da skill); (e) premissas (agente) mais arriscadas que o usuário deveria olhar.

## Regras
- Não edite nenhum arquivo do projeto; escreva só os dois arquivos acima.
- Não sub-delegue, não chame AskUserQuestion; toda ambiguidade vira premissa (agente) marcada na linha e documentada.
- Escreva os arquivos antes de retornar. Retorne no máximo 10 linhas: caminhos, veredito (ok|parcial|preso), contagem AC/RT/CB/PR, design óbvio ou não.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "lembrete-criado-abrir-tela-r1-spec"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em P/r1-spec.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
