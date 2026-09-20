# Recon — aba de configurações (project-mobile) para seleção de modelo + effort

Agente: r0, read-only. Repo `/root/so/repos/ben-prototype`, branch `feat/config-model-and-effort`.
Skills carregadas: `code-get-project-context`, `code-get-coding-designs` (mais os designs
`api-client-structure.md` e `page-stores-structure.md` referenciados por leitura direta de código).

---

## 1. Onde fica a tela/aba de configurações

Não existe uma "aba" separada de navegação: Settings é um **bottom-sheet modal** aberto de dentro
da tela de Menu, não uma rota própria.

- Rota Expo Router: `/root/so/repos/ben-prototype/project-mobile/app/(protected)/menu.tsx`
  → renderiza `Menu` de `src/pages/menu/page.tsx`. Registrado no grupo protegido
  `app/(protected)/_layout.tsx` (guard de auth), sem rota própria para settings.
- Página: `/root/so/repos/ben-prototype/project-mobile/src/pages/menu/page.tsx` (`export function Menu()`).
  Controla 4 "views" via `useMenuStore`: `menu | tasks | notes | reminders`, mais dois overlays
  independentes (`detailTarget` para note/reminder, e `isSettingsOpen` para Settings).
- O sheet de Settings é montado assim (linhas 48-50 de `page.tsx`):
  ```
  <SettingsSheetOverlay isOpen={isSettingsOpen} onClose={closeSettings}>
    {isSettingsOpen && <SettingsView onClose={closeSettings} />}
  </SettingsSheetOverlay>
  ```
- Entrada de navegação: `MenuSidebar` (`/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu/menu-sidebar.tsx`)
  lista `ENTRIES` (`tasks`, `notes`, `reminders`, `settings`) com ícone `Settings` do
  `lucide-react-native`. `onPress` chama `onSelect(id)` → propaga até
  `useMenuStore().selectEntry('settings')`.
- Store de navegação do menu: `/root/so/repos/ben-prototype/project-mobile/src/layout/stores/menu-store.ts`
  (`useMenuStore`, zustand). `selectEntry('settings')` faz `set({ isSettingsOpen: true })`
  em vez de trocar `view` — por isso Settings é sheet, não uma view irmã de tasks/notes/reminders.

**Premissa assumida:** a task pedida ("adicionar na aba de configurações") deve inserir os novos
controles dentro deste mesmo sheet (`SettingsView`/`SettingsSheet`), não criar uma tela nova —
é o único lugar hoje chamado "Settings" no app. Nenhuma ambiguidade real aqui: não há outro
candidato no código.

## 2. Estrutura e componentes de UI já existentes no sheet

Pasta: `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-settings/`
(3 arquivos, um por responsabilidade — ver `page-structure.md` da skill de designs):

- `settings-sheet-overlay.tsx` — `SettingsSheetOverlay`: `Modal` transparente + `Animated.View`
  (react-native-reanimated) fazendo slide-up de baixo (`translateY`) e fade do backdrop. É o
  wrapper genérico de "sheet modal" reusado também para o detail de note/reminder no mesmo
  `page.tsx`. **Não precisa mudar** para esta task.
- `settings-sheet.tsx` — `SettingsSheet` (componente **puro/apresentacional**, todas as props
  vêm de fora): variantes `'populated' | 'loading' | 'error'` e `SignOutState =
  'idle' | 'pending' | 'failed'`. Usa `MenuSheet` (`@/layout/components/menu/menu-sheet`) como
  casca (header "Settings" + botão X), mostra avatar/nome/email do usuário, e um único item de
  ação: botão "Sign out" com estado de erro inline (banda de erro + retry). **Hoje só tem essa
  única seção/ação** — não há nenhum controle de preferências, toggle, select, lista, etc. ainda.
- `settings-view.tsx` — `SettingsView` (**container**, conecta estado): lê `useAuthStore` para
  `user`, mantém `useState<SignOutState>` local, e injeta `useRouter()` (`expo-router`) +
  `ROUTES.login` (`@/core/routes`) para navegar após sign-out.

