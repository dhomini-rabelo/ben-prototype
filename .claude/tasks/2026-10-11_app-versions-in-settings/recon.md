## Mapa de arquivos
(base: packages/infra/mobile = M)
M/ben/src/layout/components/menu-settings/settings-sheet.tsx | Sheet apresentacional de Settings (perfil, agentSection, sign out) | 1-175 (agentSection 120-130, sign out 132-172)
M/ben/src/layout/components/menu-settings/settings-view.tsx | Container: hooks + monta SettingsSheet via props | 1-65 (render 44-64)
M/ben/src/layout/components/menu-settings/agent-settings-controls.tsx | Irmão: seção "Ben's model" injetada como ReactNode | 1-84
M/ben/src/layout/components/ui/collapsible-section.tsx | Accordion pronto (title/meta/preview/defaultOpen/children) | 1-85
M/ben/src/pages/menu/page.tsx:33-50 e M/ben/src/pages/chat/page.tsx:120-133 | Abrem SettingsSheetOverlay > SettingsView | -
M/ben/app.config.ts | Expo config; version '1.0.0', android.versionCode 1 | 8, 22
M/ben/package.json | version "0.0.0" (não é a do app) | 3
M/ben/src/core/{env.ts,runtime.ts,routes.ts} | Constantes/config de core (env lê Constants.expoConfig.extra) | env.ts 13; routes.ts 1-6 (`export const ROUTES = {...} as const`)
M/design/src/layout/components/menu/settings-sheet.tsx | Versão design (HTML/Tailwind) do sheet; SEM agentSection | 1-133 (sign out 83-130)
M/design/src/pages/menu-settings-{populated,loading,error,edge-cases}/page.tsx | Telas de design do Settings (usa SettingsShell) | populated 1-15
M/design/src/core/screens.ts:146-149,187 ; routes.tsx:284-302,402-408 | Registro de telas/rotas do design | -
M/design/src/layout/components/ui/ (button, icon-button, typography) | Sem collapsible no design | -

## Molde a espelhar
Seção de Settings: `agentSection?: ReactNode` em settings-sheet.tsx (120-130) — bloco `<View className="gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5">` + `<Typography variant="label-caps" className="text-on-surface-variant">Ben's model</Typography>` + conteúdo. Container (settings-view) monta o conteúdo e passa por prop. Expansível: reusar `CollapsibleSection` (ben/src/layout/components/ui/collapsible-section.tsx; chevron, accessibilityState.expanded, divisor h-px, `meta`/`preview` opcionais) — usado hoje só em chat/components/message-trace-sheet/message-trace-{input,output}-step.tsx. Constante: molde `export const ROUTES = {...} as const` em core/routes.ts (core/ guarda constantes; arquivos kebab-case).

## Footprint
ben/src/layout/components/menu-settings/settings-view.tsx:44 | único consumidor de SettingsSheet no mobile
ben/src/pages/menu/page.tsx:49 e pages/chat/page.tsx:~125 | consomem SettingsView (não mudam)
design/src/pages/settings-sheet-preview/page.tsx + menu-settings-*/page.tsx | consomem SettingsSheet do design
Versão do app hoje: app.config.ts:8 `version: '1.0.0'`; NÃO é exibida em lugar nenhum (grep Constants/expoConfig/nativeApplicationVersion só acha env.ts e runtime.ts). Não há app.json.
Lista de versões/changelog: não encontrado (nenhuma constante nem arquivo existente).

