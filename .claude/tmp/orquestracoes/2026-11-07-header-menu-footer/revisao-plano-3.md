# Revisão do plano — rodada 3 — header-menu-footer

## Veredito
aprovado

## Convenções carregadas
- code-write-code: `SKILL.md` e `coding-patterns/lint.md` (seção "Unused values"), mais um `grep` de "unused / dead code" em toda a skill. Os subarquivos `mobile/{mobile-bottom-sheet-overlay,mobile-icon-colors}.md` e `frontend/{component-variant-maps,frontend-code-preferences,react-components}.md` foram lidos nas rodadas 1 e 2, e os trechos tocados agora não pedem releitura.
- code-get-coding-designs: `SKILL.md` (os designs `mobile-app-structure`, `page-structure` e `feature-state-components-structure` vêm da rodada 1).
- Código lido nesta rodada: `D/src/layout/components/common/chat-shell.tsx` (inteiro), `D/src/pages/chat-populated/page.tsx:1-40`, `D/src/layout/components/common/picker-shell.tsx:15-48`, `D/package.json` (versão do tailwind), um `grep` de `z-*` em `D/src` e em `D/src/core`, `B/src/layout/components/chat-input/chat-input-input.tsx`, `B/src/pages/chat/components/chat-footer/chat-footer.tsx`, `B/src/layout/utils/colors.ts` (grep), `B/app/prototipo/header-menu-footer/v4.tsx:93-97`, um `grep` de `onSend` em `B/src/layout/components/chat-input/` e um `grep` em `B/src/pages/chat/page.tsx`.

## Bloqueios
nenhum

## Notas
- plano.md:94, passo 11: o plano diz que "o `ChatInputContext` continua expondo `onSend`". Só que, depois dos passos 9 e 11, ninguém mais lê esse campo. Os dois leitores de hoje são `chat-input-input.tsx:13` e `chat-input-action-button.tsx:19`; o primeiro perde o campo no passo 11 e o segundo é apagado no passo 9. O envio passa a ser só o `onPress={handleSend}` do botão nos footers (passos 15 e 16). Com isso, `onSend` vira prop obrigatória do `ChatInput.Root` (`chat-input-root.tsx:9`) que nada chama. O lint não acusa porque é um campo de tipo, e não há regra escrita nas skills que cubra isso, então fica como nota. Conserto opcional: tirar `onSend` de `contexts/chat-input.ts:7` e de `chat-input-root.tsx:9,18,25`, e o `onSend={handleSend}` dos dois footers.
- plano.md:87, passo 6: o passo não diz se o scrim e o wrapper ficam dentro dos `children` do `ChatShell` ou como irmãos dele, num fragment. Conferi que as duas posições dão o mesmo empilhamento. Nenhum ancestral cria stacking context: a raiz do `ChatShell` é só `relative` (`chat-shell.tsx:22`), o `<main>` não tem `z` nem `transform` (:33-41) e `D/src/core` não tem wrapper com `transform`. Não é achado, fica registrado para o implementador não hesitar.

## Bloqueios da rodada anterior
1. Camadas do `/app/chat-menu-open` (scrim abaixo do topo e do rodapé do `ChatShell`): **corrigido**. Em plano.md:87 o scrim é `fixed inset-0 z-60 bg-inverse-surface/30` e o wrapper é `fixed bottom-0 left-1/2 z-70 flex w-full max-w-120 -translate-x-1/2 flex-col`, e o texto diz que o `ChatShell` não muda. Confere com o código:
   - o `<header>` e o `<footer>` do `ChatShell` são `z-50` (`chat-shell.tsx:23,43`);
   - o wrapper do gabarito, com essas classes, fica em `picker-shell.tsx:43`;
   - o `D/package.json` traz `"tailwindcss": "^4.3.0"`, e o Tailwind v4 gera `z-<n>` para qualquer inteiro;
   - nenhum elemento de `D/src` passa de `z-50`, então nada fica por cima do scrim `z-60`.

   O topo e o campo ficam sob o fundo escurecido, como em `v4-4.png`.

## Novos nesta rodada
Conferi as edições dos passos 9, 11, 13, 15, 18 e 24 e não achei bloqueio novo:
- **Passo 9** (plano.md:92): agora tem `onPress={onPress}` e `disabled={disabled}` no `Pressable`. É isso que os passos 15 e 16 usam.
- **Passo 11** (plano.md:94): `useState(TEXT_MIN_HEIGHT)`. Os trechos que saem conferem com o arquivo: `handleSubmit` em `chat-input-input.tsx:15-19`, `onSend` em :13 e `blurOnSubmit` em :30. O `disabled` continua em uso no `editable`. Veja a nota sobre o `onSend` que fica no contexto.
- **Passo 13** (plano.md:97): `X` com `color={onSurface}`. O `onSurface` existe (`colors.ts:9`), e a V4 usa a mesma cor (`v4.tsx:95`).
- **Passo 15** (plano.md:105): `disabled={isDisabled}` no enviar. As linhas citadas conferem: `chat-footer.tsx:42` é o `onPress` anulado e :44,52 são o `ink`.
- **Passo 18** (plano.md:112): `function handleOpenMenu() { router.push(ROUTES.menu) }`. O `router` (`page.tsx:36`) e o `ROUTES` (:5) já existem, e o passo substitui a arrow inline de hoje (:82).
- **Passo 24** (plano.md:129): o passo diz que o `handleOpenMenu` foi "criado no passo 18" e troca só o corpo dele. A ordem fecha, e o `router` continua em uso no `handleSelectMenuEntry`.

## Desvios de padrão julgados
Nenhum desvio mudou desde a rodada 2. Continuam aceitos:
- `style` no `Animated.View`, passos 8 e 13;
- `text-[13px]` e `text-[15px]`, passos 1, 3, 11 e 17;
- a peça nova convivendo com a cópia do `task-picker-sheet`, passo 20.

## Spec em dúvida
nenhum

## Premissas
- Não reabri o que as rodadas 1 e 2 deram como conferido. Li só o passo 6 e os trechos editados dos passos 9, 11, 13, 15, 18 e 24, conforme o delta.
- Não subi a galeria para comparar com `v4-4.png`. A conclusão do passo 6 vem de ler o empilhamento no código, e o S49 fará a prova visual.
- Deixei o `onSend` sem leitor como nota porque nem o lint nem as skills carregadas têm regra para campo de contexto sem uso. Além disso, o plano declara a escolha de forma explícita, então o implementador não precisa adivinhar.
