# Plano — Trocar a logo antiga (3 círculos) pelo balão âmbar do header nos ícones do app Ben

> Volta de correção 2: o plano não manda mais escrever comentário no `colors.ts` (os nomes `silhouetteThemed` e `silhouetteNotification` bastam; nenhum outro trecho manda escrever comentário em código); a máscara da silhueta usa `fill="white"` e `fill="black"` em vez de hex; o risco do import `.ts` ganhou decisão (o implementador para e reporta, sem escolher outro caminho); o passo 5 cita `width`, `height`, `fill="none"` e `strokeProps`. Roteiro intacto (17 provas, nenhuma acrescentada ou dispensada).
>
> Volta de correção 1: os arquivos de hash da CB-002 saem de `$TMPDIR` (vazio) para a pasta da run; o preto e o branco da silhueta migram para `colors.ts` (some o desvio de `mobile-icon-colors.md`) e o desvio de `component-variant-maps.md` fica declarado; a PR-011 passa a ter prova de que o `mv` simula a ausência, o import `.mjs` → `.ts` → `./colors.ts` foi testado no Node 24 e as notas da revisão foram aplicadas. Roteiro intacto (17 provas, nenhuma acrescentada ou dispensada).

## Resumo do plano

### O que muda

#### Checkpoint 1 — Marca com fonte única, gerador por SVG e ícones novos
- **Antes de editar.** Guarda os 6 PNGs de hoje e o SHA base numa pasta ignorada pelo git (`.claude/tmp/.../antes/`), para as fotos de "antes" não dependerem do HEAD depois dos commits.
- **Rasterizador.** `@resvg/resvg-js` entra como dependência de dev de `@ben/mobile-ben` (e no `pnpm-lock.yaml`). É a única instalação com rede; depois dela o gerador roda offline.
- **Fonte única da marca.** Arquivo novo `src/layout/utils/ben-logo-geometry.ts` com o viewBox, o contorno do balão, a dobra, as 3 barras, o traço e as paletas `brand` e `avatar` (as cores vêm do `colors.ts`). `ben-logo.tsx` passa a montar os elementos SVG a partir dele (a tela sai igual) e o gerador monta o SVG em texto a partir do mesmo módulo.
- **Cores no `colors.ts`.** O módulo ganha `background = '#f6f4f2'` (o mesmo valor do tema) e as duas cores de silhueta (`silhouetteThemed = '#000000'`, `silhouetteNotification = '#ffffff'`). `app.config.ts` lê `background` para o adaptativo e para o splash, e `primary` (âmbar) para a cor da notificação; some o `#f9f9f9` e o `#121213`.
- **Gerador reescrito.** `scripts/generate-icons.mjs` perde o encoder PNG e o desenho de círculos e passa a rasterizar o SVG com o resvg: mesmos 6 arquivos, mesmos nomes e tamanhos. O balão é centrado pelo contorno (não pelo viewBox), o ícone e o favicon saem opacos sobre `#f6f4f2`, o adaptativo e o splash saem transparentes com o balão dentro dos 66% centrais, o tematizado e a notificação saem em silhueta de uma cor com as 3 barras vazadas (notificação branca).
- **Falha não passa em silêncio.** Rasterizador ausente ou erro numa geração imprime o passo que falhou e "rode `pnpm install` na raiz" e sai com código 1; os quatro comandos que já chamam `pnpm icons &&` (dev, start, android, apk) param.
- **README do app.** A seção "Branding assets" passa a descrever o balão âmbar do header e como regenerar os ícones, sem os círculos nem as cores antigas.
- **PNGs regenerados.** Roda o gerador e versiona os 6 PNGs novos; depois `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`.

### Decisões que travei sozinho
- **Escala de cada arquivo.** Ícone do app 60% do maior lado do balão; adaptativo e tematizado com a diagonal do contorno em 60% (cabe no círculo de 66%); splash 64% do maior lado (dentro do quadrado de 66%); notificação 86% e favicon 80% do maior lado. O splash continua com `imageWidth: 180`, mas o balão aparece menor que os círculos de hoje (que ocupavam 72% da largura), porque agora precisa caber nos 66% centrais.
- **Cor da silhueta tematizada.** Preto puro `#000000` (o Android tinge); notificação em branco `#ffffff`. As duas ficam no `colors.ts` (a skill de cores de ícone manda todo hex ali, e o arquivo já abriga `onSurfaceVariantMuted`, que também não é token do tema); o módulo de geometria só as repassa, e o script não declara hex nenhum.
- **Constantes de cor no `colors.ts`** (não em arquivo novo), porque já é o módulo de hexes de ícone; as duas de silhueta entram sem comentário, porque os nomes `silhouetteThemed` e `silhouetteNotification` já dizem o que são.
- **Paleta fora do componente.** `BenLogoVariant` e `variantPalettes` saem do `ben-logo.tsx` para o módulo de geometria, porque o script Node precisa ler as mesmas cores; é um desvio declarado de `component-variant-maps.md`.
- **Importação com caminho relativo e extensão `.ts`** no módulo novo (o script Node não resolve `@/`); é um afastamento declarado em Desvios de padrão (conferido no Node 24 numa cópia mínima: `.mjs` → `.ts` → `./colors.ts` carrega). O aviso "Reparsing as ES module" do Node 24 fica como ruído; o `package.json` do app não ganha `"type": "module"`.
- **Se o bundle do app quebrar por causa do import com `.ts`**, o implementador não improvisa outro caminho (copiar o hex ou trocar a forma de importar quebraria o RT-004): para, registra o erro e devolve o checkpoint como falho para novo planejamento. O Metro 0.83.3 e o typecheck aceitam esse import, então a expectativa é que não quebre.
- **Máscara da silhueta com nomes de cor do SVG** (`white`, `black`), não hex, para o script não declarar cor nenhuma.
- **Nenhum teste Vitest novo**, como o usuário decidiu no gate. As provas por comando (PR-005, PR-008, PR-010, PR-011) rodam na validação e não ficam versionadas.
- **Nenhuma prova do roteiro foi acrescentada ou dispensada.** As 17 provas do roteiro aprovado entram como estão. S13 a S15 dependem de uma sessão semeada em `localStorage`; se o servidor não permitir montar o token, elas caem para leitura de código mais S12, como já combinado no roteiro.