## Armadilhas
- Regra do projeto: tela é desenhada primeiro em design/ (Vite, :3002) e depois no mobile; design/settings-sheet.tsx está DEFASADO (sem agentSection) — espelhar a seção nova lá exige decidir se atualiza só a seção de versões.
- Design usa <div>/Tailwind web; mobile usa RN + nativewind (View/Pressable/Typography). Não compartilham código.
- collapsible-section.tsx importa CopyButton e exibe título em label-caps (caixa alta) e usa `<Pressable>`; botão copiar é opcional (copyValue). Descrição longa dentro de ScrollView do sheet (maxHeight 70% da janela, settings-sheet.tsx:60) — rolagem já existe.
- Versão: app.config.ts tem version '1.0.0' (e versionCode 1); Constants.expoConfig?.version lê isso (expo-constants já é dependência). Duas fontes (constante nova vs app.config version) podem divergir — decisão aberta.
- UI em inglês, minúsculas/informal ("signing out…", "couldn't load full profile"), CLAUDE.md/respostas em pt-BR. Strings de UI: inglês.
- Lint/typecheck na raiz: pnpm lint:fix; pnpm typecheck (mobile só tem typecheck, sem testes).

## Sinal de teste
Automatizado: mobile e design sem testes (`find *.test.*` em ben: nenhum) — "não encontrado". `pnpm test` só cobre domínio.
UI: necessário. Design: `pnpm --filter @ben/mobile-design dev` (:3002), rotas /app/menu-settings-populated etc. (sem login). Mobile web: `pnpm --filter @ben/mobile-ben dev` (expo --web :8081); exige ben/.env (NÃO existe; só .env.example) — env.ts lança "Missing required env value" se faltar BACKEND_URL/FIREBASE_*/GOOGLE_*; valores dummy bastam para subir. Login: dev-login (use-dev-auth.ts:8) só em Expo Go (isExpoGo), não na web. Rota (protected)/_layout.tsx:8 só exige getCachedToken() ou user no store; na web token e usuário vão para localStorage (secure-store.web.ts → AsyncStorage; chaves '@ben/jwttoken' [token-storage.ts:3], '@ben/user' [user-storage.ts:3; JSON StoredUser {id,name,username,email,avatarUrl,providerId}]) -> via Playwright setar localStorage e navegar /chat, abrir Settings pelo menu. Backend (:3333) é necessário só para "Ben's model" (use-agent-preferences) e chamadas do chat; a seção de versões é estática (aparece mesmo com agente em erro). Provas por imagem: Playwright (agent browser-mobile-tester, 390x844).

## Veredito de complexidade
1. Uma frente só? sim — só frontend (mobile + espelho no design), sem backend.
2. Footprint <= 6 arquivos? não — constante nova + componente da lista + settings-sheet + settings-view (mobile) + design sheet + rota/screens do design (>6 com .env/prova).
3. Molde claro? sim — agentSection no settings-sheet + CollapsibleSection.
4. Zero decisão aberta? não — ver abaixo.
5. Zero lógica nova? sim — lista estática + toggle existente.
veredito: complexa — decisões de produto abertas (item 4) e footprint > 6 arquivos (item 2)

## Decisões abertas para o planner perguntar (uma rodada)
- Fonte da versão: constante nova manual (ex.: APP_VERSIONS em core/) vs app.config.ts version vs ambos (constante é a fonte e app.config deriva dela?).
- Formato do item: versão, título breve, descrição expansível; data? lista de bullets? quantas versões mostrar ("últimas")? ordem (mais recente primeiro; a atual destacada/aberta por padrão?).
- Onde na Settings: nova seção abaixo de "Ben's model" e acima de Sign out, ou ao final? Mostrar a versão atual no cabeçalho da seção?
- Escopo design: atualizar também design/ (sheet + tela nova ou edge-cases) conforme regra de desenhar primeiro? Design hoje não tem agentSection.
- Reusar CollapsibleSection (título em caixa alta label-caps) ou criar item próprio com título em body-md?
- Conteúdo inicial das versões (qual histórico/descrições reais?) e idioma dos textos (UI em inglês).
- Prova com imagens: criar ben/.env dummy local e injetar login via localStorage no web — aceitável? Onde salvar os prints.

## Sinal de partição
partição: não — constante + UI sem módulo novo com suíte própria nem contrato consumido por outros.
