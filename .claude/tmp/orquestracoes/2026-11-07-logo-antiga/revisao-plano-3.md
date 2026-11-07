# Revisão do plano — rodada 3 — logo antiga (balão âmbar nos ícones do app Ben)

## Veredito
aprovado

## Convenções carregadas
- Doc de contexto: `CLAUDE.md` (raiz). As docs `code-get-project-context/mobile/ben/*` foram lidas na rodada 1; não reli.
- `code-write-code`: `SKILL.md` (regra geral 2, "Write self-explanatory code instead of adding comments") e `coding-patterns/lint.md:7` ("No comments"). Os outros subarquivos que o plano toca (`general-code-preferences.md`, `frontend/component-variant-maps.md`, `mobile/mobile-icon-colors.md`) foram cobrados nas rodadas 1 e 2 e esses trechos do plano não mudaram.
- `code-get-coding-designs`: `SKILL.md`. O `designs/mobile-app-structure.md` foi lido na rodada 2.
- Código conferido: `packages/infra/mobile/ben/src/layout/utils/colors.ts` (o `surfaceLowest` está na linha 18 e o `onSurfaceVariantMuted` na linha 24, que é a última constante; os pontos de inserção do passo 3 existem).
- Não refiz os testes em `/tmp` das rodadas anteriores, como mandou o orquestrador.

## Bloqueios
nenhum

## Notas
nenhuma

## Bloqueios da rodada anterior
1. Comentário novo no `colors.ts` (padrão): **corrigido**. Em plano.md:58 (passo 3) agora está "sem comentário: os nomes `silhouetteThemed` e `silhouetteNotification` já dizem que são cores de silhueta", e plano.md:24 (Decisões) diz o mesmo. Busquei "coment/comment" no plano: o termo só aparece nas linhas 3 e 24 (o registro da correção) e nas linhas 58, 69 e 90, sempre como proibição. Nenhum passo manda escrever comentário.

Notas da rodada 2, todas aplicadas:
- (a) Máscara da silhueta: plano.md:72 escreve `<rect fill="white">` e as barras com `fill="black"`, "nomes de cor do SVG, nunca hex", e dá o motivo (a busca do RT-004 reprova `#rrggbb` no script).
- (b) Risco do import `.ts`: plano.md:27 e plano.md:239 agora decidem. Se o bundle quebrar, o implementador para, registra o erro e devolve o checkpoint como falho, sem trocar o import nem copiar o hex. Não sobra decisão para o implementador.
- (c) Passo 5: plano.md:68 cita `width={size}`, `height={size}`, `viewBox` com a constante, `fill="none"` e a montagem do `strokeProps`.

## Novos nesta rodada
Nenhum. Conferi o que as correções tocaram (linhas 3, 24, 27, 58, 68, 72 e 239). Nada contradiz outro trecho do plano:
- A decisão de "parar e reportar" bate com a premissa de commit por checkpoint (linha 254), porque o checkpoint falho não fecha ciclo.
- `fill="{cor}"` na camada de silhueta (linha 72) interpola `SILHOUETTE_COLORS` e não grava literal `#rrggbb` no script, então a segunda busca do RT-004 (linha 159) continua passando.

## Spec em dúvida
nenhum

## Premissas
- Continuam valendo as verificações das rodadas 1 e 2 como o plano as registra: resvg hoisted na raiz, o `mv` da PR-011, o import `.mjs` → `.ts` → `./colors.ts` no Node 24 e o Metro 0.83.3 aceitando o import com extensão. Não reexecutei nada.
- A cobertura (5/5 RT, 9/9 PR, 7/7 CB), S01 a S17 e as seções obrigatórias de `formats/plano.md` foram conferidas na rodada 1. O `r7-plano-c2.md` diz que a cobertura não mudou, e as seções `## Cobertura` e `## Roteiro` estão iguais às revistas na rodada 2.