### O que fica de fora
- Sandbox de design (:3002), a pasta `android/`, o texto "Ben" nos ícones e qualquer retoque nas cores do tema.
- Teste versionado sobre os PNGs e limpeza separada de restos antigos (recusados no gate).
- Capturas de aparelho (launcher, splash nativo, notificação na barra de status): só o APK as mostraria; aqui os arquivos são provados por pixel e por foto.

### Como se prova
AC-001 — o ícone do app mostra o balão âmbar sem "Ben" sobre `#f6f4f2` e nenhum círculo preto (S01; PR-010 na lane codigo).
AC-002 — o adaptativo composto sobre `#f6f4f2` mostra balão e barras inteiros nas máscaras circular, arredondada e quadrada (S02, S03, S04; PR-010 confere os 66%).
AC-003 — o tematizado é silhueta de uma cor com as 3 barras vazadas (S05; PR-010 confere o alfa).
AC-004 — o splash mostra o balão âmbar centralizado sobre `#f6f4f2` (S06; PR-010).
AC-005 — a aba e o `favicon.png` mostram o balão âmbar sobre fundo claro (S08, S09, S11).
AC-006 — a notificação é silhueta branca com as 3 barras vazadas e a cor da notificação no `app.config.ts` é o âmbar (S07, S10; PR-010).
AC-007 — gerar duas vezes seguidas e sem rede deixa os arquivos idênticos, o gerador usa o módulo único e o comando de subir para se o rasterizador falta (RT-004 na lane codigo com PR-005; RT-002 com PR-011; PR-010; S09).
AC-008 — a busca no README não acha círculos nem as cores antigas e o texto descreve o balão e como regenerar (PR-008 na lane codigo).
AC-009 — login, header, menu e avatar do Ben iguais aos de antes (S12, S13, S14, S15; PR-005 mostra que o componente só mudou a origem dos dados).
AC-010 — o sandbox mantém a logo de 3 círculos e o favicon do Vite (S16, S17).
AC-011 — o splash continua com 180 de largura e centralizado (S06; PR-010 lê o `app.config.ts`).

## Objetivo
Os 6 arquivos de ícone do app Ben saem do balão âmbar do header, gerados por um rasterizador de SVG a partir do mesmo módulo de dados que o componente `BenLogo` usa, sobre o fundo `#f6f4f2`, e o README descreve isso.

## Passos

### Checkpoint 1 — Marca com fonte única, gerador por SVG e ícones novos
1. (infra; pré-requisito do passo 9, que sobrescreve os PNGs, por guardar o "antes" que as provas S01 a S11 usam) **`.claude/tmp/orquestracoes/2026-11-07-logo-antiga/antes/`** — antes de qualquer edição: `mkdir -p` a pasta, `git rev-parse HEAD > antes/BASE_SHA` e `cp packages/infra/mobile/ben/assets/*.png antes/`. A pasta fica em `.claude/tmp/`, que o git ignora; não commitar.
2. (RT-001) **`packages/infra/mobile/ben/package.json`** e **`pnpm-lock.yaml`** — na raiz: `pnpm --filter @ben/mobile-ben add -D @resvg/resvg-js`. Conferir que `node_modules/@resvg/resvg-js` e o pacote nativo da plataforma existem. Com `nodeLinker: hoisted` (`pnpm-workspace.yaml`), os dois pacotes caem em `node_modules/@resvg/resvg-js` e `node_modules/@resvg/resvg-js-linux-x64-gnu` na **raiz**, e `packages/infra/mobile/ben/node_modules` não ganha cópia (conferido numa instalação de teste em workspace hoisted no scratch, com o `pnpm@11.18.0` do repo: nenhum aviso de build script, nenhum `allowBuilds` a acrescentar). Se o pnpm do implementador avisar de build script ignorado, tratar em `pnpm-workspace.yaml` (`allowBuilds`) conforme o aviso.
3. (RT-003, RT-005) **`packages/infra/mobile/ben/src/layout/utils/colors.ts`** — acrescentar `export const background = '#f6f4f2'` junto de `surfaceLowest` (o valor é o `background` do `tailwind.config.js`, linha 95, e o comentário do topo manda manter lockstep) e, no fim do arquivo, depois de `onSurfaceVariantMuted`, `export const silhouetteThemed = '#000000'` e `export const silhouetteNotification = '#ffffff'`, sem comentário: os nomes `silhouetteThemed` e `silhouetteNotification` já dizem que são cores de silhueta.
4. (RT-004) **`packages/infra/mobile/ben/src/layout/utils/ben-logo-geometry.ts`** (novo, sem import de React Native; importa `./colors.ts` por caminho relativo, `import { brandLight, dogEar, ink, primary, silhouetteNotification, silhouetteThemed, surfaceLowest } from './colors.ts'`) — mover do `ben-logo.tsx` e exportar:
   - `export type BenLogoVariant = 'brand' | 'avatar'` e `export type BenLogoPalette = { body: string; fold: string; stroke?: string; bars: string }`
   - `export type BenLogoBar = { x: number; y: number; width: number; height: number; radius: number }`
   - `export const LOGO_VIEW_BOX_SIZE = 30`
   - `export const BALLOON_PATH` e `export const FOLD_PATH` (as strings de hoje, sem mudar um caractere), `export const STROKE_WIDTH = 1.2`
   - `export const BAR_SHAPES: BenLogoBar[]` = `{x:9,y:13,width:2.4,height:6,radius:1.2}`, `{x:13.8,y:10.5,width:2.4,height:11,radius:1.2}`, `{x:18.6,y:14,width:2.4,height:4,radius:1.2}`
   - `export const BALLOON_BOUNDS = { minX: 3, minY: 3, maxX: 27, maxY: 30 }` (contorno do `BALLOON_PATH`: a cauda desce até y 30, o centro do balão é (15; 16,5), não o do viewBox)
   - `export const variantPalettes: Record<BenLogoVariant, BenLogoPalette>` (`brand: { body: primary, fold: brandLight, bars: ink }`, `avatar: { body: surfaceLowest, fold: brandLight, stroke: dogEar, bars: primary }`, valores idênticos aos de hoje)
   - `export const SILHOUETTE_COLORS = { themed: silhouetteThemed, notification: silhouetteNotification }` (só repassa os valores do `colors.ts`; nenhum hex literal no módulo)
