# Revisão do plano — rodada 2 — logo antiga (balão âmbar nos ícones do app Ben)

## Veredito
corrigir

## Convenções carregadas
- Doc de contexto: `CLAUDE.md` (raiz). As docs `code-get-project-context/mobile/ben/*` foram lidas na rodada 1; não reli.
- `code-write-code`: `SKILL.md` (regra geral 2: "Write self-explanatory code instead of adding comments"), `coding-patterns/lint.md`, `coding-patterns/general-code-preferences.md`, `coding-patterns/frontend/component-variant-maps.md`, `coding-patterns/mobile/mobile-icon-colors.md`.
- `code-get-coding-designs`: `SKILL.md`, `designs/mobile-app-structure.md` (seções "Core and utils stay flat files" e "Renaming rules").
- Código conferido: `packages/infra/mobile/ben/src/layout/utils/colors.ts`, `packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx`, scripts `icons` e `dev` de `packages/infra/mobile/ben/package.json`.
- Não refiz os testes de `/tmp` da `## Parcial` da rodada 1. O topo do plano diz que o planejador já os conferiu: resvg instalado na raiz, o `mv` da PR-011 e o import `.mjs` → `.ts` → `.ts` no Node 24. Aceitei esse registro como premissa.

## Bloqueios
### 1. O passo 3 manda escrever um comentário novo no `colors.ts`: padrão
Onde: plano.md:54, passo 3 ("com um comentário de duas linhas no mesmo tom do de `onSurfaceVariantMuted`"). O Resumo repete a instrução em plano.md:22 ("as duas de silhueta ganham um comentário dizendo que não são tokens do tema").
Regra: `code-write-code/SKILL.md`, regra geral 2 ("Write self-explanatory code instead of adding comments"); `code-get-coding-designs/designs/mobile-app-structure.md:48` ("no comments, names carry the intent"); `code-write-code/coding-patterns/lint.md` ("No comments"). O ESLint só aplica `no-comments` ao backend (nota da rodada 1), então o lint não pega o comentário, mas o revisor de código pega. Os comentários que já existem em `colors.ts` são legado e não dão licença para código novo. O desvio não aparece em `## Desvios de padrão`.
Conserto: em plano.md:54, trocar "com um comentário de duas linhas no mesmo tom do de `onSurfaceVariantMuted` (cores de silhueta de ícone do Android, não tokens do tema)" por "sem comentário: os nomes `silhouetteThemed` e `silhouetteNotification` já dizem que são cores de silhueta". Em plano.md:22, apagar a frase "as duas de silhueta ganham um comentário dizendo que não são tokens do tema, como o `onSurfaceVariantMuted`". A outra saída é manter o comentário e declarar o desvio em `## Desvios de padrão` com um motivo que se sustente; não vejo motivo assim, porque o nome já carrega a intenção.

## Notas
- plano.md:68 (passo 6, máscara da silhueta): o plano manda pintar o `<rect>` da máscara de branco e as barras de preto, mas não diz como escrever as cores. Se o implementador usar `#ffffff`/`#000000`, a segunda busca do RT-004 (plano.md:155, `#[0-9a-fA-F]{6}` no `generate-icons.mjs`) reprova. A linha 21 já diz que "o script não declara hex nenhum", então dá para deduzir. Conserto em uma linha: escrever "`fill=\"white\"` e `fill=\"black\"` (nomes de cor do SVG, nunca hex)".
- plano.md:235 (Riscos): "se quebrar, o implementador decide como importar o hex" deixa uma decisão em aberto, mas para um caso que o resolver do Metro já descartou (conferido na rodada 1). Não bloqueia.
- plano.md:64 (passo 5): o exemplo de JSX mostra só o `viewBox`. O `ben-logo.tsx` de hoje também passa `width={size} height={size} fill="none"` e espalha `strokeProps` nos dois `Path`. O texto "o JSX fica com o mesmo resultado" cobre isso; vale citar os quatro atributos de forma explícita.

## Bloqueios da rodada anterior
1. `$TMPDIR` vazio quebra a CB-002: **corrigido**. Em plano.md:190-193, `RUN` aponta para a pasta da run e os dois arquivos de hash usam `"$RUN/icons-a.txt"`. As linhas 196 e 251 explicam a troca.
2. Dois afastamentos de skill fora de `## Desvios de padrão`: **corrigido**.
   - `mobile-icon-colors.md`: o desvio sumiu. Os hexes passaram para `colors.ts` (plano.md:54), e o módulo de geometria só os repassa (plano.md:63, "nenhum hex literal no módulo").
   - `component-variant-maps.md`: declarado em plano.md:230 com o motivo do RT-004. Aceito: o gerador em Node não pode ler o `.tsx`.
   - A citação do desvio do alias `@/` passou a apontar para `general-code-preferences.md` (plano.md:231), como pedia a nota da rodada 1.

## Novos nesta rodada
- Bloqueio 1 acima. Ele nasceu do conserto do bloqueio 2 da rodada 1: ao mover os hexes de silhueta para o `colors.ts`, o plano passou a mandar escrever um comentário junto deles.

## Spec em dúvida
nenhum

## Premissas
- As verificações da `## Parcial` da rodada 1 ficam valendo como o plano as registra (plano.md:3, 24, 53, 66, 144, 236): resvg só na raiz com `nodeLinker: hoisted`, o `mv` da PR-011 fazendo o import falhar com `saida=1`, e o import aninhado `.mjs` → `.ts` → `./colors.ts` carregando no Node 24. Não reexecutei, como mandou o orquestrador.
- Comentários antigos de `colors.ts` (linhas 1-5 e 22-23) não autorizam comentário novo. A regra das skills vale para o código que o plano manda escrever.
- Cobertura (5/5 RT, 9/9 PR, 7/7 CB), S01 a S17 e as seções obrigatórias foram conferidas na rodada 1. Revi só os trechos que mudaram: topo, Resumo, passos 2 a 6, RT-002, RT-005, Desvios de padrão, Riscos e Premissas.
