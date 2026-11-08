# r4 — proto-base

## Apagado
- packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v1.tsx, v1-2.tsx, v1-3.tsx
- packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v3.tsx, v3-2.tsx, v3-3.tsx
- packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/variacao-1.tsx
- packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/variacao-3.tsx
- Em parts.tsx: removido o componente RepeatPill (só a V1 usava) e o import de Repeat/onSurfaceVariant; useCardTime deixou de ser exportado (só CardTimePill o usa).

## Mantido
- packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v2.tsx, v2-2.tsx, v2-3.tsx
- packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/variacao-2.tsx
- packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/shared.tsx (sem alteração; seus exports são usados por ChatPage/ListPage/DetailPage da V2)
- packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/parts.tsx (TappableCard, CardTimePill, KindPill, useConditionalLabel, DetailMeta)

## Verificação
- typecheck (pnpm --filter @ben/mobile-ben typecheck): passou.
- eslint nas duas pastas da feature: passou, sem avisos.
- git status --short: app/prototipo/ e src/prototipo/ (pasta inteira, não rastreadas; inclui protótipos de outras runs, não tocados).
- Nenhum arquivo fora das duas pastas referencia V1/V3 (grep por lembrete-criado-abrir-tela em packages/).

## Premissas
- Mantive shared.tsx inteiro: não achei export exclusivo de V1/V3 (eslint e tsc limpos).
- Incidente: rodei por engano `git rm --cached -r .` em packages/infra/mobile/ben ao apagar; desfiz com `git reset -q -- packages/infra/mobile/ben`. O índice voltou ao estado inicial (git status igual ao do começo) e a árvore de trabalho não foi afetada.
- Sem commit, conforme a tarefa (a pasta continua não rastreada).
