# r0 — Design e memória para "long-press na mensagem do bot → menu ver input/output → modal de detalhes da chamada"

## 1. Memória do projeto

Todas as categorias de `.claude/memory/*/README.md` foram abertas. Estado real:

- `rules/`, `user-preferences/`, `decisions/`, `fails-and-lessons/`, `environment/`, `vocabulary/` — **todas vazias** ("Nenhuma entrada ainda."). Não há regra permanente, preferência de usuário, decisão passada ou lição aprendida registrada que restrinja chat/modal/debug.
- `business-rules/` tem uma entrada: `/root/so/repos/ben-prototype/.claude/memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md` (razão de negócio e casos de uso v1). Busquei por `debug|modal|menu|long-press|context menu|input.*output|inspect` nesse arquivo — **nenhuma ocorrência**. Não trata de ferramentas de debug/dev; é sobre o que Ben faz para o usuário (dogfooding do fundador).

**Conclusão:** memória não impõe nenhuma restrição específica a esta feature. É terreno livre — nada a violar, mas também nada a reaproveitar como precedente decidido.

## 2. Design system (`.claude/agents-docs/design-advisor/design.md`)

Arquivo: `/root/so/repos/ben-prototype/.claude/agents-docs/design-advisor/design.md`

Tokens relevantes para um modal/overlay/menu de contexto:

- **Superfície do modal/sheet:** `surface-container-lowest` (`#ffffff`) é o que a `ItemDetailSheet` já usa como fundo. Alternativas de camada: `surface-container-low` (`#f3f3f4`), `surface-container` (`#eeeeee`), `surface-container-high` (`#e8e8e8`) para diferenciar sub-áreas dentro do modal (ex.: bloco "input" vs bloco "output").
- **Texto:** `on-surface` (`#1a1c1c`) para texto principal, `on-surface-variant` (`#444748`) para labels/metadados secundários.
- **Bordas/divisores:** `outline` (`#747878`) e `outline-variant` (`#c4c7c7`).
- **Elevação:** o design system usa "Tonal Layers", não sombras pesadas. Sombra documentada: `0px 4px 12px rgba(0,0,0,0.03)` (ultra-difusa). A `ItemDetailSheet` real usa `shadow-[0_-8px_32px_rgba(0,0,0,0.08)]` (sombra voltada para cima, por ser bottom sheet).
- **Radius:** tokens `rounded` — `sm: 0.25rem`, `DEFAULT: 0.5rem` (8px, padrão de botões/inputs), `md: 0.75rem`, `lg: 1rem`, `xl: 1.5rem` (24px — usado em "large containers" como cards de captura e a "ledger peek"; a `ItemDetailSheet` usa `rounded-t-3xl`, ou seja, o topo arredondado em escala ainda maior que `xl`). Para um modal centralizado (não bottom-sheet) o candidato natural é `rounded-xl`/`rounded-lg`.
- **Tipografia:** `body-md` (Hanken Grotesk, 16px/24px) para texto de conteúdo; `label-caps` (JetBrains Mono, 12px, uppercase-tracking) é o token pensado para "acentos técnicos" e indicadores de sistema — é o mais adequado para rotular blocos "INPUT" / "OUTPUT" e para exibir JSON/payload bruto, já que o design system reserva mono para a "natureza tool-like" do produto. `headline-lg` para o título do modal.
- **Spacing:** grid de 8px; `stack-sm` (8px) e `stack-md` (16px) para espaçamento interno de blocos; `margin-edge` (24px) para respiro nas bordas do modal; `max-width: 480px` é o teto de largura de toda a experiência (mobile-first).
- **Cor de erro:** `surface-error` (`#FFF5F5`) + `text-error` (`#C53030`) — usar se a chamada ao modelo tiver falhado.

**O design system já descreve modal/sheet/menu?** Não descreve um "modal" centralizado nem um "menu de contexto" (long-press/context menu) como padrão nomeado. O componente mais próximo documentado é a **"Ledger Peek"** (drawer persistente) e, em código real (não no `design.md`, mas no `project-design`), o padrão de **bottom sheet** (`rounded-t-3xl`, fundo `surface-container-lowest`, sombra voltada para cima) usado por `ItemDetailSheet`, `TaskPickerSheet` e `SettingsSheet`. Não existe hoje nenhum componente de "context menu" (menu que aparece sobre um item após long-press) nem em `design.md` nem em `project-design`.

## 3. `project-design`

Arquivos relevantes (caminhos absolutos):