Componentes de UI reaproveitáveis relevantes para os novos controles, em
`/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/`:
- `segmented-control.tsx` — `SegmentedControl<Value extends string>` genérico
  (`{value, options: {value,label}[], onChange, disabled?, className?}`), renderiza tabs
  estilo pill com `accessibilityRole="tab"`. Já usado em
  `src/pages/chat/components/message-trace-sheet/message-trace-sheet.tsx`. É o candidato natural
  para o seletor de "effort" (3 níveis, ex. low/medium/high) — não serve bem para 3 modelos com
  nomes longos (deepseek/glm/gpt), mas pode servir dependendo do rótulo escolhido.
- `button.tsx`, `icon-button.tsx`, `collapsible-section.tsx`, `copy-button.tsx`, `code-block.tsx`
  — não há um componente de "select"/"radio list"/"dropdown" pronto para 3 opções com rótulos
  longos; a task provavelmente precisa de uma lista de opções tipo radio (linhas com check),
  a construir seguindo o padrão visual do resto do sheet (linhas de `Pressable` com
  `rounded-xl border border-outline-variant/50 bg-surface-container-low`, como o botão de
  sign-out em `settings-sheet.tsx` linha 106-122) — **decisão de design a validar com o
  design-advisor**, não estou decidindo o componente final aqui.

## 3. Como o estado de configuração é guardado e propagado hoje

- **Não existe nenhum estado de preferências do usuário hoje** (nem local nem remoto). O único
  estado por-usuário é `User` (perfil) em `useAuthStore`
  (`/root/so/repos/ben-prototype/project-mobile/src/layout/stores/auth-store.ts`), zustand puro,
  persistido via `src/storage/user-storage.ts` (AsyncStorage, ver
  "Mobile Token Persistence Structure"/user-storage separado do token em SecureStore).
  `useAuthStore.setUser`/`.clear`/`.hydrate()` são as únicas funções que escrevem/leem esse estado.
- `SettingsView` não tem store própria; não há pasta `stores/` dentro de `menu-settings/`
  (diferente de `src/pages/chat/stores` ou `task-workspace/stores`, que seguem
  "Page Stores Structure"). Se a task adicionar `agentModel`/`agentEffort`, o padrão do repo
  pede: (a) estender `User`/`StoredUser` se for por-usuário e persistido no backend, **ou**
  (b) criar uma store nova dedicada (`use-agent-preferences-store.ts` ou similar) se for
  puramente local/AsyncStorage. Isso é uma decisão de produto (persistir por usuário no backend
  vs. só localmente no device) que **não decidi** — ver seção 6.
- Não há nenhuma chamada de API hoje relacionada a preferências/config do agente em nenhum lado
  (mobile ou backend) — busquei "settings"/"config"/"preferences" nos dois projetos.

## 4. Como o app fala com o backend (client, tipos, onde ficariam os types de config)

Pasta `/root/so/repos/ben-prototype/project-mobile/src/api/` (ver skill
"API Client Structure"):
- `client.ts` — dois axios clients: `basicClient` (sem auth) e `authClient` (injeta headers
  `jwtauthenticationtoken`/`providerauthenticationtoken` via interceptor, trata 401). `BASE_URL`
  vem de `env.backendUrl` (`/root/so/repos/ben-prototype/project-mobile/src/core/env.ts`).
- `routes.ts` — `API_ROUTES` é um objeto único com todas as rotas por feature
  (`auth.loginOrRegister`, `messages.*`, `chat.send`, `tasks.*`, `notes.*`, `reminders.*`,
  `captures.counts`). **Não existe rota de perfil/preferências** — só
  `auth.loginOrRegister = '/auth/login-or-register'`.
- `requests/{feature}.ts` — uma função `request{Action}` por chamada (ex.
  `src/api/requests/tasks.ts`: `requestListActiveTasks`, `requestGetTaskDetail`, etc.), sempre
  retornando o tipo de domínio (não a resposta crua) e usando `ItemResponse<T>`/
  `ListingResponse<T>` de `src/api/types.ts` como envelope.
