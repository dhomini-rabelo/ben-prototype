# Design (sandbox): estrutura do código

Base: `packages/infra/mobile/design/src`. O app segue a estrutura de app do padrão: `core/`, `layout/`, `pages/`, com `page.tsx` por página e carregamento por `lazy`.

- `core/`: ligação do app. `main.tsx` (entrada, `BrowserRouter`), `routes.tsx` (todas as rotas, páginas carregadas com `lazy`), `screens.ts` (registro `PAGES` das telas e seus estados e `COMPONENTS` das primitivas, que alimenta a galeria), `global.css` (tema e tokens Tailwind v4).
- `pages/<nome>/page.tsx`: uma pasta por rota, com export nomeado em PascalCase.
  - Estados de tela: `<page>-<state>` (ex.: `chat-awaiting-reply`, `capture-task-active`), rota `/app/<page>-<state>`.
  - Previews de componente: `<nome>-preview` (ex.: `button-preview`) e `design-tokens`, rota `/components/<nome>`.
  - `home/page.tsx` é a própria Design Gallery (aba Pages agrupa os estados por página; aba Components é a visão geral do design system).
- `layout/components/ui/`: primitivas (`button`, `icon-button`, `typing-indicator`, `typography`).
- `layout/components/common/`: composições compartilhadas e shells de tela (`chat-shell`, `preview-shell`, `menu-shell`, `detail-shell`, `workspace-shell`, `settings-shell`, `picker-shell`, `menu-list-shell`, `brand-mark`).
- `layout/components/{capture-card,chat,icons,menu,workspace}/`: componentes por grupo de feature.
- `layout/utils/styles.ts`: helpers de estilo, incluindo `cn()` (import `@/layout/utils/styles`).
- Fora de `src/`: `index.html`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `public/`.
