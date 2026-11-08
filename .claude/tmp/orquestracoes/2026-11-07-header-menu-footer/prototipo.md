# Protótipo — topo centralizado e menu no footer do chat

Spec: spec.md (`[Visual]`, AC-001 a AC-005, AC-009, AC-010, AC-011, AC-019). Todas as variações respeitam `Manter`: topo
logo + "Ben" | data centralizado, menu à esquerda do campo, microfone/enviar à direita na mesma linha, o rodapé inteiro
vira a gravação (sem o botão do menu), mensagens encostadas no rodapé, seletor de tarefa ativa abaixo do topo.

## Variações
V1 — pílula única: menu (esquerda) e microfone/enviar (direita) moram dentro do mesmo campo arredondado; sheet em lista de linhas (ícone, rótulo, contagem à direita); gravação na mesma pílula com cancelar (X) à esquerda, onda no meio e enviar à direita.
V2 — peças soltas: botão do menu redondo fora do campo, campo retangular que cresce com o texto (várias linhas), microfone/enviar redondo; sheet em grade 2x2 de cartões (ícone no topo, rótulo e contagem embaixo); gravação em cartão alto com tempo, onda e dois botões largos Cancelar / Enviar.
V3 — campo preenchido sem borda; sheet com cabeçalho de marca (BrandMark + fechar), linhas separadas com contagem em chip e seta; gravação em linha única estilo mensageiro, com "Slide to cancel" embutido e o botão enviar grande à direita.

## V4 (rodada 3)
V4 — V1 + campo menor, ícones menores e campo que cresce com o texto (pedido do usuário, verbatim: "v1, mas input de ser menor, icones menores e input pode crescer com mais texto"). Rota `packages/infra/mobile/ben/app/prototipo/header-menu-footer/v4.tsx` (cópia da V1; `shared.tsx` não foi tocado, v1-v3 intactas). URL: `/prototipo/header-menu-footer/v4?state=chat|writing|recording|menu` (`&draft=overflow` mostra o teto).
- Medidas (V1 -> V4): altura da pílula em repouso 60 -> 44px (borda 1.5px, raio 22px); botões de menu/microfone/enviar/cancelar 44 -> 32px; ícones 22 -> 16px (X de cancelar 20 -> 16); texto 16 -> 15px, linha 20px; barra de gravação também 44px.
- Crescimento: a área de texto vai de 1 linha (32px, pílula 44px) a no máximo 5 linhas (112px, pílula 120px); acima disso rola por dentro do campo. Medido no navegador: rascunho de 4 linhas -> pílula 100px; 8 linhas digitadas -> trava em 112px; voltar a 1 linha -> volta a 32px. Teto de 5 linhas é decisão minha (premissa): deixa ~120px de 844 para o campo e o chat continua visível; ajustável em `TEXT_MAX_LINES`.
- Menu e microfone/enviar ficam alinhados à base da pílula (`items-end`) enquanto o campo cresce; o espaço do scroll acompanha a altura da pílula (`onLayout`).
- Premissa: o auto-ajuste de altura mede o `scrollHeight` do textarea (só web; no nativo usar `onContentSizeChange`). O sheet mantém os ícones de 16px da V1 (já eram pequenos); o pedido "ícones menores" foi aplicado ao campo.
- Prints (390x844, inglês, abertos e conferidos): `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v4.png` (chat), `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v4-2.png` (escrevendo, rascunho de 4 linhas), `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v4-3.png` (gravando), `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v4-4.png` (sheet), `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v4-5.png` (extra: teto de 5 linhas com rolagem).
- Prints tirados com `playwright-core` + `/usr/bin/google-chrome` (script em `/tmp/pw/r3/v4.js`); o Expo da :8081 já estava de pé e foi reaproveitado.

## Onde está
- Rotas: `packages/infra/mobile/ben/app/prototipo/header-menu-footer/v1.tsx`, `v2.tsx`, `v3.tsx`
- Compartilhado (dados fixos, topo centralizado, tela do chat, onda): `packages/infra/mobile/ben/src/prototipo/header-menu-footer/shared.tsx`
- URL: `http://localhost:8081/prototipo/header-menu-footer/v{n}?state=chat|writing|recording|menu` (`&lang=pt-BR` para português). Os estados também são interativos (menu, microfone, cancelar).
- Reaproveita componentes reais: BrandMark, BenLogo, MessageBubble, CaptureCard, ActiveTaskPeek, MenuSheet, WaveBar, formatShortDate, tema Tailwind e strings reais (menuStrings, chatStrings, chatInputStrings, recordingStrings).

