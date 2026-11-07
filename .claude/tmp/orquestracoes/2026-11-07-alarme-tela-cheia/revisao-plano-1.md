# Revisão do plano — rodada 1 — alarme-tela-cheia

## Veredito
corrigir (revisão parcial: a medição deu `status=handoff` no turn 16, com a janela em 105k de 140k; ver `## Parcial`)

## Convenções carregadas
- Doc de contexto: /CLAUDE.md (raiz); o cartão `projeto.md` (convenções: mobile só por HTTP, nativo por
  config plugin ou módulo Expo versionado, textos em `Localized`, `app-versions.ts`).
- `code-get-coding-designs/SKILL.md` e `designs/mobile-services-layer-structure.md`.
- `code-write-code/SKILL.md`, `coding-patterns/frontend/frontend-code-preferences.md`,
  `coding-patterns/mobile/mobile-bottom-sheet-overlay.md` e `coding-patterns/lint.md`.
- Não li (cortado pelo handoff): `general-coding-practices.md`, `automated-testing.md`,
  `backend-code-preferences.md`, `use-case-structure.md`, `http-presenter.md`, `domain-entity-declaration.md`,
  as descrições de contexto do app e do servidor. Para o backend, julguei pelo código lido.

## Bloqueios

### 1. A ação do lembrete não é gravada: `recordAction` roda depois do `update` do repositório — implementabilidade
Onde: plano.md:103-115, passos 1, 2 e 3 (e `## Contratos`, plano.md:297-305)
Regra: o passo não executa como está escrito. Os use cases gravam passando um objeto parcial de props a
`this.reminderRepository.update(reminder.id, changes)` (`acknowledge-reminder.ts:47-56`,
`update-reminder.ts:62-79`). A entidade `Reminder` só tem `create` e `reference`, sem método que altere
estado (`reminder.ts:33,37`). Um `recordAction` chamado "depois de gravar `{ acknowledgedUntil, snoozedUntil }`"
muda a entidade em memória e não chega ao banco, então T13 e T14 não teriam o que conferir.
Conserto: tirar o método `recordAction` do passo 1. A entidade ganha só o campo `actions?` e o getter, e
os passos 2 e 3 põem `actions: [...(reminder.props.actions ?? []), { type, firedAt, actedAt }]` **dentro
de `changes`, antes** do `reminderRepository.update`. No acknowledge, `changes` passa a ser
`{ acknowledgedUntil, snoozedUntil, actions? }`. No update, entra em `changes` junto de
`completedAt` (`:64`). Se o plano quiser um helper puro (`appendReminderAction(props, action)`), deve
nomeá-lo e dizer onde ele mora (`application/utils/reminders.ts`).

### 2. O checkpoint 3 deixa o typecheck quebrado até o checkpoint 5 — implementabilidade
Onde: plano.md:189-194 (passo 18) e plano.md:250-253 (passo 32)
Regra: critério 3 de `formats/plano.md` diz que o comando de verificação passa no fim de cada checkpoint.
O passo 18 troca `FiredAlarm` de `{ reminder: Reminder; firedAt }` para
`{ reminderId, title, kind, firedAt, reminder: Reminder | null, sound }`. Só que o
`alarm-popup-overlay.tsx:36` desestrutura `{ reminder, firedAt }` e usa `reminder.id` e `reminder.kind`
(`:58-118`), e `getFiredKey` hoje lê `alarm.reminder.id` (`alarm-store.ts:19`). Esse consumidor só é
adaptado no passo 32, já no checkpoint 5, então `pnpm typecheck` falha nos checkpoints 3 e 4.
Conserto: no checkpoint 3, um passo adapta o `alarm-popup-overlay.tsx` ao shape novo. Ele não
renderiza quando `current.reminder === null` (a lista ainda não chegou) e usa `current.reminderId` nas
requests. Os enqueues do `use-alarm-scheduler.ts` (`:34`, `:64`) passam o shape novo no passo 20, que já
toca esse arquivo. O passo 32 fica só com o filtro `goal`/`conditional` e a remoção do
`resolveAcknowledgedAt`.

### 3. O passo 17 usa um store que só nasce no passo 21 — implementabilidade
Onde: plano.md:188 (passo 17: "passam `fullScreen` do store do passo 21") e plano.md:205-207 (passo 21)
Regra: Lente 1 da revisão: nenhum passo consome o que um passo posterior cria.
Conserto: mover o passo 21 (`alarm-permission-store.ts` + `use-full-screen-permission.ts`) para antes do
passo 17, renumerando. Ou dividir: o store entra antes do 17 e o hook fica onde está.

