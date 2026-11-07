# r0-design: sandbox de design e regras (header centralizado, menu no footer, sheet)

Task: "centralizar em cima a logo + Ben | {data de hoje} e mover o menu hambúrguer para o footer na parte esquerda, e deve abrir um sheet com a opção atual".
Leitura só de repo. Base: `packages/infra/mobile/design/src` (abreviado `D/`) e `packages/infra/mobile/ben/src` (abreviado `B/`).

## 1. Sandbox x mobile: header e footer

### Mobile (referência atual, quem tem a data)
- `B/pages/chat/components/chat-top-bar/chat-top-bar.tsx:21-37`: barra `h-[52px]`, `justify-between pl-5 pr-4`. Esquerda: `BrandMark` + divisor `border-l` + data `formatShortDate(new Date(), language)` (`:22-29`). Direita: `IconButton` do menu `size-11` com ícone `List` phosphor 22px (`:30-36`), `onOpenMenu`.
- `B/pages/chat/utils/format-short-date.ts:3-10`: `toLocaleDateString` com weekday/month/day curtos; só põe o ano se não for o ano corrente. Já existe e é reutilizado em `day-divider.tsx:32` e `capture-card-meta.tsx:35`.
- `B/layout/components/brand-mark.tsx:66-90`: `BenLogo variant="brand"` 30px + texto "Ben" (wordmark, `text-[23px]`), `gap-2.5`.
- `B/pages/chat/page.tsx:78-85`: header absoluto `z-50` com `ChatTopBar`, `ActiveTaskPicker`, `ChatTopBanner`. Footer em `:107-117`: `bg-background px-4 pb-2 pt-2` com só `ChatFooter` (`B/pages/chat/components/chat-footer/chat-footer.tsx:31-55`: `ChatInput.Root` com input + um botão de ação envio/mic; não há botão à esquerda do input além do que `ChatInput.*` renderiza internamente, dúvida, não abri `layout/components/chat-input`).
- Menu hoje: `router.push(ROUTES.menu)` (`B/pages/chat/page.tsx:82`, `B/core/routes.ts:4`), tela `B/app/(protected)/_layout.tsx:25` com `presentation: 'modal'`. `B/pages/menu/page.tsx:26-50` mostra `MenuSidebarView` (view `menu`) e troca para tasks/notes/reminders por `useMenuStore.view`; settings e detalhes abrem em `SettingsSheetOverlay`. Entradas: Tasks, Notes, Reminders, Settings (`B/layout/components/menu/menu-sidebar.tsx`, `MenuSidebarView` em `menu-sidebar-view.tsx:9-40`). Já existe `MenuSheet` (`B/layout/components/menu/menu-sheet.tsx:10-35`, `rounded-t-3xl`, alça, safe-area) usado só para detalhe de nota/lembrete.

### Sandbox
- Header do chat: `D/layout/components/common/chat-shell.tsx:23-31`. `BrandMark` à esquerda (`:25`), `IconButton label="Menu"` + `Menu` lucide à direita (`:26-28`), `px-6`, `h-16`. Footer: `:43-46`, `fixed bottom-0`, `px-4 pt-2 pb-6`, empilha `peek` e `footer` (o `ChatInput`).
- A data não existe no sandbox: `BrandMark` (`D/layout/components/common/brand-mark.tsx:28-37`) é só logo + "Ben"; nenhuma ocorrência de data de hoje em `D/layout`. Divergência com o mobile (mobile tem divisor + data; sandbox não).
- O mesmo cabeçalho está copiado em outras shells: `D/layout/components/common/picker-shell.tsx:21-26` (`h-16`, `px-6`, logo + Menu) e `detail-shell.tsx:16` (BrandMark; botão menu não verificado, dúvida). Mudar o header exige tocar `chat-shell`, `picker-shell` e conferir `detail-shell`/`menu-shell`.
- `menu-shell.tsx:1-26` (sandbox) modela o menu como sidebar da esquerda, ~78% da largura, com dim layer (`:111-112`). Hoje o menu no sandbox é sidebar; no mobile é tela modal com a mesma lista. Ambos são "painel da esquerda", não bottom sheet.
- Sheets prontos no sandbox, padrão a reaproveitar: `settings-sheet.tsx:22-30` (`rounded-t-3xl bg-surface-container-lowest shadow-[0_-8px_32px_...]`, alça `h-1 w-10`), `task-picker-sheet.tsx`, `item-detail-sheet.tsx`; shell que mostra sheet sobre o chat com dim: `D/layout/components/common/picker-shell.tsx:41-45` (overlay `z-40`, sheet `z-50` no rodapé). `PickerShell` já é o gabarito de "sheet sobre o chat".
- Registro: estados em `D/core/screens.ts` (`PAGES`, p.ex. `chat-*`, `menu-sidebar-*`) e primitivas em `COMPONENTS` (`:170-187`: `brand-mark`, `menu-sidebar`, `settings-sheet`, `task-picker-sheet`...). Rotas em `D/core/routes.tsx` (`/app/menu-sidebar-populated` etc. `:384-386`; `/components/brand-mark` `:352`).
- Sincronia geral: o sandbox é "o passo anterior" (`.claude/skills/code-get-project-context/SKILL.md:25`), mas o header já divergiu (data só no mobile). Última sincronização do chat-shell: commit `c360e16` (simple-loop chat-v2-design). Sandbox usa `lucide-react`, mobile usa `phosphor-react-native` (ícone `Menu` x `List`).