## Premissas
- A rota `/prototipo/...` fica fora de `(protected)`, então não passa pelo redirect de login; nenhum arquivo existente foi editado.
- A pasta do protótipo é duas: rotas em `app/prototipo/header-menu-footer/` e o módulo compartilhado em `src/prototipo/header-menu-footer/` (Expo Router transformaria qualquer arquivo de `app/` em rota).
- O sheet é desenhado inline com o `MenuSheet` real sobre um fundo escurecido (`bg-inverse-surface/30`), sem o `Modal`, para o print ser estável; em produção usa o padrão `SettingsSheetOverlay`/`TaskPickerSheet`.
- Os campos do protótipo são decorativos (sem envio); o estado "escrevendo" mostra o rascunho longo fixo; a data é fixa em "Sat, Nov 7" via `formatShortDate(new Date(2026, 10, 7))`.
- O tempo da gravação é fixo em 0:07; a onda anima com o `WaveBar` real. Em V3 o "deslizar para cancelar" é só o texto tocável (o gesto real fica para a implementação).
- Só o chat foi prototipado; o rodapé do workspace (AC-019) usa as mesmas peças e não tem tela própria aqui.
- Playwright MCP não conectou nesta sessão (CONNECT_TIMEOUT); os prints foram tirados com o pacote `playwright` do Node (`/tmp/pw`) e o Chromium em `~/.cache/ms-playwright`, em 390x844.
- O `WaveBar` real não mostra as barras no web (o `Animated.View` ignora `className`: largura 0 e sem cor, medido no DOM). Isso já existe hoje no app web e não é do protótipo; aqui a onda usa uma cópia local (`ProtoWaveBar`, estilo explícito). Vale checar na implementação.
- Servidor: eu subi o Expo web (`pnpm --filter @ben/mobile-ben dev`, log em `.claude/tmp/expo-r2.log`) porque a :8081 estava livre; ele continua de pé.

## Prints
Cada variação tem 4 estados (390x844, inglês):
- V1: `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1.png` (chat), `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1-2.png` (escrevendo, enviar), `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1-3.png` (gravando), `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1-4.png` (sheet aberto)
- V2: `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v2.png`, `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v2-2.png`, `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v2-3.png`, `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v2-4.png`
- V3: `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v3.png`, `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v3-2.png`, `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v3-3.png`, `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v3-4.png`
Todos abertos e conferidos (texto carregado, topo centralizado, rascunho inteiro visível, onda visível).

## Gate da escolha — rodada 1
Resposta do usuário (verbatim): "v1, mas input de ser menor, icones menores e input pode crescer com mais texto"
Ação: montar V4 = V1 com campo de texto menor, ícones menores e campo que cresce com mais texto; mostrar de novo ao usuário.

## Escolha
Variação:   V4 = V1 + campo menor, ícones menores, campo que cresce com o texto
Prints:     prototipo/v4.png, prototipo/v4-2.png, prototipo/v4-3.png, prototipo/v4-4.png, prototipo/v4-5.png
Base:       packages/infra/mobile/ben/app/prototipo/header-menu-footer/v4.tsx; packages/infra/mobile/ben/src/prototipo/header-menu-footer/shared.tsx (v1-v3 apagadas; removido de shared.tsx só o LONG_DRAFT, sem uso na V4)
git status: ?? packages/infra/mobile/ben/app/prototipo/ ; ?? packages/infra/mobile/ben/src/prototipo/ (só novos; nenhum arquivo existente modificado; typecheck e eslint sem erros). Premissa: as pastas alarme-tela-cheia e lembrete-criado-abrir-tela de outros protótipos não foram tocadas.
Descrição:  topo com logo + Ben | data centralizados, sem botão; composer em pílula única de 44px com o
            botão do menu (ícone 16px, botão 32px) à esquerda e microfone/enviar à direita dentro da
            pílula; o campo cresce até 5 linhas e depois rola; a gravação cabe na pílula (X à esquerda,
            onda, enviar à direita, 44px); o sheet do menu é uma lista com as 4 opções.
Comentários do usuário: rodada 1 — "v1, mas input de ser menor, icones menores e input pode crescer com mais texto"; rodada 2 — "Aprovo a V4 (recomendada)"
