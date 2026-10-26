# Regras de design das telas Ben

Valem para toda tela do Ben, no [sandbox de design](./description.md) e no [app Ben](../ben/description.md).

- **Use tokens do tema em vez de valores arbitrários** quando o token existe. Tokens de tamanho de fonte: `wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`. Moram em [`global.css`](../../../../../packages/infra/mobile/design/src/core/global.css) (design) e em [`typography.tsx`](../../../../../packages/infra/mobile/ben/src/layout/components/ui/typography.tsx) + [`tailwind.config.js`](../../../../../packages/infra/mobile/ben/tailwind.config.js) (app).
- **Primitivas reutilizáveis ficam genéricas.** Sem `w-full`, `max-w-*` nem espaçamento específico de página embutidos. Aplique isso no ponto de uso via `className`.
- **Ancore as mensagens do chat ao composer.** Mensagens e cards de captura ficam logo acima do input do chat, não flutuando no topo da viewport. Um vão alto entre o último balão e o microfone parece ar morto, principalmente em trocas curtas como capturas inline.
- **Posição do `ActiveTaskPeek`.**
  - **Renderize só quando há tarefas ativas.** Não existe variante "vazia" em nenhuma tela: com zero tarefas em andamento o peek some. Ele existe para mostrar trabalho real, não para divulgar o conceito.
  - **No sandbox, mantenha no fim da pilha do rodapé** (`ChatShell` renderiza o `peek` acima do composer). Nunca acima de um balão de mensagem, de um `ChatBanner` (permissão negada, erro) ou de qualquer aviso inline. Na prática: uma tela com banner acima do input não renderiza peek. O peek só aparece nos estados limpos, em que a única coisa acima do input é o próprio peek.
  - **No app Ben o peek fica no cabeçalho.** `ActiveTaskPicker` o renderiza logo abaixo da top bar, antes do `ChatTopBanner`, e ele continua só existindo quando há tarefas ativas.

Antes de qualquer decisão visual, de UX ou de copy, abra os documentos fonte da verdade listados no [SKILL.md](../../SKILL.md#documentos-fonte-da-verdade).