5. (RT-004) **`packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx`** — apagar as constantes e tipos movidos e importar do módulo novo por `@/layout/utils/ben-logo-geometry`. O JSX fica com o mesmo resultado: `<Svg width={size} height={size} viewBox={`0 0 ${LOGO_VIEW_BOX_SIZE} ${LOGO_VIEW_BOX_SIZE}`} fill="none">` (os quatro atributos de hoje; só o `viewBox` troca o literal `"0 0 30 30"` pela constante), os dois `Path` iguais (`<Path d={BALLOON_PATH} fill={palette.body} {...strokeProps} />` e `<Path d={FOLD_PATH} fill={palette.fold} {...strokeProps} />`, com `strokeProps` montado como hoje: `stroke`, `strokeWidth: STROKE_WIDTH` e `strokeLinejoin: 'round' as const` só quando `palette.stroke` existe, senão `{}`) e `BAR_SHAPES.map((bar) => <Rect key={bar.x} x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx={bar.radius} fill={palette.bars} />)`. `BenLogoProps` e a assinatura `BenLogo({ variant = 'brand', size = 30 })` não mudam (nenhum arquivo fora dele importa `BenLogoVariant`; conferido por grep).
6. (RT-001, RT-002, RT-004, RT-005, RT-003) **`packages/infra/mobile/ben/scripts/generate-icons.mjs`** — reescrever inteiro (sem comentário e sem nome abreviado, como manda `lint.md`; o ESLint do repo só impõe isso ao backend, então o lint não vai pegar desvio aqui e a revisão de código confere; use `index`, `error`, `size`, nunca `i`, `e`, `err`):
   - Imports: `node:fs/promises` (`mkdir`, `writeFile`), `node:path`, `node:url`, `{ BALLOON_BOUNDS, BALLOON_PATH, BAR_SHAPES, FOLD_PATH, LOGO_VIEW_BOX_SIZE, SILHOUETTE_COLORS, variantPalettes } from '../src/layout/utils/ben-logo-geometry.ts'` e `{ background } from '../src/layout/utils/colors.ts'`. O `@resvg/resvg-js` é importado dentro de um `try`, para o erro de ausência cair na mensagem de falha abaixo: `const rasterizer = await import('@resvg/resvg-js')` e `const { Resvg } = rasterizer.default ?? rasterizer` (o pacote é CJS com binding nativo; no teste de scratch no Node 24 o `Resvg` apareceu nos dois caminhos, e a forma com `default` cobre ambos).
   - O encoder PNG artesanal (`crc32`, `chunk`, `encodePng`, `zlib`) e `MARK`/`renderMark` saem; o resvg devolve o PNG.
   - Funções (nomes de referência): `buildSvg({ size, scale, layer, backgroundColor })` devolve o SVG em texto: `<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">`, um `<rect width height fill="{backgroundColor}"/>` só quando `backgroundColor` existe, e um `<g transform="translate({size/2} {size/2}) scale({scale}) translate({-centroX} {-centroY})">` com `centroX = (minX+maxX)/2` e `centroY = (minY+maxY)/2` de `BALLOON_BOUNDS` (centra pelo contorno). Camada `brand` (cores de `variantPalettes.brand`): `<path d=BALLOON_PATH fill=body/>`, `<path d=FOLD_PATH fill=fold/>` e um `<rect x y width height rx fill=bars/>` por item de `BAR_SHAPES`. Camada silhueta (cor única): um `<mask id="bars">` com `<rect fill="white">` cobrindo o viewBox da marca e os `BAR_SHAPES` com `fill="black"` (nomes de cor do SVG, nunca hex: a segunda busca do RT-004 reprova `#rrggbb` no script), e `<g mask="url(#bars)" fill="{cor}">` com os dois `path`; as barras ficam transparentes no PNG (furo), não pintadas.
   - `scaleToExtent(size, ratio) = (size * ratio) / Math.max(maxX - minX, maxY - minY)` e `scaleToDiagonal(size, ratio) = (size * ratio) / Math.hypot(maxX - minX, maxY - minY)`.
   - Tabela de saídas, nesta ordem fixa (a ordem do log não varia):

     | arquivo | tamanho | escala | fundo | camada |
     | --- | --- | --- | --- | --- |
     | `icon.png` | 1024 | `scaleToExtent(1024, 0.6)` | `background` (opaco) | brand |
     | `adaptive-icon-foreground.png` | 1024 | `scaleToDiagonal(1024, 0.6)` | transparente | brand |
     | `adaptive-icon-monochrome.png` | 1024 | `scaleToDiagonal(1024, 0.6)` | transparente | silhueta `SILHOUETTE_COLORS.themed` |
     | `splash-icon.png` | 1024 | `scaleToExtent(1024, 0.64)` | transparente | brand |
     | `notification-icon.png` | 96 | `scaleToExtent(96, 0.86)` | transparente | silhueta `SILHOUETTE_COLORS.notification` |
     | `favicon.png` | 64 | `scaleToExtent(64, 0.8)` | `background` (opaco) | brand |

   - Rasterização: `new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng()` (determinístico; sem consultar fontes do sistema), gravado em `assets/{file}`; log `assets/{file} {size}x{size}` por arquivo, como hoje. `mkdir(out, { recursive: true })` mantido.
   - Falha (RT-002, CB-001): `main()` com `try/catch` por etapa. Etapas nomeadas `load rasterizer` e `render assets/{file}`. No erro: `console.error('icons: failed at {etapa}: {error.message}')` e `console.error('Run `pnpm install` at the repository root and try again.')`, depois `process.exitCode = 1` e retorno, sem seguir para os arquivos seguintes. O Node 24 pode imprimir antes, no `stderr`, o aviso `MODULE_TYPELESS_PACKAGE_JSON` (ruído, também no sucesso); as duas linhas acima são as últimas do `stderr`. O `&&` dos scripts `dev`, `start`, `android` e `apk` (que não mudam) interrompe o comando. Nenhuma chamada de rede no script (CB-003).