### 4. O teto de 10 min não vale para o som iniciado em segundo plano — implementabilidade (RT-011)
Onde: plano.md:193 (passo 18, `expireCurrent`), plano.md:204 (passo 20, timer), plano.md:208-210 (passo 22)
Regra: RT-011 pede teto de 10 min de som **por disparo**. No plano, o som em segundo plano é iniciado
pelo handler DELIVERED do `index.ts` (passo 22, que cobre CB-003 e o app morto), e quem para o som e
mostra o alarme perdido é `expireCurrent`. Esse método só roda por um timer do hook montado no
`_layout` protegido. Se o app não vier para a frente, o `MediaPlayer` (`isLooping = true`) toca sem fim e
a notificação de perdido nunca sai. Os casos são: tela cheia virando heads-up com o celular em uso
(CB-003), ou o usuário que ignora o aviso. O implementador teria de perguntar quem aplica o teto nesse
caminho.
Conserto: o plano tem de dizer o mecanismo. Uma proposta concreta:
1. `AlarmSoundModule.start(maxDurationMs)` agenda um `Handler.postDelayed` nativo que chama `stop()`
   depois de `ALARM_SOUND_LIMIT_MS`.
2. `scheduleReminderAlarm` agenda também, pelo notify-kit, a notificação de perdido em
   `firedAt + 10 min` (id `missed:{reminderId}`). `cancelReminderAlarm` e as ações a cancelam.
3. O contrato do módulo em `## Contratos` (plano.md:355) e a seção RT-004 da lane codigo passam a
   cobrar o limite nativo.

### 5. Um alarme já atendido sem rede pode voltar a tocar quando o app reabre — implementabilidade (RT-008, CB-007)
Onde: plano.md:225-232 (passos 26 e 27) e plano.md:199-204 (passo 20)
Regra: RT-008 diz que o alarme não pode "voltar a tocar por um aviso já atendido". A checagem de 15 s
enfileira todo lembrete ativo com `nextFireAt <= agora` (`use-alarm-scheduler.ts:30-34`). A deduplicação
é o `firedKeys` em memória do store. Depois de um Parar ou Concluir que ficou pendente (sem rede, ou pelo
botão da notificação com o app morto, passo 28), o app reaberto começa com o `firedKeys` vazio. A lista do
servidor ainda traz o `nextFireAt` antigo, e a tela de alarme reabre para o mesmo disparo. Isso pode
acontecer até antes de `flushPendingAlarmActions` terminar. Nada no plano trata essa corrida.
Conserto: no passo 20 (ou 27), antes de enfileirar, o scheduler pula as chaves `reminderId:firedAt` que
estão no `pending-alarm-actions-storage` (passo 25). Para isso, o passo 25 expõe
`listPendingAlarmKeys(): Promise<Set<string>>`, e o hook carrega essas chaves no `firedKeys` ao montar. O
T06 acrescenta um caso: com uma ação pendente para `reminderId:firedAt`, um lembrete da lista com esse
`nextFireAt` não entra na fila.

### 6. `requireNativeModule('AlarmSound')` quebra o app no iOS na entrada — padrão
Onde: plano.md:137-143 (passo 10) e plano.md:208-210 (passo 22)
Regra: `code-get-coding-designs/designs/mobile-services-layer-structure.md`, "Platform file variants":
dentro da variante nativa, o trabalho específico de plataforma é guardado por `Platform.OS` e vira um
no-op seguro onde a capacidade não existe. RT-001 diz ainda que nada muda no iOS (`app.config.ts:14` tem a
seção `ios`). O módulo é declarado só `android`, e o `index.ts` importa `alarm-service.ts` (que importa o
módulo) na entrada do app. No iOS, `requireNativeModule` lança na hora do import, e o app nem abre.
Conserto: o passo 10 usa `requireOptionalNativeModule('AlarmSound')` em `modules/alarm-sound/index.ts`.
O passo 13 diz que toda função de `alarm-service.ts` retorna cedo com `Platform.OS !== 'android'`, como
`notifications-service.ts:45,93` já faz. O mesmo vale para `registerAlarmBackgroundHandler`, que não deve
registrar nada fora do Android. A seção RT-001 da lane codigo reprova se `index.ts` ou `alarm-service.ts`
chama o notify-kit ou o módulo sem esse guard.

