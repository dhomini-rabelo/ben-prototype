# Recon — language-switch (commit-base 3ec6712)

## Mapa de arquivos
packages/infra/mobile/ben/app/_layout.tsx | root layout, providers, gate isReady | 21-53
packages/infra/mobile/ben/src/core/auth-bootstrap.ts | bootstrap: token + hydrate user, isReady | 10-35
packages/infra/mobile/ben/src/layout/components/menu-settings/settings-view.tsx | conecta Settings (agent, versões, sign out) | 1-67
packages/infra/mobile/ben/src/layout/components/menu-settings/settings-sheet.tsx | UI do sheet; strings 'Ben's model','Sign out','signing out…', 'retry' | 60-179
packages/infra/mobile/ben/src/layout/components/menu-settings/app-versions-section.tsx | seção "App versions" (molde de seção) | 1-31
packages/infra/mobile/ben/src/layout/components/menu-settings/{agent-settings-controls,agent-settings-error,agent-settings-loading,agent-effort-chips,agent-model-option,app-version-item}.tsx | strings do Settings | todo
packages/infra/mobile/ben/src/core/app-versions.ts | release notes hardcoded em inglês (title/description) | 1-25
packages/infra/mobile/ben/src/layout/utils/format-time.ts | 'just now','Xm ago','yesterday', toLocaleString(undefined) | 1-52
packages/infra/mobile/ben/src/storage/user-storage.ts | molde AsyncStorage (chave '@ben/user') | 1-32
packages/infra/mobile/ben/src/layout/stores/auth-store.ts | zustand + hydrate() do storage | 37-55
packages/infra/mobile/ben/src/layout/stores/menu-store.ts | zustand store de menu/settings aberto | não lido a fundo
packages/infra/mobile/ben/package.json | deps; sem i18n, sem expo-localization; sem script test | 1-60
packages/infra/mobile/design/src/layout/components/menu/settings-sheet.tsx | cópia de design do sheet (strings idênticas, ex. l.108) | 108

## Molde a espelhar
Nenhum molde claro para i18n (nenhuma lib/dicionário/`t()` no repo: grep por i18n|expo-localization|react-intl|lingui nos 2 pacotes mobile = 0 hits). Molde parcial para persistência local: `storage/user-storage.ts` (AsyncStorage getItem/setItem com chave '@ben/...', try/catch) + `auth-store.ts` hydrate(), carregada no `auth-bootstrap.ts` antes de `isReady`. Molde parcial de seção no Settings: `app-versions-section.tsx` (View gap-3 border-t px-5 pt-4 pb-5, Typography label-caps título) injetada via prop `versionsSection` em settings-view.tsx -> settings-sheet.tsx.

## Footprint
Tela Settings EXISTE: SettingsView (settings-view.tsx) renderiza SettingsSheet com props agentSection e versionsSection; aberta pelo menu (menu-store.ts / pages/menu/page.tsx, não lidos a fundo).
Strings visíveis: hardcoded em JSX, em inglês, minúsculas/estilo próprio, sem camada de texto. 21 arquivos .tsx com <Text|placeholder|Alert (chat: suggested-action, message-bubble, capture-card*, chat-top-banner, message-trace-sheet/*; task-workspace: page, text-content, sub-thread-banner, workspace-*, todo-content/add-todo-row, diff-bar; layout: ui/button, menu-list-error, chat-input-input, chat-banner-action) + componentes Typography (muitos mais; ~79 arquivos .tsx com texto literal em linhas soltas). Também menu-*, login/page.tsx, format-time.ts, app-versions.ts, mensagens do backend/erros via axios (não verificado).
Persistência: AsyncStorage já é dep (@react-native-async-storage/async-storage 2.2.0) e usado em user-storage/firebase/secure-store. Backend: preferências por usuário existem só para agente (domain/user use cases agent-preferences get/update; server routes/agent-preferences/*; presenter; modelo Prisma User em infra/db/prisma/schema.prisma:60). Campo de locale/idioma: não encontrado em nenhum pacote (grep locale|language|idioma só acerta format-time, design notes, domain base repository, ben-agent-provider/models.ts — não verificados como relacionados). Decisão local vs backend: em aberto (produto).
Design sandbox (packages/infra/mobile/design): NÃO importa @ben/mobile-ben (grep 0); tem cópias próprias das telas (ex.: pages/settings-sheet-preview, menu-settings-*, layout/components/menu/settings-sheet.tsx) com strings em inglês. Afetado só se se quiser desenhar o seletor de idioma (protocolo: design antes do mobile).

## Armadilhas
- Rota para o agente: `/chat`, `/tasks` e agente em inglês: idioma do agente/respostas da IA não é coberto por trocar UI (server routes/chat.ts, create-task-message.ts; não lido) — decisão de produto.
- format-time.ts: strings compostas ('Xm ago', 'in Xh') e toLocaleString(undefined, …) pedem formatação por locale, não só dicionário.
- app-versions.ts: `as const satisfies readonly [AppVersion,...]`; CURRENT_APP_VERSION = APP_VERSIONS[0].version; title/description em inglês precisam virar por idioma ou ficar fixos.
- Carga: _layout.tsx retorna null até isReady (auth-bootstrap.ts 26-31); idioma salvo deve hidratar aqui para evitar flash em inglês.
- Estilo de copy: textos em minúsculas ('signing out…', "couldn't load full profile") e `normal-case` em label-caps; apóstrofos como &apos; no JSX (lint react/no-unescaped-entities).
- Typography/label-caps podem aplicar uppercase (ui/typography.tsx, não lido) — pt-BR com acentos.
- Sem NODE test runner no mobile (package.json só tem typecheck); `pnpm test` roda só domínio.

## Sinal de teste
Automatizado: nenhum teste no mobile (package.json sem test:unit); testes de domínio existem em domain/user/.../agent-preferences/__tests__ (só relevantes se idioma for no backend). Precisa de UI: sim — abrir Settings, trocar idioma, ver textos mudarem e persistirem após reload (web :8081, browser-mobile-tester).

## Veredito de complexidade
1. Uma frente só? sim se local (AsyncStorage) — só mobile; não se backend (domain/user + server + db + mobile). Em aberto.
2. Footprint <=6 arquivos? não — ~80 arquivos .tsx com strings literais a migrar, mais format-time e app-versions.
3. Molde claro? não — nenhum i18n existente; só moldes parciais de storage e seção.
4. Zero decisão de arquitetura/produto em aberto? não — lib vs dicionário próprio, local vs backend, idioma do agente, escopo de strings, design sandbox.
5. Zero lógica nova não-trivial? não — provider/contexto de idioma, hidratação, interpolação/plural, tempo relativo por locale.
veredito: complexa — falham 2, 3, 4 e 5 (infra de i18n nova, ~80 arquivos de strings, decisões de produto abertas)

## Sinal de partição
partição: módulo + suíte — módulo i18n novo (dicionários en/pt-BR, provider, storage, hook) consumido por todas as telas; linha natural: (a) infra i18n + seletor no Settings + persistência, (b) migração de strings por telas (settings/menu primeiro, depois chat, task-workspace, login).
