# O cartão do projeto (`projeto.md`)

O cartão diz os comandos, o layout e as convenções do repositório, para que nenhum prompt desta
skill precise saber o nome de um app, de um script ou de um pacote. Ele fica em
`{pasta-da-run}/projeto.md`, um por pasta de run (numa quebra, um por parte; numa onda `k > 1`,
o mesmo, sem sufixo).

Quem o escreve é o **reconhecimento**, como item 0 do trabalho dele, quando a pasta não tem
`projeto.md`. Quando tem, ele lê e não redescobre; numa onda `k > 1` só atualiza o campo que a
onda anterior mudou (um script novo, uma unidade nova, um mecanismo de fixtures novo) e diz isso
em uma linha do retorno. O nível 0 nunca abre este arquivo.

## Como levantar

É um levantamento barato, não uma auditoria: teto de dez chamadas de tool e nenhum arquivo de
código-fonte aberto por causa dele. Nesta ordem, parando em cada passo que já responde o campo:

1. a **doc de contexto da raiz**: `CLAUDE.md`, senão `AGENTS.md`, senão `README.md` (os dois
   primeiros, quando existirem os dois);
2. o **manifesto da raiz**, só o bloco de scripts/tasks e o de workspaces (`package.json`,
   `pnpm-workspace.yaml`, `Makefile`, `pyproject.toml`, `Cargo.toml`, `go.mod`, ...). Quando a doc
   e o manifesto divergem sobre o nome de um comando, manda o manifesto;
3. o **layout das unidades**: um `ls` nos diretórios que o manifesto declara como workspace; repo
   de um pacote só fecha o campo com `raiz`;
4. a **doc de contexto da unidade afetada**, e só dela;
5. `ls .claude/skills/` e, se existir, `ls .claude/agents/`;
6. um `ls` de convenção de teste e um de fixtures.

Campo que não fecha em duas tentativas vira `desconhecido`, e a run segue. O que o repo não tem
vira `nenhum`/`nenhuma`, que é valor legítimo, não achado.

## O template

```md
# Cartão do projeto — {repo}

docs de contexto: {caminho da doc da raiz} · {caminho da doc da unidade afetada, ou "nenhuma"}
unidades do projeto: {nome — uma linha do que é, por unidade; "raiz" quando não é monorepo}
unidade afetada: {a unidade que esta task encosta; "mais de uma" e a lista, quando cruza}
comando de teste: {o comando que roda a suíte; e a forma de rodar um arquivo só, se houver.
"nenhum" quando o projeto não tem suíte}
comando de verificação: {typecheck, lint, build — na ordem em que se roda. "nenhum" quando não há}
comando de ambiente: {o comando que sobe o ambiente onde uma prova de tela roda, e o endereço.
"nenhum" quando nada abre navegador}
pré-requisito de ambiente: {serviço que precisa estar de pé — banco, fila, storage — e o comando
que o sobe. "nenhum" quando não há}
mecanismo de fixtures: {o contrato de fabricação de estado de teste — o comando, o arquivo que o
descreve e onde ele mora. "nenhum" quando não há}
convenção de teste: {onde as suítes vivem e como se chamam. "n/a" quando não há suíte}
skills de contexto: {as skills de .claude/skills/ que se aplicam a esta unidade, e a skill de
implementação do projeto, se houver. "nenhuma" quando não há}
memória do projeto: {os índices de memória que existem, um por linha. "nenhuma" quando não há}
fluxo de dados persistentes: {o arquivo do schema e o comando de migração. "nenhum" quando não há}
convenções que o plano tem que respeitar: {no máximo três linhas, tiradas da doc de contexto —
as que um plano violaria sem saber}
```

## Como ele degrada

Nenhum destes casos para a run; cada um é um valor de campo com consequência declarada:

| O repo não tem | O cartão diz | Consequência |
|---|---|---|
| doc de contexto | `docs de contexto: nenhuma` | manifesto e layout viram a única fonte; o reconhecimento confia mais no `## Padrão da vizinhança` |
| monorepo | `unidades do projeto: raiz` | a unidade afetada é sempre `raiz`; o critério de dificuldade perde a metade "cruza unidades" |
| suíte de teste | `comando de teste: nenhum` | a lane `teste` fica indisponível: o requisito que pediria suíte cai em `curl` ou `codigo`, e `T0n` não existe no roteiro |
| linter/typecheck | `comando de verificação: nenhum` | a fronteira de checkpoint passa a ser "o lote é julgável sozinho e nada ficou pela metade" |
| ambiente que sobe (lib, CLI) | `comando de ambiente: nenhum` | a lane `browser` fica indisponível e o roteiro sai só com `T0n`, ou `n/a` |
| mecanismo de fixtures | `mecanismo de fixtures: nenhum` | o veredito de fixtures é `sem mecanismo`, a linha `estado` do roteiro diz `nenhum`, e a prova monta o estado no próprio passo |
| memória | `memória do projeto: nenhuma` | o item de memória do reconhecimento é dispensado sem comentário |
| fluxo de migração | `fluxo de dados persistentes: nenhum` | o passo de migração do planejador é dispensado com uma linha |
