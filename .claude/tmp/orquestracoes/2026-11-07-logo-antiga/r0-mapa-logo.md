# r0 — mapa da logo (read-only)

Base: `packages/infra/mobile` (abreviado `M/`). Memória (`.claude/memory/*`): nenhum registro sobre logo/marca/assets (só `business-rules/razao-de-negocio-e-casos-de-uso-v1.md`, não pertinente).

## Logo atual (header)
- Header do app: `M/ben/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx:23` renderiza `<BrandMark />` (`M/ben/src/layout/components/brand-mark.tsx`: `BenLogo variant="brand" size=30` + wordmark "Ben", `text-ink`, 23px). Também usado em `M/ben/src/layout/components/menu/menu-sidebar.tsx:63`.
- Fonte vetorial: `M/ben/src/layout/components/icons/ben-logo.tsx` — componente `react-native-svg`, viewBox 30x30. Geometria: balão de chat com orelha de página (dog-ear): `BALLOON_PATH` + `FOLD_PATH` + 3 barras verticais arredondadas (`Rect` x=9/13.8/18.6; alturas 6/11/4, estilo "onda de voz").
- Cores (`M/ben/src/layout/utils/colors.ts`): variante `brand` = corpo `primary #f9a12f` (âmbar), dobra `brandLight #f3dcbb`, barras `ink #1d1814`. Variante `avatar` = corpo branco `#ffffff`, traço `dogEar #e9d5c1`, barras `#f9a12f` (usada no avatar do Ben nos balões: `chat-history.tsx:75`, `chat-history-item.tsx:55`).
- Login: `M/ben/src/pages/login/page.tsx:33` usa `BenLogo variant="brand"` (default size 30) + wordmark. Atual.
- Sandbox de design (:3002): NÃO tem a logo atual. `M/design/src/layout/components/icons/ben-logo.tsx` ainda é a antiga (3 círculos, `viewBox 36x28`, `currentColor`, circles (9,9,r5) (22,14,r6) (13,22,r4)), renderizada via `M/design/src/layout/components/common/brand-mark.tsx` com `text-primary` = `#121213` preto (`design/src/core/global.css:22`). Usada em chat-shell, detail-shell, picker-shell, menu-sidebar, telas login-*, galeria `/components/brand-mark` (`pages/brand-mark-preview/page.tsx`). A doc do contexto já diz que o sandbox "ainda não adotou esse tema" (`.claude/skills/code-get-project-context/mobile/ben/description.md:45`).

