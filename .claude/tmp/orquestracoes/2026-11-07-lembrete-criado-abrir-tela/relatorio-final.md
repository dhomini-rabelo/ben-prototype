# Relatório final — tocar no card de lembrete no chat abre o detalhe dele; único/recorrente fica claro

## Veredito
O plano foi aprovado. Ele faz o card de lembrete inteiro responder ao toque no chat. O toque abre a lista de lembretes com o detalhe daquele lembrete aberto, e o voltar leva à conversa. Card, lista e detalhe passam a mostrar se o lembrete é único ou se repete ("Único", "Todo dia", "Dias úteis", "Seg, Qui").

## Cobertura
- 4/4 RT, 10/10 PR e 12/12 CB.
- Lanes: browser, teste e codigo.
- 3 checkpoints:
  1. domínio (`CaptureView` com `reminderKind` e `recurrence`);
  2. rótulo em en e pt-BR, na lista e no detalhe;
  3. card tocável, abertura do detalhe e voltar ao chat.
- Onda única.

## Comprovação
- São 63 provas: 47 prints na lane browser, 15 casos Vitest (T01 a T15) e 2 checagens de código (RT-003 e S41/AC-020).
- Ambiente: `pnpm dev` na raiz, com `BACKEND_URL=http://localhost:3333` no `.env.development` do app. A linha original é restaurada no fim e a troca nunca entra em commit.
- Nenhuma prova foi acrescentada nem dispensada. A S41 passou para a lane codigo, um desvio aprovado no gate 4.2.

## Fixtures e marcos
- Fixtures: o projeto não tem mecanismo para isso. O estado de partida é montado à mão, como descreve `## Preparo do estado das provas` em [plano.md](plano.md): JWT local, lembretes da Ana no `dev.db` e `page.route` para a matriz e as bordas.
- Marco 1: no fim do checkpoint 1 rodam T01 a T07, na lane teste.

## Arquivos que a implementação vai tocar
- Domínio, em `packages/domain/chat/src/application/`:
  - `types/capture-view.ts`;
  - `use-cases/captures/persist-captures.ts` e `resolve-capture.ts`;
  - `utils/reminders.ts`;
  - os testes `persist-captures.test.ts` e `resolve-capture.test.ts`, onde as comparações de formato exato ganham os campos novos.
- Mobile, em `packages/infra/mobile/ben/src/`:
  - `api/models/message.ts`;
  - `layout/stores/menu-store.ts`, com o teste T14;
  - `layout/strings/recurrence-strings.ts` e `layout/strings/format-time-strings.ts`;
  - `layout/utils/recurrence-label.ts`, com os testes T08 a T13;
  - `layout/components/menu-reminders/*` e `layout/components/menu-detail/reminder-detail.tsx`;
  - `pages/chat/components/capture-card/*` e `pages/chat/components/chat-history/{chat-capture-card,chat-history-item}.tsx`;
  - `pages/chat/hooks/use-open-reminder-from-chat.ts`;
  - `pages/chat/utils/capture-openable.ts`, com o teste T15.
- Remoção das pastas do protótipo desta run:
  - `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/`;
  - `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/`.

  As pastas irmãs são de outras runs e ficam.
- A lista exata, passo a passo, está em `## Passos` de [plano.md](plano.md).

## Decisões que ninguém contestou
- O rótulo é montado no app. O server manda só o tipo e a repetição crus. Sem esses campos (server antigo), o card mostra só o horário.
- Alarme é sempre "Único". Goal sem repetição, ou com a lista de dias vazia, também.
- Os dias seguem a ordem de segunda a domingo, com abreviações em tabela própria.
- Um segundo toque rápido no card é ignorado.
- Não há rota nova. Recarregar a página em `/menu` perde a marca "veio do chat".
- O card de uma conversa aberta não se atualiza sozinho depois de editar a repetição. Ele mostra o valor novo quando a conversa recarrega.
- S01 a S07 e S33 a S40 também rodam com o backend real e os dados da Ana.
- O T15 ganhou dois casos a mais: card de task e card de nota também não abrem o detalhe.
- As notas do revisor foram aplicadas depois do `aprovado`, sem nova revisão: [r9-ajuste-notas.md](r9-ajuste-notas.md).
- A galeria `packages/infra/mobile/design` fica de fora.
- A memória que diz "recorrente não é v1" está desatualizada. Atualizá-la fica com você (save-memory).

## Protótipo
A variação escolhida foi a V2: [prototipo/v2.png](prototipo/v2.png). A base está em `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v2*.tsx` e `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/`.

## Pasta da run
`.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/`

```text
/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/
```

Daqui em diante, a implementação roda sozinha até o fim, sem perguntas.

## Registros
- [log-planejamento.md](log-planejamento.md)
- [revisao-plano-1.md](revisao-plano-1.md)
- [roteiro.md](roteiro.md)
- [spec.md](spec.md)
