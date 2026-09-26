# r9b — Correção dos bugs achados no r9-teste.md

Ambiente: mesmos servidores do r9 (`project-backend` na 3333, Expo web na 8081), já de pé.
Repeti o long-press e o fluxo do sheet ao vivo no browser (Playwright, mouse down/move/up real,
não só eventos sintéticos) antes e depois de cada correção, inspecionando `getComputedStyle` e
o DOM real, não só o código-fonte.

## 1. Menu de long-press sem estilo de superfície — CORRIGIDO

**Causa raiz confirmada no browser:** `className` do NativeWind não é aplicado a `Animated.View`
(componente de member-expression de `react-native-reanimated`) no build web deste projeto — toda
classe utilitária nesse nó é silenciosamente descartada, embora `style` (valores animados e o
objeto de posicionamento) continue funcionando normalmente. Confirmei isso também no backdrop
pré-existente do `SettingsSheetOverlay` (`bg-inverse-surface/30` numa `Animated.View`): nenhum
elemento da página tinha `inverse-surface` na classe computada, e sua altura colapsava a 0 —
mesmo sintoma, bug estrutural mais amplo que o desta feature, deixado fora de escopo.

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-actions-menu/message-actions-menu.tsx`

**O que mudei:** mantive a `Animated.View` só para os valores animados (`style`, sem `className`)
e movi toda a classe visual (card: `rounded-2xl border border-outline-variant/40
bg-surface-container-lowest px-1 py-1.5 shadow-[...]`; backdrop: `bg-inverse-surface/25`) para uma
`View` comum aninhada dentro dela — em `View` comum o NativeWind aplica a classe normalmente
(verificado). O backdrop usa `StyleSheet.absoluteFill` (via `style`) na `Animated.View` externa em
vez de `absolute inset-0` via `className`, para não repetir o mesmo problema no dimensionamento.
Deixei um comentário no arquivo explicando a causa, para não ser "consertado" de volta por engano.

**Verificação ao vivo:** computed style do card passou de `background-color: rgba(0,0,0,0)`/sem
borda/sem shadow para `rgb(255,255,255)`, `border: 1px solid rgba(196,199,199,0.4)`,
`border-radius: 16px`, `box-shadow: ... 0 8px 32px rgba(0,0,0,0.12)`; o backdrop passou a
`rgba(47,49,49,0.25)` cobrindo os 390×844 da tela. Screenshot confere com o mockup do r1-design
(card branco com borda/sombra sobre fundo escurecido, texto legível).

## 2. `<button>` aninhado em `<button>` — CORRIGIDO

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/collapsible-section.tsx`

**O que mudei:** o `Pressable` (`accessibilityRole="button"`) que expande/colapsa a seção parou de
envolver o `CopyButton`. Agora o header da seção é uma `View` comum contendo dois irmãos: o
`Pressable` de expandir/colapsar (chevron + ícone + título + meta, com `flex-1`) e, fora dele, o
`CopyButton` quando `copyValue` existe. Nenhuma prop de acessibilidade mudou.

**Verificação ao vivo:** antes da correção, o console do browser mostrava exatamente o warning
citado no r9 (`<button> cannot contain a nested <button>`, com o stack apontando para
`CollapsibleSection`/`CopyButton`). Depois da correção, abri o sheet inteiro (Input e Output,
inclusive "Messages" com 3 sub-seções aninhadas com copy) e contei via DOM: 21 `<button>` na
página, 0 com outro `<button>` dentro (`document.querySelectorAll('button')` filtrado por
`.querySelector('button')`). Nenhum warning de hidratação no console desde a última navegação.

## 3. Feedback "Copied" não confirmado — SEM BUG, nenhuma mudança feita

Analisei `copy-button.tsx`: `handlePress` dispara `copyTextToClipboard(value)` sem `await` (só
`.catch(() => {})`) e chama `setIsCopied(true)` **na linha seguinte, de forma síncrona** — ou seja,
o feedback visual não depende do resultado da escrita no clipboard. Isso já é o comportamento
correto pedido pelo r1-design (feedback imediato, independente de sucesso).

Testei ao vivo no mesmo Chromium headless do r9 (sem conceder `clipboard-write`): cliquei
precisamente no ícone de copiar dentro do bloco "Raw request JSON" e o ícone trocou de `Copy` para
`Check` imediatamente, revertendo para `Copy` sozinho depois de ~1.5 s (confirmado por screenshot
antes/depois). Ou seja, o mesmo ambiente do r9 exibe o feedback corretamente quando o clique acerta
o botão certo — o achado "inconclusivo" do r9 foi um falso negativo de teste (provavelmente clique
não atingiu o ícone visível, já que uma tentativa minha via seletor `getByRole('button', {name:
'Copy'}).last()` também não mudou o rótulo, enquanto o clique nas coordenadas reais do ícone
funcionou). **Premissa assumida:** não mexi em `copy-button.tsx` nem em `clipboard-service.ts` —
o código está correto.

## Lint e typecheck

Só `project-mobile` foi tocado (os 3 achados eram de UI); `project-backend` não foi rodado, como
autorizado.

```
$ cd project-mobile && npm run lint:fix
> eslint . --fix
(sem erros)

$ cd project-mobile && npx tsc --noEmit
(sem saída — sem erros)
```

## Arquivos alterados

- `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-actions-menu/message-actions-menu.tsx`
- `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/collapsible-section.tsx`

## Descoberta fora de escopo (não corrigida, registrada para quem revisar depois)

O mesmo bug de raiz do achado 1 (`Animated.View` + `className` não aplicado no build web) também
atinge o backdrop de `SettingsSheetOverlay` (`src/layout/components/menu-settings/settings-sheet-overlay.tsx`,
classe `bg-inverse-surface/30`), componente pré-existente e usado por Settings, notas, lembretes e
agora também pelo `MessageTraceSheet`. Hoje esse backdrop não escurece nada (mesmo sintoma:
`rgba(0,0,0,0)`, altura colapsada a 0). Não corrigi porque está fora dos 3 achados desta rodada e é
um componente compartilhado por várias telas — mudança de maior raio de impacto do que o pedido.
