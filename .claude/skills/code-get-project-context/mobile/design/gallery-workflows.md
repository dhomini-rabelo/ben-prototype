# Design Gallery: fluxos de trabalho

Valem para o [sandbox de design](./description.md) (`packages/infra/mobile/design`). Uma "tela" do Ben é uma *página* com um ou mais *estados* (vazio, carregando, populado, gravando, erro...). Cada estado é uma pasta e uma rota próprias, para ser visto sozinho na galeria. A estrutura de pastas está em [project-structure.md](./project-structure.md).

## Restrições de layout da galeria

- **Mire a viewport de 390x844** (classe iPhone 14). Evite `min-height` fixo acima de 844px: causa scroll no iframe da galeria.
- **Páginas com chat ancoram ao composer por uma classe fixa.** Toda página renderizada dentro de [`chat-shell.tsx`](../../../../../packages/infra/mobile/design/src/layout/components/common/chat-shell.tsx) (os estados `chat-*` e `capture-*`, exceto o `chat-empty` centralizado) envolve a `<section>` das mensagens em `flex flex-1 flex-col justify-end gap-4 pt-2`.

## Adicionar um estado de tela

1. Crie `packages/infra/mobile/design/src/pages/<page>-<state>/page.tsx` exportando um componente React nomeado em PascalCase (ex.: `ChatRecordingPage`). A rota espelha o nome: `/app/<page>-<state>`.
2. Registre a página com `lazy` e a `<Route path="/app/<page>-<state>">` em [`core/routes.tsx`](../../../../../packages/infra/mobile/design/src/core/routes.tsx).
3. Adicione ao `PAGES` de [`core/screens.ts`](../../../../../packages/infra/mobile/design/src/core/screens.ts):
   - Página já existe: inclua no array `states` `{ id: "<state>", title: "<State>", file: "/app/<page>-<state>" }`.
   - Página nova: crie um `ScreenPage` `{ id, title, states: [...] }`.
4. A galeria pega sozinha: uma seção por página, um card por estado.

## Adicionar um componente reutilizável

Primitivas ficam **sempre separadas** das telas: pasta própria, rota de preview própria, card próprio na aba Components. Extraia a primitiva e registre, em vez de deixá-la inline na tela.

1. Crie a primitiva em `packages/infra/mobile/design/src/layout/components/ui/<nome>.tsx` (uma por arquivo). Composições compartilhadas vão em `layout/components/common/`.
2. Componha classes com `cn()` de [`layout/utils/styles.ts`](../../../../../packages/infra/mobile/design/src/layout/utils/styles.ts), importado como `@/layout/utils/styles`, apoiando-se nos tokens do tema.
3. **Atualize a página Components**, que é a visão geral do design system:
   - Crie `pages/<nome>-preview/page.tsx` com as variantes relevantes (padrão, com ícone, desabilitado, largura total) usando o [`PreviewShell`](../../../../../packages/infra/mobile/design/src/layout/components/common/preview-shell.tsx). Cubra o que quem escaneia a galeria precisa entender, não cada prop.
   - Registre a rota `/components/<nome>` em `core/routes.tsx`.
   - Adicione ao `COMPONENTS` de `core/screens.ts`: `{ id: "<nome>", title: "<DisplayName>", file: "/components/<nome>" }`.
4. Se criou um token novo (cor, tamanho de fonte, espaçamento, raio), atualize `pages/design-tokens/page.tsx` para a visão geral refletir.
