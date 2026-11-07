# Planejar a mudança do header e do footer do chat Ben

## Veredito
Entregue. Você aprovou o plano.

O plano centraliza no topo do chat a logo com "Ben | {data}" e leva o menu para o footer, à esquerda do campo. O menu passa a abrir em sheet com as 4 opções atuais. O plano também troca o campo e a gravação de voz pelo desenho V4, na galeria (`@ben/mobile-design`), no app (`@ben/mobile-ben`) e em `ux-philosophy.md`. Nenhum código de produto foi implementado nesta run.

## O que mudou
Só planejamento. Os arquivos ficam em `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/`:
- [decisao.md](decisao.md) e [spec.md](spec.md) (19 AC, 12 CB, 7 RT, 11 PR, parte única)
- [prototipo.md](prototipo.md): a variação escolhida foi a V4, com o print em [prototipo/v4.png](prototipo/v4.png). A base fica em `packages/infra/mobile/ben/app/prototipo/header-menu-footer/v4.tsx` e `packages/infra/mobile/ben/src/prototipo/header-menu-footer/shared.tsx`, sem commit. O plano manda apagar essa base no checkpoint 4.
- [projeto.md](projeto.md) e [reconhecimento.md](reconhecimento.md)
- [roteiro.md](roteiro.md): 55 screenshots, S01 a S55. Você aprovou como veio.
- [plano.md](plano.md): 27 passos em 4 checkpoints, mais o passo E1, que monta o estado das provas. O resumo está em [gate-plano.md](gate-plano.md).
- As três rodadas de revisão do plano: [revisao-plano-1.md](revisao-plano-1.md), [revisao-plano-2.md](revisao-plano-2.md) e [revisao-plano-3.md](revisao-plano-3.md).

Os arquivos que a implementação vai tocar:
- Em `packages/infra/mobile/ben/src/`: `chat-input/*`, `recording-bar.tsx`, `wave-bar.tsx`, `draggable-sheet-overlay.tsx` (novo), `menu/menu-sheet.tsx`, `pages/chat/{page.tsx, chat-footer, chat-top-bar, chat-menu-button, chat-menu-sheet}`, `pages/menu/page.tsx`, `workspace-footer.tsx` e as strings do menu e da gravação.
- Em `packages/infra/mobile/design/src/`: `centered-top-bar.tsx` (novo), `chat-shell`, `settings-shell`, `chat-input`, `recording-bar`, as páginas `chat-menu-open` (nova), `chat-recording` e `workspace-*`, e `routes.tsx`/`screens.ts`. Saem os estados `menu-sidebar-*` e o `menu-shell`.
- A doc `ux-philosophy.md`.

## Como foi provado
O plano cobre 7/7 RT, 11/11 PR e 12/12 CB, sem desvio da spec. As lanes são `browser` e `codigo`.

A implementação vai produzir 55 screenshots e nenhum caso de suíte. Os marcos de validação ficam no checkpoint 2 (S01–S03, S21, S24–S27, S42–S44) e no checkpoint 3 (S04–S18). Nenhuma prova foi acrescentada ou dispensada.

Comandos que a implementação vai rodar:
- Ambiente: `PERSISTENCE_DRIVER=sqlite pnpm dev` (server :3333 + Expo :8081) e `pnpm dev:design` (:3002).
- Estado: `NODE_ENV=development PERSISTENCE_DRIVER=sqlite pnpm --filter @ben/server-ben exec tsx .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/estado/montar-estado.ts`.

O projeto não tem mecanismo de fixtures.

O revisor (opus) aprovou o plano na rodada 3, depois de duas voltas ao planejador. Ele aceitou 3 desvios de padrão:
- estilo por `style` no `Animated.View`;
- `text-[13px]` e `text-[15px]`;
- uma peça de sheet nova, que convive com a cópia do task-picker.

## Premissas assumidas
- Para sessão e dados das provas, você escolheu o modo misto: backend real no caminho feliz e interceptação Playwright nas bordas. O plano aplica isso assim: dois usuários reais no `dev.db`, um deles vazio. Só S19 usa interceptação, e S37 usa `setOffline`.
- Os botões têm 32px visuais e `hitSlop` até 44px, para cumprir o RT-006.
- O voltar do aparelho (CB-003) é provado com Escape, e o teclado (CB-005 e CB-006) com o campo focado no web.
- Com o campo de várias linhas, o Enter passa a quebrar linha e só o botão envia.
- A gravação perde o gesto de deslizar para cancelar; cancelar fica só no X da V4.
- Settings abre sobre o próprio chat. Tasks, Notes e Reminders abrem direto e voltam ao chat.
- No checkpoint 2, o botão do menu já fica no footer, mas abre o menu de tela cheia de hoje até o sheet chegar, no checkpoint 3.
- As premissas do `briefing.md` continuam valendo: o separador "|", o topo centralizado nas 3 telas da galeria e a atualização de `ux-philosophy.md`.

## O que ficou de fora
- Migrar a seleção de tarefa para a peça de sheet nova.
- Atualizar as docs de `code-get-project-context` que ainda citam o menu lateral. Isso é da `task-update-project-context`.
- Provar o voltar físico do Android e o teclado virtual real, que só dá para ver no aparelho.

## A cadeia
Foram 2 orquestradores, O1 e O2, e 14 rodadas de filhos, r0 a r13. Dois filhos bateram no teto de janela e tiveram continuação. A pasta da run é `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/`.

Para implementar, rode:

```text
/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/
```

Dali em diante, a implementação roda sozinha até o fim, sem fazer perguntas.