- `models/` guarda o tipo de domínio "rico" (ex. `models/user.ts`: `User { id, name, username,
  email, avatarUrl, providerId }` — **sem nenhum campo de preferências hoje**); `responses/`
  guarda formatos de resposta específicos de listagem/ação quando diferem do model.
- **Backend**: model do agente é hoje **hardcoded no servidor**, sem nenhum conceito de
  "usuário escolhe modelo" nem "por requisição":
  - `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`
    define `openRouterModel = openrouter('openai/gpt-5.6-luna', { extraBody: {...} })` (via
    `@openrouter/ai-sdk-provider`) e `geminiModel` (não usado atualmente nas rotas).
  - `BenAgentProviderService` (`.../ben-agent-provider/index.ts`) recebe o `model: LanguageModel`
    **no construtor** e o usa igual em `generateReply` e `generateTaskTurn` — não há parâmetro de
    "effort"/"reasoning" em nenhuma chamada `generateText`.
  - O serviço é instanciado **uma vez por processo, no import do módulo de rota**, hardcoded para
    `openRouterModel`, em dois lugares:
    `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/chat.ts` (linha 39:
    `const agentService = new BenAgentProviderService(openRouterModel)`) e
    `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/tasks/create-task-message.ts`
    (linha 12, mesma coisa).
  - `User` entity no backend (`/root/so/repos/ben-prototype/project-backend/src/domain/entities/user.ts`)
    só tem `name, username, email, avatarUrl, providerId, createdAt` — **nenhum campo de
    preferências**.
  - Único endpoint de auth existente: `login-or-register`
    (`/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/auth/login-or-register.ts`).
    Não há endpoint de "update profile/preferences" para copiar o padrão de request body/response.
  - Env do backend só declara `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`,
    `ASSEMBLYAI_API_KEY` (`/root/so/repos/ben-prototype/project-backend/src/infra/services/env.ts`).
    Não há chave separada por provedor de modelo (deepseek/glm chegariam pelo mesmo
    `OPENROUTER_API_KEY`, assumindo que ambos estão disponíveis via OpenRouter — não verifiquei
    isso contra a API real do OpenRouter, é suposição a validar).

**Conclusão da seção 4:** hoje não existem tipos/schemas de "configuração" em lugar nenhum
(mobile ou backend). Essa é uma peça nova de ponta a ponta: schema Zod novo no backend
(provavelmente em `src/infra/http/routes/auth/` ou uma rota nova tipo
`update-agent-preferences.ts`), campo novo na entidade `User`, e no mobile um novo
`models/`/tipo, uma entrada em `API_ROUTES`, e uma `requests/` function nova.

## 5. Convenções de código/design a respeitar

- **Nomes de arquivo:** kebab-case, um componente por arquivo, sufixo pelo papel
  (`-sheet`, `-view`, `-overlay`, `-store`). Ex.: `settings-sheet.tsx`, `settings-view.tsx`.
  Um novo controle (ex. seletor de modelo) deveria seguir isso:
  ex. `model-effort-picker.tsx` dentro de `menu-settings/` (mantendo a pasta plana atual, que
  só tem 3 arquivos — se crescer bastante, seguir "Page Structure"/"Feature State Components"
  para separar em subpasta).
- **Padrão container/apresentação:** `SettingsView` (conecta stores/hooks) vs. `SettingsSheet`
  (recebe só props, sem stores) — qualquer novo controle deve seguir essa separação, não misturar
  `useAuthStore`/`useState` dentro do componente puro.
- **Idioma da UI:** texto em **inglês**, não pt-BR ("Settings", "Sign out",
  "signing out…", "didn't sign you out — try again?", "couldn't load full profile"). Não existe
  infraestrutura de i18n no repo (busquei `i18n`/`locale`/`pt-BR`, nada real encontrado — só
  falsos positivos de substring em `translateY`). **Premissa assumida:** os novos textos da task
  (rótulos de modelo, effort, etc.) devem ser em inglês, minúsculo/sentence-case como o resto do
  sheet, não em pt-BR — a não ser que o pedido explícito da task diga o contrário.