- Registro central de telas/componentes: `/root/so/repos/ben-prototype/project-design/src/core/screens.ts`
- Telas de chat: `/root/so/repos/ben-prototype/project-design/src/pages/app/chat-empty.tsx`, `chat-loading.tsx`, `chat-populated.tsx`, `chat-composing.tsx`, `chat-recording.tsx`, `chat-transcribing.tsx`, `chat-awaiting-reply.tsx`, `chat-error.tsx`, `chat-permission-denied.tsx`, `chat-offline.tsx`, `chat-edge-cases.tsx` (todas em `/root/so/repos/ben-prototype/project-design/src/pages/app/`), mais o shell compartilhado `/root/so/repos/ben-prototype/project-design/src/pages/app/_chat-shell.tsx`.
- Primitivos de UI em `/root/so/repos/ben-prototype/project-design/src/layout/components/ui/`: só existem `button.tsx`, `icon-button.tsx`, `typing-indicator.tsx`, `typography.tsx`. **Não há nenhum primitivo de modal/overlay/menu ali.**
- Componente de bolha de mensagem (candidato a receber o long-press): `/root/so/repos/ben-prototype/project-design/src/layout/components/message-bubble.tsx` (preview em `/root/so/repos/ben-prototype/project-design/src/pages/components/message-bubble.tsx`).

**Modal/overlay/sheet já desenhados (mais próximos da feature pedida):**
- `/root/so/repos/ben-prototype/project-design/src/layout/components/item-detail-sheet.tsx` — sheet de detalhe de item (nota/lembrete), variantes `populated|loading|error|gone`, usa `rounded-t-3xl`, `bg-surface-container-lowest`, sombra customizada. Telas correspondentes: `/root/so/repos/ben-prototype/project-design/src/pages/app/item-detail-note.tsx`, `item-detail-reminder.tsx`, `item-detail-loading.tsx`, `item-detail-error.tsx`, `item-detail-edge-cases.tsx`. Página de "Item detail modal" está registrada em `screens.ts` como `id: "item-detail"`.
- `/root/so/repos/ben-prototype/project-design/src/layout/components/task-picker-sheet.tsx` — sheet de seleção.
- `/root/so/repos/ben-prototype/project-design/src/layout/components/settings-sheet.tsx` — sheet de configurações.

Isso é o mais próximo de "tela de detalhe": **é sempre um bottom sheet**, nunca um modal centralizado, e nunca um menu de contexto tipo long-press. Não existe hoje nenhuma tela de debug/inspeção de chamada a modelo (input/output bruto) em `project-design` nem em `project-mobile`.

**Fluxo do repo para desenhar uma tela nova antes de implementar (resumo em 5 linhas, fonte: skill `code-get-project-context` / `.claude/skills/code-get-project-context/SKILL.md`):**
1. Criar o arquivo de estado em `project-design/src/pages/app/<page>-<state>.tsx` (componente PascalCase nomeado), um arquivo por estado.
2. Registrar a rota em `project-design/src/core/main.tsx` em `/app/<page>-<state>`.
3. Adicionar a entrada em `PAGES` de `project-design/src/core/screens.ts` (nova `ScreenPage` se for tela nova, ou novo `state` se a página já existir).
4. Se a feature introduzir um primitivo reutilizável (ex.: um `ContextMenu` ou `CallDetailModal`), extrair para `project-design/src/layout/components/ui/<name>.tsx`, criar preview em `project-design/src/pages/components/<name>.tsx`, registrar rota e adicionar em `COMPONENTS` no `screens.ts`.
5. Só depois de a tela estar desenhada e revisada na Design Gallery (`project-design`) o trabalho equivalente é implementado em `project-mobile` (foco ativo de desenvolvimento) — `project-design` é sempre o passo anterior à implementação, nunca é pulado.

## Premissas assumidas (sem ninguém para confirmar, documentadas conforme instruído)

- Assumi que "modal com detalhes da chamada ao modelo" é uma feature de debug/dev (não voltada ao usuário final do produto), dado que não há nada equivalente na razão de negócio v1 nem no vocabulário do produto. Isso muda a leitura de tom: os tokens "tool-like" (`label-caps` em JetBrains Mono) parecem mais adequados que o tom "friend-tone" do resto do produto, mas isso é uma leitura de design, não uma regra registrada.
- Assumi que "menu" após long-press é um **menu de contexto novo** (sem precedente no repo), distinto dos "sheets" existentes — porque nenhum arquivo em `project-design` implementa um menu ancorado a um toque longo (todos os sheets existentes abrem sem menu intermediário).