7. (RT-003) **`packages/infra/mobile/ben/app.config.ts`** — `import { background, primary } from './src/layout/utils/colors.ts'` (mesmo estilo do import de `app-versions.ts` que já existe); `android.adaptiveIcon.backgroundColor: background`; plugin `expo-splash-screen` com `backgroundColor: background` (`imageWidth: 180` e `resizeMode: 'contain'` ficam); plugin `expo-notifications` com `color: primary`. `package.json` (scripts) não muda.
8. (PR-008) **`packages/infra/mobile/ben/README.md`** — reescrever a seção "Branding assets" (em inglês, como o resto do arquivo): a marca é o balão âmbar do header (`BenLogo`), sem o texto; a geometria e as cores vivem em `src/layout/utils/ben-logo-geometry.ts`, lido pelo componente e pelo gerador; `pnpm --filter @ben/mobile-ben icons` regenera os 6 arquivos e roda antes de `dev`, `start`, `android` e `apk`; o gerador usa `@resvg/resvg-js` (dependência de dev, instalada por `pnpm install`; sem internet depois disso) e, se faltar, para com a instrução de rodar `pnpm install` na raiz; manter a tabela de arquivos e o "mantenha os PNGs no git"; trocar a instrução de editar as constantes do script por editar o módulo de geometria. Não pode conter "circle", "círculo", `#121213`, `#f9f9f9` nem "no image dependency".
9. (RT-005, RT-003) **`packages/infra/mobile/ben/assets/*.png`** — rodar `pnpm --filter @ben/mobile-ben icons`; conferir as 6 linhas do log; conferir que `git status` mostra os 6 PNGs modificados. Os PNGs são versionados e entram no commit deste checkpoint.
10. (infra; fecha o checkpoint) **raiz** — `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`, nessa ordem; o lint precisa aceitar o `generate-icons.mjs` novo (sem comentários, sem nomes abreviados) e o `ben-logo-geometry.ts`. Se o typecheck reclamar do import com `.ts` no módulo novo, a causa é o `allowImportingTsExtensions`; o `tsconfig.json` do app já o liga (conferir antes de mexer).

## Marcos de validação
nenhum

## Ondas
onda única

## Contratos
- `ben-logo-geometry.ts` exporta exatamente: `BenLogoVariant`, `BenLogoPalette`, `BenLogoBar`, `LOGO_VIEW_BOX_SIZE`, `BALLOON_PATH`, `FOLD_PATH`, `STROKE_WIDTH`, `BAR_SHAPES`, `BALLOON_BOUNDS`, `variantPalettes`, `SILHOUETTE_COLORS`. Quem lê: `ben-logo.tsx` (por `@/`) e `scripts/generate-icons.mjs` (por caminho relativo com `.ts`). Nenhum dos dois declara contorno, barra ou hex da marca.
- `colors.ts` ganha `background`, `silhouetteThemed` e `silhouetteNotification`; lido por `app.config.ts` (`background`), pelo módulo de geometria (silhuetas e paletas) e, por ele, pelo gerador. `tailwind.config.js` não muda (já tem `background: '#f6f4f2'`).
- Saída do gerador: os 6 arquivos de `assets/` com nomes e tamanhos de hoje; código de saída 1 e, em falha, as duas linhas `icons: failed at ...` e `Run ...` como últimas do `stderr` (pode haver o aviso de reparse do Node antes delas).

## Fixtures
veredito: sem mecanismo
a mudar: nada

## Plano de teste
lane: browser, codigo
ambiente: `pnpm dev` (raiz: server-ben :3333 + app web :8081, regenera os ícones antes). Para as provas S01 a S08 e S10 a S11, que só leem arquivos, não precisa de ambiente; para S09 e S12, `pnpm dev:mobile` basta; S13 a S15 precisam do `pnpm dev` inteiro; S16 e S17 precisam também de `pnpm dev:design` (:3002)
estado: nenhum
url: `http://localhost:8081/`

