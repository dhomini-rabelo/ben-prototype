# Reconhecimento — Trocar a logo antiga (3 círculos) pelo balão âmbar do header nos ícones do app Ben

## Estado atual
veredito: confirma
O código bate com a Pesquisa e com "Continua como hoje": os 6 PNGs de `assets/` e o `scripts/generate-icons.mjs` ainda desenham os 3 círculos (`MARK.circles`, `#121213` sobre `#f9f9f9`), `app.config.ts` aponta os 6 arquivos com `#f9f9f9` (adaptativo e splash) e `#121213` (notificação), o README descreve "três círculos", e `ben-logo.tsx` já é o balão. Os PNGs são versionados (`git ls-files assets` lista os 6).

## Unidade afetada
packages/infra/mobile/ben (@ben/mobile-ben). Também toca a raiz: `pnpm-lock.yaml` (dependência nova). O sandbox `packages/infra/mobile/design` não é tocado.

## Lane de cada RT e PR
Lane `teste` existe no cartão (Vitest), mas nenhum RT/PR cai nela: o usuário recusou suíte versionada sobre os PNGs (PR-003 e PR-004 cortadas), então não há `T0n`. As provas por comando (PR-005, PR-008, PR-010, PR-011) caem em `codigo`: o revisor roda o comando no checkout e lê a saída; nada é versionado.
- RT-001 → codigo — `packages/infra/mobile/ben/package.json` (`devDependencies` com rasterizador SVG, ex.: `@resvg/resvg-js`) e `pnpm-lock.yaml`; binário nativo vem por `optionalDependencies` da plataforma, sem postinstall (nada a acrescentar em `allowBuilds`)
- RT-002 → codigo — `packages/infra/mobile/ben/package.json` (scripts `dev`, `start`, `android`, `apk` continuam com `pnpm icons &&`) e `scripts/generate-icons.mjs` (sai com código diferente de zero e mensagem em falha); a execução é a PR-011
- RT-003 → codigo — `packages/infra/mobile/ben/app.config.ts` (`adaptiveIcon.backgroundColor`, `expo-splash-screen.backgroundColor`, `expo-notifications.color`) e o fundo no gerador; a conferência numérica é a PR-010
- RT-004 → codigo — novo módulo de dados de geometria e paleta, `ben-logo.tsx` e `scripts/generate-icons.mjs`; a prova é a PR-005
- RT-005 → codigo — `scripts/generate-icons.mjs`; a conferência dos PNGs é a PR-010 (comando)
- PR-001 → browser — `file://` de uma página temporária fora do repo (scratchpad) com os PNGs "antes" (`git show HEAD:assets/...`) e "depois" lado a lado; sem URL do app
- PR-002 → browser — `http://localhost:8081/`
- PR-005 → codigo — comando de busca em `packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx` e `packages/infra/mobile/ben/scripts/generate-icons.mjs` (os dois importam o módulo novo; nenhum tem `BALLOON_PATH`, `FOLD_PATH`, `Rect x=` nem hex da marca)
- PR-006 → browser — `http://localhost:8081/` (login), `http://localhost:8081/chat`, menu lateral, e `http://localhost:3002/components/brand-mark` (sandbox)
- PR-007 → browser — `file://` da mesma página temporária da PR-001, com a notificação a 24 px e o favicon a 16 px ao lado do original
- PR-008 → codigo — comando `grep -inE "círculo|circle|#121213|#f9f9f9" packages/infra/mobile/ben/README.md` sem saída, e leitura da seção "Branding assets"
- PR-009 → browser — `http://localhost:8081/` depois de `pnpm dev:mobile` (que regenera os ícones): `git status`/`git diff` dos assets mostra os arquivos novos e a aba mostra o balão (ver `## RT problemáticos`)
- PR-010 → codigo — comando Node com `pngjs` (já no `node_modules` da raiz) lendo os 6 PNGs de `packages/infra/mobile/ben/assets/` + `git diff --stat` entre duas execuções de `pnpm --filter @ben/mobile-ben icons` sem rede + leitura de `app.config.ts`
- PR-011 → codigo — comando `pnpm --filter @ben/mobile-ben dev` com o pacote do rasterizador indisponível (ex.: renomear `node_modules/@resvg` temporariamente) e saída do passo que falhou