- **Tokens de design:** usar classes Tailwind/NativeWind com os tokens existentes
  (`bg-surface-container-low`, `text-on-surface`, `text-on-surface-variant`,
  `border-outline-variant/50`, variantes de `Typography`: `label-caps`, `body-md`, `button-text`)
  — não inventar cor/spacing arbitrário. Cores para ícones SVG (lucide) vêm de
  `/root/so/repos/ben-prototype/project-mobile/src/layout/utils/colors.ts` (hex explícito, pois
  ícones SVG não herdam classes Tailwind).
- **`cn()` helper:** `@/layout/utils/styles` (mobile) para compor className condicionalmente
  (equivalente ao `@/layout/utils/cn` do project-design).
- Regra do projeto: **usar a skill `design-advisor`** antes de decidir o componente visual
  concreto do seletor (linha/lista/segmented/modal) — não decidi isso aqui, é escopo de design,
  não de recon.
- Regra do CLAUDE.md: depois de qualquer edição, rodar `npm run lint:fix` e
  `npx tsc --noEmit` dentro de `project-mobile` (e de `project-backend`, se mexer lá).

## 6. Riscos / armadilhas

1. **Isto não é só uma mudança de mobile.** O modelo é hoje uma constante de módulo no backend,
   instanciada 1x no import de `chat.ts` e `create-task-message.ts`. Selecionar modelo por
   usuário exige mudar `BenAgentProviderService` para receber o modelo **por chamada** (não no
   construtor), escolher o `LanguageModel` certo por request a partir de uma preferência
   persistida, e expor endpoint(s) para ler/gravar essa preferência. Sem isso, o toggle no mobile
   fica decorativo.
2. **"Effort" não existe em lugar nenhum hoje** (nem tipo, nem parâmetro passado a `generateText`).
   Precisa decidir o mapeamento exato effort→parâmetro por modelo (ex. OpenRouter `reasoning:
   {effort: 'low'|'medium'|'high'}` — nomenclatura e níveis suportados variam por modelo/provedor;
   não confirmei quais dos 3 modelos pedidos suportam quais níveis via OpenRouter). Isso é uma
   pergunta de negócio/técnica que caberia ser resolvida antes de codar a tela, não deduzida aqui.
3. **Nomes de modelo do pedido são apelidos, não slugs reais confirmados no código.**
   "deepseek flash mais recente" e "glm 5.3 flash" não aparecem em nenhum lugar do repo — só
   `openai/gpt-5.6-luna` existe hoje (hardcoded). Os slugs exatos do OpenRouter para os outros
   dois modelos, e se ambos suportam controle de "effort", não foram e não podem ser verificados
   por leitura de código — é premissa/pesquisa externa a fazer antes de codar os valores no enum.
4. **Settings hoje é um sheet sem scroll aparente** (`SettingsSheet` não tem `ScrollView`) —
   adicionar 2 seções novas (modelo + effort) pode estourar a altura em telas pequenas; validar
   com design-advisor se precisa de `ScrollView`/altura máxima.
5. **`SettingsSheet` é hoje "burro" e sem noção de loading/erro por seção** — as variantes
   `populated|loading|error` são globais (perfil inteiro), não por-controle. Se a preferência de
   modelo vier de uma chamada de API separada, precisa decidir como ela interage com esse estado
   de variant único (loading composto, erro parcial, etc.) — outra decisão de design/estado a
   não improvisar.
6. **Nenhum precedente de "settings persistidos" no repo** (nem AsyncStorage nem backend) para
   copiar 1:1 — qualquer implementação aqui é greenfield dentro do projeto, maior chance de
   divergir do padrão que a skill `code-write-code` esperaria; vale revisar com
   `code-get-coding-designs` de novo no momento de implementar, não só de planejar.
7. Testei apenas leitura; não rodei `tsc`/`lint` (agente read-only, sem permissão de editar).