Notas de execução do roteiro (não mudam as provas):
- **"Antes" dos PNGs (S01, S08, S09, S10, S11):** vem de `.claude/tmp/orquestracoes/2026-11-07-logo-antiga/antes/` (passo 1), não de `git show HEAD`, porque o HEAD já terá os PNGs novos depois do commit do checkpoint.
- **Página temporária de comparação (S01 a S08, S10, S11):** o tester monta um HTML sob `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-logo-antiga/comparacao/` (pasta ignorada; o Playwright não alcança o scratchpad do WSL), com `antes/` e os PNGs de `packages/infra/mobile/ben/assets/` lado a lado; fundo `#f6f4f2` para o adaptativo (com `border-radius: 50%`, `~22%` e `0` para as três máscaras, recortando em 66% do lado), fundo escuro para a notificação, contrastante para o tematizado, e `image-rendering: auto` nas reduções a 24 px e 16 px.
- **Sessão para S13 a S15:** o JWT do server é HS256 com payload `{ userId }` assinado com `JWT_PRIVATE_KEY` (`packages/infra/adapters/src/services/jwt.ts`). O tester assina um token com `jsonwebtoken` para um `userId` existente no SQLite do dev e semeia no `localStorage` do `http://localhost:8081` a chave `ben.jwttoken` (o web guarda por AsyncStorage, `secure-store.web.ts`). Se o app ainda não abrir `/chat` com isso, S13 a S15 são dispensadas e AC-009 fica provada por S12 mais `git diff {BASE_SHA} -- packages/infra/mobile/ben/src/layout/components/brand-mark.tsx packages/infra/mobile/ben/src/layout/components/chat-top-bar.tsx packages/infra/mobile/ben/src/layout/components/menu-sidebar.tsx` e os arquivos `chat-history*.tsx` sem nenhuma linha (comando do roteiro e decisão do orquestrador; registrar na saída).
- **"Antes" de S12 a S15:** o tester tira o print do login/chat/menu/avatar no commit base antes de aplicar os passos 4 e 5, ou, se isso já passou, compara contra o `ben-logo.tsx` do `BASE_SHA` (`git show {BASE_SHA}:...`), que mostra que props, paleta e geometria renderizadas são as mesmas.

### Roteiro — lane browser
S01 (PR-001; AC-001) [final] o tester abre a página temporária de comparação com o `icon.png` antes e depois → o "depois" mostra o balão âmbar sem o texto "Ben", sobre fundo claro, e nenhum dos 3 círculos pretos
S02 (PR-001; AC-002, CB-004) [final] o tester abre o `adaptive-icon-foreground.png` composto sobre `#f6f4f2` com máscara circular → balão e as 3 barras aparecem inteiros dentro do círculo, sem corte
S03 (PR-001; CB-004) [final] o tester abre o mesmo adaptativo com máscara quadrada arredondada → balão e as 3 barras aparecem inteiros, sem corte
S04 (PR-001; CB-004) [final] o tester abre o mesmo adaptativo com máscara quadrada → balão e as 3 barras aparecem inteiros, sem corte
S05 (PR-001; AC-003) [final] o tester abre o `adaptive-icon-monochrome.png` sobre um fundo contrastante → o balão aparece como silhueta de uma cor só, com as 3 barras vazadas (o fundo aparece através delas)
S06 (PR-001; AC-004, AC-011, CB-007) [final] o tester abre o `splash-icon.png` sobre `#f6f4f2` → o balão âmbar aparece centralizado, sem borda ou tom de fundo diferente do `#f6f4f2` ao redor
S07 (PR-001; AC-006) [final] o tester abre o `notification-icon.png` sobre fundo escuro → silhueta branca do balão com as 3 barras vazadas
S08 (PR-001; AC-005) [final] o tester abre o `favicon.png` antes e depois → o "depois" mostra o balão âmbar sobre fundo claro, no lugar dos 3 círculos pretos
S09 (PR-002, PR-009; AC-005, CB-006) [final] o tester sobe o app no web, abre `http://localhost:8081/` e abre o ícone que o `<link rel="icon">` da página aponta → mostra o balão âmbar, e o mesmo arquivo "antes" mostra os círculos
S10 (PR-007; CB-005) [final] o tester reduz o `notification-icon.png` a 24 px ao lado do original → ainda se reconhece o balão e as 3 barras vazadas ficam distinguíveis
S11 (PR-007; CB-006) [final] o tester reduz o `favicon.png` a 16 px sobre fundo claro, ao lado do original → ainda se reconhece o balão âmbar
S12 (PR-006; AC-009) [final] o tester abre `http://localhost:8081/` sem sessão → a tela de login mostra o balão âmbar com o texto "Ben", igual ao print de antes
S13 (PR-006; AC-009) [final] o tester abre `http://localhost:8081/chat` com sessão → o header mostra o balão âmbar com "Ben", igual ao print de antes
S14 (PR-006; AC-009) [final] o tester abre o menu lateral a partir do chat → o menu mostra o balão âmbar com "Ben", igual ao print de antes
S15 (PR-006; AC-009) [final] o tester rola o chat até uma resposta do Ben → o avatar do Ben ao lado do balão (corpo branco, barras âmbar) é igual ao de antes
S16 (PR-006; AC-010) [final] o tester abre `http://localhost:3002/components/brand-mark` → o sandbox continua com a logo de 3 círculos pretos de antes
S17 (PR-006; AC-010) [final] o tester abre `http://localhost:3002/` e abre o ícone que o `<link rel="icon">` aponta → continua o raio roxo do Vite de antes

### Roteiro — lane teste
comando: n/a (nenhum RT ou PR em lane `teste`)
T01..: n/a

### RT-001 — lane codigo
Procurar em: `packages/infra/mobile/ben/package.json`, `pnpm-lock.yaml`, `packages/infra/mobile/ben/scripts/generate-icons.mjs`
Reprova se: `@resvg/resvg-js` não está em `devDependencies` do app (e sim em `dependencies`) ou não aparece no `pnpm-lock.yaml`; ou `generate-icons.mjs` ainda contém `encodePng`, `crc32`, `zlib` ou `MARK`, ou não chama `new Resvg(`. Comando: `grep -n "resvg" packages/infra/mobile/ben/package.json pnpm-lock.yaml | head` e `grep -nE "encodePng|crc32|zlib|MARK|new Resvg" packages/infra/mobile/ben/scripts/generate-icons.mjs`.

