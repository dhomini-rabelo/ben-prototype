# r1 — Especificação de design: menu de long-press + sheet de detalhes da chamada ao modelo

Escrito para um planejador técnico. Todo token, ícone e caminho aqui foi verificado no repo real
(`tailwind.config.js`, `lucide-react-native@0.544` em `node_modules`, componentes lidos arquivo a arquivo).
Cada prescrição carrega o princípio que a sustenta: `§x` = `.claude/agents-docs/design-advisor/padroes-design-ui-ux.md`,
`DS` = `.claude/agents-docs/design-advisor/design.md`.

---

## 0. Premissas assumidas (não havia com quem confirmar)

1. **Idioma.** Os rótulos "Ver input" / "Ver output" são contrato do briefing e ficam em português.
   Todo o resto de copy nova (sheet, seções, estados) fica em **inglês**, como o resto do app
   ("Settings", "Tasks", "Close", "retry") — §2.5 consistência interna. A mistura é intencional e
   limitada aos dois rótulos pedidos verbatim.
2. **Tema do menu.** A imagem de referência é escura porque o ChatGPT inteiro é escuro. O Ben tem
   **uma única paleta clara** (`tailwind.config.js` tem `darkMode: 'class'` justamente para nunca
   aplicar dark). Imito o **formato** da referência (card flutuante ancorado, fundo escurecido, ícone
   à esquerda), não o tema — §2.5 / Jakob's Law. Alternativa escura documentada na §6.
3. **Um sheet, não dois.** Decisão justificada na §3.1.
4. **Trace = nome do dado.** Chamo o par input+output de *trace* da chamada. Se o backend escolher
   outro nome de rota/modelo, troque em todos os nomes de arquivo abaixo, mas mantenha um nome só.
5. **Sem "levantar" a bolha pressionada** (o ChatGPT clona a mensagem acima do backdrop). Fora de
   escopo: exige clonar um item de uma `FlatList` invertida. O vínculo espacial vem da ancoragem
   (§1.1 Gestalt/proximidade) e o backdrop é leve o bastante para a bolha continuar legível.
6. **Long-press em qualquer mensagem do bot**, inclusive as otimistas/antigas. O estado vazio cobre
   o resto — menos ramificação e mais explicação (§2.2 + §3.1).

---

## 1. Gatilho: long-press na bolha do Ben

### 1.1 Onde mexer

`/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/chat-history/chat-history.tsx`,
dentro de `renderItem`. Envolver `<MessageBubble>` num `<Pressable>` **somente quando `isBen`**.
`MessageBubble` continua puramente apresentacional — **nenhuma prop nova nele**. O `Pressable` precisa de
`className="w-full"` para não quebrar o `w-full flex-row` da raiz da bolha.

### 1.2 Comportamento

| Item | Valor | Princípio |
|---|---|---|
| Delay | `delayLongPress` **default do RN (500 ms)** — não sobrescrever | §2.5 Jakob's Law: é o tempo do context menu do iOS |
| Háptico | `void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})` | Há precedente real: `src/layout/components/recording-bar.tsx:50` usa `impactAsync` com `.catch(() => {})` porque **quebra no Expo web**. Mantenha o `void … .catch` |
| `onPress` simples | **nada** — não criar falsa affordance | §3.6 |
| Medição da âncora | `measureInWindow` num `ref` do `Pressable`, guardado no store no `onLongPress` | — |
| Alternativa sem gesto | `accessibilityActions={[{ name: 'longpress', label: 'Inspect model call' }]}` + `onAccessibilityAction` abrindo o mesmo menu; `accessibilityHint="Long press to inspect the model call"` | §4.4 / WCAG 2.5.1 e 2.1.1 — o gesto não pode ser o único caminho |

⚠️ **Armadilha para o planejador:** a `FlatList` é `inverted`, o que aplica transform nas células.
Valide na mão que `measureInWindow` devolve coordenada de tela correta antes de construir o
posicionamento em cima disso. No Expo web o long-press é mouse-down segurado ~500 ms — avise o
browser tester.

---

## 2. Menu de long-press (`MessageActionsMenu`)

### 2.1 Apresentação e posicionamento

- Renderizado com `Modal transparent animationType="none"` **no nível da página** (`src/pages/chat/page.tsx`),
  nunca dentro do item da lista.