## Onde aparece logo
| local | arquivo | formato/dimensões | antiga ou atual | evidência |
|---|---|---|---|---|
| Header do chat e sidebar (app) | `M/ben/src/layout/components/icons/ben-logo.tsx` via `brand-mark.tsx` | SVG (react-native-svg) 30x30 | ATUAL (balão âmbar) | ler arquivos; commit d37fcdd |
| Login (app) | `M/ben/src/pages/login/page.tsx:33` | idem | ATUAL | idem |
| Avatar Ben nos balões | `chat-history*.tsx` | idem, variante `avatar` | ATUAL | idem |
| Ícone do app (iOS/base) | `M/ben/assets/icon.png`, `app.config.ts:10` | PNG 1024x1024 RGBA (iOS exige opaco, sem alpha ideal) | ANTIGA (3 círculos pretos em fundo #f9f9f9) | imagem aberta com Read |
| Android adaptive foreground | `M/ben/assets/adaptive-icon-foreground.png`, `app.config.ts:26` (bg `#f9f9f9`) | PNG 1024x1024 com alpha | ANTIGA (gerado dos círculos, cor `#121213`) | script `generate-icons.mjs` + mtime; não aberto, mesma origem |
| Android monochrome | `M/ben/assets/adaptive-icon-monochrome.png`, `app.config.ts:28` | PNG 1024x1024 alpha, preto | ANTIGA | idem |
| Splash | `M/ben/assets/splash-icon.png`, plugin `expo-splash-screen` `app.config.ts:36-41` (imageWidth 180, contain, bg `#f9f9f9`) | PNG 1024x1024 alpha | ANTIGA (círculos pretos) | Read |
| Notification icon (status bar Android) | `M/ben/assets/notification-icon.png`, `app.config.ts:49` (color `#121213`) | PNG 96x96 alpha, branco | ANTIGA (gerado dos círculos) | script |
| Favicon web (:8081) | `M/ben/assets/favicon.png`, `app.config.ts:31` | PNG 64x64 RGBA, fundo #f9f9f9 | ANTIGA (3 círculos pretos) | Read |
| Android nativo gerado | `M/ben/android/app/src/main/res/mipmap-*/ic_launcher*.webp` | webp, gitignorado (`ben/.gitignore:18`), gerado por `expo prebuild` | ANTIGA, regenerada no próximo prebuild a partir de assets/ | `git check-ignore`; mtime 2026-10-30 |
| Favicon do sandbox (:3002) | `M/design/index.html:5` -> `M/design/public/favicon.svg` | SVG 48x46 | NEM antiga nem atual: raio roxo `#863bff`, favicon padrão do template Vite | head do SVG |
| `M/design/public/icons.svg` | — | sprite (bluesky etc.), template Vite | irrelevante, sem uso aparente de logo | head |
| `M/design/dist/` | build | gitignorado (`design/.gitignore`) | stale se existir | git check-ignore |
| README | `M/ben/README.md:8-24` | texto | DESATUALIZADO: descreve a marca como "três círculos em #121213 sobre #f9f9f9" e manda manter `generate-icons.mjs` em lockstep com `ben-logo.tsx` | leitura |

Não existe `+html.tsx`/`public/` no app Ben; favicon web vem só de `app.config.ts web.favicon`. `eas.json` não referencia ícones.

## Histórico
- `ben-logo.tsx`: criado em 7f9014f (2026-10-03, move do projeto; versão 3 `Circle`). Mudou para o balão em d37fcdd (2026-10-26, "simple-loop(chat-v2-design): impl — theme-foundation"; também mudou `brand-mark.tsx` e a paleta para âmbar, 0c29803 "finalize" mexeu em `colors.ts`). Essa é a mudança que o usuário vê no header.
- `assets/*.png` e `scripts/generate-icons.mjs`: só tocados em 7f9014f (2026-10-03). Nunca atualizados depois do redesign. "A antiga" = os 3 círculos pretos (`#121213`/`#f9f9f9`), anterior a 2026-10-26. (mtime 10-30 nos arquivos é checkout/regeneração por `pnpm icons`, conteúdo idêntico à geometria antiga.)
- Design sandbox: `ben-logo.tsx`, `brand-mark.tsx`, `public/` só em ce575bb/7af5c2f (outubro 03-04); nunca receberam o balão.

## Ferramentas
- `M/ben/scripts/generate-icons.mjs` (`pnpm --filter @ben/mobile-ben icons`): gera os 6 PNGs sem dependência de imagem (zlib + rasterização própria de CÍRCULOS por cobertura de pixel; constantes `MARK.circles`, `SURFACE`/`PRIMARY` `#f9f9f9`/`#121213`). Só sabe desenhar círculos; para o balão precisaria rasterizar Path com curvas (arcos `a`), dog-ear e barras arredondadas, ou adicionar dependência.
- ARMADILHA: `pnpm icons` roda antes de `dev`, `start`, `android` e `apk` (`ben/package.json:7-13`). Substituir os PNGs à mão NÃO basta: o próximo `pnpm dev` sobrescreve com os círculos. É preciso mudar o script (ou removê-lo dos hooks).
- Disponíveis: `pngjs` e `react-native-svg` no node_modules raiz. Ausentes: sharp, @resvg, canvas, svgo; `convert`/`magick`/`rsvg-convert`/`inkscape` não instalados no PATH. Expo tooling não gera ícones a partir de SVG (precisa PNG pronto). Não verifiquei python/PIL/cairosvg nem Playwright/Chromium para rasterizar (browser-mobile-tester existe como agente, o que dá um caminho: renderizar SVG no Chromium e capturar).
- Template do ícone iOS: 1024x1024 sem transparência; adaptive Android: conteúdo na zona segura central (~66%, o script usa 0.6 da diagonal).

## Como observar
- Web :8081 (`pnpm dev:mobile`, roda `pnpm icons` antes): aba do navegador mostra `favicon.png` (64x64; ver pelo `<link rel=icon>` no HTML servido ou abrir `/favicon.ico`/URL do asset). Header/login: renderização SVG, observável por screenshot (agente browser-mobile-tester).
- Splash: no web não há splash nativo igual; `SplashScreen.preventAutoHideAsync` (`app/_layout.tsx:19`) só tem efeito nativo. Observável apenas em Expo Go/dev-client/APK.
- Ícone do launcher, adaptive icon, monochrome, notification icon: não observáveis no web; só em aparelho/emulador (APK/`expo run:android`). Dá para validar o PNG em si (Read, dimensões via `file`, pixels via pngjs) e checar o `app.config.ts` resolvido (`npx expo config --type public` não executado).
- Sandbox :3002: logo visível no header dos shells e em `/components/brand-mark`; aba mostra o raio roxo do Vite.

## Dúvidas que só o usuário responde
1. Escopo: "logo do projeto" = ícone do app/splash/favicon/notificação do Ben mobile (assets/), ou também o sandbox de design (BenLogo antigo em círculos + favicon Vite roxo)?
2. Ícone do launcher: aplicar a marca do header (balão âmbar com barras) com fundo claro/âmbar? Adaptive Android: foreground = balão, fundo atual `#f9f9f9` ou âmbar? Notification icon (monocromático branco) em silhueta do balão com barras recortadas?
3. Aceita adicionar dependência de rasterização (ex.: sharp/resvg) ou prefere manter o script sem dependência (rasterizador próprio de Path)?

## Premissas
- "Logo atual" = `BenLogo` variante `brand` (balão âmbar), a do header.
- "Antiga" = 3 círculos pretos de antes de d37fcdd.
- O foco é o app mobile `ben/`; o sandbox de design é secundário e só entra se o usuário confirmar.
- Não abri adaptive-icon-*.png e notification-icon.png (mesma origem do script, círculos); abri icon, splash e favicon.
- Android `android/` é gerado e gitignorado; não se edita.