### RT-002 — lane codigo (PR-011)
Procurar em: `packages/infra/mobile/ben/package.json` (scripts `dev`, `start`, `android`, `apk`) e `scripts/generate-icons.mjs`
Reprova se: algum dos quatro scripts perdeu o `pnpm icons &&` do começo; ou o script termina com código 0 quando o rasterizador não existe; ou o `stderr` não traz o passo que falhou e "pnpm install". PR-011, comando, na raiz: `mv node_modules/@resvg node_modules/@resvg.off && (timeout 60 pnpm --filter @ben/mobile-ben dev; echo "saida=$?"); mv node_modules/@resvg.off node_modules/@resvg`. O `mv` simula a ausência de verdade: com `nodeLinker: hoisted` o `@resvg` mora só em `node_modules/@resvg` da raiz (o app não tem `node_modules` próprio para ele), e num workspace de teste no scratch o mesmo `mv` fez o `import('@resvg/resvg-js')` falhar com `Cannot find package` e o script sair com `saida=1`. Esperado: `saida=1`, linhas `icons: failed at load rasterizer: ...` e `Run \`pnpm install\` at the repository root and try again.`, e nenhuma linha do Expo/Metro ("Starting Metro", "Waiting on http://localhost:8081"). O `mv` de volta está depois de `;`, então roda mesmo se o comando falhar; confira `ls node_modules/@resvg` (`resvg-js` e `resvg-js-linux-x64-gnu`) antes de seguir; em seguida `pnpm --filter @ben/mobile-ben icons` volta a sair com código 0.

### RT-003 — lane codigo
Procurar em: `packages/infra/mobile/ben/app.config.ts`, `src/layout/utils/colors.ts`, `scripts/generate-icons.mjs`
Reprova se: `app.config.ts` ainda contém `'#f9f9f9'` ou `'#121213'`, ou declara hex literal para o fundo ou a cor da notificação; ou `colors.ts` não tem `background = '#f6f4f2'`; ou o gerador pinta o fundo com outro valor que não seja `background`. Comando: `grep -nE "f9f9f9|121213|f6f4f2|background|primary|silhouette" packages/infra/mobile/ben/app.config.ts packages/infra/mobile/ben/src/layout/utils/colors.ts`. Esperado: `colors.ts` com `silhouetteThemed = '#000000'` e `silhouetteNotification = '#ffffff'`; `adaptiveIcon.backgroundColor: background`, splash `backgroundColor: background`, `imageWidth: 180`, notificação `color: primary`. A conferência numérica dos pixels é a PR-010 (seção RT-005).

### RT-004 — lane codigo (PR-005)
Procurar em: `packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx` e `packages/infra/mobile/ben/scripts/generate-icons.mjs`
Reprova se: um dos dois não importa `ben-logo-geometry`, ou um dos dois declara contorno, barra ou cor da marca por conta própria, ou o módulo de geometria importa `react-native`/`react-native-svg`/`@/`. Comandos, na raiz:
```bash
grep -n "ben-logo-geometry" packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx packages/infra/mobile/ben/scripts/generate-icons.mjs
grep -nE "BALLOON_PATH *=|FOLD_PATH *=|d=['\"]M|#[0-9a-fA-F]{6}|x=\{[0-9]" packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx packages/infra/mobile/ben/scripts/generate-icons.mjs
grep -nE "from '(react|react-native|react-native-svg|@/)" packages/infra/mobile/ben/src/layout/utils/ben-logo-geometry.ts
```
Esperado: a primeira lista uma importação em cada arquivo; a segunda e a terceira não imprimem nada.