- **Backdrop:** `absolute inset-0 bg-inverse-surface/25`, `Pressable` que fecha. Mais leve que o
  `/30` dos sheets porque aqui a conversa por trás precisa continuar legível (§1.1 contraste).
- **Ancoragem:** o card é posicionado em coordenada absoluta a partir do retângulo medido da bolha.
  - Horizontal: alinhado à **borda esquerda da bolha** (mensagens do Ben são left-aligned), com clamp
    de **16 px** das bordas da tela.
  - Vertical: preferir **abaixo** da bolha com **8 px** de gap; se `bottom + alturaDoMenu + 16 >
    alturaDaTela - safeBottom`, *flip* para **acima** com 8 px de gap. Regra padrão de popover — §3.4
    (saída óbvia + não cobrir o que ancora).
- **Entrada:** backdrop `opacity 0→1` e card `opacity 0→1` + `scale 0.92→1`, ambos `withTiming(160ms)`.
- **Saída:** inverso em `120ms` e só então desmontar (estado local `isVisible`, igual ao padrão de
  `SettingsSheetOverlay`, mas **com** animação de saída — o overlay de settings hoje fecha seco, o
  que num popover ancorado lê como bug).
- **Fecha por:** toque no backdrop · botão físico Back (`onRequestClose` do `Modal`) · escolher um item.
  Três caminhos, nenhum dependente de gesto — §3.4 / Nielsen #3.

### 2.2 Aparência do card