## RT problemáticos
- PR-009 está escrita como "teste de ponta a ponta", e a regra de lane mandaria `teste`. Mas o usuário recusou suíte versionada sobre os PNGs no gate, e não existe suíte e2e neste repo (Vitest só `src/**/*.test.ts`, ambiente node). Resolvi em `browser` (aba, S09) + comando (PR-010), sem `T0n`. Se o usuário quiser um caso de suíte de fato, é decisão dele.
- PR-001 (foto de arquivos PNG) não tem URL do app: depende de uma página temporária montada pelo tester no scratchpad (adaptativo composto sobre `#f6f4f2` com cada máscara). Não é impossível, mas o roteiro depende dela.

## Mapa do código
Base `M/` = `packages/infra/mobile/ben/`.
- [M/scripts/generate-icons.mjs](packages/infra/mobile/ben/scripts/generate-icons.mjs) — gerador a reescrever: hoje tem PNG encoder próprio (`encodePng`, `crc32`, zlib), `MARK.circles`, `SURFACE`/`PRIMARY`, e a lista `assets` com as 6 saídas (`icon.png` 1024 opaco, `adaptive-icon-foreground.png` 1024, `adaptive-icon-monochrome.png` 1024, `splash-icon.png` 1024, `notification-icon.png` 96, `favicon.png` 64); o log `assets/{file} {size}x{size}` imprime por arquivo
- [M/src/layout/components/icons/ben-logo.tsx](packages/infra/mobile/ben/src/layout/components/icons/ben-logo.tsx) — `BenLogo` com `BALLOON_PATH`, `FOLD_PATH`, `STROKE_WIDTH`, 3 `Rect` (x 9/13.8/18.6; y 13/10.5/14; w 2.4; h 6/11/4; rx 1.2) e paletas `brand` e `avatar`; viewBox `0 0 30 30`. A geometria sai daqui para o módulo novo; as paletas `brand`/`avatar` e os hex vêm de `colors.ts`
- [M/src/layout/utils/colors.ts](packages/infra/mobile/ben/src/layout/utils/colors.ts) — hexes da marca (`primary #f9a12f`, `brandLight #f3dcbb`, `ink #1d1814`, `surfaceLowest`, `dogEar`); sem imports, portanto importável pelo script Node; comentário manda manter lockstep com `tailwind.config.js`
- [M/tailwind.config.js](packages/infra/mobile/ben/tailwind.config.js) — `surface`/`surface-bright` `#f6f4f2`; é CJS (`module.exports`), então não é lido pelo script. Para o RT-003 o `#f6f4f2` precisa viver numa constante do módulo novo ou de `colors.ts` (hoje não há nenhuma com esse valor)
- [M/app.config.ts](packages/infra/mobile/ben/app.config.ts) — `icon`, `android.adaptiveIcon` (`backgroundColor '#f9f9f9'`), `web.favicon`, plugin `expo-splash-screen` (`imageWidth: 180`, `backgroundColor '#f9f9f9'`), plugin `expo-notifications` (`color '#121213'`). Já importa `./src/core/app-versions.ts` com extensão, então importar um `.ts` de dentro dele tem precedente
- [M/package.json](packages/infra/mobile/ben/package.json) — `icons`: `node scripts/generate-icons.mjs`; `dev`, `start`, `android`, `apk` começam com `pnpm icons &&` (a falha interrompe por causa do `&&`); `devDependencies` onde o rasterizador entra
- [M/README.md](packages/infra/mobile/ben/README.md) — seção "Branding assets" (linhas 8 a 24): "three circles in #121213 on the #f9f9f9 surface", "no image dependency to install", "lockstep with ben-logo.tsx"; é o texto da AC-008 (README em inglês)
- [M/src/layout/components/brand-mark.tsx](packages/infra/mobile/ben/src/layout/components/brand-mark.tsx) — `BenLogo variant="brand" size=30` + wordmark; chat-top-bar, menu-sidebar; não muda (AC-009)
- [M/src/pages/login/page.tsx:33](packages/infra/mobile/ben/src/pages/login/page.tsx#L33), `chat-history.tsx:75`, `chat-history-item.tsx:55` — consumidores de `BenLogo` (`brand` e `avatar`); devem continuar iguais
- [M/assets/](packages/infra/mobile/ben/assets) — 6 PNGs versionados que o gerador sobrescreve (o README manda mantê-los no git)
- [M/vitest.config.ts](packages/infra/mobile/ben/vitest.config.ts) e [M/src/services/__tests__/notifications-service.test.ts](packages/infra/mobile/ben/src/services/__tests__/notifications-service.test.ts) — única suíte do app; sem teste de ícones, e não entra nenhum nesta task
- [pnpm-workspace.yaml](pnpm-workspace.yaml) — `nodeLinker: hoisted`, `allowBuilds` por pacote; `@resvg/resvg-js` (2.6.2 no registry) não está instalado hoje (`node_modules/@resvg` não existe)

## Padrão da vizinhança
- Utilitários do app são arquivos planos de um assunto em `src/layout/utils/` (`colors.ts` é só `export const` de strings, sem import); componentes de ícone ficam em `src/layout/components/icons/`. O app importa pelo alias `@/`, que o script Node não resolve: o módulo novo e o que ele importa usam caminho relativo com extensão `.ts` (`allowImportingTsExtensions` já está ligado no `tsconfig.json`).
- Node 24.11 (`engines >=24`) importa `.ts` de um `.mjs` por remoção de tipos: testei `import { primary } from '.../colors.ts'` num `.mjs` fora do repo e imprimiu `#f9a12f` (com aviso "Reparsing as ES module", porque o `package.json` do app não tem `"type": "module"`; não dá para adicionar, porque `tailwind.config.js` e `babel.config.js` são CJS). A remoção de tipos não aceita `enum` nem imports só de tipo sem `import type`.
- `scripts/` do app tem regras de lint próprias (`eslint.config.mjs`, bloco `${MOBILE}/scripts/**`): sem comentários e sem nomes abreviados; o `generate-icons.mjs` atual tem comentários de cabeçalho que o lint não deve aceitar, o que o gerador novo precisa respeitar (conferir ao rodar `pnpm lint:fix`).

## Reuso disponível
- `pngjs` já está no `node_modules` da raiz (útil só para conferir pixels na PR-010; não precisa virar dependência do app se a conferência for comando solto).
- `ben-logo.tsx` já tem a geometria completa e testada visualmente no header; mover (não redesenhar) os dados: `BALLOON_PATH`, `FOLD_PATH`, as 3 barras, viewBox 30, paleta `brand`.
- O encoder PNG artesanal sai: o rasterizador devolve o PNG pronto.
- `pnpm icons` já está nos quatro ganchos (RT-002); basta o script sair com código != 0 na falha.

## Memórias que se aplicam
nenhuma (índices vazios, exceto `business-rules/razao-de-negocio-e-casos-de-uso-v1.md`, que não trata de marca)

## Fixtures
veredito: sem mecanismo
estado: nenhum
a mudar: nada

## Roteiro de comprovação
ambiente: `pnpm dev` (raiz: server-ben :3333 + app web :8081, regenera os ícones antes). Para as provas S01 a S08 e S10 a S11, que só leem arquivos, não precisa de ambiente; para S09 e S12, `pnpm dev:mobile` basta; S13 a S15 precisam do `pnpm dev` inteiro; S16 e S17 precisam também de `pnpm dev:design` (:3002)
estado: nenhum (o app não tem mecanismo de fixtures; a sessão do chat vem da dúvida 1)
url: `http://localhost:8081/`

S01 (PR-001; AC-001) [final] o tester abre a página temporária de comparação com o `icon.png` antes e depois → o "depois" mostra o balão âmbar sem o texto "Ben", sobre fundo claro, e nenhum dos 3 círculos pretos
S02 (PR-001; AC-002, CB-004) [final] o tester abre o `adaptive-icon-foreground.png` composto sobre `#f6f4f2` com máscara circular → balão e as 3 barras aparecem inteiros dentro do círculo, sem corte
S03 (PR-001; CB-004) [final] o tester abre o mesmo adaptativo com máscara quadrada arredondada → balão e as 3 barras aparecem inteiros, sem corte
S04 (PR-001; CB-004) [final] o tester abre o mesmo adaptativo com máscara quadrada → balão e as 3 barras aparecem inteiros, sem corte
S05 (PR-001; AC-003) [final] o tester abre o `adaptive-icon-monochrome.png` sobre um fundo contrastante → o balão aparece como silhueta de uma cor só, com as 3 barras vazadas (o fundo aparece através delas)
S06 (PR-001; AC-004, AC-011, CB-007) [final] o tester abre o `splash-icon.png` sobre `#f6f4f2` → o balão âmbar aparece centralizado, sem borda ou tom de fundo diferente do `#f6f4f2` ao redor
S07 (PR-001; AC-006) [final] o tester abre o `notification-icon.png` sobre fundo escuro → silhueta branca do balão com as 3 barras vazadas
S08 (PR-001; AC-005) [final] o tester abre o `favicon.png` antes e depois → o "depois" mostra o balão âmbar sobre fundo claro, no lugar dos 3 círculos pretos
S09 (PR-002; AC-005, CB-006) [final] o tester sobe o app no web, abre `http://localhost:8081/` e abre o ícone que o `<link rel="icon">` da página aponta → mostra o balão âmbar, e o mesmo arquivo "antes" mostra os círculos
S10 (PR-007; CB-005) [final] o tester reduz o `notification-icon.png` a 24 px ao lado do original → ainda se reconhece o balão e as 3 barras vazadas ficam distinguíveis
S11 (PR-007; CB-006) [final] o tester reduz o `favicon.png` a 16 px sobre fundo claro, ao lado do original → ainda se reconhece o balão âmbar
S12 (PR-006; AC-009) [final] o tester abre `http://localhost:8081/` sem sessão → a tela de login mostra o balão âmbar com o texto "Ben", igual ao print de antes
S13 (PR-006; AC-009) [final] o tester abre `http://localhost:8081/chat` com sessão → o header mostra o balão âmbar com "Ben", igual ao print de antes
S14 (PR-006; AC-009) [final] o tester abre o menu lateral a partir do chat → o menu mostra o balão âmbar com "Ben", igual ao print de antes
S15 (PR-006; AC-009) [final] o tester rola o chat até uma resposta do Ben → o avatar do Ben ao lado do balão (corpo branco, barras âmbar) é igual ao de antes
S16 (PR-006; AC-010) [final] o tester abre `http://localhost:3002/components/brand-mark` → o sandbox continua com a logo de 3 círculos pretos de antes
S17 (PR-006; AC-010) [final] o tester abre `http://localhost:3002/` e abre o ícone que o `<link rel="icon">` aponta → continua o raio roxo do Vite de antes

comando: n/a (nenhum RT ou PR em lane `teste`)
T01..: n/a

## Armadilhas
- O balão não é centrado no viewBox: o contorno vai de x 3 a 27 e de y 3 a 30 (a cauda desce até y 30, centro em y 16,5), e o viewBox 30x30 tem centro em 15. Centralizar pelo viewBox deixa o balão alto demais; AC-004 e a safe zone pedem centrar pelo contorno.
- Safe zone do adaptativo: o Android corta numa máscara circular de ~66% (676 px de 1024), então o limite é a diagonal do contorno (`hypot(24, 27)` ≈ 36 unidades) cabendo em 676 px, não só a largura. O script atual já usa `scaleToDiagonal(…, 0.6)`; manter a lógica de diagonal.
- Silhueta (tematizado e notificação): corpo e dobra cheios, as 3 barras têm que ser transparentes (furo no PNG), não pintadas com outra cor. Uma máscara SVG (que o resvg suporta) ou um caminho com `fill-rule` evenodd resolve; pintar barra com o fundo reintroduz mancha colorida quando o Android tinge o ícone.
- `icon.png` sem transparência: o fundo é pintado no SVG (resvg aceita `background`), e o PNG segue em RGBA como hoje com alpha 255 em tudo.
- Reprodutibilidade (CB-002): o PNG do resvg tem que sair idêntico em duas execuções; conferir com `git diff` entre elas, e fixar a ordem/lista de arquivos para o log não variar.
- Offline (CB-003): o binário nativo do resvg vem do pacote por plataforma instalado no `pnpm install`; depois disso nada acessa a rede. Sem o pacote (CB-001), o `import` do script lança erro: o script precisa capturar e imprimir o passo e "rode `pnpm install` na raiz", e sair com código 1 para o `&&` parar.
- Aviso do Node "Reparsing as ES module" ao importar `.ts` a partir do `.mjs`: é ruído, não falha; não resolver mudando o `package.json` do app para `"type": "module"` (quebra os configs CJS).
- Fotos "antes" têm que sair do git (`git show HEAD:packages/infra/mobile/ben/assets/<arquivo>`) ou ser tiradas antes de implementar; a PR-006 também precisa dos prints do header, menu, login e avatar tirados antes da refatoração de `ben-logo.tsx`, senão não há "antes".
- O adaptativo em `app.config.ts` ainda declara `backgroundColor '#f9f9f9'`; sem trocar para `#f6f4f2` o ícone no launcher não bate com o `icon.png`. O mesmo vale para o plugin do splash.
- O Playwright do `browser-mobile-tester` roda no Windows e só salva em `.playwright-mcp` (copiar de `/mnt/c/...`); `file://` de uma página no scratchpad do WSL pode não ser alcançável pelo servidor Playwright, então a página temporária da PR-001/PR-007 deve ficar sob `/home/fael/so/repos/ben-prototype` (pasta ignorada, como `.claude/tmp/`) ou ser servida por um servidor estático local.

## Dúvidas
- Como o tester chega a `/chat` no web, para S13 a S15? A tela de login só oferece login Google, e o atalho de dev (`useDevAuth`) só aparece no Expo Go (`isExpoGo`), não no navegador. Não achei no servidor como o `DEV_ACCESS_TOKEN` é aceito — candidatas: semear em `localStorage` a chave `ben.jwttoken` (o web usa AsyncStorage, `secure-store.web.ts`) com um JWT válido do server-ben | dispensar S13 a S15 e provar AC-009 só por leitura de código (`brand-mark.tsx`, `chat-top-bar.tsx`, `menu-sidebar.tsx`, `chat-history*.tsx` sem diff) mais S12 | pedir ao usuário a forma de abrir o chat. Recomendo: a primeira, porque é o que a spec pede ("fotos iguais às de antes") e o localStorage é a forma que o web já usa para guardar o token; se o server não emitir um token de dev, cair na segunda.

## Premissas
- Provas por comando (PR-005, PR-008, PR-010, PR-011) entram como lane `codigo` com o comando literal; não são `T0n` e não ficam versionadas, como o usuário decidiu no gate.
- Módulo de geometria e paleta: um arquivo novo em `src/layout/utils/` (um assunto por arquivo, ex.: `ben-logo-geometry.ts`), sem imports de React Native, com caminho relativo para `colors.ts`; o nome exato é do planejador.
- Dependência: `@resvg/resvg-js` (a spec dá "ex.: resvg"; 2.6.2 existe no registry). Nenhum outro rasterizador testado.
- Nenhum teste Vitest novo: a spec recusou teste de pixels versionado e não tem RT pedindo outro; `pnpm test` do app segue como está.
- A aba (S09) é provada pela imagem que o `<link rel="icon">` carrega, já que a barra de abas do navegador não entra no screenshot do Playwright.
- PR-009 e PR-010 repetem parte do conteúdo de S09 e do comando: a PR-009 só acrescenta "o gerador roda dentro do `dev:mobile` e deixa os arquivos com o balão", que o S09 mais o comando da PR-010 cobrem.
- CB-001, CB-002 e CB-003 chegam à prova só por PR-010 e PR-011 (lane `codigo`, fora do roteiro de S/T, conforme `formats/roteiro.md`).

veredito: simples