### RT-005 — lane codigo (PR-010)
Procurar em: `packages/infra/mobile/ben/assets/*.png` e `app.config.ts`
Reprova se: qualquer conferência abaixo falhar. Na raiz, depois de `pnpm --filter @ben/mobile-ben icons`, o tester roda este script (fora do repositório, sem versionar; `pngjs` já está no `node_modules` da raiz) e lê a saída:
```bash
node --input-type=module -e '
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
const { PNG } = createRequire(import.meta.url)("pngjs")
const dir = "packages/infra/mobile/ben/assets/"
const load = (file) => PNG.sync.read(readFileSync(dir + file))
const pixel = (png, x, y) => { const o = (Math.round(y) * png.width + Math.round(x)) * 4; return [...png.data.slice(o, o + 4)] }
const hex = (rgba) => "#" + rgba.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("")
const width = 24, height = 27, diagonal = Math.hypot(width, height), extent = 27
const at = (png, scale, unitX, unitY) => pixel(png, png.width / 2 + (unitX - 15) * scale, png.width / 2 + (unitY - 16.5) * scale)
const farthest = (png, shape) => { let max = 0; for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) if (png.data[(y * png.width + x) * 4 + 3] > 0) { const dx = x + 0.5 - png.width / 2, dy = y + 0.5 - png.height / 2; max = Math.max(max, shape === "circle" ? Math.hypot(dx, dy) : Math.max(Math.abs(dx), Math.abs(dy))) } return max }
const everyVisibleIs = (png, rgb) => { for (let o = 0; o < png.data.length; o += 4) if (png.data[o + 3] > 0 && [0, 1, 2].some((channel) => Math.abs(png.data[o + channel] - rgb) > 5)) return false; return true }
const allOpaque = (png) => { for (let o = 3; o < png.data.length; o += 4) if (png.data[o] !== 255) return false; return true }
const report = (name, ok) => console.log((ok ? "OK   " : "FAIL ") + name)
const icon = load("icon.png"), fore = load("adaptive-icon-foreground.png"), mono = load("adaptive-icon-monochrome.png"), splash = load("splash-icon.png"), note = load("notification-icon.png"), fav = load("favicon.png")
report("dimensoes", [icon, fore, mono, splash].every((p) => p.width === 1024 && p.height === 1024) && note.width === 96 && note.height === 96 && fav.width === 64 && fav.height === 64)
report("icon opaco, canto f6f4f2, ambar f9a12f no corpo", allOpaque(icon) && hex(pixel(icon, 2, 2)) === "#f6f4f2" && hex(at(icon, 1024 * 0.6 / extent, 12.6, 16.5)) === "#f9a12f")
report("favicon opaco, canto f6f4f2, ambar no corpo", allOpaque(fav) && hex(pixel(fav, 1, 1)) === "#f6f4f2" && hex(at(fav, 64 * 0.8 / extent, 12.6, 16.5)) === "#f9a12f")
report("adaptativo: canto transparente, ambar no corpo, dentro do circulo de 66% (338 px)", pixel(fore, 2, 2)[3] === 0 && hex(at(fore, 1024 * 0.6 / diagonal, 12.6, 16.5)) === "#f9a12f" && farthest(fore, "circle") <= 338)
report("splash: canto transparente, ambar no corpo, dentro do quadrado central de 66% (338 px do centro)", pixel(splash, 2, 2)[3] === 0 && hex(at(splash, 1024 * 0.64 / extent, 12.6, 16.5)) === "#f9a12f" && farthest(splash, "square") <= 338)
report("tematizado: so preto, barra vazada (alfa 0), corpo cheio (alfa 255)", everyVisibleIs(mono, 0) && at(mono, 1024 * 0.6 / diagonal, 15, 16.5)[3] === 0 && at(mono, 1024 * 0.6 / diagonal, 12.6, 16.5)[3] === 255)
report("notificacao: so branco, barra vazada, corpo cheio, canto transparente", everyVisibleIs(note, 255) && at(note, 96 * 0.86 / extent, 15, 16.5)[3] === 0 && at(note, 96 * 0.86 / extent, 12.6, 16.5)[3] === 255 && pixel(note, 1, 1)[3] === 0)
'
```
Esperado: 7 linhas `OK`, nenhuma `FAIL`. A cor "só preto" e "só branco" aceita até 5 níveis de diferença por canal, porque o resvg devolve o PNG com alfa não pré-multiplicado e pixels de borda com alfa parcial podem sair com 254 em vez de 255. Depois, no `app.config.ts`: `imageWidth: 180`, `backgroundColor: background` no splash e no adaptativo, e `color: primary` na notificação (mesmo `grep` do RT-003). Reprodutibilidade e offline (CB-002, CB-003), na raiz:
```bash
RUN=/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-logo-antiga
sha256sum packages/infra/mobile/ben/assets/*.png > "$RUN/icons-a.txt"
unshare -rn pnpm --filter @ben/mobile-ben icons || pnpm --filter @ben/mobile-ben icons
sha256sum -c "$RUN/icons-a.txt"
git status --short packages/infra/mobile/ben/assets
```
Esperado: o `RUN` aponta para a pasta da run, que existe e o git ignora (`$TMPDIR` é vazio neste ambiente e não é usado). O `unshare -rn` roda o gerador sem rede (neste ambiente ele funciona: criou um namespace sem interface de rede, o DNS falhou com `EAI_AGAIN` e a escrita em arquivo do repo funcionou; se o sistema não permitir `unshare`, a segunda alternativa roda e o tester confirma por `grep -nE "fetch|http|https|net:" packages/infra/mobile/ben/scripts/generate-icons.mjs` sem resultado); `sha256sum -c` imprime `OK` nos 6 arquivos; o `git status` do tester não mostra diferença nova entre as duas execuções (a comparação é entre a execução 1 e a 2, não contra o commit anterior).

### PR-008 — lane codigo
Procurar em: `packages/infra/mobile/ben/README.md`
Reprova se: a busca achar algum dos termos antigos, ou a seção "Branding assets" não descrever o balão âmbar do header nem o comando para regenerar. Comando: `grep -inE "círculo|circle|#121213|#f9f9f9|no image dependency" packages/infra/mobile/ben/README.md` (esperado: sem saída) e leitura da seção "Branding assets" (deve citar o balão âmbar do header, `ben-logo-geometry.ts`, `pnpm --filter @ben/mobile-ben icons` e a dependência `@resvg/resvg-js`).

## Cobertura
5/5 RT · 9/9 PR · 7/7 CB
RT-001 → seção RT-001 na lane codigo
RT-002 → seção RT-002 na lane codigo (PR-011)
RT-003 → seção RT-003 na lane codigo; pixels e cores na seção RT-005 (PR-010)
RT-004 → seção RT-004 na lane codigo (PR-005)
RT-005 → seção RT-005 na lane codigo (PR-010); S01 a S08 na lane browser
PR-001 → S01, S02, S03, S04, S05, S06, S07, S08 na lane browser
PR-002 → S09 na lane browser
PR-005 → seção RT-004 na lane codigo
PR-006 → S12, S13, S14, S15, S16, S17 na lane browser
PR-007 → S10, S11 na lane browser
PR-008 → seção PR-008 na lane codigo
PR-009 → S09 na lane browser; seção RT-005 na lane codigo
PR-010 → seção RT-005 na lane codigo
PR-011 → seção RT-002 na lane codigo
CB-001 → PR-011 → seção RT-002 na lane codigo
CB-002 → PR-010 → seção RT-005 (sha256 duas execuções)
CB-003 → PR-010 → seção RT-005 (`unshare -rn`)
CB-004 → PR-001, PR-010 → S02, S03, S04; seção RT-005 (66%)
CB-005 → PR-007 → S10
CB-006 → PR-002, PR-007 → S09, S11
CB-007 → PR-001, PR-010 → S06; seção RT-005 (canto transparente e fundo `background`)

## Desvios da spec
nenhum