| Propriedade | Valor exato |
|---|---|
| Superfície | `bg-surface-container-lowest` (#ffffff) |
| Borda | `border border-outline-variant/40` — **obrigatória**: o fundo do chat é `surface` #f9f9f9 e o card é #ffffff; sem a hairline não há separação (§1.1 contraste, §3.6 signifier) |
| Radius | `rounded-2xl` (16 px) — o mesmo da bolha de mensagem, Gestalt/similaridade (§1.1). `rounded-xl` do DS = 24 px é para containers grandes; aqui é pequeno |
| Sombra | `shadow-[0_8px_32px_rgba(0,0,0,0.12)]` — espelha a de `MenuSheet` (`0_-8px_32px_rgba(0,0,0,0.08)`) invertida e um pouco mais forte, porque flutua sobre conteúdo em vez de encostar na borda |
| Largura | **240 px** fixos (cabe em 390 − 2×16; largo o bastante para os dois rótulos sem quebra) |
| Padding do card | `px-1 py-1.5` |

### 2.3 Linha de timestamp (topo, como na referência)

`Typography variant="label-caps" className="px-3 pt-2 pb-1 text-on-surface-variant"` com
`absoluteDateTime(message.createdAt)` de `src/layout/utils/format-time.ts`.

⚠️ **Muda o plano:** `BenUiMessage` **não carrega `createdAt`** hoje — `mapHistoryToUiMessages`
(`src/pages/chat/utils/chat-messages.ts`) só joga `capture` para `metadata`. Para ter o timestamp,
`BenMessageMetadata` precisa ganhar `createdAt: string`. Recomendo fazer: num inspetor de debug o
carimbo de hora é o que correlaciona com o log do backend (§2.1 visibilidade de status).
Se o planejador recusar a plumbing, **remova a linha** — ela não é contrato do briefing.

### 2.4 Os dois itens

```
┌ 240px ─────────────────────┐
│ SEP 19, 2026, 3:41 PM      │  label-caps / on-surface-variant
│ ⭳  Ver input               │  48px
│ ⭱  Ver output              │  48px
└────────────────────────────┘
```

| Rótulo | Ícone (`lucide-react-native`, verificado) | Abre |
|---|---|---|
| **Ver input** | `FileInput` | sheet com aba `input` ativa |
| **Ver output** | `FileOutput` | sheet com aba `output` ativa |

`FileInput`/`FileOutput` formam par visual simétrico e dizem "payload", não "seta genérica"
(§1.4 — significado não pode depender só de cor/orientação).

Cada item:
`Pressable className="min-h-12 flex-row items-center gap-3 rounded-xl px-3 active:bg-surface-container-low"`
com `accessibilityRole="button"`.
- **48 px** de altura = alvo confortável Material (§4.3 📐). `active:bg-surface-container-low` é o
  mesmo pressed state de `MenuSidebar` e `IconButton` (§2.5).
- Ícone: `size={18} strokeWidth={1.75} color={onSurfaceVariant}` (`@/layout/utils/colors`) — mesma
  assinatura de `MenuSidebar`.
- Rótulo: `<Typography variant="body-md" className="text-on-surface">`, peso **regular**. Com dois
  itens não há hierarquia a estabelecer; semibold seria ênfase sem competidor (§1.2).
- Sem divisor entre os itens: dois itens não precisam (§2.4).

Contrastes: `#1a1c1c` sobre `#ffffff` ≈ 15.9:1; `#444748` sobre `#ffffff` ≈ 9.0:1 — ambos ≫ 4.5:1 (§4.2 ✅).

### 2.5 Mensagem sem dados de debug: **o item continua habilitado e o sheet abre vazio**

Justificativa, nessa ordem:
1. O cliente **não sabe** se há trace sem buscar — o payload do histórico não carrega os dados brutos.
   Desabilitar exigiria uma flag extra por mensagem só para desabilitar.
2. §3.2: quando o motivo do bloqueio não é óbvio, mantenha a ação habilitada e explique ao acionar —
   evita o "botão morto".
3. §3.1: um item desabilitado não explica nada; um empty state explica **por que** está vazio.

*Refinamento opcional:* se o backend puder incluir um `hasTrace: boolean` barato em cada mensagem da
listagem, **não desabilite mesmo assim** — apenas suprima o menu inteiro para mensagens sem trace
(aí o gesto simplesmente não responde, o que é pior) ou mantenha como está. Recomendação: **manter
como está**, sem `hasTrace`.

---

## 3. Bottom sheet de detalhes (`MessageTraceSheet`)

### 3.1 Um sheet só, com duas abas — decisão e justificativa

**Um sheet.** "Ver input" e "Ver output" são dois pontos de entrada para a **mesma** superfície, que
abre com a aba correspondente já ativa.

Justificativa de navegação (não de implementação): a pergunta real do dev nunca é "o que foi o input"
isolada — é **"esse input explica esse output?"**. Com dois sheets, comparar exige fechar → achar a
bolha → long-press → outro item, e a resposta precisa ser guardada de cabeça entre as duas telas
(§2.3, reconhecimento em vez de memorização). Com um sheet e um segmented control, a comparação é um
toque, sem perder contexto nem posição (Nielsen #3, controle do usuário). O custo — um controle a
mais no header — é menor que o custo de memorizar.

### 3.2 Casco e comportamento

- **Overlay:** `SettingsSheetOverlay` (`src/layout/components/menu-settings/settings-sheet-overlay.tsx`).
- **Casco:** `MenuSheet` (`src/layout/components/menu/menu-sheet.tsx`) com `className="h-[90%]"`.
  90 % da altura = "quase full-screen" do briefing e mantém uma faixa do chat visível no topo, que é
  o sinal de "isto é uma camada, não uma tela" (§3.4).
- ⚠️ **`SettingsSheetOverlay` precisa de prop nova:** `SLIDE_OFFSET` é constante `600`. Num sheet de
  ~760 px ele começa a animação já parcialmente visível. Adicionar `slideOffset?: number` (default
  600) e passar a altura da janela.
- **Handle de arrastar:** `MenuSheet` já renderiza (`h-1 w-10 rounded-full bg-outline-variant/60`).
  **Mantenha o handle e NÃO implemente pan-to-dismiss.** Um pan de fechar brigaria com o scroll longo
  que é a razão de ser deste sheet (§2.2 prevenção de erro). O handle fica como marcador de borda,
  exatamente como já é em `SettingsSheet` e `ItemDetailRoot` — consistência interna (§2.5).
- **Fecha por:** botão `X` no header · toque no backdrop · Back. Nenhum caminho depende de gesto (§4.4).

### 3.3 Header fixo (não rola)

Três faixas, nessa ordem:

**Faixa 1 — identidade + fechar.** Copia o padrão de `ItemDetailRoot`:
quadrado `size-7 rounded-lg bg-surface-container-high` com `<Cpu size={16} color={onSurfaceVariant} />`,
seguido de `<Typography variant="label-caps" className="text-on-surface-variant">Model call</Typography>`;
à direita `<IconButton label="Close" className="size-11">` com `<X size={16} color={onSurfaceVariant} />`.
→ `size-11` (44 px), não o `size-8` que `ItemDetailRoot` usa hoje — §4.3 📐. (O `size-8` existente é
nit pré-existente, fora de escopo.)

**Faixa 2 — meta strip, sempre visível, nunca colapsável.** Chips em `flex-row flex-wrap gap-2`:
`bg-surface-container rounded-full px-2 py-1` + `Typography variant="label-caps"` `text-on-surface-variant`.
Conteúdo: **modelo** · **latência** (`1.8s`) · **status** (`ok` / `error`).
Só três — são as perguntas que o dev faz antes de abrir qualquer coisa (§1.1 hierarquia; §2.4: não
duplicar aqui o que a seção de summary já detalha). No status `error`, o chip vira
`bg-surface-error` + `text-text-error` **e** ganha `<CircleAlert size={12} />` — cor nunca sozinha (§1.4/§4.6).

**Faixa 3 — segmented control `Input | Output`.**
Container `flex-row rounded-lg bg-surface-container p-1`; cada segmento
`Pressable className="h-11 flex-1 items-center justify-center rounded-md"` (44 px, §4.3);
ativo: `bg-surface-container-lowest` + `Typography variant="button-text" className="text-on-surface"`;
inativo: `text-on-surface-variant`. `accessibilityRole="tab"` + `accessibilityState={{ selected }}`.
Trocar de aba **reseta o scroll para o topo** (previsibilidade).

### 3.4 Corpo — uma `ScrollView` por aba

`<ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 gap-2" />`.
Divisor entre seções: `h-px bg-outline-variant/40`.

#### Aba INPUT (ordem de cima para baixo)

| # | Seção | Estado inicial | Por quê |
|---|---|---|---|
| 1 | **Request summary** — linha única mono: `POST /chat · 12 messages · 3 tools · 4.1k chars` | aberta, não colapsável | §2.1: o resumo responde "o payload tem o tamanho que eu esperava?" antes de abrir nada |
| 2 | **Messages** — uma linha por mensagem do histórico, chip de role + 2 linhas de preview; tap expande a mensagem inteira | **aberta** | É o que o dev mais varre: "que contexto o modelo realmente viu?" (§1.1 hierarquia) |
| 3 | **System prompt** — meta no header: `4.1k chars` | **colapsada** | Longo e raramente é o que mudou. Aberto por padrão, ele engole a tela e reduz a visibilidade do resto (§2.4) |
| 4 | **Tools** — uma linha por tool (nome + descrição de uma linha); cada linha expande para o JSON schema | **colapsada** | Idem |
| 5 | **Raw request JSON** | **colapsada**, no fim | Escape hatch: quando a visão estruturada não basta, o payload inteiro está a um toque (§2.6/#7 aceleradores) |

Ordem das mensagens na seção 2: **mais antiga em cima, mais nova embaixo**, igual à leitura do chat
(§2.5 consistência) — e não invertida como a `FlatList`.

#### Aba OUTPUT

| # | Seção | Estado inicial | Por quê |
|---|---|---|---|
| 0 | **Banda de erro** (só quando a chamada ao modelo falhou) | sempre visível, no topo | O erro explica todo o resto; qualquer outra posição obriga a caçar (§3.1/Nielsen #9). Visual idêntico a `ItemDetailError`: `rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3` + `text-text-error`. **Sem** botão de retry — não é falha de fetch, é conteúdo |
| 1 | **Result summary** — grid de 2 colunas, label mono + valor: finish reason, tokens `prompt / completion / total`, timestamps de início e fim | aberta, não colapsável | §1.1: os números são o diagnóstico rápido |
| 2 | **Text response** — o texto cru que o modelo produziu, `selectable` | **aberta** | É a resposta à pergunta que motivou o long-press |
| 3 | **Tool calls** — uma por tool call: nome + `args` (JSON, colapsado) + `result` (JSON, colapsado) | **aberta** se houver ≥1; **a seção inteira não é renderizada** se houver zero | Accordion vazio é ruído (§2.4) |
| 4 | **Raw response JSON** | **colapsada**, no fim | Idem input |

**Tipografia do "Text response": `body-md` (Hanken 16px), não mono.** É prosa; 16px com leading de
24 é o que se lê confortável num celular (§4.2 legibilidade). Mono fica reservado para JSON e labels,
que é o que o DS manda ("JetBrains Mono … sparingly for small labels or secondary system status").

### 3.5 Como o JSON fica legível num celular — o núcleo do "fácil de navegar"

Componente `CodeBlock`. Regras, todas verificáveis:

1. **Fonte:** `font-mono` + **token novo** `text-code`. `label-caps` **não serve**: o
   `Typography variant="label-caps"` aplica `uppercase` e `tracking 0.05em` (ver
   `src/layout/components/ui/typography.tsx`), o que destrói JSON.
   → **Criar** em `/root/so/repos/ben-prototype/project-mobile/tailwind.config.js`,
   `theme.extend.fontSize`:
   ```js
   code: ['13px', { lineHeight: '20px', fontWeight: '400' }],
   ```
   e espelhar como `code:` no bloco `typography:` de
   `/root/so/repos/ben-prototype/.claude/agents-docs/design-advisor/design.md`.
   Por que 13px: em 390 px de tela menos 40 px de padding sobram 350 px; JetBrains Mono 13px dá ~44
   caracteres por linha — o mínimo para JSON com indentação de 2 sem virar sopa. 12px economizaria
   pouco e custaria legibilidade; 16px cortaria para ~35 (§1.3 — valor escolhido da escala, com motivo).
2. **Pretty print:** `JSON.stringify(value, null, 2)`. Indentação de 2, nunca 4.
3. **Quebra de linha: soft-wrap, sem scroll horizontal.** Um `ScrollView` horizontal dentro de um
   vertical é armadilha de gesto em mobile (§3.5 / §4.4). Strings longas quebram no meio — aceito.
4. **Teto de altura:** o bloco renderiza no máximo **16 linhas** (`numberOfLines={16}`, ≈320 px) com
   um degradê de fade no rodapé e um botão de texto **"Show more" / "Show less"** com alvo de 44 px
   (§4.3). Progressive disclosure: o bloco nunca sequestra a tela (§2.4).
5. **Superfície:** `rounded-lg bg-surface-container-low p-3`, sem borda. É camada tonal, não sombra —
   exatamente o que o DS prescreve ("Tonal Layers rather than heavy shadows"). Contraste `#1a1c1c`
   sobre `#f3f3f4` ≈ 14:1 (§4.2 ✅).
6. **`selectable`** no `Text`, para selecionar no Expo web.
7. **Sem syntax highlighting.** Colorir chave/valor exigiria um parser e cores fora da paleta
   neutra, e cor não pode ser o portador do significado de qualquer jeito (§1.4). A indentação já
   carrega a estrutura.

### 3.6 Botões de copiar

- **Um por seção colapsável**, no canto direito do header da seção, `size-11` (44 px), `<Copy size={16}
  color={onSurfaceVariant} />`. Mais um dentro de cada `CodeBlock` de "Raw …".
- **Feedback:** ao copiar, o ícone vira `<Check size={16} />` por **1.5 s** e o
  `accessibilityLabel` vira `"Copied"`. A mudança é de **forma**, não só de cor (§1.4/§4.6), e é o
  feedback imediato que §2.1 exige (<0,1 s).
- **Sem "copiar tudo" global** — competiria com os copies de seção sem resolver nada que eles não
  resolvam (§2.4).
- ⚠️ **Dependência faltando:** não existe clipboard no projeto. `grep -rn "Clipboard" src/ app/` = 0
  hits e `expo-clipboard` **não está no `package.json`**. O planejador precisa rodar
  `npx expo install expo-clipboard` (funciona em web e nativo). O `Clipboard` do core do RN está
  removido — não é opção.

### 3.7 Estados

| Estado | O que renderiza | Princípio |
|---|---|---|
| **Loading** | Skeleton novo `MessageTraceLoading`: 1 barra de meta strip + 3 headers de seção + 6 linhas, todas `animate-pulse bg-outline-variant/40`, mesma linguagem de `ItemDetailLoading`. **Sem spinner.** O segmented control já aparece, desabilitado | §3.1: skeleton comunica a estrutura que está chegando. Fetch é sqlite local (<1 s), então §2.1 não pede barra de progresso |
| **Vazio** (mensagem antiga, sem trace) | `ItemDetailGone` **com prop nova `message`**: `"no trace for this one — it was sent before Ben started recording model calls."` + uma linha mono com o `id` da mensagem e o timestamp, para correlacionar com o log. **O segmented control some** — não há entre o que alternar (§2.4) | §3.1: empty state explica o porquê, não fica em branco |
| **Erro de fetch** | `ItemDetailError` **como está** (já traz o retry), com `message="couldn't load this trace — tap to retry"`. Segmented control some | §3.1 / Nielsen #9: o que houve + como resolver |
| **Erro da chamada ao modelo** | **Não** é estado do sheet, é conteúdo: banda no topo da aba Output (§3.4, linha 0) | §3.1: distinguir falha de carregamento de falha registrada |

---

## 4. O que reaproveitar, o que ganha prop, o que é novo

### 4.1 Serve como está

| Componente | Caminho absoluto | Como |
|---|---|---|
| `MenuSheet` | `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu/menu-sheet.tsx` | `<MenuSheet className="h-[90%]">` — já aceita `className` e já traz handle, radius, sombra e safe-area |
| `ItemDetailError` | `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-detail/item-detail-error.tsx` | estado de erro de fetch do sheet |
| `IconButton` | `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/icon-button.tsx` | fechar e copiar, com `className="size-11"` |
| `Typography` | `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/typography.tsx` | todos os textos, exceto JSON (ver §3.5.1) |
| `colors.ts` / `cn` | `src/layout/utils/colors.ts`, `src/layout/utils/styles.ts` | hexes de ícone lucide e merge de classes |
| `format-time.ts` | `src/layout/utils/format-time.ts` | `absoluteDateTime` no timestamp do menu |
| `MessageBubble` | `src/pages/chat/components/message-bubble/message-bubble.tsx` | **sem alteração** — o `Pressable` envolve por fora, no `renderItem` |

### 4.2 Precisa de prop nova

| Componente | Prop | Motivo |
|---|---|---|
| `SettingsSheetOverlay` (`src/layout/components/menu-settings/settings-sheet-overlay.tsx`) | `slideOffset?: number` (default `600`) | `SLIDE_OFFSET` fixo em 600 não cobre um sheet de 90 % (§3.2) |
| `ItemDetailGone` (`src/layout/components/menu-detail/item-detail-gone.tsx`) | `message?: string` (default = copy atual) | A copy atual é específica de nota/lembrete; o vazio do trace diz outra coisa. Mudança retrocompatível |
| `BenMessageMetadata` (`src/pages/chat/utils/chat-messages.ts`) + `mapHistoryToUiMessages` | `createdAt: string` | Timestamp no topo do menu (§2.3). **Opcional** — se recusado, remover a linha de timestamp |

### 4.3 Novo — caminhos seguindo a convenção do repo (kebab-case, pasta por componente)

Primitivos genéricos → `src/layout/components/ui/` (a pasta já é a reserva de primitivos:
`button`, `icon-button`, `typography`):

- `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/segmented-control.tsx`
- `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/collapsible-section.tsx`
- `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/code-block.tsx`
- `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/copy-button.tsx`

Componentes da feature → `src/pages/chat/components/`:

- `.../message-actions-menu/message-actions-menu.tsx` — Modal + backdrop + card ancorado
- `.../message-actions-menu/message-actions-menu-item.tsx` — linha ícone + rótulo
- `.../message-trace-sheet/message-trace-sheet.tsx` — casco, header, abas, switch de estado
- `.../message-trace-sheet/message-trace-meta-strip.tsx`
- `.../message-trace-sheet/message-trace-input.tsx`
- `.../message-trace-sheet/message-trace-output.tsx`
- `.../message-trace-sheet/message-trace-loading.tsx`

Store → `src/pages/chat/stores/message-trace-store/index.ts` + `types.ts`
(mesma forma de pasta de `messages-store`, mesma semântica de `useMenuStore.detailTarget`):

```ts
anchor: { messageId: string; x: number; y: number; width: number; height: number } | null
traceTarget: { messageId: string; tab: 'input' | 'output' } | null
```

**Não reutilizar `ItemDetailRoot`.** Ele tipa `kind: 'note' | 'reminder'` e monta um header de uma
faixa só; este sheet precisa de três faixas (identidade, meta strip, abas). Estender `ItemDetailRoot`
inflaria um componente de nota/lembrete com responsabilidade de debug (§5, fronteira de componente).
`MessageTraceSheet` é irmão dele e **copia o padrão visual do header** — mesmo quadrado `size-7
rounded-lg bg-surface-container-high`, mesmo `label-caps`, mesma posição do `X`.

**Montagem:** `<MessageActionsMenu />` e `<MessageTraceSheet />` vivem em
`/root/so/repos/ben-prototype/project-mobile/src/pages/chat/page.tsx`, irmãos dos outros overlays,
nunca dentro do `renderItem`.

### 4.4 Ícones `lucide-react-native` (todos verificados em `node_modules`)

`FileInput`, `FileOutput` (menu) · `Cpu` (identidade do sheet) · `X` (fechar) · `Copy`, `Check`
(copiar) · `ChevronRight` / `ChevronDown` (accordion) · `CircleAlert` (status de erro) ·
`Wrench` (seção Tools) · `MessageSquare` (seção Messages) · `ScrollText` (system prompt) ·
`Braces` (raw JSON).
⚠️ `AlertTriangle` **não existe** nesta versão — use `CircleAlert`.

---

## 5. Tokens a criar

| Token | Onde | Valor | Motivo |
|---|---|---|---|
| `fontSize.code` | `/root/so/repos/ben-prototype/project-mobile/tailwind.config.js` → `theme.extend.fontSize` | `['13px', { lineHeight: '20px', fontWeight: '400' }]` | §3.5.1 — `label-caps` é uppercase e não serve para JSON |
| `typography.code` | `/root/so/repos/ben-prototype/.claude/agents-docs/design-advisor/design.md` | JetBrains Mono 13/20 | Manter o DS como source of truth (§5) |

Nada mais. Cor, radius, spacing e sombra da feature inteira saem de tokens que já existem.

---

## 6. Trade-offs e alternativas

**Menu claro vs. escuro.** Recomendo **claro** (`surface-container-lowest`), como especificado: a
paleta do Ben é única e clara, `darkMode: 'class'` existe no `tailwind.config.js` exatamente para
impedir superfícies escuras, e o único tom escuro em uso hoje é `primary` na bolha do usuário — um
card escuro leria como "mensagem do usuário". A alternativa defensável é
`bg-inverse-surface` (#2f3131) + texto `inverse-on-surface` (#f0f1f1) (contraste ≈ 11.6:1, passa
§4.2), que casa pixel a pixel com a referência; ela exige exportar `#f0f1f1` em
`src/layout/utils/colors.ts` para os ícones lucide. Se o usuário reclamar de "não ficou como a
imagem", esta é a troca de uma linha.

**Um sheet vs. dois.** Já decidido na §3.1 em favor de um. O único argumento pelos dois é um header
mais simples; ele perde para o custo de memória na comparação input↔output (§2.3).

**Handle com vs. sem pan-to-dismiss.** Recomendo sem (§3.2). A alternativa é copiar o
`Gesture.Pan()` de `TaskPickerSheet` e só ativá-lo quando o `ScrollView` estiver no topo
(`onScroll` → `scrollY === 0`); vale a complexidade só se o usuário reclamar do `X`.

**Soft-wrap vs. scroll horizontal no JSON.** Recomendo soft-wrap (§3.5.3). Scroll horizontal
preservaria a indentação de estruturas fundas, mas cria scroll aninhado em mobile, que é o caso
clássico de gesto que prende o dedo.

---

## 7. Checklist §6 aplicado à entrega

- [x] **Hierarquia** — meta strip > seções abertas > seções colapsadas > raw JSON (§1.1, §3.2)
- [x] **Tipografia contida** — Hanken regular/semibold + JetBrains Mono para técnico; 3 cores de texto (`on-surface`, `on-surface-variant`, `text-error`) (§1.2)
- [x] **Valores da escala** — 8/16/24 px, alturas 44/48 px, 240 px de largura, 13 px de mono justificado (§1.3)
- [x] **Contraste ≥ 4.5:1** — todas as combinações checadas nas §2.2, §3.5.5, §3.3 (§4.2)
- [x] **Alvos ≥ 44–48 px** — itens do menu 48, segmentos 44, IconButtons `size-11`, "Show more" 44 (§4.3)
- [x] **Cor não é o único sinal** — status de erro tem `CircleAlert` + texto; copiar troca de ícone (§1.4, §4.6)
- [x] **Loading / empty / error** — os três especificados na §3.7 (§3.1)
- [x] **Feedback de espera** — skeleton; sem barra de progresso porque o fetch é local (§2.1)
- [x] **Gestos com alternativa** — long-press tem `accessibilityActions`; fechar tem `X` e Back além do backdrop (§4.4)
- [x] **Consistente com o app e o DS** — reaproveita overlay, casco, pressed states, header e linguagem de skeleton existentes (§2.5, §5)
- [x] **Nada irrelevante competindo** — system prompt e tools colapsados; seção de tool calls some quando vazia; sem "copiar tudo" (§2.4)