## 2. Regras de design que tocam esta mudança

Docs: `.claude/skills/code-get-project-context/mobile/design/design-rules.md` (13 linhas), `.../gallery-workflows.md`, `.claude/agents-docs/{design-advisor,project-context}/*`.
- `design-rules.md:5` tokens do tema (`wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`) em vez de valor arbitrário. A data no header deve usar token (o mobile hoje usa `text-[13px]` arbitrário em `chat-top-bar.tsx:25`; dúvida se é pendência ou aceito).
- `design-rules.md:6` primitivas genéricas: sem `w-full`/`max-w`/espaçamento de página embutido (aplicar via `className` no uso). Vale para um eventual novo botão/sheet do menu.
- `design-rules.md:7` mensagens do chat ancoradas ao composer; `gallery-workflows.md:21` seção das mensagens com `flex flex-1 flex-col justify-end gap-4 pt-2`. Um menu no footer à esquerda do composer não pode abrir vão entre balão e input.
- `design-rules.md:8-11` ActiveTaskPeek: no sandbox fica no fim da pilha do rodapé acima do composer (`chat-shell.tsx:43-46`); no mobile fica no cabeçalho, abaixo da top bar (`chat/page.tsx:83`). Header centralizado e footer com o menu precisam preservar essa ordem; peek nunca acima de banner.
- `gallery-workflows.md:20` viewport 390x844, sem `min-height` acima de 844px.
- `gallery-workflows.md:23-30` adicionar estado de tela: pasta `pages/<page>-<state>`, rota em `routes.tsx`, entrada em `PAGES`. `:32-42` componente novo: pasta `ui/` ou `common/`, `cn()`, página `<nome>-preview`, rota `/components/<nome>`, entrada em `COMPONENTS`, e atualizar `design-tokens` se criar token. Se criar "FooterMenuButton"/"MenuSheet" no sandbox, isso é obrigatório.
- `design.md` (fonte da verdade visual): sheet/cards grandes `rounded-xl` 24px (`design.md:146`), sombra ultra difusa (`:140`), interação por tom e não por sombra maior (`:141`); wordmark "pesado e confiante", primary near-black (`:122,129`). Tokens existentes: preferir (`code-get-project-context/SKILL.md:33`).
- `padroes-design-ui-ux.md:217-218`: bottom sheet melhor que modal central em mobile (alcance do polegar), não empilhar modais. `:264-266`: alvo de toque 44-48px (o botão atual `size-11` = 44px, ok). `:224`: tab bar para 3-5 destinos de topo; `ux-philosophy.md:22` diz "No bottom tab nav".
- Restrição forte/conflito a decidir: `ux-philosophy.md:21` descreve o menu como "Slides in from the leading edge ... via a small affordance in the top bar" e `:22` "menu sidebar (slides in from leading edge)". A task move a affordance para o footer e troca sidebar por sheet: contradiz esses dois trechos (que são fonte da verdade, `SKILL.md:31-33`). Pode ser a intenção; nesse caso a doc fica desatualizada (só atualizável via `task-update-project-context`, `CLAUDE.md`). Vale conferir com o usuário.
- `ux-philosophy.md:12`: o composer mora na parte de baixo do chat; footer com menu à esquerda divide espaço com o composer (e `peek`), dúvida de layout.
- `design-direction.md` (clima, vivid-but-adult, nunca monocromático): só nível de tom; sem regra de header/footer (grep sem ocorrência de header/footer/menu relevante além de `:46` task workspace).

