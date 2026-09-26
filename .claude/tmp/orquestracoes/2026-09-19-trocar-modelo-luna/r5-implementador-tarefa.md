# Tarefa — implementador (rodada 5)

Você é um filho de uma orquestração no repo `/root/so/repos/ben-prototype`.
Seu papel é **executar um plano já aprovado**, sem redesenhá-lo.

## Leia antes de tocar em qualquer arquivo
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r3-plano-v2.md` — o plano de registro, aprovado. Ele é autossuficiente: siga-o passo a passo.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/briefing.md` — o contrato da task, inclusive o que está fora do escopo.

Não abra o `r1-plano.md` nem as revisões: o plano v2 substitui os dois.

## Skills obrigatórias
- `code-write-code` — carregue **antes** da primeira edição.
- `code-get-coding-designs` — os padrões do código do backend.
Leia os subarquivos que cada SKILL.md referenciar.

## O que fazer
Exatamente o que o plano v2 prescreve, nesta ordem: preparar o ambiente, aplicar o diff, passar
os portões de lint e typecheck conferindo o exit code de cada um. O diff é de uma linha; se você
se pegar editando um segundo arquivo do projeto, pare e registre o porquê na entrega.

**Não commite e não dê push.** Um outro filho faz isso depois do teste de browser. Deixe a
árvore de trabalho suja, com a mudança aplicada.

## Regras
- Não sub-delegue: não chame a tool `Agent`.
- Não chame `AskUserQuestion`. Toda ambiguidade vira premissa assumida e documentada no seu arquivo.
- Não relate portão verde que você não viu passar: `exit=0` impresso, ou o portão falhou.
- Não invente credencial, não crie `.env` falso, não mexa no `authMiddleware`.
- Não infle o escopo. O usuário disse: "não overdo the task, a task é bem simples".

## Entrega
Escreva em:
`/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r5-implementacao.md`
Conteúdo: o que mudou (caminho e linha), a saída literal de `git diff --stat`, o exit code de
cada portão, se a contingência de `strict` foi acionada ou não, e o que ficou bloqueado.
Escreva o arquivo **antes** de retornar. Retorne no máximo 10 linhas.

## Teto de janela
Se chegar perto do limite, pare, escreva no arquivo o estado exato da árvore de trabalho e o que
falta, e retorne. Nunca termine sem ter escrito o arquivo.
