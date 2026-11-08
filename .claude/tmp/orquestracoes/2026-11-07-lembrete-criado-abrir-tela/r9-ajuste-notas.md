# r9 — ajuste das notas da revisão 1

1. Passo 4, parâmetro `itemId` sem uso: aplicada (passo 4 do plano.md, frase pedindo remover `itemId` de `resolveReminderView` e da chamada em `resolveCaptureView`).
2. "28 comparações" sem número: aplicada (Resumo, Checkpoint 1, "Testes do domínio"). O passo 6 (antigo l.76) já não trazia o número; nada a mudar ali.
3. "escurece" → "fica mais claro": aplicada (Resumo, Checkpoint 3, "Card inteiro tocável"). Mesma troca em "Como se prova", AC-007 (mesmo texto, mesmo erro).
4. Linhas do passo 12: aplicada (passo 12). Conferi `menu-reminders-list.tsx`: `capturedSupporting` está na l.48 e `doneSupporting` na l.74 (a nota dizia 49 e 75; usei o que o grep mostrou). `useLanguage()` na l.24 confirmado.
5. `pt-0.5` no passo 13: aplicada (passo 13, `flex-row items-center gap-1.5 pt-0.5`). Conferido em `variacao-2.tsx:82`.
6. Import por alias no passo 8: aplicada (`@/api/models/reminder`).
7. Contrato `kind: MessageCaptureKind`: aplicada (`## Contratos`, linha do domínio). Conferido em `capture-view.ts:1,4`. Não toquei `CaptureKind` do passo 16 e do contrato de `isCaptureOpenable`, que são tipos do app e não fazem parte da nota.
8. Passo 24, justificativa do `(infra)`: aplicada (rótulo do passo 24 ganhou "limpeza final exigida pela Base do protótipo; não é pré-requisito de outro passo").
9. Passo 21, alarme com `meta` nula sem pílula: não aplicada, a própria nota diz "só registro" e não pede edição; a spec não cobre o caso.

Premissa: onde a nota deu número de linha divergente do código, vale o número conferido no arquivo.