## Notas
- plano.md:254-257 (passo 33): o bottom sheet de liberar tem de usar uma overlay reutilizável
  (`mobile-bottom-sheet-overlay.md`). O app já tem `SettingsSheetOverlay`
  (`src/layout/components/menu-settings/settings-sheet-overlay.tsx`, `Modal` + `children`). Nomeie-a
  como a overlay que hospeda o conteúdo vindo de `variacao-1.tsx`, para o implementador não copiar o
  bloco inline do protótipo.
- plano.md:195-198 e 346 (passo 19 e Contratos): `openAlarmFromNotification(data: AlarmNotificationData)`,
  mas o toque na notificação comum entrega `{ reminderId, nextFireAt }` (`subscribeToNotificationTaps`,
  `notifications-service.ts:224`). Diga onde `nextFireAt` vira `firedAt`: no passo 20, antes de chamar,
  ou num tipo de entrada próprio. Diga também que o tipo `NotificationTap` ganha `title` e `kind`.
- plano.md:205-207 (passo 21): diga se o "se mudou, ressincroniza" chama o `syncReminderNotifications`
  com a lista atual do `useActiveRemindersData`, ou se só invalida a lista.
- plano.md:259-263 (passo 34): o aviso de serviço que embrulha só o SDK está declarado em Desvios de
  padrão. Considerei aceitável.

## Spec em dúvida
nenhum novo. O plano já leva a `## Desvios da spec` a contradição PR-001 × AC-004, o canal RT-004 ×
notify-kit, o vídeo da PR-005 e o e2e da PR-008.

## Premissas
- Os marcos do plano marcam T01–T05, T09–T12 e T15–T18 como `[marco n]`, onde o roteiro tinha `[final]`.
  Li isso como o preenchimento da rodada que `formats/plano.md` pede, não como mudança de texto aprovado.
- Os ids de RT acrescentados a T06, T08, T16 e T17 estão declarados em "Decisões que travei sozinho"
  (plano.md:49), e o critério 11 aceita isso.
- Os caminhos que conferi existem: `daily-summary-storage.ts`, `use-connectivity.ts`, as três pastas de
  `prototipo/`, `package.json` `main` em `:5`. `modules/` não existe e o passo 10 a cria. Nenhum arquivo
  fora de `prototipo/alarme-tela-cheia/` importa o protótipo, então o passo 37 é seguro.
- `syncReminderNotifications` tem um só chamador (`use-alarm-scheduler.ts:49`), além do par `.web.ts`.

## Parcial
Feito:
- leitura de spec, roteiro, `formats/plano.md`, o reconhecimento (Mapa, Padrão, Reuso, Fixtures,
  Armadilhas), a Escolha do protótipo e o plano inteiro;
- a cobertura conferida da spec para o plano: 13/13 RT, 8/8 PR e 13/13 CB têm linha, e as provas S01–S18
  e T01–T19 do roteiro estão no Plano de teste;
- os critérios 1, 2, 6, 9, 10, 12 e 13 de `formats/plano.md` estão ok;
- os 6 bloqueios acima foram conferidos contra o código.

Falta, em ordem, para a rodada 2 (ou para este mesmo revisor, se retomado):
1. Ler `backend-code-preferences.md`, `domain-entity-declaration.md`, `http-presenter.md` e
   `http-route-handler.md`, e julgar os passos 1, 5 e 6 contra eles (nome do tipo `ReminderAction`, o
   `actions` no `OverWrite` do presenter, a coerção Zod).
2. Ler `automated-testing.md` e `general-coding-practices.md`, e julgar o local e o nome das suítes T06–T19
   e T13/T14.
3. Conferir as linhas citadas no mobile que não amostrei: `src/api/requests/reminders.ts:35,45`,
   `app.config.ts:25,36,49`, `eslint.config.mjs:220`, `app-versions.ts:11` e
   `reminders-settings-section.tsx`.
4. Conferir se `tsconfig`/eslint do app incluem `index.ts` da raiz e `plugins/*.d.ts` (passos 11 e 22).

Tentado e falhou: nada falhou. Parei por teto de janela (`status=handoff` no turn 16).
