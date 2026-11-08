# r7-plano-c2 — volta de correção 2 do plano da logo antiga

## O que mudou no plano.md
- Bloqueio da revisão 2 (comentário no `colors.ts`): consertado. Passo 3 e o Resumo (Decisões) agora dizem "sem comentário", pelos nomes `silhouetteThemed` e `silhouetteNotification`. Busca por "comment/comentário" no plano: as demais ocorrências são proibições (passo 6, passo 10), nenhum outro trecho manda escrever comentário.
- Nota (a): máscara da silhueta com `fill="white"` e `fill="black"` (passo 6), com o motivo (RT-004 reprova `#rrggbb` no script).
- Nota (b): o risco do import `.ts` decide: se o bundle quebrar, o implementador não troca o import nem copia o hex; para, registra e devolve o checkpoint como falho. Reflete no Resumo.
- Nota (c): passo 5 cita `width={size}`, `height={size}`, `viewBox` com a constante, `fill="none"` e `strokeProps` (montagem idêntica à de hoje, conferida em `ben-logo.tsx`).
- Topo e Resumo atualizados. Testes em /tmp não refeitos, como mandado.

## Cobertura
5/5 RT · 9/9 PR · 7/7 CB, inalterada. Roteiro intacto: 17 provas entram, nenhuma acrescentada ou dispensada. Desvios de padrão: 3 (inalterados). Desvios da spec: nenhum.

## Premissa
Nenhum bloqueio recusado. A decisão da nota (b) (parar e reportar em vez de escolher caminho alternativo) é minha: as alternativas violariam o RT-004.