## 3. Memória (`.claude/memory/`)
- README abre 7 categorias. Os índices `decisions`, `rules`, `dev-preferences`, `vocabulary`, `environment`, `fails-and-lessons` dizem "Nenhuma entrada ainda" (`*/README.md`, seção Entries). Nada sobre header, menu, footer, sheet, nem sobre o fluxo "desenhar no design antes do mobile".
- Único registro: `.claude/memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md`; grep por header/menu/footer/date sem ocorrência. Não pertinente.
- O fluxo design-first só está documentado em `code-get-project-context/SKILL.md:25` e `mobile/design/description.md` (Propósito), não em memória.

## 4. Runs anteriores em `.claude/tmp/orquestracoes/`
Nomes: 2026-09-12-{adapter-sqlite, apagar-project-web, checar-current-tasks, limpar-docs, limpar-history-memoria}, 2026-09-19-{config-model-effort, detalhes-mensagem, trocar-modelo-luna}, 2026-10-03-padronizar-estrutura, 2026-10-21-explicar-agente-ben, 2026-10-25-branches-fora-da-main, 2026-10-26-chat-v2-design, 2026-11-07-header-menu-footer (esta, só `log.md`), 2026-11-07-logo-antiga.
- Pertinentes ao header: `2026-10-26-chat-v2-design/relatorio-final.md` (chat-shell do v2, commit `c360e16`; trailing do menu em fix2 `:18`) e `2026-10-26-chat-v2-design/briefing.md` (não abri). Nada específico sobre mover menu para footer.
- `2026-11-07-logo-antiga/r0-mapa-logo.md` e `r0-gate.md`: troca da logo (balão âmbar vs ícones antigos) e dá o mesmo header como referência de marca; tangencial, sem mudança de layout. Anota que o sandbox ainda usa a logo antiga (não verifiquei: `D/layout/components/icons/ben-logo.tsx`).

## 5. Agente `design-advisor`
Existe: `.claude/agents/design-advisor.md`. Exige ler antes de aconselhar `.claude/agents-docs/design-advisor/padroes-design-ui-ux.md` e `design.md`, ancorar cada recomendação em seção citada (hierarquia: WCAG, depois HIG/Material, depois heurísticas, depois estética), preferir tokens existentes, ler a tela real antes de opinar, não adivinhar escopo ambíguo e não escrever código de feature (só conselho com diagnóstico, recomendações, trade-offs, checklist §6).

## Premissas assumidas
- "opção atual" lida como "sheet que mostra a mesma lista de entradas atual do menu (Tasks, Notes, Reminders, Settings)". **Dúvida**: o repo não responde se significa isso, a view atualmente selecionada no `menu-store`, ou só a opção "atual" sem as futuras. Precisa do usuário.
- "{data de hoje}" lida como `formatShortDate(new Date(), language)` já existente no mobile; formato exato com "|" separador: dúvida (mobile usa divisor vertical `border-l`, não texto "|").
- "centralizar em cima" lida como logo + "Ben" + divisor + data centralizados horizontalmente na top bar, sem ícone na direita. Dúvida: se a top bar mantém outro elemento à direita (nenhum previsto) e se o `ActiveTaskPicker` continua abaixo.
- "footer na parte esquerda": dúvida se é à esquerda do composer na mesma linha ou linha própria; o repo não define.
- Escopo design: mudar `chat-shell`, `picker-shell` (e conferir `detail-shell`) no sandbox antes do mobile, segundo o fluxo design-first de `SKILL.md:25`; não existe regra escrita obrigando (fluxo vem do contexto, não da memória).
