# Design (sandbox): descrição

**Pacote:** `@ben/mobile-design`, em `packages/infra/mobile/design`.

## Propósito

Sandbox de fidelidade para desenhar e revisar toda tela do Ben. Cada estado de tela é uma rota React real: pode ser aberto, escalado dentro de um iframe em formato de celular na galeria e iterado sem sair do workspace.

O app é Vite + React (web), mas desenha telas de celular. Por isso fica em `mobile/` e segue os padrões de app e de página do mobile (decisão P1: "mobile" no lugar de "web" nos nomes). Não é o app React Native: ele só mostra como a tela deve ficar antes de ser implementada em [`@ben/mobile-ben`](../ben/description.md).

Duas coisas vivem aqui: as **telas do Ben** e a **Design Gallery**, uma meta-ferramenta no estilo Google Stitch que lista cada tela como um card de preview mobile ao vivo.

## Stack

Vite 8 · React 19 · react-router v7 · Tailwind CSS v4 · `lucide-react`.

Comandos na raiz: `pnpm dev:design` (Vite), `pnpm --filter @ben/mobile-design build`.

## Mais contexto

- [project-structure.md](./project-structure.md)
- [design-rules.md](./design-rules.md): regras visuais de toda tela Ben.
- [gallery-workflows.md](./gallery-workflows.md): adicionar estado de tela e componente.
- Design system: [design.md](../../../../agents-docs/design-advisor/design.md); os tokens do frontmatter dele foram portados para [`global.css`](../../../../../packages/infra/mobile/design/src/core/global.css). Ao criar um token novo, espelhe lá primeiro.