## Desvios de padrão
- passo 4 — `component-variant-maps.md` (o `Record<Variant, …>` e a union exportada ficam junto do componente) — `BenLogoVariant` e `variantPalettes` saem do `ben-logo.tsx` para `ben-logo-geometry.ts` porque o RT-004 exige que o gerador (Node, sem React Native) leia as mesmas paletas; o `ben-logo.tsx` continua resolvendo a variante por consulta ao map, agora importado.
- passo 4 — `layout/utils/` importa pelo alias `@/` (`general-code-preferences.md`, "use path-alias imports, not deep relative paths") — o `ben-logo-geometry.ts` importa `./colors.ts` por caminho relativo com extensão, porque o script Node (`generate-icons.mjs`) não resolve o alias `@/` e precisa carregar o mesmo módulo (RT-004); é import de irmão, não caminho relativo profundo (`brand-mark.tsx` já importa `./icons/ben-logo`). O `ben-logo.tsx` continua importando o módulo novo por `@/`.
- passo 6 — `scripts/generate-icons.mjs` é um `.mjs` que importa `.ts` — não há padrão do app para isso; é a única forma de ler a fonte única sem copiar a geometria (o script ler o `.tsx` por texto foi descartado na spec). Node 24 remove os tipos; o módulo só usa tipos e `export const`, sem `enum`.

## Riscos
- Import `./colors.ts` com extensão dentro de `src/`: conferido, não é mais risco aberto. O `metro-resolver` 0.83.3 (`resolve.js`, `resolveSourceFile`) tenta o caminho exato antes das `sourceExts`, o typecheck aceita (`allowImportingTsExtensions`), o ESLint do app não tem regra de extensão e `app.config.ts:2` já importa `./src/core/app-versions.ts`. O bundle do web em S09 e S12 a S15 continua sendo a prova final. Decisão: se ele quebrar por causa do import com `.ts`, o implementador não troca a forma de importar nem copia o hex para outro arquivo (as duas saídas violariam o RT-004); ele para, registra o erro do bundle e devolve o checkpoint como falho, e a correção volta para o planejamento.
- O gerador carrega `.ts` pelo Node 24 (remoção de tipos): testado numa cópia mínima no scratch, `.mjs` → `.ts` → `./colors.ts` com `export type` e `Record` funciona, com o aviso de reparse no `stderr`. Um `enum` ou `import type` sem `type` quebraria; o módulo não usa.
- O `pnpm add` precisa de rede uma vez; sem rede nessa hora o passo 2 não fecha e o resto bloqueia.
- O balão ficou menor no splash (64% do maior lado, contra 72% da largura dos círculos); é o preço do RT-005 (66% centrais) e da AC-011 (largura de 180 mantida).
- `ben-logo.tsx` é usado em login, header, menu e avatar; um erro de mapeamento das barras (`key`, `rx`) muda a tela inteira. Quem pega é a lane browser (S12 a S15) e o `git diff` dos consumidores.
- A silhueta usa `<mask>`; o resvg suporta, mas se o furo sair com alfa parcial na borda das barras, a PR-010 só confere o centro da barra.

## Premissas
- **Dúvida do reconhecimento (resposta do orquestrador):** a sessão para S13 a S15 vem de semear `ben.jwttoken` no `localStorage` com um JWT válido do server-ben (HS256, `{ userId }`, `JWT_PRIVATE_KEY`); se isso não abrir o chat, S13 a S15 são dispensadas e AC-009 é provada por leitura de código mais S12 (descrito em "Notas de execução").
- Task simples: um checkpoint, sem marco, onda única. Não há mecanismo de fixtures, e nenhum dado persistente muda (o fluxo de migração do Prisma não se aplica: o cartão do projeto diz `nenhum`).
- Nome do módulo novo: `ben-logo-geometry.ts` em `src/layout/utils/` (nome de referência do reconhecimento). Nomes internos do script (`buildSvg`, `scaleToExtent`, `scaleToDiagonal`, `main`) são de referência: o implementador pode trocá-los se o lint pedir.
- As escalas da tabela do passo 6 são o ponto de partida; o implementador pode ajustá-las dentro das conferências da PR-010 (balão dentro dos 66%, reconhecível em 24 px e 16 px), e diz o valor final no commit.
- Versão do `@resvg/resvg-js`: a que o `pnpm add -D` resolver (2.6.2 no registro quando o reconhecimento olhou).
- A cor `#f9a12f` é o `primary` do `colors.ts`, e o corpo do balão `brand` usa esse valor; o ponto de amostragem da PR-010 é (12,6; 16,5) em unidades do viewBox, que cai no corpo entre a primeira e a segunda barra.
- As fotos "antes" dos PNGs vêm da cópia do passo 1; as de S12 a S15 seguem as Notas de execução.
- CLAUDE.md manda commitar o ciclo fechado: o checkpoint 1 fecha com um commit (código, README, lockfile e PNGs); a pasta `antes/` e a página de comparação ficam fora do git.
- O ambiente do tester tem `TMPDIR` vazio (conferido: `echo "TMPDIR=[$TMPDIR]"` imprime `[]`); por isso nenhuma checagem usa `$TMPDIR`, e os arquivos temporários ficam na pasta da run.
- O `pnpm` do tester é o do `packageManager` do repo (11.18.0); o `pnpm` solto fora do repo pode apontar para uma versão do corepack que não está instalada, então os comandos rodam sempre na raiz do repo.
- Escolha do desvio de cor: mover os hexes de silhueta para o `colors.ts` (em vez de declarar desvio de `mobile-icon-colors.md`) segue melhor as skills, custa três linhas e tem precedente no próprio arquivo (`onSurfaceVariantMuted`). O desvio de `component-variant-maps.md` não tem alternativa sem copiar as paletas para o script, e fica declarado.
